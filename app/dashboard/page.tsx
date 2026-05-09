"use client";

import { useQuery } from "@tanstack/react-query";
import WinRateTracker from "@/components/WinRateTracker";
import JournalTable from "@/components/JournalTable";
import type { Trade } from "@/lib/schema";

type Stats = {
  total: number;
  wins: number;
  winRate: number;
  totalPnl: number;
};

export default function DashboardPage() {
  const tradesQuery = useQuery<Trade[]>({
    queryKey: ["trades"],
    queryFn: async () => {
      const res = await fetch("/api/trades", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch trades");
      return res.json();
    },
  });

  const statsQuery = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track your paper trading progress toward the 65% win rate goal.
        </p>
      </div>

      {/* Win Rate Tracker */}
      {statsQuery.isLoading ? (
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      ) : statsQuery.data ? (
        <WinRateTracker
          total={statsQuery.data.total}
          wins={statsQuery.data.wins}
          winRate={statsQuery.data.winRate}
          totalPnl={statsQuery.data.totalPnl}
        />
      ) : null}

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
