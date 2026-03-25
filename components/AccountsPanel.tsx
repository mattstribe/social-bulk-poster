"use client";

import { useCallback } from "react";
import { useStore } from "@/lib/store";
import { parseAccountsCsv, parseDivisionsCsv } from "@/lib/csv-utils";

export default function AccountsPanel() {
  const {
    state,
    setAccounts,
    setDivisions,
    updatePostType,
    selectedDivisionAbbs,
    setSelectedDivisionAbbs,
  } = useStore();

  const handleDivisionAbbClick = useCallback(
    (abb: string) => {
      setSelectedDivisionAbbs((prev) =>
        prev.includes(abb) ? prev.filter((a) => a !== abb) : [...prev, abb]
      );
    },
    [setSelectedDivisionAbbs]
  );

  const handleAccountUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const accounts = parseAccountsCsv(text);
        setAccounts(accounts);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [setAccounts]
  );

  const handleDivisionUpload = useCallback(
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

  const fbAccounts = state.accounts.filter(
    (a) => a.platform === "Facebook Page"
  );
  const igAccounts = state.accounts.filter(
    (a) => a.platform === "Instagram Business Account"
  );

  return (
    <div className="space-y-6">
      {/* Divisions */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Divisions</h2>
          <label className="cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleDivisionUpload}
              className="hidden"
            />
          </label>
        </div>

        {state.divisions.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Upload a division CSV to populate the abbreviation pool.
          </p>
        ) : (
          <>
            {selectedDivisionAbbs.length > 0 && (
              <p className="mb-2 text-xs text-blue-600 dark:text-blue-400">
                Click a posting account to assign/unassign{" "}
                {selectedDivisionAbbs.length === 1 ? (
                  <span className="font-mono font-semibold">
                    {selectedDivisionAbbs[0]}
                  </span>
                ) : (
                  <>
                    <span className="font-semibold">
                      {selectedDivisionAbbs.length} divisions
                    </span>
                    :{" "}
                    <span className="font-mono font-semibold">
                      {selectedDivisionAbbs.join(", ")}
                    </span>
                  </>
                )}
              </p>
            )}
            <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
              Select multiple.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {state.divisions.map((d) => {
                const isSelected = selectedDivisionAbbs.includes(d.abb);
                return (
                  <button
                    key={d.abb}
                    type="button"
                    onClick={() => handleDivisionAbbClick(d.abb)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-zinc-900"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {d.abb}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                setDivisions([]);
                setSelectedDivisionAbbs([]);
              }}
              className="mt-3 text-xs text-red-500 hover:underline"
            >
              Clear divisions
            </button>
          </>
        )}
      </section>

      {/* Social Accounts */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Social Accounts</h2>
          <label className="cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleAccountUpload}
              className="hidden"
            />
          </label>
        </div>

        {state.accounts.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Upload your SocialPilot account list CSV.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {fbAccounts.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-blue-600">
                    Facebook ({fbAccounts.length})
                  </h3>
                  <div className="space-y-1">
                    {fbAccounts.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2 rounded bg-zinc-50 px-2 py-1 text-sm dark:bg-zinc-800"
                      >
                        <span className="font-mono text-xs text-zinc-400">
                          {a.id}
                        </span>
                        <span className="flex-1 truncate">{a.name}</span>
                        <button
                          onClick={() =>
                            setAccounts(
                              state.accounts.filter((x) => x.id !== a.id)
                            )
                          }
                          className="text-zinc-300 transition-colors hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {igAccounts.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-pink-600">
                    Instagram ({igAccounts.length})
                  </h3>
                  <div className="space-y-1">
                    {igAccounts.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2 rounded bg-zinc-50 px-2 py-1 text-sm dark:bg-zinc-800"
                      >
                        <span className="font-mono text-xs text-zinc-400">
                          {a.id}
                        </span>
                        <span className="flex-1 truncate">{a.name}</span>
                        <button
                          onClick={() =>
                            setAccounts(
                              state.accounts.filter((x) => x.id !== a.id)
                            )
                          }
                          className="text-zinc-300 transition-colors hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setAccounts([])}
              className="mt-3 text-xs text-red-500 hover:underline"
            >
              Clear accounts
            </button>
          </>
        )}

      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-2 text-lg font-semibold">Post Type File Mapping</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Configure CDN folder and filename pattern used to find files for each post type.
        </p>
        <div className="space-y-2">
          {state.postTypes.map((pt) => (
            <div
              key={pt.id}
              className="rounded border border-zinc-200 p-3 dark:border-zinc-700"
            >
              <div className="mb-2">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  {pt.label}
                </p>
                <p className="font-mono text-[11px] text-zinc-400">{pt.id}</p>
              </div>
              <div className="mb-2">
                <label className="mb-0.5 block text-xs font-medium text-zinc-500">
                  CDN Folder
                </label>
                <input
                  type="text"
                  value={pt.cdnFolder}
                  onChange={(e) =>
                    updatePostType(pt.id, { cdnFolder: e.target.value })
                  }
                  className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-2.5 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="mb-0.5 block text-xs font-medium text-zinc-500">
                  Filename Pattern
                </label>
                <input
                  type="text"
                  value={pt.filenamePattern}
                  onChange={(e) =>
                    updatePostType(pt.id, {
                      filenamePattern: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-2.5 py-1.5 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
