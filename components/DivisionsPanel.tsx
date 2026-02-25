"use client";

import { useCallback, useMemo } from "react";
import { useStore } from "@/lib/store";
import { parseDivisionsCsv } from "@/lib/csv-utils";

export default function DivisionsPanel() {
  const { state, setDivisions, toggleDivision, toggleAllDivisions } =
    useStore();

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const divs = parseDivisionsCsv(text);
        setDivisions(divs);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [setDivisions]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof state.divisions>();
    for (const div of state.divisions) {
      const key = div.tier || div.conf;
      const list = map.get(key) || [];
      list.push(div);
      map.set(key, list);
    }
    return map;
  }, [state.divisions]);

  const allChecked =
    state.divisions.length > 0 && state.divisions.every((d) => d.checked);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Divisions &amp; Tiers</h2>
        <label className="cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          Upload CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {state.divisions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Upload a division CSV (Conference, Division, Abbreviation, Tier).
        </p>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3">
            <button
              onClick={() => toggleAllDivisions(!allChecked)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {allChecked ? "Deselect All" : "Select All"}
            </button>
            <span className="text-xs text-zinc-400">
              {state.divisions.filter((d) => d.checked).length}/
              {state.divisions.length} selected
            </span>
          </div>

          <div className="space-y-3">
            {[...grouped.entries()].map(([tierName, divs]) => (
              <div key={tierName}>
                <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {tierName}
                </h3>
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {divs.map((d) => (
                    <label
                      key={d.abb}
                      className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm transition-colors ${
                        d.checked
                          ? "bg-blue-50 dark:bg-blue-900/30"
                          : "bg-zinc-50 dark:bg-zinc-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={d.checked}
                        onChange={() => toggleDivision(d.abb)}
                        className="accent-blue-600"
                      />
                      <span className="font-mono text-xs font-bold">
                        {d.abb}
                      </span>
                      <span className="truncate text-zinc-600 dark:text-zinc-400">
                        {d.div}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
