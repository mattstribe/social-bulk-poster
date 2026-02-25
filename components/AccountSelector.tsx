"use client";

import { useStore } from "@/lib/store";

export default function AccountSelector() {
  const { state, togglePostingAccount, toggleAllPostingAccounts } = useStore();

  const locationAccounts = state.postingAccounts.filter(
    (pa) => pa.type === "location"
  );
  const tierAccounts = state.postingAccounts.filter(
    (pa) => pa.type === "tier"
  );

  const allChecked =
    state.postingAccounts.length > 0 &&
    state.postingAccounts.every((pa) => pa.checked);
  const noneChecked = state.postingAccounts.every((pa) => !pa.checked);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Accounts</h2>
        {state.postingAccounts.length > 0 && (
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => toggleAllPostingAccounts(true)}
              disabled={allChecked}
              className="text-blue-600 hover:underline disabled:opacity-40"
            >
              Select All
            </button>
            <span className="text-zinc-300">/</span>
            <button
              onClick={() => toggleAllPostingAccounts(false)}
              disabled={noneChecked}
              className="text-blue-600 hover:underline disabled:opacity-40"
            >
              None
            </button>
          </div>
        )}
      </div>

      {state.postingAccounts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Set up posting accounts on the Setup page first.
        </p>
      ) : (
        <div className="space-y-4">
          {locationAccounts.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                Location
              </h3>
              <div className="space-y-1">
                {locationAccounts.map((pa) => (
                  <label
                    key={pa.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <input
                      type="checkbox"
                      checked={pa.checked}
                      onChange={() => togglePostingAccount(pa.id)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm">
                      {pa.name || "(unnamed)"}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {pa.divisionAbbs.length} div
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tierAccounts.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-600">
                Tier
              </h3>
              <div className="space-y-1">
                {tierAccounts.map((pa) => (
                  <label
                    key={pa.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <input
                      type="checkbox"
                      checked={pa.checked}
                      onChange={() => togglePostingAccount(pa.id)}
                      className="accent-purple-600"
                    />
                    <span className="text-sm">
                      {pa.name || "(unnamed)"}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {pa.divisionAbbs.length} div
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
