"use client";

// app/components/BiometricLoginButton.tsx
//
// "Sign in with biometrics" button for the login page.
//
// Flow:
//   1. POST /api/auth/webauthn/login-options (discoverable — no identifier)
//   2. startAuthentication() → OS prompt
//   3. POST /api/auth/webauthn/login-verify
//   4. Persist token + user, redirect (same shape as password login)
//
// Renders nothing if the browser doesn't support WebAuthn.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Fingerprint, Loader2, AlertCircle } from "lucide-react";

export default function BiometricLoginButton() {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported(!!window.PublicKeyCredential);
  }, []);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const { startAuthentication } = await import(
        "@simplewebauthn/browser"
      );

      // 1. Ask the server for a challenge (discoverable mode — no email)
      const optRes = await fetch("/api/auth/webauthn/login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const optData = await optRes.json();

      if (!optRes.ok || !optData.success) {
        throw new Error(
          optData.error || "Could not start biometric sign-in"
        );
      }

      // 2. Ask the OS to authenticate
      let assertion;
      try {
        assertion = await startAuthentication({
          optionsJSON: optData.options,
        });
      } catch (err: any) {
        if (err?.name === "NotAllowedError") {
          // User cancelled the OS prompt, or timed out. Not a bug.
          throw new Error("Cancelled — try again or sign in with password.");
        }
        if (err?.name === "SecurityError") {
          throw new Error(
            "Biometric sign-in isn't available on this origin. Use localhost or HTTPS."
          );
        }
        throw new Error("Biometric prompt failed on this device.");
      }

      // 3. Send the assertion to the server for verification
      const verifyRes = await fetch("/api/auth/webauthn/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: assertion }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Sign-in failed");
      }

      // 4. Persist exactly like password login does
      localStorage.setItem("auth_token", verifyData.token);
      localStorage.setItem("user", JSON.stringify(verifyData.user));

      // 5. Same redirect rule as Logge.tsx
      router.push(verifyData.user.isAdmin ? "/me" : "/Dashboard");
    } catch (err: any) {
      setError(err?.message || "Biometric sign-in failed");
      setBusy(false);
    }
  };

  // Don't render on unsupported browsers
  if (supported === false) return null;

  return (
    <div className="mt-6">
      {/* Divider */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-cyan-200/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#C4F8FD] px-2 text-[10px] font-medium uppercase tracking-wider text-cyan-600">
            Or
          </span>
        </div>
      </div>

      {/* Button */}
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={busy}
        whileHover={{ scale: busy ? 1 : 1.02 }}
        whileTap={{ scale: busy ? 1 : 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/50 bg-white/40 px-4 py-2.5 text-sm font-semibold text-cyan-800 shadow-sm transition hover:bg-white/70 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Waiting for device…
          </>
        ) : (
          <>
            <Fingerprint className="h-4 w-4" />
            Sign in with biometrics
          </>
        )}
      </motion.button>

      {/* Inline error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-500/10 px-3 py-2"
        >
          <AlertCircle
            size={12}
            className="mt-0.5 flex-shrink-0 text-red-600"
          />
          <p className="text-[11px] text-red-700">{error}</p>
        </motion.div>
      )}
    </div>
  );
}