"use client";

import { useEffect, useRef } from "react";

type TrackedUser = {
  email?: string;
  displayName?: string;
  username?: string;
  avatar?: string | null;
};

export const useSessionTracker = () => {
  const startTime = useRef<number>(Date.now());
  const userRef = useRef<TrackedUser>({});
  const sessionRef = useRef<string>("");
  const lastActionRef = useRef<"in" | "out" | null>(null);

  useEffect(() => {
    // ---- 1. Read user + assign session ID (id outside the try/catch) ------
    try {
      userRef.current = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      userRef.current = {};
    }
    sessionRef.current = `session_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // ---- 2. Sender --------------------------------------------------------
    const sendData = async (action: "in" | "out") => {
      // Dedupe — ignore repeat of the same action back-to-back
      if (lastActionRef.current === action) return;

      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        // Reset the segment timer on every "in" (so timeSpent = this stretch)
        if (action === "in") startTime.current = Date.now();

        const now = new Date();
        const timeIn = new Date(startTime.current).toLocaleTimeString();
        const timeOut =
          action === "out" ? now.toLocaleTimeString() : undefined;
        const timeSpent = `${Math.floor(
          (Date.now() - startTime.current) / 1000
        )}s`;

        lastActionRef.current = action;

        // keepalive: true lets this survive page unload
        await fetch("/api/track", {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: sessionRef.current,
            email: userRef.current.email || "N/A",
            username:
              userRef.current.displayName ||
              userRef.current.username ||
              "Unknown",
            avatar: userRef.current.avatar ?? null,
            deviceInfo: navigator.userAgent,
            timeIn,
            timeOut,
            timeSpent,
            action,
          }),
        });
      } catch (error) {
        console.error("Failed to track session", error);
        // Allow the next call to retry
        lastActionRef.current = null;
      }
    };

    // ---- 3. Fire the initial "in" -----------------------------------------
    sendData("in");

    // ---- 4. Named handlers so cleanup actually works ----------------------
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendData("out");
      } else {
        sendData("in");
      }
    };

    const handleUnload = () => {
      sendData("out");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
};