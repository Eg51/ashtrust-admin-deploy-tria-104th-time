// components/MarketStatus.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gem, Bitcoin, TrendingUp, AlertCircle } from 'lucide-react';
import Card from './Card';

interface MarketData {
  label: string;
  value: string;
  status: 'up' | 'down' | 'neutral';
  marketStatus: 'open' | 'closed';
}

export default function MarketStatus() {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { label: 'MARKET', value: '● LOADING', status: 'neutral', marketStatus: 'closed' },
    { label: 'GOLD', value: '---', status: 'neutral', marketStatus: 'closed' },
    { label: 'BTC', value: '---', status: 'neutral', marketStatus: 'closed' },
    { label: 'ETH', value: '---', status: 'neutral', marketStatus: 'closed' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,gold,silver&vs_currencies=usd&include_24hr_change=true'
      );

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const isOpen = checkMarketHours();

      setMarketData([
        { 
          label: 'MARKET', 
          value: isOpen ? '● OPEN' : '● CLOSED', 
          status: 'neutral', 
          marketStatus: isOpen ? 'open' : 'closed' 
        },
        {
          label: 'GOLD',
          value: formatChange(data.gold?.usd_24h_change || 0),
          status: getStatus(data.gold?.usd_24h_change || 0),
          marketStatus: isOpen ? 'open' : 'closed',
        },
        {
          label: 'BTC',
          value: formatChange(data.bitcoin?.usd_24h_change || 0),
          status: getStatus(data.bitcoin?.usd_24h_change || 0),
          marketStatus: isOpen ? 'open' : 'closed',
        },
        {
          label: 'ETH',
          value: formatChange(data.ethereum?.usd_24h_change || 0),
          status: getStatus(data.ethereum?.usd_24h_change || 0),
          marketStatus: isOpen ? 'open' : 'closed',
        },
      ]);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const checkMarketHours = (): boolean => {
    const now = new Date();
    const day = now.getDay();
    if (day === 0 || day === 6) return false;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const estHours = (hours - 5 + 24) % 24;
    if (estHours > 9 || (estHours === 9 && minutes >= 30)) {
      if (estHours < 16 || (estHours === 16 && minutes === 0)) return true;
    }
    return false;
  };

  const getStatus = (change: number): 'up' | 'down' | 'neutral' => {
    if (change > 0.1) return 'up';
    if (change < -0.1) return 'down';
    return 'neutral';
  };

  const formatChange = (change: number): string => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'text-emerald-600';
      case 'down': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getIcon = (label: string) => {
    switch (label) {
      case 'GOLD': return <Gem className="h-3.5 w-3.5 text-amber-500" />;
      case 'BTC': return <Bitcoin className="h-3.5 w-3.5 text-orange-500" />;
      case 'ETH': return <Bitcoin className="h-3.5 w-3.5 text-purple-500" />;
      default: return <TrendingUp className="h-3.5 w-3.5 text-cyan-500" />;
    }
  };

  if (error) {
    return (
      <div className="bg-[#C4F8FD] p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-600">Market Status</h3>
          <button onClick={fetchMarketData} className="text-xs text-cyan-600 hover:underline">
            Retry
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load market data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#C4F8FD] p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-600">Market Status</h3>
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
        ) : (
          <span className="text-xs text-cyan-600/60">Live</span>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {marketData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between rounded-lg bg-white/50 px-4 py-2.5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              {getIcon(item.label)}
              <span className="text-xs font-medium text-slate-600">
                {item.label}
              </span>
              {item.label !== 'MARKET' && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  item.marketStatus === 'open' 
                    ? 'text-emerald-600 bg-emerald-500/20' 
                    : 'text-red-600 bg-red-500/20'
                }`}>
                  {item.marketStatus === 'open' ? '● Open' : '● Closed'}
                </span>
              )}
            </div>
            <span className={`text-sm font-semibold ${getStatusColor(item.status)}`}>
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}