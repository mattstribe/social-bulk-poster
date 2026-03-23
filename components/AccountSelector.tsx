"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  resolveFilenamePattern,
  fileMatchesFilenamePrefix,
} from "@/lib/cdn-paths";
import type { CdnManifest } from "@/lib/types";

type DivAvailability = "full" | "partial" | "none" | "unknown";

function getDivAvailability(
  abb: string,
  enabledPatterned: { cdnFolder: string; filenamePattern: string }[],
  manifest: CdnManifest | null
): DivAvailability {
  if (!manifest || enabledPatterned.length === 0) return "unknown";
  let matched = 0;
  for (const pt of enabledPatterned) {
    const prefix = resolveFilenamePattern(pt.filenamePattern, abb);
    const files = manifest[pt.cdnFolder] ?? [];
    if (files.some((f) => fileMatchesFilenamePrefix(f, prefix))) matched++;
  }
  if (matched === enabledPatterned.length) return "full";
  if (matched > 0) return "partial";
  return "none";
}

export default function AccountSelector() {
  const {
    state,
    cdnManifest,
    togglePostingAccount,
    toggleAllPostingAccounts,
    toggleDivisionAbb,
  } = useStore();

  const enabledPatterned = useMemo(
    () =>
      state.postTypes.filter(
        (pt) => pt.enabled && pt.filenamePattern.trim() !== ""
      ),
    [state.postTypes]
  );

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
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex shrink-0 items-center justify-between">
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
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-4">
            {locationAccounts.length > 0 && (
              <AccountGroup
                label="Location"
                color="blue"
                accounts={locationAccounts}
                manifest={cdnManifest}
                enabledPatterned={enabledPatterned}
                onToggleAccount={togglePostingAccount}
                onToggleDivision={toggleDivisionAbb}
              />
            )}
            {tierAccounts.length > 0 && (
              <AccountGroup
                label="Tier"
                color="purple"
                accounts={tierAccounts}
                manifest={cdnManifest}
                enabledPatterned={enabledPatterned}
                onToggleAccount={togglePostingAccount}
                onToggleDivision={toggleDivisionAbb}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

const DOT_CLASSES: Record<DivAvailability, string> = {
  full: "bg-green-500",
  partial: "bg-amber-400",
  none: "bg-red-400",
  unknown: "",
};

function AccountGroup({
  label,
  color,
  accounts,
  manifest,
  enabledPatterned,
  onToggleAccount,
  onToggleDivision,
}: {
  label: string;
  color: "blue" | "purple";
  accounts: import("@/lib/types").PostingAccount[];
  manifest: CdnManifest | null;
  enabledPatterned: { cdnFolder: string; filenamePattern: string }[];
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

              {pa.divisionAbbs.length > 0 && (
                <div className="ml-6 space-y-0.5">
                  {pa.divisionAbbs.map((abb) => {
                    const isActive =
                      !pa.disabledDivisionAbbs.includes(abb);
                    const avail = getDivAvailability(
                      abb,
                      enabledPatterned,
                      manifest
                    );
                    const dotClass = DOT_CLASSES[avail];
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
                        {dotClass && (
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`}
                            title={
                              avail === "full"
                                ? "All post type files found"
                                : avail === "partial"
                                  ? "Some post type files missing"
                                  : "No files found on CDN"
                            }
                          />
                        )}
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
