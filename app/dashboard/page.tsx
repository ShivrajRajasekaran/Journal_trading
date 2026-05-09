"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import WinRateTracker from "@/components/WinRateTracker";
import JournalTable from "@/components/JournalTable";
import type { Trade } from "@/lib/schema";

export default function DashboardPage() {
  const tradesQuery = useQuery<Trade[]>({
    queryKey: ["trades"],
    queryFn: async () => {
      const res = await fetch("/api/trades", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch trades");
      return res.json();
    },
  });

  const stats = useMemo(() => {
    const trades = tradesQuery.data || [];
    const total = trades.length;
    const wins = trades.filter((t) => t.result === "Win").length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const totalPnl = trades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
    return { total, wins, winRate, totalPnl };
  }, [tradesQuery.data]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track your paper trading progress toward the 65% win rate goal.
        </p>
      </div>

      {/* Win Rate Tracker */}
      {tradesQuery.isLoading ? (
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      ) : (
        <WinRateTracker
          total={stats.total}
          wins={stats.wins}
          winRate={stats.winRate}
          totalPnl={stats.totalPnl}
        />
      )}

      {/* Journal Table */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Trade Journal
        </h2>
        <JournalTable
          trades={tradesQuery.data || []}
          isLoading={tradesQuery.isLoading}
        />
      </div>
    </div>
  );
}
