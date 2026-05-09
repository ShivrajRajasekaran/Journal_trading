"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import InsightPanel from "@/components/InsightPanel";
import ReadinessChecklist from "@/components/ReadinessChecklist";
import { formatINR } from "@/lib/utils";
import type { Trade } from "@/lib/schema";

export default function AnalyticsPage() {
  const [startingCapital, setStartingCapital] = useState(100000);

  useEffect(() => {
    const saved = localStorage.getItem("startingCapital");
    if (saved) setStartingCapital(parseFloat(saved));
  }, []);

  const tradesQuery = useQuery<Trade[]>({
    queryKey: ["trades"],
    queryFn: async () => {
      const res = await fetch("/api/trades", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch trades");
      return res.json();
    },
  });

  const stats = useMemo(() => {
    const allTrades = [...(tradesQuery.data || [])].sort(
      (a, b) => a.date.localeCompare(b.date) || a.id - b.id
    );
    const total = allTrades.length;
    const wins = allTrades.filter((t) => t.result === "Win");
    const losses = allTrades.filter((t) => t.result === "Loss");
    const breakevens = allTrades.filter((t) => t.result === "Breakeven");

    const totalPnl = allTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
    const winRate = total > 0 ? (wins.length / total) * 100 : 0;

    const avgWin = wins.length > 0
      ? wins.reduce((sum, t) => sum + parseFloat(t.pnl), 0) / wins.length
      : 0;
    const avgLoss = losses.length > 0
      ? Math.abs(losses.reduce((sum, t) => sum + parseFloat(t.pnl), 0) / losses.length)
      : 0;

    const grossProfit = wins.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + parseFloat(t.pnl), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const winToLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    const strategies = [...new Set(allTrades.map((t) => t.strategy))];
    const winRateByStrategy = strategies.map((strategy) => {
      const stratTrades = allTrades.filter((t) => t.strategy === strategy);
      const stratWins = stratTrades.filter((t) => t.result === "Win").length;
      return {
        strategy,
        winRate: stratTrades.length > 0 ? (stratWins / stratTrades.length) * 100 : 0,
        total: stratTrades.length,
      };
    });

    const emotions = [...new Set(allTrades.map((t) => t.emotion))];
    const winRateByEmotion = emotions.map((emotion) => {
      const emotionTrades = allTrades.filter((t) => t.emotion === emotion);
      const emotionWins = emotionTrades.filter((t) => t.result === "Win").length;
      return {
        emotion,
        winRate: emotionTrades.length > 0 ? (emotionWins / emotionTrades.length) * 100 : 0,
        total: emotionTrades.length,
      };
    });

    let cumulative = 0;
    const equityCurve = allTrades.map((t) => {
      cumulative += parseFloat(t.pnl);
      return { date: t.date, pnl: cumulative, symbol: t.symbol };
    });

    const calmConfidentTrades = allTrades.filter(
      (t) => t.emotion === "Calm" || t.emotion === "Confident"
    );
    const calmConfidentWins = calmConfidentTrades.filter((t) => t.result === "Win").length;
    const calmConfidentWinRate = calmConfidentTrades.length > 0
      ? (calmConfidentWins / calmConfidentTrades.length) * 100
      : 0;

    const largestLoss = losses.length > 0
      ? Math.max(...losses.map((t) => Math.abs(parseFloat(t.pnl))))
      : 0;

    return {
      total,
      wins: wins.length,
      losses: losses.length,
      breakevens: breakevens.length,
      totalPnl,
      winRate,
      avgWin,
      avgLoss,
      grossProfit,
      grossLoss,
      profitFactor,
      winToLossRatio,
      winRateByStrategy,
      winRateByEmotion,
      equityCurve,
      calmConfidentWinRate,
      largestLoss,
    };
  }, [tradesQuery.data]);

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

  if (tradesQuery.isLoading) {
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
