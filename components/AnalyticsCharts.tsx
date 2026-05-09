"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Stats = {
  winRateByStrategy: { strategy: string; winRate: number; total: number }[];
  winRateByEmotion: { emotion: string; winRate: number; total: number }[];
  equityCurve: { date: string; pnl: number; symbol: string }[];
  wins: number;
  losses: number;
  breakevens: number;
};

const COLORS = ["#22c55e", "#ef4444", "#94a3b8"];

export default function AnalyticsCharts({ stats }: { stats: Stats }) {
  const pieData = [
    { name: "Wins", value: stats.wins },
    { name: "Losses", value: stats.losses },
    { name: "Breakeven", value: stats.breakevens },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Equity Curve */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Cumulative P&L (Equity Curve)
        </h3>
        {stats.equityCurve.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.equityCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Cumulative P&L"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-center py-12">No data yet</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate by Strategy */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Win Rate by Strategy
          </h3>
          {stats.winRateByStrategy.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.winRateByStrategy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="strategy" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-20} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="winRate" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Win Rate %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-12">No data yet</p>
          )}
        </div>

        {/* Win Rate by Emotion */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Win Rate by Emotion
          </h3>
          {stats.winRateByEmotion.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.winRateByEmotion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="emotion" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-20} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="winRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Win Rate %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-12">No data yet</p>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Win / Loss / Breakeven
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-12">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
