"use client";

import { useStore } from "@/lib/store";

export default function ConfigHeader() {
  const { state, setLeagueName, setCdnBaseUrl, setWeekNumber } = useStore();

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">Configuration</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            League Name
          </label>
          <input
            type="text"
            value={state.leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            placeholder="e.g. NBHL"
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Week Number
          </label>
          <input
            type="number"
            min={1}
            value={state.weekNumber}
            onChange={(e) => setWeekNumber(Number(e.target.value) || 1)}
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            CDN Base URL
          </label>
          <input
            type="text"
            value={state.cdnBaseUrl}
            onChange={(e) => setCdnBaseUrl(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
      </div>
    </section>
  );
}
