"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MonitorSmartphone, MapPin, Clock, LogIn, LogOut, Mail, Users } from "lucide-react";

interface SessionData {
  _id: string;
  username: string;
  email: string;
  avatar: string | null;
  ip: string;
  country: string;
  deviceInfo: string;
  timeIn: string;
  timeOut: string | null;
  timeSpent: string;
}

export default function Tracker() {
  const [sessions, setSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/sessions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setSessions(data.data);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, []);
  const handleCleanup = async () => {
    const res = await fetch('/api/cleanup-sessions', { method: 'POST' });
    const data = await res.json();
    alert(`Deleted ${data.deleted} old sessions!`);
  };

  return (
    <div className="p-4 sm:p-6 bg-[#C4F8FD] shadow-xl backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
      <button onClick={handleCleanup} className="p-2 text-sm rounded-md cursor-pointer bg-cyan-700 text-white shadow-xl" >Clean</button>
        <h2 className="text-2xl font-bold text-cyan-900">Live User Activity</h2>
        
        <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          LIVE
        </span>
      </div>
      
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-cyan-600">
            <Users className="h-12 w-12 mx-auto mb-3 text-cyan-400/50" />
            <p className="text-sm font-medium">No active sessions found</p>
          </div>
        ) : (
          sessions.map((session, index) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/30 rounded-xl border border-cyan-200/30 p-4 hover:bg-white/50 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                {/* User Info & Avatar */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/30 flex items-center justify-center overflow-hidden">
                    {session.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.avatar} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-cyan-900">
                        {session.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-cyan-900 truncate">{session.username}</p>
                    <p className="text-xs text-cyan-600 truncate flex items-center gap-1">
                      <Mail size={12} /> {session.email || "N/A"}
                    </p>
                  </div>
                </div>
                
                {/* Device & IP */}
                <div className="flex items-center gap-2">
                  <MonitorSmartphone className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-cyan-900 truncate" title={session.deviceInfo}>
                      {session.deviceInfo || "Unknown Device"}
                    </p>
                    <p className="text-xs text-cyan-600">IP: {session.ip}</p>
                  </div>
                </div>

                {/* Country */}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-500" />
                  <p className="text-sm font-medium text-cyan-900">
                    {session.country || "Unknown"}
                  </p>
                </div>

                {/* Time In / Out / Spent */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-500" />
                  <div className="text-xs text-cyan-900">
                    <p className="flex items-center gap-1"><LogIn size={12} /> {session.timeIn}</p>
                    <p className="flex items-center gap-1"><LogOut size={12} /> {session.timeOut || "Active"}</p>
                    <p className="font-bold text-emerald-600">Spent: {session.timeSpent}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}