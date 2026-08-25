"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, 
  Users, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  Zap,
  Settings,
  DollarSign,
  TrendingUp,
  Calendar,
  Timer
} from "lucide-react";

interface UserBalanceStatus {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  autoBalanceEnabled: boolean;
  lastAdded: string | null;
}

export default function AutoBalanceAdmin() {
  const [users, setUsers] = useState<UserBalanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [amount, setAmount] = useState("0.01");
  const [autoAddEnabled, setAutoAddEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    setToken(authToken);
    if (authToken) {
      fetchUsers(authToken);
    }
  }, []);

  const fetchUsers = async (authToken: string) => {
    try {
      const res = await fetch('/api/admin/auto-balance', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        // Initialize local state for toggles
        const enabledState: Record<string, boolean> = {};
        data.data.forEach((user: UserBalanceStatus) => {
          enabledState[user.userId] = user.autoBalanceEnabled;
        });
        setAutoAddEnabled(enabledState);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoBalance = async (userId: string, enabled: boolean) => {
    if (!token) return;
    
    // Optimistic update
    setAutoAddEnabled(prev => ({ ...prev, [userId]: enabled }));
    
    try {
      const res = await fetch('/api/admin/auto-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, enabled })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Auto-balance ${enabled ? 'enabled' : 'disabled'} for user` });
        setTimeout(() => setMessage(null), 3000);
        fetchUsers(token);
      } else {
        // Revert on error
        setAutoAddEnabled(prev => ({ ...prev, [userId]: !enabled }));
        setMessage({ type: 'error', text: 'Failed to update setting' });
      }
    } catch (error) {
      setAutoAddEnabled(prev => ({ ...prev, [userId]: !enabled }));
      setMessage({ type: 'error', text: 'Error updating setting' });
    }
  };

  const manualAdd = async (userId: string) => {
    if (!token) return;
    setProcessing(true);
    
    try {
      const res = await fetch('/api/admin/auto-balance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, amount: parseFloat(amount) || 0.01 })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Balance added!' });
        fetchUsers(token);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add balance' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding balance' });
    } finally {
      setProcessing(false);
    }
  };

  const runScheduler = async () => {
    if (!token) return;
    setProcessing(true);
    
    try {
      const res = await fetch('/api/admin/auto-balance/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Scheduler ran successfully' 
        });
        fetchUsers(token);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to run scheduler' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error running scheduler' });
    } finally {
      setProcessing(false);
    }
  };

  const getTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getUserName = (user: UserBalanceStatus) => {
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        <span className="ml-3 text-cyan-600">Loading users...</span>
      </div>
    );
  }

  const enabledCount = Object.values(autoAddEnabled).filter(v => v).length;

  return (
    <div className="p-4 bg-[#C4F8FD] border-none shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cyan-900 flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500" />
            Auto-Balance Manager
          </h2>
          <p className="text-sm text-cyan-600">
            {users.length} users • {enabledCount} enabled • Adds $0.01 every 2 hours
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runScheduler}
            disabled={processing}
            className="flex items-center gap-2 bg-[#C4F8FD] text-cyan-600 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Run Now
          </button>
        </div>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-500/20 text-emerald-700' :
              message.type === 'error' ? 'bg-red-500/20 text-red-700' :
              'bg-blue-500/20 text-blue-700'
            }`}
          >
            {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {message.type === 'error' && <XCircle className="h-5 w-5" />}
            {message.type === 'info' && <AlertCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/30 rounded-xl p-3 text-center">
          <Users className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-cyan-900">{users.length}</p>
          <p className="text-xs text-cyan-600">Total Users</p>
        </div>
        <div className="bg-white/30 rounded-xl p-3 text-center">
          <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-600">{enabledCount}</p>
          <p className="text-xs text-cyan-600">Enabled</p>
        </div>
        <div className="bg-white/30 rounded-xl p-3 text-center">
          <Clock className="h-5 w-5 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{users.length - enabledCount}</p>
          <p className="text-xs text-cyan-600">Disabled</p>
        </div>
      </div>

      {/* User List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {users.map((user) => {
          const isEnabled = autoAddEnabled[user.userId] || false;
          
          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                isEnabled 
                  ? 'bg-emerald-50/50 border-emerald-200/50' 
                  : 'bg-white/30 border-cyan-200/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-2 rounded-full ${
                  isEnabled ? 'bg-emerald-500/20' : 'bg-cyan-500/20'
                }`}>
                  <User className={`h-4 w-4 ${
                    isEnabled ? 'text-emerald-600' : 'text-cyan-600'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-cyan-900 truncate">
                    {getUserName(user)}
                  </p>
                  <p className="text-xs text-cyan-600 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Status badge */}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isEnabled 
                    ? 'bg-emerald-500/20 text-emerald-700' 
                    : 'bg-slate-500/20 text-slate-600'
                }`}>
                  {isEnabled ? (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </>
                  ) : (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Inactive
                    </>
                  )}
                </div>

                {/* Last added */}
                {isEnabled && (
                  <span className="text-[10px] text-cyan-500">
                    Last: {getTimeAgo(user.lastAdded)}
                  </span>
                )}

                {/* Manual add */}
                {isEnabled && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={selectedUserId === user.userId ? amount : '0.01'}
                      onChange={(e) => {
                        setSelectedUserId(user.userId);
                        setAmount(e.target.value);
                      }}
                      className="w-16 bg-white/50 px-2 py-1 rounded-lg text-xs text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder="0.01"
                      step="0.01"
                      min="0.01"
                    />
                    <button
                      onClick={() => manualAdd(user.userId)}
                      disabled={processing}
                      className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-600 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                      title="Add balance now"
                    >
                      <DollarSign className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Toggle switch */}
                <button
                  onClick={() => toggleAutoBalance(user.userId, !isEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center text-[10px] text-cyan-500/70 border-t border-cyan-200/30 pt-3">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            Interval: 2 hours
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Amount: $0.01 per addition
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Auto-processes every hour (checks if 2 hours have passed)
          </span>
        </div>
      </div>
    </div>
  );
}