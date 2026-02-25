"use client";

import { useCallback } from "react";
import { useStore } from "@/lib/store";
import { parseAccountsCsv } from "@/lib/csv-utils";

export default function AccountsPanel() {
  const { state, setAccounts } = useStore();

  const handleFileUpload = useCallback(
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

  const fbAccounts = state.accounts.filter(
    (a) => a.platform === "Facebook Page"
  );
  const igAccounts = state.accounts.filter(
    (a) => a.platform === "Instagram Business Account"
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Social Accounts</h2>
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

      {state.accounts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Upload your SocialPilot account list CSV to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <span className="truncate">{a.name}</span>
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
                    <span className="truncate">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
