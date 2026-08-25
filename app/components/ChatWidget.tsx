// // "use client";

// // import { useState } from "react";
// // import { AnimatePresence, motion } from "framer-motion";
// // import { MessageCircle, X } from "lucide-react";
// // import Link from 'next/link'

// // interface ChatWidgetProps {
// //   /** Support agent / team name shown in the popup header */
// //   supportName?: string;
// //   /** Opening message shown in the popup body */
// //   message?: string;
// //   /** Whether the popup is open on first render */
// //   defaultOpen?: boolean;
// // }

// // export default function ChatWidget({
// //   supportName = "Ashie",
// //   message = "Hi , how can we be of help today?",
// //   defaultOpen = true,
// // }: ChatWidgetProps) {
// //   const [isOpen, setIsOpen] = useState(defaultOpen);

// //   return (
// //     <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
// //       {/* Popup card */}
// //       <AnimatePresence>
// //         {isOpen && (
// //           <motion.div
// //             initial={{ opacity: 0, y: 24, scale: 0.95 }}
// //             animate={{ opacity: 1, y: 0, scale: 1 }}
// //             exit={{ opacity: 0, y: 24, scale: 0.95 }}
// //             transition={{ duration: 0.25, ease: "easeOut" }}
// //             role="dialog"
// //             aria-label="Support chat"
// //             className="w-[88vw] max-w-[300px] rounded-2xl bg-slate-300 p-5 shadow-2xl sm:w-80 sm:max-w-sm"
// //           >
// //             <div className="flex items-start justify-between gap-3">
// //               <p className="text-sm text-slate-600">
// //                 {" "}
// //                 <span className="font-semibold text-cyan-900">
// //                   {supportName}
// //                 </span>
// //               </p>
// //               <button
// //                 type="button"
// //                 onClick={() => setIsOpen(false)}
// //                 aria-label="Close chat"
// //                 className="shrink-0 rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-400/30 hover:text-slate-800"
// //               >
// //                 <X size={16} />
// //               </button>
// //             </div>

// //            <Link href={'/UserChat'}>
// //             <motion.p
// //                 initial={{ opacity: 0, y: 6 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ delay: 0.1, duration: 0.3 }}
// //                 className="mt-3 cursor-pointer text-[15px] leading-relaxed text-slate-900"
// //               >
// //                 {message}
// //               </motion.p>
// //             </Link>
// //           </motion.div>
// //         )}
// //       </AnimatePresence>

// //       {/* Floating toggle button */}
// //       <motion.button
// //         type="button"
// //         onClick={() => setIsOpen((prev) => !prev)}
// //         whileHover={{ scale: 1.06 }}
// //         whileTap={{ scale: 0.94 }}
// //         aria-label={isOpen ? "Close chat" : "Open chat"}
// //         aria-expanded={isOpen}
// //         className="flex h-14 w-14 items-center justify-center rounded-full shadow-xl bg-cyan-600
// //          text-white shadow-lg transition-colors border-none hover:bg-cyan-100 sm:h-14 sm:w-14"
// //       >
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
// //               <X size={22} />
// //             </motion.span>
// //           ) : (
// //             <motion.span
// //               key="chat-icon"
// //               initial={{ rotate: 90, opacity: 0 }}
// //               animate={{ rotate: 0, opacity: 1 }}
// //               exit={{ rotate: -90, opacity: 0 }}
// //               transition={{ duration: 0.15 }}
// //               className="flex"
// //             >
// //               <MessageCircle size={22} fill="currentColor" className="text-cyan-400" />
// //             </motion.span>
// //           )}
// //         </AnimatePresence>
// //       </motion.button>
// //     </div>
// //   );
// // }// components/ChatWidget.tsx
// "use client";

// import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   MessageCircle,
//   X,
//   Send,
//   Image as ImageIcon,
//   Video as VideoIcon,
//   Paperclip,
//   Loader2,
//   FileText,
//   Download,
// } from "lucide-react";
// import {
//   onAuthStateChanged,
//   signInAnonymously,
//   type User,
// } from "firebase/auth";
// import {
//   collection,
//   addDoc,
//   query,
//   orderBy,
//   onSnapshot,
//   serverTimestamp,
//   doc,
//   setDoc,
//   Timestamp,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { auth, db, storage } from "@/app/lib/firebase";

// // ---- Config -----------------------------------------------------------
// const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID!;

// // ---- Types --------------------------------------------------------------

// interface Attachment {
//   url: string;
//   kind: "image" | "video" | "file";
//   name: string;
// }

// interface Message {
//   id: string;
//   text: string;
//   attachment?: Attachment | null;
//   senderId: string;
//   senderName: string;
//   createdAt: Timestamp | null;
// }

// interface ChatWidgetProps {
//   supportName?: string;
//   message?: string;
//   defaultOpen?: boolean;
// }

// // ============================================================================
// // ANIMATION VARIANTS - FIXED
// // ============================================================================

// // ✅ FIX: Properly typed with 'as const' for ease values
// const popupVariants = {
//   initial: { opacity: 0, y: 24, scale: 0.95 },
//   animate: { opacity: 1, y: 0, scale: 1 },
//   exit: { opacity: 0, y: 24, scale: 0.95 },
// };

// const popupTransition = {
//   duration: 0.25,
//   ease: "easeOut" as const,
// };

// const messageVariants = {
//   initial: { opacity: 0, y: 12 },
//   animate: { opacity: 1, y: 0 },
// };

// // ✅ FIX: Card variants with proper typing
// const cardVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.4,
//       ease: "easeOut" as const,
//     },
//   },
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================

// export default function ChatWidget({
//   supportName = "Ashie",
//   message = "Hi, how can we be of help today?",
//   defaultOpen = false,
// }: ChatWidgetProps) {
//   const [isOpen, setIsOpen] = useState(defaultOpen);
//   const [user, setUser] = useState<User | null>(null);
//   const [authLoading, setAuthLoading] = useState(true);
//   const [authError, setAuthError] = useState<string | null>(null);
//   const [mounted, setMounted] = useState(false);

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [uploading, setUploading] = useState(false);

//   const imageInputRef = useRef<HTMLInputElement>(null);
//   const videoInputRef = useRef<HTMLInputElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const bottomRef = useRef<HTMLDivElement>(null);

//   const currentUserId = user?.uid;
//   const chatId = currentUserId ? `chat_${ADMIN_UID}_${currentUserId}` : null;

//   // ---- Set mounted state ----
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // ---- Auth: sign the visitor in anonymously -----------
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         setAuthLoading(false);
//       } else {
//         signInAnonymously(auth).catch((err) => {
//           console.error("Anonymous sign-in failed:", err);
//           setAuthError("Couldn't start a chat session. Please refresh.");
//           setAuthLoading(false);
//         });
//       }
//     });
//     return () => unsub();
//   }, []);

//   // ---- Listen for messages in this chat ----------------------------------
//   useEffect(() => {
//     if (!chatId) return;
//     const q = query(
//       collection(db, "chats", chatId, "messages"),
//       orderBy("createdAt", "asc")
//     );
//     return onSnapshot(q, (snap) => {
//       setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
//     });
//   }, [chatId]);

//   // ---- Auto-scroll to newest message --------------------------------------
//   useEffect(() => {
//     if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isOpen]);

//   // ---- Ensure the chat document exists ------------------------------------
//   async function ensureChatDoc() {
//     if (!chatId || !currentUserId) return;
//     await setDoc(
//       doc(db, "chats", chatId),
//       { members: [ADMIN_UID, currentUserId], createdAt: serverTimestamp() },
//       { merge: true }
//     );
//   }

//   // ---- Send a text message --------------------------------------------------
//   async function handleSend(e: FormEvent) {
//     e.preventDefault();
//     if (!input.trim() || !chatId || !currentUserId) return;

//     await ensureChatDoc();
//     await addDoc(collection(db, "chats", chatId, "messages"), {
//       text: input,
//       attachment: null,
//       senderId: currentUserId,
//       senderName: "Guest",
//       createdAt: serverTimestamp(),
//     });
//     await setDoc(
//       doc(db, "chats", chatId),
//       { lastMessage: input, lastMessageAt: serverTimestamp() },
//       { merge: true }
//     );
//     setInput("");
//   }

//   // ---- Upload + send an image / video / file ---------------------------------
//   async function handleFileUpload(
//     e: ChangeEvent<HTMLInputElement>,
//     kind: Attachment["kind"]
//   ) {
//     const file = e.target.files?.[0];
//     e.target.value = "";
//     if (!file || !chatId || !currentUserId) return;

//     setUploading(true);
//     try {
//       await ensureChatDoc();
//       const storageRef = ref(
//         storage,
//         `chats/${chatId}/${Date.now()}_${file.name}`
//       );
//       const snap = await uploadBytes(storageRef, file);
//       const url = await getDownloadURL(snap.ref);

//       const attachment: Attachment = { url, kind, name: file.name };
//       const label =
//         kind === "image" ? "📷 Photo" : kind === "video" ? "🎥 Video" : `📎 ${file.name}`;

//       await addDoc(collection(db, "chats", chatId, "messages"), {
//         text: "",
//         attachment,
//         senderId: currentUserId,
//         senderName: "Guest",
//         createdAt: serverTimestamp(),
//       });
//       await setDoc(
//         doc(db, "chats", chatId),
//         { lastMessage: label, lastMessageAt: serverTimestamp() },
//         { merge: true }
//       );
//     } catch (err) {
//       console.error("Upload failed:", err);
//     } finally {
//       setUploading(false);
//     }
//   }

//   return (
//     <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
//       {/* Popup card */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial="initial"
//             animate="animate"
//             exit="exit"
//             variants={popupVariants}
//             transition={popupTransition}
//             role="dialog"
//             aria-label="Support chat"
//             className="flex h-[70vh] max-h-130 w-[92vw] max-w-45 flex-col overflow-hidden rounded-2xl bg-slate-300 shadow-2xl sm:w-80"
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between gap-3 border-b border-slate-400/40 px-4 py-3">
//               <p className="text-sm text-slate-700">
//                 Chatting with{" "}
//                 <span className="font-semibold text-cyan-900">{supportName}</span>
//               </p>
//               <button
//                 type="button"
//                 onClick={() => setIsOpen(false)}
//                 aria-label="Close chat"
//                 className="shrink-0 rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-400/30 hover:text-slate-800"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             {/* Body */}
//             {authLoading ? (
//               <div className="flex flex-1 items-center justify-center">
//                 <Loader2 size={20} className="animate-spin text-slate-500" />
//               </div>
//             ) : authError ? (
//               <div className="flex flex-1 items-center justify-center px-6 text-center text-xs text-slate-600">
//                 {authError}
//               </div>
//             ) : (
//               <>
//                 {/* Message list */}
//                 <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
//                   {messages.length === 0 && (
//                     <p className="mt-2 rounded-2xl rounded-bl-sm bg-white/70 px-3 py-2 text-sm text-slate-700">
//                       {message}
//                     </p>
//                   )}

//                   <AnimatePresence initial={false}>
//                     {messages.map((msg) => {
//                       const isMe = msg.senderId === currentUserId;
//                       return (
//                         <motion.div
//                           key={msg.id}
//                           layout
//                           initial="initial"
//                           animate="animate"
//                           variants={messageVariants}
//                           className={`flex ${isMe ? "justify-end" : "justify-start"}`}
//                         >
//                           <div
//                             className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isMe
//                               ? "rounded-br-sm bg-cyan-600 text-white"
//                               : "rounded-bl-sm bg-white/80 text-slate-900"
//                               }`}
//                           >
//                             <MessageBody msg={msg} />
//                           </div>
//                         </motion.div>
//                       );
//                     })}
//                   </AnimatePresence>
//                   <div ref={bottomRef} />
//                 </div>

//                 {/* Attachment previews / uploading indicator */}
//                 {uploading && (
//                   <div className="flex items-center gap-2 border-t border-slate-400/40 px-4 py-2 text-xs text-slate-600">
//                     <Loader2 size={13} className="animate-spin" />
//                     Uploading...
//                   </div>
//                 )}

//                 {/* Input row */}
//                 <form
//                   onSubmit={handleSend}
//                   className="flex items-center gap-1.5 border-t border-slate-400/40 bg-slate-300 px-2.5 py-2.5"
//                 >
//                   <input
//                     type="file"
//                     accept="image/*"
//                     ref={imageInputRef}
//                     onChange={(e) => handleFileUpload(e, "image")}
//                     className="hidden"
//                   />
//                   <input
//                     type="file"
//                     accept="video/*"
//                     ref={videoInputRef}
//                     onChange={(e) => handleFileUpload(e, "video")}
//                     className="hidden"
//                   />
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={(e) => handleFileUpload(e, "file")}
//                     className="hidden"
//                   />

//                   <button
//                     type="button"
//                     disabled={uploading}
//                     onClick={() => imageInputRef.current?.click()}
//                     aria-label="Attach image"
//                     className="shrink-0 rounded-full p-1.5 text-slate-600 transition-colors hover:bg-white/60 disabled:opacity-50"
//                   >
//                     <ImageIcon size={17} />
//                   </button>
//                   <button
//                     type="button"
//                     disabled={uploading}
//                     onClick={() => videoInputRef.current?.click()}
//                     aria-label="Attach video"
//                     className="shrink-0 rounded-full p-1.5 text-slate-600 transition-colors hover:bg-white/60 disabled:opacity-50"
//                   >
//                     <VideoIcon size={17} />
//                   </button>
//                   <button
//                     type="button"
//                     disabled={uploading}
//                     onClick={() => fileInputRef.current?.click()}
//                     aria-label="Attach file"
//                     className="shrink-0 rounded-full p-1.5 text-slate-600 transition-colors hover:bg-white/60 disabled:opacity-50"
//                   >
//                     <Paperclip size={17} />
//                   </button>

//                   <input
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder="Type a message..."
//                     className="min-w-0 flex-1 rounded-full border border-slate-400/50 bg-white/70 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
//                   />

//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     type="submit"
//                     disabled={uploading || !input.trim()}
//                     aria-label="Send message"
//                     className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
//                   >
//                     <Send size={15} />
//                   </motion.button>
//                 </form>
//               </>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Floating toggle button */}
//       <motion.button
//         type="button"
//         onClick={() => setIsOpen((prev) => !prev)}
//         whileHover={{ scale: 1.06 }}
//         whileTap={{ scale: 0.94 }}
//         aria-label={isOpen ? "Close chat" : "Open chat"}
//         aria-expanded={isOpen}
//         className="flex h-14 w-14 items-center justify-center rounded-full border-none bg-cyan-600 text-white shadow-xl transition-colors hover:bg-cyan-500"
//       >
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
//               <MessageCircle size={22} fill="currentColor" className="text-cyan-100" />
//             </motion.span>
//           )}
//         </AnimatePresence>
//       </motion.button>
//     </div>
//   );
// }

// // ---- Subcomponents ----------------------------------------------------------

// function MessageBody({ msg }: { msg: Message }) {
//   if (msg.attachment?.kind === "image") {
//     return (
//       <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer">
//         <img
//           src={msg.attachment.url}
//           alt={msg.attachment.name}
//           className="max-w-45 rounded-lg"
//         />
//       </a>
//     );
//   }

//   if (msg.attachment?.kind === "video") {
//     return (
//       <video
//         src={msg.attachment.url}
//         controls
//         className="max-w-50 rounded-lg"
//       />
//     );
//   }

//   if (msg.attachment?.kind === "file") {
//     return (
//       <a
//         href={msg.attachment.url}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="flex items-center gap-2 underline underline-offset-2"
//       >
//         <FileText size={15} className="shrink-0" />
//         <span className="truncate">{msg.attachment.name}</span>
//         <Download size={13} className="shrink-0" />
//       </a>
//     );
//   }

//   return <p className="wrap-break-words">{msg.text}</p>;
// }