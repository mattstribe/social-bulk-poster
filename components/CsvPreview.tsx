"use client";

import type { CsvRow } from "@/lib/types";

interface Props {
  rows: CsvRow[];
}

export default function CsvPreview({ rows }: Props) {
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="w-full text-left text-xs">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Account ID</th>
            <th className="px-3 py-2 font-medium">Post Time</th>
            <th className="max-w-xs px-3 py-2 font-medium">Caption</th>
            <th className="max-w-sm px-3 py-2 font-medium">Image URL(s)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row, i) => (
            <tr
              key={i}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-3 py-2 text-zinc-400">{i + 1}</td>
              <td className="px-3 py-2 font-mono">{row.accountId}</td>
              <td className="whitespace-nowrap px-3 py-2">{row.postTime}</td>
              <td className="max-w-xs truncate px-3 py-2">{row.caption}</td>
              <td className="max-w-sm truncate px-3 py-2 font-mono text-blue-500">
                {row.imageUrl}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
