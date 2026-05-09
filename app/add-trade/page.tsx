"use client";

import TradeForm from "@/components/TradeForm";

export default function AddTradePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add Trade</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Log a new paper trade. All fields are required.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <TradeForm />
      </div>
    </div>
  );
}
