"use client";

import { useStore } from "@/lib/store";
import type { PostType } from "@/lib/types";

interface Props {
  postType: PostType;
}

export default function PostTypeCard({ postType }: Props) {
  const { updatePostType, removePostType } = useStore();

  const update = (updates: Partial<PostType>) =>
    updatePostType(postType.id, updates);

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        postType.enabled
          ? "border-blue-200 bg-white dark:border-blue-800 dark:bg-zinc-900"
          : "border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-700 dark:bg-zinc-900/50"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={postType.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
              className="accent-blue-600"
            />
            <input
              type="text"
              value={postType.label}
              onChange={(e) => update({ label: e.target.value })}
              className="border-b border-transparent bg-transparent text-sm font-semibold focus:border-blue-400 focus:outline-none"
              readOnly={postType.isBuiltIn}
            />
          </label>
        </div>
        {!postType.isBuiltIn && (
          <button
            onClick={() => removePostType(postType.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Caption Template */}
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            Caption Template
          </label>
          <textarea
            value={postType.captionTemplate}
            onChange={(e) => update({ captionTemplate: e.target.value })}
            rows={2}
            placeholder="Week {week} {divName} {type} are here! #{league}"
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
          <p className="mt-0.5 text-xs text-zinc-400">
            Variables: {"{divAbb}"} {"{divName}"} {"{conf}"} {"{week}"}{" "}
            {"{league}"} {"{type}"}
          </p>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Post Date
            </label>
            <input
              type="date"
              value={postType.defaultDate}
              onChange={(e) => update({ defaultDate: e.target.value })}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Post Time
            </label>
            <input
              type="time"
              value={postType.defaultTime}
              onChange={(e) => update({ defaultTime: e.target.value })}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* CDN Folder + Filename Pattern */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              CDN Folder
            </label>
            <input
              type="text"
              value={postType.cdnFolder}
              onChange={(e) => update({ cdnFolder: e.target.value })}
              placeholder="e.g. Standings"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-mono dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Filename Pattern
            </label>
            <input
              type="text"
              value={postType.filenamePattern}
              onChange={(e) => update({ filenamePattern: e.target.value })}
              placeholder="{divAbb}_Type.png or leave empty"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-mono dark:border-zinc-600 dark:bg-zinc-800"
            />
            <p className="mt-0.5 text-xs text-zinc-400">
              Empty = folder-only placeholder (Schedule types)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
