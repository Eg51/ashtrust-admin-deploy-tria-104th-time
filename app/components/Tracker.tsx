// app/components/Tracker.tsx (Display Component)
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MonitorSmartphone, MapPin, Clock, LogIn, LogOut, Mail, Users, RefreshCw, Globe } from "lucide-react";

interface SessionData {
  _id: string;
  userId: string;
  username: string;
  email: string;
  avatar: string | null;
  ip: string;
  country: string;
  deviceInfo: string;
  timeIn: string;
  timeOut: string | null;
  timeSpent: string;
  visitCount: number;
  isActive: boolean;
}

export default function Tracker() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSessions, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleCleanup = async () => {
    if (!confirm('Delete old sessions (older than 7 days)?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/cleanup-sessions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      alert(`Deleted ${data.deleted || 0} old sessions!`);
      await fetchSessions();
    } catch (error) {
      console.error('Error cleaning sessions:', error);
      alert('Failed to clean sessions');
    }
  };

  // ✅ Get active sessions count
  const activeSessions = sessions.filter(s => s.isActive).length;

  return (
    <div className="p-4 sm:p-6 bg-[#C4F8FD] shadow-xl backdrop-blur-sm rounded-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-cyan-900">Live User Activity</h2>
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            {activeSessions} Active
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              autoRefresh 
                ? 'bg-cyan-100 text-cyan-700' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Paused'}
          </button>
          <button
            onClick={fetchSessions}
            className="p-2 text-sm rounded-md cursor-pointer bg-cyan-700 text-white shadow-xl hover:bg-cyan-600 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleCleanup}
            className="p-2 text-sm rounded-md cursor-pointer bg-amber-600 text-white shadow-xl hover:bg-amber-500 transition-colors"
          >
            🗑️ Clean
          </button>
        </div>
      </div>
      
      {/* Sessions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-cyan-600">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
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
              className={`bg-white/30 rounded-xl border p-4 hover:bg-white/50 transition-colors ${
                session.isActive 
                  ? 'border-emerald-200/50' 
                  : 'border-cyan-200/30 opacity-70'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                {/* User Info & Avatar */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                    {session.visitCount > 1 && (
                      <p className="text-[10px] text-cyan-500">Visits: {session.visitCount}</p>
                    )}
                  </div>
                </div>
                
                {/* ✅ Device & Country (IP removed for privacy, replaced with Globe icon) */}
                <div className="flex items-center gap-2">
                  <MonitorSmartphone className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-cyan-900 truncate" title={session.deviceInfo}>
                      {session.deviceInfo || "Unknown Device"}
                    </p>
                    <p className="text-xs text-cyan-600 flex items-center gap-1">
                      <Globe size={12} className="text-cyan-500" /> {session.country || "Unknown Location"}
                    </p>
                  </div>
                </div>

                {/* ✅ Country (replaced IP) */}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-cyan-900">
                    {session.country || "Unknown Location"}
                  </p>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                  <div className="text-xs text-cyan-900 min-w-0">
                    <p className="flex items-center gap-1 truncate"><LogIn size={12} /> {session.timeIn}</p>
                    <p className="flex items-center gap-1 truncate"><LogOut size={12} /> {session.timeOut || "🟢 Active"}</p>
                    <p className="font-bold text-emerald-600">⏱️ {session.timeSpent}</p>
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