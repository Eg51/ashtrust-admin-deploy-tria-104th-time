
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Users,
  UserCheck,
  UserX,
  Shield,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Star,
  Zap,
  Activity,
  Clock,
  Calendar,
  Globe,
  Smartphone,
  Laptop,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ---- Types ----------------------------------------------------------------

interface ChartData {
  label: string;
  value: number;
  color: string;
  gradient: string;
  icon?: React.ReactNode;
}

interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  verifiedUsers: number;
  totalSessions: number;
  activeSessions: number;
  portfolioValue: string;
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  pendingBills: number;
  overdueBills: number;
  totalTransactions: number;
  totalInvestments: number;
}

// ---- Constants ------------------------------------------------------------

const PIE_CHART_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-cyan-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-indigo-400 to-violet-500",
  "from-cyan-400 to-sky-500",
  "from-lime-400 to-green-500",
];

const SEGMENT_ICONS = [
  <Users key="users" size={16} />,
  <UserCheck key="active" size={16} />,
  <UserX key="inactive" size={16} />,
  <Shield key="admin" size={16} />,
  <CreditCard key="bills" size={16} />,
  <Wallet key="portfolio" size={16} />,
  <Activity key="sessions" size={16} />,
  <TrendingUp key="growth" size={16} />,
];

// ---- Main Component -------------------------------------------------------

export default function ThreeDChart() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // ---- Fetch Data ---------------------------------------------------------

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');

      // Fetch from multiple endpoints
      const [dashboardRes, sessionsRes, billsRes] = await Promise.all([
        fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/admin/sessions', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/admin/bills', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const dashboardData = await dashboardRes.json();
      const sessionsData = await sessionsRes.json();
      const billsData = await billsRes.json();

      // Combine data
      const stats = dashboardData.stats || {};
      const sessions = sessionsData.sessions || [];
      const bills = billsData.bills || [];

      const summaryData: DashboardSummary = {
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.activeUsers || 0,
        inactiveUsers: (stats.totalUsers || 0) - (stats.activeUsers || 0),
        adminUsers: stats.adminUsers || 0,
        verifiedUsers: stats.verifiedUsers || 0,
        totalSessions: sessions.length || 0,
        activeSessions: sessions.filter((s: any) => s.isActive !== false).length || 0,
        portfolioValue: stats.portfolioValue || "$0.00",
        totalBills: bills.length || 0,
        paidBills: bills.filter((b: any) => b.status === "paid").length || 0,
        unpaidBills: bills.filter((b: any) => b.status === "unpaid").length || 0,
        pendingBills: bills.filter((b: any) => b.status === "pending").length || 0,
        overdueBills: bills.filter((b: any) => b.status === "overdue").length || 0,
        totalTransactions: 0,
        totalInvestments: 0,
      };

      setSummary(summaryData);

    } catch (error) {
      console.error('Error fetching summary:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---- Effects ------------------------------------------------------------

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Auto-rotation
  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // ---- Generate Chart Data ------------------------------------------------

  const generateChartData = useCallback((): ChartData[] => {
    if (!summary) return [];

    const data: ChartData[] = [
      {
        label: "Active Users",
        value: summary.activeUsers,
        color: "from-emerald-400 to-teal-500",
        gradient: "from-emerald-400 via-teal-400 to-emerald-500",
        icon: <UserCheck size={16} />,
      },
      {
        label: "Inactive Users",
        value: summary.inactiveUsers,
        color: "from-red-400 to-rose-500",
        gradient: "from-red-400 via-rose-400 to-red-500",
        icon: <UserX size={16} />,
      },
      {
        label: "Admin Users",
        value: summary.adminUsers,
        color: "from-purple-400 to-violet-500",
        gradient: "from-purple-400 via-violet-400 to-purple-500",
        icon: <Shield size={16} />,
      },
      {
        label: "Active Sessions",
        value: summary.activeSessions,
        color: "from-blue-400 to-cyan-500",
        gradient: "from-blue-400 via-cyan-400 to-blue-500",
        icon: <Activity size={16} />,
      },
      {
        label: "Paid Bills",
        value: summary.paidBills,
        color: "from-emerald-400 to-green-500",
        gradient: "from-emerald-400 via-green-400 to-emerald-500",
        icon: <CreditCard size={16} />,
      },
      {
        label: "Unpaid Bills",
        value: summary.unpaidBills,
        color: "from-amber-400 to-orange-500",
        gradient: "from-amber-400 via-orange-400 to-amber-500",
        icon: <AlertCircle size={16} />,
      },
      {
        label: "Pending Bills",
        value: summary.pendingBills,
        color: "from-sky-400 to-blue-500",
        gradient: "from-sky-400 via-blue-400 to-sky-500",
        icon: <Clock size={16} />,
      },
      {
        label: "Overdue Bills",
        value: summary.overdueBills,
        color: "from-rose-400 to-red-500",
        gradient: "from-rose-400 via-red-400 to-rose-500",
        icon: <AlertCircle size={16} />,
      },
    ];

    return data.filter((d) => d.value > 0);
  }, [summary]);

  const chartData = generateChartData();
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  // ---- Calculate Segment Angles -------------------------------------------

  const getSegments = () => {
    if (chartData.length === 0 || total === 0) return [];

    let currentAngle = 0;
    return chartData.map((data) => {
      const percentage = (data.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const start = currentAngle;
      const end = currentAngle + angle;
      currentAngle += angle;

      return {
        ...data,
        percentage,
        start,
        end,
        angle,
        mid: start + angle / 2,
        isActive: false,
      };
    });
  };

  const segments = getSegments();

  // ---- Render SVG Pie Chart -----------------------------------------------

  const renderPieChart = () => {
    if (segments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-cyan-600">
          <PieChart size={48} className="mb-2 opacity-30" />
          <p className="text-sm">No data available</p>
        </div>
      );
    }

    const size = 300;
    const center = size / 2;
    const radius = 130;
    const innerRadius = 50;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {segments.map((seg, i) => (
            <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={seg.color.split(' ')[0]} />
              <stop offset="100%" className={seg.color.split(' ')[1]} />
            </linearGradient>
          ))}
        </defs>

        <g transform={`rotate(${rotation}, ${center}, ${center})`}>
          {segments.map((seg, i) => {
            const startAngle = (seg.start - 90) * (Math.PI / 180);
            const endAngle = (seg.end - 90) * (Math.PI / 180);

            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);

            const largeArc = seg.angle > 180 ? 1 : 0;

            const path = [
              `M ${center} ${center}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
              `Z`,
            ].join(' ');

            const labelAngle = (seg.mid - 90) * (Math.PI / 180);
            const labelRadius = radius * 0.65;
            const lx = center + labelRadius * Math.cos(labelAngle);
            const ly = center + labelRadius * Math.sin(labelAngle);

            const isHovered = activeSegment === i;

            return (
              <motion.g
                key={i}
                whileHover={{ scale: 1.1 }}
                onHoverStart={() => setActiveSegment(i)}
                onHoverEnd={() => setActiveSegment(null)}
                onClick={() => setActiveSegment(isHovered ? null : i)}
              >
                <path
                  d={path}
                  fill={`url(#grad-${i})`}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    opacity: activeSegment === null || activeSegment === i ? 1 : 0.4,
                    filter: isHovered ? 'brightness(1.1)' : 'none',
                  }}
                />

                {isHovered && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      className="text-xs font-bold"
                    >
                      {seg.percentage.toFixed(1)}%
                    </text>
                  </motion.g>
                )}
              </motion.g>
            );
          })}

          {/* Center circle (donut hole) */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="rgba(196, 248, 253, 0.6)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgb(21, 94, 117)"
            className="text-lg font-bold"
          >
            Total
          </text>
          <text
            x={center}
            y={center + 18}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgb(21, 94, 117)"
            className="text-sm font-bold"
          >
            {total}
          </text>
        </g>
      </svg>
    );
  };

  // ---- Loading State ------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
          <p className="mt-4 text-sm text-cyan-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ---- Render -------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="text-2xl font-bold text-cyan-900 flex items-center gap-2">
              <PieChart size={24} className="text-cyan-700" />
              Overview
            </h1>
            <p className="text-sm text-cyan-700">
              visualize your users
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isAutoRotating
                  ? 'bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30'
                  : 'bg-gray-500/20 text-gray-700 hover:bg-gray-500/30'
              }`}
            >
              <Zap size={16} />
              {isAutoRotating ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF'}
            </button>
            <button
              onClick={fetchSummary}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600/20 px-3 py-1.5 text-sm font-medium text-cyan-700 hover:bg-cyan-600/30 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 3D Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] p-6 shadow-xl border-none"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-cyan-900 flex items-center gap-2">
                <PieChart size={16} />
                Interactive 3D Chart
              </h2>
              <span className="text-xs text-cyan-600">
                {total} total • {chartData.length} segments
              </span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {renderPieChart()}

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/10 via-purple-400/10 to-pink-400/10 blur-2xl -z-10" />
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {segments.map((seg, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all duration-300 cursor-pointer ${
                      activeSegment === i
                        ? 'bg-white/50 shadow-lg'
                        : 'hover:bg-white/30'
                    }`}
                    onMouseEnter={() => setActiveSegment(i)}
                    onMouseLeave={() => setActiveSegment(null)}
                    onClick={() => setActiveSegment(activeSegment === i ? null : i)}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${seg.color}`} />
                    <span className="text-cyan-800">{seg.label}</span>
                    <span className="font-bold text-cyan-900">{seg.value}</span>
                    <span className="text-cyan-600">({seg.percentage.toFixed(1)}%)</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] p-5 shadow-xl border-none">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-cyan-900">Users</h3>
                <Users size={16} className="text-cyan-600" />
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-700">Total</span>
                  <span className="font-bold text-cyan-900">{summary?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-700">Active</span>
                  <span className="font-bold text-emerald-600">{summary?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-700">Admins</span>
                  <span className="font-bold text-purple-600">{summary?.adminUsers || 0}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-cyan-200/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(summary?.activeUsers || 0) / (summary?.totalUsers || 1) * 100}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] p-5 shadow-xl border-none">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-cyan-900">Bills</h3>
                <CreditCard size={16} className="text-cyan-600" />
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-700">Total</span>
                  <span className="font-bold text-cyan-900">{summary?.totalBills || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-700">Paid</span>
                  <span className="font-bold text-emerald-600">{summary?.paidBills || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-700">Overdue</span>
                  <span className="font-bold text-red-600">{summary?.overdueBills || 0}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-cyan-200/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(summary?.paidBills || 0) / (summary?.totalBills || 1) * 100}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] p-5 shadow-xl border-none">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-cyan-900">Sessions</h3>
                <Activity size={16} className="text-cyan-600" />
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-700">Total</span>
                  <span className="font-bold text-cyan-900">{summary?.totalSessions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-700">Active</span>
                  <span className="font-bold text-emerald-600">{summary?.activeSessions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-700">Portfolio</span>
                  <span className="font-bold text-cyan-900">{summary?.portfolioValue || "$0.00"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { label: "Users", icon: <Users size={18} />, href: "/admin/users", color: "from-blue-400 to-cyan-500" },
            { label: "Analytics", icon: <Activity size={18} />, href: "/admin/analytics", color: "from-purple-400 to-pink-500" },
            { label: "Bills", icon: <CreditCard size={18} />, href: "/admin/bills", color: "from-emerald-400 to-teal-500" },
            { label: "Settings", icon: <Shield size={18} />, href: "/admin/settings", color: "from-amber-400 to-orange-500" },
          ].map((item, index) => (
            <Link key={index} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`rounded-2xl bg-gradient-to-br ${item.color} p-4 shadow-xl border-none hover:shadow-2xl transition-all duration-300 cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/30 p-2 text-cyan-900">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-end">
                  <ArrowUpRight size={16} className="text-white/70" />
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}