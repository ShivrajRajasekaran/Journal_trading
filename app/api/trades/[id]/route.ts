import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

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

    const updated = await db
      .update(trades)
      .set({
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
      })
      .where(eq(trades.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const deleted = await db
      .delete(trades)
      .where(eq(trades.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Trade deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete trade" },
      { status: 500 }
    );
  }
}
