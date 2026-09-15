"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Lock,
  Save,
  Loader2,
  KeyRound,
} from "lucide-react";
import { issuePasswordResetToken } from "@/app/actions/admin";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  passwordResetEnabled?: boolean;
}

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [issuingUserId, setIssuingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [resetCodeModal, setResetCodeModal] = useState<{
    user: User;
    token: string;
    expiresAt: string;
  } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleVerify = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, isVerified: !u.isVerified } : u
    ));
  };

  const handleToggleActive = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const handleRoleChange = (userId: string, role: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, role } : u
    ));
  };

  // ✅ CHANGED: Issue a one-time reset code instead of toggling a boolean
  const handleIssueResetCode = async (user: User) => {
    if (issuingUserId) return;
    setIssuingUserId(user.id);
    setSuccessMessage("");

    try {
      const result = await issuePasswordResetToken(user.id);

      if (result.success && result.token) {
        setResetCodeModal({
          user,
          token: result.token,
          expiresAt: result.expiresAt,
        });
        setUsers(prev => prev.map(u =>
          u.id === user.id ? { ...u, passwordResetEnabled: true } : u
        ));
      } else {
        setSuccessMessage(`❌ ${result.error || 'Failed to issue reset code'}`);
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (error) {
      console.error('Error issuing reset code:', error);
      setSuccessMessage('❌ Failed to issue reset code');
      setTimeout(() => setSuccessMessage(""), 4000);
    } finally {
      setIssuingUserId(null);
    }
  };

  const copyTokenToClipboard = async () => {
    if (!resetCodeModal) return;
    try {
      await navigator.clipboard.writeText(resetCodeModal.token);
      setSuccessMessage('✅ Code copied to clipboard');
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch {
      // user can select manually
    }
  };

  const handleSave = async (user: User) => {
    setSavingUserId(user.id);
    setSuccessMessage("");
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: user.id,
          isVerified: user.isVerified,
          isActive: user.isActive,
          role: user.role,
          // passwordResetEnabled no longer sent here — managed by issuePasswordResetToken only
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`✅ Updated ${user.firstName} ${user.lastName} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white/40 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyan-900">Manage User Status</h2>
        {successMessage && <span className="text-sm text-emerald-600 font-bold">{successMessage}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-cyan-200/30 text-left text-xs font-bold uppercase text-cyan-700">
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Verified</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Password Reset</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-cyan-200/20 hover:bg-cyan-50/30"
              >
                <td className="px-3 py-3">
                  <div className="font-bold text-cyan-900">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-cyan-600">{user.email}</div>
                </td>

                <td className="px-3 py-3">
                  <button
                    onClick={() => handleToggleVerify(user.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
                      user.isVerified
                        ? 'bg-emerald-500/20 text-emerald-700'
                        : 'bg-red-500/20 text-red-700'
                    }`}
                  >
                    <UserCheck size={14} />
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </button>
                </td>

                <td className="px-3 py-3">
                  <button
                    onClick={() => handleToggleActive(user.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
                      user.isActive
                        ? 'bg-emerald-500/20 text-emerald-700'
                        : 'bg-red-500/20 text-red-700'
                    }`}
                  >
                    <Lock size={14} />
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>

                <td className="px-3 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-white/30 px-2 py-1 rounded-lg text-xs font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                {/* ✅ CHANGED: Issue reset code button */}
                <td className="px-3 py-3">
                  <button
                    onClick={() => handleIssueResetCode(user)}
                    disabled={issuingUserId === user.id}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
                      user.passwordResetEnabled
                        ? 'bg-purple-500/20 text-purple-700 hover:bg-purple-500/30'
                        : 'bg-cyan-500/20 text-cyan-700 hover:bg-cyan-500/30'
                    } disabled:opacity-50`}
                  >
                    {issuingUserId === user.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <KeyRound size={14} />
                    )}
                    {user.passwordResetEnabled ? 'New Code' : 'Issue Code'}
                  </button>
                </td>

                <td className="px-3 py-3">
                  <button
                    onClick={() => handleSave(user)}
                    disabled={savingUserId === user.id}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition disabled:opacity-50"
                  >
                    {savingUserId === user.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reset code modal */}
      {resetCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-cyan-900 mb-2">
              Password Reset Code
            </h3>
            <p className="text-sm text-cyan-700 mb-4">
              Give this code to <strong>{resetCodeModal.user.firstName} {resetCodeModal.user.lastName}</strong>.
              It expires in <strong>15 minutes</strong> and can only be used once.
            </p>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-4">
              <code className="text-lg font-mono font-bold text-cyan-900 break-all">
                {resetCodeModal.token}
              </code>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyTokenToClipboard}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition"
              >
                Copy Code
              </button>
              <button
                onClick={() => setResetCodeModal(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-cyan-200 text-cyan-700 text-sm font-bold hover:bg-cyan-50 transition"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-cyan-500 mt-3">
              ⚠️ This code will not be shown again. Copy it now.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}