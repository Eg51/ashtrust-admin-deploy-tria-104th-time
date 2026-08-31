// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence, Variants } from "framer-motion";
// import { ArrowLeft, Send, User as UserIcon, Bell } from "lucide-react";
// import AdminChatManager from '@/app/components/AdminChatManager'
// import { ForceMarkReadButton } from '@/app/components/ForceMarkReadButton' // ✅ ADDED IMPORT

// interface ChatUser {
//   _id: string;
//   id?: string; 
//   firstName: string;
//   lastName: string;
//   email: string;
// }

// interface ChatMessage {
//   id?: string;
//   _id?: string;
//   senderId: string;
//   message: string;
//   timestamp?: string;
//   createdAt?: string;
// }

// const containerVariants: Variants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.05, delayChildren: 0.05 },
//   },
// };

// const cardVariants: Variants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { 
//     opacity: 1, 
//     y: 0, 
//     transition: { type: "tween", duration: 0.4, ease: "easeOut" } 
//   },
// };

// const messageVariants: Variants = {
//   hidden: (isMe: boolean) => ({ opacity: 0, x: isMe ? 20 : -20, y: 10 }),
//   visible: { opacity: 1, x: 0, y: 0, transition: { type: "tween", duration: 0.2, ease: "easeOut" } },
// };

// export default function AdminSupportPage() {
//   const [activeTab, setActiveTab] = useState<'chats' | 'notifications'>('chats');
//   const [users, setUsers] = useState<ChatUser[]>([]);
//   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
//   const [roomId, setRoomId] = useState<string | null>(null);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();

//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
//   const [token, setToken] = useState<string | null>(null);
  
//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem('user') || '{}');
//     const authToken = localStorage.getItem('auth_token');
//     setCurrentUserId(userData._id || null);
//     setToken(authToken || null);
//   }, []);

//   // ✅ NEW: Save roomId to localStorage when it changes
//   useEffect(() => {
//     if (roomId) {
//       localStorage.setItem('currentRoomId', roomId);
//     }
//   }, [roomId]);

//   useEffect(() => {
//     if (!token) return;
//     fetch('/api/admin/users', {
//       headers: { 'Authorization': `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(data => setUsers(data.data || []))
//       .catch(console.error);
//   }, [token]);

//   const handleSelectUser = async (targetUserId: string) => {
//     if (!token) return;
//     const res = await fetch('/api/chats/rooms', {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({ targetUserId })
//     });
//     const data = await res.json();
//     if (data.success) {
//       setSelectedUserId(targetUserId);
//       setRoomId(data.data.id);
//       setActiveTab('chats');
//     }
//   };

//   useEffect(() => {
//     if (!roomId || !token) return;
    
//     const fetchMessages = async () => {
//       try {
//         const res = await fetch(`/api/chats/messages/${roomId}`, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (!res.ok) {
//           setMessages([]); 
//           return;
//         }
//         const data = await res.json();
//         setMessages(data.data || []);
//         scrollToBottom();
//       } catch (error) {
//         console.error("Failed to fetch messages:", error);
//         setMessages([]);
//       }
//     };

//     fetchMessages();
//     const interval = setInterval(fetchMessages, 2000);
//     return () => clearInterval(interval);
//   }, [roomId, token]);

//   const scrollToBottom = () => {
//     setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
//   };

//   // ✅ ONLY THIS FUNCTION IS CHANGED - Everything else remains identical
//   // The old commented-out code is preserved below for reference
//   const sendMessage = async () => {
//     if (!inputMessage.trim() || !roomId || !token) return;

//     try {
//       // ✅ FIXED: Use room-specific endpoint instead of /api/chats/messages
//       const res = await fetch(`/api/chats/messages/${roomId}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ 
//           message: inputMessage,
//           type: 'text'
//         })
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         console.error('Send error:', errorData);
//         return;
//       }

//       const data = await res.json();
//       if (data.success && data.data) {
//         const newMsg = data.data;
//         setMessages(prev => [...prev, newMsg]);
//         setInputMessage('');
//         scrollToBottom();
//       }
//     } catch (error) {
//       console.error('Send error:', error);
//     }
//   };

//   if (currentUserId === null || token === null) {
//     return <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//     <div className="mx-auto max-w-6xl space-y-4">
//       <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       </div>
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       </div>
//     </div>
//   </div>;
//   }

//   if (!selectedUserId) {
//     return (
//       <motion.div 
//         initial={{ opacity: 0 }} 
//         animate={{ opacity: 1 }} 
//         className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8"
//       ><div className="max-w-4xl mx-auto flex flex-col gap-6 bg-white/40 rounded-2xl shadow-xl p-4 sm:p-6 backdrop-blur-sm">
//           <div className="flex items-center justify-between border-b border-cyan-200/30 pb-4">
//             <button onClick={() => router.back()} className="flex items-center gap-2 text-cyan-700 font-medium">
//               <ArrowLeft size={20} /> Back
//             </button>
//           </div>
                  
//           <div className="flex flex-wrap gap-4 justify-space between bg-white/20 backdrop-blur-sm p-2 rounded-t-2xl border-b border-cyan-200/30">
//             <motion.button 
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className={`text-sm font-medium pb-2 transition-colors ${activeTab === 'chats' ? 'text-cyan-700 border-b-2 border-cyan-600' : 'text-cyan-700 hover:text-cyan-800'}`}
//               onClick={() => setActiveTab('chats')}
//             >
//               Chats
//             </motion.button>
//             {/* <motion.button 
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className={`text-sm font-medium pb-2 transition-colors ${activeTab === 'notifications' ? 'text-cyan-800 border-b-2 border-cyan-600' : 'text-cyan-600 hover:text-cyan-800'}`}
//               onClick={() => setActiveTab('notifications')}
//             >
//               Notifications
//             </motion.button>
//             <motion.button 
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className={`text-sm font-medium pb-2 transition-colors ${activeTab === 'notifications' ? 'text-cyan-800 border-b-2 border-cyan-600' : 'text-cyan-600 hover:text-cyan-800'}`}
//               onClick={() => setActiveTab('notifications')}
//             >
//               Manage user
//             </motion.button> */}
//           </div>

//           <AnimatePresence mode="wait">
//             {activeTab === 'chats' ? (
//               <motion.div
//                 key="chats"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="space-y-2"
//               >
//                 <h1 className="text-md font-semibold text-cyan-900 p-2">Select a User</h1>
//                 <motion.div 
//                   variants={containerVariants}
//                   initial="hidden"
//                   animate="visible"
//                   className="grid grid-cols-1 md:grid-cols-2 gap-3"
//                 >
//                   {users.map((user) => (
//                     <motion.div 
//                       variants={cardVariants}
//                       key={user.id || user._id}
//                       whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => handleSelectUser(user.id || user._id)}
//                       className="flex items-center justify-between p-4 bg-white/40 hover:bg-white/60 transition-all cursor-pointer border border-transparent hover:border-cyan-200/50 rounded-xl shadow-sm"
//                     >
//                       <div className="flex items-center gap-4 min-w-0">
//                         <div className="bg-cyan-500/20 p-3 rounded-full flex-shrink-0">
//                           <UserIcon size={24} className="text-cyan-600" />
//                         </div>
//                         <div className="min-w-0">
//                           <p className="font-semibold text-cyan-800 truncate">{user.firstName} {user.lastName}</p>
//                           <p className="text-xs text-cyan-600 truncate">Click to start chatting</p>
//                         </div>
//                       </div>
//                       {(user as any).unreadCount > 0 && (
//                         <div className="flex flex-col items-end gap-1 flex-shrink-0">
//                           <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//                             {(user as any).unreadCount}
//                           </span>
//                         </div>
//                       )}
//                     </motion.div>
//                   ))}
//                 </motion.div>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="notifications"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="flex flex-col items-center justify-center py-12 text-cyan-700 min-h-[300px]"
//               >
//                 <Bell size={48} className="text-cyan-500/50 mb-4" />
//                 <p className="text-sm font-medium">No new notifications</p>
//                 <p className="text-xs text-cyan-600">You're all caught up!</p>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <div className="relative -bottom-2">
//             <AdminChatManager />
//         </div>
//         </div>
//       </motion.div>
//     );
//   }
 

//   const selectedUser = users.find(u => (u.id || u._id) === selectedUserId);

//   return (
//     <motion.div 
//       initial={{ opacity: 0 }} 
//       animate={{ opacity: 1 }} 
//       className="min-h-screen bg-[#C4F8FD] p-2 sm:p-6 lg:p-8"
//     >
//       <div className="max-w-4xl mx-auto flex flex-col h-[calc(100dvh-6rem)] sm:h-[85vh] bg-white/40 rounded-2xl shadow-xl border-none overflow-hidden relative">
        
//         <div className="p-4 border-b border-cyan-200/30 flex items-center gap-3 bg-white/20 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
//           <motion.button 
//             whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.5)" }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setSelectedUserId(null)} 
//             className="flex items-center justify-center p-1 rounded-full transition-colors text-cyan-700"
//           >
//             <ArrowLeft size={24} />
//           </motion.button>
//           <div className="bg-cyan-500/20 p-2 rounded-full flex-shrink-0">
//             <UserIcon size={20} className="text-cyan-600" />
//           </div>
//           <span className="font-semibold text-cyan-900 truncate">{selectedUser?.firstName || 'User'}</span>
//         </div>

//         <div className="flex-1 p-4 overflow-y-auto space-y-2 min-h-0">
//           <AnimatePresence initial={false}>
//             {messages.map((msg, index) => {
//               const isMe = msg.senderId === currentUserId; 
//               return (
//                 <motion.div 
//                   custom={isMe}
//                   variants={messageVariants}
//                   initial="hidden"
//                   animate="visible"
//                   key={msg.id || msg._id || index} 
//                   className={`flex ${isMe ? 'justify-end' : 'justify-start'}`} 
//                 >
//                   <div className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl shadow-sm relative ${
//                     isMe 
//                       ? 'bg-[#C4F8FD] text-cyan-900 border border-cyan-200/50 rounded-tr-sm'
//                       : 'bg-white text-cyan-900 rounded-tl-sm'
//                   }`}>
//                     <p className="text-sm break-words">{msg.message}</p>
//                     <p className="text-[10px] text-cyan-600 mt-1 text-right">
//                       {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </p>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </AnimatePresence>
//           <div ref={messagesEndRef} />
//         </div>

//         {/* ✅ ADDED: Force Mark Read Button - Placed between messages and input */}
//         <div className="px-4 py-2 border-t border-cyan-200/30 bg-white/5 backdrop-blur-sm">
//           <div className="flex items-center justify-between gap-4">
//             <ForceMarkReadButton 
//               roomId={roomId}
//               onSuccess={() => {
//                 console.log('✅ Force marked all messages as read!');
//                 // Refresh messages to update UI
//                 if (roomId && token) {
//                   fetch(`/api/chats/messages/${roomId}`, {
//                     headers: { 'Authorization': `Bearer ${token}` }
//                   })
//                     .then(res => res.json())
//                     .then(data => {
//                       if (data.success) {
//                         setMessages(data.data || []);
//                       }
//                     })
//                     .catch(console.error);
//                 }
//               }}
//             />
//             <p className="text-xs text-cyan-600/70 hidden sm:block">
//               Mark ALL messages as read for everyone
//             </p>
//           </div>
//         </div>
//       </div>
      
//       <div className="p-4 border-t border-cyan-200/30 bg-white/10 backdrop-blur-sm flex gap-3 flex-shrink-0">
//         <textarea
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
//           placeholder="Type a message..."
//           className="flex-1 rounded-full bg-[#C4F8FD] px-4 py-3 text-sm text-cyan-900
//           placeholder:text-cyan-900 placeholder:font-semibold focus:outline-none border-none shadow-xl shadow-inner-xl resize-none h-10 sm:h-auto"
//           rows={1}
//         />
//         <motion.button 
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={sendMessage} 
//           className="bg-[#C4F8FD] border border-cyan-200/50 text-cyan-700 p-3 rounded-full shadow-lg hover:bg-white transition-all flex-shrink-0"
//         >
//           <Send size={20} />
//         </motion.button>
//       </div>
//     </motion.div>
//   );
// }

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  User as UserIcon, 
  Bell, 
  Paperclip,
  X,
  Loader2,
  Image as ImageIcon,
  Download
} from "lucide-react";
import AdminChatManager from '@/app/components/AdminChatManager'
import { ForceMarkReadButton } from '@/app/components/ForceMarkReadButton'
import { compressImage } from "@/lib/compressImage";

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
  senderName?: string;
  senderRole?: string;
  message: string;
  type?: 'text' | 'image';
  attachmentUrl?: string;
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
        const res = await fetch(`/api/chats/messages/${roomId}`, {
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

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Send error:', errorData);
        return;
      }

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

  // ✅ NEW: Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId || !token) return;

    setSendingMessage(true);

    try {
      // Compress the image
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

  if (currentUserId === null || token === null) {
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

        {/* ✅ ADDED: Force Mark Read Button - Placed between messages and input */}
        <div className="px-4 py-2 border-t border-cyan-200/30 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <ForceMarkReadButton 
              roomId={roomId}
              onSuccess={() => {
                console.log('✅ Force marked all messages as read!');
                if (roomId && token) {
                  fetch(`/api/chats/messages/${roomId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        setMessages(data.data || []);
                      }
                    })
                    .catch(console.error);
                }
              }}
            />
            <p className="text-xs text-cyan-600/70 hidden sm:block">
              Mark ALL messages as read for everyone
            </p>
          </div>
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
          placeholder="Type a message..."
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
          className="bg-[#C4F8FD] border border-cyan-200/50 text-cyan-700 p-3 rounded-full shadow-lg hover:bg-white transition-all flex-shrink-0 disabled:opacity-50"
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