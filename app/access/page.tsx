"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AccessPage() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    const n = searchParams.get("next");
    return n && n.startsWith("/") ? n : "/";
  }, [searchParams]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next: nextPath }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Unable to access site.");
        return;
      }
      window.location.replace(nextPath);
    } catch {
      setError("Unable to access site.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold">Private Access</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter the site password to continue.
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting || !password.trim()}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Checking..." : "Enter"}
          </button>
        </form>
      </section>
    </main>
  );
}

