"use client";

// app/components/TransactionPinModal.tsx
//
// 4-digit transaction PIN entry UI.
//
// Modes:
//   'enter'  — verify an existing PIN (single step)
//   'set'    — create a new PIN (two steps: enter → confirm)
//   'locked' — PIN is locked; show message + link to /forgot-pin
//
// Fires onComplete(pin) once 4 digits are entered successfully.

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Delete, X, ShieldAlert } from "lucide-react";
import Link from "next/link";

export type PinMode = "enter" | "set" | "locked";

interface TransactionPinModalProps {
  isOpen: boolean;
  mode: PinMode;
  onClose: () => void;
  onComplete: (pin: string) => Promise<{ success: boolean; error?: string; remaining?: number } | void> | void;
  title?: string;
  subtitle?: string;
  attemptsRemaining?: number | null;
}

export default function TransactionPinModal({
  isOpen,
  mode,
  onClose,
  onComplete,
  title,
  subtitle,
  attemptsRemaining = null,
}: TransactionPinModalProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">(
    mode === "set" ? "enter" : "enter"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAttempts, setLocalAttempts] = useState<number | null>(attemptsRemaining);

  // Reset internal state when the modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setConfirmPin("");
      setStep("enter");
      setError(null);
      setBusy(false);
      setLocalAttempts(attemptsRemaining);
    }
  }, [isOpen, mode, attemptsRemaining]);

  const submit = useCallback(
    async (finalPin: string) => {
      setBusy(true);
      setError(null);
      try {
        const result = await onComplete(finalPin);
        if (result && result.success === false) {
          setError(result.error || "Incorrect PIN");
          if (typeof result.remaining === "number") {
            setLocalAttempts(result.remaining);
          }
          setPin("");
          setConfirmPin("");
          setStep("enter");
        }
        // On success, parent closes the modal — nothing to do here.
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setPin("");
        setConfirmPin("");
        setStep("enter");
      } finally {
        setBusy(false);
      }
    },
    [onComplete]
  );

  // Auto-advance once 4 digits are entered
  useEffect(() => {
    if (pin.length !== 4 || busy) return;

    if (mode === "set") {
      if (step === "enter") {
        // Move to confirm step
        setConfirmPin(pin);
        setPin("");
        setStep("confirm");
        return;
      }
      // step === "confirm"
      if (pin !== confirmPin) {
        setError("PINs don't match. Try again.");
        setPin("");
        setConfirmPin("");
        setStep("enter");
        return;
      }
      submit(pin);
      return;
    }

    // mode === "enter"
    submit(pin);
  }, [pin, confirmPin, step, mode, busy, submit]);

  const handleDigit = (d: string) => {
    if (busy) return;
    if (pin.length >= 4) return;
    setError(null);
    setPin((p) => (p + d).slice(0, 4));
  };

  const handleBackspace = () => {
    if (busy) return;
    setError(null);
    setPin((p) => p.slice(0, -1));
  };

  if (!isOpen) return null;

  // ── Locked view ──────────────────────────────────────────────────
  if (mode === "locked") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-sm rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert size={22} className="text-red-600" />
              <h2 className="text-lg font-bold text-cyan-900">PIN Locked</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-cyan-700 hover:bg-white/40 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-cyan-800 leading-relaxed mb-4">
            Your transaction PIN is locked after too many incorrect attempts.
            To unlock, request a reset code from support and use it to set a
            new PIN.
          </p>

          <Link href="/forgot-pin" className="block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              Reset PIN
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // ── Digit-entry view (enter + set share this) ────────────────────
  const displayTitle =
    title ||
    (mode === "set"
      ? step === "enter"
        ? "Create Transaction PIN"
        : "Confirm Transaction PIN"
      : "Enter Transaction PIN");

  const displaySubtitle =
    subtitle ||
    (mode === "set"
      ? step === "enter"
        ? "Choose a 4-digit PIN you'll use for every withdrawal"
        : "Enter the same PIN again to confirm"
      : "Enter your 4-digit transaction PIN");

  const headerLabel = localAttempts !== null && mode === "enter"
    ? `${localAttempts} attempt${localAttempts === 1 ? "" : "s"} remaining`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-cyan-700" />
            <h2 className="text-base font-bold text-cyan-900">{displayTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-cyan-700 hover:bg-white/40 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Subtitle / attempts counter */}
        <p className="text-xs text-cyan-700 mb-3">{displaySubtitle}</p>
        {headerLabel && (
          <p className="text-[11px] font-semibold text-amber-700 mb-3">
            {headerLabel}
          </p>
        )}

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 rounded-lg bg-red-500/15 border border-red-500/40 px-3 py-2"
          >
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full transition-all ${
                i < pin.length
                  ? "bg-cyan-700 scale-110"
                  : "bg-cyan-700/20"
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <motion.button
              key={d}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDigit(d)}
              disabled={busy}
              className="rounded-xl bg-white/60 py-3 text-lg font-bold text-cyan-900 shadow-sm hover:bg-white/80 transition-colors disabled:opacity-50"
            >
              {d}
            </motion.button>
          ))}
          <div />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDigit("0")}
            disabled={busy}
            className="rounded-xl bg-white/60 py-3 text-lg font-bold text-cyan-900 shadow-sm hover:bg-white/80 transition-colors disabled:opacity-50"
          >
            0
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackspace}
            disabled={busy || pin.length === 0}
            className="flex items-center justify-center rounded-xl bg-white/60 py-3 text-cyan-900 shadow-sm hover:bg-white/80 transition-colors disabled:opacity-30"
            aria-label="Delete"
          >
            <Delete size={18} />
          </motion.button>
        </div>

        {/* Footer */}
        {mode === "enter" && (
          <div className="mt-4 text-center">
            <Link
              href="/forgot-pin"
              className="text-xs font-medium text-cyan-700 hover:text-cyan-900 hover:underline"
            >
              Forgot PIN?
            </Link>
          </div>
        )}

        {busy && (
          <p className="mt-4 text-center text-xs text-cyan-700">Verifying…</p>
        )}
      </motion.div>
    </motion.div>
  );
}