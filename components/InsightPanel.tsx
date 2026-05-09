"use client";

import { Lightbulb } from "lucide-react";
import { formatINR } from "@/lib/utils";

type Stats = {
  total: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  winRateByEmotion: { emotion: string; winRate: number; total: number }[];
  winRateByStrategy: { strategy: string; winRate: number; total: number }[];
  totalPnl: number;
};

export default function InsightPanel({ stats }: { stats: Stats }) {
  const insights: string[] = [];

  if (stats.total === 0) {
    return null;
  }

  // Emotion insight
  const calmEmotion = stats.winRateByEmotion.find((e) => e.emotion === "Calm");
  const fomoEmotion = stats.winRateByEmotion.find((e) => e.emotion === "FOMO");
  if (calmEmotion && fomoEmotion && calmEmotion.total >= 3 && fomoEmotion.total >= 3) {
    insights.push(
      `Your win rate when Calm is ${calmEmotion.winRate.toFixed(0)}% vs. ${fomoEmotion.winRate.toFixed(0)}% when FOMO. ${
        calmEmotion.winRate > fomoEmotion.winRate
          ? "Avoid trading emotionally."
          : "Interesting — your FOMO trades perform better. Investigate why."
      }`
    );
  }

  // Win/Loss ratio insight
  if (stats.avgWin > 0 && stats.avgLoss > 0) {
    const ratio = stats.avgWin / stats.avgLoss;
    if (ratio >= 1.5) {
      insights.push(
        `Your average win (${formatINR(stats.avgWin)}) is ${ratio.toFixed(1)}x larger than your average loss (${formatINR(stats.avgLoss)}). This is a healthy risk-reward ratio.`
      );
    } else if (ratio < 1) {
      insights.push(
        `Your average loss (${formatINR(stats.avgLoss)}) exceeds your average win (${formatINR(stats.avgWin)}). Consider tightening stop losses or letting winners run longer.`
      );
    }
  }

  // Best strategy
  const strategiesWithEnoughData = stats.winRateByStrategy.filter((s) => s.total >= 3);
  if (strategiesWithEnoughData.length > 1) {
    const best = [...strategiesWithEnoughData].sort((a, b) => b.winRate - a.winRate)[0];
    const worst = [...strategiesWithEnoughData].sort((a, b) => a.winRate - b.winRate)[0];
    if (best.winRate !== worst.winRate) {
      insights.push(
        `Best performing strategy: "${best.strategy}" at ${best.winRate.toFixed(0)}% win rate (${best.total} trades). Worst: "${worst.strategy}" at ${worst.winRate.toFixed(0)}%.`
      );
    }
  }

  // Profit factor
  if (stats.profitFactor > 0 && stats.profitFactor !== Infinity) {
    if (stats.profitFactor >= 2) {
      insights.push(
        `Your profit factor is ${stats.profitFactor.toFixed(2)} — for every ₹1 lost, you make ₹${stats.profitFactor.toFixed(2)}. Excellent risk management.`
      );
    } else if (stats.profitFactor < 1) {
      insights.push(
        `Your profit factor is ${stats.profitFactor.toFixed(2)} (below 1.0). You're losing more than you're making overall. Focus on cutting losses short.`
      );
    }
  }

  // Progress insight
  if (stats.total < 100) {
    const remaining = 100 - stats.total;
    insights.push(
      `${remaining} more trades to reach your 100-trade milestone. Current win rate: ${stats.winRate.toFixed(1)}%. ${
        stats.winRate >= 65 ? "You're on track!" : `Need to improve by ${(65 - stats.winRate).toFixed(1)} percentage points to hit 65%.`
      }`
    );
  }

  if (insights.length === 0) {
    insights.push("Keep logging trades to unlock personalized insights. You need at least 3 trades per category for meaningful analysis.");
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        Insights
      </h3>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <li
            key={i}
            className="text-sm text-slate-700 dark:text-slate-300 pl-4 border-l-2 border-primary-400 dark:border-primary-600"
          >
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}
