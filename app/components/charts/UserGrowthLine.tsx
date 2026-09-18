"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TimeseriesPoint {
  date: string;
  count: number;
}

interface UserGrowthLineProps {
  className?: string;
  /** How many days back to display. Default 30. */
  days?: number;
}

export default function UserGrowthLine({
  className = "",
  days = 30,
}: UserGrowthLineProps) {
  const [data, setData] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("auth_token");
        const res = await fetch("/api/admin/stats/timeseries", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const json = await res.json();
        if (cancelled) return;

        if (json.success && Array.isArray(json.data)) {
          setData(json.data);
        } else {
          setData([]);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[UserGrowthLine] load error:", err);
        setError("Failed to load growth data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Loading -----------------------------------------------------------
  if (loading) {
    return (
      <div className={`flex h-64 items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs text-cyan-600">Loading growth...</span>
        </div>
      </div>
    );
  }

  // ---- Error -------------------------------------------------------------
  if (error) {
    return (
      <div
        className={`flex h-64 items-center justify-center text-sm text-red-600 ${className}`}
      >
        {error}
      </div>
    );
  }

  // ---- No data -----------------------------------------------------------
  const hasAnySignups = data.some((d) => d.count > 0);
  if (!hasAnySignups) {
    return (
      <div
        className={`flex h-64 flex-col items-center justify-center gap-1 text-center ${className}`}
      >
        <span className="text-sm text-cyan-700">No signups yet</span>
        <span className="text-xs text-cyan-600">
          Growth will appear once users register
        </span>
      </div>
    );
  }

  // ---- Chart -------------------------------------------------------------
  const visible = data.slice(-days);

  return (
    <div className={className}>
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visible}
            margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="userGrowthStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#cffafe"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="#0891b2"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#cffafe" }}
              tickFormatter={(value) => {
                // value is 'YYYY-MM-DD' — show 'MMM D'
                const [, m, d] = String(value).split("-");
                if (!m || !d) return value;
                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                const monthIdx = parseInt(m, 10) - 1;
                return `${monthNames[monthIdx] ?? m} ${parseInt(d, 10)}`;
              }}
              interval="preserveStartEnd"
              minTickGap={24}
            />

            <YAxis
              stroke="#0891b2"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={32}
            />

            <Tooltip
              cursor={{ stroke: "#0ea5e9", strokeDasharray: "3 3" }}
              contentStyle={{
                background: "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "0.75rem",
                padding: "0.5rem 0.75rem",
              }}
              labelFormatter={(value) => {
                const [y, m, d] = String(value).split("-");
                if (!y || !m || !d) return String(value);
                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                const monthIdx = parseInt(m, 10) - 1;
                return `${monthNames[monthIdx] ?? m} ${parseInt(d, 10)}, ${y}`;
              }}
              formatter={(value) => {
                const n = typeof value === "number" ? value : Number(value);
                return [`${n} signup${n === 1 ? "" : "s"}`, ""];
              }}
            />

            <Line
              type="monotone"
              dataKey="count"
              stroke="url(#userGrowthStroke)"
              strokeWidth={2.5}
              dot={{ r: 2, fill: "#06b6d4", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
              animationBegin={200}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}