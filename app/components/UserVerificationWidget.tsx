"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Lock, 
  Star, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  loginCount?: number;
}

export default function UserVerificationWidget() {
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  if (!mounted) return null;

  const isVerified = user?.isVerified === true;
  const isAdmin = user?.isAdmin === true || user?.role === 'admin';
  const isActive = user?.isActive !== false;

  // ✅ Calculate account age
  const accountCreated = user?.createdAt ? new Date(user.createdAt) : null;
  const daysSinceCreation = accountCreated 
    ? Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24)) 
    : null;

  // ✅ Calculate trust level
  const getTrustLevel = () => {
    let score = 0;
    if (isVerified) score += 50;
    if (isActive) score += 20;
    if (daysSinceCreation !== null && daysSinceCreation > 30) score += 15;
    if (user?.loginCount && user.loginCount > 10) score += 15;
    
    if (score >= 80) return { label: "High Trust", color: "text-emerald-600", bg: "bg-emerald-500/20" };
    if (score >= 50) return { label: "Medium Trust", color: "text-amber-600", bg: "bg-amber-500/20" };
    return { label: "Low Trust", color: "text-red-600", bg: "bg-red-500/20" };
  };

  const trustLevel = getTrustLevel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 bg-[#C4F8FD] rounded-2xl shadow-xl backdrop-blur-sm border border-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <ShieldCheck size={18} className="text-cyan-600" />
          Verification & Trust
        </h3>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${trustLevel.bg} ${trustLevel.color}`}>
          {trustLevel.label}
        </span>
      </div>

      {/* Status Rows */}
      <div className="space-y-2">
        {/* Verified User */}
        <div className="flex items-center justify-between rounded-lg bg-white/30 px-3 py-2 border border-white/20">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className={isVerified ? "text-emerald-600" : "text-slate-400"} />
            <span className="text-xs font-medium text-slate-700">Account Verified</span>
          </div>
          {isVerified ? (
            <CheckCircle size={16} className="text-emerald-600" />
          ) : (
            <XCircle size={16} className="text-red-500" />
          )}
        </div>

        {/* Account Status */}
        <div className="flex items-center justify-between rounded-lg bg-white/30 px-3 py-2 border border-white/20">
          <div className="flex items-center gap-2">
            <Lock size={16} className={isActive ? "text-emerald-600" : "text-red-500"} />
            <span className="text-xs font-medium text-slate-700">Account Status</span>
          </div>
          {isActive ? (
            <span className="text-[10px] font-bold text-emerald-700">Active</span>
          ) : (
            <span className="text-[10px] font-bold text-red-700">Inactive</span>
          )}
        </div>

        {/* Role */}
        <div className="flex items-center justify-between rounded-lg bg-white/30 px-3 py-2 border border-white/20">
          <div className="flex items-center gap-2">
            <Star size={16} className={isAdmin ? "text-amber-500" : "text-slate-400"} />
            <span className="text-xs font-medium text-slate-700">Account Role</span>
          </div>
          <span className={`text-[10px] font-bold ${isAdmin ? "text-amber-700" : "text-slate-600"}`}>
            {isAdmin ? "Administrator" : "User"}
          </span>
        </div>

        {/* Account Age */}
        <div className="flex items-center justify-between rounded-lg bg-white/30 px-3 py-2 border border-white/20">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-cyan-600" />
            <span className="text-xs font-medium text-slate-700">Member Since</span>
          </div>
          <span className="text-[10px] font-bold text-slate-600">
            {daysSinceCreation !== null ? `${daysSinceCreation} days ago` : "New User"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}