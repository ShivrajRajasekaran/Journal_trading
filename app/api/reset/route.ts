import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    await db.delete(trades);
    return NextResponse.json({ message: "All trades deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reset journal" },
      { status: 500 }
    );
  }
}
