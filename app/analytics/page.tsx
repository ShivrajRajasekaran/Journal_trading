"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import InsightPanel from "@/components/InsightPanel";
import ReadinessChecklist from "@/components/ReadinessChecklist";
import { formatINR } from "@/lib/utils";

type Stats = {
  total: number;
  wins: number;
  losses: number;
  breakevens: number;
  totalPnl: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  winToLossRatio: number;
  winRateByStrategy: { strategy: string; winRate: number; total: number }[];
  winRateByEmotion: { emotion: string; winRate: number; total: number }[];
  equityCurve: { date: string; pnl: number; symbol: string }[];
  calmConfidentWinRate: number;
  largestLoss: number;
};

export default function AnalyticsPage() {
  const [startingCapital, setStartingCapital] = useState(100000);

  useEffect(() => {
    const saved = localStorage.getItem("startingCapital");
    if (saved) setStartingCapital(parseFloat(saved));
  }, []);

  const statsQuery = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const handleExport = async () => {
    const res = await fetch("/api/export");
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trading-journal.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (statsQuery.isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  if (!stats) return null;

  const summaryCards = [
    { label: "Total P&L", value: formatINR(stats.totalPnl), color: stats.totalPnl >= 0 ? "text-green-600" : "text-red-600" },
    { label: "Total Wins", value: String(stats.wins), color: "text-green-600" },
    { label: "Total Losses", value: String(stats.losses), color: "text-red-600" },
    { label: "Win Rate", value: `${stats.winRate.toFixed(1)}%`, color: stats.winRate >= 65 ? "text-green-600" : "text-amber-600" },
    { label: "Avg Win", value: formatINR(stats.avgWin), color: "text-green-600" },
    { label: "Avg Loss", value: formatINR(stats.avgLoss), color: "text-red-600" },
    { label: "Win:Loss Ratio", value: stats.winToLossRatio === Infinity ? "∞" : stats.winToLossRatio.toFixed(2), color: "text-primary-600" },
    { label: "Profit Factor", value: stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2), color: "text-primary-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep dive into your trading performance.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {card.label}
            </p>
            <p className={`text-xl font-bold mt-1 ${card.color} dark:opacity-90`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts stats={stats} />

      {/* Insights + Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightPanel stats={stats} />
        <ReadinessChecklist stats={stats} startingCapital={startingCapital} />
      </div>
    </div>
  );
}
