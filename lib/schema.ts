import { pgTable, serial, date, varchar, numeric, text, timestamp } from "drizzle-orm/pg-core";

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  market: varchar("market", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 30 }).notNull(),
  strategy: varchar("strategy", { length: 50 }).notNull(),
  entryPrice: numeric("entry_price").notNull(),
  exitPrice: numeric("exit_price").notNull(),
  quantity: numeric("quantity").notNull(),
  result: varchar("result", { length: 20 }).notNull(),
  pnl: numeric("pnl").notNull(),
  emotion: varchar("emotion", { length: 30 }).notNull(),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
