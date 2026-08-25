// app/components/UserAvatar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  accountType: string;
  isActive: boolean;
  isVerified: boolean;
  role: string;
  isAdmin: boolean;
  hasAvatar: boolean;
  avatar: string | null;
}

interface UserAvatarProps {
  /**
   * Optional size override (e.g., "w-16 h-16").
   * Default: responsive "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
   */
  size?: string;
  /**
   * Optional additional CSS classes.
   */
  className?: string;
}

export default function UserAvatar({ size, className = "" }: UserAvatarProps) {
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const userData = JSON.parse(stored) as UserData;
        if (userData.hasAvatar && userData.avatar) {
          setAvatarSrc(userData.avatar);
        }
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }, []);

  // If no avatar, render nothing
  if (!avatarSrc) return null;

  const sizeClass = size || "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`rounded-full overflow-hidden shadow-xl border-0 ${sizeClass} ${className}`}
    >
      <Image
        src={avatarSrc}
        alt="User avatar"
        width={100}
        height={100}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}