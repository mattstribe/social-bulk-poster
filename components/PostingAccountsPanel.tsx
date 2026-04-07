"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";

export default function PostingAccountsPanel() {
  const {
    state,
    selectedDivisionAbbs,
    savedDivisionsMap,
    addPostingAccount,
    removePostingAccount,
    updatePostingAccount,
    movePostingAccount,
    toggleDivisionOnAccount,
    unassignDivision,
  } = useStore();

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

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Posting Accounts</h2>
        <button
          onClick={addPostingAccount}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Add Account
        </button>
      </div>

      {state.postingAccounts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Create posting accounts and assign divisions to them.
        </p>
      ) : (
        <div className="space-y-4">
          {state.postingAccounts.map((pa, idx) => (
            <PostingAccountCard
              key={pa.id}
              account={pa}
              index={idx}
              total={state.postingAccounts.length}
              fbAccounts={fbAccounts}
              igAccounts={igAccounts}
              selectedDivisionAbbs={selectedDivisionAbbs}
              savedAbbs={savedDivisionsMap[pa.id] ?? []}
              onUpdate={(updates) => updatePostingAccount(pa.id, updates)}
              onRemove={() => removePostingAccount(pa.id)}
              onMove={(dir) => movePostingAccount(pa.id, dir)}
              onToggleDivision={() => toggleDivisionOnAccount(pa.id)}
              onUnassign={(abb) => unassignDivision(pa.id, abb)}
            />
          ))}

          <button
            onClick={() => {
              for (const pa of state.postingAccounts) {
                removePostingAccount(pa.id);
              }
            }}
            className="text-xs text-red-500 hover:underline"
          >
            Clear all accounts
          </button>
        </div>
      )}
    </section>
  );
}

interface CardProps {
  account: import("@/lib/types").PostingAccount;
  index: number;
  total: number;
  fbAccounts: import("@/lib/types").SocialAccount[];
  igAccounts: import("@/lib/types").SocialAccount[];
  selectedDivisionAbbs: string[];
  savedAbbs: string[];
  onUpdate: (updates: Partial<import("@/lib/types").PostingAccount>) => void;
  onRemove: () => void;
  onMove: (dir: "up" | "down") => void;
  onToggleDivision: () => void;
  onUnassign: (abb: string) => void;
}

function PostingAccountCard({
  account,
  index,
  total,
  fbAccounts,
  igAccounts,
  selectedDivisionAbbs,
  savedAbbs,
  onUpdate,
  onRemove,
  onMove,
  onToggleDivision,
  onUnassign,
}: CardProps) {
  const isAssigning = selectedDivisionAbbs.length > 0;

  const removedAbbs = savedAbbs.filter(
    (abb) => !account.divisionAbbs.includes(abb)
  );

  const borderColor =
    account.type === "tier"
      ? "border-purple-200 dark:border-purple-800"
      : "border-blue-200 dark:border-blue-800";

  const headerBg =
    account.type === "tier"
      ? "bg-purple-50 dark:bg-purple-900/20"
      : "bg-blue-50 dark:bg-blue-900/20";

  const noActiveDivisions =
    account.divisionAbbs.length === 0 && removedAbbs.length === 0;

  return (
    <div
      onClick={isAssigning ? onToggleDivision : undefined}
      className={`rounded-lg border ${borderColor} transition-all ${
        isAssigning
          ? "cursor-pointer ring-1 ring-transparent hover:ring-blue-400 hover:shadow-md"
          : ""
      }`}
    >
      {/* Header row */}
      <div
        className={`flex flex-wrap items-center gap-3 rounded-t-lg px-3 py-2 ${headerBg}`}
      >
        <div className="flex items-center gap-1">
          <div className="flex flex-col">
            <button
              onClick={(e) => { e.stopPropagation(); onMove("up"); }}
              disabled={index === 0}
              className="text-xs leading-none text-zinc-400 transition-colors hover:text-zinc-700 disabled:opacity-20 dark:hover:text-zinc-200"
              title="Move up"
            >
              &#9650;
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMove("down"); }}
              disabled={index === total - 1}
              className="text-xs leading-none text-zinc-400 transition-colors hover:text-zinc-700 disabled:opacity-20 dark:hover:text-zinc-200"
              title="Move down"
            >
              &#9660;
            </button>
          </div>
          <input
            type="text"
            value={account.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Account name (e.g. Buffalo)"
            className="w-40 rounded border border-zinc-300 bg-white px-2 py-1 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        {/* Type toggle */}
        <div className="flex overflow-hidden rounded-md border border-zinc-300 text-xs dark:border-zinc-600">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate({ type: "location" }); }}
            className={`px-2.5 py-1 font-medium transition-colors ${
              account.type === "location"
                ? "bg-blue-600 text-white"
                : "bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            Location
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate({ type: "tier" }); }}
            className={`px-2.5 py-1 font-medium transition-colors ${
              account.type === "tier"
                ? "bg-purple-600 text-white"
                : "bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            Tier
          </button>
        </div>

        {/* FB / IG selectors */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-blue-600">FB</span>
            <select
              value={account.fbAccountId}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdate({ fbAccountId: e.target.value })}
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
            <span className="text-xs font-medium text-pink-600">IG</span>
            <select
              value={account.igAccountId}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdate({ igAccountId: e.target.value })}
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
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-emerald-600">Sponsor</span>
            <input
              type="text"
              value={account.sponsorHandle ?? ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdate({ sponsorHandle: e.target.value })}
              placeholder="@company"
              className="w-32 rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-700"
              title="Used in captions as {sponsor}. Leave blank if none."
            />
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="text-xs text-red-400 hover:text-red-600"
          title="Remove account"
        >
          &times;
        </button>
      </div>

      {/* Assigned divisions */}
      <div className="px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {noActiveDivisions ? (
            <span className="text-xs text-zinc-400">No divisions assigned</span>
          ) : (
            <>
              {account.divisionAbbs.map((abb) => {
                const isNew = !savedAbbs.includes(abb);
                return (
                  <span
                    key={abb}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-mono font-medium ${
                      isNew
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {abb}
                    <button
                      onClick={(e) => { e.stopPropagation(); onUnassign(abb); }}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
              {removedAbbs.map((abb) => (
                <span
                  key={`removed-${abb}`}
                  className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-mono font-medium text-red-500 line-through dark:bg-red-900/30 dark:text-red-400"
                >
                  {abb}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
