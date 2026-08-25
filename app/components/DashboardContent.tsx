"use client";

import React, { useState, useEffect, useId } from "react";
import { motion, type Variants } from "framer-motion";
import { IoIosNotifications } from "react-icons/io";
import Sliderr from "./Sliderr";

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "ALL";

interface WatchlistItem {
  ticker: string;
  name: string;
  sector: string;
  price: string;
  change: number;
  sparkPoints: number[];
}

interface InsightItem {
  tag: string;
  tagColor: "blue" | "green" | "orange";
  title: string;
  time: string;
  readTime: string;
}

const timeRanges: TimeRange[] = ["1D", "1W", "1M", "1Y", "ALL"];

const watchlistData: WatchlistItem[] = [
  {
    ticker: "AAPL",
    name: "Apple, Inc.",
    sector: "Equity · Tech",
    price: "$182.41",
    change: 1.24,
    sparkPoints: [22, 20, 18, 14, 12, 8, 6],
  },
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    sector: "Equity · Auto",
    price: "$248.50",
    change: -0.85,
    sparkPoints: [8, 10, 14, 16, 18, 20, 22],
  },
  {
    ticker: "BTC",
    name: "Bitcoin",
    sector: "Crypto · Global",
    price: "$34,210.00",
    change: 4.5,
    sparkPoints: [20, 18, 16, 14, 10, 8, 6],
  },
];

const insightsData: InsightItem[] = [
  {
    tag: "Macro",
    tagColor: "blue",
    title: "Fed Maintains Rates: Impact on Growth Portfolios",
    time: "2 hours ago",
    readTime: "5 min read",
  },
  {
    tag: "Tech",
    tagColor: "green",
    title: "The Semiconductor Rally: Is It Sustainable?",
    time: "4 hours ago",
    readTime: "8 min read",
  },
  {
    tag: "Strategy",
    tagColor: "orange",
    title: "3 Diversification Strategies for Volatile Markets",
    time: "Yesterday",
    readTime: "12 min read",
  },
];

const allocationData = [
  { label: "Stocks", value: 55, bg: "bg-sky-500" },
  { label: "Bonds", value: 25, bg: "bg-rose-500" },
  { label: "Crypto", value: 20, bg: "bg-violet-500" },
];

const chartPath =
  "M0,140 C30,135 60,120 90,110 C120,100 150,105 180,85 C210,65 240,55 270,50 C300,45 330,60 360,70 C390,80 420,75 450,55 C470,40 490,30 500,25";
const chartAreaPath = `${chartPath} L500,180 L0,180 Z`;

// ✅ FIX: Explicitly typed as `Variants` and `ease` narrowed with `as const`
// so it matches Framer Motion's `Easing` union instead of widening to `string`.
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function DashboardContent() {
  const [activeRange, setActiveRange] = useState<TimeRange>("1M");
  const [mounted, setMounted] = useState(false);
  const gradientId = useId(); // Stable unique ID for SSR + client

  useEffect(() => {
    setMounted(true);
  }, []);

  const tagColorClasses = {
    blue: "bg-sky-100 text-sky-600",
    green: "bg-emerald-100 text-emerald-600",
    orange: "bg-amber-100 text-amber-600",
  };

  return (
    <div
      className="sticky left-0 m-auto flex h-screen w-screen flex-col overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent"
      suppressHydrationWarning
    >
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex flex-row items-center justify-between border-none bg-gradient-to-br from-blue-200 to-cyan-100 md:hidden">
        <div className="p-4">
          <IoIosNotifications className="text-[1.43em] font-bold text-cyan-900" />
        </div>
        <div className="flex h-auto w-auto rounded-full bg-cyan-900 p-4" />
      </div>

      {/* Main Content */}
      <div className="item-center flex w-full flex-col justify-evenly gap-4 border-none pb-6 pl-0 pr-1 pt-20 md:absolute md:top-0 md:pt-8 md:pr-[15%]">
        {/* Mobile Slider */}
        <div className="fixed left-0 right-0 top-9 z-40 flex h-3 w-auto rounded-md bg-slate-900/40 p-5 shadow-xl md:hidden">
          <Sliderr />
        </div>

        {/* Portfolio Header */}
        <motion.div
          className="mx-1 flex flex-col gap-4 rounded-2xl border border-white/20 bg-gradient-to-br from-blue-900 to-cyan-700 p-6 shadow-xl sm:flex-row sm:items-end sm:justify-between"
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={mounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-xl font-semibold text-white md:text-2xl">
              Portfolio Overview
            </h1>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                $1,248,590.32
              </span>
              <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-sm font-medium text-emerald-300">
                +12.4%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-cyan-300"
            >
              + Add Funds
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 shadow-lg backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
            >
              Export Report
            </motion.button>
          </div>
        </motion.div>

        {/* Top Grid */}
        <div className="grid gap-4 px-1 lg:grid-cols-5">
          {/* Performance History */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/95 p-5 shadow-xl backdrop-blur-sm lg:col-span-3"
            custom={0}
            variants={cardVariants}
            initial={mounted ? "hidden" : false}
            animate={mounted ? "visible" : false}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Performance History
              </h2>
              <div className="inline-flex rounded-lg bg-gray-100 p-1">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setActiveRange(range)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      activeRange === range
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-6 h-48 w-full">
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 500 180"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={chartAreaPath} fill={`url(#${gradientId})`} />
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="270"
                  cy="50"
                  r="4"
                  fill="white"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <line
                  x1="270"
                  y1="50"
                  x2="270"
                  y2="180"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </svg>

              <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg">
                <p className="text-[11px] text-gray-400">Oct 14, 2023</p>
                <p className="text-sm font-semibold text-gray-900">
                  $1,248,590
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[11px] text-gray-400">
                <span>Sep 20</span>
                <span>Oct 01</span>
                <span>Oct 14</span>
                <span>Today</span>
              </div>
            </div>
          </motion.div>

          {/* Asset Allocation */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/95 p-5 shadow-xl backdrop-blur-sm lg:col-span-2"
            custom={1}
            variants={cardVariants}
            initial={mounted ? "hidden" : false}
            animate={mounted ? "visible" : false}
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-base font-semibold text-gray-900">
              Asset Allocation
            </h2>
            <div className="mt-6 flex items-center gap-6 sm:gap-8">
              <div className="relative h-32 w-32 flex-shrink-0 sm:h-36 sm:w-36">
                <svg
                  className="h-full w-full -rotate-90"
                  viewBox="0 0 140 140"
                >
                  <circle
                    cx="70"
                    cy="70"
                    r="56"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="14"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="56"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="14"
                    strokeDasharray="193 352"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="56"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="14"
                    strokeDasharray="88 352"
                    strokeDashoffset="-193"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="56"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="14"
                    strokeDasharray="70 352"
                    strokeDashoffset="-281"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] text-gray-400">Total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    12 Assets
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {allocationData.map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.bg}`} />
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="ml-auto text-sm font-semibold text-gray-900">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Grid */}
        <div className="grid gap-4 px-1 lg:grid-cols-2">
          {/* Watchlist */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/95 p-5 shadow-xl backdrop-blur-sm"
            custom={2}
            variants={cardVariants}
            initial={mounted ? "hidden" : false}
            animate={mounted ? "visible" : false}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Watchlist
              </h2>
              <button className="text-sm text-gray-400 transition hover:text-gray-600">
                View All
              </button>
            </div>

            <div className="mt-4 divide-y divide-gray-50">
              {watchlistData.map((item) => {
                const isUp = item.change >= 0;
                const points = item.sparkPoints
                  .map(
                    (y, i) =>
                      `${(i / (item.sparkPoints.length - 1)) * 60},${y}`,
                  )
                  .join(" ");

                return (
                  <motion.div
                    key={item.ticker}
                    className="flex items-center gap-3 py-3.5"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                        item.ticker === "AAPL"
                          ? "bg-sky-50 text-sky-600"
                          : item.ticker === "TSLA"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-violet-50 text-violet-600"
                      }`}
                    >
                      {item.ticker}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">{item.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.price}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          isUp ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isUp ? "+" : ""}
                        {item.change}%
                      </p>
                    </div>
                    <svg
                      className="h-7 w-14 flex-shrink-0"
                      viewBox="0 0 60 28"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points={points}
                        fill="none"
                        stroke={isUp ? "#10b981" : "#f43f5e"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Market Insights */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/95 p-5 shadow-xl backdrop-blur-sm"
            custom={3}
            variants={cardVariants}
            initial={mounted ? "hidden" : false}
            animate={mounted ? "visible" : false}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Market Insights
              </h2>
              <button className="text-gray-400 transition hover:text-gray-600">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>

            <div className="mt-4 divide-y divide-gray-50">
              {insightsData.map((insight, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-3 py-3.5"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gray-400"
                    >
                      {idx === 0 && (
                        <>
                          <path d="M3 21h18" />
                          <path d="M5 21V7l8-4 8 4v14" />
                          <path d="M9 21v-6h6v6" />
                        </>
                      )}
                      {idx === 1 && (
                        <>
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <path d="M8 21h8m-4-4v4" />
                        </>
                      )}
                      {idx === 2 && (
                        <>
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                          <path d="M2 12l10 5 10-5" />
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tagColorClasses[insight.tagColor]}`}
                    >
                      {insight.tag}
                    </span>
                    <p className="mt-1 text-sm font-medium leading-snug text-gray-900">
                      {insight.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {insight.time} · {insight.readTime}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
