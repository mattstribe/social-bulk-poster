"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { groupByTier } from "@/lib/csv-utils";

export default function AccountLinker() {
  const { state, updateDivisionAccount, updateTierAccount } = useStore();

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

  if (!state.divisions.length || !state.accounts.length) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-2 text-lg font-semibold">Account Linker</h2>
        <p className="text-sm text-zinc-500">
          Upload divisions and accounts above, then link one Facebook and one
          Instagram account to each division and tier.
        </p>
      </section>
    );
  }

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
        <h2 className="text-lg font-semibold">Account Linker</h2>
        <span className="text-xs text-zinc-400">
          {linkedDivs}/{state.divisions.length} divisions &middot;{" "}
          {linkedTiers}/{totalTiers} tiers
        </span>
      </div>

      <div className="space-y-5">
        {[...tierGroups.entries()].map(([conf, divs]) => {
          const ta = state.tierAccounts[conf] || {
            fbAccountId: "",
            igAccountId: "",
          };

          return (
            <div key={conf}>
              {/* Tier header with account selectors */}
              <div className="mb-2 flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20">
                <h3 className="min-w-[100px] text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
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
                        updateTierAccount(conf, "fbAccountId", e.target.value)
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
                        updateTierAccount(conf, "igAccountId", e.target.value)
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
              </div>

              {/* Per-division rows */}
              <div className="space-y-2 pl-3">
                {divs.map((div) => (
                  <div
                    key={div.abb}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <div className="flex min-w-[120px] items-center gap-2">
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
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
