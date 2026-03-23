"use client";

import { useStore } from "@/lib/store";

export default function ConfigHeader() {
  const { state, setWeekNumber } = useStore();

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black tracking-tight">NBHL</span>
          <span className="text-sm text-zinc-400">|</span>
          <span className="text-sm text-zinc-500">Weekly Bulk Poster</span>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </section>
  );
}
