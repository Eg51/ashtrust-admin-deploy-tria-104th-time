"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Send, Paperclip, X, Loader2, Image as ImageIcon, Download } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

interface ChatMessage {
  id?: string;
  _id?: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  message: string;
  type?: 'text' | 'image';
  attachmentUrl?: string;
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
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ✅ NEW: Image Viewer State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

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
        // Regular user: server finds the admin automatically.
        // Sending targetUserId here was fragile and could crash the
        // route if this user's role were ever wrongly set to 'admin'.
        body: JSON.stringify({}),
      });
      // const res = await fetch('/api/chats/rooms', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ targetUserId: "admin" }) 
      // });
      
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

  const sendMessage = async () => {
    if (!inputMessage.trim() || !roomId || !token) return;

    try {
      console.log('🔵 [Frontend] Sending message:', inputMessage);
      
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

  // ✅ NEW: Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId || !token) return;

    setSendingMessage(true);

    try {
      console.log('🔵 [Frontend] Uploading image...');
      const compressedImage = await compressImage(file, 100, 400);

      const res = await fetch(`/api/chats/messages/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'image',
          attachmentUrl: compressedImage
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          console.log('🔵 [Frontend] Image uploaded successfully');
          setMessages(prev => [...prev, data.data]);
          scrollToBottom();
        }
      } else {
        console.error('Image upload failed:', await res.json());
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setSendingMessage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ✅ NEW: Open Image Viewer
  const openImageViewer = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageViewerOpen(true);
  };

  // ✅ NEW: Close Image Viewer
  const closeImageViewer = () => {
    setSelectedImage(null);
    setIsImageViewerOpen(false);
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
              const isImage = msg.type === 'image';
              
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
                    {isImage && msg.attachmentUrl ? (
                      // ✅ NEW: Image message with click to enlarge
                      <div 
                        className="cursor-pointer"
                        onClick={() => openImageViewer(msg.attachmentUrl!)}
                      >
                        <img 
                          src={msg.attachmentUrl} 
                          alt="Shared image"
                          className="max-w-full max-h-60 rounded-lg object-cover hover:opacity-90 transition-opacity"
                          loading="lazy"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ImageIcon size={12} />
                          Click to enlarge
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm break-words">{msg.message}</p>
                    )}
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
      
      {/* ✅ UPDATED: Chat Input with Paperclip button for image upload */}
      <div className="p-4 border-t border-cyan-200/30 bg-white/10 backdrop-blur-sm flex gap-3 flex-shrink-0">
        {/* ✅ NEW: Hidden file input */}
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageUpload}
          disabled={sendingMessage}
        />
        
        {/* ✅ NEW: Paperclip button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={sendingMessage || !roomId}
          className="p-3 rounded-full bg-white/30 text-cyan-700 hover:bg-white/50 transition-all flex-shrink-0 disabled:opacity-50"
          aria-label="Upload image"
          title="Upload image"
        >
          {sendingMessage ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Paperclip size={20} />
          )}
        </button>
        
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type a message ......."
          className="flex-1 rounded-full bg-[#C4F8FD] px-4 py-3 text-sm text-cyan-900
           placeholder:text-cyan-900 placeholder:font-semibold focus:outline-none border-none shadow-xl shadow-inner-xl resize-none h-10 sm:h-auto"
          rows={1}
          disabled={sendingMessage}
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          disabled={sendingMessage || (!inputMessage.trim() && !sendingMessage)}
          className="bg-[#C4F8FD] border border-cyan-200/50 text-cyan-700 p-3 rounded-full shadow-lg hover:bg-white transition-all flex-shrink-0"
        >
          {sendingMessage ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </motion.button>
      </div>

      {/* ✅ NEW: Image Viewer Modal */}
      <AnimatePresence>
        {isImageViewerOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
            onClick={closeImageViewer}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeImageViewer}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Close image viewer"
              >
                <X size={24} />
              </button>

              {/* Download button */}
              <a
                href={selectedImage}
                download={`chat-image-${Date.now()}.jpg`}
                className="absolute top-4 right-16 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Download image"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={24} />
              </a>

              {/* Image */}
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Close hint */}
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs">
                Click outside to close • Click to download
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}