export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? "-" : ""}₹${formatted}`;
}

export const MARKETS = [
  "NSE Options",
  "NSE Stocks",
  "Crypto Options",
  "Crypto Futures",
  "Other",
] as const;

export const STRATEGIES = [
  "Buy Call",
  "Buy Put",
  "Sell Call",
  "Sell Put",
  "Bull Spread",
  "Bear Spread",
  "Iron Condor",
  "Straddle",
  "Scalp",
  "Other",
] as const;

export const EMOTIONS = [
  "Calm",
  "Confident",
  "FOMO",
  "Revenge Trade",
  "Greedy",
  "Fearful",
  "Neutral",
] as const;

export const RESULTS = ["Win", "Loss", "Breakeven"] as const;

export type TradeFormData = {
  date: string;
  market: string;
  symbol: string;
  strategy: string;
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  result: string;
  pnl: string;
  emotion: string;
  notes: string;
};
