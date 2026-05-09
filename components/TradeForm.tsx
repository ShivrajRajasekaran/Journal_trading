"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MARKETS, STRATEGIES, EMOTIONS, RESULTS, TradeFormData } from "@/lib/utils";
import type { Trade } from "@/lib/schema";

type Props = {
  editTrade?: Trade | null;
  onClose?: () => void;
};

const emptyForm: TradeFormData = {
  date: new Date().toISOString().split("T")[0],
  market: "",
  symbol: "",
  strategy: "",
  entryPrice: "",
  exitPrice: "",
  quantity: "",
  result: "",
  pnl: "",
  emotion: "",
  notes: "",
};

export default function TradeForm({ editTrade, onClose }: Props) {
  const [form, setForm] = useState<TradeFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TradeFormData, string>>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editTrade) {
      setForm({
        date: editTrade.date,
        market: editTrade.market,
        symbol: editTrade.symbol,
        strategy: editTrade.strategy,
        entryPrice: editTrade.entryPrice,
        exitPrice: editTrade.exitPrice,
        quantity: editTrade.quantity,
        result: editTrade.result,
        pnl: editTrade.pnl,
        emotion: editTrade.emotion,
        notes: editTrade.notes,
      });
    }
  }, [editTrade]);

  // Auto-calculate P&L
  useEffect(() => {
    const entry = parseFloat(form.entryPrice);
    const exit = parseFloat(form.exitPrice);
    const qty = parseFloat(form.quantity);
    if (!isNaN(entry) && !isNaN(exit) && !isNaN(qty) && entry > 0 && qty > 0) {
      const calculatedPnl = ((exit - entry) * qty).toFixed(2);
      setForm((prev) => ({ ...prev, pnl: calculatedPnl }));
    }
  }, [form.entryPrice, form.exitPrice, form.quantity]);

  const mutation = useMutation({
    mutationFn: async (data: TradeFormData) => {
      const url = editTrade ? `/api/trades/${editTrade.id}` : "/api/trades";
      const method = editTrade ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save trade");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      if (!editTrade) setForm(emptyForm);
      if (onClose) onClose();
    },
  });

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TradeFormData, string>> = {};
    if (!form.date) newErrors.date = "Required";
    if (!form.market) newErrors.market = "Select a market";
    if (!form.symbol.trim()) newErrors.symbol = "Required";
    if (!form.strategy) newErrors.strategy = "Select a strategy";
    if (!form.entryPrice || parseFloat(form.entryPrice) <= 0) newErrors.entryPrice = "Must be > 0";
    if (!form.exitPrice || parseFloat(form.exitPrice) < 0) newErrors.exitPrice = "Must be >= 0";
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = "Must be > 0";
    if (!form.result) newErrors.result = "Select a result";
    if (form.pnl === "") newErrors.pnl = "Required";
    if (!form.emotion) newErrors.emotion = "Select an emotion";
    if (!form.notes || form.notes.trim().length < 10) newErrors.notes = "Min 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      mutation.mutate(form);
    }
  };

  const inputClass = (field: keyof TradeFormData) =>
    `w-full px-3 py-2 rounded-lg border ${
      errors[field]
        ? "border-red-400 dark:border-red-500"
        : "border-slate-300 dark:border-slate-600"
    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={inputClass("date")}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Market */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Market
          </label>
          <select
            value={form.market}
            onChange={(e) => setForm({ ...form, market: e.target.value })}
            className={inputClass("market")}
          >
            <option value="">Select market...</option>
            {MARKETS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {errors.market && <p className="text-red-500 text-xs mt-1">{errors.market}</p>}
        </div>

        {/* Symbol */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Symbol
          </label>
          <input
            type="text"
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            placeholder="e.g., NIFTY, BTC"
            className={inputClass("symbol")}
          />
          {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>}
        </div>

        {/* Strategy */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Strategy
          </label>
          <select
            value={form.strategy}
            onChange={(e) => setForm({ ...form, strategy: e.target.value })}
            className={inputClass("strategy")}
          >
            <option value="">Select strategy...</option>
            {STRATEGIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.strategy && <p className="text-red-500 text-xs mt-1">{errors.strategy}</p>}
        </div>

        {/* Entry Price */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Entry Price
          </label>
          <input
            type="number"
            step="0.01"
            value={form.entryPrice}
            onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
            placeholder="0.00"
            className={inputClass("entryPrice")}
          />
          {errors.entryPrice && <p className="text-red-500 text-xs mt-1">{errors.entryPrice}</p>}
        </div>

        {/* Exit Price */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Exit Price
          </label>
          <input
            type="number"
            step="0.01"
            value={form.exitPrice}
            onChange={(e) => setForm({ ...form, exitPrice: e.target.value })}
            placeholder="0.00"
            className={inputClass("exitPrice")}
          />
          {errors.exitPrice && <p className="text-red-500 text-xs mt-1">{errors.exitPrice}</p>}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Quantity / Lots
          </label>
          <input
            type="number"
            step="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="1"
            className={inputClass("quantity")}
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>

        {/* Result */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Result
          </label>
          <div className="flex gap-4 mt-2">
            {RESULTS.map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="result"
                  value={r}
                  checked={form.result === r}
                  onChange={(e) => setForm({ ...form, result: e.target.value })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className={`text-sm ${
                  r === "Win" ? "text-green-600 dark:text-green-400" :
                  r === "Loss" ? "text-red-600 dark:text-red-400" :
                  "text-slate-600 dark:text-slate-400"
                }`}>
                  {r}
                </span>
              </label>
            ))}
          </div>
          {errors.result && <p className="text-red-500 text-xs mt-1">{errors.result}</p>}
        </div>

        {/* P&L */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            P&L Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            value={form.pnl}
            onChange={(e) => setForm({ ...form, pnl: e.target.value })}
            placeholder="Auto-calculated or enter manually"
            className={inputClass("pnl")}
          />
          {errors.pnl && <p className="text-red-500 text-xs mt-1">{errors.pnl}</p>}
        </div>

        {/* Emotion */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Emotion During Trade
          </label>
          <select
            value={form.emotion}
            onChange={(e) => setForm({ ...form, emotion: e.target.value })}
            className={inputClass("emotion")}
          >
            <option value="">Select emotion...</option>
            {EMOTIONS.map((em) => (
              <option key={em} value={em}>{em}</option>
            ))}
          </select>
          {errors.emotion && <p className="text-red-500 text-xs mt-1">{errors.emotion}</p>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Lesson Learned / Notes
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          placeholder="What did you learn from this trade? (min 10 characters)"
          className={inputClass("notes")}
        />
        {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending
            ? "Saving..."
            : editTrade
            ? "Update Trade"
            : "Log Trade"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {mutation.isError && (
        <p className="text-red-500 text-sm">
          {mutation.error instanceof Error ? mutation.error.message : "Something went wrong"}
        </p>
      )}
      {mutation.isSuccess && !editTrade && (
        <p className="text-green-600 dark:text-green-400 text-sm">Trade logged successfully!</p>
      )}
    </form>
  );
}
