"use client";

import { useStore } from "@/lib/store";

export default function ConfigHeader() {
  const { state, setWeekNumber, setLeagueWeek1Monday, scanCdn, cdnScanning } =
    useStore();

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black tracking-tight">NBHL</span>
          <span className="text-sm text-zinc-400">|</span>
          <span className="text-sm text-zinc-500">Weekly Bulk Poster</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Week
          </label>
          <input
            type="number"
            min={0}
            value={state.weekNumber}
            onChange={(e) => setWeekNumber(Math.max(0, Number(e.target.value)))}
            className="w-20 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-center text-sm font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Week 1 Monday
          </label>
          <input
            type="date"
            value={state.leagueWeek1Monday}
            onChange={(e) => setLeagueWeek1Monday(e.target.value)}
            className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
            title="Monday that starts league week 1. Default post dates follow from this and the Week field."
          />
          <button
            type="button"
            onClick={() => scanCdn()}
            disabled={cdnScanning}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {cdnScanning ? "Scanning..." : "Scan CDN"}
          </button>
        </div>
      </div>
    </section>
  );
}
