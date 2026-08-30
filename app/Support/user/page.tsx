"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";

interface ChatMessage {
  id?: string;
  _id?: string;
  senderId: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
}

const messageVariants: Variants = {
  hidden: (isMe: boolean) => ({ opacity: 0, x: isMe ? 20 : -20, y: 10 }),
  visible: { opacity: 1, x: 0, y: 0, transition: { type: "tween", duration: 0.2, ease: "easeOut" } },
};

export default function UserSupportPage() {
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
    const createRoom = async () => {
      const res = await fetch('/api/chats/rooms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: "admin" }) 
      });
      
      if (!res.ok) {
        console.error("Server error:", res.status);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setRoomId(data.data.id);
      }
    };
    createRoom();
  }, [token]);

  useEffect(() => {
    if (!roomId || !token) return;
    
    const fetchMessages = async () => {
      try {
        console.log('🔵 [Frontend] Fetching messages...');
        console.log('🔵 [Frontend] roomId:', roomId);
        
        const res = await fetch(`/api/chats/messages/${roomId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('🔵 [Frontend] Response status:', res.status);
        
        if (!res.ok) {
          console.log('🔴 [Frontend] Response not OK:', res.status);
          setMessages([]); 
          return;
        }
        
        const data = await res.json();
        console.log('🔵 [Frontend] Data from API:', data);
        console.log('🔵 [Frontend] Messages count:', data.data?.length || 0);
        
        if (data.data?.length > 0) {
          console.log('🔵 [Frontend] First message:', data.data[0]);
          console.log('🔵 [Frontend] All messages:', JSON.stringify(data.data, null, 2));
        }
        
        setMessages(data.data || []);
        scrollToBottom();
      } catch (error) {
        console.error('🔴 [Frontend] Error:', error);
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

  // ✅ ONLY THIS FUNCTION IS CHANGED - Everything else remains identical
  const sendMessage = async () => {
    if (!inputMessage.trim() || !roomId || !token) return;

    try {
      console.log('🔵 [Frontend] Sending message:', inputMessage);
      
      // ✅ FIXED: Use room-specific endpoint instead of /api/chats/messages
      const res = await fetch(`/api/chats/messages/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: inputMessage,
          type: 'text'
        })
      });

      if (!res.ok) throw new Error('Failed to send');

      const data = await res.json();
      console.log('🔵 [Frontend] Send response:', data);
      
      if (data.success && data.data) {
        const newMsg = data.data;
        console.log('🔵 [Frontend] New message added:', newMsg);
        setMessages(prev => [...prev, newMsg]);
        setInputMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('🔴 [Frontend] Send error:', error);
    }
  };
  
  if (currentUserId === null || token === null || !roomId) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
            <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
            <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
            <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
            <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
          </div>
        </div>
      </div>;
  }

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
            onClick={() => router.back()} 
            className="flex items-center justify-center p-1 rounded-full transition-colors text-cyan-700"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <span className="font-semibold text-cyan-900 truncate">Ashie</span>
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
            placeholder="Type a message ......."
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