// "use client";

// import { useEffect, useRef } from "react";

// export const useSessionTracker = () => {
//   const startTime = useRef<number>(Date.now());
//   const userRef = useRef<any>(null);

//   useEffect(() => {
//     try {
//       userRef.current = JSON.parse(localStorage.getItem('user') || '{}');
//     } catch (e) {
//       userRef.current = {};
//     }

//     const sendData = async (action: "in" | "out") => {
//       try {
//         const token = localStorage.getItem('auth_token');
//         if (!token) return;

//         const now = new Date();
//         const timeIn = new Date(startTime.current).toLocaleTimeString();
//         const timeOut = action === "out" ? now.toLocaleTimeString() : undefined;
//         const timeSpent = `${Math.floor((Date.now() - startTime.current) / 1000)}s`;

//         await fetch('/api/track', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             email: userRef.current.email || 'N/A',
//             username: userRef.current.displayName || userRef.current.username || 'Unknown',
//             avatar: userRef.current.avatar || null, 
//             deviceInfo: `${navigator.userAgent}`,
//             timeIn,
//             timeOut,
//             timeSpent,
//           })
//         });
//       } catch (error) {
//         console.error("Failed to track session", error);
//       }
//     };

//     sendData("in");

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'hidden') {
//         sendData("out"); 
//       } else {
//         sendData("in"); 
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     window.addEventListener("beforeunload", () => sendData("out"));

//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       window.removeEventListener("beforeunload", () => sendData("out"));
//     };
//   }, []);
// };
"use client";

import { useEffect, useRef } from "react";

export const useSessionTracker = () => {
  const startTime = useRef<number>(Date.now());
  const userRef = useRef<any>(null);
  const sessionRef = useRef<string>("");

  useEffect(() => {
    try {
      userRef.current = JSON.parse(localStorage.getItem('user') || '{}');
      // Create a unique ID for this specific session (based on current timestamp)
      sessionRef.current = `session_${Date.now()}`;
    } catch (e) {
      userRef.current = {};
    }

    const sendData = async (action: "in" | "out") => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const now = new Date();
        const timeIn = new Date(startTime.current).toLocaleTimeString();
        const timeOut = action === "out" ? now.toLocaleTimeString() : undefined;
        const timeSpent = `${Math.floor((Date.now() - startTime.current) / 1000)}s`;

        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sessionId: sessionRef.current, // ✅ Unique ID to find this session
            email: userRef.current.email || 'N/A',
            username: userRef.current.displayName || userRef.current.username || 'Unknown',
            avatar: userRef.current.avatar || null,
            deviceInfo: `${navigator.userAgent}`,
            timeIn,
            timeOut,
            timeSpent,
            action // ✅ Tells backend if we are starting or ending
          })
        });
      } catch (error) {
        console.error("Failed to track session", error);
      }
    };

    sendData("in");

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendData("out"); 
      } else {
        sendData("in"); 
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", () => sendData("out"));

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", () => sendData("out"));
    };
  }, []);
};