"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully! Please log in again.' });
        // Optionally clear local storage and redirect to login
        setTimeout(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          router.push('/log-in');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 bg-[#C4F8FD] rounded-2xl shadow-xl backdrop-blur-sm border-none"
    >
      <h3 className="text-lg font-bold text-cyan-900 mb-4 flex items-center gap-2">
        <Lock size={20} className="text-cyan-600" />
        Change Password
      </h3>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-700' : 'bg-red-500/20 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="text-xs font-bold text-cyan-700 block mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-white/50 px-4 py-2.5 pr-12 text-sm font-bold text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 border-none shadow-inner"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-800 transition-colors z-10"
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="text-xs font-bold text-cyan-700 block mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-white/50 px-4 py-2.5 pr-12 text-sm font-bold text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 border-none shadow-inner"
              placeholder="Enter new password (8+ chars)"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-800 transition-colors z-10"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="text-xs font-bold text-cyan-700 block mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-white/50 px-4 py-2.5 pr-12 text-sm font-bold text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 border-none shadow-inner"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-800 transition-colors z-10"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="text-cyan-900" size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 text-sm font-bold text-white shadow-xl shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Changing Password...
            </span>
          ) : (
            'Change Password'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}