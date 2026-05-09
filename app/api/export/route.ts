import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/schema";
import { desc } from "drizzle-orm";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allTrades = await db.select().from(trades).orderBy(desc(trades.date), desc(trades.id));

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: All Trades
    const sheet1 = workbook.addWorksheet("Trades");
    sheet1.columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Market", key: "market", width: 15 },
      { header: "Symbol", key: "symbol", width: 12 },
      { header: "Strategy", key: "strategy", width: 15 },
      { header: "Entry Price", key: "entryPrice", width: 12 },
      { header: "Exit Price", key: "exitPrice", width: 12 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Result", key: "result", width: 10 },
      { header: "P&L", key: "pnl", width: 12 },
      { header: "Emotion", key: "emotion", width: 15 },
      { header: "Notes", key: "notes", width: 40 },
    ];

    sheet1.getRow(1).font = { bold: true };

    allTrades.forEach((trade) => {
      const row = sheet1.addRow({
        date: trade.date,
        market: trade.market,
        symbol: trade.symbol,
        strategy: trade.strategy,
        entryPrice: parseFloat(trade.entryPrice),
        exitPrice: parseFloat(trade.exitPrice),
        quantity: parseFloat(trade.quantity),
        result: trade.result,
        pnl: parseFloat(trade.pnl),
        emotion: trade.emotion,
        notes: trade.notes,
      });

      if (trade.result === "Win") {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD4EDDA" },
          };
        });
      } else if (trade.result === "Loss") {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8D7DA" },
          };
        });
      }
    });

    // Sheet 2: Summary Statistics
    const sheet2 = workbook.addWorksheet("Summary");
    const total = allTrades.length;
    const wins = allTrades.filter((t) => t.result === "Win");
    const losses = allTrades.filter((t) => t.result === "Loss");
    const totalPnl = allTrades.reduce((s, t) => s + parseFloat(t.pnl), 0);
    const winRate = total > 0 ? (wins.length / total) * 100 : 0;
    const avgWin = wins.length > 0
      ? wins.reduce((s, t) => s + parseFloat(t.pnl), 0) / wins.length
      : 0;
    const avgLoss = losses.length > 0
      ? Math.abs(losses.reduce((s, t) => s + parseFloat(t.pnl), 0) / losses.length)
      : 0;

    sheet2.columns = [
      { header: "Metric", key: "metric", width: 25 },
      { header: "Value", key: "value", width: 20 },
    ];
    sheet2.getRow(1).font = { bold: true };

    const summaryData = [
      { metric: "Total Trades", value: total },
      { metric: "Total Wins", value: wins.length },
      { metric: "Total Losses", value: losses.length },
      { metric: "Win Rate (%)", value: winRate.toFixed(2) },
      { metric: "Total P&L (₹)", value: totalPnl.toFixed(2) },
      { metric: "Average Win (₹)", value: avgWin.toFixed(2) },
      { metric: "Average Loss (₹)", value: avgLoss.toFixed(2) },
      { metric: "Win-to-Loss Ratio", value: avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "N/A" },
    ];
    summaryData.forEach((row) => sheet2.addRow(row));

    // Sheet 3: Win Rate Progress
    const sheet3 = workbook.addWorksheet("Progress");
    sheet3.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Status", key: "status", width: 20 },
    ];
    sheet3.getRow(1).font = { bold: true };

    const progressData = [
      { metric: "Trades Completed", status: `${total} / 100` },
      { metric: "Win Rate", status: `${winRate.toFixed(1)}%` },
      { metric: "Target Win Rate", status: "65%" },
      { metric: "Ready for Live Trading?", status: winRate >= 65 && total >= 100 ? "YES" : "NO" },
    ];
    progressData.forEach((row) => sheet3.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=trading-journal.xlsx",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 }
    );
  }
}
