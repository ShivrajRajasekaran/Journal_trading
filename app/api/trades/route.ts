import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allTrades = await db.select().from(trades).orderBy(desc(trades.date), desc(trades.id));
    return NextResponse.json(allTrades);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { date, market, symbol, strategy, entryPrice, exitPrice, quantity, result, pnl, emotion, notes } = body;

    if (!date || !market || !symbol || !strategy || !entryPrice || !exitPrice || !quantity || !result || pnl === undefined || !emotion || !notes) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (notes.length < 10) {
      return NextResponse.json(
        { error: "Notes must be at least 10 characters" },
        { status: 400 }
      );
    }

    const newTrade = await db.insert(trades).values({
      date,
      market,
      symbol: symbol.toUpperCase(),
      strategy,
      entryPrice: String(entryPrice),
      exitPrice: String(exitPrice),
      quantity: String(quantity),
      result,
      pnl: String(pnl),
      emotion,
      notes,
    }).returning();

    return NextResponse.json(newTrade[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}
