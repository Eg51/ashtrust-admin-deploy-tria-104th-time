"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Lock, UserX, Mail, X } from "lucide-react";

type Reason = "inactive" | "locked";

interface AccountBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: Reason | null;
  blockMessage?: string | null;
  contactEmail?: string | null;
}

// ---- Reason metadata -----------------------------------------------------
const REASON_META: Record<Reason, {
  title: string;
  defaultMessage: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;      // text color
  accentBg: string;    // soft background
  border: string;      // ring/border color
}> = {
  inactive: {
    title: "Account Inactive",
    defaultMessage:
      "Your account has been deactivated. You cannot sign in at this time.",
    Icon: UserX,
    accent: "text-rose-600",
    accentBg: "bg-rose-100",
    border: "border-rose-200",
  },
  locked: {
    title: "Account Locked",
    defaultMessage:
      "Your account has been temporarily locked due to too many failed sign-in attempts.",
    Icon: Lock,
    accent: "text-amber-600",
    accentBg: "bg-amber-100",
    border: "border-amber-200",
  },
};

export default function AccountBlockedModal({
  isOpen,
  onClose,
  reason,
  blockMessage,
  contactEmail,
}: AccountBlockedModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!reason) return null;

  const meta = REASON_META[reason];
  const trimmedMessage = typeof blockMessage === "string" ? blockMessage.trim() : "";
  const trimmedEmail = typeof contactEmail === "string" ? contactEmail.trim() : "";

  const hasAdminMessage = trimmedMessage.length > 0;
  const hasContactEmail = trimmedEmail.length > 0;

  const Icon = meta.Icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="account-blocked-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-blocked-title"
        >
          <motion.div
            key="account-blocked-card"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative w-full max-w-md rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl border ${meta.border} sm:p-7`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1.5 text-cyan-700 transition-colors hover:bg-white/60 hover:text-cyan-900"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon header */}
            <div className="flex flex-col items-center text-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${meta.accentBg}`}>
                <Icon className={`h-7 w-7 ${meta.accent}`} />
              </div>

              <h2
                id="account-blocked-title"
                className="mt-4 text-lg font-bold text-cyan-900 sm:text-xl"
              >
                {meta.title}
              </h2>
            </div>

            {/* Body — one of two branches */}
            <div className="mt-5 space-y-4">
              {hasAdminMessage ? (
                // ── Branch A: admin set a custom message ─────────────
                <div className="rounded-xl bg-white/60 p-4 text-sm leading-relaxed text-cyan-900 whitespace-pre-wrap break-words">
                  {trimmedMessage}
                </div>
              ) : (
                // ── Branch B: no message set — fallback to contact ───
                <>
                  <div className="flex items-start gap-2 rounded-xl bg-white/60 p-4 text-sm text-cyan-900">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
                    <span className="leading-relaxed">{meta.defaultMessage}</span>
                  </div>

                  {hasContactEmail && (
                    <div className="rounded-xl border border-cyan-200/60 bg-white/40 p-4 text-center">
                      <p className="mb-2 text-xs font-medium text-cyan-700">
                        Contact support to resolve this:
                      </p>
                      <a
                        href={`mailto:${trimmedEmail}`}
                        className="inline-flex items-center gap-2 break-all rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-500"
                      >
                        <Mail className="h-4 w-4" />
                        {trimmedEmail}
                      </a>
                    </div>
                  )}

                  {!hasContactEmail && (
                    <div className="rounded-xl border border-cyan-200/60 bg-white/40 p-4 text-center text-xs text-cyan-600">
                      Please reach out to the site administrator for assistance.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-cyan-500"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}