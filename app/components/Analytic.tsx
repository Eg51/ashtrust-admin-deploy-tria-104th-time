"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExpireSessionButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- Handle Session Expiration / Logout ---
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Attempt to tell the backend to expire the session immediately
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await fetch('/api/auth/expire-session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'logout' }),
          });
        } catch (err) {
          console.warn("Could not reach expire-session API, forcing client logout.");
        }
      }

      // 2. Clear local session data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // 3. Redirect to login
      router.push('/log-in');

    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* ---- Logout Button (Expires Session) ---- */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center font-bold gap-1.5 rounded-lg bg-[#C4F8FD] px-3 py-1.5 text-sm text-cyan-600/80 shadow-sm transition-all hover:text-red-600 hover:bg-[#E8B0B0] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      >
        <LogOut size={16} />
        {isLoggingOut ? "Logging out..." : "log out"}
      </button>
    </motion.div>
  );
}