"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { generateCsvRows, rowsToCsvString } from "@/lib/csv-utils";
import type { CsvRow } from "@/lib/types";
import CsvPreview from "./CsvPreview";

export default function GeneratePanel() {
  const { state, cdnManifest, cdnScanning, scanCdn } = useStore();
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(async () => {
    const manifest = await scanCdn();
    const result = generateCsvRows(state, manifest);
    setRows(result);
    setGenerated(true);
  }, [state, scanCdn]);

  const handleDownload = useCallback(() => {
    if (!rows.length) return;
    const csvString = rowsToCsvString(rows);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const league = state.leagueName || "export";
    const week = state.weekNumber;
    link.download = `${league}_Week${week}_bulk_posts.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [rows, state.leagueName, state.weekNumber]);

  const hasCheckedAccounts = state.postingAccounts.some((pa) => pa.checked);
  const hasLinkedAccounts = state.postingAccounts.some(
    (pa) => pa.checked && (pa.fbAccountId || pa.igAccountId)
  );

  const canGenerate =
    state.leagueName.trim() !== "" &&
    hasLinkedAccounts &&
    hasCheckedAccounts &&
    state.postTypes.some((pt) => pt.enabled);

  const totalFiles = cdnManifest
    ? Object.values(cdnManifest).reduce((sum, arr) => sum + arr.length, 0)
    : 0;
  const folderCount = cdnManifest ? Object.keys(cdnManifest).length : 0;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Generate CSV</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || cdnScanning}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cdnScanning ? "Scanning..." : "Generate Preview"}
          </button>
          {rows.length > 0 && (
            <button
              onClick={handleDownload}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Download CSV
            </button>
          )}
        </div>
      </div>

      {cdnManifest && (
        <p className="mb-3 text-sm text-zinc-500">
          CDN: {totalFiles} file{totalFiles !== 1 ? "s" : ""} found across{" "}
          {folderCount} folder{folderCount !== 1 ? "s" : ""}
        </p>
      )}

      {!canGenerate && (
        <p className="text-sm text-zinc-500">
          Create posting accounts with linked social IDs on the Setup page,
          select them above, and enable at least one post type.
        </p>
      )}

      {generated && rows.length === 0 && (
        <p className="text-sm text-amber-600">
          No rows generated. Make sure selected accounts have linked social IDs,
          assigned divisions, and at least one post type is enabled.
        </p>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">
            {rows.length} row{rows.length !== 1 ? "s" : ""} generated
          </p>
          <CsvPreview rows={rows} />
        </div>
      )}
    </section>
  );
}
