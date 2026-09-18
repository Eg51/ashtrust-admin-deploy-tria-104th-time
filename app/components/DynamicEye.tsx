"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  Volume2,
  VolumeX,
  Settings2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useNotchStyle, type NotchStyle } from "@/hooks/useNotchStyle";

// ---- Types ----------------------------------------------------------------

interface Notification {
  _id: string;
  userId: string;
  type: string;
  label: string;
  username: string;
  email: string;
  avatar: string | null;
  detail: string;
  metadata: Record<string, unknown>;
  count: number;
  createdAt: string;
  updatedAt: string;
}

interface UserGroup {
  userId: string;
  username: string;
  email: string;
  avatar: string | null;
  types: string[];
  items: Notification[];
  totalCount: number;
}

type View = "users" | "user" | "single";

// ---- Constants ------------------------------------------------------------

const POLL_INTERVAL_MS = 5000;
const MUTE_KEY = "ashtrust:notif-mute";
const SOUND_SRC = "/notification.mp3";

// ✅ Chat notifications are view-only: they persist after the admin closes them.
const PERSISTENT_TYPES = new Set<string>(["message"]);

function isPersistent(type: string): boolean {
  return PERSISTENT_TYPES.has(type);
}

// ---- Notch positioning helper ---------------------------------------------

function notchClasses(style: NotchStyle): string {
  switch (style) {
    case "left":
      return "left-4 sm:left-6";
    case "right":
      return "right-4 sm:right-6";
    case "none":
      return "left-1/2 -translate-x-1/2";
    case "center":
    default:
      return "left-1/2 -translate-x-1/2";
  }
}

function topInset(style: NotchStyle): string {
  return style === "none"
    ? "calc(env(safe-area-inset-top, 0px) + 8px)"
    : "calc(env(safe-area-inset-top, 0px) + 4px)";
}

// ---- Sound ----------------------------------------------------------------

function playBeep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1240, ctx.currentTime + 0.11);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.34);
  } catch {
    // silent
  }
}

function playNotificationSound() {
  try {
    const audio = new Audio(SOUND_SRC);
    audio.volume = 0.5;
    const promise = audio.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => playBeep());
    }
  } catch {
    playBeep();
  }
}

// ---- Avatar helper --------------------------------------------------------

function UserBubble({
  avatar,
  username,
  size = "h-9 w-9",
}: {
  avatar: string | null;
  username: string;
  size?: string;
}) {
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={username}
        className={`${size} rounded-full object-cover flex-shrink-0 border border-white/50`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-cyan-500/30 flex items-center justify-center flex-shrink-0 border border-white/50`}
    >
      <span className="text-xs font-bold text-cyan-900">
        {username?.charAt(0)?.toUpperCase() || "U"}
      </span>
    </div>
  );
}

// ---- Relative time --------------------------------------------------------

function relTime(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  } catch {
    return "now";
  }
}

// ---- Main component -------------------------------------------------------

export default function DynamicEye() {
  const { style: notchStyle, setStyle: setNotchStyle, mounted: notchMounted } =
    useNotchStyle();

  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("users");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  const [muted, setMuted] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);

  const lastTotalRef = useRef<number | null>(null);
  const audioUnlockedRef = useRef(false);

  // ---- Mount + admin detection --------------------------------------------
  useEffect(() => {
    setMounted(true);
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const admin = u.role === "admin" || u.isAdmin === true;
      setIsAdmin(admin);

      const m = localStorage.getItem(MUTE_KEY);
      if (m === "true") setMuted(true);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // ---- Mute persistence ---------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(MUTE_KEY, muted ? "true" : "false");
    } catch {
      // ignore
    }
  }, [muted]);

  // ---- Fetch --------------------------------------------------------------
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) return;
      if (!res.ok) return;

      const json = await res.json();
      if (!json.success || !Array.isArray(json.notifications)) return;

      const list: Notification[] = json.notifications;
      const total = list.reduce((s, n) => s + (Number(n.count) || 0), 0);

      if (
        lastTotalRef.current !== null &&
        total > lastTotalRef.current &&
        !muted
      ) {
        playNotificationSound();
      }
      lastTotalRef.current = total;

      setNotifications(list);

      if (list.length === 0 && isOpen) {
        setIsOpen(false);
        setView("users");
        setSelectedUserId(null);
        setSelectedNotifId(null);
      }
    } catch {
      // network error — ignore, next tick will retry
    }
  }, [muted, isOpen]);

  // ---- Polling ------------------------------------------------------------
  useEffect(() => {
    if (!isAdmin || !mounted) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAdmin, mounted, fetchNotifications]);

  // ---- Unlock audio on first user gesture ---------------------------------
  useEffect(() => {
    if (!mounted) return;
    const unlock = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      try {
        const a = new Audio(SOUND_SRC);
        a.volume = 0;
        a.play().catch(() => {});
      } catch {
        // ignore
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [mounted]);

  // ---- Escape key ---------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (view === "single") setView("user");
      else if (view === "user") setView("users");
      else setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, view]);

  // ---- Derived data -------------------------------------------------------
  const byType = useMemo(() => {
    const map: Record<string, { label: string; count: number }> = {};
    for (const n of notifications) {
      if (!map[n.type]) map[n.type] = { label: n.label, count: 0 };
      map[n.type].count += Number(n.count) || 0;
    }
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [notifications]);

  const byUser: UserGroup[] = useMemo(() => {
    const map: Record<string, UserGroup> = {};
    for (const n of notifications) {
      if (!map[n.userId]) {
        map[n.userId] = {
          userId: n.userId,
          username: n.username,
          email: n.email,
          avatar: n.avatar,
          types: [],
          items: [],
          totalCount: 0,
        };
      }
      const g = map[n.userId];
      if (!g.types.includes(n.type)) g.types.push(n.type);
      g.items.push(n);
      g.totalCount += Number(n.count) || 0;
      if (!g.avatar && n.avatar) g.avatar = n.avatar;
      if (!g.username && n.username) g.username = n.username;
      if (!g.email && n.email) g.email = n.email;
    }
    return Object.values(map).sort((a, b) => b.totalCount - a.totalCount);
  }, [notifications]);

  const activeUser = useMemo(
    () => byUser.find((u) => u.userId === selectedUserId) || null,
    [byUser, selectedUserId]
  );

  const activeNotif = useMemo(
    () => notifications.find((n) => n._id === selectedNotifId) || null,
    [notifications, selectedNotifId]
  );

  const totalCount = notifications.reduce(
    (s, n) => s + (Number(n.count) || 0),
    0
  );

  // ---- Actions ------------------------------------------------------------
  const openPanel = () => {
    setIsOpen(true);
    setView("users");
    setSelectedUserId(null);
    setSelectedNotifId(null);
  };

  const closePanel = () => {
    setIsOpen(false);
    setShowStylePicker(false);
  };

  const goBack = () => {
    if (view === "single") {
      setView("user");
      setSelectedNotifId(null);
    } else if (view === "user") {
      setView("users");
      setSelectedUserId(null);
    } else {
      closePanel();
    }
  };

  const selectUser = (userId: string) => {
    setSelectedUserId(userId);
    setView("user");
  };

  const selectNotif = (id: string) => {
    setSelectedNotifId(id);
    setView("single");
  };

  const deleteNotif = async (id: string) => {
    // Optimistic local removal
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // if it fails, the next poll will bring it back
    }
  };

  // ✅ CHANGED: chat notifications (type "message") are NOT deleted on close.
  const closeSingle = async () => {
    if (!activeNotif) return;

    const persistent = isPersistent(activeNotif.type);

    if (!persistent) {
      await deleteNotif(activeNotif._id);
    }

    setSelectedNotifId(null);

    // Non-persistent: if this was the user's last remaining notification,
    // drop back to the users list.
    // Persistent (chat): stay on the user's view so the admin can keep
    // reading the chat row without it disappearing.
    const stillHasItems = notifications.some(
      (n) => n.userId === activeNotif.userId && n._id !== activeNotif._id
    );

    if (stillHasItems || persistent) {
      setView("user");
    } else {
      setView("users");
      setSelectedUserId(null);
    }
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    setNotifications([]);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch("/api/admin/notifications?all=true", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // next poll will bring them back if it failed
    }
    closePanel();
  };

  // ---- Render guards ------------------------------------------------------
  if (!mounted || !notchMounted || !isAdmin) return null;

  const positionClass = notchClasses(notchStyle);
  const topPx = topInset(notchStyle);

  // ---- Eye badge (Level 1) ------------------------------------------------
  const renderEyeBadge = () => {
    if (notifications.length === 0) return null;

    const primary = byType[0];
    const otherCount = byType.length - 1;

    return (
      <motion.button
        layoutId="dynamic-eye"
        onClick={openPanel}
        initial={{ opacity: 0, scale: 0.6, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.6, y: -8 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#0f172a]/95 px-3 py-1.5 text-white shadow-lg backdrop-blur-md ring-1 ring-white/10 hover:bg-[#0f172a]"
        aria-label="Open notifications"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
        </span>
        <span className="text-xs font-semibold">
          {primary ? `${primary[1].label} +${primary[1].count}` : `${totalCount} new`}
        </span>
        {otherCount > 0 && (
          <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-cyan-200">
            +{otherCount} more
          </span>
        )}
      </motion.button>
    );
  };

  // ---- Panel views --------------------------------------------------------

  const renderUsersView = () => (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">Activity</span>
          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
            {byUser.length} {byUser.length === 1 ? "user" : "users"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMuted((m) => !m)}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label={muted ? "Unmute notifications" : "Mute notifications"}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setShowStylePicker((s) => !s)}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Notification position settings"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={clearAll}
            className="rounded-full p-1.5 text-white/70 hover:bg-red-500/20 hover:text-red-300"
            aria-label="Clear all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={closePanel}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showStylePicker && (
        <div className="border-b border-white/10 px-4 py-3">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-white/50">
            Notification origin
          </p>
          <div className="flex flex-wrap gap-2">
            {(["center", "left", "right", "none"] as NotchStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setNotchStyle(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  notchStyle === s
                    ? "bg-cyan-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-[60vh] overflow-y-auto">
        {byUser.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-white/50">
            No pending activity
          </div>
        ) : (
          byUser.map((u) => (
            <button
              key={u.userId}
              onClick={() => selectUser(u.userId)}
              className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
            >
              <UserBubble avatar={u.avatar} username={u.username} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {u.username || "Unknown user"}
                </p>
                <p className="truncate text-[11px] text-white/60">{u.email}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {u.types.slice(0, 3).map((t) => {
                    const item = u.items.find((i) => i.type === t);
                    return (
                      <span
                        key={t}
                        className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-medium text-cyan-200"
                      >
                        {item?.label || t}
                      </span>
                    );
                  })}
                  {u.types.length > 3 && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                      +{u.types.length - 3}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white">
                  {u.totalCount}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-white/40" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const renderUserView = () => {
    if (!activeUser) return null;
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
          <button
            onClick={goBack}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <UserBubble
            avatar={activeUser.avatar}
            username={activeUser.username}
            size="h-8 w-8"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">
              {activeUser.username || "Unknown"}
            </p>
            <p className="truncate text-[11px] text-white/60">
              {activeUser.email}
            </p>
          </div>
          <button
            onClick={closePanel}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {activeUser.items.map((n) => (
            <button
              key={n._id}
              onClick={() => selectNotif(n._id)}
              className="flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {n.label}
                  </span>
                  {n.count > 1 && (
                    <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-200">
                      ×{n.count}
                    </span>
                  )}
                  {/* ✅ NEW: mark chat notifications as persistent */}
                  {isPersistent(n.type) && (
                    <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-medium text-cyan-300">
                      persistent
                    </span>
                  )}
                </div>
                {n.detail && (
                  <p className="mt-0.5 truncate text-[11px] text-white/60">
                    {n.detail}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-white/40">
                  {relTime(n.updatedAt)} ago
                </p>
              </div>
              <ArrowRight className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-white/40" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSingleView = () => {
    if (!activeNotif) return null;
    const persistent = isPersistent(activeNotif.type);
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
          <button
            onClick={goBack}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex-1 text-sm font-bold text-white">
            {activeNotif.label}
          </span>
          {/* ✅ CHANGED: chat keeps neutral styling, others keep red-tinted */}
          <button
            onClick={closeSingle}
            className={`rounded-full p-1.5 text-white/70 ${
              persistent
                ? "hover:bg-white/10 hover:text-white"
                : "hover:bg-red-500/20 hover:text-red-300"
            }`}
            aria-label={persistent ? "Close" : "Close and delete"}
            title={persistent ? "Close" : "Close and delete"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <UserBubble
              avatar={activeNotif.avatar}
              username={activeNotif.username}
              size="h-10 w-10"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {activeNotif.username || "Unknown"}
              </p>
              <p className="truncate text-[11px] text-white/60">
                {activeNotif.email}
              </p>
            </div>
          </div>

          {activeNotif.detail && (
            <div className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">
              {activeNotif.detail}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60">
            <div>
              <p className="text-white/40">Type</p>
              <p className="font-semibold text-white/80">{activeNotif.type}</p>
            </div>
            <div>
              <p className="text-white/40">Count</p>
              <p className="font-semibold text-white/80">×{activeNotif.count}</p>
            </div>
            <div>
              <p className="text-white/40">First seen</p>
              <p className="font-semibold text-white/80">
                {relTime(activeNotif.createdAt)} ago
              </p>
            </div>
            <div>
              <p className="text-white/40">Last update</p>
              <p className="font-semibold text-white/80">
                {relTime(activeNotif.updatedAt)} ago
              </p>
            </div>
          </div>

          {Object.keys(activeNotif.metadata || {}).length > 0 && (
            <details className="rounded-lg bg-white/5 px-3 py-2">
              <summary className="cursor-pointer text-[11px] font-semibold text-white/60">
                Metadata
              </summary>
              <pre className="mt-2 overflow-x-auto text-[10px] text-white/70">
                {JSON.stringify(activeNotif.metadata, null, 2)}
              </pre>
            </details>
          )}

          {/* ✅ CHANGED: chat = "Close", others = "Close & remove" */}
          <button
            onClick={closeSingle}
            className={`w-full rounded-lg py-2 text-sm font-bold text-white transition ${
              persistent
                ? "bg-white/10 hover:bg-white/20"
                : "bg-cyan-500 hover:bg-cyan-400"
            }`}
          >
            {persistent ? "Close" : "Close & remove"}
          </button>
        </div>
      </div>
    );
  };

  // ---- Final render -------------------------------------------------------
  return (
    <>
      {/* Eye badge (Level 1) — always visible when notifications exist */}
      <div
        className={`pointer-events-none fixed z-[90] ${positionClass}`}
        style={{ top: topPx }}
      >
        <AnimatePresence mode="popLayout">
          {!isOpen && renderEyeBadge()}
        </AnimatePresence>
      </div>

      {/* Panel — morphs from the eye position */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="eye-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-sm"
              onClick={closePanel}
            />
            <motion.div
              key="eye-panel"
              initial={{
                opacity: 0,
                scale: 0.92,
                y: -12,
                x:
                  notchStyle === "left"
                    ? "-25%"
                    : notchStyle === "right"
                    ? "25%"
                    : 0,
              }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: -12,
                x:
                  notchStyle === "left"
                    ? "-25%"
                    : notchStyle === "right"
                    ? "25%"
                    : 0,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className={`fixed z-[96] w-[min(92vw,380px)] overflow-hidden rounded-2xl bg-[#0f172a]/95 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl ${positionClass}`}
              style={{
                top: `calc(${topPx} + 44px)`,
                transformOrigin:
                  notchStyle === "left"
                    ? "top left"
                    : notchStyle === "right"
                    ? "top right"
                    : "top center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {view === "users" && renderUsersView()}
              {view === "user" && renderUserView()}
              {view === "single" && renderSingleView()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}