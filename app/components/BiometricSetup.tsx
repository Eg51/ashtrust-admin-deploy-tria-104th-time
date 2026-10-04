"use client";

// app/components/BiometricSetup.tsx
//
// Settings card for managing biometric / passkey login.
//
// States:
//   - Browser doesn't support WebAuthn → show "not supported" message
//   - No credentials yet → big "Enable biometric login" CTA
//   - Has credentials → list + "Add another device" button
//
// Uses @simplewebauthn/browser to talk to the OS.

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
} from "lucide-react";

interface CredentialRow {
  id: string;
  credentialId: string;
  deviceLabel: string;
  transports: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

type Status = "idle" | "registering" | "removing" | "success" | "error";

export default function BiometricSetup() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [credentials, setCredentials] = useState<CredentialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // ── Support check ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported(
      !!window.PublicKeyCredential &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
          "function"
    );
  }, []);

  // ── Load credentials ─────────────────────────────────────────────
  const loadCredentials = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/auth/webauthn/credentials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCredentials(data.data);
      }
    } catch (err) {
      console.error("[BiometricSetup] load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  // ── Register a new device ────────────────────────────────────────
  const handleRegister = useCallback(async () => {
    setStatus("registering");
    setMessage("");

    try {
      const { startRegistration } = await import("@simplewebauthn/browser");
      const token = localStorage.getItem("auth_token");

      // Step 1 — get options
      const optRes = await fetch("/api/auth/webauthn/register-options", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const optData = await optRes.json();

      if (!optRes.ok || !optData.success) {
        throw new Error(optData.error || "Failed to start registration");
      }

      // Step 2 — prompt OS biometric
      let attestation;
      try {
        attestation = await startRegistration({ optionsJSON: optData.options });
      } catch (err: any) {
        // User cancelled or OS declined
        if (err?.name === "NotAllowedError") {
          throw new Error("Cancelled — no device was registered.");
        }
        if (err?.name === "InvalidStateError") {
          throw new Error("This device is already registered.");
        }
        throw new Error(err?.message || "Biometric prompt failed");
      }

      // Step 3 — send attestation to server for verification
      const verifyRes = await fetch("/api/auth/webauthn/register-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response: attestation }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Verification failed");
      }

      setStatus("success");
      setMessage(verifyData.message || "Biometric login enabled");
      await loadCredentials();

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Failed to register device");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  }, [loadCredentials]);

  // ── Remove a device ──────────────────────────────────────────────
  const handleRemove = useCallback(
    async (credentialId: string) => {
      setPendingDeleteId(credentialId);
      setStatus("removing");
      setMessage("");

      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch("/api/auth/webauthn/credentials", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ credentialId }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to remove device");
        }

        setCredentials((prev) => prev.filter((c) => c.credentialId !== credentialId));
        setStatus("success");
        setMessage("Device removed");

        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 2500);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Failed to remove device");
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 4000);
      } finally {
        setPendingDeleteId(null);
      }
    },
    []
  );

  // ── Render ───────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-cyan-200/30 shadow-xl bg-[#C4F8FD] p-4 backdrop-blur-sm sm:p-6"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
            <Fingerprint size={16} className="text-cyan-700" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-cyan-900 sm:text-base">
              Biometric Login
            </h2>
            <p className="text-xs text-cyan-700 mt-0.5">
              Sign in with Face ID, Touch ID, Windows Hello, or a security key.
            </p>
          </div>
        </div>

        {status === "success" && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <CheckCircle size={12} /> {message}
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1 text-[11px] text-red-600 font-bold">
            <AlertCircle size={12} /> {message}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-4">
        {supported === false && (
          <div className="rounded-lg bg-amber-500/15 border border-amber-500/40 px-3 py-2">
            <p className="text-xs text-amber-900">
              This browser or device doesn't support biometric login. Try on a
              modern device with a fingerprint reader, Face ID, Windows Hello,
              or a hardware security key.
            </p>
          </div>
        )}

        {supported && loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
          </div>
        )}

        {supported && !loading && (
          <>
            {credentials.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <Shield size={28} className="text-cyan-400/60" />
                <p className="text-center text-xs text-cyan-700">
                  No devices registered yet. Enable biometric login to sign in
                  without a password.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  disabled={status === "registering"}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                >
                  {status === "registering" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Fingerprint size={14} />
                  )}
                  {status === "registering" ? "Waiting for device…" : "Enable biometric login"}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {credentials.map((c) => (
                    <motion.div
                      key={c.credentialId}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white/50 border border-cyan-200/40 px-3 py-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 flex-shrink-0">
                          <Fingerprint size={14} className="text-cyan-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-cyan-900">
                            {c.deviceLabel}
                          </p>
                          <p className="text-[10px] text-cyan-600">
                            Added{" "}
                            {new Date(c.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                            {c.lastUsedAt && (
                              <>
                                {" · Last used "}
                                {new Date(c.lastUsedAt).toLocaleDateString(
                                  undefined,
                                  { month: "short", day: "numeric" }
                                )}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(c.credentialId)}
                        disabled={pendingDeleteId === c.credentialId}
                        className="flex-shrink-0 rounded-lg p-1.5 text-cyan-700/60 hover:bg-red-500/15 hover:text-red-600 transition-colors disabled:opacity-50"
                        aria-label={`Remove ${c.deviceLabel}`}
                        title="Remove device"
                      >
                        {pendingDeleteId === c.credentialId ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleRegister}
                  disabled={status === "registering"}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-cyan-400/40 bg-white/30 px-3 py-2 text-xs font-bold text-cyan-700 hover:bg-white/50 transition-colors disabled:opacity-50"
                >
                  {status === "registering" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  {status === "registering" ? "Waiting for device…" : "Add another device"}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}