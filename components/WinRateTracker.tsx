"use client";

import { formatINR } from "@/lib/utils";

type Props = {
  total: number;
  wins: number;
  winRate: number;
  totalPnl: number;
};

export default function WinRateTracker({ total, wins, winRate, totalPnl }: Props) {
  const progressPercent = Math.min(total, 100);
  const bannerColor =
    winRate >= 65
      ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
      : winRate >= 50
      ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700"
      : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700";

  const bannerTextColor =
    winRate >= 65
      ? "text-green-800 dark:text-green-300"
      : winRate >= 50
      ? "text-amber-800 dark:text-amber-300"
      : "text-red-800 dark:text-red-300";

  return (
    <div className={`rounded-xl border p-6 ${bannerColor}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className={`text-2xl font-bold ${bannerTextColor}`}>
            {winRate.toFixed(1)}% Win Rate
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {wins} wins out of {total} trades &middot; Total P&L: {formatINR(totalPnl)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            {total} / 100
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">orders completed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
            winRate >= 65
              ? "bg-green-500"
              : winRate >= 50
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
          style={{ width: `${winRate}%` }}
        />
        {/* 65% marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-900 dark:bg-white opacity-60"
          style={{ left: "65%" }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-500">0%</span>
        <span className="text-xs text-slate-500 font-medium" style={{ marginLeft: "30%" }}>
          65% Target
        </span>
        <span className="text-xs text-slate-500">100%</span>
      </div>

      {/* Progress toward 100 trades */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Trade progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Readiness message */}
      <p className={`mt-4 text-sm font-medium ${bannerTextColor}`}>
        {winRate >= 65 && total >= 100
          ? "✅ You have reached your target! You may consider transitioning to live trading."
          : "Keep practicing — not ready for live trading yet."}
      </p>
    </div>
  );
}
