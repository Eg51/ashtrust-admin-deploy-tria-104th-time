// "use client";

// export default function Reroute() {
//   const handleNavigation = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedUrl = event.target.value;
    
//     if (selectedUrl) {
//       // Opens the link in a brand new browser tab
//       window.open(selectedUrl, "_blank", "noopener,noreferrer");
      
//       // ALTERNATIVE: If you want it to open in the SAME tab instead, use:
//       // window.location.href = selectedUrl;
//     }
//   };

//   return (
//     <select
//       name="tier_selection"
//       onChange={handleNavigation} // 1. Listens for the selection click
//       defaultValue=""
//       className="w-full border-none bg-transparent py-1.5 pl-3 pr-4 text-slate-900
//       font-bold outline-none ring-0 focus:outline-none focus:ring-0"
//     >
//       {/* Optional: Placeholder option so a link isn't immediately triggered on mount */}
//       <option value="" className="font-bold" disabled>Select an asset...</option>

//       {/* 2. Put the exact external URLs directly in the values */}
//       <option value="https://coinmarketcap.com/real-world-assets/gold/" className="border-none font-bold outline-none">
//         Gold
//       </option>
//       <option value="https://coinmarketcap.com/real-world-assets/silver/" className="font-bold border-none outline-none">
//         Silver
//       </option>
//       <option value="https://coinmarketcap.com/real-world-assets/" className="font-bold border-none outline-none">
//         Crypto
//       </option>
//     </select>
//   );
// }
// components/RealTimePrices.tsx

// components/RealTimePrices.tsx
// components/RealTimePrices.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Coins,
  Bitcoin,
  Sparkles,
  Gem,
  Zap,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface PriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  volume?: number;
  lastUpdated: string;
  icon: React.ReactNode;
  cardColor: string;
}

interface PriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_24h_high?: number;
    usd_24h_low?: number;
    usd_24h_vol?: number;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PRICE_SYMBOLS = [
  { 
    id: "gold", 
    name: "Gold", 
    symbol: "XAU", 
    icon: <Gem className="h-4 w-4" />,
    cardColor: "bg-gradient-to-br from-amber-400/20 to-amber-600/10"
  },
  { 
    id: "silver", 
    name: "Silver", 
    symbol: "XAG", 
    icon: <Sparkles className="h-4 w-4" />,
    cardColor: "bg-gradient-to-br from-slate-300/20 to-slate-400/10"
  },
  { 
    id: "bitcoin", 
    name: "Bitcoin", 
    symbol: "BTC", 
    icon: <Bitcoin className="h-4 w-4" />,
    cardColor: "bg-gradient-to-br from-orange-400/20 to-orange-600/10"
  },
  { 
    id: "ethereum", 
    name: "Ethereum", 
    symbol: "ETH", 
    icon: <DollarSign className="h-4 w-4" />,
    cardColor: "bg-gradient-to-br from-purple-400/20 to-purple-600/10"
  },
  { 
    id: "solana", 
    name: "Solana", 
    symbol: "SOL", 
    icon: <Zap className="h-4 w-4" />,
    cardColor: "bg-gradient-to-br from-blue-400/20 to-blue-600/10"
  },
];

// ============================================================================
// ANIMATION VARIANTS - FIXED
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

// ✅ FIX: Added 'as const' to ease values
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RealTimePrices() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLive, setIsLive] = useState(true);

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);







  

  const fetchPrices = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const ids = PRICE_SYMBOLS.map((p) => p.id).join(",");
      const response = await fetch(
        `/api/prices?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true&include_24hr_vol=true`
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment.");
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data: PriceResponse = await response.json();

      const mappedPrices: PriceData[] = PRICE_SYMBOLS.map((item) => {
        const priceData = data[item.id] || {};
        const price = priceData.usd || 0;
        const change24h = priceData.usd_24h_change || 0;

        return {
          symbol: item.symbol,
          name: item.name,
          price: price,
          change24h: change24h,
          high24h: priceData.usd_24h_high,
          low24h: priceData.usd_24h_low,
          volume: priceData.usd_24h_vol,
          lastUpdated: new Date().toLocaleTimeString(),
          icon: item.icon,
          cardColor: item.cardColor,
        };
      });

      if (isMountedRef.current) {
        setPrices(mappedPrices);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
        retryCountRef.current = 0;
      }
    } catch (err) {
      console.error("Error fetching prices:", err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to fetch prices");

        retryCountRef.current += 1;
        const delay = Math.min(5000 * Math.pow(1.5, retryCountRef.current - 1), 30000);

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchPrices(false);
          }
        }, delay);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchPrices(false);

    const interval = setInterval(() => {
      if (isMountedRef.current && isLive) {
        fetchPrices(false);
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isLive]);

  const handleRefresh = () => {
    if (!isRefreshing && !isLoading) {
      fetchPrices(true);
    }
  };

  const toggleLive = () => {
    setIsLive((prev) => !prev);
  };

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === "XAU" || symbol === "XAG") {
      return `$${price.toFixed(2)}`;
    }
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex flex-col bg-none p-3 sm:p-4 md:flex-col">
      <div className="h-auto w-auto">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:mb-6">
          <div>
            <h2 className="text-xl font-bold text-cyan-900 sm:text-2xl md:text-3xl">
              Live Market Prices
            </h2>
            <p className="text-xs text-cyan-600 sm:text-sm">
              {lastUpdated ? `Last updated: ${lastUpdated}` : "Loading..."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  isLive ? "animate-pulse bg-emerald-500" : "bg-slate-500"
                }`}
              />
              <span className="text-xs font-medium text-slate-700">
                {isLive ? "Live" : "Paused"}
              </span>
            </div>

            <button
              onClick={toggleLive}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isLive
                  ? "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30"
                  : "bg-slate-600/20 text-slate-600 hover:bg-slate-600/30"
              }`}
            >
              {isLive ? "Pause" : "Resume"}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="rounded-lg bg-slate-700/20 p-2 text-slate-700 transition hover:bg-slate-700/30 disabled:opacity-50"
              aria-label="Refresh prices"
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 shadow-lg backdrop-blur-sm"
            >
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
              <button
                onClick={handleRefresh}
                className="ml-auto text-xs text-red-600 underline hover:text-red-700"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price Grid */}
        {isLoading && prices.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {prices.map((item, index) => {
              const isUp = item.change24h >= 0;

              return (
                <motion.div
                  key={item.symbol}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-2xl ${item.cardColor} p-4 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl sm:p-5`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg p-1.5 shadow-sm">
                        <span className="text-cyan-900">{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-cyan-900">
                          {item.symbol}
                        </p>
                        <p className="text-[10px] text-cyan-600">{item.name}</p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isUp
                          ? "bg-emerald-500/20 text-emerald-700"
                          : "bg-red-500/20 text-red-700"
                      }`}
                    >
                      {isUp ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {Math.abs(item.change24h).toFixed(2)}%
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xl font-bold text-cyan-900 sm:text-2xl">
                      {formatPrice(item.price, item.symbol)}
                    </p>
                    <p className="text-[10px] text-cyan-600">
                      Updated {item.lastUpdated}
                    </p>
                  </div>

                  {item.high24h && item.low24h && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[9px] text-slate-500 sm:text-[10px]">
                        <span>Low: ${item.low24h.toFixed(2)}</span>
                        <span>High: ${item.high24h.toFixed(2)}</span>
                      </div>
                      <div className="relative mt-0.5 h-1 w-full overflow-hidden rounded-full bg-white/40">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                          style={{
                            width: `${Math.min(
                              100,
                              ((item.price - (item.low24h || 0)) /
                                ((item.high24h || 1) - (item.low24h || 1))) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <div className="mt-6 text-center text-[10px] text-slate-500 sm:text-xs">
          Data powered by CoinGecko • Updates every 60 seconds
        </div>
      </div>
    </div>
  );
}