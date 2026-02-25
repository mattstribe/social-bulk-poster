"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const links = [
  { href: "/", label: "Weekly" },
  { href: "/setup", label: "Setup" },
];

export default function NavHeader() {
  const pathname = usePathname();
  const { hasUnsavedChanges, saving, saveSettings } = useStore();

  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Social Bulk Poster
          </h1>
          <p className="text-sm text-zinc-500">
            Generate SocialPilot bulk posting CSVs from weekly CDN exports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={!hasUnsavedChanges || saving}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              hasUnsavedChanges
                ? "bg-green-600 text-white hover:bg-green-700"
                : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
            }`}
          >
            {saving ? "Saving..." : hasUnsavedChanges ? "Save" : "Saved"}
          </button>
          <nav className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
