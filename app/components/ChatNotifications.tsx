"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  User, 
  Bell, 
  CheckCircle,
  Volume2,
  VolumeX
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatNotificationProps {
  userId?: string;
  userRole?: string;
}

interface Notification {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function ChatNotification({ userId, userRole }: ChatNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<Notification | null>(null);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationCount = notifications.filter(n => !n.read).length;

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Get token and permission
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    setToken(authToken);

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setHasPermission(permission === 'granted');
      });
    } else if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/user/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          const newNotifications = data.data || [];
          
          // Check for new notifications
          const oldIds = notifications.map(n => n.id);
          const newOnes = newNotifications.filter((n: Notification) => !oldIds.includes(n.id));
          
          if (newOnes.length > 0) {
            // Show toast for each new notification
            newOnes.forEach((notification: Notification) => {
              showNotificationToast(notification);
              sendBrowserNotification(notification);
              playNotificationSound();
            });
          }
          
          setNotifications(newNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, [token]);

  // Show toast notification
  const showNotificationToast = (notification: Notification) => {
    setShowToast(notification);
    setTimeout(() => {
      setShowToast(null);
    }, 5000);
  };

  // Send browser notification
  const sendBrowserNotification = (notification: Notification) => {
    if (!hasPermission) return;
    
    try {
      const notificationObj = new Notification(`New message from ${notification.senderName || 'User'}`, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: true,
      });

      notificationObj.onclick = () => {
        window.focus();
        router.push(`/Support/${userRole === 'admin' ? 'admin' : 'user'}`);
        notificationObj.close();
      };

      setTimeout(() => {
        notificationObj.close();
      }, 10000);
    } catch (error) {
      console.error('Browser notification error:', error);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled || !audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } catch (error) {
      console.log('Sound play error:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/user/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });

      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/user/notifications/read-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      const res = await fetch('/api/user/notifications/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Navigate to chat
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    router.push(`/Support/${userRole === 'admin' ? 'admin' : 'user'}`);
  };

  // Get notification icon based on sender
  const getNotificationIcon = (notification: Notification) => {
    return <User className="h-4 w-4 text-cyan-600" />;
  };

  // Get time ago
  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed top-4 right-4 z-[9999] max-w-sm w-[90vw] bg-white rounded-2xl shadow-2xl border border-cyan-200/50 overflow-hidden"
            onClick={() => handleNotificationClick(showToast)}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-full flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cyan-900 truncate">
                    {showToast.senderName || 'User'}
                  </p>
                  <p className="text-sm text-cyan-700 truncate">
                    {showToast.message}
                  </p>
                  <p className="text-[10px] text-cyan-500 mt-0.5">
                    {getTimeAgo(showToast.timestamp)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowToast(null);
                  }}
                  className="shrink-0 text-cyan-400 hover:text-cyan-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-cyan-200/50 w-full">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-r-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Bell Icon */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-full hover:bg-cyan-500/20 transition-colors text-cyan-600"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] rounded-full bg-red-500 px-1 text-[9px] font-bold text-[#C4F8FD]">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-hidden bg-white rounded-2xl shadow-2xl border border-cyan-200/50 z-50"
            >
              <div className="p-3 border-b border-cyan-200/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-cyan-900 text-sm">Notifications</h3>
                  {notificationCount > 0 && (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-700 px-2 py-0.5 rounded-full">
                      {notificationCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1 rounded hover:bg-cyan-500/20 transition-colors text-cyan-600"
                    title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                  >
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                  {notificationCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-cyan-600 hover:text-cyan-800 px-2 py-1 rounded hover:bg-cyan-500/20 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto max-h-[320px]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="h-8 w-8 text-cyan-300/50 mx-auto mb-2" />
                    <p className="text-sm text-cyan-600">No notifications</p>
                    <p className="text-xs text-cyan-400">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`px-3 py-2.5 border-b border-cyan-200/20 hover:bg-cyan-50/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-cyan-500/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${
                          !notification.read ? 'bg-cyan-500/20' : 'bg-cyan-500/10'
                        }`}>
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-cyan-900 truncate">
                              {notification.senderName || 'User'}
                            </p>
                            <span className="text-[10px] text-cyan-500 flex-shrink-0">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-cyan-700 truncate">
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500 mt-0.5" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2 border-t border-cyan-200/30">
                  <button
                    onClick={clearAll}
                    className="w-full text-center text-[10px] text-cyan-500 hover:text-cyan-700 transition-colors py-1"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}