"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  ChevronRight, 
  Headphones, 
  Clock, 
  CheckCircle, 
  Shield,
  User,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface ChatWidgetProps {
  supportName?: string;
  message?: string;
  defaultOpen?: boolean;
  supportHours?: string;
  responseTime?: string;
}

export default function ChatWidget({
  supportName = "Ashie",
  message = "Hi there! 👋 How can i help?",
  defaultOpen = false,
  supportHours = "24/7",
  responseTime = "Usually responds in 2-5 minutes",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is on a chat page
  const isOnChatPage = pathname?.includes('/Support/user') || pathname?.includes('/Support/admin') || false;

  useEffect(() => {
    setMounted(true);
    setIsOpen(defaultOpen);
    
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const authToken = localStorage.getItem('auth_token');
      
      if (userData && authToken) {
        setUserRole(userData.role || 'user');
        setUserName(userData.firstName || userData.username || 'User');
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      setUserRole('user');
    } finally {
      setIsLoading(false);
    }
  }, [defaultOpen]);
  
  // 🟢 NEW: Auto-close popup after 2 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 3000); // 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 🟢 CRITICAL: Reset unread count when on chat page
  useEffect(() => {
    if (isOnChatPage) {
      console.log('🔵 [ChatWidget] On chat page - resetting unread count');
      setUnreadCount(0);
      
      const markMessagesAsRead = async () => {
        try {
          const authToken = localStorage.getItem('auth_token');
          if (!authToken) return;

          const roomId = localStorage.getItem('currentRoomId');
          console.log('🔵 [ChatWidget] Room ID from localStorage:', roomId);
          
          if (roomId) {
            const res = await fetch('/api/chats/mark-read', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ roomId })
            });
            
            console.log('🔵 [ChatWidget] Mark read response:', res.status);
            
            if (res.ok) {
              console.log('✅ [ChatWidget] Messages marked as read successfully');
            }
          }
        } catch (error) {
          console.error('🔴 [ChatWidget] Error marking messages as read:', error);
        }
      };
      
      markMessagesAsRead();
    }
  }, [isOnChatPage]);

  // Fetch unread count - but ONLY when NOT on chat page
  useEffect(() => {
    if (!mounted || !userRole) return;

    const fetchUnreadCount = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) return;

        const res = await fetch('/api/user/unread', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
          const data = await res.json();
          const count = data.data?.totalUnread || 0;
          
          if (!isOnChatPage) {
            setUnreadCount(count);
          } else {
            setUnreadCount(0);
          }
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 3000);
    return () => clearInterval(interval);
  }, [mounted, userRole, isOnChatPage]);

  if (!mounted) return null;

  const getSupportPath = () => {
    if (userRole === 'admin' || userRole === 'Administrator') {
      return '/Support/admin';
    }
    return '/Support/user';
  };

  const getRoleDisplay = () => {
    if (userRole === 'admin' || userRole === 'Administrator') {
      return 'Admin Support';
    }
    return 'User Support';
  };

  const getRoleIcon = () => {
    if (userRole === 'admin' || userRole === 'Administrator') {
      return <ShieldCheck className="h-4 w-4 text-cyan-600" />;
    }
    return <User className="h-4 w-4 text-cyan-600" />;
  };

  const getPersonalizedMessage = () => {
    if (userName && userName !== 'User') {
      return `Hi ${userName}! 👋 How can we help you today?`;
    }
    return message;
  };

  const handleStartChat = () => {
    const path = getSupportPath();
    router.push(path);
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role="dialog"
            aria-label="Support chat"
            className="w-[85vw] max-w-sm rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#D6F9FE] to-[#E8FBFF] p-6 shadow-2xl backdrop-blur-xl border border-white/30 sm:w-80"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-[#C4F8FD] flex items-center justify-center shadow-lg">
                    <Headphones className="h-6 w-6 text-cyan-700" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-cyan-900 text-lg">{supportName}</h3>
                    {getRoleIcon()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-cyan-600" />
                    <span className="text-xs text-cyan-600">{supportHours}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* Role Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.2 }}
              className="mt-3 flex items-center justify-between"
            >
              <div className="inline-flex items-center gap-1.5 bg-white/50 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                <Sparkles className="h-3 w-3 text-cyan-500" />
                <span className="text-[10px] font-medium text-cyan-700">
                  {getRoleDisplay()}
                </span>
              </div>
              
              {/* 🟢 Unread Badge - Hidden on chat page */}
              {unreadCount > 0 && !isOnChatPage && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1.5 bg-red-500 rounded-full px-2.5 py-0.5 shadow-lg"
                >
                  <span className="text-[10px] font-bold text-[#C4F8FD]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                  <span className="text-[8px] text-[#C4F8FD]/80 font-medium">new</span>
                </motion.div>
              )}
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mt-3"
            >
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                <p className="text-sm leading-relaxed text-cyan-800">
                  {getPersonalizedMessage()}
                </p>
                <span className="absolute -top-2 left-3 text-4xl text-cyan-400/30 font-serif">"</span>
                <span className="absolute -bottom-4 right-3 text-4xl text-cyan-400/30 font-serif">"</span>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-4 grid grid-cols-2 gap-2"
            >
              <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[10px] font-medium text-cyan-700">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
                <Shield className="h-3.5 w-3.5 text-cyan-500" />
                <span className="text-[10px] font-medium text-cyan-700">End-to-end encrypted</span>
              </div>
            </motion.div>

            {/* Response time */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="mt-3 flex items-center justify-center gap-2"
            >
              <div className="flex items-center gap-1.5 bg-cyan-500/20 rounded-full px-3 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-cyan-700">{responseTime}</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mt-4"
            >
              <button
                onClick={handleStartChat}
                className="group w-full rounded-2xl bg-[#C4F8FD] px-6 py-3.5 text-sm font-semibold text-cyan-700 shadow-lg transition-all hover:shadow-xl hover:from-cyan-700 hover:to-cyan-800 flex items-center justify-center gap-2 relative overflow-hidden"
              >
                {/* 🟢 Unread Badge on Button - Hidden on chat page */}
                {unreadCount > 0 && !isOnChatPage && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-500 px-1.5 shadow-lg"
                  >
                    <span className="text-[9px] font-bold text-[#C4F8FD]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </motion.span>
                )}
                <span>
                  {userRole === 'admin' || userRole === 'Administrator' 
                    ? 'Chat with Ashie' 
                    : 'Start a Conversation'}
                </span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="text-center text-[9px] text-cyan-500/70 mt-2">
                {userRole === 'admin' || userRole === 'Administrator' 
                  ? '🔐 Your Client is a click away'
                  : '💬 You\'re connecting....'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl bg-[#C4F8FD] transition-all hover:shadow-2xl focus:outline-none"
      >
        {/* 🟢 Pulse Ring - Hidden on chat page */}
        {!isOpen && unreadCount > 0 && !isOnChatPage && (
          <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
        )}
        
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              <X size={22} className='text-cyan-600' strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="chat-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex relative"
            >
              <MessageCircle size={22} className='text-cyan-600' fill="currentColor" />
              
              {/* 🟢 Numeral Badge on Floating Button - Hidden on chat page */}
              {unreadCount > 0 && !isOnChatPage && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-500 px-1.5 shadow-lg border-none"
                >
                  <span className="text-[9px] font-bold text-[#C4F8FD] leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </motion.span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}