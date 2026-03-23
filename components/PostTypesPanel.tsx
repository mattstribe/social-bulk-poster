"use client";

import { useStore } from "@/lib/store";
import PostTypeCard from "./PostTypeCard";

export default function PostTypesPanel() {
  const { state, addPostType } = useStore();

  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Post Types</h2>
        <button
          onClick={addPostType}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Add Custom
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {state.postTypes.map((pt) => (
          <PostTypeCard key={pt.id} postType={pt} />
        ))}
      </div>
    </section>
  );
}
