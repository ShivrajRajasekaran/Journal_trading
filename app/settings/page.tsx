"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [capital, setCapital] = useState("");
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem("startingCapital");
    if (stored) setCapital(stored);
  }, []);

  const handleSaveCapital = () => {
    const val = parseFloat(capital);
    if (!isNaN(val) && val > 0) {
      localStorage.setItem("startingCapital", String(val));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reset", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to reset");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setShowResetConfirm(false);
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your trading journal.
        </p>
      </div>

      {/* Starting Capital */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Starting Capital
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Set your paper trading starting capital. This is used to calculate whether any single loss exceeds 5% of your capital (readiness checklist).
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              placeholder="100000"
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handleSaveCapital}
            className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Save
          </button>
        </div>
        {saved && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-2">
            Capital saved: {formatINR(parseFloat(capital))}
          </p>
        )}
      </div>

      {/* Reset Journal */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900 p-6">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Delete all trade records permanently. This action cannot be undone.
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Reset Journal
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Are you sure? This will permanently delete ALL trade entries.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
              >
                {resetMutation.isPending ? "Deleting..." : "Yes, Delete Everything"}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {resetMutation.isSuccess && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-3">
            All trades deleted successfully.
          </p>
        )}
      </div>
    </div>
  );
}
