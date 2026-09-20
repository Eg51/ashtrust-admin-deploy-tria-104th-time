// app/components/Dash.tsx
"use client";

import Link from 'next/link';
import UserAvatar from "@/app/components/UserAvatar";
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AffiliatePaymentModal from '@/app/components/AffiliatePaymentModal';
import Greet from "@/app/components/Greet";
import ManageAccountButton from '@/app/components/ManageAccountButton'; // ✅ NEW IMPORT
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Send, Search, User, Users, CreditCard, Lock, Unlock, PieChart, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, MoreVertical, Eye, EyeOff, Plus, ChevronRight, Home, ShoppingBag, Coffee, Car, Briefcase, Gift, Smartphone, Bitcoin, Gem, LineChart, BarChart3, Coins, Zap, Globe, Star, Activity, SlidersHorizontal, Sun, Moon, Cloud, RefreshCw,
} from "lucide-react";

// ============================================================================
// 4K HD COLOR MAP (SAME AS INVESTMENT PAGE)
// ============================================================================

const investmentCardColors = [
  { from: "#FF6B6B", to: "#EE5A24" },
  { from: "#FF9F43", to: "#E67E22" },
  { from: "#FECA57", to: "#F9CA24" },
  { from: "#55E6C1", to: "#1DD1A1" },
  { from: "#48DBFB", to: "#0ABDE3" },
  { from: "#686DE0", to: "#4834D4" },
  { from: "#BE2EDD", to: "#8E44AD" },
  { from: "#FF6B81", to: "#E74C3C" },
  { from: "#F8A5C2", to: "#F78FB3" },
  { from: "#7BED9F", to: "#2ECC71" },
  { from: "#70A1FF", to: "#1B9CFC" },
  { from: "#FD7272", to: "#E84118" },
  { from: "#A29BFE", to: "#6C5CE7" },
];

const getCardColorClass = (assetId: string): string => {
  const assetColorMap: Record<string, { from: string; to: string }> = {
    gold: { from: "#FF9F43", to: "#E67E22" },
    bitcoin: { from: "#FF6B6B", to: "#EE5A24" },
    ethereum: { from: "#686DE0", to: "#4834D4" },
    solana: { from: "#BE2EDD", to: "#8E44AD" },
    sp500: { from: "#55E6C1", to: "#1DD1A1" },
    nasdaq: { from: "#48DBFB", to: "#0ABDE3" },
    vti: { from: "#70A1FF", to: "#1B9CFC" },
    qqq: { from: "#F8A5C2", to: "#F78FB3" },
    apple: { from: "#A29BFE", to: "#6C5CE7" },
    nvidia: { from: "#7BED9F", to: "#2ECC71" },
    microsoft: { from: "#48DBFB", to: "#0ABDE3" },
    amazon: { from: "#FF9F43", to: "#E67E22" },
    google: { from: "#70A1FF", to: "#1B9CFC" },
    tesla: { from: "#FF6B81", to: "#E74C3C" },
    silver: { from: "#FECA57", to: "#F9CA24" },
  };

  const base = assetColorMap[assetId] || investmentCardColors[Math.abs(assetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % investmentCardColors.length];
  return `from-[${base.from}] to-[${base.to}]`;
};

// ============================================================================
// HELPER: FORMAT MONETARY VALUE
// ============================================================================

const formatCurrency = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return "0.00";
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ============================================================================
// TYPES
// ============================================================================

interface Transaction { id: string; merchant: string; type: string; category: string; date: string; status: "completed" | "pending" | "failed"; amount: string; isNegative: boolean; icon?: React.ReactNode; }
interface UpcomingBill { id: string; name: string; dueIn: string; amount: string; category: string; }
interface QuickContact { id: string; name: string; avatar: string; initials: string; }

// ✅ FIXED: Added `purchasePrice?: number` to the Asset interface
interface Asset { id: string; name: string; symbol: string; type: "crypto" | "stock" | "etf" | "commodity"; price: number; change: number; changePercent: number; volume: string; marketCap?: string; description: string; icon: React.ReactNode; color: string; bgGradient: string; isGold?: boolean; isTrending?: boolean; isNew?: boolean; historicalData?: number[]; sector?: string; dividend?: string; peRatio?: number; yearHigh?: number; yearLow?: number; purchasePrice?: number; }

interface UserDashboardData { portfolioValue: string; portfolioChange: string; assetTotal: string; transactions: Transaction[]; upcomingBills: UpcomingBill[]; quickContacts: QuickContact[]; spendingCategories: { name: string; percentage: number; color: string }[]; watchlist: string[]; investments: { id?: string; assetId: string; amount: number; purchasePrice: number; date: string; }[]; recentBills: UpcomingBill[]; totalBalance?: { amount: string; change: string }; analysisBalance?: { total: string; stocks: string; crypto: string; etfs: string }; analysisNote?: number; analysisSummary?: string; paymentMethods?: any[]; preferences?: Record<string, any>; }
interface UserData { _id: string; firstName: string; lastName: string; username: string; displayName: string; email: string; phone: string; accountType: string; isActive: boolean; isVerified: boolean; role: string; isAdmin: boolean; hasAvatar: boolean; avatar: string | null; dashboardData?: UserDashboardData; }

// ============================================================================
// DEFAULT DATA
// ============================================================================
const defaultTransactions: Transaction[] = [
  { id: "1", merchant: "", type: "", category: "", date: new Date().toLocaleDateString(), status: "completed", amount: "", isNegative: true, icon: <Smartphone size={16} /> },
  { id: "2", merchant: "", type: "", category: "", date: new Date().toLocaleDateString(), status: "completed", amount: "", isNegative: false, icon: <TrendingUp size={16} /> },
];
const defaultUpcomingBills: UpcomingBill[] = [ { id: "1", name: "", dueIn: "", amount: "", category: "" }, { id: "2", name: "", dueIn: "", amount: "", category: "" } ];
const defaultRecentBills: UpcomingBill[] = [ { id: "1", name: "", dueIn: "", amount: "", category: "" }, { id: "2", name: "", dueIn: "", amount: "", category: "" }, { id: "3", name: "", dueIn: "", amount: "", category: "" } ];
const defaultQuickContacts: QuickContact[] = [ { id: "1", name: "James", avatar: "", initials: "JD" }, { id: "2", name: "Libs", avatar: "", initials: "LM" }, { id: "3", name: "Sarah", avatar: "", initials: "SK" }, { id: "4", name: "Mike", avatar: "", initials: "MR" } ];
const defaultSpendingCategories = [ { name: "Stocks", percentage: 45, color: "from-blue-400 to-cyan-500" }, { name: "Crypto", percentage: 35, color: "from-purple-400 to-pink-500" }, { name: "ETFs", percentage: 20, color: "from-emerald-400 to-teal-500" } ];

// ============================================================================
// ASSETS DATA
// ============================================================================
const getFixedHistoricalData = (basePrice: number, points: number = 20): number[] => {
  const data: number[] = [];
  let price = basePrice;
  for (let i = 0; i < points; i++) { const variation = Math.sin(i * 0.5 + basePrice) * basePrice * 0.02; price = Math.max(price + variation, basePrice * 0.7); data.push(price); }
  return data;
};

const availableAssets: Asset[] = [
  { id: "gold", name: "Gold", symbol: "XAU", type: "commodity", price: 2345.67, change: 28.45, changePercent: 1.23, volume: "2.4M", marketCap: "$13.2T", description: "Physical gold bullion - The ultimate store of value and hedge against inflation. Gold has been a trusted asset for millennia, offering stability in times of economic uncertainty.", icon: <Gem size={20} />, color: "from-yellow-500 to-amber-600", bgGradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20", isGold: true, isTrending: true, historicalData: getFixedHistoricalData(2345.67, 30), sector: "Precious Metals", yearHigh: 2450.00, yearLow: 1980.00 },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", type: "crypto", price: 67234.89, change: -1234.56, changePercent: -1.80, volume: "28.5B", marketCap: "$1.32T", description: "The world's leading cryptocurrency. Bitcoin offers decentralized digital gold with limited supply and global accessibility.", icon: <Bitcoin size={20} />, color: "from-orange-400 to-amber-500", bgGradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20", isTrending: false, historicalData: getFixedHistoricalData(67234.89, 30), sector: "Cryptocurrency", yearHigh: 73500.00, yearLow: 38500.00 },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", type: "crypto", price: 3456.78, change: 89.12, changePercent: 2.65, volume: "15.2B", marketCap: "$415B", description: "Smart contract platform enabling decentralized applications and DeFi. Ethereum is the foundation of Web3 innovation.", icon: <Coins size={20} />, color: "from-purple-400 to-indigo-500", bgGradient: "from-purple-500/20 via-indigo-500/10 to-blue-500/20", isTrending: true, historicalData: getFixedHistoricalData(3456.78, 30), sector: "Cryptocurrency", yearHigh: 4100.00, yearLow: 2200.00 },
  { id: "solana", name: "Solana", symbol: "SOL", type: "crypto", price: 145.67, change: 12.34, changePercent: 9.26, volume: "3.8B", marketCap: "$64.5B", description: "High-performance blockchain supporting decentralized apps and marketplaces. Solana offers lightning-fast transactions and low fees.", icon: <Zap size={20} />, color: "from-purple-500 to-pink-500", bgGradient: "from-purple-500/20 via-pink-500/10 to-rose-500/20", isTrending: true, isNew: true, historicalData: getFixedHistoricalData(145.67, 30), sector: "Cryptocurrency", yearHigh: 200.00, yearLow: 80.00 },
  { id: "sp500", name: "S&P 500", symbol: "SPX", type: "etf", price: 5234.56, change: 45.67, changePercent: 0.88, volume: "4.2B", marketCap: "$38.5T", description: "Broad market index tracking 500 leading US companies. The S&P 500 provides diversified exposure to the American economy.", icon: <BarChart3 size={20} />, color: "from-emerald-400 to-teal-500", bgGradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20", historicalData: getFixedHistoricalData(5234.56, 30), sector: "Index Funds", dividend: "1.45%", peRatio: 22.5, yearHigh: 5400.00, yearLow: 4100.00 },
  { id: "nasdaq", name: "NASDAQ-100", symbol: "NDX", type: "etf", price: 18234.12, change: -234.56, changePercent: -1.27, volume: "3.8B", marketCap: "$22.1T", description: "Tech-heavy index featuring the world's largest technology companies. NASDAQ-100 represents the future of innovation.", icon: <LineChart size={20} />, color: "from-blue-400 to-cyan-500", bgGradient: "from-blue-500/20 via-cyan-500/10 to-sky-500/20", historicalData: getFixedHistoricalData(18234.12, 30), sector: "Technology ETFs", dividend: "0.85%", peRatio: 28.3, yearHigh: 19000.00, yearLow: 14200.00 },
  { id: "vti", name: "Vanguard Total Stock", symbol: "VTI", type: "etf", price: 259.34, change: 3.45, changePercent: 1.35, volume: "6.7M", marketCap: "$1.4T", description: "Total US stock market ETF providing broad exposure to the entire US equity market. VTI offers diversified, low-cost index investing.", icon: <PieChart size={20} />, color: "from-blue-500 to-indigo-500", bgGradient: "from-blue-500/20 via-indigo-500/10 to-purple-500/20", historicalData: getFixedHistoricalData(259.34, 30), sector: "Index Funds", dividend: "1.65%", peRatio: 20.8, yearHigh: 270.00, yearLow: 210.00 },
  { id: "qqq", name: "Invesco QQQ", symbol: "QQQ", type: "etf", price: 445.78, change: 5.67, changePercent: 1.29, volume: "52.3M", marketCap: "$235B", description: "Nasdaq-100 index ETF tracking the performance of 100 largest non-financial companies listed on Nasdaq.", icon: <TrendingUp size={20} />, color: "from-blue-400 to-purple-500", bgGradient: "from-blue-500/20 via-purple-500/10 to-indigo-500/20", historicalData: getFixedHistoricalData(445.78, 30), sector: "Technology ETFs", dividend: "0.65%", peRatio: 25.1, yearHigh: 460.00, yearLow: 350.00 },
  { id: "apple", name: "Apple Inc.", symbol: "AAPL", type: "stock", price: 178.45, change: 2.34, changePercent: 1.33, volume: "55.2M", marketCap: "$2.78T", description: "Global technology leader known for innovative products and services. Apple continues to redefine consumer electronics.", icon: <TrendingUp size={20} />, color: "from-gray-400 to-gray-600", bgGradient: "from-gray-500/20 via-slate-500/10 to-zinc-500/20", historicalData: getFixedHistoricalData(178.45, 30), sector: "Technology", dividend: "0.55%", peRatio: 29.2, yearHigh: 195.00, yearLow: 145.00 },
  { id: "nvidia", name: "NVIDIA Corp", symbol: "NVDA", type: "stock", price: 845.23, change: 34.56, changePercent: 4.26, volume: "32.1M", marketCap: "$2.08T", description: "AI and graphics processing pioneer. NVIDIA powers the future of artificial intelligence and high-performance computing.", icon: <Zap size={20} />, color: "from-green-400 to-emerald-500", bgGradient: "from-green-500/20 via-emerald-500/10 to-teal-500/20", isTrending: true, historicalData: getFixedHistoricalData(845.23, 30), sector: "Technology", peRatio: 45.6, yearHigh: 950.00, yearLow: 400.00 },
  { id: "microsoft", name: "Microsoft Corp", symbol: "MSFT", type: "stock", price: 378.92, change: 5.67, changePercent: 1.52, volume: "28.4M", marketCap: "$2.82T", description: "Global technology company powering productivity, cloud computing, and AI solutions. Microsoft is a cornerstone of modern enterprise.", icon: <BarChart3 size={20} />, color: "from-blue-500 to-blue-600", bgGradient: "from-blue-500/20 via-blue-600/10 to-cyan-500/20", historicalData: getFixedHistoricalData(378.92, 30), sector: "Technology", dividend: "0.92%", peRatio: 32.5, yearHigh: 400.00, yearLow: 310.00 },
  { id: "amazon", name: "Amazon.com", symbol: "AMZN", type: "stock", price: 184.45, change: -2.34, changePercent: -1.25, volume: "42.8M", marketCap: "$1.92T", description: "E-commerce and cloud computing giant. Amazon leads in online retail, AWS cloud services, and entertainment streaming.", icon: <ShoppingBag size={20} />, color: "from-orange-500 to-amber-600", bgGradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20", historicalData: getFixedHistoricalData(184.45, 30), sector: "Consumer Discretionary", peRatio: 48.2, yearHigh: 200.00, yearLow: 130.00 },
  { id: "google", name: "Alphabet Inc.", symbol: "GOOGL", type: "stock", price: 145.67, change: 1.23, changePercent: 0.85, volume: "22.3M", marketCap: "$1.82T", description: "Google's parent company, leading in search, advertising, cloud computing, and AI innovation. Alphabet shapes the digital economy.", icon: <Globe size={20} />, color: "from-blue-400 to-green-500", bgGradient: "from-blue-500/20 via-green-500/10 to-emerald-500/20", historicalData: getFixedHistoricalData(145.67, 30), sector: "Technology", dividend: "0.25%", peRatio: 25.8, yearHigh: 160.00, yearLow: 120.00 },
  { id: "tesla", name: "Tesla Inc.", symbol: "TSLA", type: "stock", price: 245.67, change: -8.90, changePercent: -3.50, volume: "78.5M", marketCap: "$785B", description: "Electric vehicle and clean energy pioneer. Tesla leads the automotive industry's transition to sustainable energy solutions.", icon: <Zap size={20} />, color: "from-red-400 to-orange-500", bgGradient: "from-red-500/20 via-orange-500/10 to-amber-500/20", historicalData: getFixedHistoricalData(245.67, 30), sector: "Automotive", peRatio: 72.4, yearHigh: 320.00, yearLow: 160.00 },
  { id: "silver", name: "Silver", symbol: "XAG", type: "commodity", price: 28.92, change: 1.23, changePercent: 4.44, volume: "1.1M", marketCap: "$1.8T", description: "Industrial and precious metal with dual utility. Silver is essential in electronics, solar panels, and jewelry.", icon: <DollarSign size={20} />, color: "from-gray-400 to-slate-500", bgGradient: "from-gray-500/20 via-slate-500/10 to-zinc-500/20", isTrending: true, historicalData: getFixedHistoricalData(28.92, 30), sector: "Precious Metals", yearHigh: 32.00, yearLow: 22.00 },
];  

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { delay: delay * 0.08, duration: 0.4, ease: "easeOut" as const } }) };
const itemVariants = { hidden: { opacity: 0, x: -10 }, visible: (delay: number = 0) => ({ opacity: 1, x: 0, transition: { delay: delay * 0.06, duration: 0.3, ease: "easeOut" as const } }) };

// ============================================================================
// HELPER: Clean Dashboard Data for Serialization
// ============================================================================
const cleanDashboardData = (data: UserDashboardData): UserDashboardData => {
  return {
    portfolioValue: data.portfolioValue || "$0.00", portfolioChange: data.portfolioChange || "0.0%", assetTotal: data.assetTotal || "$0.00",
    transactions: data.transactions?.map(({ icon, ...rest }) => ({ id: rest.id, merchant: rest.merchant, type: rest.type, category: rest.category, date: rest.date, status: rest.status, amount: rest.amount, isNegative: rest.isNegative, })) || [],
    upcomingBills: data.upcomingBills?.map((b) => ({ id: b.id, name: b.name, dueIn: b.dueIn, amount: b.amount, category: b.category, })) || [],
    quickContacts: data.quickContacts?.map((c) => ({ id: c.id, name: c.name, avatar: c.avatar, initials: c.initials, })) || [],
    spendingCategories: data.spendingCategories?.map((c) => ({ name: c.name, percentage: c.percentage, color: c.color, })) || [],
    watchlist: data.watchlist || [],
    investments: data.investments?.map((i) => ({ id: i.id, assetId: i.assetId, amount: i.amount, purchasePrice: i.purchasePrice, date: i.date, })) || [],
    recentBills: data.recentBills?.map((b) => ({ id: b.id, name: b.name, dueIn: b.dueIn, amount: b.amount, category: b.category, })) || [],
    totalBalance: data.totalBalance, analysisBalance: data.analysisBalance, analysisNote: data.analysisNote ?? 0, analysisSummary: data.analysisSummary || "",
    paymentMethods: data.paymentMethods || [], preferences: data.preferences || {},
  };
};

// ============================================================================
// OPTIMIZED SUBCOMPONENTS
// ============================================================================

// Memoized Asset Card Component (Modified to accept investedAmount & live price)
const AssetCard = memo(({
  asset, isExpanded, isInWatchlist, investedAmount, currentPrice, onToggle, onInvest, onWatchlistToggle,
}: {
  asset: Asset; isExpanded: boolean; isInWatchlist: boolean; investedAmount?: number; currentPrice?: number;
  onToggle: () => void; onInvest: (asset: Asset) => void; onWatchlistToggle: (assetId: string) => void;
}) => {
  const isPositive = asset.change >= 0;
  const cardGradients = [ "from-amber-400/30 via-yellow-400/20 to-orange-400/30", "from-orange-400/30 via-amber-400/20 to-yellow-400/30", "from-purple-400/30 via-indigo-400/20 to-blue-400/30", "from-pink-400/30 via-purple-400/20 to-rose-400/30", "from-emerald-400/30 via-teal-400/20 to-cyan-400/30", "from-blue-400/30 via-cyan-400/20 to-sky-400/30", ];
  const gradientIndex = parseInt(asset.id) % cardGradients.length;
  const gradientClass = cardGradients[gradientIndex];

  // ✅ Real-time value calculation (uses asset.purchasePrice)
  const livePrice = currentPrice ?? asset.price;
  const totalValue = investedAmount !== undefined ? investedAmount : 0;
  const purchasePrice = asset.purchasePrice ?? asset.price;
  const unitsOwned = investedAmount !== undefined && purchasePrice ? investedAmount / purchasePrice : 0;

  return (
    <motion.div whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }} className={`rounded-xl p-4 border-none bg-gradient-to-br ${gradientClass} backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300`} onClick={onToggle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/30 text-cyan-900 shadow-md">{asset.icon}</div>
          <div><p className="text-sm font-semibold text-cyan-900">{asset.symbol}</p><p className="text-xs text-cyan-800/70">{asset.name}</p></div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-cyan-900">${formatCurrency(livePrice)}</p>
          <p className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>{isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%</p>
        </div>
      </div>

      {/* ✅ NEW: Show the user's invested amount, Live Total Value, and Profit/Loss */}
      {investedAmount !== undefined && (
        <div className="mt-2 pt-2 border-t border-cyan-200/30 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-700/80">You Paid:</span>
            <span className="text-sm font-bold text-slate-700">${formatCurrency(investedAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-700/80">Live Value:</span>
            <span className="text-sm font-bold text-emerald-600">${formatCurrency(totalValue * (livePrice / purchasePrice))}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-700/80">Profit / Loss:</span>
            <span className={`text-sm font-bold ${(livePrice - purchasePrice) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {((livePrice - purchasePrice) / purchasePrice * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {isExpanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-3 border-t border-cyan-200/30 pt-3">
          <p className="text-xs text-cyan-800">{asset.description}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {asset.marketCap && (<div><p className="text-cyan-700/60">Market Cap</p><p className="text-cyan-900 font-medium">{asset.marketCap}</p></div>)}
            {asset.sector && (<div><p className="text-cyan-700/60">Sector</p><p className="text-cyan-900 font-medium">{asset.sector}</p></div>)}
          </div>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); onInvest(asset); }} className="flex-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:shadow-lg transition-all">Buy</button>
            <button onClick={(e) => { e.stopPropagation(); onWatchlistToggle(asset.id); }} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${isInWatchlist ? "bg-amber-500/30 text-amber-700" : "bg-white/30 text-cyan-700 hover:text-cyan-900"} border-none shadow-sm hover:shadow-md transition-all`}><Star size={14} className={isInWatchlist ? "fill-amber-500" : ""} /></button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});
AssetCard.displayName = 'AssetCard';

// Memoized Upcoming Bill Item
const UpcomingBillItem = memo(({ bill, index }: { bill: UpcomingBill; index: number }) => {
  const billGradients = [ "from-amber-400/20 via-yellow-400/10 to-orange-400/20", "from-blue-400/20 via-cyan-400/10 to-sky-400/20", "from-purple-400/20 via-indigo-400/10 to-violet-400/20", ];
  const gradientIndex = index % billGradients.length;
  const gradientClass = billGradients[gradientIndex];

  return (
    <motion.div custom={index} variants={itemVariants} initial="hidden" animate="visible" whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }} className={`flex items-center justify-between rounded-lg bg-gradient-to-br ${gradientClass} p-3 backdrop-blur-sm border-none cursor-pointer hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-amber-500/30 p-2 shadow-sm"><Calendar size={16} className="text-amber-600" /></div>
        <div><p className="text-sm font-medium text-cyan-900">{bill.name}</p><div className="flex items-center gap-2"><Clock size={12} className="text-cyan-700/50" /><span className="text-xs text-cyan-700/60">Due in {bill.dueIn}</span></div></div>
      </div>
      <span className="text-sm font-semibold text-cyan-900">${formatCurrency(bill.amount)}</span>
    </motion.div>
  );
});
UpcomingBillItem.displayName = 'UpcomingBillItem';

// Memoized Recent Bills Item
const RecentBillItem = memo(({ bill, index }: { bill: UpcomingBill; index: number }) => {
  const billGradients = [ "from-emerald-400/20 via-green-400/10 to-teal-400/20", "from-blue-400/20 via-cyan-400/10 to-sky-400/20", "from-purple-400/20 via-indigo-400/10 to-violet-400/20", "from-amber-400/20 via-yellow-400/10 to-orange-400/20", "from-pink-400/20 via-rose-400/10 to-red-400/20", ];
  const gradientIndex = index % billGradients.length;
  const gradientClass = billGradients[gradientIndex];

  return (
    <motion.div custom={index} variants={itemVariants} initial="hidden" animate="visible" whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} className={`flex items-center justify-between rounded-lg bg-gradient-to-br ${gradientClass} p-3 backdrop-blur-sm border-none cursor-pointer hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/30 p-2 shadow-sm"><CheckCircle size={16} className="text-emerald-600" /></div>
        <div><p className="text-sm font-medium text-cyan-900">{bill.name}</p><div className="flex items-center gap-2"><span className="text-xs text-emerald-600">{bill.dueIn}</span><span className="text-xs text-cyan-700/50">•</span><span className="text-xs text-cyan-700/60">{bill.category}</span></div></div>
      </div>
      <span className="text-sm font-semibold text-cyan-900">${formatCurrency(bill.amount)}</span>
    </motion.div>
  );
});
RecentBillItem.displayName = 'RecentBillItem';

// ============================================================================
// INVESTMENT DASHBOARD COMPONENT (FIXED: Real-Time Prices, Sorts & Merges)
// ============================================================================
function InvestmentDashboard({ userData, onAddInvestment }: { userData: UserDashboardData; onAddInvestment: (assetId: string, amount: number) => void; }) {
  // ✅ FIX: Read assets, merge duplicates by summing amount, and sort newest first!
  const investedAssets = useMemo(() => {
    if (!userData.investments || userData.investments.length === 0) return [];

    const mergedMap = new Map<string, { asset: Asset; amount: number; date: string }>();
    userData.investments.forEach((inv) => {
      const asset = availableAssets.find((a) => a.id === inv.assetId);
      if (!asset) return;
      const existing = mergedMap.get(inv.assetId);
      if (existing) {
        existing.amount += inv.amount;
        if (new Date(inv.date) > new Date(existing.date)) { existing.date = inv.date; }
      } else {
        mergedMap.set(inv.assetId, { asset, amount: inv.amount, date: inv.date });
      }
    });

    return Array.from(mergedMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(item => ({ ...item.asset, investedAmount: item.amount, purchasePrice: item.asset.price })); // ✅ Passed purchasePrice here!
  }, [userData.investments]);

  // ✅ NEW: State for real-time prices
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  // ✅ NEW: Fetch real-time prices for the invested assets every 5 seconds
  useEffect(() => {
    if (!investedAssets.length) return;

    const fetchPrices = async () => {
      try {
        const ids = investedAssets.map(a => a.id).join(",");
        const response = await fetch(`/api/prices?ids=${ids}&vs_currencies=usd`);
        if (response.ok) {
          const data = await response.json();
          const priceMap: Record<string, number> = {};
          investedAssets.forEach(asset => {
            if (data[asset.id]) {
              priceMap[asset.id] = data[asset.id].usd;
            }
          });
          setLivePrices(priceMap);
        }
      } catch (error) {
        console.error("Error fetching live prices:", error);
      }
    };

    fetchPrices(); // Initial fetch
    const interval = setInterval(fetchPrices, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [investedAssets]);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");

  if (investedAssets.length === 0) return null;

  const handleInvest = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setShowInvestModal(true);
  }, []);

  const handleConfirmInvestment = useCallback(() => {
    if (!selectedAsset || !investmentAmount) return;
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) return;
    onAddInvestment(selectedAsset.id, amount);
    setShowInvestModal(false);
    setInvestmentAmount("");
    setSelectedAsset(null);
  }, [selectedAsset, investmentAmount, onAddInvestment]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {investedAssets.map((asset: any, index) => (
          <AssetCard
            key={`${asset.id}-${index}`}
            asset={asset}
            isExpanded={false}
            isInWatchlist={false}
            investedAmount={asset.investedAmount} // ✅ Pass the user's total amount here
            currentPrice={livePrices[asset.id]} // ✅ Pass the real-time price here
            onToggle={() => {}}
            onInvest={handleInvest}
            onWatchlistToggle={() => {}}
          />
        ))}
      </div>

      {/* Existing Modal for buying more */}
      <AnimatePresence>
        {showInvestModal && selectedAsset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-none p-4 backdrop-blur-sm" onClick={() => setShowInvestModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md rounded-2xl bg-[#C4F8FD] p-6 shadow-xl border-none" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-cyan-600">{selectedAsset.name}</h2>
                <button onClick={() => setShowInvestModal(false)} className="rounded-lg p-1 hover:bg-white/10 transition-colors"><div className="font-lg text-cyan-900">X</div></button>
              </div>
              <div className={`rounded-xl p-4 mb-4 bg-[#C4F8FD] shadow-xl ${selectedAsset.bgGradient} border-none`}>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-cyan-900">{selectedAsset.symbol}</p><p className="text-2xl font-bold text-amber-400">${formatCurrency(selectedAsset.price)}</p></div>
                  <div className={`flex items-center gap-1 font-medium ${selectedAsset.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>{selectedAsset.change >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}<span>{Math.abs(selectedAsset.changePercent).toFixed(2)}%</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Amount($)</label>
                  <input type="number" placeholder="0.00" value={investmentAmount} onChange={(e) => setInvestmentAmount(e.target.value)} className="w-full rounded-lg border-none shadow-xl bg-[#C4F8FD] px-4 font-bold py-3 text-emerald-400 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <button key={amount} onClick={() => setInvestmentAmount(amount.toString())} className="flex-1 min-w-[60px] rounded-lg bg-[#C4F8FD] px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-slate-700 transition-colors border-none shadow-xl hover:border-slate-600">{amount}</button>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleConfirmInvestment} className="w-full rounded-xl bg-[#C4F8FD]0 py-3 font-bold text-emerald-400 shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer">
                  <span className="flex items-center justify-center gap-2"><Send size={18} />Confirm</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// UPCOMING / RECENT BILLS COMPONENTS
// ============================================================================
function UpcomingBillsSection({ bills }: { bills: UpcomingBill[] }) {
  return (<div className="space-y-3">{bills.map((bill, index) => (<UpcomingBillItem key={bill.id} bill={bill} index={index} />))}</div>);
}
function RecentBillsSection({ bills }: { bills: UpcomingBill[] }) {
  return (<div className="space-y-2">{bills.map((bill, index) => (<RecentBillItem key={bill.id} bill={bill} index={index} />))}</div>);
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
export default function Dash() {
  const [user, setUser] = useState<UserData | null>(null);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<UserDashboardData>({ portfolioValue: "$0.00", portfolioChange: "0.0%", assetTotal: "$0.00", transactions: defaultTransactions, upcomingBills: defaultUpcomingBills, quickContacts: defaultQuickContacts, spendingCategories: defaultSpendingCategories, watchlist: [], investments: [], recentBills: defaultRecentBills, analysisNote: 0, analysisSummary: "" });

  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openFunds') === 'true') { setShowAffiliateModal(true); }
  }, []);

  const accountDetails = { bankName: dashboardData.preferences?.bankName || dashboardData.paymentMethods?.[0]?.brand || "", accountNumber: dashboardData.paymentMethods?.[0]?.last4 || "", sortCode: dashboardData.preferences?.sortCode || "12-34-56", accountName: dashboardData.preferences?.accountName || "", reference: dashboardData.preferences?.reference || "" };

  const isMounted = useRef(true);
  const dataLoaded = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
          if (typeof window !== 'undefined') { window.location.href = "/log-in"; }
          setLoading(false);
          return;
        }
        const parsedUser = JSON.parse(userData) as UserData;
        setUser(parsedUser);
        setUserName(parsedUser.displayName || parsedUser.firstName || 'User');
        if (!dataLoaded.current) {
          await loadUserDashboard(parsedUser._id);
          dataLoaded.current = true;
        }
        setLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') { window.location.href = "/log-in"; }
        setLoading(false);
      }
    };
    checkAuth();
    return () => { isMounted.current = false; };
  }, []);

  const loadUserDashboard = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/user/dashboard?userId=${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const result = await response.json();
      if (!isMounted.current) return;
      if (response.ok && result.success && result.data) {
        const userData = result.data;
        const rawBills = userData.bills || [];
        const rawTransactions = userData.recentTransactions || [];

        const formattedUpcomingBills = rawBills.filter((b: any) => { const status = (b.status || '').trim().toLowerCase();return status === 'pending' || status === 'unpaid' || status === 'overdue'; }).map((b: any) => { let dueInText = "Unknown"; if (b.dueDate) { const daysLeft = Math.ceil((new Date(b.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24)); dueInText = daysLeft <= 0 ? "Overdue" : `${daysLeft} days`; } return { id: b.id || Date.now().toString(), name: b.name || b.title || "Unnamed Bill", dueIn: dueInText, amount: typeof b.amount === 'number' ? `${b.amount.toFixed(2)}` : b.amount || "0.00", category: b.category || "General" }; });
        const formattedRecentBills = rawBills.filter((b: any) => { const status = (b.status || '').trim().toLowerCase(); return status === 'paid'; }).map((b: any) => ({ id: b.id || Date.now().toString(), name: b.name || b.title || "Unnamed Bill", dueIn: "Paid", amount: typeof b.amount === 'number' ? `${b.amount.toFixed(2)}` : b.amount || "0.00", category: b.category || "General" }));

        const portfolioAmount = parseFloat(userData.totalBalance?.amount) || 0;
        const portfolioValueStr = `${portfolioAmount.toFixed(2)}`;
        const portfolioChange = userData.totalBalance?.change || "0.0%";

        // const analysisNoteValue = userData.analysisNote ? parseFloat(userData.analysisNote) : 0;
        // const assetTotalStr = analysisNoteValue > 0 ? `${analysisNoteValue.toFixed(2)}` : "0.00";
        const analysisNoteValue = userData.analysisNote ? parseFloat(userData.analysisNote) : 0;
        const investmentsTotal = (userData.investments || [])
          .reduce((sum: number, inv: any) => sum + (Number(inv?.amount) || 0), 0);
        const assetTotalStr = investmentsTotal.toFixed(2);

        setDashboardData({
          portfolioValue: portfolioValueStr, portfolioChange: portfolioChange, assetTotal: assetTotalStr,
          transactions: rawTransactions.map((t: any) => ({ id: t.id || Date.now().toString(), merchant: t.merchant || "Unknown", type: t.type || "Purchase", category: t.category || "General", date: t.date || new Date().toLocaleDateString(), status: t.status || "completed", amount: typeof t.amount === 'number' ? `${t.amount.toFixed(2)}` : t.amount || "0.00", isNegative: t.isNegative ?? true, })),
          upcomingBills: formattedUpcomingBills, quickContacts: defaultQuickContacts,
          spendingCategories: [ { name: "Stocks", percentage: parseInt(userData.analysisBalance?.stocks) || 45, color: "from-blue-400 to-cyan-500" }, { name: "Crypto", percentage: parseInt(userData.analysisBalance?.crypto) || 35, color: "from-purple-400 to-pink-500" }, { name: "ETFs", percentage: parseInt(userData.analysisBalance?.etfs) || 20, color: "from-emerald-400 to-teal-500" } ],
          watchlist: [], investments: userData.investments || [], recentBills: formattedRecentBills, totalBalance: userData.totalBalance, analysisBalance: userData.analysisBalance, analysisNote: analysisNoteValue, analysisSummary: userData.analysisSummary || "", paymentMethods: userData.paymentMethods || [], preferences: userData.preferences || {},
        });
      }
    } catch (error) { console.error("Error loading dashboard:", error); }
  };

  const saveDashboardData = async (userId: string, data: UserDashboardData) => {
    try {
      const preparedData = { totalBalance: { amount: data.portfolioValue, change: data.portfolioChange }, analysisBalance: { total: data.portfolioValue, stocks: data.spendingCategories[0]?.percentage + "%" || "45%", crypto: data.spendingCategories[1]?.percentage + "%" || "35%", etfs: data.spendingCategories[2]?.percentage + "%" || "20%" }, analysisNote: parseFloat(data.assetTotal.replace(/[^0-9.]/g, "")) || 0, analysisSummary: data.analysisSummary || "", bills: data.recentBills.map(b => ({ ...b, status: 'paid' })), recentTransactions: data.transactions, upcomingBills: data.upcomingBills, paymentMethods: data.paymentMethods || [], preferences: data.preferences || {} };
      const response = await fetch('/api/user/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, dashboardData: preparedData }) });
      if (!response.ok) { throw new Error('Failed to save dashboard data'); }
    } catch (error) { console.error("Error saving dashboard:", error); }
  };

  const refreshDashboard = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    setRefreshMessage('Refreshing...');
    try { await loadUserDashboard(user._id); setRefreshMessage('refreshed successfully!'); setTimeout(() => setRefreshMessage(''), 3000); }
    catch (error) { setRefreshMessage('❌ Refresh failed. Please try again.'); }
    finally { setIsRefreshing(false); }
  }, [user]);

  const handleAddInvestment = useCallback((assetId: string, amount: number) => {
    const asset = availableAssets.find(a => a.id === assetId);
    if (!asset || !isMounted.current) return;
    const newInvestment = { assetId, amount, purchasePrice: asset.price, date: new Date().toISOString() };

    setDashboardData((prev) => {
      const currentValue = parseFloat(prev.portfolioValue.replace(/[^0-9.]/g, ""));
      const newValue = currentValue + amount;
      const formattedValue = `$${newValue.toFixed(2)}`;
      const change = ((newValue - currentValue) / (currentValue || 1)) * 100;
      const changeFormatted = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;

      // ✅ FIX: Merge duplicates here by checking if asset exists
      const existingInv = (prev.investments || []).find(inv => inv.assetId === assetId);
      let updatedInvestments;
      if (existingInv) {
        updatedInvestments = prev.investments.map(inv => inv.assetId === assetId ? { ...inv, amount: inv.amount + amount, date: newInvestment.date } : inv);
      } else {
        updatedInvestments = [...(prev.investments || []), newInvestment];
      }

      // ✅ Save the *exact* updated data to the database right here
      if (user && isMounted.current) {
        saveDashboardData(user._id, {
          ...prev,
          investments: updatedInvestments,
          portfolioValue: formattedValue,
          portfolioChange: changeFormatted
        });
      }

      return { ...prev, investments: updatedInvestments, portfolioValue: formattedValue, portfolioChange: changeFormatted };
    });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#C4F8FD] pb-9 to-gray-300 px-4 pt-4 sm:pb-9 sm:pt-6 sm:px-6 lg:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-6xl">
        <motion.div custom={0} variants={cardVariants} className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4"><Greet username={userName} className="mb-0" iconSize={70} /></div>
        </motion.div>

        <motion.div custom={1} variants={cardVariants} whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }} className="mb-6 rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-none">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-row justify-between w-[78vw] items-center"><p className="text-sm font-medium text-cyan-700">Total Balance</p><div className="md:hidden block items-center relative p-auto my-auto right-0 top-0"><UserAvatar className="shadow-xl m-auto ring-cyan-500/50" /></div></div>
              <div className="flex items-baseline gap-3"><span className="text-3xl font-bold text-cyan-900 sm:text-4xl"><span className="text-3xl text-amber-400 sm:text-4xl font-normal">$</span>{formatCurrency(dashboardData.portfolioValue)}</span><span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${dashboardData.portfolioChange.startsWith('+') ? 'bg-emerald-400/30 text-emerald-700' : 'bg-red-400/30 text-red-700'}`}>{dashboardData.portfolioChange}</span></div>
            </div>
            <div className="hidden md:block items-center p-0 -md:ml-[15vw] md:my-auto md:right-0 md:top-0"><UserAvatar className="ring-2 ring-cyan-500/50" /></div>
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={refreshDashboard} disabled={isRefreshing} className="flex items-center gap-1 rounded-lg bg-white/30 px-3 py-1.5 text-xs font-medium text-cyan-700 shadow-md hover:shadow-lg transition-all hover:bg-white/50 disabled:opacity-50"><RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />{isRefreshing ? 'Refreshing...' : 'Refresh'}</motion.button>
            {refreshMessage && (<span className="text-xs text-emerald-600">{refreshMessage}</span>)}
            
            {/* ✅ MANAGE ACCOUNT BUTTON - ADDED HERE */}
            <ManageAccountButton 
              variant="outline" 
              size="sm"
              className="flex-shrink-0"
            >
              Bank details
            </ManageAccountButton>
            
            <div className="pl-[70%]"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAffiliateModal(true)} className="flex items-center gap-1 rounded-lg bg-[#C4F8FD] px-3 py-1.5 text-xs text-amber-400 font-bold shadow-xl cursor-pointer m-auto right-0 top-0 hover:shadow-2xl transition-all duration-300 hover:bg-[#b0ecf5]"><Plus className='text-amber-400 font-bold' size={14} /><span className='py-1 px-2'>Add</span></motion.button></div>
          </div>
        </motion.div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-1">
          <motion.div custom={2} whileHover={{ scale: 1.01, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }} whileTap={{ scale: 0.99 }} variants={cardVariants} className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-[#C4F8FD] via-[#B5F0F8] to-[#A5E8F2] p-5 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <InvestmentDashboard userData={dashboardData} onAddInvestment={handleAddInvestment} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <motion.div custom={3} whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }} whileTap={{ scale: 0.98 }} variants={cardVariants} className="rounded-2xl border-none bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] shadow-xl p-5 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-600">Assets</h2><div className="flex items-center gap-2"><Link href={'/Buy'}><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">View All</motion.button></Link></div></div>
            <div className="mt-3 flex items-end justify-between"><div><p className="text-2xl font-bold text-cyan-900"><span className="text-md text-amber-400 sm:text-2xl font-normal">$</span>{formatCurrency(dashboardData.assetTotal)}</p><p className="text-xs text-cyan-700">Total</p></div><div className={`flex items-center font-bold gap-1 text-sm ${dashboardData.portfolioChange.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{dashboardData.portfolioChange.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}<span className="font-medium">{dashboardData.portfolioChange}</span></div></div>
            <div className="mt-4 space-y-2.5">{dashboardData.spendingCategories.map((category, index) => (<motion.div key={category.name} custom={4 + index} variants={itemVariants} initial="hidden" animate="visible"><div className="flex items-center justify-between text-xs"><span className="text-cyan-800">{category.name}</span><span className="font-medium text-cyan-800">{category.percentage}%</span></div><div className="mt-0.5 h-1.5 w-full overflow-hidden cursor-pointer rounded-full bg-cyan-200/50"><motion.div initial={{ width: 0 }} animate={{ width: `${category.percentage}%` }} transition={{ duration: 0.8, delay: 0.3 + index * 0.08, ease: "easeOut" as const }} className={`h-full rounded-full hover:shadow-xl bg-gradient-to-r ${category.color}`} /></div></motion.div>))}{dashboardData.analysisSummary && (<div className="mt-2 text-xs text-cyan-700 font-medium bg-white/30 p-2 rounded-lg">{dashboardData.analysisSummary}</div>)}</div>
          </motion.div>

          <motion.div custom={4} variants={cardVariants} whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }} whileTap={{ scale: 0.98 }} className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-[#C4F8FD] via-[#B5F0F8] to-[#A5E8F2] p-5 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-600">Upcoming Bills</h2><Link href={"/Bills"}><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">View All</motion.button></Link></div>
            <UpcomingBillsSection bills={dashboardData.upcomingBills} />
          </motion.div>
        </div>

        <motion.div custom={5} variants={cardVariants} whileHover={{ scale: 1.01, boxShadow: "0 20px 50px rgba(0,0,0,0.06)" }} whileTap={{ scale: 0.99 }} className="mt-4 rounded-2xl border-none bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] shadow-xl p-5 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center text-cyan-700 justify-between"><h2 className="text-sm font-semibold text-slate-600">Recent Bills</h2></div>
          <RecentBillsSection bills={dashboardData.recentBills} />
        </motion.div>

        <AffiliatePaymentModal isOpen={showAffiliateModal} onClose={() => setShowAffiliateModal(false)} />
      </motion.div>
    </div>
  );
}


























// // app/components/Dash.tsx
// "use client";

// import Link from 'next/link';
// import UserAvatar from "@/app/components/UserAvatar";
// import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import AffiliatePaymentModal from '@/app/components/AffiliatePaymentModal';
// import Greet from "@/app/components/Greet";
// import ManageAccountButton from '@/app/components/ManageAccountButton';
// import {
//   Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Send, Search, User, Users, CreditCard, Lock, Unlock, PieChart, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, MoreVertical, Eye, EyeOff, Plus, ChevronRight, Home, ShoppingBag, Coffee, Car, Briefcase, Gift, Smartphone, Bitcoin, Gem, LineChart, BarChart3, Coins, Zap, Globe, Star, Activity, SlidersHorizontal, Sun, Moon, Cloud, RefreshCw,
// } from "lucide-react";

// // ============================================================================
// // 4K HD COLOR MAP (SAME AS INVESTMENT PAGE)
// // ============================================================================

// const investmentCardColors = [
//   { from: "#FF6B6B", to: "#EE5A24" },
//   { from: "#FF9F43", to: "#E67E22" },
//   { from: "#FECA57", to: "#F9CA24" },
//   { from: "#55E6C1", to: "#1DD1A1" },
//   { from: "#48DBFB", to: "#0ABDE3" },
//   { from: "#686DE0", to: "#4834D4" },
//   { from: "#BE2EDD", to: "#8E44AD" },
//   { from: "#FF6B81", to: "#E74C3C" },
//   { from: "#F8A5C2", to: "#F78FB3" },
//   { from: "#7BED9F", to: "#2ECC71" },
//   { from: "#70A1FF", to: "#1B9CFC" },
//   { from: "#FD7272", to: "#E84118" },
//   { from: "#A29BFE", to: "#6C5CE7" },
// ];

// const getCardColorClass = (assetId: string): string => {
//   const assetColorMap: Record<string, { from: string; to: string }> = {
//     gold: { from: "#FF9F43", to: "#E67E22" },
//     bitcoin: { from: "#FF6B6B", to: "#EE5A24" },
//     ethereum: { from: "#686DE0", to: "#4834D4" },
//     solana: { from: "#BE2EDD", to: "#8E44AD" },
//     sp500: { from: "#55E6C1", to: "#1DD1A1" },
//     nasdaq: { from: "#48DBFB", to: "#0ABDE3" },
//     vti: { from: "#70A1FF", to: "#1B9CFC" },
//     qqq: { from: "#F8A5C2", to: "#F78FB3" },
//     apple: { from: "#A29BFE", to: "#6C5CE7" },
//     nvidia: { from: "#7BED9F", to: "#2ECC71" },
//     microsoft: { from: "#48DBFB", to: "#0ABDE3" },
//     amazon: { from: "#FF9F43", to: "#E67E22" },
//     google: { from: "#70A1FF", to: "#1B9CFC" },
//     tesla: { from: "#FF6B81", to: "#E74C3C" },
//     silver: { from: "#FECA57", to: "#F9CA24" },
//   };

//   const base = assetColorMap[assetId] || investmentCardColors[Math.abs(assetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % investmentCardColors.length];
//   return `from-[${base.from}] to-[${base.to}]`;
// };

// // ============================================================================
// // HELPER: FORMAT MONETARY VALUE
// // ============================================================================

// const formatCurrency = (value: string | number | undefined): string => {
//   if (value === undefined || value === null) return "0.00";
//   const num = typeof value === 'number' ? value : parseFloat(value);
//   if (isNaN(num)) return "0.00";
//   return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// };

// // ============================================================================
// // TYPES
// // ============================================================================

// interface Transaction { id: string; merchant: string; type: string; category: string; date: string; status: "completed" | "pending" | "failed"; amount: string; isNegative: boolean; icon?: React.ReactNode; }
// interface UpcomingBill { id: string; name: string; dueIn: string; amount: string; category: string; }
// interface QuickContact { id: string; name: string; avatar: string; initials: string; }

// interface Asset { id: string; name: string; symbol: string; type: "crypto" | "stock" | "etf" | "commodity"; price: number; change: number; changePercent: number; volume: string; marketCap?: string; description: string; icon: React.ReactNode; color: string; bgGradient: string; isGold?: boolean; isTrending?: boolean; isNew?: boolean; historicalData?: number[]; sector?: string; dividend?: string; peRatio?: number; yearHigh?: number; yearLow?: number; purchasePrice?: number; }

// interface UserDashboardData { portfolioValue: string; portfolioChange: string; assetTotal: string; transactions: Transaction[]; upcomingBills: UpcomingBill[]; quickContacts: QuickContact[]; spendingCategories: { name: string; percentage: number; color: string }[]; watchlist: string[]; investments: { id?: string; assetId: string; amount: number; purchasePrice: number; date: string; }[]; recentBills: UpcomingBill[]; totalBalance?: { amount: string; change: string }; analysisBalance?: { total: string; stocks: string; crypto: string; etfs: string }; analysisNote?: number; analysisSummary?: string; paymentMethods?: any[]; preferences?: Record<string, any>; }
// interface UserData { _id: string; firstName: string; lastName: string; username: string; displayName: string; email: string; phone: string; accountType: string; isActive: boolean; isVerified: boolean; role: string; isAdmin: boolean; hasAvatar: boolean; avatar: string | null; dashboardData?: UserDashboardData; }

// // ============================================================================
// // DEFAULT DATA
// // ============================================================================
// const defaultTransactions: Transaction[] = [
//   { id: "1", merchant: "", type: "", category: "", date: new Date().toLocaleDateString(), status: "completed", amount: "", isNegative: true, icon: <Smartphone size={16} /> },
//   { id: "2", merchant: "", type: "", category: "", date: new Date().toLocaleDateString(), status: "completed", amount: "", isNegative: false, icon: <TrendingUp size={16} /> },
// ];
// const defaultUpcomingBills: UpcomingBill[] = [ { id: "1", name: "", dueIn: "", amount: "", category: "" }, { id: "2", name: "", dueIn: "", amount: "", category: "" } ];
// const defaultRecentBills: UpcomingBill[] = [ { id: "1", name: "", dueIn: "", amount: "", category: "" }, { id: "2", name: "", dueIn: "", amount: "", category: "" }, { id: "3", name: "", dueIn: "", amount: "", category: "" } ];
// const defaultQuickContacts: QuickContact[] = [ { id: "1", name: "James", avatar: "", initials: "JD" }, { id: "2", name: "Libs", avatar: "", initials: "LM" }, { id: "3", name: "Sarah", avatar: "", initials: "SK" }, { id: "4", name: "Mike", avatar: "", initials: "MR" } ];
// const defaultSpendingCategories = [ { name: "Stocks", percentage: 45, color: "from-blue-400 to-cyan-500" }, { name: "Crypto", percentage: 35, color: "from-purple-400 to-pink-500" }, { name: "ETFs", percentage: 20, color: "from-emerald-400 to-teal-500" } ];

// // ============================================================================
// // ASSETS DATA
// // ============================================================================
// const getFixedHistoricalData = (basePrice: number, points: number = 20): number[] => {
//   const data: number[] = [];
//   let price = basePrice;
//   for (let i = 0; i < points; i++) { const variation = Math.sin(i * 0.5 + basePrice) * basePrice * 0.02; price = Math.max(price + variation, basePrice * 0.7); data.push(price); }
//   return data;
// };

// const availableAssets: Asset[] = [
//   { id: "gold", name: "Gold", symbol: "XAU", type: "commodity", price: 2345.67, change: 28.45, changePercent: 1.23, volume: "2.4M", marketCap: "$13.2T", description: "Physical gold bullion - The ultimate store of value and hedge against inflation. Gold has been a trusted asset for millennia, offering stability in times of economic uncertainty.", icon: <Gem size={20} />, color: "from-yellow-500 to-amber-600", bgGradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20", isGold: true, isTrending: true, historicalData: getFixedHistoricalData(2345.67, 30), sector: "Precious Metals", yearHigh: 2450.00, yearLow: 1980.00 },
//   { id: "bitcoin", name: "Bitcoin", symbol: "BTC", type: "crypto", price: 67234.89, change: -1234.56, changePercent: -1.80, volume: "28.5B", marketCap: "$1.32T", description: "The world's leading cryptocurrency. Bitcoin offers decentralized digital gold with limited supply and global accessibility.", icon: <Bitcoin size={20} />, color: "from-orange-400 to-amber-500", bgGradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20", isTrending: false, historicalData: getFixedHistoricalData(67234.89, 30), sector: "Cryptocurrency", yearHigh: 73500.00, yearLow: 38500.00 },
//   { id: "ethereum", name: "Ethereum", symbol: "ETH", type: "crypto", price: 3456.78, change: 89.12, changePercent: 2.65, volume: "15.2B", marketCap: "$415B", description: "Smart contract platform enabling decentralized applications and DeFi. Ethereum is the foundation of Web3 innovation.", icon: <Coins size={20} />, color: "from-purple-400 to-indigo-500", bgGradient: "from-purple-500/20 via-indigo-500/10 to-blue-500/20", isTrending: true, historicalData: getFixedHistoricalData(3456.78, 30), sector: "Cryptocurrency", yearHigh: 4100.00, yearLow: 2200.00 },
//   { id: "solana", name: "Solana", symbol: "SOL", type: "crypto", price: 145.67, change: 12.34, changePercent: 9.26, volume: "3.8B", marketCap: "$64.5B", description: "High-performance blockchain supporting decentralized apps and marketplaces. Solana offers lightning-fast transactions and low fees.", icon: <Zap size={20} />, color: "from-purple-500 to-pink-500", bgGradient: "from-purple-500/20 via-pink-500/10 to-rose-500/20", isTrending: true, isNew: true, historicalData: getFixedHistoricalData(145.67, 30), sector: "Cryptocurrency", yearHigh: 200.00, yearLow: 80.00 },
//   { id: "sp500", name: "S&P 500", symbol: "SPX", type: "etf", price: 5234.56, change: 45.67, changePercent: 0.88, volume: "4.2B", marketCap: "$38.5T", description: "Broad market index tracking 500 leading US companies. The S&P 500 provides diversified exposure to the American economy.", icon: <BarChart3 size={20} />, color: "from-emerald-400 to-teal-500", bgGradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20", historicalData: getFixedHistoricalData(5234.56, 30), sector: "Index Funds", dividend: "1.45%", peRatio: 22.5, yearHigh: 5400.00, yearLow: 4100.00 },
//   { id: "nasdaq", name: "NASDAQ-100", symbol: "NDX", type: "etf", price: 18234.12, change: -234.56, changePercent: -1.27, volume: "3.8B", marketCap: "$22.1T", description: "Tech-heavy index featuring the world's largest technology companies. NASDAQ-100 represents the future of innovation.", icon: <LineChart size={20} />, color: "from-blue-400 to-cyan-500", bgGradient: "from-blue-500/20 via-cyan-500/10 to-sky-500/20", historicalData: getFixedHistoricalData(18234.12, 30), sector: "Technology ETFs", dividend: "0.85%", peRatio: 28.3, yearHigh: 19000.00, yearLow: 14200.00 },
//   { id: "vti", name: "Vanguard Total Stock", symbol: "VTI", type: "etf", price: 259.34, change: 3.45, changePercent: 1.35, volume: "6.7M", marketCap: "$1.4T", description: "Total US stock market ETF providing broad exposure to the entire US equity market. VTI offers diversified, low-cost index investing.", icon: <PieChart size={20} />, color: "from-blue-500 to-indigo-500", bgGradient: "from-blue-500/20 via-indigo-500/10 to-purple-500/20", historicalData: getFixedHistoricalData(259.34, 30), sector: "Index Funds", dividend: "1.65%", peRatio: 20.8, yearHigh: 270.00, yearLow: 210.00 },
//   { id: "qqq", name: "Invesco QQQ", symbol: "QQQ", type: "etf", price: 445.78, change: 5.67, changePercent: 1.29, volume: "52.3M", marketCap: "$235B", description: "Nasdaq-100 index ETF tracking the performance of 100 largest non-financial companies listed on Nasdaq.", icon: <TrendingUp size={20} />, color: "from-blue-400 to-purple-500", bgGradient: "from-blue-500/20 via-purple-500/10 to-indigo-500/20", historicalData: getFixedHistoricalData(445.78, 30), sector: "Technology ETFs", dividend: "0.65%", peRatio: 25.1, yearHigh: 460.00, yearLow: 350.00 },
//   { id: "apple", name: "Apple Inc.", symbol: "AAPL", type: "stock", price: 178.45, change: 2.34, changePercent: 1.33, volume: "55.2M", marketCap: "$2.78T", description: "Global technology leader known for innovative products and services. Apple continues to redefine consumer electronics.", icon: <TrendingUp size={20} />, color: "from-gray-400 to-gray-600", bgGradient: "from-gray-500/20 via-slate-500/10 to-zinc-500/20", historicalData: getFixedHistoricalData(178.45, 30), sector: "Technology", dividend: "0.55%", peRatio: 29.2, yearHigh: 195.00, yearLow: 145.00 },
//   { id: "nvidia", name: "NVIDIA Corp", symbol: "NVDA", type: "stock", price: 845.23, change: 34.56, changePercent: 4.26, volume: "32.1M", marketCap: "$2.08T", description: "AI and graphics processing pioneer. NVIDIA powers the future of artificial intelligence and high-performance computing.", icon: <Zap size={20} />, color: "from-green-400 to-emerald-500", bgGradient: "from-green-500/20 via-emerald-500/10 to-teal-500/20", isTrending: true, historicalData: getFixedHistoricalData(845.23, 30), sector: "Technology", peRatio: 45.6, yearHigh: 950.00, yearLow: 400.00 },
//   { id: "microsoft", name: "Microsoft Corp", symbol: "MSFT", type: "stock", price: 378.92, change: 5.67, changePercent: 1.52, volume: "28.4M", marketCap: "$2.82T", description: "Global technology company powering productivity, cloud computing, and AI solutions. Microsoft is a cornerstone of modern enterprise.", icon: <BarChart3 size={20} />, color: "from-blue-500 to-blue-600", bgGradient: "from-blue-500/20 via-blue-600/10 to-cyan-500/20", historicalData: getFixedHistoricalData(378.92, 30), sector: "Technology", dividend: "0.92%", peRatio: 32.5, yearHigh: 400.00, yearLow: 310.00 },
//   { id: "amazon", name: "Amazon.com", symbol: "AMZN", type: "stock", price: 184.45, change: -2.34, changePercent: -1.25, volume: "42.8M", marketCap: "$1.92T", description: "E-commerce and cloud computing giant. Amazon leads in online retail, AWS cloud services, and entertainment streaming.", icon: <ShoppingBag size={20} />, color: "from-orange-500 to-amber-600", bgGradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20", historicalData: getFixedHistoricalData(184.45, 30), sector: "Consumer Discretionary", peRatio: 48.2, yearHigh: 200.00, yearLow: 130.00 },
//   { id: "google", name: "Alphabet Inc.", symbol: "GOOGL", type: "stock", price: 145.67, change: 1.23, changePercent: 0.85, volume: "22.3M", marketCap: "$1.82T", description: "Google's parent company, leading in search, advertising, cloud computing, and AI innovation. Alphabet shapes the digital economy.", icon: <Globe size={20} />, color: "from-blue-400 to-green-500", bgGradient: "from-blue-500/20 via-green-500/10 to-emerald-500/20", historicalData: getFixedHistoricalData(145.67, 30), sector: "Technology", dividend: "0.25%", peRatio: 25.8, yearHigh: 160.00, yearLow: 120.00 },
//   { id: "tesla", name: "Tesla Inc.", symbol: "TSLA", type: "stock", price: 245.67, change: -8.90, changePercent: -3.50, volume: "78.5M", marketCap: "$785B", description: "Electric vehicle and clean energy pioneer. Tesla leads the automotive industry's transition to sustainable energy solutions.", icon: <Zap size={20} />, color: "from-red-400 to-orange-500", bgGradient: "from-red-500/20 via-orange-500/10 to-amber-500/20", historicalData: getFixedHistoricalData(245.67, 30), sector: "Automotive", peRatio: 72.4, yearHigh: 320.00, yearLow: 160.00 },
//   { id: "silver", name: "Silver", symbol: "XAG", type: "commodity", price: 28.92, change: 1.23, changePercent: 4.44, volume: "1.1M", marketCap: "$1.8T", description: "Industrial and precious metal with dual utility. Silver is essential in electronics, solar panels, and jewelry.", icon: <DollarSign size={20} />, color: "from-gray-400 to-slate-500", bgGradient: "from-gray-500/20 via-slate-500/10 to-zinc-500/20", isTrending: true, historicalData: getFixedHistoricalData(28.92, 30), sector: "Precious Metals", yearHigh: 32.00, yearLow: 22.00 },
// ];

// // ============================================================================
// // ANIMATION VARIANTS
// // ============================================================================
// const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } } };
// const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { delay: delay * 0.08, duration: 0.4, ease: "easeOut" as const } }) };
// const itemVariants = { hidden: { opacity: 0, x: -10 }, visible: (delay: number = 0) => ({ opacity: 1, x: 0, transition: { delay: delay * 0.06, duration: 0.3, ease: "easeOut" as const } }) };

// // ============================================================================
// // HELPER: Clean Dashboard Data for Serialization
// // ============================================================================
// const cleanDashboardData = (data: UserDashboardData): UserDashboardData => {
//   return {
//     portfolioValue: data.portfolioValue || "$0.00", portfolioChange: data.portfolioChange || "0.0%", assetTotal: data.assetTotal || "$0.00",
//     transactions: data.transactions?.map(({ icon, ...rest }) => ({ id: rest.id, merchant: rest.merchant, type: rest.type, category: rest.category, date: rest.date, status: rest.status, amount: rest.amount, isNegative: rest.isNegative, })) || [],
//     upcomingBills: data.upcomingBills?.map((b) => ({ id: b.id, name: b.name, dueIn: b.dueIn, amount: b.amount, category: b.category, })) || [],
//     quickContacts: data.quickContacts?.map((c) => ({ id: c.id, name: c.name, avatar: c.avatar, initials: c.initials, })) || [],
//     spendingCategories: data.spendingCategories?.map((c) => ({ name: c.name, percentage: c.percentage, color: c.color, })) || [],
//     watchlist: data.watchlist || [],
//     investments: data.investments?.map((i) => ({ id: i.id, assetId: i.assetId, amount: i.amount, purchasePrice: i.purchasePrice, date: i.date, })) || [],
//     recentBills: data.recentBills?.map((b) => ({ id: b.id, name: b.name, dueIn: b.dueIn, amount: b.amount, category: b.category, })) || [],
//     totalBalance: data.totalBalance, analysisBalance: data.analysisBalance, analysisNote: data.analysisNote ?? 0, analysisSummary: data.analysisSummary || "",
//     paymentMethods: data.paymentMethods || [], preferences: data.preferences || {},
//   };
// };

// // ============================================================================
// // OPTIMIZED SUBCOMPONENTS
// // ============================================================================

// // Memoized Asset Card Component
// const AssetCard = memo(({
//   asset, isExpanded, isInWatchlist, investedAmount, currentPrice, onToggle, onInvest, onWatchlistToggle,
// }: {
//   asset: Asset; isExpanded: boolean; isInWatchlist: boolean; investedAmount?: number; currentPrice?: number;
//   onToggle: () => void; onInvest: (asset: Asset) => void; onWatchlistToggle: (assetId: string) => void;
// }) => {
//   const isPositive = asset.change >= 0;
//   const cardGradients = [ "from-amber-400/30 via-yellow-400/20 to-orange-400/30", "from-orange-400/30 via-amber-400/20 to-yellow-400/30", "from-purple-400/30 via-indigo-400/20 to-blue-400/30", "from-pink-400/30 via-purple-400/20 to-rose-400/30", "from-emerald-400/30 via-teal-400/20 to-cyan-400/30", "from-blue-400/30 via-cyan-400/20 to-sky-400/30", ];
//   const gradientIndex = parseInt(asset.id) % cardGradients.length;
//   const gradientClass = cardGradients[gradientIndex];

//   const livePrice = currentPrice ?? asset.price;
//   const totalValue = investedAmount !== undefined ? investedAmount : 0;
//   const purchasePrice = asset.purchasePrice ?? asset.price;

//   return (
//     <motion.div whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }} className={`rounded-xl p-4 border-none bg-gradient-to-br ${gradientClass} backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300`} onClick={onToggle}>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/30 text-cyan-900 shadow-md">{asset.icon}</div>
//           <div><p className="text-sm font-semibold text-cyan-900">{asset.symbol}</p><p className="text-xs text-cyan-800/70">{asset.name}</p></div>
//         </div>
//         <div className="text-right">
//           <p className="text-sm font-bold text-cyan-900">${formatCurrency(livePrice)}</p>
//           <p className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>{isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%</p>
//         </div>
//       </div>

//       {investedAmount !== undefined && (
//         <div className="mt-2 pt-2 border-t border-cyan-200/30 flex flex-col gap-1">
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-cyan-700/80">You Paid:</span>
//             <span className="text-sm font-bold text-slate-700">${formatCurrency(investedAmount)}</span>
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-cyan-700/80">Live Value:</span>
//             <span className="text-sm font-bold text-emerald-600">${formatCurrency(totalValue * (livePrice / purchasePrice))}</span>
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-cyan-700/80">Profit / Loss:</span>
//             <span className={`text-sm font-bold ${(livePrice - purchasePrice) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
//               {((livePrice - purchasePrice) / purchasePrice * 100).toFixed(2)}%
//             </span>
//           </div>
//         </div>
//       )}

//       {isExpanded && (
//         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-3 border-t border-cyan-200/30 pt-3">
//           <p className="text-xs text-cyan-800">{asset.description}</p>
//           <div className="grid grid-cols-2 gap-2 text-xs">
//             {asset.marketCap && (<div><p className="text-cyan-700/60">Market Cap</p><p className="text-cyan-900 font-medium">{asset.marketCap}</p></div>)}
//             {asset.sector && (<div><p className="text-cyan-700/60">Sector</p><p className="text-cyan-900 font-medium">{asset.sector}</p></div>)}
//           </div>
//           <div className="flex gap-2">
//             <button onClick={(e) => { e.stopPropagation(); onInvest(asset); }} className="flex-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:shadow-lg transition-all">Buy</button>
//             <button onClick={(e) => { e.stopPropagation(); onWatchlistToggle(asset.id); }} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${isInWatchlist ? "bg-amber-500/30 text-amber-700" : "bg-white/30 text-cyan-700 hover:text-cyan-900"} border-none shadow-sm hover:shadow-md transition-all`}><Star size={14} className={isInWatchlist ? "fill-amber-500" : ""} /></button>
//           </div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// });
// AssetCard.displayName = 'AssetCard';

// // Memoized Upcoming Bill Item
// const UpcomingBillItem = memo(({ bill, index }: { bill: UpcomingBill; index: number }) => {
//   const billGradients = [ "from-amber-400/20 via-yellow-400/10 to-orange-400/20", "from-blue-400/20 via-cyan-400/10 to-sky-400/20", "from-purple-400/20 via-indigo-400/10 to-violet-400/20", ];
//   const gradientIndex = index % billGradients.length;
//   const gradientClass = billGradients[gradientIndex];

//   return (
//     <motion.div custom={index} variants={itemVariants} initial="hidden" animate="visible" whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }} className={`flex items-center justify-between rounded-lg bg-gradient-to-br ${gradientClass} p-3 backdrop-blur-sm border-none cursor-pointer hover:shadow-xl transition-all duration-300`}>
//       <div className="flex items-center gap-3">
//         <div className="rounded-lg bg-amber-500/30 p-2 shadow-sm"><Calendar size={16} className="text-amber-600" /></div>
//         <div><p className="text-sm font-medium text-cyan-900">{bill.name}</p><div className="flex items-center gap-2"><Clock size={12} className="text-cyan-700/50" /><span className="text-xs text-cyan-700/60">Due in {bill.dueIn}</span></div></div>
//       </div>
//       <span className="text-sm font-semibold text-cyan-900">${formatCurrency(bill.amount)}</span>
//     </motion.div>
//   );
// });
// UpcomingBillItem.displayName = 'UpcomingBillItem';

// // Memoized Recent Bills Item
// const RecentBillItem = memo(({ bill, index }: { bill: UpcomingBill; index: number }) => {
//   const billGradients = [ "from-emerald-400/20 via-green-400/10 to-teal-400/20", "from-blue-400/20 via-cyan-400/10 to-sky-400/20", "from-purple-400/20 via-indigo-400/10 to-violet-400/20", "from-amber-400/20 via-yellow-400/10 to-orange-400/20", "from-pink-400/20 via-rose-400/10 to-red-400/20", ];
//   const gradientIndex = index % billGradients.length;
//   const gradientClass = billGradients[gradientIndex];

//   return (
//     <motion.div custom={index} variants={itemVariants} initial="hidden" animate="visible" whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} className={`flex items-center justify-between rounded-lg bg-gradient-to-br ${gradientClass} p-3 backdrop-blur-sm border-none cursor-pointer hover:shadow-xl transition-all duration-300`}>
//       <div className="flex items-center gap-3">
//         <div className="rounded-lg bg-emerald-500/30 p-2 shadow-sm"><CheckCircle size={16} className="text-emerald-600" /></div>
//         <div><p className="text-sm font-medium text-cyan-900">{bill.name}</p><div className="flex items-center gap-2"><span className="text-xs text-emerald-600">{bill.dueIn}</span><span className="text-xs text-cyan-700/50">•</span><span className="text-xs text-cyan-700/60">{bill.category}</span></div></div>
//       </div>
//       <span className="text-sm font-semibold text-cyan-900">${formatCurrency(bill.amount)}</span>
//     </motion.div>
//   );
// });
// RecentBillItem.displayName = 'RecentBillItem';

// // ============================================================================
// // INVESTMENT DASHBOARD COMPONENT
// // ============================================================================
// function InvestmentDashboard({ userData, onAddInvestment }: { userData: UserDashboardData; onAddInvestment: (assetId: string, amount: number) => void; }) {
//   const investedAssets = useMemo(() => {
//     if (!userData.investments || userData.investments.length === 0) return [];

//     const mergedMap = new Map<string, { asset: Asset; amount: number; date: string }>();
//     userData.investments.forEach((inv) => {
//       const asset = availableAssets.find((a) => a.id === inv.assetId);
//       if (!asset) return;
//       const existing = mergedMap.get(inv.assetId);
//       if (existing) {
//         existing.amount += inv.amount;
//         if (new Date(inv.date) > new Date(existing.date)) { existing.date = inv.date; }
//       } else {
//         mergedMap.set(inv.assetId, { asset, amount: inv.amount, date: inv.date });
//       }
//     });

//     return Array.from(mergedMap.values())
//       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//       .map(item => ({ ...item.asset, investedAmount: item.amount, purchasePrice: item.asset.price }));
//   }, [userData.investments]);

//   const [livePrices, setLivePrices] = useState<Record<string, number>>({});

//   useEffect(() => {
//     if (!investedAssets.length) return;

//     const fetchPrices = async () => {
//       try {
//         const ids = investedAssets.map(a => a.id).join(",");
//         const response = await fetch(`/api/prices?ids=${ids}&vs_currencies=usd`);
//         if (response.ok) {
//           const data = await response.json();
//           const priceMap: Record<string, number> = {};
//           investedAssets.forEach(asset => {
//             if (data[asset.id]) {
//               priceMap[asset.id] = data[asset.id].usd;
//             }
//           });
//           setLivePrices(priceMap);
//         }
//       } catch (error) {
//         console.error("Error fetching live prices:", error);
//       }
//     };

//     fetchPrices();
//     const interval = setInterval(fetchPrices, 5000);
//     return () => clearInterval(interval);
//   }, [investedAssets]);

//   const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
//   const [showInvestModal, setShowInvestModal] = useState(false);
//   const [investmentAmount, setInvestmentAmount] = useState("");

//   if (investedAssets.length === 0) return null;

//   const handleInvest = useCallback((asset: Asset) => {
//     setSelectedAsset(asset);
//     setShowInvestModal(true);
//   }, []);

//   const handleConfirmInvestment = useCallback(() => {
//     if (!selectedAsset || !investmentAmount) return;
//     const amount = parseFloat(investmentAmount);
//     if (isNaN(amount) || amount <= 0) return;
//     onAddInvestment(selectedAsset.id, amount);
//     setShowInvestModal(false);
//     setInvestmentAmount("");
//     setSelectedAsset(null);
//   }, [selectedAsset, investmentAmount, onAddInvestment]);

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//         {investedAssets.map((asset: any, index) => (
//           <AssetCard
//             key={`${asset.id}-${index}`}
//             asset={asset}
//             isExpanded={false}
//             isInWatchlist={false}
//             investedAmount={asset.investedAmount}
//             currentPrice={livePrices[asset.id]}
//             onToggle={() => {}}
//             onInvest={handleInvest}
//             onWatchlistToggle={() => {}}
//           />
//         ))}
//       </div>

//       <AnimatePresence>
//         {showInvestModal && selectedAsset && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-none p-4 backdrop-blur-sm" onClick={() => setShowInvestModal(false)}>
//             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md rounded-2xl bg-[#C4F8FD] p-6 shadow-xl border-none" onClick={(e) => e.stopPropagation()}>
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-bold text-cyan-600">{selectedAsset.name}</h2>
//                 <button onClick={() => setShowInvestModal(false)} className="rounded-lg p-1 hover:bg-white/10 transition-colors"><div className="font-lg text-cyan-900">X</div></button>
//               </div>
//               <div className={`rounded-xl p-4 mb-4 bg-[#C4F8FD] shadow-xl ${selectedAsset.bgGradient} border-none`}>
//                 <div className="flex items-center justify-between">
//                   <div><p className="text-sm font-medium text-cyan-900">{selectedAsset.symbol}</p><p className="text-2xl font-bold text-amber-400">${formatCurrency(selectedAsset.price)}</p></div>
//                   <div className={`flex items-center gap-1 font-medium ${selectedAsset.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>{selectedAsset.change >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}<span>{Math.abs(selectedAsset.changePercent).toFixed(2)}%</span></div>
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <div>
//                   <label className="text-xs font-bold text-slate-400 block mb-1">Amount($)</label>
//                   <input type="number" placeholder="0.00" value={investmentAmount} onChange={(e) => setInvestmentAmount(e.target.value)} className="w-full rounded-lg border-none shadow-xl bg-[#C4F8FD] px-4 font-bold py-3 text-emerald-400 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
//                 </div>
//                 <div className="flex gap-2 flex-wrap">
//                   {[100, 500, 1000, 5000].map((amount) => (
//                     <button key={amount} onClick={() => setInvestmentAmount(amount.toString())} className="flex-1 min-w-[60px] rounded-lg bg-[#C4F8FD] px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-slate-700 transition-colors border-none shadow-xl hover:border-slate-600">{amount}</button>
//                   ))}
//                 </div>
//                 <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleConfirmInvestment} className="w-full rounded-xl bg-[#C4F8FD]0 py-3 font-bold text-emerald-400 shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer">
//                   <span className="flex items-center justify-center gap-2"><Send size={18} />Confirm</span>
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ============================================================================
// // UPCOMING / RECENT BILLS COMPONENTS
// // ============================================================================
// function UpcomingBillsSection({ bills }: { bills: UpcomingBill[] }) {
//   return (<div className="space-y-3">{bills.map((bill, index) => (<UpcomingBillItem key={bill.id} bill={bill} index={index} />))}</div>);
// }
// function RecentBillsSection({ bills }: { bills: UpcomingBill[] }) {
//   return (<div className="space-y-2">{bills.map((bill, index) => (<RecentBillItem key={bill.id} bill={bill} index={index} />))}</div>);
// }

// // ============================================================================
// // MAIN DASHBOARD COMPONENT
// // ============================================================================
// export default function Dash() {
//   const [user, setUser] = useState<UserData | null>(null);
//   const [userName, setUserName] = useState("User");
//   const [loading, setLoading] = useState(true);
//   const [dashboardData, setDashboardData] = useState<UserDashboardData>({ 
//     portfolioValue: "$0.00", 
//     portfolioChange: "0.0%", 
//     assetTotal: "$0.00", 
//     transactions: defaultTransactions, 
//     upcomingBills: defaultUpcomingBills, 
//     quickContacts: defaultQuickContacts, 
//     spendingCategories: defaultSpendingCategories, 
//     watchlist: [], 
//     investments: [], 
//     recentBills: defaultRecentBills, 
//     analysisNote: 0, 
//     analysisSummary: "" 
//   });

//   const [showAffiliateModal, setShowAffiliateModal] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [refreshMessage, setRefreshMessage] = useState('');

//   // ✅ NEW STATES FOR GENERATING MODAL
//   const [showGeneratingModal, setShowGeneratingModal] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatingMessage, setGeneratingMessage] = useState('Generating account details for this user...');

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     if (params.get('openFunds') === 'true') { 
//       setShowAffiliateModal(true); 
//     }
//   }, []);

//   const accountDetails = { 
//     bankName: dashboardData.preferences?.bankName || dashboardData.paymentMethods?.[0]?.brand || "", 
//     accountNumber: dashboardData.paymentMethods?.[0]?.last4 || "", 
//     sortCode: dashboardData.preferences?.sortCode || "12-34-56", 
//     accountName: dashboardData.preferences?.accountName || "", 
//     reference: dashboardData.preferences?.reference || "" 
//   };

//   const isMounted = useRef(true);
//   const dataLoaded = useRef(false);

//   useEffect(() => {
//     isMounted.current = true;
//     const checkAuth = async () => {
//       try {
//         const token = localStorage.getItem('auth_token');
//         const userData = localStorage.getItem('user');
//         if (!token || !userData) {
//           if (typeof window !== 'undefined') { window.location.href = "/log-in"; }
//           setLoading(false);
//           return;
//         }
//         const parsedUser = JSON.parse(userData) as UserData;
//         setUser(parsedUser);
//         setUserName(parsedUser.displayName || parsedUser.firstName || 'User');
//         if (!dataLoaded.current) {
//           await loadUserDashboard(parsedUser._id);
//           dataLoaded.current = true;
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Auth error:", error);
//         localStorage.removeItem('auth_token');
//         localStorage.removeItem('user');
//         if (typeof window !== 'undefined') { window.location.href = "/log-in"; }
//         setLoading(false);
//       }
//     };
//     checkAuth();
//     return () => { isMounted.current = false; };
//   }, []);

//   const loadUserDashboard = async (userId: string) => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`/api/user/dashboard?userId=${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
//       const result = await response.json();
//       if (!isMounted.current) return;
//       if (response.ok && result.success && result.data) {
//         const userData = result.data;
//         const rawBills = userData.bills || [];
//         const rawTransactions = userData.recentTransactions || [];

//         const formattedUpcomingBills = rawBills.filter((b: any) => { 
//           const status = (b.status || '').trim().toLowerCase(); 
//           return status === 'pending' || status === 'unpaid'; 
//         }).map((b: any) => { 
//           let dueInText = "Unknown"; 
//           if (b.dueDate) { 
//             const daysLeft = Math.ceil((new Date(b.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24)); 
//             dueInText = daysLeft <= 0 ? "Overdue" : `${daysLeft} days`; 
//           } 
//           return { 
//             id: b.id || Date.now().toString(), 
//             name: b.name || b.title || "Unnamed Bill", 
//             dueIn: dueInText, 
//             amount: typeof b.amount === 'number' ? `${b.amount.toFixed(2)}` : b.amount || "0.00", 
//             category: b.category || "General" 
//           }; 
//         });
        
//         const formattedRecentBills = rawBills.filter((b: any) => { 
//           const status = (b.status || '').trim().toLowerCase(); 
//           return status === 'paid'; 
//         }).map((b: any) => ({ 
//           id: b.id || Date.now().toString(), 
//           name: b.name || b.title || "Unnamed Bill", 
//           dueIn: "Paid", 
//           amount: typeof b.amount === 'number' ? `${b.amount.toFixed(2)}` : b.amount || "0.00", 
//           category: b.category || "General" 
//         }));

//         const portfolioAmount = parseFloat(userData.totalBalance?.amount) || 0;
//         const portfolioValueStr = `${portfolioAmount.toFixed(2)}`;
//         const portfolioChange = userData.totalBalance?.change || "0.0%";
//         const analysisNoteValue = userData.analysisNote ? parseFloat(userData.analysisNote) : 0;
//         const assetTotalStr = analysisNoteValue > 0 ? `${analysisNoteValue.toFixed(2)}` : "0.00";

//         setDashboardData({
//           portfolioValue: portfolioValueStr, 
//           portfolioChange: portfolioChange, 
//           assetTotal: assetTotalStr,
//           transactions: rawTransactions.map((t: any) => ({ 
//             id: t.id || Date.now().toString(), 
//             merchant: t.merchant || "Unknown", 
//             type: t.type || "Purchase", 
//             category: t.category || "General", 
//             date: t.date || new Date().toLocaleDateString(), 
//             status: t.status || "completed", 
//             amount: typeof t.amount === 'number' ? `${t.amount.toFixed(2)}` : t.amount || "0.00", 
//             isNegative: t.isNegative ?? true, 
//           })),
//           upcomingBills: formattedUpcomingBills, 
//           quickContacts: defaultQuickContacts,
//           spendingCategories: [ 
//             { name: "Stocks", percentage: parseInt(userData.analysisBalance?.stocks) || 45, color: "from-blue-400 to-cyan-500" }, 
//             { name: "Crypto", percentage: parseInt(userData.analysisBalance?.crypto) || 35, color: "from-purple-400 to-pink-500" }, 
//             { name: "ETFs", percentage: parseInt(userData.analysisBalance?.etfs) || 20, color: "from-emerald-400 to-teal-500" } 
//           ],
//           watchlist: [], 
//           investments: userData.investments || [], 
//           recentBills: formattedRecentBills, 
//           totalBalance: userData.totalBalance, 
//           analysisBalance: userData.analysisBalance, 
//           analysisNote: analysisNoteValue, 
//           analysisSummary: userData.analysisSummary || "", 
//           paymentMethods: userData.paymentMethods || [], 
//           preferences: userData.preferences || {},
//         });
//       }
//     } catch (error) { console.error("Error loading dashboard:", error); }
//   };

//   const saveDashboardData = async (userId: string, data: UserDashboardData) => {
//     try {
//       const preparedData = { 
//         totalBalance: { amount: data.portfolioValue, change: data.portfolioChange }, 
//         analysisBalance: { total: data.portfolioValue, stocks: data.spendingCategories[0]?.percentage + "%" || "45%", crypto: data.spendingCategories[1]?.percentage + "%" || "35%", etfs: data.spendingCategories[2]?.percentage + "%" || "20%" }, 
//         analysisNote: parseFloat(data.assetTotal.replace(/[^0-9.]/g, "")) || 0, 
//         analysisSummary: data.analysisSummary || "", 
//         bills: data.recentBills.map((b: any) => ({ ...b, status: 'paid' })), 
//         recentTransactions: data.transactions, 
//         upcomingBills: data.upcomingBills, 
//         paymentMethods: data.paymentMethods || [], 
//         preferences: data.preferences || {} 
//       };
//       const response = await fetch('/api/user/dashboard', { 
//         method: 'POST', 
//         headers: { 'Content-Type': 'application/json' }, 
//         body: JSON.stringify({ userId, dashboardData: preparedData }) 
//       });
//       if (!response.ok) { throw new Error('Failed to save dashboard data'); }
//     } catch (error) { console.error("Error saving dashboard:", error); }
//   };

//   const refreshDashboard = useCallback(async () => {
//     if (!user) return;
//     setIsRefreshing(true);
//     setRefreshMessage('Refreshing...');
//     try { 
//       await loadUserDashboard(user._id); 
//       setRefreshMessage('refreshed successfully!'); 
//       setTimeout(() => setRefreshMessage(''), 3000); 
//     }
//     catch (error) { 
//       setRefreshMessage('❌ Refresh failed. Please try again.'); 
//     }
//     finally { 
//       setIsRefreshing(false); 
//     }
//   }, [user]);

//   // ✅ NEW: Function to check if user has payment details set
//   const checkUserPaymentDetails = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       if (!user) return false;
      
//       const response = await fetch(`/api/user/accounts`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       const result = await response.json();
      
//       if (result.success && result.data) {
//         const { accounts, crypto } = result.data;
        
//         const hasBankDetails = accounts?.some((acc: any) => 
//           acc.bankName && acc.accountName && acc.accountNumber
//         );
        
//         const hasCryptoDetails = !!(crypto?.walletAddress && crypto?.network);
        
//         return hasBankDetails || hasCryptoDetails;
//       }
      
//       const hasPreferences = !!(dashboardData.preferences?.bankName || dashboardData.preferences?.accountName);
      
//       return hasPreferences;
      
//     } catch (error) {
//       console.error("Error checking payment details:", error);
//       return false;
//     }
//   }, [user, dashboardData]);

//   // ✅ NEW: Function to send request to admin
//   const sendAccountGenerationRequest = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       if (!user) return;
      
//       const response = await fetch('/api/user/request-account-details', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           userId: user._id,
//           userEmail: user.email,
//           userName: user.displayName || user.firstName || 'User',
//           timestamp: new Date().toISOString(),
//           status: 'pending'
//         })
//       });
      
//       const result = await response.json();
      
//       if (!response.ok) {
//         console.error('Failed to send request:', result.error);
//       }
      
//       return result;
      
//     } catch (error) {
//       console.error('Error sending account generation request:', error);
//       return { success: false };
//     }
//   }, [user]);

//   // ✅ FIXED: Modified Add button click handler with user dependency
//   const handleAddClick = useCallback(async () => {
//     const hasPaymentDetails = await checkUserPaymentDetails();
    
//     if (hasPaymentDetails) {
//       setShowAffiliateModal(true);
//     } else {
//       setShowGeneratingModal(true);
//       setIsGenerating(true);
//       setGeneratingMessage('Generating account details for this user...');
      
//       await sendAccountGenerationRequest();
      
//       setTimeout(() => {
//         setIsGenerating(false);
//         setGeneratingMessage('Account details generation request sent to admin!');
        
//         setTimeout(() => {
//           setShowGeneratingModal(false);
//         }, 3000);
//       }, 4000);
//     }
//   }, [checkUserPaymentDetails, sendAccountGenerationRequest, user]); // ✅ Added 'user' dependency

//   // ✅ NEW: Function to close generating modal
//   const closeGeneratingModal = useCallback(() => {
//     setShowGeneratingModal(false);
//     setIsGenerating(false);
//     setGeneratingMessage('Generating account details for this user...');
//   }, []);

//   const handleAddInvestment = useCallback((assetId: string, amount: number) => {
//     const asset = availableAssets.find((a: Asset) => a.id === assetId);
//     if (!asset || !isMounted.current) return;
//     const newInvestment = { assetId, amount, purchasePrice: asset.price, date: new Date().toISOString() };

//     setDashboardData((prev: UserDashboardData) => {
//       const currentValue = parseFloat(prev.portfolioValue.replace(/[^0-9.]/g, ""));
//       const newValue = currentValue + amount;
//       const formattedValue = `$${newValue.toFixed(2)}`;
//       const change = ((newValue - currentValue) / (currentValue || 1)) * 100;
//       const changeFormatted = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;

//       const existingInv = (prev.investments || []).find((inv: any) => inv.assetId === assetId);
//       let updatedInvestments;
//       if (existingInv) {
//         updatedInvestments = prev.investments.map((inv: any) => inv.assetId === assetId ? { ...inv, amount: inv.amount + amount, date: newInvestment.date } : inv);
//       } else {
//         updatedInvestments = [...(prev.investments || []), newInvestment];
//       }

//       if (user && isMounted.current) {
//         saveDashboardData(user._id, {
//           ...prev,
//           investments: updatedInvestments,
//           portfolioValue: formattedValue,
//           portfolioChange: changeFormatted
//         });
//       }

//       return { ...prev, investments: updatedInvestments, portfolioValue: formattedValue, portfolioChange: changeFormatted };
//     });
//   }, [user]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//         <div className="mx-auto max-w-6xl space-y-4">
//           <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#C4F8FD] pb-9 to-gray-300 px-4 pt-4 sm:pb-9 sm:pt-6 sm:px-6 lg:p-8">
//       <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-6xl">
//         <motion.div custom={0} variants={cardVariants} className="mb-6 flex flex-wrap items-center justify-between gap-4">
//           <div className="flex items-center gap-4"><Greet username={userName} className="mb-0" iconSize={70} /></div>
//         </motion.div>

//         <motion.div custom={1} variants={cardVariants} whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }} className="mb-6 rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-none">
//           <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
//             <div>
//               <div className="flex flex-row justify-between w-[78vw] items-center"><p className="text-sm font-medium text-cyan-700">Total Balance</p><div className="md:hidden block items-center relative p-auto my-auto right-0 top-0"><UserAvatar className="shadow-xl m-auto ring-cyan-500/50" /></div></div>
//               <div className="flex items-baseline gap-3"><span className="text-3xl font-bold text-cyan-900 sm:text-4xl"><span className="text-3xl text-amber-400 sm:text-4xl font-normal">$</span>{formatCurrency(dashboardData.portfolioValue)}</span><span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${dashboardData.portfolioChange.startsWith('+') ? 'bg-emerald-400/30 text-emerald-700' : 'bg-red-400/30 text-red-700'}`}>{dashboardData.portfolioChange}</span></div>
//             </div>
//             <div className="hidden md:block items-center p-0 -md:ml-[15vw] md:my-auto md:right-0 md:top-0"><UserAvatar className="ring-2 ring-cyan-500/50" /></div>
//           </div>
//           <div className="flex items-center gap-4 mt-2 flex-wrap">
//             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={refreshDashboard} disabled={isRefreshing} className="flex items-center gap-1 rounded-lg bg-white/30 px-3 py-1.5 text-xs font-medium text-cyan-700 shadow-md hover:shadow-lg transition-all hover:bg-white/50 disabled:opacity-50"><RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />{isRefreshing ? 'Refreshing...' : 'Refresh'}</motion.button>
//             {refreshMessage && (<span className="text-xs text-emerald-600">{refreshMessage}</span>)}
            
//             <ManageAccountButton 
//               variant="outline" 
//               size="sm"
//               className="flex-shrink-0"
//             >
//               Bank details
//             </ManageAccountButton>
            
//             <div className="pl-[70%]">
//               <motion.button 
//                 whileHover={{ scale: 1.05 }} 
//                 whileTap={{ scale: 0.95 }} 
//                 onClick={handleAddClick}
//                 className="flex items-center gap-1 rounded-lg bg-[#C4F8FD] px-3 py-1.5 text-xs text-amber-400 font-bold shadow-xl cursor-pointer m-auto right-0 top-0 hover:shadow-2xl transition-all duration-300 hover:bg-[#b0ecf5]"
//               >
//                 <Plus className='text-amber-400 font-bold' size={14} />
//                 <span className='py-1 px-2'>Add</span>
//               </motion.button>
//             </div>
//           </div>
//         </motion.div>

//         <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-1">
//           <motion.div custom={2} whileHover={{ scale: 1.01, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }} whileTap={{ scale: 0.99 }} variants={cardVariants} className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-[#C4F8FD] via-[#B5F0F8] to-[#A5E8F2] p-5 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
//             <InvestmentDashboard userData={dashboardData} onAddInvestment={handleAddInvestment} />
//           </motion.div>
//         </div>

//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//           <motion.div custom={3} whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }} whileTap={{ scale: 0.98 }} variants={cardVariants} className="rounded-2xl border-none bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] shadow-xl p-5 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
//             <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-600">Assets</h2><div className="flex items-center gap-2"><Link href={'/Buy'}><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">View All</motion.button></Link></div></div>
//             <div className="mt-3 flex items-end justify-between"><div><p className="text-2xl font-bold text-cyan-900"><span className="text-md text-amber-400 sm:text-2xl font-normal">$</span>{formatCurrency(dashboardData.assetTotal)}</p><p className="text-xs text-cyan-700">Total</p></div><div className={`flex items-center font-bold gap-1 text-sm ${dashboardData.portfolioChange.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{dashboardData.portfolioChange.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}<span className="font-medium">{dashboardData.portfolioChange}</span></div></div>
//             <div className="mt-4 space-y-2.5">{dashboardData.spendingCategories.map((category: any, index: number) => (<motion.div key={category.name} custom={4 + index} variants={itemVariants} initial="hidden" animate="visible"><div className="flex items-center justify-between text-xs"><span className="text-cyan-800">{category.name}</span><span className="font-medium text-cyan-800">{category.percentage}%</span></div><div className="mt-0.5 h-1.5 w-full overflow-hidden cursor-pointer rounded-full bg-cyan-200/50"><motion.div initial={{ width: 0 }} animate={{ width: `${category.percentage}%` }} transition={{ duration: 0.8, delay: 0.3 + index * 0.08, ease: "easeOut" as const }} className={`h-full rounded-full hover:shadow-xl bg-gradient-to-r ${category.color}`} /></div></motion.div>))}{dashboardData.analysisSummary && (<div className="mt-2 text-xs text-cyan-700 font-medium bg-white/30 p-2 rounded-lg">{dashboardData.analysisSummary}</div>)}</div>
//           </motion.div>

//           <motion.div custom={4} variants={cardVariants} whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }} whileTap={{ scale: 0.98 }} className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-[#C4F8FD] via-[#B5F0F8] to-[#A5E8F2] p-5 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
//             <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-600">Upcoming Bills</h2><Link href={"/Bills"}><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">View All</motion.button></Link></div>
//             <UpcomingBillsSection bills={dashboardData.upcomingBills} />
//           </motion.div>
//         </div>

//         <motion.div custom={5} variants={cardVariants} whileHover={{ scale: 1.01, boxShadow: "0 20px 50px rgba(0,0,0,0.06)" }} whileTap={{ scale: 0.99 }} className="mt-4 rounded-2xl border-none bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] shadow-xl p-5 hover:shadow-2xl transition-all duration-300">
//           <div className="flex items-center text-cyan-700 justify-between"><h2 className="text-sm font-semibold text-slate-600">Recent Bills</h2></div>
//           <RecentBillsSection bills={dashboardData.recentBills} />
//         </motion.div>

//         <AffiliatePaymentModal isOpen={showAffiliateModal} onClose={() => setShowAffiliateModal(false)} />

//         {/* ✅ NEW: Generating Account Details Modal */}
//         <AnimatePresence>
//           {showGeneratingModal && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
//               onClick={closeGeneratingModal}
//             >
//               <motion.div
//                 initial={{ scale: 0.9, y: 20, opacity: 0 }}
//                 animate={{ scale: 1, y: 0, opacity: 1 }}
//                 exit={{ scale: 0.9, y: 20, opacity: 0 }}
//                 transition={{ type: "spring", damping: 20, stiffness: 300 }}
//                 className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] p-8 shadow-2xl border-none"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="text-center">
//                   <motion.div
//                     animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
//                     transition={isGenerating ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
//                     className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/20 shadow-inner"
//                   >
//                     {isGenerating ? (
//                       <RefreshCw size={40} className="text-cyan-700" />
//                     ) : (
//                       <CheckCircle size={40} className="text-emerald-500" />
//                     )}
//                   </motion.div>

//                   <motion.h3 
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="mb-2 text-xl font-bold text-cyan-900"
//                   >
//                     {isGenerating ? 'Generating Account Details' : 'Request Sent to Admin'}
//                   </motion.h3>

//                   <motion.p 
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.2 }}
//                     className="text-sm text-cyan-700/80"
//                   >
//                     {generatingMessage}
//                   </motion.p>

//                   {isGenerating && (
//                     <motion.div 
//                       initial={{ width: 0 }}
//                       animate={{ width: '100%' }}
//                       transition={{ duration: 4, ease: "easeInOut" }}
//                       className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-cyan-200/50"
//                     >
//                       <motion.div 
//                         className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
//                         style={{ width: '100%' }}
//                       />
//                     </motion.div>
//                   )}

//                   <div className="mt-6 space-y-2 text-left">
//                     <motion.div 
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.3 }}
//                       className="flex items-center gap-3 text-xs text-cyan-700"
//                     >
//                       <div className={`flex h-5 w-5 items-center justify-center rounded-full ${isGenerating ? 'bg-amber-500/30' : 'bg-emerald-500/30'}`}>
//                         {isGenerating ? <Clock size={12} className="text-amber-600" /> : <CheckCircle size={12} className="text-emerald-600" />}
//                       </div>
//                       <span>{isGenerating ? 'Generating bank account details...' : 'Bank details generated ✓'}</span>
//                     </motion.div>
                    
//                     <motion.div 
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.5 }}
//                       className="flex items-center gap-3 text-xs text-cyan-700"
//                     >
//                       <div className={`flex h-5 w-5 items-center justify-center rounded-full ${isGenerating ? 'bg-amber-500/30' : 'bg-emerald-500/30'}`}>
//                         {isGenerating ? <Clock size={12} className="text-amber-600" /> : <CheckCircle size={12} className="text-emerald-600" />}
//                       </div>
//                       <span>{isGenerating ? 'Generating crypto wallet address...' : 'Crypto details generated ✓'}</span>
//                     </motion.div>

//                     <motion.div 
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.7 }}
//                       className="flex items-center gap-3 text-xs text-cyan-700"
//                     >
//                       <div className={`flex h-5 w-5 items-center justify-center rounded-full ${isGenerating ? 'bg-amber-500/30' : 'bg-emerald-500/30'}`}>
//                         {isGenerating ? <Clock size={12} className="text-amber-600" /> : <CheckCircle size={12} className="text-emerald-600" />}
//                       </div>
//                       <span>{isGenerating ? 'Notifying admin...' : 'Admin notified ✓'}</span>
//                     </motion.div>
//                   </div>

//                   {!isGenerating && (
//                     <motion.button
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.5 }}
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       onClick={closeGeneratingModal}
//                       className="mt-6 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-2.5 font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300"
//                     >
//                       Continue
//                     </motion.button>
//                   )}
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </div>
//   );
// }