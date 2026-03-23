"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { divisionImageBreakdown } from "@/lib/csv-utils";
import type { CdnManifest, PostingAccount, PostType } from "@/lib/types";

type DivisionPreview = {
  abb: string;
  breakdown: { postTypeId: string; label: string; count: number }[];
};

function buildPreview(
  accounts: PostingAccount[],
  enabledPatterned: PostType[],
  manifest: CdnManifest | null
): { account: PostingAccount; divisions: DivisionPreview[] }[] {
  if (!manifest || enabledPatterned.length === 0) return [];

  const out: { account: PostingAccount; divisions: DivisionPreview[] }[] = [];

  for (const pa of accounts) {
    if (!pa.fbAccountId && !pa.igAccountId) continue;

    const divisions: DivisionPreview[] = [];
    for (const abb of pa.divisionAbbs) {
      const breakdown = divisionImageBreakdown(abb, manifest, enabledPatterned);
      if (breakdown.length > 0) divisions.push({ abb, breakdown });
    }

    if (divisions.length > 0) {
      out.push({ account: pa, divisions });
    }
  }

  return out;
}

export default function AccountSelector() {
  const { state, cdnManifest } = useStore();

  const enabledPatterned = useMemo(
    () =>
      state.postTypes.filter(
        (pt) => pt.enabled && pt.filenamePattern.trim() !== ""
      ),
    [state.postTypes]
  );

  const locationPreview = useMemo(
    () =>
      buildPreview(
        state.postingAccounts.filter((pa) => pa.type === "location"),
        enabledPatterned,
        cdnManifest
      ),
    [state.postingAccounts, enabledPatterned, cdnManifest]
  );

  const tierPreview = useMemo(
    () =>
      buildPreview(
        state.postingAccounts.filter((pa) => pa.type === "tier"),
        enabledPatterned,
        cdnManifest
      ),
    [state.postingAccounts, enabledPatterned, cdnManifest]
  );

  const hasPreview =
    locationPreview.length > 0 || tierPreview.length > 0;

  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-2 shrink-0">
        <h2 className="text-lg font-semibold">Posts this week</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Accounts and divisions that have images on the CDN for your enabled
          post types. The CSV includes only these (no manual selection).
        </p>
      </div>

      {state.postingAccounts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Set up posting accounts on the Setup page first.
        </p>
      ) : !cdnManifest ? (
        <p className="text-sm text-zinc-500">
          Use <span className="font-medium">Scan CDN</span> in the header to
          load files, then this list shows where posts will go.
        </p>
      ) : enabledPatterned.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Enable at least one post type with a filename pattern to see matches.
        </p>
      ) : !hasPreview ? (
        <p className="text-sm text-zinc-500">
          No matching images for enabled post types on the CDN for your linked
          accounts. Check week, league, and division assignments on Setup.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-4">
            {locationPreview.length > 0 && (
              <PreviewGroup
                label="Location Accounts"
                color="blue"
                entries={locationPreview}
              />
            )}
            {tierPreview.length > 0 && (
              <PreviewGroup
                label="Tier Accounts"
                color="purple"
                entries={tierPreview}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function PreviewGroup({
  label,
  color,
  entries,
}: {
  label: string;
  color: "blue" | "purple";
  entries: { account: PostingAccount; divisions: DivisionPreview[] }[];
}) {
  const colorClass =
    color === "blue" ? "text-blue-600" : "text-purple-600";

  return (
    <div>
      <h3
        className={`mb-2 text-xs font-semibold uppercase tracking-wider ${colorClass}`}
      >
        {label}
      </h3>
      <div className="space-y-3">
        {entries.map(({ account, divisions }) => (
          <div key={account.id}>
            <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {account.name || "(unnamed)"}
            </div>
            <ul className="ml-3 mt-1 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-600">
              {divisions.map(({ abb, breakdown }) => (
                <li
                  key={abb}
                  className="font-mono text-xs text-zinc-600 dark:text-zinc-400"
                >
                  {abb}{" "}
                  <span className="text-zinc-400 dark:text-zinc-500">
                    {breakdown.map((b) => (
                      <span key={b.postTypeId} className="whitespace-nowrap">
                        ({b.count} {b.label}){" "}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
