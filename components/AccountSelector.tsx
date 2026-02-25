"use client";

import { useStore } from "@/lib/store";

export default function AccountSelector() {
  const {
    state,
    togglePostingAccount,
    toggleAllPostingAccounts,
    toggleDivisionAbb,
  } = useStore();

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
            <AccountGroup
              label="Location"
              color="blue"
              accounts={locationAccounts}
              onToggleAccount={togglePostingAccount}
              onToggleDivision={toggleDivisionAbb}
            />
          )}
          {tierAccounts.length > 0 && (
            <AccountGroup
              label="Tier"
              color="purple"
              accounts={tierAccounts}
              onToggleAccount={togglePostingAccount}
              onToggleDivision={toggleDivisionAbb}
            />
          )}
        </div>
      )}
    </section>
  );
}

function AccountGroup({
  label,
  color,
  accounts,
  onToggleAccount,
  onToggleDivision,
}: {
  label: string;
  color: "blue" | "purple";
  accounts: import("@/lib/types").PostingAccount[];
  onToggleAccount: (id: string) => void;
  onToggleDivision: (accountId: string, abb: string) => void;
}) {
  const colorClass =
    color === "blue" ? "text-blue-600" : "text-purple-600";
  const accentClass =
    color === "blue" ? "accent-blue-600" : "accent-purple-600";

  return (
    <div>
      <h3
        className={`mb-2 text-xs font-semibold uppercase tracking-wider ${colorClass}`}
      >
        {label}
      </h3>
      <div className="space-y-0.5">
        {accounts.map((pa) => {
          const activeCount =
            pa.divisionAbbs.length -
            pa.disabledDivisionAbbs.filter((a) =>
              pa.divisionAbbs.includes(a)
            ).length;
          const isIndeterminate =
            activeCount > 0 && activeCount < pa.divisionAbbs.length;

          return (
            <div key={pa.id}>
              {/* Account row */}
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <input
                  type="checkbox"
                  checked={pa.checked}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={() => onToggleAccount(pa.id)}
                  className={accentClass}
                />
                <span className="text-sm font-medium">
                  {pa.name || "(unnamed)"}
                </span>
                <span className="text-xs text-zinc-400">
                  {activeCount}/{pa.divisionAbbs.length}
                </span>
              </label>

              {/* Division rows */}
              {pa.divisionAbbs.length > 0 && (
                <div className="ml-6 space-y-0.5">
                  {pa.divisionAbbs.map((abb) => {
                    const isActive =
                      !pa.disabledDivisionAbbs.includes(abb);
                    return (
                      <label
                        key={abb}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-0.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => onToggleDivision(pa.id, abb)}
                          className="accent-zinc-500"
                        />
                        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                          {abb}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
