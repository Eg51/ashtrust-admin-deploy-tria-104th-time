// "use client";

// import { motion } from "framer-motion";
// import { Wallet, PiggyBank, Briefcase, TrendingDown, TrendingUp, Clock } from "lucide-react";

// type SubtitleType = "negative" | "positive" | "neutral" | "warning";

// interface MetricCardProps {
//   title: string;
//   amount: string;
//   subtitle: string;
//   subtitleType: SubtitleType;
//   icon: React.ReactNode;
//   iconBg: string;
//   category: string;
//   delay?: number;
// }

// const subtitleConfig: Record<SubtitleType, { color: string; icon: React.ReactNode }> = {
//   negative: { color: "text-red-500", icon: <TrendingDown className="w-3 h-3" /> },
//   positive: { color: "text-emerald-500", icon: <TrendingUp className="w-3 h-3" /> },
//   neutral: { color: "text-slate-400", icon: null },
//   warning: { color: "text-amber-600", icon: <Clock className="w-3 h-3" /> },
// };

// const MetricCard = ({
//   title,
//   amount,
//   subtitle,
//   subtitleType,
//   icon,
//   iconBg,
//   category,
//   delay = 0,
// }: MetricCardProps) => {
//   const config = subtitleConfig[subtitleType];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 24 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay, ease: "easeOut" }}
//       whileHover={{ y: -4, boxShadow: "0 12px 40px -12px rgba(0,0,0,0.12)" }}
//       className="relative bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm cursor-default"
//     >
//       {/* Category Badge */}
//       <div className="absolute top-4 right-4 md:top-5 md:right-5">
//         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] md:text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">
//           {category}
//         </span>
//       </div>

//       {/* Icon */}
//       <motion.div
//         whileHover={{ rotate: [0, -10, 10, 0] }}
//         transition={{ duration: 0.5 }}
//         className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}
//       >
//         {icon}
//       </motion.div>

//       {/* Content */}
//       <h3 className="text-xs md:text-sm font-medium text-slate-500 mb-1">{title}</h3>
//       <p className="text-xl md:text-2xl font-bold text-slate-900 mb-3 tracking-tight">
//         {amount}
//       </p>

//       <div className={`flex items-center gap-1.5 text-xs font-medium ${config.color}`}>
//         {config.icon}
//         <span>{subtitle}</span>
//       </div>
//     </motion.div>
//   );
// };

// export default function MetricCards() {
//   const cards: MetricCardProps[] = [
//     {
//       title: "Available Balance",
//       amount: "$42,905.50",
//       subtitle: "-3.4% vs last month",
//       subtitleType: "negative",
//       icon: <Wallet className="w-5 h-5 text-cyan-600" />,
//       iconBg: "bg-cyan-50",
//       category: "Checking",
//     },
//     {
//       title: "Current Savings",
//       amount: "$158,200.00",
//       subtitle: "APY 4.05%",
//       subtitleType: "positive",
//       icon: <PiggyBank className="w-5 h-5 text-blue-600" />,
//       iconBg: "bg-blue-50",
//       category: "Savings",
//     },
//     {
//       title: "Business Funds",
//       amount: "$92,450.12",
//       subtitle: "Next tax payment 15 days",
//       subtitleType: "warning",
//       icon: <Briefcase className="w-5 h-5 text-amber-600" />,
//       iconBg: "bg-amber-50",
//       category: "Business",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
//       {cards.map((card, index) => (
//         <MetricCard key={card.title} {...card} delay={index * 0.1} />
//       ))}
//     </div>
//   );
// }

// app/dashboard/page.tsx

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  PiggyBank,
  Briefcase,
  TrendingUp,
  Clock,
  Droplets,
  Shield,
  CreditCard,
  Bell,
  Search,
  User,
  Menu,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Coffee,
  Home,
  Car,
  Utensils,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface Transaction {
  id: string;
  name: string;
  category: string;
  account: string;
  date: string;
  amount: string;
  isNegative: boolean;
  icon: React.ReactNode;
}

// ============================================================================
// DATA
// ============================================================================

const transactions: Transaction[] = [
  {
    id: "1",
    name: "Apple Store - MacBook Pro",
    category: "Technology",
    account: "Checking (1,4829)",
    date: "Oct 24, 2023",
    amount: "$2,490.00",
    isNegative: true,
    icon: <ShoppingBag size={16} />,
  },
  {
    id: "2",
    name: "Starbucks Coffee",
    category: "Food & Dining",
    account: "Checking (1,4829)",
    date: "Oct 24, 2023",
    amount: "$4.50",
    isNegative: true,
    icon: <Coffee size={16} />,
  },
  {
    id: "3",
    name: "Rent Payment",
    category: "Housing",
    account: "Savings (2,4830)",
    date: "Oct 23, 2023",
    amount: "$2,450.00",
    isNegative: true,
    icon: <Home size={16} />,
  },
  {
    id: "4",
    name: "Uber Ride",
    category: "Transportation",
    account: "Checking (1,4829)",
    date: "Oct 23, 2023",
    amount: "$24.80",
    isNegative: true,
    icon: <Car size={16} />,
  },
  {
    id: "5",
    name: "The Cheesecake Factory",
    category: "Dining",
    account: "Checking (1,4829)",
    date: "Oct 22, 2023",
    amount: "$68.50",
    isNegative: true,
    icon: <Utensils size={16} />,
  },
];

// ============================================================================
// ANIMATION VARIANTS - FIXED
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

// ✅ FIX: Added 'as const' to ease values
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: delay * 0.1, ease: "easeOut" as const },
  }),
};

const metricVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: delay * 0.1, ease: "easeOut" as const },
  }),
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: delay * 0.05, ease: "easeOut" as const },
  }),
};

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

// ============================================================================
// COLOR MAPS
// ============================================================================

const accountColorMap = {
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    icon: "bg-cyan-500/20 text-cyan-400",
    gradient: "from-cyan-400 to-cyan-600",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "bg-blue-500/20 text-blue-400",
    gradient: "from-blue-400 to-blue-600",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: "bg-purple-500/20 text-purple-400",
    gradient: "from-purple-400 to-purple-600",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "bg-emerald-500/20 text-emerald-400",
    gradient: "from-emerald-400 to-emerald-600",
  },
};

const metricColorMap = {
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    icon: "text-cyan-400",
    progress: "bg-cyan-500",
    ring: "ring-cyan-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    progress: "bg-blue-500",
    ring: "ring-blue-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: "text-purple-400",
    progress: "bg-purple-500",
    ring: "ring-purple-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    progress: "bg-emerald-500",
    ring: "ring-emerald-500/20",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: "text-orange-400",
    progress: "bg-orange-500",
    ring: "ring-orange-500/20",
  },
  pink: {
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    icon: "text-pink-400",
    progress: "bg-pink-500",
    ring: "ring-pink-500/20",
  },
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

// ---- DashboardHeader ----------------------------------------------------

function DashboardHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-800/50 bg-slate-900/80 px-4 backdrop-blur-xl sm:px-6"
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600" />
          <span className="text-lg font-bold text-white">Lumina</span>
          <span className="hidden text-xs font-medium text-slate-400 sm:inline">
            Bank
          </span>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden flex-1 items-center justify-center px-4 md:flex md:max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search accounts, transactions..."
            className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 md:hidden"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        <button className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
        </button>

        <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-semibold text-white">
            JD
          </div>
          <span className="hidden text-sm text-slate-200 sm:inline">John Doe</span>
        </button>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-16 border-b border-slate-800 bg-slate-900 p-3 md:hidden"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ---- AccountCard --------------------------------------------------------

interface AccountCardProps {
  title: string;
  balance: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: "cyan" | "blue" | "purple" | "emerald";
  delay?: number;
}

function AccountCard({
  title,
  balance,
  subtitle,
  icon,
  trend,
  color,
  delay = 0,
}: AccountCardProps) {
  const colors = accountColorMap[color];

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-4 transition-shadow hover:shadow-lg hover:shadow-cyan-500/10 sm:p-5`}
    >
      <div
        className={`absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br ${colors.gradient} opacity-5 blur-2xl`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`rounded-lg ${colors.icon} p-2`}>{icon}</div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {title}
              </p>
            </div>
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                trend.isPositive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {trend.value}
            </div>
          )}
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold text-white sm:text-3xl">{balance}</p>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        <div className="mt-3 flex items-center gap-1">
          <div className="flex h-8 items-end gap-0.5">
            {[40, 60, 45, 75, 55, 85, 70, 90, 65, 80].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-t-sm ${colors.icon} bg-current opacity-${Math.floor(height / 10)}`}
                style={{ height: `${height * 0.3 + 4}px` }}
              />
            ))}
          </div>
          <TrendingUp size={14} className="ml-1 text-slate-500" />
        </div>
      </div>
    </motion.div>
  );
}

// ---- MetricCard ---------------------------------------------------------

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "cyan" | "blue" | "purple" | "emerald" | "orange" | "pink";
  delay?: number;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  delay = 0,
}: MetricCardProps) {
  const colors = metricColorMap[color];

  return (
    <motion.div
      variants={metricVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className={`rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all hover:border-${color}-500/40 hover:shadow-lg hover:shadow-${color}-500/5 sm:p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-lg ${colors.bg} p-2.5 ${colors.icon}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ---- PortfolioMetric ----------------------------------------------------

interface PortfolioMetricProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  progress?: number;
  color: "cyan" | "blue" | "purple" | "emerald" | "orange" | "pink";
  delay?: number;
}

function PortfolioMetric({
  title,
  value,
  subtitle,
  icon,
  progress,
  color,
  delay = 0,
}: PortfolioMetricProps) {
  const colors = metricColorMap[color];

  return (
    <motion.div
      variants={metricVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className={`rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all hover:border-${color}-500/40 sm:p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-lg ${colors.bg} p-2.5 ${colors.icon}`}>
          {icon}
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 + delay * 0.1 }}
              className={`h-full rounded-full ${colors.progress}`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---- TransactionRow -----------------------------------------------------

interface TransactionRowProps {
  name: string;
  category: string;
  account: string;
  date: string;
  amount: string;
  isNegative?: boolean;
  icon: React.ReactNode;
  delay?: number;
}

function TransactionRow({
  name,
  category,
  account,
  date,
  amount,
  isNegative = true,
  icon,
  delay = 0,
}: TransactionRowProps) {
  return (
    <motion.tr
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className="group border-b border-slate-800/50 transition-colors hover:bg-slate-800/30"
    >
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{name}</p>
            <p className="text-xs text-slate-400">{category}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-2 py-3 text-sm text-slate-400 lg:table-cell">
        {category}
      </td>
      <td className="hidden px-2 py-3 text-sm text-slate-400 md:table-cell">
        {account}
      </td>
      <td className="px-2 py-3 text-sm text-slate-400">{date}</td>
      <td className="px-4 py-3 text-right">
        <span
          className={`text-sm font-medium ${
            isNegative ? "text-red-400" : "text-emerald-400"
          }`}
        >
          {isNegative ? "-" : "+"}
          {amount}
        </span>
      </td>
    </motion.tr>
  );
}

// ---- RecentTransactions -------------------------------------------------

function RecentTransactions() {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <p className="text-xs text-slate-400">Your latest transactions</p>
        </div>
        <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/10">
          View All
          <ArrowUpRight size={16} />
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="pb-3 pl-4 pr-2">Transaction</th>
              <th className="hidden px-2 pb-3 lg:table-cell">Category</th>
              <th className="hidden px-2 pb-3 md:table-cell">Account</th>
              <th className="px-2 pb-3">Date</th>
              <th className="px-4 pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <TransactionRow key={tx.id} {...tx} delay={index} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg border border-slate-800/50 bg-slate-800/30 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/50 text-slate-400">
                {tx.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{tx.name}</p>
                <p className="text-xs text-slate-400">{tx.category}</p>
              </div>
              <span
                className={`text-sm font-medium ${
                  tx.isNegative ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {tx.isNegative ? "-" : "+"}
                {tx.amount}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{tx.account}</span>
              <span>{tx.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"
      >
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Accounts Overview
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your assets and analyze financial health
          </p>
        </motion.div>

        {/* Account Cards Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AccountCard
            title="Checking"
            balance="$42,905.50"
            subtitle="Available Balance"
            icon={<Wallet size={18} />}
            trend={{ value: "+2.4% vs last month", isPositive: true }}
            color="cyan"
            delay={0}
          />git 
          <AccountCard
            title="Savings"
            balance="$158,200.00"
            subtitle="Current Savings"
            icon={<PiggyBank size={18} />}
            trend={{ value: "APY 4.65%", isPositive: true }}
            color="blue"
            delay={1}
          />
          <AccountCard
            title="Business Fund"
            balance="$92,450.12"
            subtitle="Next tax payment: 12 days"
            icon={<Briefcase size={18} />}
            color="purple"
            delay={2}
          />
        </div>

        {/* Portfolio Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Portfolio Growth"
            value="$284,500"
            subtitle="Performance over the last 6 months"
            icon={<TrendingUp size={18} />}
            color="emerald"
            delay={0}
          />
          <MetricCard
            title="Maturity"
            value="8 Months"
            icon={<Clock size={18} />}
            color="orange"
            delay={1}
          />
          <MetricCard
            title="Cash Liquidity"
            value="88%"
            subtitle="Excellent"
            icon={<Droplets size={18} />}
            color="cyan"
            delay={2}
          />
          <MetricCard
            title="Credit Risk Score"
            value="782"
            subtitle="Out of 850 · Top 5% of users"
            icon={<Shield size={18} />}
            color="pink"
            delay={3}
          />
        </div>

        {/* Recent Transactions */}
        <div className="mb-6">
          <RecentTransactions />
        </div>

        {/* Bottom Grid - Additional Widgets */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Portfolio Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-1 rounded-xl border border-slate-800/50 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-5 lg:col-span-2"
          >
            <h3 className="mb-4 text-sm font-semibold text-white">
              Portfolio Breakdown
            </h3>
            <div className="space-y-3">
              <PortfolioMetric
                title="Stocks"
                value="$142,250"
                subtitle="50% of portfolio"
                icon={<TrendingUp size={16} />}
                progress={50}
                color="cyan"
              />
              <PortfolioMetric
                title="Bonds"
                value="$85,350"
                subtitle="30% of portfolio"
                icon={<CreditCard size={16} />}
                progress={30}
                color="blue"
              />
              <PortfolioMetric
                title="Cash"
                value="$56,900"
                subtitle="20% of portfolio"
                icon={<Wallet size={16} />}
                progress={20}
                color="emerald"
              />
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-1 rounded-xl border border-slate-800/50 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-5"
          >
            <h3 className="mb-4 text-sm font-semibold text-white">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400">Total Accounts</p>
                <p className="text-xl font-bold text-white">4</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Balance</p>
                <p className="text-xl font-bold text-white">$293,555.62</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Monthly Spending</p>
                <p className="text-xl font-bold text-white">$6,245.80</p>
                <p className="text-xs text-emerald-400">
                  ↑ 3.2% from last month
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}