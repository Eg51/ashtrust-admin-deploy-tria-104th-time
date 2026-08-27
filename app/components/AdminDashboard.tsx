"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Lock,
  Database,
  Table,
  Unlock,
  Edit,
  Trash2,
  X,
  Check,
  RefreshCw,
  Shield,
  CreditCard,
  FileText,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import Analytic from '@/app/components/Analytic';


// ---- Types ----------------------------------------------------------------
interface DashDataItem {
  _id: string;
  type?: string;
  title?: string;
  name?: string;
  value?: any;
  enabled?: boolean;
  bills: any[];
  recentTransactions: any[];
  paymentMethods: any[];
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface LoginAttempt {
  _id: string;
  email: string;
  attempts: number;
  lastAttempt: string;
  lockedUntil?: string;
  source?: string;
}

interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'emerald' | 'orange' | 'indigo' | 'teal';
}

// ---- Main Component --------------------------------------------------------
export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [dashData, setDashData] = useState<DashDataItem[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dashdata' | 'loginattempts'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<DashDataItem | null>(null);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      
      const statsResponse = await fetch('/api/admin/dashboard', { headers: { 'Authorization': `Bearer ${token}` } });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
        setRecentUsers(statsData.recentUsers || []);
      }

      const dashDataResponse = await fetch('/api/admin/dashdata', { headers: { 'Authorization': `Bearer ${token}` } });
      if (dashDataResponse.ok) {
        const dashDataResult = await dashDataResponse.json();
        setDashData(dashDataResult.data || []);
      }

      const loginAttemptsResponse = await fetch('/api/admin/loginattempts', { headers: { 'Authorization': `Bearer ${token}` } });
      if (loginAttemptsResponse.ok) {
        const loginAttemptsResult = await loginAttemptsResponse.json();
        setLoginAttempts(loginAttemptsResult.data || []);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load contents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockUser = async (email: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/admin/loginattempts/unlock', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      await fetchAllData();
    } catch (error) {
      setError('Failed to unlock user. Please try again.');
    }
  };

  if (isLoading) return <AdminDashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className='md:ml-9'><p className="text-md font-bold text-cyan-600/80">Overview</p></div>
          <div className='md:ml-9'><Analytic /></div>
          <div className="flex items-center gap-3">
            <div onClick={fetchAllData} className="flex items-center gap-2 rounded-lg bg-cyan-600/20 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-600/30">
              <RefreshCw className="h-4 w-4" /> Refresh
            </div>
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              <Shield className="h-3 w-3" /> Admin
            </span>
          </div>
        </div>

        {/* Error */}
        {error && <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-center text-red-600">{error}</div>}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} color="blue" />
          <StatCard icon={UserCheck} label="Active Users" value={stats?.activeUsers || 0} color="green" />
          <StatCard icon={Lock} label="Locked Accounts" value={stats?.lockedUsers || 0} color="red" />
          <StatCard icon={Database} label="Dash Data Items" value={dashData.length} color="purple" />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-cyan-200/30">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'border-b-2 border-cyan-600 text-cyan-900' : 'text-cyan-700 hover:text-cyan-900'}`}>Overview</button>
          <button onClick={() => setActiveTab('dashdata')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'dashdata' ? 'border-b-2 border-cyan-600 text-cyan-900' : 'text-cyan-700 hover:text-cyan-900'}`}><Table className="inline h-4 w-4 mr-1" />dashData ({dashData.length})</button>
          <button onClick={() => setActiveTab('loginattempts')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'loginattempts' ? 'border-b-2 border-cyan-600 text-cyan-900' : 'text-cyan-700 hover:text-cyan-900'}`}><Lock className="inline h-4 w-4 mr-1" />login_attempts ({loginAttempts.length})</button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab recentUsers={recentUsers} />}
        {activeTab === 'dashdata' && <DashDataTab data={dashData} onEdit={() => {}} onDelete={() => {}} />}
        {activeTab === 'loginattempts' && <LoginAttemptsTab data={loginAttempts} onUnlock={handleUnlockUser} />}

        {/* Edit Modal */}
        {isEditing && editingItem && (
          <EditModal item={editingItem} onSave={() => {}} onCancel={() => { setIsEditing(false); setEditingItem(null); }} onChange={setEditingItem} />
        )}
      </motion.div>
    </div>
  );
}

// ---- StatCard Component ----------------------------------------------------
function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600', green: 'bg-emerald-500/10 text-emerald-600',
    red: 'bg-red-500/10 text-red-600', purple: 'bg-purple-500/10 text-purple-600',
    emerald: 'bg-emerald-500/10 text-emerald-600', orange: 'bg-orange-500/10 text-orange-600',
    indigo: 'bg-indigo-500/10 text-indigo-600', teal: 'bg-teal-500/10 text-teal-600',
  };
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-3 ${colorClasses[color] || colorClasses.blue}`}><Icon className="h-5 w-5" /></div>
        <div><p className="text-xs text-cyan-700">{label}</p><p className="text-2xl font-bold text-cyan-900">{value}</p></div>
      </div>
    </motion.div>
  );
}

// ---- Overview Tab ---------------------------------------------------------
function OverviewTab({ recentUsers }: { recentUsers: RecentUser[] }) {
  return (
    <div className="rounded-2xl bg-[#C4F8FD] p-6 shadow-xl backdrop-blur-sm">
      <h2 className="mb-4 text-lg font-semibold text-cyan-900">Recent Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-cyan-200/30 text-left"><th className="px-4 py-2 text-cyan-700">User</th><th className="px-4 py-2 text-cyan-700">Email</th><th className="px-4 py-2 text-cyan-700">Role</th><th className="px-4 py-2 text-cyan-700">Status</th><th className="px-4 py-2 text-cyan-700">Joined</th></tr></thead>
          <tbody>
            {recentUsers.length === 0 ? (<tr><td colSpan={5} className="px-4 py-8 text-center text-cyan-600">No users found</td></tr>) : (
              recentUsers.map((user) => (
                <tr key={user._id} className="border-b border-cyan-200/10 hover:bg-cyan-200/20">
                  <td className="px-4 py-2 text-cyan-900">{user.displayName || user.username}</td>
                  <td className="px-4 py-2"><Link href={`/me/users/${user._id}`} className="text-cyan-700 hover:text-cyan-900 hover:underline font-medium">{user.email}</Link></td>
                  <td className="px-4 py-2"><span className={`rounded-full px-2 py-1 text-xs font-medium ${user.isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{user.isAdmin ? 'Admin' : 'User'}</span></td>
                  <td className="px-4 py-2"><span className={`rounded-full px-2 py-1 text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-2 text-cyan-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- DashData Tab ---------------------------------------------------------
function DashDataTab({ data, onEdit, onDelete }: { data: DashDataItem[]; onEdit: (item: DashDataItem) => void; onDelete: (id: string) => void; }) {
  return (
    <div className="rounded-2xl bg-[#C4F8FD] p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-cyan-900">dashData Collection</h2><span className="text-sm text-cyan-700">{data.length} items</span></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-cyan-200/30 text-left"><th className="px-4 py-2 text-cyan-700">Title/Name</th><th className="px-4 py-2 text-cyan-700">Bills</th><th className="px-4 py-2 text-cyan-700">Transactions</th><th className="px-4 py-2 text-cyan-700">Pay Methods</th><th className="px-4 py-2 text-cyan-700">Preferences</th><th className="px-4 py-2 text-cyan-700">Status</th><th className="px-4 py-2 text-cyan-700">Actions</th></tr></thead>
          <tbody>
            {data.length === 0 ? (<tr><td colSpan={7} className="px-4 py-8 text-center text-cyan-600">No data found in dashData collection</td></tr>) : (
              data.map((item) => (
                <tr key={item._id} className="border-b border-cyan-200/10 hover:bg-cyan-200/20">
                  <td className="px-4 py-2 text-cyan-900">{item.title || item.name || 'Untitled'}</td>
                  <td className="px-4 py-2 text-cyan-700"><div className="flex items-center gap-1"><FileText className="h-3 w-3" />{item.bills?.length || 0}</div></td>
                  <td className="px-4 py-2 text-cyan-700"><div className="flex items-center gap-1"><Activity className="h-3 w-3" />{item.recentTransactions?.length || 0}</div></td>
                  <td className="px-4 py-2 text-cyan-700"><div className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{item.paymentMethods?.length || 0}</div></td>
                  <td className="px-4 py-2 text-cyan-700">{item.preferences ? <span className="rounded bg-cyan-100 px-2 py-0.5 text-xs">{Object.keys(item.preferences).length} keys</span> : '—'}</td>
                  <td className="px-4 py-2"><span className={`rounded-full px-2 py-1 text-xs font-medium ${item.enabled !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{item.enabled !== false ? 'Enabled' : 'Disabled'}</span></td>
                  <td className="px-4 py-2"><div className="flex items-center gap-2">
                    <button onClick={() => onEdit(item)} className="rounded p-1 text-blue-600 hover:bg-blue-600/10"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(item._id)} className="rounded p-1 text-red-600 hover:bg-red-600/10"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- LoginAttempts Tab (Updated to parse merged data safely) ----------------
function LoginAttemptsTab({ data, onUnlock }: { data: LoginAttempt[]; onUnlock: (email: string) => void; }) {
  return (
    <div className="rounded-2xl bg-[#C4F8FD] p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-cyan-900">Locked Accounts & Login Attempts</h2><span className="text-sm text-cyan-700">{data.length} records</span></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-cyan-200/30 text-left"><th className="px-4 py-2 text-cyan-700">Email</th><th className="px-4 py-2 text-cyan-700">Attempts</th><th className="px-4 py-2 text-cyan-700">Last Attempt</th><th className="px-4 py-2 text-cyan-700">Status</th><th className="px-4 py-2 text-cyan-700">Actions</th></tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-cyan-600">No locked users or login attempts found</td></tr>
            ) : (
              data.map((item) => {
                const lockUntil = item.lockedUntil ? new Date(item.lockedUntil) : null;
                const isLocked = lockUntil && lockUntil > new Date();
                return (
                  <tr key={item._id} className="border-b border-cyan-200/10 hover:bg-cyan-200/20">
                    <td className="px-4 py-2 text-cyan-900">{item.email}</td>
                    <td className="px-4 py-2 text-cyan-700">{item.attempts}</td>
                    <td className="px-4 py-2 text-cyan-700">{item.lastAttempt ? new Date(item.lastAttempt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-2">
                      {isLocked ? <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Locked</span> : <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Active</span>}
                    </td>
                    <td className="px-4 py-2">
                      {isLocked && <button onClick={() => onUnlock(item.email)} className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-500/30"><Unlock className="h-3 w-3" /> Unlock</button>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Edit Modal -----------------------------------------------------------
function EditModal({ item, onSave, onCancel, onChange }: { item: DashDataItem; onSave: () => void; onCancel: () => void; onChange: (item: DashDataItem) => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold text-cyan-900">Edit Item</h3><div onClick={onCancel} className="text-cyan-600 hover:text-cyan-800"><X className="h-5 w-5" /></div></div>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-cyan-700">Title</label><input type="text" value={item.title || item.name || ''} onChange={(e) => onChange({ ...item, title: e.target.value })} className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" /></div>
          <div><label className="block text-xs font-medium text-cyan-700">Type</label><input type="text" value={item.type || ''} onChange={(e) => onChange({ ...item, type: e.target.value })} className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" /></div>
          <div><label className="block text-xs font-medium text-cyan-700">Value</label><textarea value={typeof item.value === 'object' ? JSON.stringify(item.value, null, 2) : item.value || ''} onChange={(e) => { try { const parsed = JSON.parse(e.target.value); onChange({ ...item, value: parsed }); } catch { onChange({ ...item, value: e.target.value }); } }} className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" rows={4} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={item.enabled !== false} onChange={(e) => onChange({ ...item, enabled: e.target.checked })} className="h-4 w-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500" /><label className="text-sm text-cyan-700">Enabled</label></div>
        </div>
        <div className="mt-6 flex gap-3">
          <div onClick={onSave} className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"><Check className="inline h-4 w-4 mr-1" />Save Changes</div>
          <div onClick={onCancel} className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300">Cancel</div>
        </div>
      </motion.div>
    </div>
  );
}

// ---- Skeleton Loading -----------------------------------------------------
function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
        </div>
      </div>
    // <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6">
    //   <div className="mx-auto max-w-7xl">
    //     <div className="mb-8"><div className="h-10 w-48 animate-pulse rounded-xl bg-[#C4F8FD]" /><div className="mt-2 h-5 w-32 animate-pulse rounded bg-[#C4F8FD]" /></div>
    //     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    //       {[...Array(4)].map((_, i) => (<div key={i} className="h-24 animate-pulse rounded-2xl bg-[#C4F8FD]" />))}
    //     </div>
    //     <div className="mt-8"><div className="mb-4 flex gap-4"><div className="h-10 w-24 animate-pulse rounded bg-[#C4F8FD]" /><div className="h-10 w-24 animate-pulse rounded bg-[#C4F8FD]" /><div className="h-10 w-24 animate-pulse rounded bg-[#C4F8FD]" /></div><div className="h-96 animate-pulse rounded-2xl bg-[#C4F8FD]" /></div>
    //   </div>
    // </div>
  );
}