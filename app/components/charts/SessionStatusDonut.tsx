"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SessionStatusDonutProps {
  activeCount: number;
  totalCount: number;
  className?: string;
}

const COLORS = {
  active: "#10b981", // emerald
  ended: "#94a3b8",  // slate
};

export default function SessionStatusDonut({
  activeCount,
  totalCount,
  className = "",
}: SessionStatusDonutProps) {
  // Ended = everyone who isn't currently active. Floored at 0.
  const endedCount = Math.max(0, totalCount - activeCount);

  const chartData = [
    { name: "Active", value: activeCount, color: COLORS.active },
    { name: "Ended", value: endedCount, color: COLORS.ended },
  ].filter((d) => d.value > 0);

  const hasData = chartData.length > 0;

  return (
    <div className={className}>
      {/* Chart */}
      <div className="relative h-48 w-full sm:h-56">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={3}
                stroke="none"
                animationBegin={150}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  border: "none",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "0.75rem",
                  padding: "0.5rem 0.75rem",
                }}
                formatter={(value) => {
                  const n = typeof value === "number" ? value : Number(value);
                  return [`${n} session${n === 1 ? "" : "s"}`, ""];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-cyan-600">
            No session data yet
          </div>
        )}

        {/* Center label — shows active count big */}
        {hasData && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] uppercase tracking-wide text-cyan-600">
              Active
            </span>
            <span className="text-2xl font-bold text-emerald-600">
              {activeCount}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-2">
        <LegendRow color={COLORS.active} label="Active" value={activeCount} />
        <LegendRow color={COLORS.ended} label="Ended" value={endedCount} />
      </div>
    </div>
  );
}

// ---- Legend row --------------------------------------------------------

function LegendRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-cyan-700">{label}</span>
      <span className="ml-auto font-semibold text-cyan-900">{value}</span>
    </div>
  );
}