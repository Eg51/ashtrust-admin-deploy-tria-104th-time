"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatNotificationBadgeProps {
  userId?: string;
  className?: string;
}

export default function ChatNotificationBadge({ userId, className = "" }: ChatNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    setToken(authToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/user/unread', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.data?.totalUnread || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();
    
    // Poll every 5 seconds for new messages
    const interval = setInterval(fetchUnreadCount, 5000);
    
    return () => clearInterval(interval);
  }, [token]);

  if (isLoading) {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <MessageSquare className="h-5 w-5 text-cyan-600" />
        <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full bg-cyan-400/50" />
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <MessageSquare className="h-5 w-5 text-cyan-600" />
      
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute -top-2 -right-2 flex items-center justify-center"
          >
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
              {/* Badge */}
              <div className="relative flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-lg">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}