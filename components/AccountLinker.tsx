"use client";

import { useCallback, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { groupByTier, parseDivisionsCsv } from "@/lib/csv-utils";

export default function AccountLinker() {
  const {
    state,
    setDivisions,
    addDivision,
    removeDivision,
    removeTierDivisions,
    updateDivisionAccount,
    updateTierAccount,
  } = useStore();

  const [newTier, setNewTier] = useState("");
  const [newAbb, setNewAbb] = useState("");
  const [newDiv, setNewDiv] = useState("");

  const fbAccounts = useMemo(
    () => state.accounts.filter((a) => a.platform === "Facebook Page"),
    [state.accounts]
  );
  const igAccounts = useMemo(
    () =>
      state.accounts.filter(
        (a) => a.platform === "Instagram Business Account"
      ),
    [state.accounts]
  );

  const tierGroups = useMemo(
    () => groupByTier(state.divisions),
    [state.divisions]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const newDivs = parseDivisionsCsv(text);
        setDivisions([...state.divisions, ...newDivs]);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [setDivisions, state.divisions]
  );

  const handleAddDivision = useCallback(() => {
    const tier = newTier.trim();
    const abb = newAbb.trim();
    const div = newDiv.trim();
    if (!tier || !abb || !div) return;
    if (state.divisions.some((d) => d.abb === abb)) return;
    addDivision(tier, div, abb);
    setNewAbb("");
    setNewDiv("");
  }, [newTier, newAbb, newDiv, addDivision, state.divisions]);

  const linkedDivs = state.divisions.filter(
    (d) => d.fbAccountId || d.igAccountId
  ).length;
  const totalTiers = tierGroups.size;
  const linkedTiers = [...tierGroups.keys()].filter((conf) => {
    const ta = state.tierAccounts[conf];
    return ta && (ta.fbAccountId || ta.igAccountId);
  }).length;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Divisions &amp; Accounts</h2>
        <div className="flex items-center gap-3">
          {state.divisions.length > 0 && (
            <span className="text-xs text-zinc-400">
              {linkedDivs}/{state.divisions.length} div &middot;{" "}
              {linkedTiers}/{totalTiers} tier
            </span>
          )}
          <label className="cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Upload Divisions
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Add division form */}
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-0.5 block text-xs text-zinc-500">Tier</label>
          <input
            type="text"
            value={newTier}
            onChange={(e) => setNewTier(e.target.value)}
            placeholder="e.g. Tier 1"
            list="existing-tiers"
            className="w-28 rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          />
          <datalist id="existing-tiers">
            {[...tierGroups.keys()].map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="mb-0.5 block text-xs text-zinc-500">Abb</label>
          <input
            type="text"
            value={newAbb}
            onChange={(e) => setNewAbb(e.target.value)}
            placeholder="e.g. VICM12"
            className="w-24 rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div className="flex-1">
          <label className="mb-0.5 block text-xs text-zinc-500">
            Division Name
          </label>
          <input
            type="text"
            value={newDiv}
            onChange={(e) => setNewDiv(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddDivision();
              }
            }}
            placeholder="e.g. Victoria Monarchs"
            className="w-full rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <button
          onClick={handleAddDivision}
          disabled={!newTier.trim() || !newAbb.trim() || !newDiv.trim()}
          className="rounded-md bg-zinc-700 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add
        </button>
      </div>

      {state.divisions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Upload a division CSV or add divisions manually above.
        </p>
      ) : (
        <div className="space-y-4">
          {[...tierGroups.entries()].map(([conf, divs]) => {
            const ta = state.tierAccounts[conf] || {
              fbAccountId: "",
              igAccountId: "",
            };

            return (
              <div key={conf}>
                {/* Tier header */}
                <div className="mb-2 flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20">
                  <h3 className="min-w-[80px] text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                    {conf}
                  </h3>
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-blue-600">
                        FB
                      </span>
                      <select
                        value={ta.fbAccountId}
                        onChange={(e) =>
                          updateTierAccount(
                            conf,
                            "fbAccountId",
                            e.target.value
                          )
                        }
                        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-700"
                      >
                        <option value="">--</option>
                        {fbAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name || a.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-pink-600">
                        IG
                      </span>
                      <select
                        value={ta.igAccountId}
                        onChange={(e) =>
                          updateTierAccount(
                            conf,
                            "igAccountId",
                            e.target.value
                          )
                        }
                        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-700"
                      >
                        <option value="">--</option>
                        {igAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name || a.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTierDivisions(conf)}
                    className="text-xs text-red-400 hover:text-red-600"
                    title="Remove tier and all its divisions"
                  >
                    Remove tier
                  </button>
                </div>

                {/* Per-division rows */}
                <div className="space-y-1.5 pl-3">
                  {divs.map((div) => (
                    <div
                      key={div.abb}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <div className="flex min-w-[110px] items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          {div.abb}
                        </span>
                        <span className="truncate text-sm text-zinc-500">
                          {div.div}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-blue-600">
                            FB
                          </span>
                          <select
                            value={div.fbAccountId}
                            onChange={(e) =>
                              updateDivisionAccount(
                                div.abb,
                                "fbAccountId",
                                e.target.value
                              )
                            }
                            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-700"
                          >
                            <option value="">--</option>
                            {fbAccounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name || a.id}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-pink-600">
                            IG
                          </span>
                          <select
                            value={div.igAccountId}
                            onChange={(e) =>
                              updateDivisionAccount(
                                div.abb,
                                "igAccountId",
                                e.target.value
                              )
                            }
                            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-700"
                          >
                            <option value="">--</option>
                            {igAccounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name || a.id}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => removeDivision(div.abb)}
                        className="text-zinc-300 transition-colors hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
                        title="Remove division"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setDivisions([])}
            className="text-xs text-red-500 hover:underline"
          >
            Clear all divisions
          </button>
        </div>
      )}
    </section>
  );
}
