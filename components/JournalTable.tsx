"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR } from "@/lib/utils";
import type { Trade } from "@/lib/schema";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import TradeForm from "./TradeForm";

type Props = {
  trades: Trade[];
  isLoading: boolean;
};

const PAGE_SIZE = 10;

export default function JournalTable({ trades, isLoading }: Props) {
  const [page, setPage] = useState(0);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [sortField, setSortField] = useState<"date" | "pnl" | "symbol">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSort = (field: "date" | "pnl" | "symbol") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  };

  const sorted = [...trades].sort((a, b) => {
    let cmp = 0;
    if (sortField === "date") cmp = a.date.localeCompare(b.date);
    else if (sortField === "pnl") cmp = parseFloat(a.pnl) - parseFloat(b.pnl);
    else if (sortField === "symbol") cmp = a.symbol.localeCompare(b.symbol);
    return sortDir === "desc" ? -cmp : cmp;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (editingTrade) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Edit Trade</h3>
        <TradeForm editTrade={editingTrade} onClose={() => setEditingTrade(null)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400">No trades logged yet. Start by adding your first trade!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <th
                className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary-600"
                onClick={() => handleSort("date")}
              >
                Date {sortField === "date" && (sortDir === "desc" ? "↓" : "↑")}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Market</th>
              <th
                className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary-600"
                onClick={() => handleSort("symbol")}
              >
                Symbol {sortField === "symbol" && (sortDir === "desc" ? "↓" : "↑")}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Strategy</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Result</th>
              <th
                className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary-600"
                onClick={() => handleSort("pnl")}
              >
                P&L {sortField === "pnl" && (sortDir === "desc" ? "↓" : "↑")}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Emotion</th>
              <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((trade) => {
              const pnl = parseFloat(trade.pnl);
              const rowBg =
                trade.result === "Win"
                  ? "bg-green-50/50 dark:bg-green-900/10"
                  : trade.result === "Loss"
                  ? "bg-red-50/50 dark:bg-red-900/10"
                  : "";
              return (
                <tr
                  key={trade.id}
                  className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${rowBg}`}
                >
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{trade.date}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{trade.market}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{trade.symbol}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{trade.strategy}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      trade.result === "Win"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : trade.result === "Loss"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    }`}>
                      {trade.result}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {formatINR(pnl)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{trade.emotion}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingTrade(trade)}
                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(trade.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
