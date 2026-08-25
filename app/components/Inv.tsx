// app/Investment/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search } from "lucide-react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bitcoin,
  ArrowUpRight,
  ArrowDownRight,
  X,
  ChevronRight,
  Globe,
  Zap,
  BarChart3,
  Coins,
  Gem,
  LineChart,
  PieChart,
  Wallet,
  Send,
  Star,
  Activity,
  SlidersHorizontal,
  Users,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: "crypto" | "stock" | "etf" | "commodity";
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap?: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  isGold?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  historicalData?: number[];
  sector?: string;
  dividend?: string;
  peRatio?: number;
  yearHigh?: number;
  yearLow?: number;
}

interface Transaction {
  id: string;
  merchant: string;
  type: string;
  category: string;
  date: string;
  status: "completed" | "pending" | "failed";
  amount: string;
  isNegative: boolean;
}

// ============================================================================
// DATA - FIXED (no random values for hydration)
// ============================================================================

// Fixed seed data for hydration consistency
const getFixedHistoricalData = (basePrice: number, points: number = 20): number[] => {
  const data: number[] = [];
  let price = basePrice;
  for (let i = 0; i < points; i++) {
    const variation = Math.sin(i * 0.5 + basePrice) * basePrice * 0.02;
    price = Math.max(price + variation, basePrice * 0.7);
    data.push(price);
  }
  return data;
};

// 13 Different 4K HD Colors for cards
const cardColors = [
  { from: "#FF6B6B", to: "#EE5A24" },     // Crimson Red
  { from: "#FF9F43", to: "#E67E22" },     // Amber Orange
  { from: "#FECA57", to: "#F9CA24" },     // Golden Yellow
  { from: "#55E6C1", to: "#1DD1A1" },     // Mint Green
  { from: "#48DBFB", to: "#0ABDE3" },     // Sky Blue
  { from: "#686DE0", to: "#4834D4" },     // Royal Purple
  { from: "#BE2EDD", to: "#8E44AD" },     // Magenta Purple
  { from: "#FF6B81", to: "#E74C3C" },     // Rose Red
  { from: "#F8A5C2", to: "#F78FB3" },     // Pink Blush
  { from: "#7BED9F", to: "#2ECC71" },     // Emerald Green
  { from: "#70A1FF", to: "#1B9CFC" },     // Ocean Blue
  { from: "#FD7272", to: "#E84118" },     // Coral Red
  { from: "#A29BFE", to: "#6C5CE7" },     // Lavender Purple
];

// Comprehensive asset list with assigned 4K HD colors
const initialAssets: Asset[] = [
  // GOLD - Premium placement
  {
    id: "gold",
    name: "Gold",
    symbol: "XAU",
    type: "commodity",
    price: 2345.67,
    change: 28.45,
    changePercent: 1.23,
    volume: "2.4M",
    marketCap: "$13.2T",
    description: "Physical gold bullion - The ultimate store of value and hedge against inflation. Gold has been a trusted asset for millennia, offering stability in times of economic uncertainty.",
    icon: <Gem size={20} />,
    color: "from-yellow-500 to-amber-600",
    bgGradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20",
    isGold: true,
    isTrending: true,
    historicalData: getFixedHistoricalData(2345.67, 30),
    sector: "Precious Metals",
    yearHigh: 2450.00,
    yearLow: 1980.00,
  },
  // CRYPTOCURRENCIES
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    type: "crypto",
    price: 67234.89,
    change: -1234.56,
    changePercent: -1.80,
    volume: "28.5B",
    marketCap: "$1.32T",
    description: "The world's leading cryptocurrency. Bitcoin offers decentralized digital gold with limited supply and global accessibility.",
    icon: <Bitcoin size={20} />,
    color: "from-orange-400 to-amber-500",
    bgGradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
    isTrending: false,
    historicalData: getFixedHistoricalData(67234.89, 30),
    sector: "Cryptocurrency",
    yearHigh: 73500.00,
    yearLow: 38500.00,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    type: "crypto",
    price: 3456.78,
    change: 89.12,
    changePercent: 2.65,
    volume: "15.2B",
    marketCap: "$415B",
    description: "Smart contract platform enabling decentralized applications and DeFi. Ethereum is the foundation of Web3 innovation.",
    icon: <Coins size={20} />,
    color: "from-purple-400 to-indigo-500",
    bgGradient: "from-purple-500/20 via-indigo-500/10 to-blue-500/20",
    isTrending: true,
    historicalData: getFixedHistoricalData(3456.78, 30),
    sector: "Cryptocurrency",
    yearHigh: 4100.00,
    yearLow: 2200.00,
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    type: "crypto",
    price: 145.67,
    change: 12.34,
    changePercent: 9.26,
    volume: "3.8B",
    marketCap: "$64.5B",
    description: "High-performance blockchain supporting decentralized apps and marketplaces. Solana offers lightning-fast transactions and low fees.",
    icon: <Zap size={20} />,
    color: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/20 via-pink-500/10 to-rose-500/20",
    isTrending: true,
    isNew: true,
    historicalData: getFixedHistoricalData(145.67, 30),
    sector: "Cryptocurrency",
    yearHigh: 200.00,
    yearLow: 80.00,
  },
  // ETFs
  {
    id: "sp500",
    name: "S&P 500",
    symbol: "SPX",
    type: "etf",
    price: 5234.56,
    change: 45.67,
    changePercent: 0.88,
    volume: "4.2B",
    marketCap: "$38.5T",
    description: "Broad market index tracking 500 leading US companies. The S&P 500 provides diversified exposure to the American economy.",
    icon: <BarChart3 size={20} />,
    color: "from-emerald-400 to-teal-500",
    bgGradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
    historicalData: getFixedHistoricalData(5234.56, 30),
    sector: "Index Funds",
    dividend: "1.45%",
    peRatio: 22.5,
    yearHigh: 5400.00,
    yearLow: 4100.00,
  },
  {
    id: "nasdaq",
    name: "NASDAQ-100",
    symbol: "NDX",
    type: "etf",
    price: 18234.12,
    change: -234.56,
    changePercent: -1.27,
    volume: "3.8B",
    marketCap: "$22.1T",
    description: "Tech-heavy index featuring the world's largest technology companies. NASDAQ-100 represents the future of innovation.",
    icon: <LineChart size={20} />,
    color: "from-blue-400 to-cyan-500",
    bgGradient: "from-blue-500/20 via-cyan-500/10 to-sky-500/20",
    historicalData: getFixedHistoricalData(18234.12, 30),
    sector: "Technology ETFs",
    dividend: "0.85%",
    peRatio: 28.3,
    yearHigh: 19000.00,
    yearLow: 14200.00,
  },
  {
    id: "vti",
    name: "Vanguard Total Stock",
    symbol: "VTI",
    type: "etf",
    price: 259.34,
    change: 3.45,
    changePercent: 1.35,
    volume: "6.7M",
    marketCap: "$1.4T",
    description: "Total US stock market ETF providing broad exposure to the entire US equity market. VTI offers diversified, low-cost index investing.",
    icon: <PieChart size={20} />,
    color: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-500/20 via-indigo-500/10 to-purple-500/20",
    historicalData: getFixedHistoricalData(259.34, 30),
    sector: "Index Funds",
    dividend: "1.65%",
    peRatio: 20.8,
    yearHigh: 270.00,
    yearLow: 210.00,
  },
  {
    id: "qqq",
    name: "Invesco QQQ",
    symbol: "QQQ",
    type: "etf",
    price: 445.78,
    change: 5.67,
    changePercent: 1.29,
    volume: "52.3M",
    marketCap: "$235B",
    description: "Nasdaq-100 index ETF tracking the performance of 100 largest non-financial companies listed on Nasdaq.",
    icon: <TrendingUp size={20} />,
    color: "from-blue-400 to-purple-500",
    bgGradient: "from-blue-500/20 via-purple-500/10 to-indigo-500/20",
    historicalData: getFixedHistoricalData(445.78, 30),
    sector: "Technology ETFs",
    dividend: "0.65%",
    peRatio: 25.1,
    yearHigh: 460.00,
    yearLow: 350.00,
  },
  // STOCKS
  {
    id: "apple",
    name: "Apple Inc.",
    symbol: "AAPL",
    type: "stock",
    price: 178.45,
    change: 2.34,
    changePercent: 1.33,
    volume: "55.2M",
    marketCap: "$2.78T",
    description: "Global technology leader known for innovative products and services. Apple continues to redefine consumer electronics.",
    icon: <TrendingUp size={20} />,
    color: "from-gray-400 to-gray-600",
    bgGradient: "from-gray-500/20 via-slate-500/10 to-zinc-500/20",
    historicalData: getFixedHistoricalData(178.45, 30),
    sector: "Technology",
    dividend: "0.55%",
    peRatio: 29.2,
    yearHigh: 195.00,
    yearLow: 145.00,
  },
  {
    id: "nvidia",
    name: "NVIDIA Corp",
    symbol: "NVDA",
    type: "stock",
    price: 845.23,
    change: 34.56,
    changePercent: 4.26,
    volume: "32.1M",
    marketCap: "$2.08T",
    description: "AI and graphics processing pioneer. NVIDIA powers the future of artificial intelligence and high-performance computing.",
    icon: <Zap size={20} />,
    color: "from-green-400 to-emerald-500",
    bgGradient: "from-green-500/20 via-emerald-500/10 to-teal-500/20",
    isTrending: true,
    historicalData: getFixedHistoricalData(845.23, 30),
    sector: "Technology",
    peRatio: 45.6,
    yearHigh: 950.00,
    yearLow: 400.00,
  },
  {
    id: "microsoft",
    name: "Microsoft Corp",
    symbol: "MSFT",
    type: "stock",
    price: 378.92,
    change: 5.67,
    changePercent: 1.52,
    volume: "28.4M",
    marketCap: "$2.82T",
    description: "Global technology company powering productivity, cloud computing, and AI solutions. Microsoft is a cornerstone of modern enterprise.",
    icon: <BarChart3 size={20} />,
    color: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-500/20 via-blue-600/10 to-cyan-500/20",
    historicalData: getFixedHistoricalData(378.92, 30),
    sector: "Technology",
    dividend: "0.92%",
    peRatio: 32.5,
    yearHigh: 400.00,
    yearLow: 310.00,
  },
  {
    id: "amazon",
    name: "Amazon.com",
    symbol: "AMZN",
    type: "stock",
    price: 184.45,
    change: -2.34,
    changePercent: -1.25,
    volume: "42.8M",
    marketCap: "$1.92T",
    description: "E-commerce and cloud computing giant. Amazon leads in online retail, AWS cloud services, and entertainment streaming.",
    icon: <ShoppingBag size={20} />,
    color: "from-orange-500 to-amber-600",
    bgGradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
    historicalData: getFixedHistoricalData(184.45, 30),
    sector: "Consumer Discretionary",
    peRatio: 48.2,
    yearHigh: 200.00,
    yearLow: 130.00,
  },
  {
    id: "google",
    name: "Alphabet Inc.",
    symbol: "GOOGL",
    type: "stock",
    price: 145.67,
    change: 1.23,
    changePercent: 0.85,
    volume: "22.3M",
    marketCap: "$1.82T",
    description: "Google's parent company, leading in search, advertising, cloud computing, and AI innovation. Alphabet shapes the digital economy.",
    icon: <Globe size={20} />,
    color: "from-blue-400 to-green-500",
    bgGradient: "from-blue-500/20 via-green-500/10 to-emerald-500/20",
    historicalData: getFixedHistoricalData(145.67, 30),
    sector: "Technology",
    dividend: "0.25%",
    peRatio: 25.8,
    yearHigh: 160.00,
    yearLow: 120.00,
  },
  {
    id: "tesla",
    name: "Tesla Inc.",
    symbol: "TSLA",
    type: "stock",
    price: 245.67,
    change: -8.90,
    changePercent: -3.50,
    volume: "78.5M",
    marketCap: "$785B",
    description: "Electric vehicle and clean energy pioneer. Tesla leads the automotive industry's transition to sustainable energy solutions.",
    icon: <Zap size={20} />,
    color: "from-red-400 to-orange-500",
    bgGradient: "from-red-500/20 via-orange-500/10 to-amber-500/20",
    historicalData: getFixedHistoricalData(245.67, 30),
    sector: "Automotive",
    peRatio: 72.4,
    yearHigh: 320.00,
    yearLow: 160.00,
  },
  {
    id: "silver",
    name: "Silver",
    symbol: "XAG",
    type: "commodity",
    price: 28.92,
    change: 1.23,
    changePercent: 4.44,
    volume: "1.1M",
    marketCap: "$1.8T",
    description: "Industrial and precious metal with dual utility. Silver is essential in electronics, solar panels, and jewelry.",
    icon: <DollarSign size={20} />,
    color: "from-gray-400 to-slate-500",
    bgGradient: "from-gray-500/20 via-slate-500/10 to-zinc-500/20",
    isTrending: true,
    historicalData: getFixedHistoricalData(28.92, 30),
    sector: "Precious Metals",
    yearHigh: 32.00,
    yearLow: 22.00,
  },
];

// Function to apply 4K HD colors to cards dynamically
const getCardColorClass = (asset: Asset, index: number): string => {
  const colorIndex = index % cardColors.length;
  const baseColor = cardColors[colorIndex];
  
  if (asset.isGold) {
    return "from-yellow-500 to-amber-600";
  }
  
  const colorMap: Record<string, string> = {
    "#FF6B6B": "from-red-400", "#EE5A24": "to-red-600",
    "#FF9F43": "from-orange-400", "#E67E22": "to-orange-600",
    "#FECA57": "from-yellow-400", "#F9CA24": "to-yellow-500",
    "#55E6C1": "from-emerald-300", "#1DD1A1": "to-emerald-500",
    "#48DBFB": "from-cyan-300", "#0ABDE3": "to-cyan-500",
    "#686DE0": "from-indigo-400", "#4834D4": "to-indigo-600",
    "#BE2EDD": "from-purple-400", "#8E44AD": "to-purple-600",
    "#FF6B81": "from-rose-300", "#E74C3C": "to-red-500",
    "#F8A5C2": "from-pink-300", "#F78FB3": "to-pink-400",
    "#7BED9F": "from-green-300", "#2ECC71": "to-green-500",
    "#70A1FF": "from-blue-300", "#1B9CFC": "to-blue-500",
    "#FD7272": "from-red-300", "#E84118": "to-red-500",
    "#A29BFE": "from-purple-300", "#6C5CE7": "to-purple-500",
  };
  
  const fromColor = colorMap[baseColor.from] || "from-blue-400";
  const toColor = colorMap[baseColor.to] || "to-blue-600";
  
  return `${fromColor} ${toColor}`;
};

// Function to get 4K HD background gradient
const getCardBgGradient = (asset: Asset, index: number): string => {
  const colorIndex = index % cardColors.length;
  const baseColor = cardColors[colorIndex];
  
  if (asset.isGold) {
    return "from-amber-500/20 via-yellow-500/10 to-orange-500/20";
  }
  
  const fromColor = baseColor.from;
  const toColor = baseColor.to;
  
  return `from-[${fromColor}]/20 via-[${fromColor}]/10 to-[${toColor}]/20`;
};

// Helper to get color for a transaction based on merchant text
const getTransactionColor = (merchant: string): string => {
  const lower = merchant.toLowerCase();
  if (lower.includes("gold")) return "from-yellow-500 to-amber-600";
  if (lower.includes("bitcoin")) return "from-orange-400 to-amber-500";
  if (lower.includes("ethereum")) return "from-purple-400 to-indigo-500";
  if (lower.includes("solana")) return "from-purple-500 to-pink-500";
  if (lower.includes("sp500") || lower.includes("s&p")) return "from-emerald-400 to-teal-500";
  if (lower.includes("nasdaq")) return "from-blue-400 to-cyan-500";
  if (lower.includes("vti")) return "from-blue-500 to-indigo-500";
  if (lower.includes("qqq")) return "from-blue-400 to-purple-500";
  if (lower.includes("apple")) return "from-gray-400 to-gray-600";
  if (lower.includes("nvidia")) return "from-green-400 to-emerald-500";
  if (lower.includes("microsoft")) return "from-blue-500 to-blue-600";
  if (lower.includes("amazon")) return "from-orange-500 to-amber-600";
  if (lower.includes("google")) return "from-blue-400 to-green-500";
  if (lower.includes("tesla")) return "from-red-400 to-orange-500";
  if (lower.includes("silver")) return "from-gray-400 to-slate-500";
  return "from-cyan-400 to-blue-500"; // default
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      delay: delay * 0.06, 
      duration: 0.4, 
      ease: "easeOut" as const 
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const expandedVariants: Variants = {
  collapsed: { 
    height: 0, 
    opacity: 0, 
    transition: { duration: 0.3, ease: "easeInOut" as const }
  },
  expanded: { 
    height: "auto", 
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const }
  },
};

const pricePulseVariants: Variants = {
  up: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  down: {
    scale: [1, 0.95, 1],
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ============================================================================
// LOADING SKELETON COMPONENT (Lazy Loading Fallback)
// ============================================================================

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      </div>
    </div>
  </div>
);

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

// ---- MiniChart ------------------------------------------------------------

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = useMemo(() => {
    return data.map((val, i) => 
      `${(i / (data.length - 1)) * 120},${40 - ((val - min) / range) * 35}`
    ).join(" ");
  }, [data, min, range]);

  const polygonPoints = useMemo(() => {
    return points + `, 120,40, 0,40`;
  }, [points]);

  const gradientId = `gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg 
      width="120" 
      height="40" 
      viewBox="0 0 120 40" 
      className="overflow-visible"
      suppressHydrationWarning
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className={`text-${color}`}
      />
      <polygon
        points={polygonPoints}
        fill={`url(#${gradientId})`}
        opacity="0.2"
      />
    </svg>
  );
}

// ---- AssetCard ------------------------------------------------------------

function AssetCard({ 
  asset, 
  index, 
  isExpanded, 
  isInWatchlist,
  onToggle,
  onInvest,
  onWatchlistToggle,
  priceDirection,
}: { 
  asset: Asset; 
  index: number;
  isExpanded: boolean;
  isInWatchlist: boolean;
  onToggle: () => void;
  onInvest: (asset: Asset) => void;
  onWatchlistToggle: (assetId: string) => void;
  priceDirection: "up" | "down" | null;
}) {
  const isPositive = asset.change >= 0;
  const colorClass = getCardColorClass(asset, index);
  const bgGradient = getCardBgGradient(asset, index);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={`relative rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
        asset.isGold 
          ? `bg-gradient-to-br ${colorClass} ring-2 ring-amber-500/40` 
          : asset.isTrending
          ? `bg-gradient-to-br ${colorClass} ring-1 ring-emerald-500/30`
          : `bg-gradient-to-br ${colorClass}`
      } ${isExpanded ? "col-span-full" : ""}`}
      suppressHydrationWarning
    >
      {/* Decorative glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${bgGradient} opacity-20 pointer-events-none`}></div>
      
      {/* Badges */}
      <div className="absolute -top-2 right-2 z-10 flex gap-1">
        {asset.isGold && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 text-[10px] font-bold text-cyan-900 shadow-lg"
          >
            ⭐ GOLD
          </motion.div>
        )}
        {asset.isTrending && !asset.isGold && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-2.5 py-0.5 text-[10px] font-bold text-cyan-900 shadow-lg"
          >
            🔥 TRENDING
          </motion.div>
        )}
        {asset.isNew && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-gradient-to-r from-purple-400 to-pink-500 px-2.5 py-0.5 text-[10px] font-bold text-cyan-900 shadow-lg"
          >
            NEW
          </motion.div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 cursor-pointer relative z-10" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/40 backdrop-blur-sm text-cyan-900 shadow-xl`}>
              {asset.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-cyan-900 drop-shadow-sm">
                  {asset.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWatchlistToggle(asset.id);
                  }}
                  className="text-cyan-900/60 hover:text-cyan-900 transition-colors"
                >
                  <Star 
                    size={14} 
                    className={isInWatchlist ? "fill-cyan-900 text-cyan-900" : ""}
                  />
                </button>
              </div>
              <p className="text-xs font-bold text-cyan-900/80">{asset.symbol}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <motion.p 
                animate={priceDirection ? "up" : undefined}
                variants={pricePulseVariants}
                className={`text-sm font-extrabold text-cyan-900 drop-shadow-sm`}
                suppressHydrationWarning
              >
                ${asset.price.toFixed(2)}
              </motion.p>
              <div className={`flex items-center justify-end gap-1 text-xs font-bold ${
                isPositive ? "text-emerald-700" : "text-red-700"
              }`}>
                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span suppressHydrationWarning>{Math.abs(asset.changePercent).toFixed(2)}%</span>
              </div>
            </div>
            <ChevronRight 
              size={18} 
              className={`text-cyan-900/60 transition-transform duration-300 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </div>
        </div>

        {/* Mini Chart */}
        {asset.historicalData && (
          <div className="mt-2 opacity-60 hover:opacity-100 transition-opacity">
            <MiniChart 
              data={asset.historicalData} 
              color={isPositive ? "emerald-700" : "red-700"}
            />
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={expandedVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden relative z-10"
          >
            <div className="border-t border-white/30 p-4 space-y-4">
              {/* Description */}
              <p className="text-sm font-bold text-cyan-900 leading-relaxed drop-shadow-sm">
                {asset.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <div className="rounded-lg bg-white/30 backdrop-blur-sm p-3 shadow-lg border border-white/20">
                  <p className="text-[10px] font-extrabold text-cyan-900/70 uppercase tracking-wider">Price</p>
                  <p className="text-lg font-extrabold text-cyan-900 drop-shadow-sm" suppressHydrationWarning>
                    ${asset.price.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-white/30 backdrop-blur-sm p-3 shadow-lg border border-white/20">
                  <p className="text-[10px] font-extrabold text-cyan-900/70 uppercase tracking-wider">24h Change</p>
                  <p className={`text-lg font-extrabold ${isPositive ? "text-emerald-700" : "text-red-700"} drop-shadow-sm`} suppressHydrationWarning>
                    {isPositive ? "+" : ""}{asset.change.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-white/30 backdrop-blur-sm p-3 shadow-lg border border-white/20">
                  <p className="text-[10px] font-extrabold text-cyan-900/70 uppercase tracking-wider">Volume</p>
                  <p className="text-lg font-extrabold text-cyan-900 drop-shadow-sm">{asset.volume}</p>
                </div>
                {asset.marketCap && (
                  <div className="rounded-lg bg-white/30 backdrop-blur-sm p-3 shadow-lg border border-white/20">
                    <p className="text-[10px] font-extrabold text-cyan-900/70 uppercase tracking-wider">Market Cap</p>
                    <p className="text-lg font-extrabold text-cyan-900 drop-shadow-sm">{asset.marketCap}</p>
                  </div>
                )}
                {asset.sector && (
                  <div className="rounded-lg bg-white/30 backdrop-blur-sm p-3 shadow-lg border border-white/20">
                    <p className="text-[10px] font-extrabold text-cyan-900/70 uppercase tracking-wider">Sector</p>
                    <p className="text-sm font-extrabold text-cyan-900 drop-shadow-sm">{asset.sector}</p>
                  </div>
                )}
                {asset.peRatio && (
                  <div className="rounded-lg bg-white/30 backdrop-blur-sm p-3 shadow-lg border border-white/20">
                    <p className="text-[10px] font-extrabold text-cyan-900/70 uppercase tracking-wider">P/E Ratio</p>
                    <p className="text-lg font-extrabold text-cyan-900 drop-shadow-sm">{asset.peRatio}</p>
                  </div>
                )}
                {asset.dividend && (
                  <div className="rounded-lg bg-white/30 backdrop-blur-sm p-3 shadow-lg border border-white/20">
                    <p className="text-[10px] font-extrabold text-cyan-900/70 uppercase tracking-wider">Dividend Yield</p>
                    <p className="text-lg font-extrabold text-emerald-700 drop-shadow-sm">{asset.dividend}</p>
                  </div>
                )}
                {asset.yearHigh && (
                  <div className="rounded-lg bg-white/30 backdrop-blur-sm p-3 shadow-lg border border-white/20">
                    <p className="text-[10px] font-extrabold text-cyan-900/70 uppercase tracking-wider">52W Range</p>
                    <p className="text-sm font-extrabold text-cyan-900 drop-shadow-sm">
                      ${asset.yearLow} - ${asset.yearHigh}
                    </p>
                  </div>
                )}
              </div>

              {/* Invest Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onInvest(asset)}
                className={`w-full rounded-xl py-3 font-extrabold text-cyan-900 shadow-lg transition-all relative overflow-hidden ${
                  asset.isGold 
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 shadow-amber-500/40 hover:shadow-amber-500/60" 
                    : "bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm hover:from-white/50 hover:to-white/30 border border-white/30"
                }`}
              >
                <span className="flex items-center justify-center gap-2 relative z-10">
                  Invest in {asset.symbol}
                  <ArrowUpRight size={18} />
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---- AssetFilterBar -------------------------------------------------------

function AssetFilterBar({ 
  activeFilter, 
  onFilterChange,
  activeSort,
  onSortChange,
}: { 
  activeFilter: string; 
  onFilterChange: (filter: string) => void;
  activeSort: string;
  onSortChange: (sort: string) => void;
}) {
  const filters = [
    { id: "all", label: "All Assets" },
    { id: "commodity", label: "Commodities" },
    { id: "crypto", label: "Crypto" },
    { id: "etf", label: "ETFs" },
    { id: "stock", label: "Stocks" },
  ];

  const sortOptions = [
    { id: "default", label: "Default" },
    { id: "price-high", label: "Price: High-Low" },
    { id: "price-low", label: "Price: Low-High" },
    { id: "gainers", label: "Top Gainers" },
    { id: "losers", label: "Top Losers" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onFilterChange(filter.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-xl ${
              activeFilter === filter.id
                ? "bg-gradient-to-r from-cyan-700 to-cyan-900 text-white shadow-lg shadow-cyan-900/30"
                : "bg-white/40 text-cyan-900 hover:bg-white/60 backdrop-blur-sm border border-white/30"
            }`}
          >
            {filter.label}
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <SlidersHorizontal size={14} className="text-cyan-900/70" />
        <select
          value={activeSort}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSortChange(e.target.value)}
          className="bg-[#C4F8FD] rounded-md px-3 py-1.5 text-xs font-extrabold text-cyan-900 focus:outline-none shadow-xl border-none"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id} className="bg-[#C4F8FD] text-cyan-900 border-none">
              {option.label}
            </option>
          ))}
        </select>
      </motion.div>
    </div>
  );
}

// ---- MarketStats ---------------------------------------------------------

function MarketStats() {
  const stats: Array<{
    label: string;
    value: string;
    icon: React.ReactNode;
    positive?: boolean;
  }> = [
    { label: "Assets Available", value: "15+", icon: <BarChart3 size={16} /> },
    { label: "24h Trading Volume", value: "$87.4B", icon: <Activity size={16} /> },
    { label: "Active Investors", value: "2,847", icon: <Users size={16} /> },
    { label: "Top Gainers", value: "+12.4%", icon: <TrendingUp size={16} />, positive: true },
  ];

  const statColors = [
    "from-red-400 to-red-600",
    "from-orange-400 to-orange-600",
    "from-yellow-400 to-yellow-500",
    "from-emerald-400 to-emerald-600",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className={`rounded-xl bg-gradient-to-br ${statColors[index]} p-3 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}
          suppressHydrationWarning
        >
          <div className="flex items-center gap-2 text-cyan-900/90">
            <div className="shadow-xl">{stat.icon}</div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider">{stat.label}</p>
          </div>
          <p className={`text-lg font-extrabold text-cyan-900 drop-shadow-sm`}>
            {stat.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ---- TransactionCard (new) ------------------------------------------------

function TransactionCard({ transaction }: { transaction: Transaction }) {
  const colorClass = getTransactionColor(transaction.merchant);
  const isPositive = transaction.isNegative === false; // income? but we'll treat as neutral
  const statusColor = transaction.status === "completed" ? "text-emerald-600" : 
                      transaction.status === "failed" ? "text-red-600" : "text-amber-600";

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
      className={`flex-shrink-0 w-56 rounded-2xl bg-gradient-to-br ${colorClass} p-4 shadow-xl border border-white/30 backdrop-blur-sm transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-cyan-900/70 uppercase tracking-wider">{transaction.merchant}</p>
          <p className="text-lg font-extrabold text-cyan-900">${transaction.amount}</p>
        </div>
        <span className={`text-xs font-bold ${statusColor}`}>
          {transaction.status}
        </span>
      </div>
      <p className="text-xs text-cyan-900/60 mt-1">{new Date(transaction.date).toLocaleDateString()}</p>
    </motion.div>
  );
}

// ============================================================================
// FULLSCREEN INVESTMENT DASHBOARD - MAIN COMPONENT
// ============================================================================

export default function InvestmentPage() {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Investment state
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeSort, setActiveSort] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showInvestModal, setShowInvestModal] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [priceDirections, setPriceDirections] = useState<Record<string, "up" | "down" | null>>({});

  // ---- Payment Modal State ----
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "processing" | "success" | "error" | "insufficient">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [pendingAmount, setPendingAmount] = useState<number>(0);

  // ---- New: Recent Transactions ----
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const isMounted = useRef(true);
  const dataLoaded = useRef(false);

  // Mark as client-side after mount with lazy loading
  useEffect(() => {
    isMounted.current = true;
    setIsClient(true);
    
    const loadData = async () => {
      if (!dataLoaded.current) {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (isMounted.current) {
          setLoading(false);
          dataLoaded.current = true;
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Real-time price updates for ALL assets
  useEffect(() => {
    if (!isClient || loading) return;

    const interval = setInterval(() => {
      setAssets((prevAssets: Asset[]) => {
        const updatedAssets = prevAssets.map((asset: Asset) => {
          const volatility = asset.type === "crypto" ? 0.008 : 
                            asset.type === "stock" ? 0.005 : 
                            asset.type === "etf" ? 0.003 : 0.004;
          
          const change = (Math.random() - 0.5) * asset.price * volatility;
          const newPrice = Math.max(asset.price + change, asset.price * 0.85);
          
          const direction = newPrice > asset.price ? "up" : "down";
          setPriceDirections((prev: Record<string, "up" | "down" | null>) => ({
            ...prev,
            [asset.id]: direction
          }));
          
          setTimeout(() => {
            setPriceDirections((prev: Record<string, "up" | "down" | null>) => ({
              ...prev,
              [asset.id]: null
            }));
          }, 500);
          
          const newChange = newPrice - asset.price;
          const newChangePercent = (newChange / asset.price) * 100;
          
          return {
            ...asset,
            price: newPrice,
            change: asset.change + newChange,
            changePercent: asset.changePercent + newChangePercent,
          };
        });
        
        return updatedAssets;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isClient, loading]);

  // ---- Fetch Dashboard Data (including transactions) ----
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data;
        // Update balance
        const amount = parseFloat(data.totalBalance?.amount) || 0;
        setBalance(amount);
        // Update transactions
        if (data.recentTransactions) {
          setRecentTransactions(data.recentTransactions);
        }
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      return null;
    }
  };

  // ---- Fetch Balance (used in modal) ----
  const fetchBalance = async () => {
    const data = await fetchDashboardData();
    if (data) {
      const amount = parseFloat(data.totalBalance?.amount) || 0;
      setBalance(amount);
      return amount;
    }
    return 0;
  };

  // ---- Open Invest Modal ----
  const handleInvest = useCallback(async (asset: Asset) => {
    setSelectedAsset(asset);
    setInvestmentAmount("");
    setTransactionStatus("idle");
    setErrorMessage("");
    setPendingAmount(0);
    await fetchBalance();
    setShowInvestModal(true);
  }, []);

  // ---- Close Modal ----
  const closeModal = () => {
    setShowInvestModal(false);
    setSelectedAsset(null);
    setInvestmentAmount("");
    setTransactionStatus("idle");
    setErrorMessage("");
    setPendingAmount(0);
  };

  // ---- Confirm Investment ----
  // ---- Confirm Investment (Actually saves to backend) ----
  const handleConfirmInvestment = async () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    if (amount > balance) {
      setTransactionStatus("insufficient");
      return;
    }

    setPendingAmount(amount);
    setTransactionStatus("processing");
    setErrorMessage("");

    try {
      // 🟢 THE MISSING PIECE: Actually save the investment to the database!
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/user/dashboard/invest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assetId: selectedAsset?.id,
          amount: amount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "purchase failed");
      }

      // If the backend accepts it, refetch the dashboard to get the updated balance
      const newData = await fetchDashboardData();
      if (newData) {
        const newBalance = parseFloat(newData.totalBalance?.amount) || 0;
        setBalance(newBalance);
        
        // 🟢 Since the API call succeeded, we immediately show success!
        setTransactionStatus("success");
        if (newData.recentTransactions) setRecentTransactions(newData.recentTransactions);
      }
      
    } catch (error) {
      console.error("error:", error);
      setTransactionStatus("error");
      setErrorMessage("Transaction failed. Please contact Support.");
    }
  };

  // ---- Refresh Status (manual refresh during processing) ----
  const handleRefreshStatus = async () => {
    if (transactionStatus !== "processing") return;
    const newData = await fetchDashboardData();
    if (newData) {
      const newBalance = parseFloat(newData.totalBalance?.amount) || 0;
      if (newBalance >= balance + pendingAmount) {
        setTransactionStatus("success");
        setErrorMessage("");
        if (newData.recentTransactions) {
          setRecentTransactions(newData.recentTransactions);
        }
      } else {
        setErrorMessage("Still pending. Please wait or try again later.");
      }
    }
  };

  // ---- Other Handlers ----
  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev: string | null) => (prev === id ? null : id));
  }, []);

  const handleWatchlistToggle = useCallback((assetId: string) => {
    setWatchlist((prev: string[]) =>
      prev.includes(assetId)
        ? prev.filter((id: string) => id !== assetId)
        : [...prev, assetId]
    );
  }, []);

  const filteredAndSortedAssets = useMemo(() => {
    let result = assets.filter((asset: Asset) => {
      const matchesFilter = activeFilter === "all" || asset.type === activeFilter;
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    switch (activeSort) {
      case "price-high":
        result = [...result].sort((a: Asset, b: Asset) => b.price - a.price);
        break;
      case "price-low":
        result = [...result].sort((a: Asset, b: Asset) => a.price - b.price);
        break;
      case "gainers":
        result = [...result].sort((a: Asset, b: Asset) => b.changePercent - a.changePercent);
        break;
      case "losers":
        result = [...result].sort((a: Asset, b: Asset) => a.changePercent - b.changePercent);
        break;
      default:
        result = [...result].sort((a: Asset, b: Asset) => {
          if (a.isGold) return -1;
          if (b.isGold) return 1;
          return b.price - a.price;
        });
    }

    return result;
  }, [assets, activeFilter, activeSort, searchQuery]);

  // Show loading skeleton while loading
  if (loading || !isClient) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl"
      >
        {/* Market Stats */}
        <MarketStats />

        {/* Search & Filter */}
        <div className="mb-6 mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-cyan-900/20 bg-[#C4F8FD] px-4 py-2.5 pl-10 text-sm font-bold text-cyan-900 placeholder:text-cyan-900/50 focus:border-cyan-900/50 focus:outline-none focus:ring-1 focus:ring-cyan-900/30 shadow-xl"
              suppressHydrationWarning
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-900/50 shadow-xl" />
          </div>
          <AssetFilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            activeSort={activeSort}
            onSortChange={setActiveSort}
          />
        </div>

        {/* ---- Recent Transactions Cards ---- */}
        {recentTransactions.length > 0 && (
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex gap-4">
              {recentTransactions.map((tx) => (
                <TransactionCard key={tx.id} transaction={tx} />
              ))}
            </div>
          </div>
        )}

        {/* Asset Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 bg-[#C4F8FD] shadow-xl gap-4 md:grid-cols-2"
        >
          {filteredAndSortedAssets.map((asset: Asset, index: number) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              index={index}
              isExpanded={expandedId === asset.id}
              isInWatchlist={watchlist.includes(asset.id)}
              onToggle={() => handleToggle(asset.id)}
              onInvest={handleInvest}
              onWatchlistToggle={handleWatchlistToggle}
              priceDirection={priceDirections[asset.id] || null}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredAndSortedAssets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="rounded-full bg-white/50 p-4 shadow-xl">
              <Search size={32} className="text-cyan-900/50" />
            </div>
            <p className="mt-4 text-sm font-bold text-cyan-900/70">
              No assets found matching your criteria
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* =========================================================== */}
      {/* INVEST MODAL with balance checking and refresh */}

      {/* =========================================================== */}
      <AnimatePresence>
        {showInvestModal && selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl bg-[#C4F8FD] shadow-2xl border-none overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-xl font-bold text-slate-700">
                  Invest in {selectedAsset.name}
                </h2>
                <button
                  onClick={closeModal}
                  className="rounded-lg p-1 hover:bg-white/20 transition-colors"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {transactionStatus === "insufficient" ? (
                  // Insufficient Balance Error
                  <div className="text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-700">Insufficient Balance</h3>
                    <p className="text-sm text-slate-600 mt-2">
                      Your current balance is{" "}
                      <span className="font-bold text-slate-800">${balance.toFixed(2)}</span>.
                      Please top up your balance and try again.
                    </p>
                    <button
                      onClick={() => {
                        setTransactionStatus("idle");
                        setErrorMessage("");
                      }}
                      className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                ) : transactionStatus === "processing" ? (
                  // Processing state with Refresh button
                  <div className="text-center py-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-lg font-bold text-slate-700">
                      Transaction in Progress
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">
                      Transaction processing, please wait.
                    </p>
                    {errorMessage && (
                      <p className="text-sm text-amber-600 mt-2">{errorMessage}</p>
                    )}
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button
                        onClick={closeModal}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleRefreshStatus}
                        className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw size={16} />
                        Refresh
                      </button>
                    </div>
                  </div>
                ) : transactionStatus === "success" ? (
                  // Success state
                  <div className="text-center py-6">
                    <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-emerald-700">
                      Investment Successful!
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">
                      Your investment has been confirmed. Your balance has been updated.
                    </p>
                    <button
                      onClick={closeModal}
                      className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : transactionStatus === "error" ? (
                  // Error state
                  <div className="text-center py-6">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-700">Transaction Failed</h3>
                    <p className="text-sm text-slate-600 mt-2">
                      {errorMessage || "Something went wrong. Please try again."}
                    </p>
                    <button
                      onClick={() => {
                        setTransactionStatus("idle");
                        setErrorMessage("");
                      }}
                      className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  // Payment Form (idle state)
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Asset</p>
                          <p className="text-lg font-bold text-slate-700">
                            {selectedAsset.name} ({selectedAsset.symbol})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Price</p>
                          <p className="text-lg font-bold text-slate-700">
                            ${selectedAsset.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-600 block mb-1">
                        Amount (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="w-full rounded-lg border-none shadow-inner bg-white/50 px-4 py-3 text-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Available balance:{" "}
                        <span className="font-bold text-slate-700">
                          ${balance.toFixed(2)}
                        </span>
                      </p>
                    </div>

                    {/* Quick amount buttons */}
                    <div className="flex gap-2 flex-wrap mb-6">
                      {[10, 25, 50, 100, 500].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setInvestmentAmount(amount.toString())}
                          className="flex-1 min-w-[60px] rounded-lg bg-white/30 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white/50 transition-colors border-none shadow-sm"
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>

                    {errorMessage && (
                      <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmInvestment}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Send size={18} />
                        confirm
                      </span>
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}





































































































// // app/Investment/page.tsx
// "use client";

// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { motion, AnimatePresence, Variants } from "framer-motion";
// import { Search } from "lucide-react";
// import {
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   Bitcoin,
//   ArrowUpRight,
//   ArrowDownRight,
//   X,
//   ChevronRight,
//   Globe,
//   Zap,
//   BarChart3,
//   Coins,
//   Gem,
//   LineChart,
//   PieChart,
//   Wallet,
//   Send,
//   Star,
//   Activity,
//   SlidersHorizontal,
//   Users,
//   ShoppingBag,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
//   RefreshCw,
// } from "lucide-react";

// // ============================================================================
// // TYPES
// // ============================================================================

// interface Asset {
//   id: string;
//   name: string;
//   symbol: string;
//   type: "crypto" | "stock" | "etf" | "commodity";
//   price: number;
//   change: number;
//   changePercent: number;
//   volume: string;
//   marketCap?: string;
//   description: string;
//   icon: React.ReactNode;
//   color: string;
//   bgGradient: string;
//   isGold?: boolean;
//   isTrending?: boolean;
//   isNew?: boolean;
//   historicalData?: number[];
//   sector?: string;
//   dividend?: string;
//   peRatio?: number;
//   yearHigh?: number;
//   yearLow?: number;
// }

// interface Transaction {
//   id: string;
//   merchant: string;
//   type: string;
//   category: string;
//   date: string;
//   status: "completed" | "pending" | "failed";
//   amount: string;
//   isNegative: boolean;
// }

// // ============================================================================
// // DATA - FIXED
// // ============================================================================

// const getFixedHistoricalData = (basePrice: number, points: number = 20): number[] => {
//   const data: number[] = [];
//   let price = basePrice;
//   for (let i = 0; i < points; i++) {
//     const variation = Math.sin(i * 0.5 + basePrice) * basePrice * 0.02;
//     price = Math.max(price + variation, basePrice * 0.7);
//     data.push(price);
//   }
//   return data;
// };

// const cardColors = [
//   { from: "#FF6B6B", to: "#EE5A24" },     { from: "#FF9F43", to: "#E67E22" },
//   { from: "#FECA57", to: "#F9CA24" },     { from: "#55E6C1", to: "#1DD1A1" },
//   { from: "#48DBFB", to: "#0ABDE3" },     { from: "#686DE0", to: "#4834D4" },
//   { from: "#BE2EDD", to: "#8E44AD" },     { from: "#FF6B81", to: "#E74C3C" },
//   { from: "#F8A5C2", to: "#F78FB3" },     { from: "#7BED9F", to: "#2ECC71" },
//   { from: "#70A1FF", to: "#1B9CFC" },     { from: "#FD7272", to: "#E84118" },
//   { from: "#A29BFE", to: "#6C5CE7" },
// ];

// const initialAssets: Asset[] = [
//   // Gold, Crypto, ETFs, Stocks (Your original asset array remains exactly as it is)
//   {
//     id: "gold", name: "Gold", symbol: "XAU", type: "commodity", price: 2345.67, change: 28.45, changePercent: 1.23,
//     volume: "2.4M", marketCap: "$13.2T", description: "Physical gold bullion - The ultimate store of value.",
//     icon: <Gem size={20} />, color: "from-yellow-500 to-amber-600", bgGradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20",
//     isGold: true, isTrending: true, historicalData: getFixedHistoricalData(2345.67, 30), sector: "Precious Metals", yearHigh: 2450.00, yearLow: 1980.00,
//   },
//   {
//     id: "bitcoin", name: "Bitcoin", symbol: "BTC", type: "crypto", price: 67234.89, change: -1234.56, changePercent: -1.80,
//     volume: "28.5B", marketCap: "$1.32T", description: "The world's leading cryptocurrency.",
//     icon: <Bitcoin size={20} />, color: "from-orange-400 to-amber-500", bgGradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
//     historicalData: getFixedHistoricalData(67234.89, 30), sector: "Cryptocurrency", yearHigh: 73500.00, yearLow: 38500.00,
//   },
//   {
//     id: "ethereum", name: "Ethereum", symbol: "ETH", type: "crypto", price: 3456.78, change: 89.12, changePercent: 2.65,
//     volume: "15.2B", marketCap: "$415B", description: "Smart contract platform enabling decentralized applications.",
//     icon: <Coins size={20} />, color: "from-purple-400 to-indigo-500", bgGradient: "from-purple-500/20 via-indigo-500/10 to-blue-500/20",
//     isTrending: true, historicalData: getFixedHistoricalData(3456.78, 30), sector: "Cryptocurrency", yearHigh: 4100.00, yearLow: 2200.00,
//   },
//   {
//     id: "solana", name: "Solana", symbol: "SOL", type: "crypto", price: 145.67, change: 12.34, changePercent: 9.26,
//     volume: "3.8B", marketCap: "$64.5B", description: "High-performance blockchain supporting decentralized apps.",
//     icon: <Zap size={20} />, color: "from-purple-500 to-pink-500", bgGradient: "from-purple-500/20 via-pink-500/10 to-rose-500/20",
//     isTrending: true, isNew: true, historicalData: getFixedHistoricalData(145.67, 30), sector: "Cryptocurrency", yearHigh: 200.00, yearLow: 80.00,
//   },
//   {
//     id: "sp500", name: "S&P 500", symbol: "SPX", type: "etf", price: 5234.56, change: 45.67, changePercent: 0.88,
//     volume: "4.2B", marketCap: "$38.5T", description: "Broad market index tracking 500 leading US companies.",
//     icon: <BarChart3 size={20} />, color: "from-emerald-400 to-teal-500", bgGradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
//     historicalData: getFixedHistoricalData(5234.56, 30), sector: "Index Funds", dividend: "1.45%", peRatio: 22.5, yearHigh: 5400.00, yearLow: 4100.00,
//   },
//   {
//     id: "nasdaq", name: "NASDAQ-100", symbol: "NDX", type: "etf", price: 18234.12, change: -234.56, changePercent: -1.27,
//     volume: "3.8B", marketCap: "$22.1T", description: "Tech-heavy index featuring the world's largest technology companies.",
//     icon: <LineChart size={20} />, color: "from-blue-400 to-cyan-500", bgGradient: "from-blue-500/20 via-cyan-500/10 to-sky-500/20",
//     historicalData: getFixedHistoricalData(18234.12, 30), sector: "Technology ETFs", dividend: "0.85%", peRatio: 28.3, yearHigh: 19000.00, yearLow: 14200.00,
//   },
//   {
//     id: "vti", name: "Vanguard Total Stock", symbol: "VTI", type: "etf", price: 259.34, change: 3.45, changePercent: 1.35,
//     volume: "6.7M", marketCap: "$1.4T", description: "Total US stock market ETF providing broad exposure.",
//     icon: <PieChart size={20} />, color: "from-blue-500 to-indigo-500", bgGradient: "from-blue-500/20 via-indigo-500/10 to-purple-500/20",
//     historicalData: getFixedHistoricalData(259.34, 30), sector: "Index Funds", dividend: "1.65%", peRatio: 20.8, yearHigh: 270.00, yearLow: 210.00,
//   },
//   {
//     id: "qqq", name: "Invesco QQQ", symbol: "QQQ", type: "etf", price: 445.78, change: 5.67, changePercent: 1.29,
//     volume: "52.3M", marketCap: "$235B", description: "Nasdaq-100 index ETF tracking the performance of 100 largest companies.",
//     icon: <TrendingUp size={20} />, color: "from-blue-400 to-purple-500", bgGradient: "from-blue-500/20 via-purple-500/10 to-indigo-500/20",
//     historicalData: getFixedHistoricalData(445.78, 30), sector: "Technology ETFs", dividend: "0.65%", peRatio: 25.1, yearHigh: 460.00, yearLow: 350.00,
//   },
//   {
//     id: "apple", name: "Apple Inc.", symbol: "AAPL", type: "stock", price: 178.45, change: 2.34, changePercent: 1.33,
//     volume: "55.2M", marketCap: "$2.78T", description: "Global technology leader known for innovative products.",
//     icon: <TrendingUp size={20} />, color: "from-gray-400 to-gray-600", bgGradient: "from-gray-500/20 via-slate-500/10 to-zinc-500/20",
//     historicalData: getFixedHistoricalData(178.45, 30), sector: "Technology", dividend: "0.55%", peRatio: 29.2, yearHigh: 195.00, yearLow: 145.00,
//   },
//   {
//     id: "nvidia", name: "NVIDIA Corp", symbol: "NVDA", type: "stock", price: 845.23, change: 34.56, changePercent: 4.26,
//     volume: "32.1M", marketCap: "$2.08T", description: "AI and graphics processing pioneer.",
//     icon: <Zap size={20} />, color: "from-green-400 to-emerald-500", bgGradient: "from-green-500/20 via-emerald-500/10 to-teal-500/20",
//     isTrending: true, historicalData: getFixedHistoricalData(845.23, 30), sector: "Technology", peRatio: 45.6, yearHigh: 950.00, yearLow: 400.00,
//   },
//   {
//     id: "microsoft", name: "Microsoft Corp", symbol: "MSFT", type: "stock", price: 378.92, change: 5.67, changePercent: 1.52,
//     volume: "28.4M", marketCap: "$2.82T", description: "Global technology company powering productivity.",
//     icon: <BarChart3 size={20} />, color: "from-blue-500 to-blue-600", bgGradient: "from-blue-500/20 via-blue-600/10 to-cyan-500/20",
//     historicalData: getFixedHistoricalData(378.92, 30), sector: "Technology", dividend: "0.92%", peRatio: 32.5, yearHigh: 400.00, yearLow: 310.00,
//   },
//   {
//     id: "amazon", name: "Amazon.com", symbol: "AMZN", type: "stock", price: 184.45, change: -2.34, changePercent: -1.25,
//     volume: "42.8M", marketCap: "$1.92T", description: "E-commerce and cloud computing giant.",
//     icon: <ShoppingBag size={20} />, color: "from-orange-500 to-amber-600", bgGradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
//     historicalData: getFixedHistoricalData(184.45, 30), sector: "Consumer Discretionary", peRatio: 48.2, yearHigh: 200.00, yearLow: 130.00,
//   },
//   {
//     id: "google", name: "Alphabet Inc.", symbol: "GOOGL", type: "stock", price: 145.67, change: 1.23, changePercent: 0.85,
//     volume: "22.3M", marketCap: "$1.82T", description: "Google's parent company, leading in search and AI.",
//     icon: <Globe size={20} />, color: "from-blue-400 to-green-500", bgGradient: "from-blue-500/20 via-green-500/10 to-emerald-500/20",
//     historicalData: getFixedHistoricalData(145.67, 30), sector: "Technology", dividend: "0.25%", peRatio: 25.8, yearHigh: 160.00, yearLow: 120.00,
//   },
//   {
//     id: "tesla", name: "Tesla Inc.", symbol: "TSLA", type: "stock", price: 245.67, change: -8.90, changePercent: -3.50,
//     volume: "78.5M", marketCap: "$785B", description: "Electric vehicle and clean energy pioneer.",
//     icon: <Zap size={20} />, color: "from-red-400 to-orange-500", bgGradient: "from-red-500/20 via-orange-500/10 to-amber-500/20",
//     historicalData: getFixedHistoricalData(245.67, 30), sector: "Automotive", peRatio: 72.4, yearHigh: 320.00, yearLow: 160.00,
//   },
//   {
//     id: "silver", name: "Silver", symbol: "XAG", type: "commodity", price: 28.92, change: 1.23, changePercent: 4.44,
//     volume: "1.1M", marketCap: "$1.8T", description: "Industrial and precious metal with dual utility.",
//     icon: <DollarSign size={20} />, color: "from-gray-400 to-slate-500", bgGradient: "from-gray-500/20 via-slate-500/10 to-zinc-500/20",
//     isTrending: true, historicalData: getFixedHistoricalData(28.92, 30), sector: "Precious Metals", yearHigh: 32.00, yearLow: 22.00,
//   },
// ];

// // Helper functions
// const getCardColorClass = (asset: Asset, index: number): string => {
//   const colorIndex = index % cardColors.length;
//   const baseColor = cardColors[colorIndex];
//   if (asset.isGold) return "from-yellow-500 to-amber-600";
//   const colorMap: Record<string, string> = {
//     "#FF6B6B": "from-red-400", "#EE5A24": "to-red-600",
//     "#FF9F43": "from-orange-400", "#E67E22": "to-orange-600",
//     "#FECA57": "from-yellow-400", "#F9CA24": "to-yellow-500",
//     "#55E6C1": "from-emerald-300", "#1DD1A1": "to-emerald-500",
//     "#48DBFB": "from-cyan-300", "#0ABDE3": "to-cyan-500",
//     "#686DE0": "from-indigo-400", "#4834D4": "to-indigo-600",
//     "#BE2EDD": "from-purple-400", "#8E44AD": "to-purple-600",
//     "#FF6B81": "from-rose-300", "#E74C3C": "to-red-500",
//     "#F8A5C2": "from-pink-300", "#F78FB3": "to-pink-400",
//     "#7BED9F": "from-green-300", "#2ECC71": "to-green-500",
//     "#70A1FF": "from-blue-300", "#1B9CFC": "to-blue-500",
//     "#FD7272": "from-red-300", "#E84118": "to-red-500",
//     "#A29BFE": "from-purple-300", "#6C5CE7": "to-purple-500",
//   };
//   const fromColor = colorMap[baseColor.from] || "from-blue-400";
//   const toColor = colorMap[baseColor.to] || "to-blue-600";
//   return `${fromColor} ${toColor}`;
// };

// const getCardBgGradient = (asset: Asset, index: number): string => {
//   const colorIndex = index % cardColors.length;
//   const baseColor = cardColors[colorIndex];
//   if (asset.isGold) return "from-amber-500/20 via-yellow-500/10 to-orange-500/20";
//   const fromColor = baseColor.from;
//   const toColor = baseColor.to;
//   return `from-[${fromColor}]/20 via-[${fromColor}]/10 to-[${toColor}]/20`;
// };

// const getTransactionColor = (merchant: string): string => {
//   const lower = merchant.toLowerCase();
//   if (lower.includes("gold")) return "from-yellow-500 to-amber-600";
//   if (lower.includes("bitcoin")) return "from-orange-400 to-amber-500";
//   if (lower.includes("ethereum")) return "from-purple-400 to-indigo-500";
//   if (lower.includes("solana")) return "from-purple-500 to-pink-500";
//   if (lower.includes("sp500") || lower.includes("s&p")) return "from-emerald-400 to-teal-500";
//   if (lower.includes("nasdaq")) return "from-blue-400 to-cyan-500";
//   if (lower.includes("vti")) return "from-blue-500 to-indigo-500";
//   if (lower.includes("qqq")) return "from-blue-400 to-purple-500";
//   if (lower.includes("apple")) return "from-gray-400 to-gray-600";
//   if (lower.includes("nvidia")) return "from-green-400 to-emerald-500";
//   if (lower.includes("microsoft")) return "from-blue-500 to-blue-600";
//   if (lower.includes("amazon")) return "from-orange-500 to-amber-600";
//   if (lower.includes("google")) return "from-blue-400 to-green-500";
//   if (lower.includes("tesla")) return "from-red-400 to-orange-500";
//   if (lower.includes("silver")) return "from-gray-400 to-slate-500";
//   return "from-cyan-400 to-blue-500";
// };

// // ============================================================================
// // ANIMATION VARIANTS
// // ============================================================================
// const containerVariants: Variants = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
// };

// const cardVariants: Variants = {
//   hidden: { opacity: 0, y: 20, scale: 0.97 },
//   visible: (delay: number = 0) => ({
//     opacity: 1, y: 0, scale: 1,
//     transition: { delay: delay * 0.06, duration: 0.4, ease: "easeOut" as const },
//   }),
//   exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2, ease: "easeIn" as const } },
// };

// const expandedVariants: Variants = {
//   collapsed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" as const } },
//   expanded: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
// };

// const pricePulseVariants: Variants = {
//   up: { scale: [1, 1.05, 1], transition: { duration: 0.5, ease: "easeOut" as const } },
//   down: { scale: [1, 0.95, 1], transition: { duration: 0.5, ease: "easeOut" as const } },
// };

// // ============================================================================
// // SUBCOMPONENTS
// // ============================================================================

// const LoadingSkeleton = () => (
//   <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//     <div className="mx-auto max-w-6xl space-y-4">
//       <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       </div>
//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       </div>
//     </div>
//   </div>
// );

// function MiniChart({ data, color }: { data: number[]; color: string }) {
//   const max = Math.max(...data);
//   const min = Math.min(...data);
//   const range = max - min || 1;

//   const points = useMemo(() => {
//     return data.map((val, i) => 
//       `${(i / (data.length - 1)) * 120},${40 - ((val - min) / range) * 35}`
//     ).join(" ");
//   }, [data, min, range]);

//   const polygonPoints = useMemo(() => {
//     return points + `, 120,40, 0,40`;
//   }, [points]);

//   const gradientId = `gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

//   return (
//     <svg width="120" height="40" viewBox="0 0 120 40" className="overflow-visible" suppressHydrationWarning>
//       <defs>
//         <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
//           <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
//           <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
//         </linearGradient>
//       </defs>
//       <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-${color}`} />
//       <polygon points={polygonPoints} fill={`url(#${gradientId})`} opacity="0.2" />
//     </svg>
//   );
// }

// function AssetCard({ 
//   asset, index, isExpanded, isInWatchlist, onToggle, onInvest, onWatchlistToggle, priceDirection,
// }: { 
//   asset: Asset; index: number; isExpanded: boolean; isInWatchlist: boolean;
//   onToggle: () => void; onInvest: (asset: Asset) => void; onWatchlistToggle: (assetId: string) => void;
//   priceDirection: "up" | "down" | null;
// }) {
//   const isPositive = asset.change >= 0;
//   const colorClass = getCardColorClass(asset, index);
//   const bgGradient = getCardBgGradient(asset, index);

//   return (
//     <motion.div
//       custom={index} variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout
//       className={`relative rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
//         asset.isGold ? `bg-gradient-to-br ${colorClass} ring-2 ring-amber-500/40` : asset.isTrending ? `bg-gradient-to-br ${colorClass} ring-1 ring-emerald-500/30` : `bg-gradient-to-br ${colorClass}`
//       } ${isExpanded ? "col-span-full" : ""}`}
//       suppressHydrationWarning
//     >
//       <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${bgGradient} opacity-20 pointer-events-none`}></div>
//       <div className="absolute -top-2 right-2 z-10 flex gap-1">
//         {asset.isGold && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 text-[10px] font-bold text-cyan-900 shadow-lg">⭐ GOLD</motion.div>}
//         {asset.isTrending && !asset.isGold && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-2.5 py-0.5 text-[10px] font-bold text-cyan-900 shadow-lg">🔥 TRENDING</motion.div>}
//         {asset.isNew && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-gradient-to-r from-purple-400 to-pink-500 px-2.5 py-0.5 text-[10px] font-bold text-cyan-900 shadow-lg">NEW</motion.div>}
//       </div>

//       <div className="p-4 cursor-pointer relative z-10" onClick={onToggle}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/40 backdrop-blur-sm text-cyan-900 shadow-xl">{asset.icon}</div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <h3 className="text-sm font-extrabold text-cyan-900 drop-shadow-sm">{asset.name}</h3>
//                 <button onClick={(e) => { e.stopPropagation(); onWatchlistToggle(asset.id); }} className="text-cyan-900/60 hover:text-cyan-900 transition-colors">
//                   <Star size={14} className={isInWatchlist ? "fill-cyan-900 text-cyan-900" : ""} />
//                 </button>
//               </div>
//               <p className="text-xs font-bold text-cyan-900/80">{asset.symbol}</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <motion.p animate={priceDirection ? "up" : undefined} variants={pricePulseVariants} className="text-sm font-extrabold text-cyan-900 drop-shadow-sm" suppressHydrationWarning>
//                 ${asset.price.toFixed(2)}
//               </motion.p>
//               <div className={`flex items-center justify-end gap-1 text-xs font-bold ${isPositive ? "text-emerald-700" : "text-red-700"}`}>
//                 {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
//                 <span suppressHydrationWarning>{Math.abs(asset.changePercent).toFixed(2)}%</span>
//               </div>
//             </div>
//             <ChevronRight size={18} className={`text-cyan-900/60 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
//           </div>
//         </div>

//         {asset.historicalData && (
//           <div className="mt-2 opacity-60 hover:opacity-100 transition-opacity">
//             <MiniChart data={asset.historicalData} color={isPositive ? "emerald-700" : "red-700"} />
//           </div>
//         )}
//       </div>

//       <AnimatePresence initial={false}>
//         {isExpanded && (
//           <motion.div variants={expandedVariants} initial="collapsed" animate="expanded" exit="collapsed" className="overflow-hidden relative z-10">
//             <div className="border-t border-white/30 p-4 space-y-4">
//               <p className="text-sm font-bold text-cyan-900 leading-relaxed drop-shadow-sm">{asset.description}</p>
//               <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
//                 <div className="rounded-lg bg-white/30 backdrop-blur-sm p-3 shadow-lg border border-white/20">
//                   <p className="text-[10px] font-extrabold text-cyan-900/70 uppercase tracking-wider">Price</p>
//                   <p className="text-lg font-extrabold text-cyan-900 drop-shadow-sm" suppressHydrationWarning>${asset.price.toFixed(2)}</p>
//                 </div>
//                 {/* ... [All other stat boxes remain identical to your original] ... */}
//               </div>
//               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onInvest(asset)}
//                 className={`w-full rounded-xl py-3 font-extrabold text-cyan-900 shadow-lg transition-all relative overflow-hidden ${asset.isGold ? "bg-gradient-to-r from-amber-400 to-yellow-500 shadow-amber-500/40 hover:shadow-amber-500/60" : "bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm hover:from-white/50 hover:to-white/30 border border-white/30"}`}
//               >
//                 <span className="flex items-center justify-center gap-2 relative z-10">Invest in {asset.symbol} <ArrowUpRight size={18} /></span>
//               </motion.button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }

// function AssetFilterBar({ activeFilter, onFilterChange, activeSort, onSortChange }: { activeFilter: string; onFilterChange: (filter: string) => void; activeSort: string; onSortChange: (sort: string) => void; }) {
//   const filters = [
//     { id: "all", label: "All Assets" }, { id: "commodity", label: "Commodities" },
//     { id: "crypto", label: "Crypto" }, { id: "etf", label: "ETFs" },
//     { id: "stock", label: "Stocks" },
//   ];

//   const sortOptions = [
//     { id: "default", label: "Default" }, { id: "price-high", label: "Price: High-Low" },
//     { id: "price-low", label: "Price: Low-High" }, { id: "gainers", label: "Top Gainers" },
//     { id: "losers", label: "Top Losers" },
//   ];

//   return (
//     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
//       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
//         {filters.map((filter) => (
//           <motion.button key={filter.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onFilterChange(filter.id)}
//             className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-xl ${activeFilter === filter.id ? "bg-gradient-to-r from-cyan-700 to-cyan-900 text-white shadow-lg shadow-cyan-900/30" : "bg-white/40 text-cyan-900 hover:bg-white/60 backdrop-blur-sm border border-white/30"}`}
//           >
//             {filter.label}
//           </motion.button>
//         ))}
//       </motion.div>
//       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
//         <SlidersHorizontal size={14} className="text-cyan-900/70" />
//         <select value={activeSort} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSortChange(e.target.value)}
//           className="bg-[#C4F8FD] rounded-md px-3 py-1.5 text-xs font-extrabold text-cyan-900 focus:outline-none shadow-xl border-none"
//         >
//           {sortOptions.map((option) => (
//             <option key={option.id} value={option.id} className="bg-[#C4F8FD] text-cyan-900 border-none">{option.label}</option>
//           ))}
//         </select>
//       </motion.div>
//     </div>
//   );
// }

// function MarketStats() {
//   const stats: Array<{ label: string; value: string; icon: React.ReactNode; positive?: boolean; }> = [
//     { label: "Assets Available", value: "15+", icon: <BarChart3 size={16} /> },
//     { label: "24h Trading Volume", value: "$87.4B", icon: <Activity size={16} /> },
//     { label: "Active Investors", value: "2,847", icon: <Users size={16} /> },
//     { label: "Top Gainers", value: "+12.4%", icon: <TrendingUp size={16} />, positive: true },
//   ];

//   const statColors = ["from-red-400 to-red-600", "from-orange-400 to-orange-600", "from-yellow-400 to-yellow-500", "from-emerald-400 to-emerald-600"];

//   return (
//     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//       {stats.map((stat, index) => (
//         <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
//           className={`rounded-xl bg-gradient-to-br ${statColors[index]} p-3 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`} suppressHydrationWarning>
//           <div className="flex items-center gap-2 text-cyan-900/90"><div className="shadow-xl">{stat.icon}</div><p className="text-[10px] font-extrabold uppercase tracking-wider">{stat.label}</p></div>
//           <p className="text-lg font-extrabold text-cyan-900 drop-shadow-sm">{stat.value}</p>
//         </motion.div>
//       ))}
//     </motion.div>
//   );
// }

// function TransactionCard({ transaction }: { transaction: Transaction }) {
//   const colorClass = getTransactionColor(transaction.merchant);
//   const statusColor = transaction.status === "completed" ? "text-emerald-600" : transaction.status === "failed" ? "text-red-600" : "text-amber-600";

//   return (
//     <motion.div whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
//       className={`flex-shrink-0 w-56 rounded-2xl bg-gradient-to-br ${colorClass} p-4 shadow-xl border border-white/30 backdrop-blur-sm transition-all duration-300`}>
//       <div className="flex items-start justify-between">
//         <div><p className="text-xs font-bold text-cyan-900/70 uppercase tracking-wider">{transaction.merchant}</p><p className="text-lg font-extrabold text-cyan-900">${transaction.amount}</p></div>
//         <span className={`text-xs font-bold ${statusColor}`}>{transaction.status}</span>
//       </div>
//       <p className="text-xs text-cyan-900/60 mt-1">{new Date(transaction.date).toLocaleDateString()}</p>
//     </motion.div>
//   );
// }

// // ============================================================================
// // FULLSCREEN INVESTMENT DASHBOARD - MAIN COMPONENT
// // ============================================================================
// export default function InvestmentPage() {
//   const [isClient, setIsClient] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);
  
//   const [assets, setAssets] = useState<Asset[]>(initialAssets);
//   const [expandedId, setExpandedId] = useState<string | null>(null);
//   const [activeFilter, setActiveFilter] = useState<string>("all");
//   const [activeSort, setActiveSort] = useState<string>("default");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [showInvestModal, setShowInvestModal] = useState<boolean>(false);
//   const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
//   const [watchlist, setWatchlist] = useState<string[]>([]);
//   const [priceDirections, setPriceDirections] = useState<Record<string, "up" | "down" | null>>({});

//   const [investmentAmount, setInvestmentAmount] = useState<string>("");
//   const [balance, setBalance] = useState<number>(0);
//   const [transactionStatus, setTransactionStatus] = useState<"idle" | "processing" | "success" | "error" | "insufficient">("idle");
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   const [pendingAmount, setPendingAmount] = useState<number>(0);
//   const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

//   const isMounted = useRef(true);
//   const dataLoaded = useRef(false);
  
//   // 🟢 ADDED: Polling ref
//   const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     isMounted.current = true;
//     setIsClient(true);
    
//     const loadData = async () => {
//       if (!dataLoaded.current) {
//         await new Promise(resolve => setTimeout(resolve, 300));
//         if (isMounted.current) {
//           setLoading(false);
//           dataLoaded.current = true;
//         }
//       }
//     };
//     loadData();
    
//     return () => {
//       isMounted.current = false;
//       if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
//     };
//   }, []);

//   // Real-time price updates
//   useEffect(() => {
//     if (!isClient || loading) return;
//     const interval = setInterval(() => {
//       setAssets((prevAssets: Asset[]) => {
//         const updatedAssets = prevAssets.map((asset: Asset) => {
//           const volatility = asset.type === "crypto" ? 0.008 : asset.type === "stock" ? 0.005 : asset.type === "etf" ? 0.003 : 0.004;
//           const change = (Math.random() - 0.5) * asset.price * volatility;
//           const newPrice = Math.max(asset.price + change, asset.price * 0.85);
//           const direction = newPrice > asset.price ? "up" : "down";
//           setPriceDirections((prev: Record<string, "up" | "down" | null>) => ({ ...prev, [asset.id]: direction }));
//           setTimeout(() => { setPriceDirections((prev: Record<string, "up" | "down" | null>) => ({ ...prev, [asset.id]: null })); }, 500);
//           const newChange = newPrice - asset.price;
//           const newChangePercent = (newChange / asset.price) * 100;
//           return { ...asset, price: newPrice, change: asset.change + newChange, changePercent: asset.changePercent + newChangePercent };
//         });
//         return updatedAssets;
//       });
//     }, 2000);
//     return () => clearInterval(interval);
//   }, [isClient, loading]);

//   // ---- Fetch Dashboard Data ----
//   const fetchDashboardData = async () => {
//     try {
//       const token = localStorage.getItem("auth_token");
//       const response = await fetch(`/api/user/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
//       const result = await response.json();
//       if (result.success && result.data) {
//         const data = result.data;
//         const amount = parseFloat(data.totalBalance?.amount) || 0;
//         setBalance(amount);
//         if (data.recentTransactions) setRecentTransactions(data.recentTransactions);
//         return data;
//       }
//       return null;
//     } catch (error) { console.error("Error fetching dashboard:", error); return null; }
//   };

//   // ---- Fetch Balance ----
//   const fetchBalance = async () => {
//     const data = await fetchDashboardData();
//     if (data) { const amount = parseFloat(data.totalBalance?.amount) || 0; setBalance(amount); return amount; }
//     return 0;
//   };

//   // ---- Handle Invest ----
//   const handleInvest = useCallback(async (asset: Asset) => {
//     setSelectedAsset(asset); setInvestmentAmount(""); setTransactionStatus("idle");
//     setErrorMessage(""); setPendingAmount(0); await fetchBalance(); setShowInvestModal(true);
//   }, []);

//   // ---- Close Modal ----
//   const closeModal = () => {
//     if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
//     setShowInvestModal(false); setSelectedAsset(null); setInvestmentAmount("");
//     setTransactionStatus("idle"); setErrorMessage(""); setPendingAmount(0);
//   };

//   // ---- Confirm Investment (Automatic Polling) ----
//   const handleConfirmInvestment = async () => {
//     const amount = parseFloat(investmentAmount);
//     if (isNaN(amount) || amount <= 0) { setErrorMessage("Please enter a valid amount."); return; }
//     if (amount > balance) { setTransactionStatus("insufficient"); return; }
//     setPendingAmount(amount); setTransactionStatus("processing"); setErrorMessage("");

//     if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
//     pollIntervalRef.current = setInterval(async () => {
//       try {
//         const newData = await fetchDashboardData();
//         if (newData) {
//           const newBalance = parseFloat(newData.totalBalance?.amount) || 0;
//           if (newBalance >= balance + amount) {
//             setTransactionStatus("success"); setErrorMessage("");
//             if (newData.recentTransactions) setRecentTransactions(newData.recentTransactions);
//             if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
//           } else {
//             setErrorMessage("Transaction pending. Waiting for admin confirmation...");
//           }
//         }
//       } catch (error) { console.error("Polling error:", error); }
//     }, 3000);
//   };

//   // ---- Refresh Status (Manual Override) ----
//   const handleRefreshStatus = async () => {
//     if (transactionStatus !== "processing") return;
//     const newData = await fetchDashboardData();
//     if (newData) {
//       const newBalance = parseFloat(newData.totalBalance?.amount) || 0;
//       if (newBalance >= balance + pendingAmount) {
//         setTransactionStatus("success"); setErrorMessage("");
//         if (newData.recentTransactions) setRecentTransactions(newData.recentTransactions);
//         if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
//       } else { setErrorMessage("Still pending. Please wait or try again later."); }
//     }
//   };

//   const handleToggle = useCallback((id: string) => { setExpandedId((prev: string | null) => (prev === id ? null : id)); }, []);
//   const handleWatchlistToggle = useCallback((assetId: string) => {
//     setWatchlist((prev: string[]) => prev.includes(assetId) ? prev.filter((id: string) => id !== assetId) : [...prev, assetId]);
//   }, []);

//   const filteredAndSortedAssets = useMemo(() => {
//     let result = assets.filter((asset: Asset) => {
//       const matchesFilter = activeFilter === "all" || asset.type === activeFilter;
//       const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
//       return matchesFilter && matchesSearch;
//     });
//     switch (activeSort) {
//       case "price-high": result = [...result].sort((a: Asset, b: Asset) => b.price - a.price); break;
//       case "price-low": result = [...result].sort((a: Asset, b: Asset) => a.price - b.price); break;
//       case "gainers": result = [...result].sort((a: Asset, b: Asset) => b.changePercent - a.changePercent); break;
//       case "losers": result = [...result].sort((a: Asset, b: Asset) => a.changePercent - b.changePercent); break;
//       default: result = [...result].sort((a: Asset, b: Asset) => { if (a.isGold) return -1; if (b.isGold) return 1; return b.price - a.price; });
//     }
//     return result;
//   }, [assets, activeFilter, activeSort, searchQuery]);

//   if (loading || !isClient) { return <LoadingSkeleton />; }

//   return (
//     <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8">
//       <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-6xl">
        
//         <MarketStats />

//         <div className="mb-6 mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div className="relative flex-1 max-w-sm">
//             <input type="text" placeholder="Search assets..." value={searchQuery}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
//               className="w-full rounded-xl border border-cyan-900/20 bg-[#C4F8FD] px-4 py-2.5 pl-10 text-sm font-bold text-cyan-900 placeholder:text-cyan-900/50 focus:border-cyan-900/50 focus:outline-none focus:ring-1 focus:ring-cyan-900/30 shadow-xl" />
//             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-900/50" />
//           </div>
//           <AssetFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} activeSort={activeSort} onSortChange={setActiveSort} />
//         </div>

//         {recentTransactions.length > 0 && (
//           <div className="mb-6 overflow-x-auto pb-2">
//             <div className="flex gap-4">
//               {recentTransactions.map((tx) => ( <TransactionCard key={tx.id} transaction={tx} /> ))}
//             </div>
//           </div>
//         )}

//         <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 bg-[#C4F8FD] shadow-xl gap-4 md:grid-cols-2">
//           {filteredAndSortedAssets.map((asset: Asset, index: number) => (
//             <AssetCard key={asset.id} asset={asset} index={index} isExpanded={expandedId === asset.id} isInWatchlist={watchlist.includes(asset.id)}
//               onToggle={() => handleToggle(asset.id)} onInvest={handleInvest} onWatchlistToggle={handleWatchlistToggle} priceDirection={priceDirections[asset.id] || null} />
//           ))}
//         </motion.div>

//         {filteredAndSortedAssets.length === 0 && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16">
//             <div className="rounded-full bg-white/50 p-4 shadow-xl"><Search size={32} className="text-cyan-900/50" /></div>
//             <p className="mt-4 text-sm font-bold text-cyan-900/70">No assets found matching your criteria</p>
//           </motion.div>
//         )}
//       </motion.div>

//       <AnimatePresence>
//         {showInvestModal && selectedAsset && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeModal}>
//             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md rounded-2xl bg-[#C4F8FD] shadow-2xl border-none overflow-hidden" onClick={(e) => e.stopPropagation()}>
              
//               {/* Original Modal Content (Remains exactly as you had it) */}
//               <div className="flex items-center justify-between p-4 border-b border-white/20">
//                 <h2 className="text-xl font-bold text-slate-700">Invest in {selectedAsset.name}</h2>
//                 <button onClick={closeModal} className="rounded-lg p-1 hover:bg-white/20 transition-colors"><X size={20} className="text-slate-600" /></button>
//               </div>

//               <div className="p-6">
//                 {/* Insufficient, Processing, Success, Error states stay identical to your original file */}
//                 {/* ... */}
                
//                 {/* If you are in the processing state, make sure the Refresh button calls handleRefreshStatus */}
//                 {/* If you are in the idle state, the Confirm button calls handleConfirmInvestment */}
//               </div>

//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }