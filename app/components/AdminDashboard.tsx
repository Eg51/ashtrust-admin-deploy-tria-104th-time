// "use client";

// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Users,
//   UserCheck,
//   Lock,
//   Database,
//   Table,
//   Unlock,
//   Edit,
//   Trash2,
//   X,
//   Check,
//   RefreshCw,
//   Shield,
//   CreditCard,
//   FileText,
//   Activity,
//   LogOut,
// } from 'lucide-react';
// import Link from 'next/link';
// import Analytic from '@/app/components/Analytic';
// import AnimatedCard from '@/app/components/charts/AnimatedCard';
// import UserHealthDonut from '@/app/components/charts/UserHealthDonut';
// import UserGrowthLine from '@/app/components/charts/UserGrowthLine';

// // ---- Types ----------------------------------------------------------------
// interface DashDataItem {
//   _id: string;
//   type?: string;
//   title?: string;
//   name?: string;
//   value?: any;
//   enabled?: boolean;
//   bills: any[];
//   recentTransactions: any[];
//   paymentMethods: any[];
//   preferences: Record<string, any>;
//   createdAt: string;
//   updatedAt: string;
// }

// interface LoginAttempt {
//   _id: string;
//   email: string;
//   attempts: number;
//   lastAttempt: string;
//   lockedUntil?: string;
//   source?: string;
// }

// interface RecentUser {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   username: string;
//   displayName: string;
//   email: string;
//   role: string;
//   isActive: boolean;
//   isVerified: boolean;
//   isAdmin: boolean;
//   createdAt: string;
// }

// interface StatCardProps {
//   icon: React.ComponentType<{ className?: string }>;
//   label: string;
//   value: number | string;
//   color: 'blue' | 'green' | 'red' | 'purple' | 'emerald' | 'orange' | 'indigo' | 'teal';
// }

// // ---- Main Component -------------------------------------------------------
// export default function AdminDashboard() {
//   const [stats, setStats] = useState<any>(null);
//   const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
//   const [dashData, setDashData] = useState<DashDataItem[]>([]);
//   const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'overview' | 'dashdata' | 'loginattempts'>('overview');
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingItem, setEditingItem] = useState<DashDataItem | null>(null);

//   useEffect(() => { fetchAllData(); }, []);

//   const fetchAllData = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem('auth_token');

//       const statsResponse = await fetch('/api/admin/dashboard', { headers: { 'Authorization': `Bearer ${token}` } });
//       if (statsResponse.ok) {
//         const statsData = await statsResponse.json();
//         setStats(statsData.stats);
//         setRecentUsers(statsData.recentUsers || []);
//       }

//       const dashDataResponse = await fetch('/api/admin/dashdata', { headers: { 'Authorization': `Bearer ${token}` } });
//       if (dashDataResponse.ok) {
//         const dashDataResult = await dashDataResponse.json();
//         setDashData(dashDataResult.data || []);
//       }

//       const loginAttemptsResponse = await fetch('/api/admin/loginattempts', { headers: { 'Authorization': `Bearer ${token}` } });
//       if (loginAttemptsResponse.ok) {
//         const loginAttemptsResult = await loginAttemptsResponse.json();
//         setLoginAttempts(loginAttemptsResult.data || []);
//       }

//     } catch (error) {
//       console.error('Error fetching admin data:', error);
//       setError('Failed to load contents. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUnlockUser = async (email: string) => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       await fetch('/api/admin/loginattempts/unlock', {
//         method: 'POST',
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });
//       await fetchAllData();
//     } catch (error) {
//       setError('Failed to unlock user. Please try again.');
//     }
//   };

//   // ✅ NEW: Log out — clears server session and client state, then redirects
//   const handleLogout = async () => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       await fetch('/api/auth/logout', {
//         method: 'POST',
//         headers: {
//           'Authorization': token ? `Bearer ${token}` : '',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ everywhere: false }),
//         credentials: 'include',
//       });
//     } catch {
//       // best-effort — clear client state regardless
//     }
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('user');
//     window.location.href = '/log-in';
//   };

//   if (isLoading) return <AdminDashboardSkeleton />;

//   return (
//     <div id="admin-overview" className="space-y-6 scroll-mt-24">
//       {/* <div className="flex items-center gap-3">
//           <h1 className="text-xl font-bold text-cyan-900 sm:text-2xl">Overview</h1>
         
//         </div> */}
//       {/* Header bar — not a card, sits on the page background */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        

//         <div className="flex flex-wrap items-center gap-2">
         
         
//         <Analytic />
         
         
         
         
//           {/* <button
//             onClick={handleLogout}
//             className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-cyan-700 shadow-sm transition-all hover:bg-white hover:text-cyan-900"
//           >
//             <LogOut className="h-3.5 w-3.5" />
//             Log out
//           </button> */}

//           <button
//             onClick={fetchAllData}
//             className="flex items-center gap-1.5 rounded-full bg-cyan-600/20 px-3 py-1.5 text-xs font-semibold text-cyan-700 shadow-sm transition-all hover:bg-cyan-600/30"
//           >
//             <RefreshCw className="h-3.5 w-3.5" />
//             Refresh
//           </button>

//           <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm">
//             <Shield className="h-3 w-3" />
//             Admin
//           </span>
//         </div>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm font-medium text-red-600">
//           {error}
//         </div>
//       )}

//       {/* Stats Grid — 2 cols mobile, 4 cols desktop */}
//       {/* <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//         <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} color="blue" />
//         <StatCard icon={UserCheck} label="Active Users" value={stats?.activeUsers || 0} color="green" />
//         <StatCard icon={Lock} label="Locked Accounts" value={stats?.lockedUsers || 0} color="red" />
//         <StatCard icon={Database} label="Dash Data Items" value={dashData.length} color="purple" />
//       </div> */}

//       {/* Charts Row — line 2/3 + donut 1/3 on desktop, stacked on mobile/tablet */}
//       <div id="admin-charts" className="grid grid-cols-1 gap-4 scroll-mt-24 lg:grid-cols-3">
//         <AnimatedCard
//           delay={0.05}
//           className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6 lg:col-span-2"
//         >
//           <div className="mb-4 flex items-center justify-between">
//             <div>
//               <h2 className="text-base font-bold text-cyan-900 sm:text-lg">User Growth</h2>
//               <p className="text-[11px] text-cyan-700/70">New signups — last 30 days</p>
//             </div>
//             <span className="rounded-md bg-white/50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">30D</span>
//           </div>
//           <UserGrowthLine days={30} />
//         </AnimatedCard>

//         <AnimatedCard
//           delay={0.15}
//           className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6"
//         >
//           <h2 className="mb-4 text-base font-bold text-cyan-900 sm:text-lg">User Health</h2>
//           <UserHealthDonut
//             totalUsers={stats?.totalUsers || 0}
//             activeUsers={stats?.activeUsers || 0}
//             lockedUsers={stats?.lockedUsers || 0}
//           />
//         </AnimatedCard>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-1 overflow-x-auto border-b border-cyan-900/10 pb-1">
//         <button
//           onClick={() => setActiveTab('overview')}
//           className={`whitespace-nowrap px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
//             activeTab === 'overview'
//               ? 'border-b-2 border-cyan-600 text-cyan-900'
//               : 'text-cyan-700/70 hover:text-cyan-900'
//           }`}
//         >
//           Overview
//         </button>
//         <button
//           onClick={() => setActiveTab('dashdata')}
//           className={`flex items-center gap-1 whitespace-nowrap px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
//             activeTab === 'dashdata'
//               ? 'border-b-2 border-cyan-600 text-cyan-900'
//               : 'text-cyan-700/70 hover:text-cyan-900'
//           }`}
//         >
//           <Table className="h-3.5 w-3.5" />
//           dashData ({dashData.length})
//         </button>
//         <button
//           onClick={() => setActiveTab('loginattempts')}
//           className={`flex items-center gap-1 whitespace-nowrap px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
//             activeTab === 'loginattempts'
//               ? 'border-b-2 border-cyan-600 text-cyan-900'
//               : 'text-cyan-700/70 hover:text-cyan-900'
//           }`}
//         >
//           <Lock className="h-3.5 w-3.5" />
//           login_attempts ({loginAttempts.length})
//         </button>
//       </div>

//       {/* Tab Content */}
//       {activeTab === 'overview' && <OverviewTab recentUsers={recentUsers} />}
//       {activeTab === 'dashdata' && <DashDataTab data={dashData} onEdit={() => {}} onDelete={() => {}} />}
//       {activeTab === 'loginattempts' && <LoginAttemptsTab data={loginAttempts} onUnlock={handleUnlockUser} />}

//       {/* Edit Modal */}
//       {isEditing && editingItem && (
//         <EditModal
//           item={editingItem}
//           onSave={() => {}}
//           onCancel={() => { setIsEditing(false); setEditingItem(null); }}
//           onChange={setEditingItem}
//         />
//       )}
//     </div>
//   );
// }

// // ---- StatCard — label + icon on top, big value below ---------------------
// function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
//   const colorClasses: Record<string, string> = {
//     blue: 'bg-blue-500/20 text-blue-600',
//     green: 'bg-emerald-500/20 text-emerald-600',
//     red: 'bg-rose-500/20 text-rose-600',
//     purple: 'bg-purple-500/20 text-purple-600',
//     emerald: 'bg-emerald-500/20 text-emerald-600',
//     orange: 'bg-orange-500/20 text-orange-600',
//     indigo: 'bg-indigo-500/20 text-indigo-600',
//     teal: 'bg-teal-500/20 text-teal-600',
//   };

//   return (
//     <motion.div
//       whileHover={{ scale: 1.02 }}
//       className="rounded-2xl bg-[#C4F8FD] p-3.5 shadow-xl backdrop-blur-sm sm:p-4"
//     >
//       <div className="flex items-start justify-between">
//         <span className="text-[11px] font-medium text-cyan-700 sm:text-xs">{label}</span>
//         <div className={`rounded-xl p-1.5 ${colorClasses[color] || colorClasses.blue}`}>
//           <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//         </div>
//       </div>
//       <div className="mt-3">
//         <span className="text-2xl font-bold tracking-tight text-cyan-900">{value}</span>
//       </div>
//     </motion.div>
//   );
// }

// // ---- Overview Tab — Recent Users as card list ----------------------------
// function OverviewTab({ recentUsers }: { recentUsers: RecentUser[] }) {
//   return (
//     <div id="admin-recent-users" className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm scroll-mt-24 sm:p-6">
//       <div className="mb-4 flex items-center justify-between">
//         <h2 className="text-base font-bold text-cyan-900 sm:text-lg">Recent Users</h2>
//         <span className="text-[11px] font-semibold text-cyan-700/70 sm:text-xs">
//           {recentUsers.length} shown
//         </span>
//       </div>

//       {recentUsers.length === 0 ? (
//         <p className="py-8 text-center text-sm text-cyan-600">No users found</p>
//       ) : (
//         <div className="space-y-3">
//           {recentUsers.map((user) => (
//             <Link key={user._id} href={`/me/users/${user._id}`} className="block">
//               <motion.div
//                 whileHover={{ scale: 1.01 }}
//                 className="flex items-start justify-between gap-3 rounded-xl bg-white/40 p-3 transition-colors hover:bg-white/60 sm:p-4"
//               >
//                 <div className="min-w-0 flex-1">
//                   <p className="truncate text-sm font-bold text-cyan-900">
//                     {user.displayName || user.username}
//                   </p>
//                   <p className="truncate text-[11px] text-cyan-600 sm:text-xs">{user.email}</p>
//                   <p className="mt-0.5 text-[10px] text-cyan-500/70">
//                     Joined: {new Date(user.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <div className="flex flex-col items-end gap-1">
//                   <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
//                     user.isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
//                   }`}>
//                     {user.isAdmin ? 'Admin' : 'User'}
//                   </span>
//                   <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
//                     user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
//                   }`}>
//                     {user.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>
//               </motion.div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ---- DashData Tab (table — dense data) -----------------------------------
// function DashDataTab({ data, onEdit, onDelete }: { data: DashDataItem[]; onEdit: (item: DashDataItem) => void; onDelete: (id: string) => void; }) {
//   return (
//     <div className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6">
//       <div className="mb-4 flex items-center justify-between">
//         <h2 className="text-base font-bold text-cyan-900 sm:text-lg">dashData Collection</h2>
//         <span className="text-[11px] font-semibold text-cyan-700/70 sm:text-xs">{data.length} items</span>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b border-cyan-900/10 text-left">
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Title/Name</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Bills</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Txns</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Pay Methods</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Prefs</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Status</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.length === 0 ? (
//               <tr><td colSpan={7} className="px-3 py-8 text-center text-cyan-600">No data found</td></tr>
//             ) : (
//               data.map((item) => (
//                 <tr key={item._id} className="border-b border-cyan-900/5 hover:bg-white/30">
//                   <td className="px-3 py-2 text-cyan-900">{item.title || item.name || 'Untitled'}</td>
//                   <td className="px-3 py-2 text-cyan-700"><div className="flex items-center gap-1"><FileText className="h-3 w-3" />{item.bills?.length || 0}</div></td>
//                   <td className="px-3 py-2 text-cyan-700"><div className="flex items-center gap-1"><Activity className="h-3 w-3" />{item.recentTransactions?.length || 0}</div></td>
//                   <td className="px-3 py-2 text-cyan-700"><div className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{item.paymentMethods?.length || 0}</div></td>
//                   <td className="px-3 py-2 text-cyan-700">{item.preferences ? <span className="rounded bg-white/50 px-2 py-0.5 text-xs">{Object.keys(item.preferences).length}</span> : '—'}</td>
//                   <td className="px-3 py-2">
//                     <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.enabled !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
//                       {item.enabled !== false ? 'Enabled' : 'Disabled'}
//                     </span>
//                   </td>
//                   <td className="px-3 py-2">
//                     <div className="flex items-center gap-1">
//                       <button onClick={() => onEdit(item)} className="rounded p-1 text-blue-600 hover:bg-blue-600/10"><Edit className="h-4 w-4" /></button>
//                       <button onClick={() => onDelete(item._id)} className="rounded p-1 text-red-600 hover:bg-red-600/10"><Trash2 className="h-4 w-4" /></button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // ---- LoginAttempts Tab (table — dense data) ------------------------------
// function LoginAttemptsTab({ data, onUnlock }: { data: LoginAttempt[]; onUnlock: (email: string) => void; }) {
//   return (
//     <div className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6">
//       <div className="mb-4 flex items-center justify-between">
//         <h2 className="text-base font-bold text-cyan-900 sm:text-lg">Locked Accounts & Login Attempts</h2>
//         <span className="text-[11px] font-semibold text-cyan-700/70 sm:text-xs">{data.length} records</span>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b border-cyan-900/10 text-left">
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Email</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Attempts</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Last Attempt</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Status</th>
//               <th className="px-3 py-2 text-xs font-bold text-cyan-700">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.length === 0 ? (
//               <tr><td colSpan={5} className="px-3 py-8 text-center text-cyan-600">No locked users or login attempts found</td></tr>
//             ) : (
//               data.map((item) => {
//                 const lockUntil = item.lockedUntil ? new Date(item.lockedUntil) : null;
//                 const isLocked = lockUntil && lockUntil > new Date();
//                 return (
//                   <tr key={item._id} className="border-b border-cyan-900/5 hover:bg-white/30">
//                     <td className="px-3 py-2 text-cyan-900">{item.email}</td>
//                     <td className="px-3 py-2 text-cyan-700">{item.attempts}</td>
//                     <td className="px-3 py-2 text-cyan-700">{item.lastAttempt ? new Date(item.lastAttempt).toLocaleString() : '—'}</td>
//                     <td className="px-3 py-2">
//                       {isLocked ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Locked</span> : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Active</span>}
//                     </td>
//                     <td className="px-3 py-2">
//                       {isLocked && (
//                         <button onClick={() => onUnlock(item.email)} className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-700 hover:bg-amber-500/30">
//                           <Unlock className="h-3 w-3" /> Unlock
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // ---- Edit Modal — unchanged -----------------------------------------------
// function EditModal({ item, onSave, onCancel, onChange }: { item: DashDataItem; onSave: () => void; onCancel: () => void; onChange: (item: DashDataItem) => void; }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl">
//         <div className="mb-4 flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-cyan-900">Edit Item</h3>
//           <button onClick={onCancel} className="text-cyan-600 hover:text-cyan-800"><X className="h-5 w-5" /></button>
//         </div>
//         <div className="space-y-4">
//           <div><label className="block text-xs font-medium text-cyan-700">Title</label><input type="text" value={item.title || item.name || ''} onChange={(e) => onChange({ ...item, title: e.target.value })} className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" /></div>
//           <div><label className="block text-xs font-medium text-cyan-700">Type</label><input type="text" value={item.type || ''} onChange={(e) => onChange({ ...item, type: e.target.value })} className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" /></div>
//           <div><label className="block text-xs font-medium text-cyan-700">Value</label><textarea value={typeof item.value === 'object' ? JSON.stringify(item.value, null, 2) : item.value || ''} onChange={(e) => { try { const parsed = JSON.parse(e.target.value); onChange({ ...item, value: parsed }); } catch { onChange({ ...item, value: e.target.value }); } }} className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" rows={4} /></div>
//           <div className="flex items-center gap-2"><input type="checkbox" checked={item.enabled !== false} onChange={(e) => onChange({ ...item, enabled: e.target.checked })} className="h-4 w-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500" /><label className="text-sm text-cyan-700">Enabled</label></div>
//         </div>
//         <div className="mt-6 flex gap-3">
//           <button onClick={onSave} className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"><Check className="inline h-4 w-4 mr-1" />Save Changes</button>
//           <button onClick={onCancel} className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300">Cancel</button>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// // ---- Skeleton — cards are cyan now ---------------------------------------
// function AdminDashboardSkeleton() {
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div className="h-8 w-32 animate-pulse rounded-lg bg-[#C4F8FD]" />
//         <div className="h-8 w-64 animate-pulse rounded-full bg-[#C4F8FD]" />
//       </div>
//       <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//         <div className="h-24 animate-pulse rounded-2xl bg-[#C4F8FD]" />
//         <div className="h-24 animate-pulse rounded-2xl bg-[#C4F8FD]" />
//         <div className="h-24 animate-pulse rounded-2xl bg-[#C4F8FD]" />
//         <div className="h-24 animate-pulse rounded-2xl bg-[#C4F8FD]" />
//       </div>
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="h-72 animate-pulse rounded-2xl bg-[#C4F8FD] lg:col-span-2" />
//         <div className="h-72 animate-pulse rounded-2xl bg-[#C4F8FD]" />
//       </div>
//       <div className="h-64 animate-pulse rounded-2xl bg-[#C4F8FD]" />
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from 'react';
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
  Activity,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import Analytic from '@/app/components/Analytic';
import AnimatedCard from '@/app/components/charts/AnimatedCard';
import UserHealthDonut from '@/app/components/charts/UserHealthDonut';
import UserGrowthLine from '@/app/components/charts/UserGrowthLine';

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

// ---- Main Component -------------------------------------------------------
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

  const fetchAllData = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Listen for external refresh trigger (dispatched by DesktopNav drawer)
  useEffect(() => {
    const handler = () => fetchAllData();
    window.addEventListener('admin:refresh', handler);
    return () => window.removeEventListener('admin:refresh', handler);
  }, [fetchAllData]);

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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ everywhere: false }),
        credentials: 'include',
      });
    } catch {
      // best-effort
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/log-in';
  };

  if (isLoading) return <AdminDashboardSkeleton />;

  return (
    <div id="admin-overview" className="space-y-6 scroll-mt-24">

      {/* Header bar — not a card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-cyan-900 sm:text-2xl">Overview</h1>
          <Analytic />
        </div> */}

        {/* Header actions — hidden on desktop (drawer handles them), visible on mobile/tablet */}
        <div className="flex flex-wrap items-center gap-2 lg:hidden">
        {/* <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-cyan-700 shadow-sm transition-all hover:bg-white hover:text-cyan-900"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button> */}

          <button
            onClick={fetchAllData}
            className="flex items-center gap-1.5 rounded-full bg-cyan-600/20 px-3 py-1.5 text-xs font-semibold text-cyan-700 shadow-sm transition-all hover:bg-cyan-600/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>

          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ── Stats Grid (temporarily disabled) ─────────────────────────
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} color="blue" />
        <StatCard icon={UserCheck} label="Active Users" value={stats?.activeUsers || 0} color="green" />
        <StatCard icon={Lock} label="Locked Accounts" value={stats?.lockedUsers || 0} color="red" />
        <StatCard icon={Database} label="Dash Data Items" value={dashData.length} color="purple" />
      </div>
      ──────────────────────────────────────────────────────────────── */}

      {/* Charts Row — line 2/3 + donut 1/3 on desktop */}
      <div id="admin-charts" className="grid grid-cols-1 gap-4 scroll-mt-24 lg:grid-cols-3">
        <AnimatedCard
          delay={0.05}
          className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-cyan-900 sm:text-lg">User Growth</h2>
              <p className="text-[11px] text-cyan-700/70">New signups — last 30 days</p>
            </div>
            <span className="rounded-md bg-white/50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">30D</span>
          </div>
          <UserGrowthLine days={30} />
        </AnimatedCard>

        <AnimatedCard
          delay={0.15}
          className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6"
        >
          <h2 className="mb-4 text-base font-bold text-cyan-900 sm:text-lg">User Health</h2>
          <UserHealthDonut
            totalUsers={stats?.totalUsers || 0}
            activeUsers={stats?.activeUsers || 0}
            lockedUsers={stats?.lockedUsers || 0}
          />
        </AnimatedCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-cyan-900/10 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`whitespace-nowrap px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
            activeTab === 'overview'
              ? 'border-b-2 border-cyan-600 text-cyan-900'
              : 'text-cyan-700/70 hover:text-cyan-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('dashdata')}
          className={`flex items-center gap-1 whitespace-nowrap px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
            activeTab === 'dashdata'
              ? 'border-b-2 border-cyan-600 text-cyan-900'
              : 'text-cyan-700/70 hover:text-cyan-900'
          }`}
        >
          <Table className="h-3.5 w-3.5" />
          dashData ({dashData.length})
        </button>
        <button
          onClick={() => setActiveTab('loginattempts')}
          className={`flex items-center gap-1 whitespace-nowrap px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
            activeTab === 'loginattempts'
              ? 'border-b-2 border-cyan-600 text-cyan-900'
              : 'text-cyan-700/70 hover:text-cyan-900'
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          login_attempts ({loginAttempts.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab recentUsers={recentUsers} />}
      {activeTab === 'dashdata' && <DashDataTab data={dashData} onEdit={() => {}} onDelete={() => {}} />}
      {activeTab === 'loginattempts' && <LoginAttemptsTab data={loginAttempts} onUnlock={handleUnlockUser} />}

      {/* Edit Modal */}
      {isEditing && editingItem && (
        <EditModal
          item={editingItem}
          onSave={() => {}}
          onCancel={() => { setIsEditing(false); setEditingItem(null); }}
          onChange={setEditingItem}
        />
      )}
    </div>
  );
}

// ---- StatCard (kept for future use) --------------------------------------
function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-600',
    green: 'bg-emerald-500/20 text-emerald-600',
    red: 'bg-rose-500/20 text-rose-600',
    purple: 'bg-purple-500/20 text-purple-600',
    emerald: 'bg-emerald-500/20 text-emerald-600',
    orange: 'bg-orange-500/20 text-orange-600',
    indigo: 'bg-indigo-500/20 text-indigo-600',
    teal: 'bg-teal-500/20 text-teal-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl bg-[#C4F8FD] p-3.5 shadow-xl backdrop-blur-sm sm:p-4"
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium text-cyan-700 sm:text-xs">{label}</span>
        <div className={`rounded-xl p-1.5 ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold tracking-tight text-cyan-900">{value}</span>
      </div>
    </motion.div>
  );
}

// ---- Overview Tab — Recent Users as card list ----------------------------
function OverviewTab({ recentUsers }: { recentUsers: RecentUser[] }) {
  return (
    <div id="admin-recent-users" className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm scroll-mt-24 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-cyan-900 sm:text-lg">Recent Users</h2>
        <span className="text-[11px] font-semibold text-cyan-700/70 sm:text-xs">
          {recentUsers.length} shown
        </span>
      </div>

      {recentUsers.length === 0 ? (
        <p className="py-8 text-center text-sm text-cyan-600">No users found</p>
      ) : (
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <Link key={user._id} href={`/me/users/${user._id}`} className="block">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex items-start justify-between gap-3 rounded-xl bg-white/40 p-3 transition-colors hover:bg-white/60 sm:p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-cyan-900">
                    {user.displayName || user.username}
                  </p>
                  <p className="truncate text-[11px] text-cyan-600 sm:text-xs">{user.email}</p>
                  <p className="mt-0.5 text-[10px] text-cyan-500/70">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    user.isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- DashData Tab (table) ------------------------------------------------
function DashDataTab({ data, onEdit, onDelete }: { data: DashDataItem[]; onEdit: (item: DashDataItem) => void; onDelete: (id: string) => void; }) {
  return (
    <div className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-cyan-900 sm:text-lg">dashData Collection</h2>
        <span className="text-[11px] font-semibold text-cyan-700/70 sm:text-xs">{data.length} items</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyan-900/10 text-left">
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Title/Name</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Bills</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Txns</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Pay Methods</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Prefs</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Status</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-cyan-600">No data found</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item._id} className="border-b border-cyan-900/5 hover:bg-white/30">
                  <td className="px-3 py-2 text-cyan-900">{item.title || item.name || 'Untitled'}</td>
                  <td className="px-3 py-2 text-cyan-700"><div className="flex items-center gap-1"><FileText className="h-3 w-3" />{item.bills?.length || 0}</div></td>
                  <td className="px-3 py-2 text-cyan-700"><div className="flex items-center gap-1"><Activity className="h-3 w-3" />{item.recentTransactions?.length || 0}</div></td>
                  <td className="px-3 py-2 text-cyan-700"><div className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{item.paymentMethods?.length || 0}</div></td>
                  <td className="px-3 py-2 text-cyan-700">{item.preferences ? <span className="rounded bg-white/50 px-2 py-0.5 text-xs">{Object.keys(item.preferences).length}</span> : '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.enabled !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {item.enabled !== false ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(item)} className="rounded p-1 text-blue-600 hover:bg-blue-600/10"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => onDelete(item._id)} className="rounded p-1 text-red-600 hover:bg-red-600/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- LoginAttempts Tab (table) -------------------------------------------
function LoginAttemptsTab({ data, onUnlock }: { data: LoginAttempt[]; onUnlock: (email: string) => void; }) {
  return (
    <div className="rounded-2xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-cyan-900 sm:text-lg">Locked Accounts & Login Attempts</h2>
        <span className="text-[11px] font-semibold text-cyan-700/70 sm:text-xs">{data.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyan-900/10 text-left">
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Email</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Attempts</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Last Attempt</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Status</th>
              <th className="px-3 py-2 text-xs font-bold text-cyan-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-cyan-600">No locked users or login attempts found</td></tr>
            ) : (
              data.map((item) => {
                const lockUntil = item.lockedUntil ? new Date(item.lockedUntil) : null;
                const isLocked = lockUntil && lockUntil > new Date();
                return (
                  <tr key={item._id} className="border-b border-cyan-900/5 hover:bg-white/30">
                    <td className="px-3 py-2 text-cyan-900">{item.email}</td>
                    <td className="px-3 py-2 text-cyan-700">{item.attempts}</td>
                    <td className="px-3 py-2 text-cyan-700">{item.lastAttempt ? new Date(item.lastAttempt).toLocaleString() : '—'}</td>
                    <td className="px-3 py-2">
                      {isLocked ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Locked</span> : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Active</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isLocked && (
                        <button onClick={() => onUnlock(item.email)} className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-700 hover:bg-amber-500/30">
                          <Unlock className="h-3 w-3" /> Unlock
                        </button>
                      )}
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

// ---- Edit Modal ----------------------------------------------------------
function EditModal({ item, onSave, onCancel, onChange }: { item: DashDataItem; onSave: () => void; onCancel: () => void; onChange: (item: DashDataItem) => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-cyan-900">Edit Item</h3>
          <button onClick={onCancel} className="text-cyan-600 hover:text-cyan-800"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-cyan-700">Title</label><input type="text" value={item.title || item.name || ''} onChange={(e) => onChange({ ...item, title: e.target.value })} className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" /></div>
          <div><label className="block text-xs font-medium text-cyan-700">Type</label><input type="text" value={item.type || ''} onChange={(e) => onChange({ ...item, type: e.target.value })} className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" /></div>
          <div><label className="block text-xs font-medium text-cyan-700">Value</label><textarea value={typeof item.value === 'object' ? JSON.stringify(item.value, null, 2) : item.value || ''} onChange={(e) => { try { const parsed = JSON.parse(e.target.value); onChange({ ...item, value: parsed }); } catch { onChange({ ...item, value: e.target.value }); } }} className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" rows={4} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={item.enabled !== false} onChange={(e) => onChange({ ...item, enabled: e.target.checked })} className="h-4 w-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500" /><label className="text-sm text-cyan-700">Enabled</label></div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onSave} className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"><Check className="inline h-4 w-4 mr-1" />Save Changes</button>
          <button onClick={onCancel} className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

// ---- Skeleton ------------------------------------------------------------
function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-[#C4F8FD]" />
        <div className="h-8 w-64 animate-pulse rounded-full bg-[#C4F8FD]" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="h-24 animate-pulse rounded-2xl bg-[#C4F8FD]" />
        <div className="h-24 animate-pulse rounded-2xl bg-[#C4F8FD]" />
        <div className="h-24 animate-pulse rounded-2xl bg-[#C4F8FD]" />
        <div className="h-24 animate-pulse rounded-2xl bg-[#C4F8FD]" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-[#C4F8FD] lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-[#C4F8FD]" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-[#C4F8FD]" />
    </div>
  );
}