"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  ChevronRight,
  ChevronLeft,
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
  Hourglass,
  Trash2,
  UserPlus,
  AlertTriangle,
  Search,
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
  type: "text" | "image";
  attachmentUrl?: string;
  timestamp: string;
}

interface AdminRoom {
  id: string;
  otherParticipant: {
    userId: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  lastMessage: { text: string; timestamp: string; senderId: string } | null;
  unreadCount: number;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

type AdminMode = "list" | "chat" | "picker";

export default function ChatWidgett({
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

  // ── Image lightbox ──────────────────────────────────────────────────
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // ── Admin state ─────────────────────────────────────────────────────
  const [adminMode, setAdminMode] = useState<AdminMode>("list");
  const [adminRooms, setAdminRooms] = useState<AdminRoom[]>([]);
  const [adminRoomsLoading, setAdminRoomsLoading] = useState(false);
  const [selectedAdminRoomId, setSelectedAdminRoomId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<AdminRoom | null>(null);
  const [deletingRoom, setDeletingRoom] = useState(false);

  const [attention, setAttention] = useState(false);
  const prevUnreadRef = useRef(0);

  const isAdmin = userRole === "admin" || userRole === "Admin" || userRole === "Administrator";
  const isOnChatPage =
    pathname?.includes("/Support/user") ||
    pathname?.includes("/Support/admin") ||
    false;

  // ── Init ────────────────────────────────────────────────────────────
  useEffect(() => {
    const authToken = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user");

    if (!authToken && !userData) {
      let tempId = localStorage.getItem("guest_id");
      if (!tempId) {
        tempId = `guest_${crypto.randomUUID()}`;
        localStorage.setItem("guest_id", tempId);
      }
      setGuestId(tempId);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setIsOpen(defaultOpen);

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const authToken = localStorage.getItem("auth_token");

      if (userData && authToken) {
        setUserRole(userData.role || "user");
        setUserName(userData.firstName || userData.username || "User");
      }
    } catch (error) {
      console.error("Error getting user data:", error);
      setUserRole("user");
    } finally {
      setIsLoading(false);
    }
  }, [defaultOpen]);

  // ── Mark as read ────────────────────────────────────────────────────
    useEffect(() => {
    if (isOnChatPage || isOpen) {
      setUnreadCount(0);
      const guestIdFromStorage = localStorage.getItem("guest_id");
      if (guestIdFromStorage) {
        localStorage.setItem(`guest_unread_${guestIdFromStorage}`, "0");
      }

      // Pick the correct room depending on role
      const roomForRead = isAdmin ? selectedAdminRoomId : currentRoomId;
      if (!roomForRead) return;

      const markMessagesAsRead = async () => {
        try {
          const authToken = localStorage.getItem("auth_token");
          if (!authToken) return;

          await fetch(`/api/chats/mark-read`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ roomId: roomForRead }),
          });
        } catch (error) {
          console.error("[ChatWidgett] messages not read:", error);
        }
      };

      markMessagesAsRead();
    }
  }, [isOnChatPage, isOpen, currentRoomId, isAdmin, selectedAdminRoomId]);
  // useEffect(() => {
  //   if (isOnChatPage || isOpen) {
  //     setUnreadCount(0);
  //     const guestIdFromStorage = localStorage.getItem("guest_id");
  //     if (guestIdFromStorage) {
  //       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, "0");
  //     }

  //     const markMessagesAsRead = async () => {
  //       try {
  //         const authToken = localStorage.getItem("auth_token");
  //         if (!authToken) return;
  //         if (!currentRoomId) return;

  //         await fetch(`/api/chats/mark-read`, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${authToken}`,
  //           },
  //           body: JSON.stringify({ roomId: currentRoomId }),
  //         });
  //       } catch (error) {
  //         console.error("[ChatWidgett] messages not read:", error);
  //       }
  //     };

  //     markMessagesAsRead();
  //   }
  // }, [isOnChatPage, isOpen, currentRoomId]);

  // ── Unread polling ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const fetchUnreadCount = async () => {
      try {
        const authToken = localStorage.getItem("auth_token");
        const guestIdFromStorage = localStorage.getItem("guest_id");

        if (!authToken && !guestIdFromStorage) {
          setUnreadCount(0);
          return;
        }
        if (isOnChatPage) {
          setUnreadCount(0);
          return;
        }
        if (!authToken && guestIdFromStorage) {
          const storedUnread = localStorage.getItem(
            `guest_unread_${guestIdFromStorage}`
          );
          setUnreadCount(storedUnread ? parseInt(storedUnread) : 0);
          return;
        }
        if (authToken) {
          const res = await fetch("/api/user/unread", {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUnreadCount(data.data?.totalUnread || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, isOpen ? 5000 : 3000);
    return () => clearInterval(interval);
  }, [mounted, isOnChatPage, isOpen]);

  // ── Attention animation ─────────────────────────────────────────────
  useEffect(() => {
    const grew = unreadCount > prevUnreadRef.current;
    prevUnreadRef.current = unreadCount;
    if (!grew || unreadCount === 0 || isOpen || isOnChatPage) return;

    setAttention(true);
    const t = setTimeout(() => setAttention(false), 1200);
    return () => clearTimeout(t);
  }, [unreadCount, isOpen, isOnChatPage]);

  // ── Admin rooms ─────────────────────────────────────────────────────
  const fetchAdminRooms = useCallback(async () => {
    if (!isAdmin) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setAdminRoomsLoading(true);
    try {
      const res = await fetch("/api/chats/admin/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAdminRooms(data.data);
      }
    } catch (error) {
      console.error("[ChatWidgett] admin rooms fetch failed:", error);
    } finally {
      setAdminRoomsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isOpen || !isAdmin) return;
    if (adminMode !== "list") return;
    fetchAdminRooms();
    const interval = setInterval(fetchAdminRooms, 5000);
    return () => clearInterval(interval);
  }, [isOpen, isAdmin, adminMode, fetchAdminRooms]);

  // ── All users (for picker) ──────────────────────────────────────────
  const fetchAllUsers = useCallback(async () => {
    if (!isAdmin) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setAllUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = data.data || data.users || [];
      const filtered = list.filter(
        (u: any) =>
          u.role !== "admin" &&
          u.isActive !== false
      );
      setAllUsers(filtered);
    } catch (error) {
      console.error("[ChatWidgett] all users fetch failed:", error);
    } finally {
      setAllUsersLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isOpen || !isAdmin || adminMode !== "picker") return;
    fetchAllUsers();
  }, [isOpen, isAdmin, adminMode, fetchAllUsers]);

  // ── User: fetch room on open ────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isAdmin) {
      const getRoom = async () => {
        try {
          const token = localStorage.getItem("auth_token");
          const body = token ? {} : { guestId };

          const res = await fetch("/api/chats/rooms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(body),
          });

          const data = await res.json();
          if (data.success) {
            setCurrentRoomId(data.data.id);

            const msgRes = await fetch(`/api/chats/messages/${data.data.id}`, {
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "X-Guest-ID": guestId || "",
              },
            });
            const msgData = await msgRes.json();
            if (msgData.success) {
              setMessages(msgData.data || []);
              const lastMsg = msgData.data?.[msgData.data.length - 1];
              if (lastMsg && lastMsg.senderRole === "admin") {
                setPendingReply(false);
              } else if (lastMsg && lastMsg.senderRole !== "admin") {
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
  }, [isOpen, guestId, isAdmin]);

  // ── User: poll messages ─────────────────────────────────────────────
  // FIX: always setMessages when the server responds successfully (was
  // `if (newMessages.length > messages.length)` — silently dropped updates
  // when arrays had the same length but different content). Also dropped
  // `messages.length` from deps — that was tearing down and restarting
  // the poll interval on every message, losing up to 5 seconds each time.
  // Poll interval shortened to 3s.
  useEffect(() => {
    if (!isOpen || !currentRoomId || isAdmin) return;
    const guestIdFromStorage = localStorage.getItem("guest_id");
    if (!guestIdFromStorage && !localStorage.getItem("auth_token")) return;

    const pollForNewMessages = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "X-Guest-ID": guestIdFromStorage || "",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setMessages(data.data);
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    };

    const interval = setInterval(pollForNewMessages, 3000);
    return () => clearInterval(interval);
  }, [currentRoomId, isOpen, isAdmin]);

  // ── Admin chat: poll selected room ──────────────────────────────────
  useEffect(() => {
    if (!isOpen || !isAdmin || adminMode !== "chat" || !selectedAdminRoomId)
      return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`/api/chats/messages/${selectedAdminRoomId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMessages(data.data || []);
          }
        }
      } catch (error) {
        console.error("[ChatWidgett] admin messages fetch failed:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen, isAdmin, adminMode, selectedAdminRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingReply, adminMode]);

  // ── Helpers ─────────────────────────────────────────────────────────
  const getSupportPath = () => (isAdmin ? "/Support/admin" : "/Support/user");
  const getRoleDisplay = () => (isAdmin ? "Admin Support" : "User Support");
  const getRoleIcon = () =>
    isAdmin ? (
      <ShieldCheck className="h-4 w-4 text-cyan-600" />
    ) : (
      <User className="h-4 w-4 text-cyan-600" />
    );

  const getPersonalizedMessage = () => {
    if (userName && userName !== "User") {
      return `Hi ${userName}! 👋 How can we help you today?`;
    }
    return message;
  };

  const handleStartChat = () => {
    router.push(getSupportPath());
    setUnreadCount(0);
    const g = localStorage.getItem("guest_id");
    if (g) localStorage.setItem(`guest_unread_${g}`, "0");
  };

  const currentUserId = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")._id || guestId;
    } catch {
      return guestId;
    }
  })();

  // ── Send message ────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    const targetRoom = isAdmin ? selectedAdminRoomId : currentRoomId;
    if (!inputMessage.trim() || !targetRoom || sendingMessage) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("auth_token");
    const g = localStorage.getItem("guest_id");

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        senderId: user._id || g || "guest",
        message: inputMessage,
        type: "text",
        timestamp: new Date().toISOString(),
      },
    ]);
    const sentText = inputMessage;
    setInputMessage("");
    setSendingMessage(true);
    if (!isAdmin) setPendingReply(true);

    setUnreadCount(0);
    if (g) localStorage.setItem(`guest_unread_${g}`, "0");

    try {
      const res = await fetch(`/api/chats/messages/${targetRoom}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          "X-Guest-ID": g || "",
        },
        body: JSON.stringify({ message: sentText, type: "text" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? data.data : m))
          );
          if (isAdmin) fetchAdminRooms();
        }
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSendingMessage(false);
    }
  };

  // ── Image upload ────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetRoom = isAdmin ? selectedAdminRoomId : currentRoomId;
    if (!file || !targetRoom) return;

    const token = localStorage.getItem("auth_token");
    const g = localStorage.getItem("guest_id");
    setSendingMessage(true);
    if (!isAdmin) setPendingReply(true);
    setUnreadCount(0);
    if (g) localStorage.setItem(`guest_unread_${g}`, "0");

    try {
      const compressed = await compressImage(file, 100, 400);
      const res = await fetch(`/api/chats/messages/${targetRoom}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          "X-Guest-ID": g || "",
        },
        body: JSON.stringify({ type: "image", attachmentUrl: compressed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages((prev) => [...prev, data.data]);
          if (isAdmin) fetchAdminRooms();
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setSendingMessage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Admin: open a room's chat view ──────────────────────────────────
  const openAdminChat = (roomId: string) => {
    setSelectedAdminRoomId(roomId);
    setAdminMode("chat");
    setMessages([]);
  };

  const backToAdminList = () => {
    setAdminMode("list");
    setSelectedAdminRoomId(null);
    setMessages([]);
    fetchAdminRooms();
  };

  // ── Admin: start a chat with a specific user ────────────────────────
  const handlePickUser = async (targetUserId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      const res = await fetch("/api/chats/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        setUserSearch("");
        openAdminChat(data.data.id);
      }
    } catch (error) {
      console.error("[ChatWidgett] pick user failed:", error);
    }
  };

  // ── Admin: delete a chat room ───────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!confirmDeleteRoom) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setDeletingRoom(true);
    try {
      const res = await fetch(`/api/chats/rooms/${confirmDeleteRoom.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAdminRooms((prev) => prev.filter((r) => r.id !== confirmDeleteRoom.id));
        setConfirmDeleteRoom(null);
      }
    } catch (error) {
      console.error("[ChatWidgett] delete room failed:", error);
    } finally {
      setDeletingRoom(false);
    }
  };

  if (!mounted) return null;

  const activeAdminRoom = adminRooms.find((r) => r.id === selectedAdminRoomId);

  const filteredUsers = allUsers.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.firstName || "").toLowerCase().includes(q) ||
      (u.lastName || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

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
            className="w-[88vw] max-w-sm sm:w-80 flex flex-col max-h-[calc(100vh-8rem)] sm:max-h-[600px] rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#D6F9FE] to-[#E8FBFF] shadow-2xl backdrop-blur-xl border border-white/30 overflow-hidden relative"
          >
            {/* ── Header ───────────────────────────────────────── */}
            <div className="shrink-0 px-5 pt-5 pb-3">
              {isAdmin && adminMode === "chat" && activeAdminRoom ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={backToAdminList}
                    aria-label="Back to list"
                    className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {/* Clickable avatar — opens full-size lightbox */}
                  <button
                    type="button"
                    onClick={() => {
                      if (activeAdminRoom.otherParticipant.avatar) {
                        setExpandedImage(activeAdminRoom.otherParticipant.avatar);
                      }
                    }}
                    className="relative shrink-0 rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label={`View ${activeAdminRoom.otherParticipant.name} full image`}
                    title={activeAdminRoom.otherParticipant.avatar ? "Click to enlarge" : undefined}
                  >
                    {activeAdminRoom.otherParticipant.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeAdminRoom.otherParticipant.avatar}
                        alt={activeAdminRoom.otherParticipant.name}
                        className="h-9 w-9 rounded-full object-cover border border-white/60"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-cyan-500/30 flex items-center justify-center border border-white/60">
                        <span className="text-xs font-bold text-cyan-900">
                          {activeAdminRoom.otherParticipant.name
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-cyan-900 text-sm">
                      {activeAdminRoom.otherParticipant.name}
                    </h3>
                    <p className="truncate text-[10px] text-cyan-600">
                      {activeAdminRoom.otherParticipant.email || "No email"}
                    </p>
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
              ) : isAdmin && adminMode === "picker" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserSearch("");
                      setAdminMode("list");
                    }}
                    aria-label="Back to list"
                    className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-cyan-900 text-sm">
                      Start a new chat
                    </h3>
                    <p className="text-[10px] text-cyan-600">
                      Pick a user to message
                    </p>
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
              ) : isAdmin ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-cyan-900 text-lg">Activity</h3>
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-800">
                      {adminRooms.length}{" "}
                      {adminRooms.length === 1 ? "user" : "users"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAdminMode("picker")}
                      aria-label="Start new chat"
                      className="rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
                      title="Start a new chat"
                    >
                      <UserPlus size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      aria-label="Close chat"
                      className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-11 w-11 rounded-full bg-[#C4F8FD] flex items-center justify-center shadow-lg">
                        <Headphones className="h-5 w-5 text-cyan-700" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-cyan-900 text-base">
                          {supportName}
                        </h3>
                        {getRoleIcon()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-cyan-600" />
                        <span className="text-[11px] text-cyan-600">
                          {supportHours}
                        </span>
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
              )}
            </div>

            {/* ── Middle ───────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-2">
              {isAdmin && adminMode === "picker" ? (
                <>
                  <div className="mb-2 flex items-center gap-2 rounded-xl bg-white/60 border border-white/40 px-3 py-2">
                    <Search size={14} className="text-cyan-600 shrink-0" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users…"
                      className="flex-1 min-w-0 bg-transparent text-sm text-cyan-900 placeholder:text-cyan-500 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  {allUsersLoading && allUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
                      <span className="text-[11px] text-cyan-600">
                        Loading users…
                      </span>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-1">
                      <User size={28} className="text-cyan-400/60" />
                      <span className="text-sm text-cyan-700 font-medium">
                        No users found
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 py-1">
                      {filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handlePickUser(u.id)}
                          className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-white/50"
                        >
                          <div className="h-9 w-9 shrink-0 rounded-full bg-cyan-500/30 flex items-center justify-center border border-white/60">
                            <span className="text-xs font-bold text-cyan-900">
                              {(u.firstName || u.username || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-cyan-900">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="truncate text-[11px] text-cyan-600">
                              {u.email}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-cyan-600/60 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : isAdmin && adminMode === "list" ? (
                <>
                  {adminRoomsLoading && adminRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
                      <span className="text-[11px] text-cyan-600">
                        Loading conversations…
                      </span>
                    </div>
                  ) : adminRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-1">
                      <MessageCircle size={28} className="text-cyan-400/60" />
                      <span className="text-sm text-cyan-700 font-medium">
                        No conversations yet
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdminMode("picker")}
                        className="mt-2 rounded-full bg-cyan-500/20 px-3 py-1.5 text-[11px] font-bold text-cyan-800 hover:bg-cyan-500/30"
                      >
                        Start one
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 py-1">
                      {adminRooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-white/50"
                        >
                          <button
                            type="button"
                            onClick={() => openAdminChat(room.id)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          >
                            <div className="relative shrink-0">
                              {room.otherParticipant.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={room.otherParticipant.avatar}
                                  alt={room.otherParticipant.name}
                                  className="h-10 w-10 rounded-full object-cover border border-white/60"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-cyan-500/30 flex items-center justify-center border border-white/60">
                                  <span className="text-xs font-bold text-cyan-900">
                                    {room.otherParticipant.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}
                              {room.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] rounded-full bg-red-500 px-1 shadow">
                                  <span className="text-[9px] font-bold text-white leading-none">
                                    {room.unreadCount > 9
                                      ? "9+"
                                      : room.unreadCount}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-cyan-900">
                                  {room.otherParticipant.name}
                                </p>
                                {room.lastMessage?.timestamp && (
                                  <span className="shrink-0 text-[10px] text-cyan-600/80">
                                    {new Date(
                                      room.lastMessage.timestamp
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`truncate text-[11px] mt-0.5 ${
                                  room.unreadCount > 0
                                    ? "text-cyan-900 font-medium"
                                    : "text-cyan-600"
                                }`}
                              >
                                {room.lastMessage?.text
                                  ? room.lastMessage.text
                                  : "No messages yet"}
                              </p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteRoom(room)}
                            aria-label={`Delete chat with ${room.otherParticipant.name}`}
                            className="shrink-0 rounded-full p-1.5 text-cyan-700/60 hover:bg-red-500/15 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {!isAdmin && !currentRoomId && (
                    <div className="mt-1">
                      <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/40">
                        <p className="text-sm leading-relaxed text-cyan-800">
                          {getPersonalizedMessage()}
                        </p>
                      </div>
                    </div>
                  )}

                  {(isAdmin ? selectedAdminRoomId : currentRoomId) && (
                    <div className="flex flex-col gap-2 py-2">
                      {messages.length === 0 && (
                        <p className="text-center text-xs text-cyan-600 py-6">
                          {isAdmin
                            ? "No messages in this conversation yet."
                            : "Start the conversation!"}
                        </p>
                      )}
                      {messages.map((msg) => {
                        const isMine = msg.senderId === currentUserId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                                isMine
                                  ? "bg-cyan-600 text-white"
                                  : "bg-white text-cyan-900"
                              }`}
                            >
                              {msg.type === "image" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    msg.attachmentUrl &&
                                    setExpandedImage(msg.attachmentUrl)
                                  }
                                  className="block cursor-zoom-in rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                  aria-label="Expand image"
                                  title="Click to enlarge"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={msg.attachmentUrl}
                                    alt="Shared"
                                    className="max-w-full max-h-40 rounded-lg object-cover"
                                  />
                                </button>
                              ) : (
                                <p className="text-xs whitespace-pre-wrap break-words">
                                  {msg.message}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {pendingReply && !isAdmin && (
                        <div className="flex justify-center">
                          <div className="flex items-center gap-1.5 bg-amber-100/80 text-amber-700 rounded-full px-3 py-1 text-[10px] font-medium">
                            <Hourglass size={12} />
                            Your message has been sent. Please wait for a reply.
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Footer ───────────────────────────────────────── */}
            <div className="shrink-0 px-5 pt-2 pb-4 border-t border-white/40 bg-white/20">
              {(isAdmin && adminMode === "chat" && selectedAdminRoomId) ||
              (!isAdmin && currentRoomId) ? (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full bg-white/40 hover:bg-white/60 transition-colors shrink-0"
                      aria-label="Upload image"
                    >
                      <Paperclip size={16} className="text-cyan-700" />
                    </button>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type a message..."
                      className="flex-1 min-w-0 bg-white/60 rounded-xl px-3 py-2 text-sm text-cyan-900 placeholder:text-cyan-500 focus:outline-none border border-white/40"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !inputMessage.trim()}
                      className="p-2 rounded-full bg-cyan-600 text-white disabled:opacity-50 shrink-0"
                      aria-label="Send message"
                    >
                      {sendingMessage ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>

                  {!isAdmin && (
                    <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-cyan-700/80">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        Secure
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-cyan-500" />
                        Encrypted
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {responseTime}
                      </span>
                    </div>
                  )}
                </>
              ) : isAdmin ? (
                <div className="flex items-center justify-center gap-1.5 py-1">
                  <Sparkles className="h-3 w-3 text-cyan-500" />
                  <span className="text-[10px] font-medium text-cyan-700">
                    {adminMode === "picker"
                      ? "Tap a user to open their conversation"
                      : "Tap a user to open · + to start new"}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center gap-3 text-[10px] text-cyan-700/80">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      Secure
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-cyan-500" />
                      Encrypted
                    </span>
                  </div>
                  <button
                    onClick={handleStartChat}
                    className="group w-full rounded-xl bg-white/60 px-4 py-2.5 text-sm font-semibold text-cyan-700 shadow-md transition-all hover:bg-white/80 flex items-center justify-center gap-2"
                  >
                    <span>Chat with Ashie</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Delete confirmation overlay ──────────────────── */}
            <AnimatePresence>
              {confirmDeleteRoom && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                  onClick={() => !deletingRoom && setConfirmDeleteRoom(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 10 }}
                    className="w-full max-w-[260px] rounded-2xl bg-white p-5 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={18} className="text-red-500" />
                      <h4 className="text-sm font-bold text-cyan-900">
                        Delete conversation?
                      </h4>
                    </div>
                    <p className="text-xs text-cyan-700 leading-relaxed mb-4">
                      This permanently deletes the chat with{" "}
                      <strong>{confirmDeleteRoom.otherParticipant.name}</strong>.
                      This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteRoom(null)}
                        disabled={deletingRoom}
                        className="flex-1 rounded-lg bg-white border border-cyan-200 px-3 py-2 text-xs font-bold text-cyan-700 hover:bg-cyan-50 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        disabled={deletingRoom}
                        className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {deletingRoom ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Delete
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
        {!isOpen && unreadCount > 0 && !isOnChatPage && (
          <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
        )}

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
              <X size={22} className="text-cyan-600" strokeWidth={2.5} />
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
              <MessageCircle size={22} className="text-cyan-600" fill="currentColor" />

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
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </motion.span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Image lightbox (shared for chat images + admin avatar) ──── */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setExpandedImage(null)}
          >
            <button
              type="button"
              onClick={() => setExpandedImage(null)}
              aria-label="Close image"
              className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
            >
              <X size={22} />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={expandedImage}
              alt="Expanded"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   MessageCircle,
//   X,
//   ChevronRight,
//   ChevronLeft,
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
//   Hourglass,
//   Trash2,
//   UserPlus,
//   AlertTriangle,
//   Search,
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
//   type: "text" | "image";
//   attachmentUrl?: string;
//   timestamp: string;
// }

// interface AdminRoom {
//   id: string;
//   otherParticipant: {
//     userId: string;
//     name: string;
//     email: string;
//     avatar: string | null;
//   };
//   lastMessage: { text: string; timestamp: string; senderId: string } | null;
//   unreadCount: number;
//   updatedAt: string;
// }

// interface AdminUser {
//   id: string;
//   firstName: string;
//   lastName: string;
//   username: string;
//   email: string;
//   role: string;
//   isActive: boolean;
// }

// type AdminMode = "list" | "chat" | "picker";

// export default function ChatWidgett({
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

//   const [guestId, setGuestId] = useState<string | null>(null);

//   // ── Admin state ─────────────────────────────────────────────────────
//   const [adminMode, setAdminMode] = useState<AdminMode>("list");
//   const [adminRooms, setAdminRooms] = useState<AdminRoom[]>([]);
//   const [adminRoomsLoading, setAdminRoomsLoading] = useState(false);
//   const [selectedAdminRoomId, setSelectedAdminRoomId] = useState<string | null>(null);
//   const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
//   const [allUsersLoading, setAllUsersLoading] = useState(false);
//   const [userSearch, setUserSearch] = useState("");
//   const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<AdminRoom | null>(null);
//   const [deletingRoom, setDeletingRoom] = useState(false);

//   const [attention, setAttention] = useState(false);
//   const prevUnreadRef = useRef(0);

//   const isAdmin = userRole === "admin" || userRole === "Admin" || userRole === "Administrator";
//   const isOnChatPage =
//     pathname?.includes("/Support/user") ||
//     pathname?.includes("/Support/admin") ||
//     false;

//   // ── Init ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const authToken = localStorage.getItem("auth_token");
//     const userData = localStorage.getItem("user");

//     if (!authToken && !userData) {
//       let tempId = localStorage.getItem("guest_id");
//       if (!tempId) {
//         tempId = `guest_${crypto.randomUUID()}`;
//         localStorage.setItem("guest_id", tempId);
//       }
//       setGuestId(tempId);
//     }
//   }, []);

//   useEffect(() => {
//     setMounted(true);
//     setIsOpen(defaultOpen);

//     try {
//       const userData = JSON.parse(localStorage.getItem("user") || "{}");
//       const authToken = localStorage.getItem("auth_token");

//       if (userData && authToken) {
//         setUserRole(userData.role || "user");
//         setUserName(userData.firstName || userData.username || "User");
//       }
//     } catch (error) {
//       console.error("Error getting user data:", error);
//       setUserRole("user");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [defaultOpen]);

//   // ── Mark as read ────────────────────────────────────────────────────
//   useEffect(() => {
//     if (isOnChatPage || isOpen) {
//       setUnreadCount(0);
//       const guestIdFromStorage = localStorage.getItem("guest_id");
//       if (guestIdFromStorage) {
//         localStorage.setItem(`guest_unread_${guestIdFromStorage}`, "0");
//       }

//       const markMessagesAsRead = async () => {
//         try {
//           const authToken = localStorage.getItem("auth_token");
//           if (!authToken) return;
//           if (!currentRoomId) return;

//           await fetch(`/api/chats/mark-read`, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${authToken}`,
//             },
//             body: JSON.stringify({ roomId: currentRoomId }),
//           });
//         } catch (error) {
//           console.error("[ChatWidgett] messages not read:", error);
//         }
//       };

//       markMessagesAsRead();
//     }
//   }, [isOnChatPage, isOpen, currentRoomId]);

//   // ── Unread polling ──────────────────────────────────────────────────
//   useEffect(() => {
//     if (!mounted) return;

//     const fetchUnreadCount = async () => {
//       try {
//         const authToken = localStorage.getItem("auth_token");
//         const guestIdFromStorage = localStorage.getItem("guest_id");

//         if (!authToken && !guestIdFromStorage) {
//           setUnreadCount(0);
//           return;
//         }
//         if (isOnChatPage) {
//           setUnreadCount(0);
//           return;
//         }
//         if (!authToken && guestIdFromStorage) {
//           const storedUnread = localStorage.getItem(
//             `guest_unread_${guestIdFromStorage}`
//           );
//           setUnreadCount(storedUnread ? parseInt(storedUnread) : 0);
//           return;
//         }
//         if (authToken) {
//           const res = await fetch("/api/user/unread", {
//             headers: { Authorization: `Bearer ${authToken}` },
//           });
//           if (res.ok) {
//             const data = await res.json();
//             setUnreadCount(data.data?.totalUnread || 0);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching unread count:", error);
//       }
//     };

//     fetchUnreadCount();
//     const interval = setInterval(fetchUnreadCount, isOpen ? 5000 : 3000);
//     return () => clearInterval(interval);
//   }, [mounted, isOnChatPage, isOpen]);

//   // ── Attention animation ─────────────────────────────────────────────
//   useEffect(() => {
//     const grew = unreadCount > prevUnreadRef.current;
//     prevUnreadRef.current = unreadCount;
//     if (!grew || unreadCount === 0 || isOpen || isOnChatPage) return;

//     setAttention(true);
//     const t = setTimeout(() => setAttention(false), 1200);
//     return () => clearTimeout(t);
//   }, [unreadCount, isOpen, isOnChatPage]);

//   // ── Admin rooms ─────────────────────────────────────────────────────
//   const fetchAdminRooms = useCallback(async () => {
//     if (!isAdmin) return;
//     const token = localStorage.getItem("auth_token");
//     if (!token) return;

//     setAdminRoomsLoading(true);
//     try {
//       const res = await fetch("/api/chats/admin/rooms", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       if (data.success && Array.isArray(data.data)) {
//         setAdminRooms(data.data);
//       }
//     } catch (error) {
//       console.error("[ChatWidgett] admin rooms fetch failed:", error);
//     } finally {
//       setAdminRoomsLoading(false);
//     }
//   }, [isAdmin]);

//   useEffect(() => {
//     if (!isOpen || !isAdmin) return;
//     if (adminMode !== "list") return;
//     fetchAdminRooms();
//     const interval = setInterval(fetchAdminRooms, 5000);
//     return () => clearInterval(interval);
//   }, [isOpen, isAdmin, adminMode, fetchAdminRooms]);

//   // ── All users (for picker) ──────────────────────────────────────────
//   const fetchAllUsers = useCallback(async () => {
//     if (!isAdmin) return;
//     const token = localStorage.getItem("auth_token");
//     if (!token) return;

//     setAllUsersLoading(true);
//     try {
//       const res = await fetch("/api/admin/users", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = data.data || data.users || [];
//       // filter to non-admin, active
//       const filtered = list.filter(
//         (u: any) =>
//           u.role !== "admin" &&
//           u.isActive !== false
//       );
//       setAllUsers(filtered);
//     } catch (error) {
//       console.error("[ChatWidgett] all users fetch failed:", error);
//     } finally {
//       setAllUsersLoading(false);
//     }
//   }, [isAdmin]);

//   useEffect(() => {
//     if (!isOpen || !isAdmin || adminMode !== "picker") return;
//     fetchAllUsers();
//   }, [isOpen, isAdmin, adminMode, fetchAllUsers]);

//   // ── User: fetch room on open ────────────────────────────────────────
//   useEffect(() => {
//     if (isOpen && !isAdmin) {
//       const getRoom = async () => {
//         try {
//           const token = localStorage.getItem("auth_token");
//           const body = token ? {} : { guestId };

//           const res = await fetch("/api/chats/rooms", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: token ? `Bearer ${token}` : "",
//             },
//             body: JSON.stringify(body),
//           });

//           const data = await res.json();
//           if (data.success) {
//             setCurrentRoomId(data.data.id);

//             const msgRes = await fetch(`/api/chats/messages/${data.data.id}`, {
//               headers: {
//                 Authorization: token ? `Bearer ${token}` : "",
//                 "X-Guest-ID": guestId || "",
//               },
//             });
//             const msgData = await msgRes.json();
//             if (msgData.success) {
//               setMessages(msgData.data || []);
//               const lastMsg = msgData.data?.[msgData.data.length - 1];
//               if (lastMsg && lastMsg.senderRole === "admin") {
//                 setPendingReply(false);
//               } else if (lastMsg && lastMsg.senderRole !== "admin") {
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
//   }, [isOpen, guestId, isAdmin]);

//   // ── User: poll messages ─────────────────────────────────────────────
//   useEffect(() => {
//     if (!isOpen || !currentRoomId || isAdmin) return;
//     const guestIdFromStorage = localStorage.getItem("guest_id");
//     if (!guestIdFromStorage && !localStorage.getItem("auth_token")) return;

//     const pollForNewMessages = async () => {
//       try {
//         const token = localStorage.getItem("auth_token");
//         const res = await fetch(`/api/chats/messages/${currentRoomId}`, {
//           headers: {
//             Authorization: token ? `Bearer ${token}` : "",
//             "X-Guest-ID": guestIdFromStorage || "",
//           },
//         });
//         if (res.ok) {
//           const data = await res.json();
//           if (data.success) {
//             const newMessages = data.data || [];
//             if (newMessages.length > messages.length) {
//               setMessages(newMessages);
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error polling messages:", error);
//       }
//     };

//     const interval = setInterval(pollForNewMessages, 5000);
//     return () => clearInterval(interval);
//   }, [currentRoomId, isOpen, messages.length, isAdmin]);

//   // ── Admin chat: poll selected room ──────────────────────────────────
//   useEffect(() => {
//     if (!isOpen || !isAdmin || adminMode !== "chat" || !selectedAdminRoomId)
//       return;

//     const fetchMessages = async () => {
//       try {
//         const token = localStorage.getItem("auth_token");
//         const res = await fetch(`/api/chats/messages/${selectedAdminRoomId}`, {
//           headers: { Authorization: token ? `Bearer ${token}` : "" },
//         });
//         if (res.ok) {
//           const data = await res.json();
//           if (data.success) {
//             setMessages(data.data || []);
//           }
//         }
//       } catch (error) {
//         console.error("[ChatWidgett] admin messages fetch failed:", error);
//       }
//     };

//     fetchMessages();
//     const interval = setInterval(fetchMessages, 3000);
//     return () => clearInterval(interval);
//   }, [isOpen, isAdmin, adminMode, selectedAdminRoomId]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, pendingReply, adminMode]);

//   // ── Helpers ─────────────────────────────────────────────────────────
//   const getSupportPath = () => (isAdmin ? "/Support/admin" : "/Support/user");
//   const getRoleDisplay = () => (isAdmin ? "Admin Support" : "User Support");
//   const getRoleIcon = () =>
//     isAdmin ? (
//       <ShieldCheck className="h-4 w-4 text-cyan-600" />
//     ) : (
//       <User className="h-4 w-4 text-cyan-600" />
//     );

//   const getPersonalizedMessage = () => {
//     if (userName && userName !== "User") {
//       return `Hi ${userName}! 👋 How can we help you today?`;
//     }
//     return message;
//   };

//   const handleStartChat = () => {
//     router.push(getSupportPath());
//     setUnreadCount(0);
//     const g = localStorage.getItem("guest_id");
//     if (g) localStorage.setItem(`guest_unread_${g}`, "0");
//   };

//   const currentUserId = (() => {
//     try {
//       return JSON.parse(localStorage.getItem("user") || "{}")._id || guestId;
//     } catch {
//       return guestId;
//     }
//   })();

//   // ── Send message ────────────────────────────────────────────────────
//   const handleSendMessage = async () => {
//     const targetRoom = isAdmin ? selectedAdminRoomId : currentRoomId;
//     if (!inputMessage.trim() || !targetRoom || sendingMessage) return;

//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const token = localStorage.getItem("auth_token");
//     const g = localStorage.getItem("guest_id");

//     const tempId = `temp-${Date.now()}`;
//     setMessages((prev) => [
//       ...prev,
//       {
//         id: tempId,
//         senderId: user._id || g || "guest",
//         message: inputMessage,
//         type: "text",
//         timestamp: new Date().toISOString(),
//       },
//     ]);
//     const sentText = inputMessage;
//     setInputMessage("");
//     setSendingMessage(true);
//     if (!isAdmin) setPendingReply(true);

//     setUnreadCount(0);
//     if (g) localStorage.setItem(`guest_unread_${g}`, "0");

//     try {
//       const res = await fetch(`/api/chats/messages/${targetRoom}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//           "X-Guest-ID": g || "",
//         },
//         body: JSON.stringify({ message: sentText, type: "text" }),
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data.success) {
//           setMessages((prev) =>
//             prev.map((m) => (m.id === tempId ? data.data : m))
//           );
//           if (isAdmin) fetchAdminRooms();
//         }
//       } else {
//         setMessages((prev) => prev.filter((m) => m.id !== tempId));
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setMessages((prev) => prev.filter((m) => m.id !== tempId));
//     } finally {
//       setSendingMessage(false);
//     }
//   };

//   // ── Image upload ────────────────────────────────────────────────────
//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     const targetRoom = isAdmin ? selectedAdminRoomId : currentRoomId;
//     if (!file || !targetRoom) return;

//     const token = localStorage.getItem("auth_token");
//     const g = localStorage.getItem("guest_id");
//     setSendingMessage(true);
//     if (!isAdmin) setPendingReply(true);
//     setUnreadCount(0);
//     if (g) localStorage.setItem(`guest_unread_${g}`, "0");

//     try {
//       const compressed = await compressImage(file, 100, 400);
//       const res = await fetch(`/api/chats/messages/${targetRoom}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//           "X-Guest-ID": g || "",
//         },
//         body: JSON.stringify({ type: "image", attachmentUrl: compressed }),
//       });
//       if (res.ok) {
//         const data = await res.json();
//         if (data.success) {
//           setMessages((prev) => [...prev, data.data]);
//           if (isAdmin) fetchAdminRooms();
//         }
//       }
//     } catch (error) {
//       console.error("Error uploading image:", error);
//     } finally {
//       setSendingMessage(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   // ── Admin: open a room's chat view ──────────────────────────────────
//   const openAdminChat = (roomId: string) => {
//     setSelectedAdminRoomId(roomId);
//     setAdminMode("chat");
//     setMessages([]);
//   };

//   const backToAdminList = () => {
//     setAdminMode("list");
//     setSelectedAdminRoomId(null);
//     setMessages([]);
//     fetchAdminRooms();
//   };

//   // ── Admin: start a chat with a specific user ────────────────────────
//   const handlePickUser = async (targetUserId: string) => {
//     const token = localStorage.getItem("auth_token");
//     if (!token) return;
//     try {
//       const res = await fetch("/api/chats/rooms", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ targetUserId }),
//       });
//       const data = await res.json();
//       if (data.success && data.data?.id) {
//         setUserSearch("");
//         openAdminChat(data.data.id);
//       }
//     } catch (error) {
//       console.error("[ChatWidgett] pick user failed:", error);
//     }
//   };

//   // ── Admin: delete a chat room ───────────────────────────────────────
//   const handleConfirmDelete = async () => {
//     if (!confirmDeleteRoom) return;
//     const token = localStorage.getItem("auth_token");
//     if (!token) return;

//     setDeletingRoom(true);
//     try {
//       const res = await fetch(`/api/chats/rooms/${confirmDeleteRoom.id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         setAdminRooms((prev) => prev.filter((r) => r.id !== confirmDeleteRoom.id));
//         setConfirmDeleteRoom(null);
//       }
//     } catch (error) {
//       console.error("[ChatWidgett] delete room failed:", error);
//     } finally {
//       setDeletingRoom(false);
//     }
//   };

//   if (!mounted) return null;

//   const activeAdminRoom = adminRooms.find((r) => r.id === selectedAdminRoomId);

//   const filteredUsers = allUsers.filter((u) => {
//     if (!userSearch.trim()) return true;
//     const q = userSearch.toLowerCase();
//     return (
//       (u.firstName || "").toLowerCase().includes(q) ||
//       (u.lastName || "").toLowerCase().includes(q) ||
//       (u.username || "").toLowerCase().includes(q) ||
//       (u.email || "").toLowerCase().includes(q)
//     );
//   });

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
//             className="w-[88vw] max-w-sm sm:w-80 flex flex-col max-h-[calc(100vh-8rem)] sm:max-h-[600px] rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#D6F9FE] to-[#E8FBFF] shadow-2xl backdrop-blur-xl border border-white/30 overflow-hidden relative"
//           >
//             {/* ── Header ───────────────────────────────────────── */}
//             <div className="shrink-0 px-5 pt-5 pb-3">
//               {isAdmin && adminMode === "chat" && activeAdminRoom ? (
//                 <div className="flex items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={backToAdminList}
//                     aria-label="Back to list"
//                     className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
//                   >
//                     <ChevronLeft size={18} />
//                   </button>
//                   <div className="relative shrink-0">
//                     {activeAdminRoom.otherParticipant.avatar ? (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={activeAdminRoom.otherParticipant.avatar}
//                         alt={activeAdminRoom.otherParticipant.name}
//                         className="h-9 w-9 rounded-full object-cover border border-white/60"
//                       />
//                     ) : (
//                       <div className="h-9 w-9 rounded-full bg-cyan-500/30 flex items-center justify-center border border-white/60">
//                         <span className="text-xs font-bold text-cyan-900">
//                           {activeAdminRoom.otherParticipant.name
//                             .charAt(0)
//                             .toUpperCase()}
//                         </span>
//                       </div>
//                     )}
//                     <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <h3 className="truncate font-bold text-cyan-900 text-sm">
//                       {activeAdminRoom.otherParticipant.name}
//                     </h3>
//                     <p className="truncate text-[10px] text-cyan-600">
//                       {activeAdminRoom.otherParticipant.email || "No email"}
//                     </p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setIsOpen(false)}
//                     aria-label="Close chat"
//                     className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
//                   >
//                     <X size={18} />
//                   </button>
//                 </div>
//               ) : isAdmin && adminMode === "picker" ? (
//                 <div className="flex items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setUserSearch("");
//                       setAdminMode("list");
//                     }}
//                     aria-label="Back to list"
//                     className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
//                   >
//                     <ChevronLeft size={18} />
//                   </button>
//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-bold text-cyan-900 text-sm">
//                       Start a new chat
//                     </h3>
//                     <p className="text-[10px] text-cyan-600">
//                       Pick a user to message
//                     </p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setIsOpen(false)}
//                     aria-label="Close chat"
//                     className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
//                   >
//                     <X size={18} />
//                   </button>
//                 </div>
//               ) : isAdmin ? (
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <h3 className="font-bold text-cyan-900 text-lg">Activity</h3>
//                     <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-800">
//                       {adminRooms.length}{" "}
//                       {adminRooms.length === 1 ? "user" : "users"}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <button
//                       type="button"
//                       onClick={() => setAdminMode("picker")}
//                       aria-label="Start new chat"
//                       className="rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
//                       title="Start a new chat"
//                     >
//                       <UserPlus size={18} />
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setIsOpen(false)}
//                       aria-label="Close chat"
//                       className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
//                     >
//                       <X size={18} />
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="relative">
//                       <div className="h-11 w-11 rounded-full bg-[#C4F8FD] flex items-center justify-center shadow-lg">
//                         <Headphones className="h-5 w-5 text-cyan-700" />
//                       </div>
//                       <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <h3 className="font-bold text-cyan-900 text-base">
//                           {supportName}
//                         </h3>
//                         {getRoleIcon()}
//                       </div>
//                       <div className="flex items-center gap-1.5">
//                         <Clock className="h-3 w-3 text-cyan-600" />
//                         <span className="text-[11px] text-cyan-600">
//                           {supportHours}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setIsOpen(false)}
//                     aria-label="Close chat"
//                     className="shrink-0 rounded-full p-1.5 text-cyan-700 transition-all hover:bg-white/50 hover:text-cyan-900"
//                   >
//                     <X size={18} />
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* ── Middle ───────────────────────────────────────── */}
//             <div className="flex-1 min-h-0 overflow-y-auto px-5 py-2">
//               {isAdmin && adminMode === "picker" ? (
//                 <>
//                   {/* Search */}
//                   <div className="mb-2 flex items-center gap-2 rounded-xl bg-white/60 border border-white/40 px-3 py-2">
//                     <Search size={14} className="text-cyan-600 shrink-0" />
//                     <input
//                       type="text"
//                       value={userSearch}
//                       onChange={(e) => setUserSearch(e.target.value)}
//                       placeholder="Search users…"
//                       className="flex-1 min-w-0 bg-transparent text-sm text-cyan-900 placeholder:text-cyan-500 focus:outline-none"
//                       autoFocus
//                     />
//                   </div>

//                   {allUsersLoading && allUsers.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-10 gap-2">
//                       <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
//                       <span className="text-[11px] text-cyan-600">
//                         Loading users…
//                       </span>
//                     </div>
//                   ) : filteredUsers.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-10 gap-1">
//                       <User size={28} className="text-cyan-400/60" />
//                       <span className="text-sm text-cyan-700 font-medium">
//                         No users found
//                       </span>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col gap-1 py-1">
//                       {filteredUsers.map((u) => (
//                         <button
//                           key={u.id}
//                           type="button"
//                           onClick={() => handlePickUser(u.id)}
//                           className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-white/50"
//                         >
//                           <div className="h-9 w-9 shrink-0 rounded-full bg-cyan-500/30 flex items-center justify-center border border-white/60">
//                             <span className="text-xs font-bold text-cyan-900">
//                               {(u.firstName || u.username || "U")
//                                 .charAt(0)
//                                 .toUpperCase()}
//                             </span>
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <p className="truncate text-sm font-semibold text-cyan-900">
//                               {u.firstName} {u.lastName}
//                             </p>
//                             <p className="truncate text-[11px] text-cyan-600">
//                               {u.email}
//                             </p>
//                           </div>
//                           <ChevronRight className="h-3.5 w-3.5 text-cyan-600/60 shrink-0" />
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </>
//               ) : isAdmin && adminMode === "list" ? (
//                 <>
//                   {adminRoomsLoading && adminRooms.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-10 gap-2">
//                       <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
//                       <span className="text-[11px] text-cyan-600">
//                         Loading conversations…
//                       </span>
//                     </div>
//                   ) : adminRooms.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-10 gap-1">
//                       <MessageCircle size={28} className="text-cyan-400/60" />
//                       <span className="text-sm text-cyan-700 font-medium">
//                         No conversations yet
//                       </span>
//                       <button
//                         type="button"
//                         onClick={() => setAdminMode("picker")}
//                         className="mt-2 rounded-full bg-cyan-500/20 px-3 py-1.5 text-[11px] font-bold text-cyan-800 hover:bg-cyan-500/30"
//                       >
//                         Start one
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col gap-1 py-1">
//                       {adminRooms.map((room) => (
//                         <div
//                           key={room.id}
//                           className="flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-white/50"
//                         >
//                           <button
//                             type="button"
//                             onClick={() => openAdminChat(room.id)}
//                             className="flex items-center gap-3 flex-1 min-w-0 text-left"
//                           >
//                             <div className="relative shrink-0">
//                               {room.otherParticipant.avatar ? (
//                                 // eslint-disable-next-line @next/next/no-img-element
//                                 <img
//                                   src={room.otherParticipant.avatar}
//                                   alt={room.otherParticipant.name}
//                                   className="h-10 w-10 rounded-full object-cover border border-white/60"
//                                 />
//                               ) : (
//                                 <div className="h-10 w-10 rounded-full bg-cyan-500/30 flex items-center justify-center border border-white/60">
//                                   <span className="text-xs font-bold text-cyan-900">
//                                     {room.otherParticipant.name
//                                       .charAt(0)
//                                       .toUpperCase()}
//                                   </span>
//                                 </div>
//                               )}
//                               {room.unreadCount > 0 && (
//                                 <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] rounded-full bg-red-500 px-1 shadow">
//                                   <span className="text-[9px] font-bold text-white leading-none">
//                                     {room.unreadCount > 9
//                                       ? "9+"
//                                       : room.unreadCount}
//                                   </span>
//                                 </span>
//                               )}
//                             </div>
//                             <div className="min-w-0 flex-1">
//                               <div className="flex items-center justify-between gap-2">
//                                 <p className="truncate text-sm font-semibold text-cyan-900">
//                                   {room.otherParticipant.name}
//                                 </p>
//                                 {room.lastMessage?.timestamp && (
//                                   <span className="shrink-0 text-[10px] text-cyan-600/80">
//                                     {new Date(
//                                       room.lastMessage.timestamp
//                                     ).toLocaleTimeString([], {
//                                       hour: "2-digit",
//                                       minute: "2-digit",
//                                     })}
//                                   </span>
//                                 )}
//                               </div>
//                               <p
//                                 className={`truncate text-[11px] mt-0.5 ${
//                                   room.unreadCount > 0
//                                     ? "text-cyan-900 font-medium"
//                                     : "text-cyan-600"
//                                 }`}
//                               >
//                                 {room.lastMessage?.text
//                                   ? room.lastMessage.text
//                                   : "No messages yet"}
//                               </p>
//                             </div>
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setConfirmDeleteRoom(room)}
//                             aria-label={`Delete chat with ${room.otherParticipant.name}`}
//                             className="shrink-0 rounded-full p-1.5 text-cyan-700/60 hover:bg-red-500/15 hover:text-red-600 transition-colors"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   {!isAdmin && !currentRoomId && (
//                     <div className="mt-1">
//                       <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/40">
//                         <p className="text-sm leading-relaxed text-cyan-800">
//                           {getPersonalizedMessage()}
//                         </p>
//                       </div>
//                     </div>
//                   )}

//                   {(isAdmin ? selectedAdminRoomId : currentRoomId) && (
//                     <div className="flex flex-col gap-2 py-2">
//                       {messages.length === 0 && (
//                         <p className="text-center text-xs text-cyan-600 py-6">
//                           {isAdmin
//                             ? "No messages in this conversation yet."
//                             : "Start the conversation!"}
//                         </p>
//                       )}
//                       {messages.map((msg) => {
//                         const isMine = msg.senderId === currentUserId;
//                         return (
//                           <div
//                             key={msg.id}
//                             className={`flex ${
//                               isMine ? "justify-end" : "justify-start"
//                             }`}
//                           >
//                             <div
//                               className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
//                                 isMine
//                                   ? "bg-cyan-600 text-white"
//                                   : "bg-white text-cyan-900"
//                               }`}
//                             >
//                               {msg.type === "image" ? (
//                                 // eslint-disable-next-line @next/next/no-img-element
//                                 <img
//                                   src={msg.attachmentUrl}
//                                   alt="Shared"
//                                   className="max-w-full max-h-40 rounded-lg object-cover"
//                                 />
//                               ) : (
//                                 <p className="text-xs whitespace-pre-wrap break-words">
//                                   {msg.message}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}

//                       {pendingReply && !isAdmin && (
//                         <div className="flex justify-center">
//                           <div className="flex items-center gap-1.5 bg-amber-100/80 text-amber-700 rounded-full px-3 py-1 text-[10px] font-medium">
//                             <Hourglass size={12} />
//                             Your message has been sent. Please wait for a reply.
//                           </div>
//                         </div>
//                       )}
//                       <div ref={messagesEndRef} />
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             {/* ── Footer ───────────────────────────────────────── */}
//             <div className="shrink-0 px-5 pt-2 pb-4 border-t border-white/40 bg-white/20">
//               {(isAdmin && adminMode === "chat" && selectedAdminRoomId) ||
//               (!isAdmin && currentRoomId) ? (
//                 <>
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       ref={fileInputRef}
//                       onChange={handleImageUpload}
//                     />
//                     <button
//                       onClick={() => fileInputRef.current?.click()}
//                       className="p-2 rounded-full bg-white/40 hover:bg-white/60 transition-colors shrink-0"
//                       aria-label="Upload image"
//                     >
//                       <Paperclip size={16} className="text-cyan-700" />
//                     </button>
//                     <input
//                       type="text"
//                       value={inputMessage}
//                       onChange={(e) => setInputMessage(e.target.value)}
//                       onKeyDown={(e) =>
//                         e.key === "Enter" && handleSendMessage()
//                       }
//                       placeholder="Type a message..."
//                       className="flex-1 min-w-0 bg-white/60 rounded-xl px-3 py-2 text-sm text-cyan-900 placeholder:text-cyan-500 focus:outline-none border border-white/40"
//                     />
//                     <button
//                       onClick={handleSendMessage}
//                       disabled={sendingMessage || !inputMessage.trim()}
//                       className="p-2 rounded-full bg-cyan-600 text-white disabled:opacity-50 shrink-0"
//                       aria-label="Send message"
//                     >
//                       {sendingMessage ? (
//                         <Loader2 size={16} className="animate-spin" />
//                       ) : (
//                         <Send size={16} />
//                       )}
//                     </button>
//                   </div>

//                   {!isAdmin && (
//                     <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-cyan-700/80">
//                       <span className="flex items-center gap-1">
//                         <CheckCircle className="h-3 w-3 text-emerald-500" />
//                         Secure
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <Shield className="h-3 w-3 text-cyan-500" />
//                         Encrypted
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
//                         {responseTime}
//                       </span>
//                     </div>
//                   )}
//                 </>
//               ) : isAdmin ? (
//                 <div className="flex items-center justify-center gap-1.5 py-1">
//                   <Sparkles className="h-3 w-3 text-cyan-500" />
//                   <span className="text-[10px] font-medium text-cyan-700">
//                     {adminMode === "picker"
//                       ? "Tap a user to open their conversation"
//                       : "Tap a user to open · + to start new"}
//                   </span>
//                 </div>
//               ) : (
//                 <div className="flex flex-col gap-2">
//                   <div className="flex items-center justify-center gap-3 text-[10px] text-cyan-700/80">
//                     <span className="flex items-center gap-1">
//                       <CheckCircle className="h-3 w-3 text-emerald-500" />
//                       Secure
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Shield className="h-3 w-3 text-cyan-500" />
//                       Encrypted
//                     </span>
//                   </div>
//                   <button
//                     onClick={handleStartChat}
//                     className="group w-full rounded-xl bg-white/60 px-4 py-2.5 text-sm font-semibold text-cyan-700 shadow-md transition-all hover:bg-white/80 flex items-center justify-center gap-2"
//                   >
//                     <span>Chat with Ashie</span>
//                     <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* ── Delete confirmation overlay ──────────────────── */}
//             <AnimatePresence>
//               {confirmDeleteRoom && (
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
//                   onClick={() => !deletingRoom && setConfirmDeleteRoom(null)}
//                 >
//                   <motion.div
//                     initial={{ scale: 0.9, y: 10 }}
//                     animate={{ scale: 1, y: 0 }}
//                     exit={{ scale: 0.9, y: 10 }}
//                     className="w-full max-w-[260px] rounded-2xl bg-white p-5 shadow-2xl"
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     <div className="flex items-center gap-2 mb-2">
//                       <AlertTriangle size={18} className="text-red-500" />
//                       <h4 className="text-sm font-bold text-cyan-900">
//                         Delete conversation?
//                       </h4>
//                     </div>
//                     <p className="text-xs text-cyan-700 leading-relaxed mb-4">
//                       This permanently deletes the chat with{" "}
//                       <strong>{confirmDeleteRoom.otherParticipant.name}</strong>.
//                       This cannot be undone.
//                     </p>
//                     <div className="flex gap-2">
//                       <button
//                         type="button"
//                         onClick={() => setConfirmDeleteRoom(null)}
//                         disabled={deletingRoom}
//                         className="flex-1 rounded-lg bg-white border border-cyan-200 px-3 py-2 text-xs font-bold text-cyan-700 hover:bg-cyan-50 transition disabled:opacity-50"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="button"
//                         onClick={handleConfirmDelete}
//                         disabled={deletingRoom}
//                         className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1"
//                       >
//                         {deletingRoom ? (
//                           <Loader2 size={12} className="animate-spin" />
//                         ) : (
//                           <Trash2 size={12} />
//                         )}
//                         Delete
//                       </button>
//                     </div>
//                   </motion.div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Floating Toggle Button */}
//       <motion.button
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
//         {!isOpen && unreadCount > 0 && !isOnChatPage && (
//           <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
//         )}

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
//               <X size={22} className="text-cyan-600" strokeWidth={2.5} />
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
//               <MessageCircle size={22} className="text-cyan-600" fill="currentColor" />

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
//                     {unreadCount > 99 ? "99+" : unreadCount}
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