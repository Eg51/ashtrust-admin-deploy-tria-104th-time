"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Iconpack from '@/app/components/Iconpack'
import { Search } from "lucide-react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bitcoin,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Info,
  X,
  ChevronRight,
  ShieldCheck,
  Globe,
  Zap,
  BarChart3,
  Coins,
  Banknote,
  Gem,
  LineChart,
  PieChart,
  Wallet,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Send,
  Calendar,
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
  historicalData?: number[];
}

// ============================================================================
// DATA - FIXED (no random values for hydration)
// ============================================================================

// Fixed seed data for hydration consistency
const getFixedHistoricalData = (basePrice: number, points: number = 20) => {
  // Use deterministic values based on price
  const data = [];
  let price = basePrice;
  for (let i = 0; i < points; i++) {
    // Deterministic variation based on index and price
    const variation = Math.sin(i * 0.5 + basePrice) * basePrice * 0.02;
    price = Math.max(price + variation, basePrice * 0.7);
    data.push(price);
  }
  return data;
};

// Static data that won't change between server/client
const initialAssets: Asset[] = [
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
    color: "from-amber-400 to-yellow-600",
    bgGradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20",
    isGold: true,
    historicalData: getFixedHistoricalData(2345.67, 30),
  },
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
    historicalData: getFixedHistoricalData(67234.89, 30),
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
    historicalData: getFixedHistoricalData(3456.78, 30),
  },
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
    historicalData: getFixedHistoricalData(28.92, 30),
  },
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
    historicalData: getFixedHistoricalData(845.23, 30),
  },
];

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
    color: ["#34D399", "#10B981", "#34D399"],
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  down: {
    scale: [1, 0.95, 1],
    color: ["#F87171", "#EF4444", "#F87171"],
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

// ---- MiniChart ------------------------------------------------------------

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Generate points string - memoized to prevent recalculation
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
        strokeWidth="2"
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
  onToggle,
  onInvest,
}: { 
  asset: Asset; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onInvest: (asset: Asset) => void;
}) {
  const isPositive = asset.change >= 0;
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null);
  const [currentPrice, setCurrentPrice] = useState(asset.price);
  const [currentChange, setCurrentChange] = useState(asset.change);
  const [currentChangePercent, setCurrentChangePercent] = useState(asset.changePercent);
  const [isClient, setIsClient] = useState(false);

  // Mark as client-side after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simulate real-time price updates
  useEffect(() => {
    if (!isExpanded || !isClient) return;

    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * currentPrice * 0.005;
      const newPrice = Math.max(currentPrice + change, currentPrice * 0.9);
      const direction = newPrice > currentPrice ? "up" : "down";
      
      setPriceDirection(direction);
      const oldPrice = currentPrice;
      setCurrentPrice(newPrice);
      setCurrentChange(newPrice - oldPrice);
      setCurrentChangePercent(((newPrice - oldPrice) / oldPrice) * 100);

      setTimeout(() => setPriceDirection(null), 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [isExpanded, isClient, currentPrice]);

  // Use client-side values when available, otherwise use props
  const displayPrice = isClient ? currentPrice : asset.price;
  const displayChange = isClient ? currentChange : asset.change;
  const displayChangePercent = isClient ? currentChangePercent : asset.changePercent;
  const displayIsPositive = displayChange >= 0;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={`relative rounded-2xl border border-cyan-200/30 shadow-xl transition-shadow hover:shadow-2xl ${
        asset.isGold 
          ? "bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200 ring-2 ring-amber-500/30" 
          : "bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200"
      } ${isExpanded ? "col-span-full" : ""}`}
      suppressHydrationWarning
    >
      {/* Gold Badge */}
      {asset.isGold && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 z-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-0.5 text-[10px] font-bold text-slate-900 shadow-lg"
        >
          ⭐ GOLD
        </motion.div>
      )}

      {/* Card Content */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${asset.bgGradient} text-cyan-600`}>
              {asset.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-cyan-600">
                {asset.name}
                {asset.isGold && (
                  <span className="ml-1.5 text-xs text-amber-400">✨</span>
                )}
              </h3>
              <p className="text-xs font-bold text-cyan-600/60">{asset.symbol}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <motion.p 
                animate={priceDirection ? "up" : undefined}
                variants={pricePulseVariants}
                className={`text-sm font-bold ${
                  priceDirection === "up" ? "text-emerald-400" : 
                  priceDirection === "down" ? "text-red-400" :
                  "text-cyan-600"
                }`}
                suppressHydrationWarning
              >
                ${displayPrice.toFixed(2)}
              </motion.p>
              <div className={`flex items-center justify-end gap-1 text-xs font-bold ${
                displayIsPositive ? "text-emerald-400" : "text-red-400"
              }`}>
                {displayIsPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span suppressHydrationWarning>{Math.abs(displayChangePercent).toFixed(2)}%</span>
              </div>
            </div>
            <ChevronRight 
              size={18} 
              className={`text-cyan-600/60 transition-transform duration-300 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </div>
        </div>

        {/* Mini Chart - Always visible */}
        {asset.historicalData && (
          <div className="mt-2 opacity-50 hover:opacity-100 transition-opacity">
            <MiniChart 
              data={asset.historicalData} 
              color={displayIsPositive ? "emerald-400" : "red-400"}
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
            className="overflow-hidden"
          >
            <div className="border-t border-cyan-200/30 p-4 space-y-4">
              {/* Description */}
              <p className="text-sm text-cyan-700/80 leading-relaxed">
                {asset.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white/50 p-3 shadow-md">
                  <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-wider">Price</p>
                  <p className="text-lg font-bold text-cyan-600" suppressHydrationWarning>
                    ${displayPrice.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-white/50 p-3 shadow-md">
                  <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-wider">24h Change</p>
                  <p className={`text-lg font-bold ${displayIsPositive ? "text-emerald-400" : "text-red-400"}`} suppressHydrationWarning>
                    {displayIsPositive ? "+" : ""}{displayChange.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-white/50 p-3 shadow-md">
                  <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-wider">Volume</p>
                  <p className="text-lg font-bold text-cyan-600">{asset.volume}</p>
                </div>
                {asset.marketCap && (
                  <div className="rounded-lg bg-white/50 p-3 shadow-md">
                    <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-wider">Market Cap</p>
                    <p className="text-lg font-bold text-cyan-600">{asset.marketCap}</p>
                  </div>
                )}
              </div>

              {/* Invest Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onInvest(asset)}
                className={`w-full rounded-xl py-3 font-bold text-white shadow-lg transition-all ${
                  asset.isGold 
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/30 hover:shadow-amber-500/50" 
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:shadow-cyan-500/50"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
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
  onFilterChange 
}: { 
  activeFilter: string; 
  onFilterChange: (filter: string) => void;
}) {
  const filters = [
    { id: "all", label: "All Assets" },
    { id: "commodity", label: "Commodities" },
    { id: "crypto", label: "Crypto" },
    { id: "etf", label: "ETFs" },
    { id: "stock", label: "Stocks" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 mb-6"
    >
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeFilter === filter.id
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
              : "bg-white/50 text-cyan-600 hover:bg-white/70 hover:text-cyan-700"
          }`}
        >
          {filter.label}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Page() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Mark as client-side after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Real-time price updates
  useEffect(() => {
    if (!isClient) return;

    const interval = setInterval(() => {
      setAssets(prevAssets => 
        prevAssets.map(asset => {
          if (asset.id === expandedId) {
            const change = (Math.random() - 0.5) * asset.price * 0.002;
            const newPrice = Math.max(asset.price + change, asset.price * 0.9);
            return {
              ...asset,
              price: newPrice,
              change: newPrice - (asset.price - asset.change),
              changePercent: ((newPrice - (asset.price - asset.change)) / (asset.price - asset.change)) * 100,
            };
          }
          return asset;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [expandedId, isClient]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleInvest = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setShowInvestModal(true);
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesFilter = activeFilter === "all" || asset.type === activeFilter;
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [assets, activeFilter, searchQuery]);

  // Sort: Gold first, then by type, then by price
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      if (a.isGold) return -1;
      if (b.isGold) return 1;
      return b.price - a.price;
    });
  }, [filteredAssets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-cyan-600 sm:text-3xl flex items-center gap-2">
            <Wallet className="text-cyan-600" size={28} />
            Deposit & Invest
          </h1>
          <p className="mt-1 text-sm font-bold text-cyan-600/70">
            Explore and invest in premium assets with real-time market data
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <div className="rounded-xl bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200 p-3 border border-cyan-200/30 shadow-xl">
            <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-wider">Available Balance</p>
            <p className="text-lg font-bold text-cyan-600">$12,450.00</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200 p-3 border border-cyan-200/30 shadow-xl">
            <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-wider">Portfolio Value</p>
            <p className="text-lg font-bold text-emerald-400">$284,500</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200 p-3 border border-cyan-200/30 shadow-xl">
            <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-wider">Today's P&L</p>
            <p className="text-lg font-bold text-emerald-400">+$3,245.67</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200 p-3 border border-cyan-200/30 shadow-xl">
            <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-wider">Assets Held</p>
            <p className="text-lg font-bold text-cyan-600">{assets.length}</p>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-cyan-200/50 bg-white/50 px-4 py-2.5 pl-10 text-sm font-bold text-cyan-600 placeholder:text-cyan-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              suppressHydrationWarning
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          </div>
          <AssetFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Asset Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {sortedAssets.map((asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              index={index}
              isExpanded={expandedId === asset.id}
              onToggle={() => handleToggle(asset.id)}
              onInvest={handleInvest}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {sortedAssets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="rounded-full bg-white/50 p-4 shadow-xl">
              <Search size={32} className="text-cyan-400" />
            </div>
            <p className="mt-4 text-sm font-bold text-cyan-600/70">No assets found matching your criteria</p>
          </motion.div>
        )}

        {/* Invest Modal */}
        <AnimatePresence>
          {showInvestModal && selectedAsset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
              onClick={() => setShowInvestModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md rounded-2xl bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200 p-6 shadow-2xl border border-cyan-200/50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-cyan-600">Invest in {selectedAsset.name}</h2>
                  <button
                    onClick={() => setShowInvestModal(false)}
                    className="rounded-lg p-1 hover:bg-white/50 transition-colors"
                  >
                    <X size={20} className="text-cyan-600" />
                  </button>
                </div>

                <div className={`rounded-xl p-4 mb-4 bg-gradient-to-br ${selectedAsset.bgGradient} shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-cyan-600/70">{selectedAsset.symbol}</p>
                      <p className="text-2xl font-bold text-cyan-600" suppressHydrationWarning>
                        ${selectedAsset.price.toFixed(2)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 font-bold ${
                      selectedAsset.change >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {selectedAsset.change >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      <span className="font-bold" suppressHydrationWarning>
                        {Math.abs(selectedAsset.changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-cyan-600/70 block mb-1">Amount to Invest (USD)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-600 font-bold placeholder:text-cyan-400 focus:border-cyan-500 focus:outline-none"
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="flex gap-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <button
                        key={amount}
                        className="flex-1 rounded-lg bg-white/50 px-3 py-1.5 text-xs font-bold text-cyan-600 hover:bg-white/70 hover:text-cyan-700 transition-colors shadow-md"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full rounded-xl py-3.5 font-bold text-white shadow-lg transition-all ${
                      selectedAsset.isGold 
                        ? "bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/30" 
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Send size={18} />
                      Confirm Investment
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Iconpack/>
    </div>
  );
}