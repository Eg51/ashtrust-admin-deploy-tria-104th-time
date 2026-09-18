// // "use client";

// // import { useState, useEffect, useRef } from "react";
// // import { AnimatePresence, motion } from "framer-motion";
// // import { 
// //   MessageCircle, 
// //   X, 
// //   ChevronRight, 
// //   Headphones, 
// //   Clock, 
// //   CheckCircle, 
// //   Shield,
// //   User,
// //   ShieldCheck,
// //   Sparkles,
// //   Paperclip,
// //   Send,
// //   Loader2,
// //   Hourglass
// // } from "lucide-react";
// // import { useRouter, usePathname } from "next/navigation";
// // import { compressImage } from "@/lib/compressImage";

// // interface ChatWidgetProps {
// //   supportName?: string;
// //   message?: string;
// //   defaultOpen?: boolean;
// //   supportHours?: string;
// //   responseTime?: string;
// // }

// // interface ChatMessage {
// //   id: string;
// //   senderId: string;
// //   senderName?: string;
// //   senderRole?: string;
// //   message: string;
// //   type: 'text' | 'image';
// //   attachmentUrl?: string;
// //   timestamp: string;
// // }

// // export default function ChatWidget({
// //   supportName = "Ashie",
// //   message = "Hi there! 👋 How can i help?",
// //   defaultOpen = false,
// //   supportHours = "24/7",
// //   responseTime = "Usually responds in 2-5 minutes",
// // }: ChatWidgetProps) {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [mounted, setMounted] = useState(false);
// //   const [userRole, setUserRole] = useState<string | null>(null);
// //   const [userName, setUserName] = useState<string | null>(null);
// //   const [unreadCount, setUnreadCount] = useState(0);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const router = useRouter();
// //   const pathname = usePathname();

// //   const [messages, setMessages] = useState<ChatMessage[]>([]);
// //   const [inputMessage, setInputMessage] = useState("");
// //   const [sendingMessage, setSendingMessage] = useState(false);
// //   const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
// //   const [pendingReply, setPendingReply] = useState(false);
// //   const fileInputRef = useRef<HTMLInputElement>(null);
// //   const messagesEndRef = useRef<HTMLDivElement>(null);

// //   // ✅ NEW: Guest ID State
// //   const [guestId, setGuestId] = useState<string | null>(null);

// //   const isOnChatPage = pathname?.includes('/Support/user') || pathname?.includes('/Support/admin') || false;

// //   // ✅ NEW: Generate a temporary guest ID if user is not logged in
// //   useEffect(() => {
// //     const authToken = localStorage.getItem('auth_token');
// //     const userData = localStorage.getItem('user');
    
// //     if (!authToken && !userData) {
// //       let tempId = localStorage.getItem('guest_id');
// //       if (!tempId) {
// //         tempId = `guest_${crypto.randomUUID()}`;
// //         localStorage.setItem('guest_id', tempId);
// //       }
// //       setGuestId(tempId);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     setMounted(true);
// //     setIsOpen(defaultOpen);
    
// //     try {
// //       const userData = JSON.parse(localStorage.getItem('user') || '{}');
// //       const authToken = localStorage.getItem('auth_token');
      
// //       if (userData && authToken) {
// //         setUserRole(userData.role || 'user');
// //         setUserName(userData.firstName || userData.username || 'User');
// //       }
// //     } catch (error) {
// //       console.error('Error getting user data:', error);
// //       setUserRole('user');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, [defaultOpen]);
  
// //   useEffect(() => {
// //     if (isOpen) {
// //       const timer = setTimeout(() => {
// //         setIsOpen(false);
// //       }, 13000); 
      
// //       return () => clearTimeout(timer);
// //     }
// //   }, [isOpen]);

// //   // ✅ FIXED: Mark messages as read and clear unread count
// //   useEffect(() => {
// //     if (isOnChatPage || isOpen) {
// //       setUnreadCount(0);
      
// //       // ✅ Clear guest unread count from localStorage
// //       const guestIdFromStorage = localStorage.getItem('guest_id');
// //       if (guestIdFromStorage) {
// //         localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
// //       }
      
// //       const markMessagesAsRead = async () => {
// //         try {
// //           const authToken = localStorage.getItem('auth_token');
// //           if (!authToken) return;
// //           if (!currentRoomId) return;

// //           const res = await fetch(`/api/chats/mark-read`, {
// //             method: 'POST',
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'Authorization': `Bearer ${authToken}`
// //             },
// //             body: JSON.stringify({ roomId: currentRoomId })
// //           });
            
// //           if (res.ok) {
// //             console.log('✅ [ChatWidget] marked as read');
// //           }
// //         } catch (error) {
// //           console.error('🔴 [ChatWidget] messages not read:', error);
// //         }
// //       };
      
// //       markMessagesAsRead();
// //     }
// //   }, [isOnChatPage, isOpen, currentRoomId]);

// //   // ✅ FIXED: Enhanced unread count with guest support
// //   useEffect(() => {
// //     if (!mounted) return;

// //     const fetchUnreadCount = async () => {
// //       try {
// //         const authToken = localStorage.getItem('auth_token');
// //         const guestIdFromStorage = localStorage.getItem('guest_id');
        
// //         // ✅ If no auth token and no guest ID, skip
// //         if (!authToken && !guestIdFromStorage) {
// //           setUnreadCount(0);
// //           return;
// //         }

// //         // ✅ If we're on the chat page, don't show unread
// //         if (isOnChatPage) {
// //           setUnreadCount(0);
// //           return;
// //         }

// //         // ✅ For guests, check local storage for unread messages
// //         if (!authToken && guestIdFromStorage) {
// //           const storedUnread = localStorage.getItem(`guest_unread_${guestIdFromStorage}`);
// //           const count = storedUnread ? parseInt(storedUnread) : 0;
// //           setUnreadCount(count);
// //           return;
// //         }

// //         // ✅ For authenticated users, fetch from server
// //         if (authToken) {
// //           const res = await fetch('/api/user/unread', {
// //             headers: { 'Authorization': `Bearer ${authToken}` }
// //           });

// //           if (res.ok) {
// //             const data = await res.json();
// //             const count = data.data?.totalUnread || 0;
            
// //             if (!isOnChatPage) {
// //               setUnreadCount(count);
// //             } else {
// //               setUnreadCount(0);
// //             }
// //           }
// //         }
// //       } catch (error) {
// //         console.error('Error fetching unread count:', error);
// //         // Don't set to 0 on error, keep previous value
// //       }
// //     };

// //     fetchUnreadCount();
    
// //     // ✅ Poll less frequently when chat is open
// //     const interval = setInterval(fetchUnreadCount, isOpen ? 5000 : 3000);
// //     return () => clearInterval(interval);
// //   }, [mounted, isOnChatPage, isOpen]);

// //   // ✅ FIXED: Get or create room with guest support
// //   useEffect(() => {
// //     if (isOpen) {
// //       const getRoom = async () => {
// //         try {
// //           const token = localStorage.getItem('auth_token');

// //           // ✅ NEW: Send guestId to body if no auth token
// //           const body = token ? {} : { guestId };

// //           const res = await fetch('/api/chats/rooms', {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
// //             body: JSON.stringify(body)
// //           });

// //           const data = await res.json();
// //           if (data.success) {
// //             setCurrentRoomId(data.data.id);

// //             const msgRes = await fetch(`/api/chats/messages/${data.data.id}`, {
// //               // ✅ NEW: Send X-Guest-ID header if no auth token
// //               headers: { 
// //                 'Authorization': token ? `Bearer ${token}` : '',
// //                 'X-Guest-ID': guestId || ''
// //               }
// //             });
// //             const msgData = await msgRes.json();
// //             if (msgData.success) {
// //               setMessages(msgData.data || []);
              
// //               const lastMsg = msgData.data?.[msgData.data.length - 1];
// //               if (lastMsg && lastMsg.senderRole === 'admin') {
// //                 setPendingReply(false);
// //               } else if (lastMsg && lastMsg.senderRole !== 'admin') {
// //                 setPendingReply(true);
// //               }
// //             }
// //           }
// //         } catch (error) {
// //           console.error("Error fetching room:", error);
// //         }
// //       };
// //       getRoom();
// //     }
// //   }, [isOpen, guestId]);

// //   // ✅ NEW: Poll for new messages for guests when chat is open
// //   useEffect(() => {
// //     if (!isOpen || !currentRoomId) return;
    
// //     const guestIdFromStorage = localStorage.getItem('guest_id');
// //     if (!guestIdFromStorage) return;

// //     const pollForNewMessages = async () => {
// //       try {
// //         const token = localStorage.getItem('auth_token');
// //         const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
// //           headers: { 
// //             'Authorization': token ? `Bearer ${token}` : '',
// //             'X-Guest-ID': guestIdFromStorage
// //           }
// //         });
        
// //         if (res.ok) {
// //           const data = await res.json();
// //           if (data.success) {
// //             const newMessages = data.data || [];
// //             if (newMessages.length > messages.length) {
// //               // New messages arrived - check if any are from admin
// //               const adminMessages = newMessages.filter(
// //                 (msg: ChatMessage, index: number) => index >= messages.length && msg.senderRole === 'admin'
// //               );
              
// //               if (adminMessages.length > 0 && !isOpen) {
// //                 const storedUnread = localStorage.getItem(`guest_unread_${guestIdFromStorage}`);
// //                 const currentUnread = storedUnread ? parseInt(storedUnread) : 0;
// //                 const newUnread = currentUnread + adminMessages.length;
// //                 localStorage.setItem(`guest_unread_${guestIdFromStorage}`, String(newUnread));
// //                 setUnreadCount(newUnread);
// //               }
              
// //               setMessages(newMessages);
// //             }
// //           }
// //         }
// //       } catch (error) {
// //         console.error('Error polling messages:', error);
// //       }
// //     };

// //     const interval = setInterval(pollForNewMessages, 5000);
// //     return () => clearInterval(interval);
// //   }, [currentRoomId, isOpen, messages.length]);

// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [messages, pendingReply]);

// //   const getSupportPath = () => {
// //     if (userRole === 'admin' || userRole === 'Admin') {
// //       return '/Support/admin';
// //     }
// //     return '/Support/user';
// //   };

// //   const getRoleDisplay = () => {
// //     if (userRole === 'admin' || userRole === 'Admin') {
// //       return 'Admin Support';
// //     }
// //     return 'User Support';
// //   };

// //   const getRoleIcon = () => {
// //     if (userRole === 'admin' || userRole === 'Admin') {
// //       return <ShieldCheck className="h-4 w-4 text-cyan-600" />;
// //     }
// //     return <User className="h-4 w-4 text-cyan-600" />;
// //   };

// //   const getPersonalizedMessage = () => {
// //     if (userName && userName !== 'User') {
// //       return `Hi ${userName}! 👋 How can we help you today?`;
// //     }
// //     return message;
// //   };

// //   const handleStartChat = () => {
// //     const path = getSupportPath();
// //     router.push(path);
// //     setUnreadCount(0);
// //     const guestIdFromStorage = localStorage.getItem('guest_id');
// //     if (guestIdFromStorage) {
// //       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
// //     }
// //   };

// //   // ✅ FIXED: Enhanced send message with unread clearing
 
// //   // ✅ FIXED: Enhanced send message with correct endpoint
// //   const handleSendMessage = async () => {
// //     if (!inputMessage.trim() || !currentRoomId || sendingMessage) return;
  
// //     const user = JSON.parse(localStorage.getItem('user') || '{}');
// //     const token = localStorage.getItem('auth_token');
// //     const guestIdFromStorage = localStorage.getItem('guest_id');
  
// //     const tempId = `temp-${Date.now()}`;
// //     setMessages(prev => [...prev, {
// //       id: tempId,
// //       senderId: user._id || guestIdFromStorage || 'guest',
// //       message: inputMessage,
// //       type: 'text',
// //       timestamp: new Date().toISOString()
// //     }]);
// //     setInputMessage("");
// //     setSendingMessage(true);
// //     setPendingReply(true);
  
// //     // ✅ Clear unread count when sending a message
// //     setUnreadCount(0);
// //     if (guestIdFromStorage) {
// //       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
// //     }
  
// //     try {
// //       // ✅ FIXED: Use the room-specific endpoint
// //       const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
// //         method: 'POST',
// //         headers: { 
// //           'Content-Type': 'application/json', 
// //           'Authorization': token ? `Bearer ${token}` : '',
// //           'X-Guest-ID': guestIdFromStorage || ''
// //         },
// //         body: JSON.stringify({
// //           message: inputMessage,
// //           type: 'text'
// //         })
// //       });
  
// //       if (res.ok) {
// //         const data = await res.json();
// //         if (data.success) {
// //           setMessages(prev => prev.map(msg => msg.id === tempId ? data.data : msg));
// //         }
// //       } else {
// //         // ✅ Handle error response
// //         const errorData = await res.json();
// //         console.error('Send error:', errorData);
// //         // Remove the temporary message on error
// //         setMessages(prev => prev.filter(msg => msg.id !== tempId));
// //       }
// //     } catch (error) {
// //       console.error("Error sending message:", error);
// //       // Remove the temporary message on error
// //       setMessages(prev => prev.filter(msg => msg.id !== tempId));
// //     } finally {
// //       setSendingMessage(false);
// //     }
// //   };
// //   // const handleSendMessage = async () => {
// //   //   if (!inputMessage.trim() || !currentRoomId || sendingMessage) return;

// //   //   const user = JSON.parse(localStorage.getItem('user') || '{}');
// //   //   const token = localStorage.getItem('auth_token');
// //   //   const guestIdFromStorage = localStorage.getItem('guest_id');

// //   //   const tempId = `temp-${Date.now()}`;
// //   //   setMessages(prev => [...prev, {
// //   //     id: tempId,
// //   //     senderId: user._id || guestIdFromStorage || 'guest',
// //   //     message: inputMessage,
// //   //     type: 'text',
// //   //     timestamp: new Date().toISOString()
// //   //   }]);
// //   //   setInputMessage("");
// //   //   setSendingMessage(true);
// //   //   setPendingReply(true);

// //   //   // ✅ Clear unread count when sending a message
// //   //   setUnreadCount(0);
// //   //   if (guestIdFromStorage) {
// //   //     localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
// //   //   }

// //   //   try {
// //   //     const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
// //   //       method: 'POST',
// //   //       headers: { 
// //   //         'Content-Type': 'application/json', 
// //   //         'Authorization': token ? `Bearer ${token}` : '',
// //   //         'X-Guest-ID': guestIdFromStorage || ''
// //   //       },
// //   //       body: JSON.stringify({
// //   //         message: inputMessage,
// //   //         type: 'text'
// //   //       })
// //   //     });

// //   //     if (res.ok) {
// //   //       const data = await res.json();
// //   //       setMessages(prev => prev.map(msg => msg.id === tempId ? data.data : msg));
// //   //     }
// //   //   } catch (error) {
// //   //     console.error("Error sending message:", error);
// //   //   } finally {
// //   //     setSendingMessage(false);
// //   //   }
// //   // };

// //   // const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //   //   const file = e.target.files?.[0];
// //   //   if (!file || !currentRoomId) return;

// //   //   const token = localStorage.getItem('auth_token');
// //   //   const guestIdFromStorage = localStorage.getItem('guest_id');
// //   //   setSendingMessage(true);
// //   //   setPendingReply(true);

// //   //   // ✅ Clear unread count when uploading image
// //   //   setUnreadCount(0);
// //   //   if (guestIdFromStorage) {
// //   //     localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
// //   //   }

// //   //   try {
// //   //     const compressedImage = await compressImage(file, 100, 400);

// //   //     const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
// //   //       method: 'POST',
// //   //       headers: { 
// //   //         'Content-Type': 'application/json', 
// //   //         'Authorization': token ? `Bearer ${token}` : '',
// //   //         'X-Guest-ID': guestIdFromStorage || ''
// //   //       },
// //   //       body: JSON.stringify({
// //   //         type: 'image',
// //   //         attachmentUrl: compressedImage
// //   //       })
// //   //     });

// //   //     if (res.ok) {
// //   //       const data = await res.json();
// //   //       setMessages(prev => [...prev, data.data]);
// //   //     }
// //   //   } catch (error) {
// //   //     console.error("Error uploading image:", error);
// //   //   } finally {
// //   //     setSendingMessage(false);
// //   //     if (fileInputRef.current) fileInputRef.current.value = "";
// //   //   }
// //   // };

// //   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (!file || !currentRoomId) return;
  
// //     const token = localStorage.getItem('auth_token');
// //     const guestIdFromStorage = localStorage.getItem('guest_id');
// //     setSendingMessage(true);
// //     setPendingReply(true);
  
// //     // ✅ Clear unread count when uploading image
// //     setUnreadCount(0);
// //     if (guestIdFromStorage) {
// //       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
// //     }
  
// //     try {
// //       const compressedImage = await compressImage(file, 100, 400);
  
// //       // ✅ FIXED: Use the room-specific endpoint
// //       const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
// //         method: 'POST',
// //         headers: { 
// //           'Content-Type': 'application/json', 
// //           'Authorization': token ? `Bearer ${token}` : '',
// //           'X-Guest-ID': guestIdFromStorage || ''
// //         },
// //         body: JSON.stringify({
// //           type: 'image',
// //           attachmentUrl: compressedImage
// //         })
// //       });
  
// //       if (res.ok) {
// //         const data = await res.json();
// //         if (data.success) {
// //           setMessages(prev => [...prev, data.data]);
// //         }
// //       }
// //     } catch (error) {
// //       console.error("Error uploading image:", error);
// //     } finally {
// //       setSendingMessage(false);
// //       if (fileInputRef.current) fileInputRef.current.value = "";
// //     }
// //   };

// //   if (!mounted) return null;

// //   return (
// //     <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
// //       <AnimatePresence>
// //         {isOpen && (
// //           <motion.div
// //             initial={{ opacity: 0, y: 24, scale: 0.92 }}
// //             animate={{ opacity: 1, y: 0, scale: 1 }}
// //             exit={{ opacity: 0, y: 24, scale: 0.92 }}
// //             transition={{ duration: 0.3, ease: "easeOut" }}
// //             role="dialog"
// //             aria-label="Support chat"
// //             className="w-[85vw] max-w-sm rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#D6F9FE] to-[#E8FBFF] p-6 shadow-2xl backdrop-blur-xl border border-white/30 sm:w-80"
// //           >
// //             {/* Header */}
// //             <div className="flex items-start justify-between">
// //               <div className="flex items-center gap-3">
// //                 <div className="relative">
// //                   <div className="h-12 w-12 rounded-full bg-[#C4F8FD] flex items-center justify-center shadow-lg">
// //                     <Headphones className="h-6 w-6 text-cyan-700" />
// //                   </div>
// //                   <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
// //                 </div>
// //                 <div>
// //                   <div className="flex items-center gap-2">
// //                     <h3 className="font-bold text-cyan-900 text-lg">{supportName}</h3>
// //                     {getRoleIcon()}
// //                   </div>
// //                   <div className="flex items-center gap-1.5">
// //                     <Clock className="h-3 w-3 text-cyan-600" />
// //                     <span className="text-xs text-cyan-600">{supportHours}</span>
// //                   </div>
// //                 </div>
// //               </div>
// //               <button
// //                 type="button"
// //                 onClick={() => setIsOpen(false)}
// //                 aria-label="Close chat"
// //                 className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
// //               >
// //                 <X size={18} />
// //               </button>
// //             </div>

// //             {/* Role Badge */}
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               transition={{ delay: 0.05, duration: 0.2 }}
// //               className="mt-3 flex items-center justify-between"
// //             >
// //               <div className="inline-flex items-center gap-1.5 bg-white/50 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
// //                 <Sparkles className="h-3 w-3 text-cyan-500" />
// //                 <span className="text-[10px] font-medium text-cyan-700">
// //                   {getRoleDisplay()}
// //                 </span>
// //               </div>
              
// //               {unreadCount > 0 && !isOnChatPage && (
// //                 <motion.div
// //                   initial={{ scale: 0 }}
// //                   animate={{ scale: 1 }}
// //                   exit={{ scale: 0 }}
// //                   className="flex items-center gap-1.5 bg-red-500 rounded-full px-2.5 py-0.5 shadow-lg"
// //                 >
// //                   <span className="text-[10px] font-bold text-[#C4F8FD]">
// //                     {unreadCount > 99 ? '99+' : unreadCount}
// //                   </span>
// //                   <span className="text-[8px] text-[#C4F8FD]/80 font-medium">new</span>
// //                 </motion.div>
// //               )}
// //             </motion.div>

// //             {/* Message */}
// //             <motion.div
// //               initial={{ opacity: 0, y: 10 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               transition={{ delay: 0.1, duration: 0.3 }}
// //               className="mt-3"
// //             >
// //               <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
// //                 <p className="text-sm leading-relaxed text-cyan-800">
// //                   {getPersonalizedMessage()}
// //                 </p>
// //                 <span className="absolute -top-2 left-3 text-4xl text-cyan-400/30 font-serif">"</span>
// //                 <span className="absolute -bottom-4 right-3 text-4xl text-cyan-400/30 font-serif">"</span>
// //               </div>
// //             </motion.div>

// //             {/* Mini-Chat UI */}
// //             {currentRoomId && (
// //               <>
// //                 <div className="mt-3 flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 bg-white/20 rounded-xl p-2">
// //                   {messages.length === 0 && (
// //                     <p className="text-center text-xs text-cyan-600 py-4">Start the conversation!</p>
// //                   )}
// //                   {messages.map((msg) => (
// //                     <div 
// //                       key={msg.id} 
// //                       className={`flex ${msg.senderId === (JSON.parse(localStorage.getItem('user') || '{}')._id || guestId) ? 'justify-end' : 'justify-start'}`}
// //                     >
// //                       <div className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
// //                         msg.senderId === (JSON.parse(localStorage.getItem('user') || '{}')._id || guestId)
// //                           ? 'bg-cyan-600 text-white'
// //                           : 'bg-white text-cyan-900'
// //                       }`}>
// //                         {msg.type === 'image' ? (
// //                           <img src={msg.attachmentUrl} alt="Shared" className="max-w-full max-h-40 rounded-lg object-cover" />
// //                         ) : (
// //                           <p className="text-xs">{msg.message}</p>
// //                         )}
// //                       </div>
// //                     </div>
// //                   ))}
                  
// //                   {pendingReply && (
// //                     <div className="flex justify-center">
// //                       <div className="flex items-center gap-1.5 bg-amber-100/80 text-amber-700 rounded-full px-3 py-1 text-[10px] font-medium">
// //                         <Hourglass size={12} />
// //                         Your message has been sent. Please wait for a reply.
// //                       </div>
// //                     </div>
// //                   )}
// //                   <div ref={messagesEndRef} />
// //                 </div>

// //                 {/* Chat Inputs */}
// //                 <div className="mt-3 flex items-center gap-2">
// //                   <input 
// //                     type="file" 
// //                     accept="image/*" 
// //                     className="hidden" 
// //                     ref={fileInputRef}
// //                     onChange={handleImageUpload}
// //                   />
// //                   <button
// //                     onClick={() => fileInputRef.current?.click()}
// //                     className="p-2 rounded-full bg-white/40 hover:bg-white/60 transition-colors"
// //                     aria-label="Upload image"
// //                   >
// //                     <Paperclip size={16} className="text-cyan-700" />
// //                   </button>
// //                   <input
// //                     type="text"
// //                     value={inputMessage}
// //                     onChange={(e) => setInputMessage(e.target.value)}
// //                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
// //                     placeholder="Type a message..."
// //                     className="flex-1 bg-white/50 rounded-xl px-4 py-2 text-xs text-cyan-900 placeholder:text-cyan-500 focus:outline-none border border-white/30"
// //                   />
// //                   <button
// //                     onClick={handleSendMessage}
// //                     disabled={sendingMessage || !inputMessage.trim()}
// //                     className="p-2 rounded-full bg-cyan-600 text-white disabled:opacity-50"
// //                     aria-label="Send message"
// //                   >
// //                     {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
// //                   </button>
// //                 </div>
// //               </>
// //             )}

// //             {/* Features */}
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               transition={{ delay: 0.2, duration: 0.3 }}
// //               className="mt-4 grid grid-cols-2 gap-2"
// //             >
// //               <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
// //                 <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
// //                 <span className="text-[10px] font-medium text-cyan-700">Secure & Private</span>
// //               </div>
// //               <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
// //                 <Shield className="h-3.5 w-3.5 text-cyan-500" />
// //                 <span className="text-[10px] font-medium text-cyan-700">End-to-end encrypted</span>
// //               </div>
// //             </motion.div>

// //             {/* Response time */}
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               transition={{ delay: 0.25, duration: 0.3 }}
// //               className="mt-3 flex items-center justify-center gap-2"
// //             >
// //               <div className="flex items-center gap-1.5 bg-cyan-500/20 rounded-full px-3 py-1">
// //                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
// //                 <span className="text-[10px] text-cyan-700">{responseTime}</span>
// //               </div>
// //             </motion.div>

// //             {/* CTA Button */}
// //             <motion.div
// //               initial={{ opacity: 0, y: 8 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               transition={{ delay: 0.3, duration: 0.3 }}
// //               className="mt-4"
// //             >
// //               <button
// //                 onClick={handleStartChat}
// //                 className="group w-full rounded-2xl bg-[#C4F8FD] px-6 py-3.5 text-sm font-semibold text-cyan-700 shadow-lg transition-all hover:shadow-xl hover:from-cyan-700 hover:to-cyan-800 flex items-center justify-center gap-2 relative overflow-hidden"
// //               >
// //                 <span>
// //                   {userRole === 'admin' || userRole === 'Administrator' 
// //                     ? 'Start a Conversation' 
// //                     : 'Chat with Ashie'}
// //                 </span>
// //                 <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
// //               </button>
// //               <p className="text-center text-[9px] text-cyan-500/70 mt-2">
// //                 {userRole === 'admin' || userRole === 'Administrator' 
// //                   ? '🔐 Your Client is a click away'
// //                   : '💬 You\'re connecting....'}
// //               </p>
// //             </motion.div>
// //           </motion.div>
// //         )}
// //       </AnimatePresence>

// //       {/* Floating Toggle Button */}
// //       <motion.button
// //         type="button"
// //         onClick={() => setIsOpen((prev) => !prev)}
// //         whileHover={{ scale: 1.08 }}
// //         whileTap={{ scale: 0.92 }}
// //         aria-label={isOpen ? "Close chat" : "Open chat"}
// //         aria-expanded={isOpen}
// //         className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl bg-[#C4F8FD] transition-all hover:shadow-2xl focus:outline-none"
// //       >
// //         {!isOpen && unreadCount > 0 && !isOnChatPage && (
// //           <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
// //         )}
        
// //         <AnimatePresence mode="wait" initial={false}>
// //           {isOpen ? (
// //             <motion.span
// //               key="close-icon"
// //               initial={{ rotate: -90, opacity: 0 }}
// //               animate={{ rotate: 0, opacity: 1 }}
// //               exit={{ rotate: 90, opacity: 0 }}
// //               transition={{ duration: 0.15 }}
// //               className="flex"
// //             >
// //               <X size={22} className='text-cyan-600' strokeWidth={2.5} />
// //             </motion.span>
// //           ) : (
// //             <motion.span
// //               key="chat-icon"
// //               initial={{ rotate: 90, opacity: 0 }}
// //               animate={{ rotate: 0, opacity: 1 }}
// //               exit={{ rotate: -90, opacity: 0 }}
// //               transition={{ duration: 0.15 }}
// //               className="flex relative"
// //             >
// //               <MessageCircle size={22} className='text-cyan-600' fill="currentColor" />
              
// //               {unreadCount > 0 && !isOnChatPage && (
// //                 <motion.span
// //                   key="unread-badge"
// //                   initial={{ scale: 0, opacity: 0 }}
// //                   animate={{ scale: 1, opacity: 1 }}
// //                   exit={{ scale: 0, opacity: 0 }}
// //                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
// //                   className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-500 px-1.5 shadow-lg border-none z-50"
// //                 >
// //                   <span className="text-[9px] font-bold text-[#C4F8FD] leading-none">
// //                     {unreadCount > 99 ? '99+' : unreadCount}
// //                   </span>
// //                 </motion.span>
// //               )}
// //             </motion.span>
// //           )}
// //         </AnimatePresence>
// //       </motion.button>
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   MessageCircle,
//   X,
//   ChevronRight,
//   Headphones,
//   Clock,
//   CheckCircle,
//   Shield,
//   User,
//   ShieldCheck,
//   Sparkles,
//   Paperclip,
//   Send,
//   Loader2,
//   Hourglass
// } from "lucide-react";
// import { useRouter, usePathname } from "next/navigation";
// import { compressImage } from "@/lib/compressImage";

// interface ChatWidgetProps {
//   supportName?: string;
//   message?: string;
//   defaultOpen?: boolean;
//   supportHours?: string;
//   responseTime?: string;
// }

// interface ChatMessage {
//   id: string;
//   senderId: string;
//   senderName?: string;
//   senderRole?: string;
//   message: string;
//   type: 'text' | 'image';
//   attachmentUrl?: string;
//   timestamp: string;
// }

// export default function ChatWidget({
//   supportName = "Ashie",
//   message = "Hi there! 👋 How can i help?",
//   defaultOpen = false,
//   supportHours = "24/7",
//   responseTime = "Usually responds in 2-5 minutes",
// }: ChatWidgetProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [userRole, setUserRole] = useState<string | null>(null);
//   const [userName, setUserName] = useState<string | null>(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();
//   const pathname = usePathname();

//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [sendingMessage, setSendingMessage] = useState(false);
//   const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
//   const [pendingReply, setPendingReply] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // const [guestId, setGuestId] = useState<string | null>(null);

//   // const isOnChatPage = pathname?.includes('/Support/user') || pathname?.includes('/Support/admin') || false;
//   const [guestId, setGuestId] = useState<string | null>(null);
//   const [attention, setAttention] = useState(false);
//   const prevUnreadRef = useRef(0);

//   const isOnChatPage = pathname?.includes('/Support/user') || pathname?.includes('/Support/admin') || false;

//   useEffect(() => {
//     const authToken = localStorage.getItem('auth_token');
//     const userData = localStorage.getItem('user');

//     if (!authToken && !userData) {
//       let tempId = localStorage.getItem('guest_id');
//       if (!tempId) {
//         tempId = `guest_${crypto.randomUUID()}`;
//         localStorage.setItem('guest_id', tempId);
//       }
//       setGuestId(tempId);
//     }
//   }, []);

//   useEffect(() => {
//     setMounted(true);
//     setIsOpen(defaultOpen);

//     try {
//       const userData = JSON.parse(localStorage.getItem('user') || '{}');
//       const authToken = localStorage.getItem('auth_token');

//       if (userData && authToken) {
//         setUserRole(userData.role || 'user');
//         setUserName(userData.firstName || userData.username || 'User');
//       }
//     } catch (error) {
//       console.error('Error getting user data:', error);
//       setUserRole('user');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [defaultOpen]);

//   // ✅ Auto-close timer removed — chat stays open until the user closes it.

//   // ✅ Mark messages as read and clear unread count
//   useEffect(() => {
//     if (isOnChatPage || isOpen) {
//       setUnreadCount(0);

//       const guestIdFromStorage = localStorage.getItem('guest_id');
//       if (guestIdFromStorage) {
//         localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
//       }

//       const markMessagesAsRead = async () => {
//         try {
//           const authToken = localStorage.getItem('auth_token');
//           if (!authToken) return;
//           if (!currentRoomId) return;

//           const res = await fetch(`/api/chats/mark-read`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${authToken}`
//             },
//             body: JSON.stringify({ roomId: currentRoomId })
//           });

//           if (res.ok) {
//             console.log('✅ [ChatWidget] marked as read');
//           }
//         } catch (error) {
//           console.error('🔴 [ChatWidget] messages not read:', error);
//         }
//       };

//       markMessagesAsRead();
//     }
//   }, [isOnChatPage, isOpen, currentRoomId]);

//   useEffect(() => {
//     if (!mounted) return;

//     const fetchUnreadCount = async () => {
//       try {
//         const authToken = localStorage.getItem('auth_token');
//         const guestIdFromStorage = localStorage.getItem('guest_id');

//         if (!authToken && !guestIdFromStorage) {
//           setUnreadCount(0);
//           return;
//         }

//         if (isOnChatPage) {
//           setUnreadCount(0);
//           return;
//         }

//         if (!authToken && guestIdFromStorage) {
//           const storedUnread = localStorage.getItem(`guest_unread_${guestIdFromStorage}`);
//           const count = storedUnread ? parseInt(storedUnread) : 0;
//           setUnreadCount(count);
//           return;
//         }

//         if (authToken) {
//           const res = await fetch('/api/user/unread', {
//             headers: { 'Authorization': `Bearer ${authToken}` }
//           });

//           if (res.ok) {
//             const data = await res.json();
//             const count = data.data?.totalUnread || 0;

//             if (!isOnChatPage) {
//               setUnreadCount(count);
//             } else {
//               setUnreadCount(0);
//             }
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching unread count:', error);
//       }
//     };

//     fetchUnreadCount();
//     // ✅ Arrival attention — shake/flash the button when the unread count grows
//     useEffect(() => {
//       const grew = unreadCount > prevUnreadRef.current;
//       prevUnreadRef.current = unreadCount;
  
//       if (!grew || unreadCount === 0 || isOpen || isOnChatPage) return;
  
//       setAttention(true);
//       const t = setTimeout(() => setAttention(false), 1200);
//       return () => clearTimeout(t);
//     }, [unreadCount, isOpen, isOnChatPage]);

//     const interval = setInterval(fetchUnreadCount, isOpen ? 5000 : 3000);
//     return () => clearInterval(interval);
//   }, [mounted, isOnChatPage, isOpen]);

//   useEffect(() => {
//     if (isOpen) {
//       const getRoom = async () => {
//         try {
//           const token = localStorage.getItem('auth_token');

//           const body = token ? {} : { guestId };

//           const res = await fetch('/api/chats/rooms', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
//             body: JSON.stringify(body)
//           });

//           const data = await res.json();
//           if (data.success) {
//             setCurrentRoomId(data.data.id);

//             const msgRes = await fetch(`/api/chats/messages/${data.data.id}`, {
//               headers: {
//                 'Authorization': token ? `Bearer ${token}` : '',
//                 'X-Guest-ID': guestId || ''
//               }
//             });
//             const msgData = await msgRes.json();
//             if (msgData.success) {
//               setMessages(msgData.data || []);

//               const lastMsg = msgData.data?.[msgData.data.length - 1];
//               if (lastMsg && lastMsg.senderRole === 'admin') {
//                 setPendingReply(false);
//               } else if (lastMsg && lastMsg.senderRole !== 'admin') {
//                 setPendingReply(true);
//               }
//             }
//           }
//         } catch (error) {
//           console.error("Error fetching room:", error);
//         }
//       };
//       getRoom();
//     }
//   }, [isOpen, guestId]);

//   useEffect(() => {
//     if (!isOpen || !currentRoomId) return;

//     const guestIdFromStorage = localStorage.getItem('guest_id');
//     if (!guestIdFromStorage) return;

//     const pollForNewMessages = async () => {
//       try {
//         const token = localStorage.getItem('auth_token');
//         const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
//           headers: {
//             'Authorization': token ? `Bearer ${token}` : '',
//             'X-Guest-ID': guestIdFromStorage
//           }
//         });

//         if (res.ok) {
//           const data = await res.json();
//           if (data.success) {
//             const newMessages = data.data || [];
//             if (newMessages.length > messages.length) {
//               const adminMessages = newMessages.filter(
//                 (msg: ChatMessage, index: number) => index >= messages.length && msg.senderRole === 'admin'
//               );

//               if (adminMessages.length > 0 && !isOpen) {
//                 const storedUnread = localStorage.getItem(`guest_unread_${guestIdFromStorage}`);
//                 const currentUnread = storedUnread ? parseInt(storedUnread) : 0;
//                 const newUnread = currentUnread + adminMessages.length;
//                 localStorage.setItem(`guest_unread_${guestIdFromStorage}`, String(newUnread));
//                 setUnreadCount(newUnread);
//               }

//               setMessages(newMessages);
//             }
//           }
//         }
//       } catch (error) {
//         console.error('Error polling messages:', error);
//       }
//     };

//     const interval = setInterval(pollForNewMessages, 5000);
//     return () => clearInterval(interval);
//   }, [currentRoomId, isOpen, messages.length]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, pendingReply]);

//   const getSupportPath = () => {
//     if (userRole === 'admin' || userRole === 'Admin') {
//       return '/Support/admin';
//     }
//     return '/Support/user';
//   };

//   const getRoleDisplay = () => {
//     if (userRole === 'admin' || userRole === 'Admin') {
//       return 'Admin Support';
//     }
//     return 'User Support';
//   };

//   const getRoleIcon = () => {
//     if (userRole === 'admin' || userRole === 'Admin') {
//       return <ShieldCheck className="h-4 w-4 text-cyan-600" />;
//     }
//     return <User className="h-4 w-4 text-cyan-600" />;
//   };

//   const getPersonalizedMessage = () => {
//     if (userName && userName !== 'User') {
//       return `Hi ${userName}! 👋 How can we help you today?`;
//     }
//     return message;
//   };

//   const handleStartChat = () => {
//     const path = getSupportPath();
//     router.push(path);
//     setUnreadCount(0);
//     const guestIdFromStorage = localStorage.getItem('guest_id');
//     if (guestIdFromStorage) {
//       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!inputMessage.trim() || !currentRoomId || sendingMessage) return;

//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     const token = localStorage.getItem('auth_token');
//     const guestIdFromStorage = localStorage.getItem('guest_id');

//     const tempId = `temp-${Date.now()}`;
//     setMessages(prev => [...prev, {
//       id: tempId,
//       senderId: user._id || guestIdFromStorage || 'guest',
//       message: inputMessage,
//       type: 'text',
//       timestamp: new Date().toISOString()
//     }]);
//     setInputMessage("");
//     setSendingMessage(true);
//     setPendingReply(true);

//     setUnreadCount(0);
//     if (guestIdFromStorage) {
//       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
//     }

//     try {
//       const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': token ? `Bearer ${token}` : '',
//           'X-Guest-ID': guestIdFromStorage || ''
//         },
//         body: JSON.stringify({
//           message: inputMessage,
//           type: 'text'
//         })
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data.success) {
//           setMessages(prev => prev.map(msg => msg.id === tempId ? data.data : msg));
//         }
//       } else {
//         const errorData = await res.json();
//         console.error('Send error:', errorData);
//         setMessages(prev => prev.filter(msg => msg.id !== tempId));
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setMessages(prev => prev.filter(msg => msg.id !== tempId));
//     } finally {
//       setSendingMessage(false);
//     }
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !currentRoomId) return;

//     const token = localStorage.getItem('auth_token');
//     const guestIdFromStorage = localStorage.getItem('guest_id');
//     setSendingMessage(true);
//     setPendingReply(true);

//     setUnreadCount(0);
//     if (guestIdFromStorage) {
//       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
//     }

//     try {
//       const compressedImage = await compressImage(file, 100, 400);

//       const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': token ? `Bearer ${token}` : '',
//           'X-Guest-ID': guestIdFromStorage || ''
//         },
//         body: JSON.stringify({
//           type: 'image',
//           attachmentUrl: compressedImage
//         })
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data.success) {
//           setMessages(prev => [...prev, data.data]);
//         }
//       }
//     } catch (error) {
//       console.error("Error uploading image:", error);
//     } finally {
//       setSendingMessage(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   if (!mounted) return null;

//   return (
//     <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 24, scale: 0.92 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 24, scale: 0.92 }}
//             transition={{ duration: 0.3, ease: "easeOut" }}
//             role="dialog"
//             aria-label="Support chat"
//             className="w-[85vw] max-w-sm rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#D6F9FE] to-[#E8FBFF] p-6 shadow-2xl backdrop-blur-xl border border-white/30 sm:w-80"
//           >
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="relative">
//                   <div className="h-12 w-12 rounded-full bg-[#C4F8FD] flex items-center justify-center shadow-lg">
//                     <Headphones className="h-6 w-6 text-cyan-700" />
//                   </div>
//                   <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <h3 className="font-bold text-cyan-900 text-lg">{supportName}</h3>
//                     {getRoleIcon()}
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <Clock className="h-3 w-3 text-cyan-600" />
//                     <span className="text-xs text-cyan-600">{supportHours}</span>
//                   </div>
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setIsOpen(false)}
//                 aria-label="Close chat"
//                 className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.05, duration: 0.2 }}
//               className="mt-3 flex items-center justify-between"
//             >
//               <div className="inline-flex items-center gap-1.5 bg-white/50 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
//                 <Sparkles className="h-3 w-3 text-cyan-500" />
//                 <span className="text-[10px] font-medium text-cyan-700">
//                   {getRoleDisplay()}
//                 </span>
//               </div>

//               {unreadCount > 0 && !isOnChatPage && (
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   exit={{ scale: 0 }}
//                   className="flex items-center gap-1.5 bg-red-500 rounded-full px-2.5 py-0.5 shadow-lg"
//                 >
//                   <span className="text-[10px] font-bold text-[#C4F8FD]">
//                     {unreadCount > 99 ? '99+' : unreadCount}
//                   </span>
//                   <span className="text-[8px] text-[#C4F8FD]/80 font-medium">new</span>
//                 </motion.div>
//               )}
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1, duration: 0.3 }}
//               className="mt-3"
//             >
//               <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
//                 <p className="text-sm leading-relaxed text-cyan-800">
//                   {getPersonalizedMessage()}
//                 </p>
//                 <span className="absolute -top-2 left-3 text-4xl text-cyan-400/30 font-serif">"</span>
//                 <span className="absolute -bottom-4 right-3 text-4xl text-cyan-400/30 font-serif">"</span>
//               </div>
//             </motion.div>

//             {currentRoomId && (
//               <>
//                 <div className="mt-3 flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 bg-white/20 rounded-xl p-2">
//                   {messages.length === 0 && (
//                     <p className="text-center text-xs text-cyan-600 py-4">Start the conversation!</p>
//                   )}
//                   {messages.map((msg) => (
//                     <div
//                       key={msg.id}
//                       className={`flex ${msg.senderId === (JSON.parse(localStorage.getItem('user') || '{}')._id || guestId) ? 'justify-end' : 'justify-start'}`}
//                     >
//                       <div className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
//                         msg.senderId === (JSON.parse(localStorage.getItem('user') || '{}')._id || guestId)
//                           ? 'bg-cyan-600 text-white'
//                           : 'bg-white text-cyan-900'
//                       }`}>
//                         {msg.type === 'image' ? (
//                           <img src={msg.attachmentUrl} alt="Shared" className="max-w-full max-h-40 rounded-lg object-cover" />
//                         ) : (
//                           <p className="text-xs">{msg.message}</p>
//                         )}
//                       </div>
//                     </div>
//                   ))}

//                   {pendingReply && (
//                     <div className="flex justify-center">
//                       <div className="flex items-center gap-1.5 bg-amber-100/80 text-amber-700 rounded-full px-3 py-1 text-[10px] font-medium">
//                         <Hourglass size={12} />
//                         Your message has been sent. Please wait for a reply.
//                       </div>
//                     </div>
//                   )}
//                   <div ref={messagesEndRef} />
//                 </div>

//                 <div className="mt-3 flex items-center gap-2">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     ref={fileInputRef}
//                     onChange={handleImageUpload}
//                   />
//                   <button
//                     onClick={() => fileInputRef.current?.click()}
//                     className="p-2 rounded-full bg-white/40 hover:bg-white/60 transition-colors"
//                     aria-label="Upload image"
//                   >
//                     <Paperclip size={16} className="text-cyan-700" />
//                   </button>
//                   <input
//                     type="text"
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//                     placeholder="Type a message..."
//                     className="flex-1 bg-white/50 rounded-xl px-4 py-2 text-xs text-cyan-900 placeholder:text-cyan-500 focus:outline-none border border-white/30"
//                   />
//                   <button
//                     onClick={handleSendMessage}
//                     disabled={sendingMessage || !inputMessage.trim()}
//                     className="p-2 rounded-full bg-cyan-600 text-white disabled:opacity-50"
//                     aria-label="Send message"
//                   >
//                     {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
//                   </button>
//                 </div>
//               </>
//             )}

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2, duration: 0.3 }}
//               className="mt-4 grid grid-cols-2 gap-2"
//             >
//               <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
//                 <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
//                 <span className="text-[10px] font-medium text-cyan-700">Secure & Private</span>
//               </div>
//               <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
//                 <Shield className="h-3.5 w-3.5 text-cyan-500" />
//                 <span className="text-[10px] font-medium text-cyan-700">End-to-end encrypted</span>
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.25, duration: 0.3 }}
//               className="mt-3 flex items-center justify-center gap-2"
//             >
//               <div className="flex items-center gap-1.5 bg-cyan-500/20 rounded-full px-3 py-1">
//                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
//                 <span className="text-[10px] text-cyan-700">{responseTime}</span>
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3, duration: 0.3 }}
//               className="mt-4"
//             >
//               <button
//                 onClick={handleStartChat}
//                 className="group w-full rounded-2xl bg-[#C4F8FD] px-6 py-3.5 text-sm font-semibold text-cyan-700 shadow-lg transition-all hover:shadow-xl hover:from-cyan-700 hover:to-cyan-800 flex items-center justify-center gap-2 relative overflow-hidden"
//               >
//                 <span>
//                   {userRole === 'admin' || userRole === 'Administrator'
//                     ? 'Start a Conversation'
//                     : 'Chat with Ashie'}
//                 </span>
//                 <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//               </button>
//               <p className="text-center text-[9px] text-cyan-500/70 mt-2">
//                 {userRole === 'admin' || userRole === 'Administrator'
//                   ? '🔐 Your Client is a click away'
//                   : '💬 You\'re connecting....'}
//               </p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
// {/* 
//       <motion.button
//         type="button"
//         onClick={() => setIsOpen((prev) => !prev)}
//         whileHover={{ scale: 1.08 }}
//         whileTap={{ scale: 0.92 }}
//         aria-label={isOpen ? "Close chat" : "Open chat"}
//         aria-expanded={isOpen}
//         className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl bg-[#C4F8FD] transition-all hover:shadow-2xl focus:outline-none"
//       >
//         {!isOpen && unreadCount > 0 && !isOnChatPage && (
//           <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
//         )} */}
//               <motion.button
//         type="button"
//         onClick={() => setIsOpen((prev) => !prev)}
//         whileHover={{ scale: 1.08 }}
//         whileTap={{ scale: 0.92 }}
//         animate={
//           attention
//             ? {
//                 rotate: [0, -14, 14, -10, 10, -6, 6, 0],
//                 scale: [1, 1.15, 1.05, 1.12, 1.05, 1.08, 1],
//               }
//             : { rotate: 0, scale: 1 }
//         }
//         transition={
//           attention
//             ? { duration: 0.9, ease: "easeInOut" }
//             : { type: "spring", stiffness: 320, damping: 26 }
//         }
//         aria-label={isOpen ? "Close chat" : "Open chat"}
//         aria-expanded={isOpen}
//         className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl bg-[#C4F8FD] transition-all hover:shadow-2xl focus:outline-none"
//       >
//         {/* ✅ Red halo — pulses continuously while unread */}
//         {!isOpen && unreadCount > 0 && !isOnChatPage && (
//           <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
//         )}

//         {/* ✅ Cyan flash on arrival — one-shot when count grows */}
//         <AnimatePresence>
//           {attention && (
//             <motion.span
//               key="attention-flash"
//               initial={{ opacity: 0.75, scale: 1 }}
//               animate={{ opacity: 0, scale: 1.6 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.9, ease: "easeOut" }}
//               className="pointer-events-none absolute inset-0 rounded-full bg-cyan-400/60"
//             />
//           )}
//         </AnimatePresence>

//         <AnimatePresence mode="wait" initial={false}>
//           {isOpen ? (
//             <motion.span
//               key="close-icon"
//               initial={{ rotate: -90, opacity: 0 }}
//               animate={{ rotate: 0, opacity: 1 }}
//               exit={{ rotate: 90, opacity: 0 }}
//               transition={{ duration: 0.15 }}
//               className="flex"
//             >
//               <X size={22} className='text-cyan-600' strokeWidth={2.5} />
//             </motion.span>
//           ) : (
//             <motion.span
//               key="chat-icon"
//               initial={{ rotate: 90, opacity: 0 }}
//               animate={{ rotate: 0, opacity: 1 }}
//               exit={{ rotate: -90, opacity: 0 }}
//               transition={{ duration: 0.15 }}
//               className="flex relative"
//             >
//               <MessageCircle size={22} className='text-cyan-600' fill="currentColor" />

//               {unreadCount > 0 && !isOnChatPage && (
//                 <motion.span
//                   key="unread-badge"
//                   initial={{ scale: 0, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   exit={{ scale: 0, opacity: 0 }}
//                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                   className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-500 px-1.5 shadow-lg border-none z-50"
//                 >
//                   <span className="text-[9px] font-bold text-[#C4F8FD] leading-none">
//                     {unreadCount > 99 ? '99+' : unreadCount}
//                   </span>
//                 </motion.span>
//               )}
//             </motion.span>
//           )}
//         </AnimatePresence>
//       </motion.button>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Paperclip,
  Send,
  Loader2,
  Hourglass
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { compressImage } from "@/lib/compressImage";

interface ChatWidgetProps {
  supportName?: string;
  message?: string;
  defaultOpen?: boolean;
  supportHours?: string;
  responseTime?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  message: string;
  type: 'text' | 'image';
  attachmentUrl?: string;
  timestamp: string;
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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [pendingReply, setPendingReply] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [guestId, setGuestId] = useState<string | null>(null);

  // ✅ Arrival attention — drives the shake/flash animation
  const [attention, setAttention] = useState(false);
  const prevUnreadRef = useRef(0);

  const isOnChatPage = pathname?.includes('/Support/user') || pathname?.includes('/Support/admin') || false;

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!authToken && !userData) {
      let tempId = localStorage.getItem('guest_id');
      if (!tempId) {
        tempId = `guest_${crypto.randomUUID()}`;
        localStorage.setItem('guest_id', tempId);
      }
      setGuestId(tempId);
    }
  }, []);

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

  // ✅ Mark messages as read and clear unread count
  useEffect(() => {
    if (isOnChatPage || isOpen) {
      setUnreadCount(0);

      const guestIdFromStorage = localStorage.getItem('guest_id');
      if (guestIdFromStorage) {
        localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
      }

      const markMessagesAsRead = async () => {
        try {
          const authToken = localStorage.getItem('auth_token');
          if (!authToken) return;
          if (!currentRoomId) return;

          const res = await fetch(`/api/chats/mark-read`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ roomId: currentRoomId })
          });

          if (res.ok) {
            console.log('✅ [ChatWidget] marked as read');
          }
        } catch (error) {
          console.error('🔴 [ChatWidget] messages not read:', error);
        }
      };

      markMessagesAsRead();
    }
  }, [isOnChatPage, isOpen, currentRoomId]);

  // ✅ Unread polling
  useEffect(() => {
    if (!mounted) return;

    const fetchUnreadCount = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        const guestIdFromStorage = localStorage.getItem('guest_id');

        if (!authToken && !guestIdFromStorage) {
          setUnreadCount(0);
          return;
        }

        if (isOnChatPage) {
          setUnreadCount(0);
          return;
        }

        if (!authToken && guestIdFromStorage) {
          const storedUnread = localStorage.getItem(`guest_unread_${guestIdFromStorage}`);
          const count = storedUnread ? parseInt(storedUnread) : 0;
          setUnreadCount(count);
          return;
        }

        if (authToken) {
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
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, isOpen ? 5000 : 3000);
    return () => clearInterval(interval);
  }, [mounted, isOnChatPage, isOpen]);

  // ✅ Arrival attention — sibling effect, NOT nested inside the polling effect
  useEffect(() => {
    const grew = unreadCount > prevUnreadRef.current;
    prevUnreadRef.current = unreadCount;

    if (!grew || unreadCount === 0 || isOpen || isOnChatPage) return;

    setAttention(true);
    const t = setTimeout(() => setAttention(false), 1200);
    return () => clearTimeout(t);
  }, [unreadCount, isOpen, isOnChatPage]);

  useEffect(() => {
    if (isOpen) {
      const getRoom = async () => {
        try {
          const token = localStorage.getItem('auth_token');

          const body = token ? {} : { guestId };

          const res = await fetch('/api/chats/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
            body: JSON.stringify(body)
          });

          const data = await res.json();
          if (data.success) {
            setCurrentRoomId(data.data.id);

            const msgRes = await fetch(`/api/chats/messages/${data.data.id}`, {
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'X-Guest-ID': guestId || ''
              }
            });
            const msgData = await msgRes.json();
            if (msgData.success) {
              setMessages(msgData.data || []);

              const lastMsg = msgData.data?.[msgData.data.length - 1];
              if (lastMsg && lastMsg.senderRole === 'admin') {
                setPendingReply(false);
              } else if (lastMsg && lastMsg.senderRole !== 'admin') {
                setPendingReply(true);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching room:", error);
        }
      };
      getRoom();
    }
  }, [isOpen, guestId]);

  useEffect(() => {
    if (!isOpen || !currentRoomId) return;

    const guestIdFromStorage = localStorage.getItem('guest_id');
    if (!guestIdFromStorage) return;

    const pollForNewMessages = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'X-Guest-ID': guestIdFromStorage
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const newMessages = data.data || [];
            if (newMessages.length > messages.length) {
              const adminMessages = newMessages.filter(
                (msg: ChatMessage, index: number) => index >= messages.length && msg.senderRole === 'admin'
              );

              if (adminMessages.length > 0 && !isOpen) {
                const storedUnread = localStorage.getItem(`guest_unread_${guestIdFromStorage}`);
                const currentUnread = storedUnread ? parseInt(storedUnread) : 0;
                const newUnread = currentUnread + adminMessages.length;
                localStorage.setItem(`guest_unread_${guestIdFromStorage}`, String(newUnread));
                setUnreadCount(newUnread);
              }

              setMessages(newMessages);
            }
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    const interval = setInterval(pollForNewMessages, 5000);
    return () => clearInterval(interval);
  }, [currentRoomId, isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingReply]);

  const getSupportPath = () => {
    if (userRole === 'admin' || userRole === 'Admin') {
      return '/Support/admin';
    }
    return '/Support/user';
  };

  const getRoleDisplay = () => {
    if (userRole === 'admin' || userRole === 'Admin') {
      return 'Admin Support';
    }
    return 'User Support';
  };

  const getRoleIcon = () => {
    if (userRole === 'admin' || userRole === 'Admin') {
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
    const guestIdFromStorage = localStorage.getItem('guest_id');
    if (guestIdFromStorage) {
      localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentRoomId || sendingMessage) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('auth_token');
    const guestIdFromStorage = localStorage.getItem('guest_id');

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      senderId: user._id || guestIdFromStorage || 'guest',
      message: inputMessage,
      type: 'text',
      timestamp: new Date().toISOString()
    }]);
    setInputMessage("");
    setSendingMessage(true);
    setPendingReply(true);

    setUnreadCount(0);
    if (guestIdFromStorage) {
      localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
    }

    try {
      const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Guest-ID': guestIdFromStorage || ''
        },
        body: JSON.stringify({
          message: inputMessage,
          type: 'text'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(prev => prev.map(msg => msg.id === tempId ? data.data : msg));
        }
      } else {
        const errorData = await res.json();
        console.error('Send error:', errorData);
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentRoomId) return;

    const token = localStorage.getItem('auth_token');
    const guestIdFromStorage = localStorage.getItem('guest_id');
    setSendingMessage(true);
    setPendingReply(true);

    setUnreadCount(0);
    if (guestIdFromStorage) {
      localStorage.setItem(`guest_unread_${guestIdFromStorage}`, '0');
    }

    try {
      const compressedImage = await compressImage(file, 100, 400);

      const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Guest-ID': guestIdFromStorage || ''
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
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setSendingMessage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!mounted) return null;

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

            {currentRoomId && (
              <>
                <div className="mt-3 flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 bg-white/20 rounded-xl p-2">
                  {messages.length === 0 && (
                    <p className="text-center text-xs text-cyan-600 py-4">Start the conversation!</p>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === (JSON.parse(localStorage.getItem('user') || '{}')._id || guestId) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                        msg.senderId === (JSON.parse(localStorage.getItem('user') || '{}')._id || guestId)
                          ? 'bg-cyan-600 text-white'
                          : 'bg-white text-cyan-900'
                      }`}>
                        {msg.type === 'image' ? (
                          <img src={msg.attachmentUrl} alt="Shared" className="max-w-full max-h-40 rounded-lg object-cover" />
                        ) : (
                          <p className="text-xs">{msg.message}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {pendingReply && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-1.5 bg-amber-100/80 text-amber-700 rounded-full px-3 py-1 text-[10px] font-medium">
                        <Hourglass size={12} />
                        Your message has been sent. Please wait for a reply.
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full bg-white/40 hover:bg-white/60 transition-colors"
                    aria-label="Upload image"
                  >
                    <Paperclip size={16} className="text-cyan-700" />
                  </button>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/50 rounded-xl px-4 py-2 text-xs text-cyan-900 placeholder:text-cyan-500 focus:outline-none border border-white/30"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !inputMessage.trim()}
                    className="p-2 rounded-full bg-cyan-600 text-white disabled:opacity-50"
                    aria-label="Send message"
                  >
                    {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </>
            )}

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
                <span>
                  {userRole === 'admin' || userRole === 'Administrator'
                    ? 'Start a Conversation'
                    : 'Chat with Ashie'}
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
        animate={
          attention
            ? {
                rotate: [0, -14, 14, -10, 10, -6, 6, 0],
                scale: [1, 1.15, 1.05, 1.12, 1.05, 1.08, 1],
              }
            : { rotate: 0, scale: 1 }
        }
        transition={
          attention
            ? { duration: 0.9, ease: "easeInOut" }
            : { type: "spring", stiffness: 320, damping: 26 }
        }
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl bg-[#C4F8FD] transition-all hover:shadow-2xl focus:outline-none"
      >
        {/* Red halo — pulses continuously while unread */}
        {!isOpen && unreadCount > 0 && !isOnChatPage && (
          <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
        )}

        {/* Cyan flash on arrival — one-shot when count grows */}
        <AnimatePresence>
          {attention && (
            <motion.span
              key="attention-flash"
              initial={{ opacity: 0.75, scale: 1 }}
              animate={{ opacity: 0, scale: 1.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-full bg-cyan-400/60"
            />
          )}
        </AnimatePresence>

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

              {unreadCount > 0 && !isOnChatPage && (
                <motion.span
                  key="unread-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-500 px-1.5 shadow-lg border-none z-50"
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