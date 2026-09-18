"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface UserHealthDonutProps {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  className?: string;
}

// Fixed colors so the donut and the legend always match
const COLORS = {
  active: "#10b981",   // emerald
  inactive: "#f59e0b", // amber
  locked: "#ef4444",   // red
};

export default function UserHealthDonut({
  totalUsers,
  activeUsers,
  lockedUsers,
  className = "",
}: UserHealthDonutProps) {
  // Compute inactive as "everyone else" — floored at 0 in case the
  // numbers ever drift (e.g. locked counted inside active by accident).
  const inactiveUsers = Math.max(0, totalUsers - activeUsers - lockedUsers);

  const chartData = [
    { name: "Active", value: activeUsers, color: COLORS.active },
    { name: "Inactive", value: inactiveUsers, color: COLORS.inactive },
    { name: "Locked", value: lockedUsers, color: COLORS.locked },
  ].filter((d) => d.value > 0); // hide zero slices so the donut doesn't render blank arcs

  const hasData = chartData.length > 0;

  return (
    <div className={className}>
      {/* Chart */}
      <div className="relative h-56 w-full sm:h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="85%"
                paddingAngle={2}
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
                    return [`${n} user${n === 1 ? "" : "s"}`, ""] as [string, string];
                  }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-cyan-600">
            No user data yet
          </div>
        )}

        {/* Center label */}
        {hasData && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] uppercase tracking-wide text-cyan-600">
              Total
            </span>
            <span className="text-2xl font-bold text-cyan-900">
              {totalUsers}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        <LegendRow
          color={COLORS.active}
          label="Active"
          value={activeUsers}
        />
        <LegendRow
          color={COLORS.inactive}
          label="Inactive"
          value={inactiveUsers}
        />
        <LegendRow
          color={COLORS.locked}
          label="Locked"
          value={lockedUsers}
        />
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