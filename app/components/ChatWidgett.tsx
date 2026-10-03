
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

      const markMessagesAsRead = async () => {
        try {
          const authToken = localStorage.getItem("auth_token");
          if (!authToken) return;
          if (!currentRoomId) return;

          await fetch(`/api/chats/mark-read`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ roomId: currentRoomId }),
          });
        } catch (error) {
          console.error("[ChatWidgett] messages not read:", error);
        }
      };

      markMessagesAsRead();
    }
  }, [isOnChatPage, isOpen, currentRoomId]);

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
      // filter to non-admin, active
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
          if (data.success) {
            const newMessages = data.data || [];
            if (newMessages.length > messages.length) {
              setMessages(newMessages);
            }
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    };

    const interval = setInterval(pollForNewMessages, 5000);
    return () => clearInterval(interval);
  }, [currentRoomId, isOpen, messages.length, isAdmin]);

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
                  <div className="relative shrink-0">
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
                  </div>
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
                  {/* Search */}
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
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={msg.attachmentUrl}
                                  alt="Shared"
                                  className="max-w-full max-h-40 rounded-lg object-cover"
                                />
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
    </div>
  );
}
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

//   const [guestId, setGuestId] = useState<string | null>(null);

//   // ✅ Arrival attention — drives the shake/flash animation
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

//   // ✅ Unread polling
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

//     const interval = setInterval(fetchUnreadCount, isOpen ? 5000 : 3000);
//     return () => clearInterval(interval);
//   }, [mounted, isOnChatPage, isOpen]);

//   // ✅ Arrival attention — sibling effect, NOT nested inside the polling effect
//   useEffect(() => {
//     const grew = unreadCount > prevUnreadRef.current;
//     prevUnreadRef.current = unreadCount;

//     if (!grew || unreadCount === 0 || isOpen || isOnChatPage) return;

//     setAttention(true);
//     const t = setTimeout(() => setAttention(false), 1200);
//     return () => clearTimeout(t);
//   }, [unreadCount, isOpen, isOnChatPage]);

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
//         {/* Red halo — pulses continuously while unread */}
//         {!isOpen && unreadCount > 0 && !isOnChatPage && (
//           <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
//         )}

//         {/* Cyan flash on arrival — one-shot when count grows */}
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
// } from "lucide-react";
// import { useRouter, usePathname } from "next/navigation";
// import { compressImage } from "@/lib/compressImage";

// interface ChatWidgettProps {
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

// export default function ChatWidgett({
//   supportName = "Ashie",
//   message = "Hi there! 👋 How can i help?",
//   defaultOpen = false,
//   supportHours = "24/7",
//   responseTime = "Usually responds in 2-5 minutes",
// }: ChatWidgettProps) {
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

//   // ── Admin-only state ────────────────────────────────────────────────
//   const [adminView, setAdminView] = useState<"list" | "chat">("list");
//   const [adminRooms, setAdminRooms] = useState<AdminRoom[]>([]);
//   const [adminRoomsLoading, setAdminRoomsLoading] = useState(false);
//   const [selectedAdminRoomId, setSelectedAdminRoomId] = useState<string | null>(null);

//   const [attention, setAttention] = useState(false);
//   const prevUnreadRef = useRef(0);

//   const isAdmin = userRole === "admin" || userRole === "Admin" || userRole === "Administrator";
//   const isOnChatPage =
//     pathname?.includes("/Support/user") ||
//     pathname?.includes("/Support/admin") ||
//     false;

//   // ── Init: guest id ──────────────────────────────────────────────────
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

//   // ── Init: mount + read user ─────────────────────────────────────────
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

//   // ── Mark as read + clear unread ─────────────────────────────────────
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
//           console.error("[ChatWidget] messages not read:", error);
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
//           const count = storedUnread ? parseInt(storedUnread) : 0;
//           setUnreadCount(count);
//           return;
//         }

//         if (authToken) {
//           const res = await fetch("/api/user/unread", {
//             headers: { Authorization: `Bearer ${authToken}` },
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
//         console.error("Error fetching unread count:", error);
//       }
//     };

//     fetchUnreadCount();
//     const interval = setInterval(fetchUnreadCount, isOpen ? 5000 : 3000);
//     return () => clearInterval(interval);
//   }, [mounted, isOnChatPage, isOpen]);

//   // ── Arrival attention ──────────────────────────────────────────────
//   useEffect(() => {
//     const grew = unreadCount > prevUnreadRef.current;
//     prevUnreadRef.current = unreadCount;

//     if (!grew || unreadCount === 0 || isOpen || isOnChatPage) return;

//     setAttention(true);
//     const t = setTimeout(() => setAttention(false), 1200);
//     return () => clearTimeout(t);
//   }, [unreadCount, isOpen, isOnChatPage]);

//   // ── Admin: fetch room list whenever the panel opens in list view ────
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
//       console.error("[ChatWidget] admin rooms fetch failed:", error);
//     } finally {
//       setAdminRoomsLoading(false);
//     }
//   }, [isAdmin]);

//   useEffect(() => {
//     if (!isOpen || !isAdmin) return;
//     if (adminView !== "list") return;
//     fetchAdminRooms();
//     const interval = setInterval(fetchAdminRooms, 5000);
//     return () => clearInterval(interval);
//   }, [isOpen, isAdmin, adminView, fetchAdminRooms]);

//   // ── User mode: fetch room on open (unchanged) ───────────────────────
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

//   // ── User mode: poll messages ────────────────────────────────────────
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

//   // ── Admin chat view: poll selected room's messages ──────────────────
//   useEffect(() => {
//     if (!isOpen || !isAdmin || adminView !== "chat" || !selectedAdminRoomId) return;

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
//         console.error("[ChatWidget] admin messages fetch failed:", error);
//       }
//     };

//     fetchMessages();
//     const interval = setInterval(fetchMessages, 3000);
//     return () => clearInterval(interval);
//   }, [isOpen, isAdmin, adminView, selectedAdminRoomId]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, pendingReply, adminView]);

//   // ── Helpers ─────────────────────────────────────────────────────────
//   const getSupportPath = () => {
//     if (isAdmin) return "/Support/admin";
//     return "/Support/user";
//   };

//   const getRoleDisplay = () => {
//     if (isAdmin) return "Admin Support";
//     return "User Support";
//   };

//   const getRoleIcon = () => {
//     if (isAdmin) return <ShieldCheck className="h-4 w-4 text-cyan-600" />;
//     return <User className="h-4 w-4 text-cyan-600" />;
//   };

//   const getPersonalizedMessage = () => {
//     if (userName && userName !== "User") {
//       return `Hi ${userName}! 👋 How can we help you today?`;
//     }
//     return message;
//   };

//   const handleStartChat = () => {
//     router.push(getSupportPath());
//     setUnreadCount(0);
//     const guestIdFromStorage = localStorage.getItem("guest_id");
//     if (guestIdFromStorage) {
//       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, "0");
//     }
//   };

//   const currentUserId = (() => {
//     try {
//       return JSON.parse(localStorage.getItem("user") || "{}")._id || guestId;
//     } catch {
//       return guestId;
//     }
//   })();

//   // ── Send message (works for both user and admin chat views) ─────────
//   const handleSendMessage = async () => {
//     const targetRoom = isAdmin ? selectedAdminRoomId : currentRoomId;
//     if (!inputMessage.trim() || !targetRoom || sendingMessage) return;

//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const token = localStorage.getItem("auth_token");
//     const guestIdFromStorage = localStorage.getItem("guest_id");

//     const tempId = `temp-${Date.now()}`;
//     setMessages((prev) => [
//       ...prev,
//       {
//         id: tempId,
//         senderId: user._id || guestIdFromStorage || "guest",
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
//     if (guestIdFromStorage) {
//       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, "0");
//     }

//     try {
//       const res = await fetch(`/api/chats/messages/${targetRoom}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//           "X-Guest-ID": guestIdFromStorage || "",
//         },
//         body: JSON.stringify({ message: sentText, type: "text" }),
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data.success) {
//           setMessages((prev) =>
//             prev.map((msg) => (msg.id === tempId ? data.data : msg))
//           );
//           if (isAdmin) fetchAdminRooms();
//         }
//       } else {
//         const errorData = await res.json();
//         console.error("Send error:", errorData);
//         setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
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
//     const guestIdFromStorage = localStorage.getItem("guest_id");
//     setSendingMessage(true);
//     if (!isAdmin) setPendingReply(true);

//     setUnreadCount(0);
//     if (guestIdFromStorage) {
//       localStorage.setItem(`guest_unread_${guestIdFromStorage}`, "0");
//     }

//     try {
//       const compressedImage = await compressImage(file, 100, 400);

//       const res = await fetch(`/api/chats/messages/${targetRoom}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//           "X-Guest-ID": guestIdFromStorage || "",
//         },
//         body: JSON.stringify({ type: "image", attachmentUrl: compressedImage }),
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

//   // ── Admin: enter a specific room's chat view ────────────────────────
//   const openAdminChat = (roomId: string) => {
//     setSelectedAdminRoomId(roomId);
//     setAdminView("chat");
//     setMessages([]);
//   };

//   const backToAdminList = () => {
//     setAdminView("list");
//     setSelectedAdminRoomId(null);
//     setMessages([]);
//     fetchAdminRooms();
//   };

//   if (!mounted) return null;

//   const activeAdminRoom = adminRooms.find((r) => r.id === selectedAdminRoomId);

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
//             className="w-[88vw] max-w-sm sm:w-80 flex flex-col max-h-[calc(100vh-8rem)] sm:max-h-[600px] rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#D6F9FE] to-[#E8FBFF] shadow-2xl backdrop-blur-xl border border-white/30 overflow-hidden"
//           >
//             {/* ── Header (shrink-0) ──────────────────────────────── */}
//             <div className="shrink-0 px-5 pt-5 pb-3">
//               {isAdmin && adminView === "chat" && activeAdminRoom ? (
//                 // Admin chat header — back + user info
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
//               ) : isAdmin ? (
//                 // Admin list header
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <h3 className="font-bold text-cyan-900 text-lg">Activity</h3>
//                     <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-800">
//                       {adminRooms.length}{" "}
//                       {adminRooms.length === 1 ? "user" : "users"}
//                     </span>
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
//               ) : (
//                 // Regular user header (unchanged layout)
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

//             {/* ── Middle (flex-1 min-h-0 scrollable) ─────────────── */}
//             <div className="flex-1 min-h-0 overflow-y-auto px-5 py-2">
//               {isAdmin && adminView === "list" ? (
//                 // Admin list view
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
//                       <MessageCircle
//                         size={28}
//                         className="text-cyan-400/60"
//                       />
//                       <span className="text-sm text-cyan-700 font-medium">
//                         No conversations yet
//                       </span>
//                       <span className="text-[11px] text-cyan-600/80 text-center">
//                         Messages from users will appear here
//                       </span>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col gap-1 py-1">
//                       {adminRooms.map((room) => (
//                         <button
//                           key={room.id}
//                           type="button"
//                           onClick={() => openAdminChat(room.id)}
//                           className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-white/50"
//                         >
//                           <div className="relative shrink-0">
//                             {room.otherParticipant.avatar ? (
//                               // eslint-disable-next-line @next/next/no-img-element
//                               <img
//                                 src={room.otherParticipant.avatar}
//                                 alt={room.otherParticipant.name}
//                                 className="h-10 w-10 rounded-full object-cover border border-white/60"
//                               />
//                             ) : (
//                               <div className="h-10 w-10 rounded-full bg-cyan-500/30 flex items-center justify-center border border-white/60">
//                                 <span className="text-xs font-bold text-cyan-900">
//                                   {room.otherParticipant.name
//                                     .charAt(0)
//                                     .toUpperCase()}
//                                 </span>
//                               </div>
//                             )}
//                             {room.unreadCount > 0 && (
//                               <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] rounded-full bg-red-500 px-1 shadow">
//                                 <span className="text-[9px] font-bold text-white leading-none">
//                                   {room.unreadCount > 9
//                                     ? "9+"
//                                     : room.unreadCount}
//                                 </span>
//                               </span>
//                             )}
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <div className="flex items-center justify-between gap-2">
//                               <p className="truncate text-sm font-semibold text-cyan-900">
//                                 {room.otherParticipant.name}
//                               </p>
//                               {room.lastMessage?.timestamp && (
//                                 <span className="shrink-0 text-[10px] text-cyan-600/80">
//                                   {new Date(
//                                     room.lastMessage.timestamp
//                                   ).toLocaleTimeString([], {
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                   })}
//                                 </span>
//                               )}
//                             </div>
//                             <p
//                               className={`truncate text-[11px] mt-0.5 ${
//                                 room.unreadCount > 0
//                                   ? "text-cyan-900 font-medium"
//                                   : "text-cyan-600"
//                               }`}
//                             >
//                               {room.lastMessage?.text
//                                 ? room.lastMessage.text
//                                 : "No messages yet"}
//                             </p>
//                           </div>
//                           <ChevronRight className="h-3.5 w-3.5 text-cyan-600/60 shrink-0" />
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 // User chat view + admin chat view (shared message rendering)
//                 <>
//                   {!isAdmin && !currentRoomId && (
//                     <>
//                       {/* Greeting (users only, before room loads) */}
//                       <div className="mt-1">
//                         <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/40">
//                           <p className="text-sm leading-relaxed text-cyan-800">
//                             {getPersonalizedMessage()}
//                           </p>
//                         </div>
//                       </div>
//                     </>
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

//             {/* ── Footer (shrink-0) ─────────────────────────────── */}
//             <div className="shrink-0 px-5 pt-2 pb-4 border-t border-white/40 bg-white/20">
//               {(isAdmin && adminView === "chat" && selectedAdminRoomId) ||
//               (!isAdmin && currentRoomId) ? (
//                 <>
//                   {/* Input row */}
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

//                   {/* Compact secure badges — users only */}
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
//                 // Admin list view has no input; just a hint
//                 <div className="flex items-center justify-center gap-1.5 py-1">
//                   <Sparkles className="h-3 w-3 text-cyan-500" />
//                   <span className="text-[10px] font-medium text-cyan-700">
//                     Tap a user to open their conversation
//                   </span>
//                 </div>
//               ) : (
//                 // Users who haven't yet loaded their room
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
//                     <span>
//                       {isAdmin ? "Open Admin Support" : "Chat with Ashie"}
//                     </span>
//                     <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                   </button>
//                 </div>
//               )}
//             </div>
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
//               <MessageCircle
//                 size={22}
//                 className="text-cyan-600"
//                 fill="currentColor"
//               />

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
