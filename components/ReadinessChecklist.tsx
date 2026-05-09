"use client";

import { CheckCircle2, Circle, Trophy } from "lucide-react";

type Stats = {
  total: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  calmConfidentWinRate: number;
  largestLoss: number;
};

type Props = {
  stats: Stats;
  startingCapital: number;
};

export default function ReadinessChecklist({ stats, startingCapital }: Props) {
  const maxLossPercent = startingCapital > 0 ? (stats.largestLoss / startingCapital) * 100 : 0;

  const checks = [
    {
      label: "100 paper trades completed",
      passed: stats.total >= 100,
      detail: `${stats.total} / 100 trades`,
    },
    {
      label: "Win rate is 65% or above",
      passed: stats.winRate >= 65,
      detail: `${stats.winRate.toFixed(1)}%`,
    },
    {
      label: "Total P&L is positive",
      passed: stats.totalPnl > 0,
      detail: stats.totalPnl > 0 ? "Positive" : "Negative",
    },
    {
      label: "Average win is larger than average loss",
      passed: stats.avgWin > stats.avgLoss,
      detail: stats.avgLoss > 0 ? `${(stats.avgWin / stats.avgLoss).toFixed(2)}x` : "N/A",
    },
    {
      label: "Win rate when emotionally stable (Calm/Confident) is above 65%",
      passed: stats.calmConfidentWinRate >= 65,
      detail: `${stats.calmConfidentWinRate.toFixed(1)}%`,
    },
    {
      label: "No single loss exceeds 5% of starting capital",
      passed: startingCapital > 0 ? maxLossPercent <= 5 : false,
      detail: startingCapital > 0 ? `Max loss: ${maxLossPercent.toFixed(1)}%` : "Set capital in Settings",
    },
  ];

  const allPassed = checks.every((c) => c.passed);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" />
        Readiness Checklist
      </h3>

      <ul className="space-y-3">
        {checks.map((check, i) => (
          <li key={i} className="flex items-start gap-3">
            {check.passed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm ${check.passed ? "text-green-700 dark:text-green-400" : "text-slate-700 dark:text-slate-300"}`}>
                {check.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      {allPassed && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
            ✅ All criteria met! You are ready for live trading.
          </p>
        </div>
      )}

      {!allPassed && (
        <div className="mt-6 p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
          <p className="text-amber-800 dark:text-amber-300 font-medium text-sm">
            {checks.filter((c) => c.passed).length} / {checks.length} criteria met. Keep practicing!
          </p>
        </div>
      )}
    </div>
  );
}
