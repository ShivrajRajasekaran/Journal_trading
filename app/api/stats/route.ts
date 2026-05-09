import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allTrades = await db.select().from(trades).orderBy(asc(trades.date), asc(trades.id));

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

    // Win rate by strategy
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

    // Win rate by emotion
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

    // Cumulative P&L over time
    let cumulative = 0;
    const equityCurve = allTrades.map((t) => {
      cumulative += parseFloat(t.pnl);
      return {
        date: t.date,
        pnl: cumulative,
        symbol: t.symbol,
      };
    });

    // Calm/Confident win rate for readiness check
    const calmConfidentTrades = allTrades.filter(
      (t) => t.emotion === "Calm" || t.emotion === "Confident"
    );
    const calmConfidentWins = calmConfidentTrades.filter((t) => t.result === "Win").length;
    const calmConfidentWinRate = calmConfidentTrades.length > 0
      ? (calmConfidentWins / calmConfidentTrades.length) * 100
      : 0;

    // Largest single loss
    const largestLoss = losses.length > 0
      ? Math.max(...losses.map((t) => Math.abs(parseFloat(t.pnl))))
      : 0;

    return NextResponse.json({
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
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to compute statistics" },
      { status: 500 }
    );
  }
}
