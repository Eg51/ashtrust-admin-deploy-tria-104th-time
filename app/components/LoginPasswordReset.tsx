// 
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPasswordReset({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (!resetToken.trim()) {
      setMessage({ type: 'error', text: 'Reset code is required. Ask an admin to issue one.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: userEmail,
          newPassword,
          resetToken: resetToken.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password reset successful! You can now log in.' });
        setTimeout(() => router.push('/log-in'), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Reset failed. Ask admin to re-issue a code.' });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 bg-[#C4F8FD] rounded-2xl shadow-xl border-none"
    >
      <h3 className="text-sm font-bold text-cyan-900 mb-2 flex items-center gap-2">
        <KeyRound size={16} className="text-cyan-600" />
        Password Reset
      </h3>

      {message && (
        <div className={`mb-3 p-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-700' : 'bg-red-500/20 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-3">
        <input
          type="text"
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
          placeholder="Reset code (from admin)"
          autoComplete="off"
          required
          className="w-full rounded-lg bg-white/50 px-4 py-2 text-sm font-bold text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 border-none shadow-inner"
        />

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          pattern='(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}'
          title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
          required
          className="w-full rounded-lg bg-white/50 px-4 py-2 text-sm font-bold text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 border-none shadow-inner"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          pattern='(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}'
          title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
          required
          className="w-full rounded-lg bg-white/50 px-4 py-2 text-sm font-bold text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 border-none shadow-inner"
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Resetting...
            </span>
          ) : (
            'Reset'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}