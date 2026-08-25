// // app/components/ChatWidget.jsx

// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { MessageCircle, X, Send, User, Check, CheckCheck } from "lucide-react";
// import Link from "next/link";
// import { 
//   createChat, 
//   sendMessage, 
//   listenToMessages,
//   getCurrentUser,
//   ADMIN_UID,
//   getUserProfile,
//   markMessagesAsRead,
// } from "@/lib/firebase";

// // ============================================================================
// // COMPONENT
// // ============================================================================

// /**
//  * ChatWidget Component - User-facing chat interface
//  * @param {Object} props
//  * @param {string} [props.supportName="Ashie"]
//  * @param {string} [props.message="Hi, how can we be of help today?"]
//  * @param {boolean} [props.defaultOpen=false]
//  */
// export default function Chat({
//   supportName = "Ashie",
//   message = "Hi, how can we be of help today?",
//   defaultOpen = false,
// }) {
//   // ============================================================================
//   // STATE
//   // ============================================================================

//   const [isOpen, setIsOpen] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [user, setUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [chatId, setChatId] = useState(null);
//   const [userName, setUserName] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSending, setIsSending] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
  
//   // Refs
//   const messagesEndRef = useRef(null);
//   const unsubscribeRef = useRef(null);
//   const inputRef = useRef(null);

//   // ============================================================================
//   // EFFECTS
//   // ============================================================================

//   // Handle mounting and hydration
//   useEffect(() => {
//     setMounted(true);
//     setIsOpen(defaultOpen);
//   }, [defaultOpen]);

//   // Handle user authentication and chat initialization
//   useEffect(() => {
//     let isSubscribed = true;

//     const initializeChat = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const currentUser = getCurrentUser();
        
//         if (!currentUser) {
//           setLoading(false);
//           return;
//         }

//         if (!isSubscribed) return;

//         setUser(currentUser);

//         // Get user profile or use auth data
//         let profile = null;
//         try {
//           profile = await getUserProfile(currentUser.uid);
//         } catch (err) {
//           console.warn("Could not fetch user profile:", err);
//         }

//         const name = profile?.displayName || 
//                      currentUser.displayName || 
//                      (currentUser.email ? currentUser.email.split('@')[0] : 'Guest');
//         setUserName(name);

//         // Initialize chat
//         await initChat(currentUser.uid);
        
//         setLoading(false);
//       } catch (err) {
//         console.error("Error initializing chat:", err);
//         setError("Failed to initialize chat. Please try again.");
//         setLoading(false);
//       }
//     };

//     initializeChat();

//     // Cleanup
//     return () => {
//       isSubscribed = false;
//       if (unsubscribeRef.current) {
//         unsubscribeRef.current();
//         unsubscribeRef.current = null;
//       }
//     };
//   }, []);

//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   // Focus input when chat opens
//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       setTimeout(() => {
//         if (inputRef.current) {
//           inputRef.current.focus();
//         }
//       }, 300);
//     }
//   }, [isOpen]);

//   // ============================================================================
//   // HELPERS
//   // ============================================================================

//   /**
//    * Get time-based greeting
//    * @returns {string}
//    */
//   const getTimeBasedGreeting = useCallback(() => {
//     const hour = new Date().getHours();
//     let greeting = "Hello";
    
//     if (hour >= 5 && hour < 12) {
//       greeting = "Good Morning";
//     } else if (hour >= 12 && hour < 17) {
//       greeting = "Good Afternoon";
//     } else if (hour >= 17 && hour < 21) {
//       greeting = "Good Evening";
//     } else {
//       greeting = "Good Night";
//     }
    
//     return greeting;
//   }, []);

//   /**
//    * Get personalized welcome message
//    * @returns {string}
//    */
//   const getWelcomeMessage = useCallback(() => {
//     const greeting = getTimeBasedGreeting();
//     if (userName) {
//       return `${greeting}, ${userName}! How can we be of help today?`;
//     }
//     return `${greeting}! How can we be of help today?`;
//   }, [getTimeBasedGreeting, userName]);

//   /**
//    * Format timestamp
//    * @param {any} timestamp
//    * @returns {string}
//    */
//   const formatTime = useCallback((timestamp) => {
//     if (!timestamp) return "";
//     try {
//       const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//       return new Intl.DateTimeFormat('en-US', {
//         hour: '2-digit',
//         minute: '2-digit'
//       }).format(date);
//     } catch (err) {
//       return "";
//     }
//   }, []);

//   /**
//    * Initialize or get existing chat
//    * @param {string} userId
//    */
//   const initChat = async (userId) => {
//     try {
//       // Unsubscribe from previous listener if any
//       if (unsubscribeRef.current) {
//         unsubscribeRef.current();
//         unsubscribeRef.current = null;
//       }

//       const id = await createChat(userId, ADMIN_UID);
//       setChatId(id);

//       // Listen for messages
//       const unsub = listenToMessages(id, (msgs) => {
//         setMessages(msgs);
        
//         // Update unread count
//         const unread = msgs.filter((m) => m.sender !== userId && !m.read).length;
//         setUnreadCount(unread);
        
//         // Mark messages as read when user is viewing
//         if (isOpen && unread > 0) {
//           markMessagesAsRead(id, userId).catch(console.warn);
//         }
//       });

//       unsubscribeRef.current = unsub;
//     } catch (err) {
//       console.error("Error initializing chat:", err);
//       throw err;
//     }
//   };

//   // ============================================================================
//   // HANDLERS
//   // ============================================================================

//   /**
//    * Handle sending a message
//    * @param {Event} e
//    */
//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || !user || !chatId || isSending) return;

//     try {
//       setIsSending(true);
//       await sendMessage(chatId, user.uid, input.trim());
//       setInput("");
//     } catch (err) {
//       console.error("Error sending message:", err);
//       setError("Failed to send message. Please try again.");
//       setTimeout(() => setError(null), 5000);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   /**
//    * Handle key press (Enter to send)
//    * @param {KeyboardEvent} e
//    */
//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend(e);
//     }
//   };

//   /**
//    * Toggle chat open/closed
//    */
//   const toggleChat = () => {
//     setIsOpen((prev) => !prev);
    
//     // Mark messages as read when opening
//     if (!isOpen && chatId && user) {
//       markMessagesAsRead(chatId, user.uid).catch(console.warn);
//     }
//   };

//   // ============================================================================
//   // RENDER HELPERS
//   // ============================================================================

//   /**
//    * Render message bubble
//    * @param {Object} msg
//    * @param {string} msg.id
//    * @param {string} msg.sender
//    * @param {string} msg.text
//    * @param {any} msg.timestamp
//    * @param {boolean} msg.read
//    * @returns {JSX.Element}
//    */
//   const renderMessage = (msg) => {
//     const isOwnMessage = msg.sender === user?.uid;
    
//     return (
//       <div
//         key={msg.id}
//         className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}
//       >
//         <div
//           className={`max-w-[80%] px-3 py-2 rounded-lg ${
//             isOwnMessage
//               ? "bg-cyan-600 text-white rounded-br-none"
//               : "bg-white/80 text-gray-800 rounded-bl-none shadow-sm"
//           }`}
//         >
//           <p className="text-sm break-words">{msg.text}</p>
//           <div className="flex items-center justify-end gap-1 mt-0.5">
//             <span className={`text-[10px] ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>
//               {formatTime(msg.timestamp)}
//             </span>
//             {isOwnMessage && (
//               msg.read ? (
//                 <CheckCheck className={`w-3 h-3 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`} />
//               ) : (
//                 <Check className={`w-3 h-3 ${isOwnMessage ? 'text-white/50' : 'text-gray-400'}`} />
//               )
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ============================================================================
//   // RENDER
//   // ============================================================================

//   // Don't render on server
//   if (!mounted) {
//     return null;
//   }

//   return (
//     <div className="fixed bottom-27 right-0 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
//       {/* Chat Popup */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 24, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 24, scale: 0.95 }}
//             transition={{ duration: 0.25, ease: "easeOut" }}
//             role="dialog"
//             aria-label="Support chat"
//             className="w-[88vw] max-w-xs rounded-2xl bg-white/10 p-4 shadow-xl backdrop-blur-xl sm:w-80 sm:max-w-sm"
//           >
//             {/* Header */}
//             <div className="flex items-start justify-between gap-3">
//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center">
//                   <User className="w-4 h-4 text-cyan-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-cyan-900">
//                     {supportName}
//                   </p>
//                   {loading ? (
//                     <p className="text-xs text-cyan-500/70">Connecting...</p>
//                   ) : user ? (
//                     <p className="text-xs text-cyan-500/70">Online</p>
//                   ) : (
//                     <p className="text-xs text-cyan-500/70">Sign in to chat</p>
//                   )}
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={toggleChat}
//                 aria-label="Close chat"
//                 className="shrink-0 rounded-full p-1 text-cyan-900 transition-colors hover:bg-slate-200/50 hover:text-cyan-600"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             {/* Error Message */}
//             {error && (
//               <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
//                 <p className="text-xs text-red-600">{error}</p>
//               </div>
//             )}

//             {/* Welcome Message */}
//             <motion.p
//               initial={{ opacity: 0, y: 6 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1, duration: 0.3 }}
//               className="mt-3 text-[15px] cursor-pointer leading-relaxed text-cyan-600"
//             >
//               <Link href="/Support" className="hover:text-cyan-700 transition-colors">
//                 {user ? getWelcomeMessage() : message}
//               </Link>
//             </motion.p>

//             {/* Chat Messages */}
//             {user && (
//               <>
//                 <div className="mt-4 max-h-48 overflow-y-auto space-y-2 border-t border-cyan-200/30 pt-3 custom-scrollbar">
//                   {loading ? (
//                     <div className="flex items-center justify-center py-4">
//                       <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-600 border-t-transparent"></div>
//                     </div>
//                   ) : messages.length === 0 ? (
//                     <p className="text-sm text-cyan-500/70 text-center py-4">
//                       No messages yet. Start the conversation!
//                     </p>
//                   ) : (
//                     <>
//                       {messages.map(renderMessage)}
//                       <div ref={messagesEndRef} />
//                     </>
//                   )}
//                 </div>

//                 {/* Message Input */}
//                 <form onSubmit={handleSend} className="mt-3 flex gap-2">
//                   <input
//                     ref={inputRef}
//                     type="text"
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     onKeyDown={handleKeyPress}
//                     placeholder="Type a message..."
//                     disabled={!user || loading || isSending}
//                     className="flex-1 px-3 py-1.5 border border-cyan-300/50 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white/30 backdrop-blur-sm placeholder:text-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
//                   />
//                   <button
//                     type="submit"
//                     disabled={!input.trim() || !user || loading || isSending}
//                     className="px-4 py-1.5 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-colors text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                   >
//                     {isSending ? (
//                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                     ) : (
//                       <Send className="w-4 h-4" />
//                     )}
//                     <span className="hidden sm:inline">Send</span>
//                   </button>
//                 </form>

//                 {/* Unread indicator */}
//                 {unreadCount > 0 && (
//                   <div className="mt-2 text-center">
//                     <span className="text-xs text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded-full">
//                       {unreadCount} new message{unreadCount > 1 ? 's' : ''}
//                     </span>
//                   </div>
//                 )}
//               </>
//             )}

//             {/* Login prompt for non-authenticated users */}
//             {!user && (
//               <div className="mt-4 text-center border-t border-cyan-200/30 pt-3">
//                 <p className="text-xs text-cyan-500/70">
//                   <Link href="/auth/login" className="text-cyan-600 hover:underline font-medium">
//                     Sign in
//                   </Link>
//                   {' '}to chat with support
//                 </p>
//               </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Toggle Button */}
//       <motion.button
//         type="button"
//         onClick={toggleChat}
//         whileHover={{ scale: 1.06 }}
//         whileTap={{ scale: 0.94 }}
//         aria-label={isOpen ? "Close chat" : "Open chat"}
//         aria-expanded={isOpen}
//         className="relative flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600/20 text-cyan-600 shadow-xl transition-colors hover:bg-cyan-600/30 hover:h-15 hover:w-15"
//       >
//         {/* Unread badge */}
//         {!isOpen && unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
//             {unreadCount}
//           </span>
//         )}
        
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
//               <X size={22} />
//             </motion.span>
//           ) : (
//             <motion.span
//               key="chat-icon"
//               initial={{ rotate: 90, opacity: 0 }}
//               animate={{ rotate: 0, opacity: 1 }}
//               exit={{ rotate: -90, opacity: 0 }}
//               transition={{ duration: 0.15 }}
//               className="flex"
//             >
//               <MessageCircle size={22} fill="currentColor" />
//             </motion.span>
//           )}
//         </AnimatePresence>
//       </motion.button>
//     </div>
//   );
// }