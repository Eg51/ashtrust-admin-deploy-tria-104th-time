"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Send, User as UserIcon, Bell } from "lucide-react";
import AdminChatManager from '@/app/components/AdminChatManager'

interface ChatUser {
  _id: string;
  id?: string; 
  firstName: string;
  lastName: string;
  email: string;
}

interface ChatMessage {
  id?: string;
  _id?: string;
  senderId: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "tween", duration: 0.4, ease: "easeOut" } 
  },
};

const messageVariants: Variants = {
  hidden: (isMe: boolean) => ({ opacity: 0, x: isMe ? 20 : -20, y: 10 }),
  visible: { opacity: 1, x: 0, y: 0, transition: { type: "tween", duration: 0.2, ease: "easeOut" } },
};

export default function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'notifications'>('chats');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('auth_token');
    setCurrentUserId(userData._id || null);
    setToken(authToken || null);
  }, []);

  // ✅ NEW: Save roomId to localStorage when it changes
  useEffect(() => {
    if (roomId) {
      localStorage.setItem('currentRoomId', roomId);
    }
  }, [roomId]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data.data || []))
      .catch(console.error);
  }, [token]);

  const handleSelectUser = async (targetUserId: string) => {
    if (!token) return;
    const res = await fetch('/api/chats/rooms', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ targetUserId })
    });
    const data = await res.json();
    if (data.success) {
      setSelectedUserId(targetUserId);
      setRoomId(data.data.id);
      setActiveTab('chats');
    }
  };

  useEffect(() => {
    if (!roomId || !token) return;
    
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chats/rooms/${roomId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          setMessages([]); 
          return;
        }
        const data = await res.json();
        setMessages(data.data || []);
        scrollToBottom();
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [roomId, token]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !roomId || !token) return;

    try {
      const res = await fetch('/api/chats/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomId, message: inputMessage })
      });

      if (!res.ok) throw new Error('Failed to send');

      const data = await res.json();
      if (data.success && data.data) {
        const newMsg = data.data;
        setMessages(prev => [...prev, newMsg]);
        setInputMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  if (currentUserId === null || token === null) {
    return <div className="min-h-screen bg-[#C4F8FD] p-6 flex items-center justify-center">Loading session...</div>;
  }

  if (!selectedUserId) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8"
      ><div className="max-w-4xl mx-auto flex flex-col gap-6 bg-white/40 rounded-2xl shadow-xl p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-cyan-200/30 pb-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-cyan-700 font-medium">
              <ArrowLeft size={20} /> Back
            </button>
          </div>
                  
          <div className="flex flex-wrap gap-4 justify-space between bg-white/20 backdrop-blur-sm p-2 rounded-t-2xl border-b border-cyan-200/30">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-sm font-medium pb-2 transition-colors ${activeTab === 'chats' ? 'text-cyan-700 border-b-2 border-cyan-600' : 'text-cyan-700 hover:text-cyan-800'}`}
              onClick={() => setActiveTab('chats')}
            >
              Chats
            </motion.button>
            {/* <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-sm font-medium pb-2 transition-colors ${activeTab === 'notifications' ? 'text-cyan-800 border-b-2 border-cyan-600' : 'text-cyan-600 hover:text-cyan-800'}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-sm font-medium pb-2 transition-colors ${activeTab === 'notifications' ? 'text-cyan-800 border-b-2 border-cyan-600' : 'text-cyan-600 hover:text-cyan-800'}`}
              onClick={() => setActiveTab('notifications')}
            >
              Manage user
            </motion.button> */}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'chats' ? (
              <motion.div
                key="chats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <h1 className="text-md font-semibold text-cyan-900 p-2">Select a User</h1>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {users.map((user) => (
                    <motion.div 
                      variants={cardVariants}
                      key={user.id || user._id}
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectUser(user.id || user._id)}
                      className="flex items-center justify-between p-4 bg-white/40 hover:bg-white/60 transition-all cursor-pointer border border-transparent hover:border-cyan-200/50 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="bg-cyan-500/20 p-3 rounded-full flex-shrink-0">
                          <UserIcon size={24} className="text-cyan-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-cyan-800 truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-cyan-600 truncate">Click to start chatting</p>
                        </div>
                      </div>
                      {(user as any).unreadCount > 0 && (
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {(user as any).unreadCount}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-12 text-cyan-700 min-h-[300px]"
              >
                <Bell size={48} className="text-cyan-500/50 mb-4" />
                <p className="text-sm font-medium">No new notifications</p>
                <p className="text-xs text-cyan-600">You're all caught up!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative -bottom-2">
            <AdminChatManager />
        </div>
        </div>
      </motion.div>
    );
  }
 

  const selectedUser = users.find(u => (u.id || u._id) === selectedUserId);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#C4F8FD] p-2 sm:p-6 lg:p-8"
    >
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100dvh-6rem)] sm:h-[85vh] bg-white/40 rounded-2xl shadow-xl border-none overflow-hidden relative">
        
        <div className="p-4 border-b border-cyan-200/30 flex items-center gap-3 bg-white/20 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedUserId(null)} 
            className="flex items-center justify-center p-1 rounded-full transition-colors text-cyan-700"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className="bg-cyan-500/20 p-2 rounded-full flex-shrink-0">
            <UserIcon size={20} className="text-cyan-600" />
          </div>
          <span className="font-semibold text-cyan-900 truncate">{selectedUser?.firstName || 'User'}</span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-2 min-h-0">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = msg.senderId === currentUserId; 
              return (
                <motion.div 
                  custom={isMe}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  key={msg.id || msg._id || index} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`} 
                >
                  <div className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl shadow-sm relative ${
                    isMe 
                      ? 'bg-[#C4F8FD] text-cyan-900 border border-cyan-200/50 rounded-tr-sm'
                      : 'bg-white text-cyan-900 rounded-tl-sm'
                  }`}>
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className="text-[10px] text-cyan-600 mt-1 text-right">
                      {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
       <div className="p-4 border-t border-cyan-200/30 bg-white/10 backdrop-blur-sm flex gap-3 flex-shrink-0">
       <textarea
         value={inputMessage}
         onChange={(e) => setInputMessage(e.target.value)}
         onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
         placeholder="Type a message..."
         className="flex-1 rounded-full bg-[#C4F8FD] px-4 py-3 text-sm text-cyan-900
         placeholder:text-cyan-900 placeholder:font-semibold focus:outline-none border-none shadow-xl shadow-inner-xl resize-none h-10 sm:h-auto"
         rows={1}
       />
       <motion.button 
         whileHover={{ scale: 1.05 }}
         whileTap={{ scale: 0.95 }}
         onClick={sendMessage} 
         className="bg-[#C4F8FD] border border-cyan-200/50 text-cyan-700 p-3 rounded-full shadow-lg hover:bg-white transition-all flex-shrink-0"
       >
         <Send size={20} />
       </motion.button>
      </div>
    </motion.div>
  );
}