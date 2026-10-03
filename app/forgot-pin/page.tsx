"use client";

// app/forgot-pin/page.tsx
//
// Password-reset-style flow for the transaction PIN.
//
//  1. User is logged in but their PIN is locked (or forgotten)
//  2. User contacts support to get a reset code
//  3. User enters code + new 4-digit PIN here
//  4. consumePinResetToken verifies and clears the lock

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, KeyRound, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { consumePinResetToken } from "@/app/actions/pin";
import TransactionPinModal from "@/app/components/TransactionPinModal";

type Step = "instructions" | "enter_code" | "enter_pin" | "success";

export default function ForgotPinPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("instructions");
  const [code, setCode] = useState("");
  const [newPin, setNewPin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        router.replace("/log-in");
        return;
      }
      const u = JSON.parse(raw);
      const id = u._id || u.id;
      if (!id) {
        router.replace("/log-in");
        return;
      }
      setUserId(id);
    } catch {
      router.replace("/log-in");
    }
  }, [router]);

  const submitReset = async (pinValue: string) => {
    if (!userId) return { success: false, error: "Session expired. Log in again." };
    if (!code.trim()) return { success: false, error: "Enter the reset code first." };

    setBusy(true);
    setError(null);
    try {
      const result = await consumePinResetToken(userId, code.trim(), pinValue);
      if (!result.success) {
        return { success: false, error: result.error || "Could not reset PIN" };
      }
      setPinModalOpen(false);
      setStep("success");
      return { success: true };
    } catch {
      return { success: false, error: "Something went wrong. Please try again." };
    } finally {
      setBusy(false);
    }
  };

  // ── PIN modal complete ──
  const handlePinComplete = async (pin: string) => {
    setNewPin(pin);
    return await submitReset(pin);
  };

  return (
    <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white/60 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
      >
        {/* Back link */}
        <Link
          href="/Cards"
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:text-cyan-900 mb-4"
        >
          <ArrowLeft size={14} /> Back to Cards
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <ShieldAlert size={20} className="text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-cyan-900">Reset Transaction PIN</h1>
        </div>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg bg-red-500/15 border border-red-500/40 px-3 py-2"
          >
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {/* ── Step: instructions ── */}
        {step === "instructions" && (
          <div className="space-y-4">
            <p className="text-sm text-cyan-800 leading-relaxed">
              Your PIN can only be reset with a one-time code from support. To
              get one:
            </p>

            <ol className="space-y-2 text-sm text-cyan-800">
              <li className="flex gap-2">
                <span className="font-bold text-cyan-900">1.</span>
                <span>Contact support using the details on your dashboard, or email the admin from your registered address.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-900">2.</span>
                <span>Ask for a <strong>PIN reset code</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-900">3.</span>
                <span>The code expires in <strong>15 minutes</strong> and can only be used once.</span>
              </li>
            </ol>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep("enter_code")}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                I have a code <ArrowRight size={18} />
              </span>
            </motion.button>
          </div>
        )}

        {/* ── Step: enter code ── */}
        {step === "enter_code" && (
          <div className="space-y-4">
            <p className="text-sm text-cyan-800">
              Enter the reset code you received from support.
            </p>

            <div>
              <label className="block text-xs font-medium text-cyan-700/70 mb-1">
                Reset code
              </label>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600"
                />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. a1b2c3d4e5f6..."
                  className="w-full rounded-lg border border-cyan-200/50 bg-white/60 pl-10 pr-3 py-2 text-sm font-mono text-cyan-900 placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setError(null); setStep("instructions"); }}
                className="rounded-xl border border-cyan-200/50 px-4 py-3 text-sm font-bold text-cyan-700 hover:bg-white/40 transition"
              >
                Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!code.trim()}
                onClick={() => { setError(null); setPinModalOpen(true); }}
                className={`flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition-all ${
                  !code.trim()
                    ? "bg-gray-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500"
                }`}
              >
                Continue
              </motion.button>
            </div>
          </div>
        )}

        {/* ── Step: success ── */}
        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-cyan-900">PIN Updated</h2>
            <p className="text-sm text-cyan-700">
              Your transaction PIN has been reset and any lock has been cleared.
              You can now make withdrawals.
            </p>
            <Link href="/Cards" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                Go to Cards
              </motion.button>
            </Link>
          </div>
        )}

        {/* Footer: PIN modal is a child of the enter-code step */}
        <AnimatePresence>
          {pinModalOpen && (
            <TransactionPinModal
              isOpen={pinModalOpen}
              mode="set"
              title="Set New PIN"
              subtitle="Choose a new 4-digit PIN for withdrawals"
              onClose={() => setPinModalOpen(false)}
              onComplete={handlePinComplete}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}