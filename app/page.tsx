import ConfigHeader from "@/components/ConfigHeader";
import DivisionsPanel from "@/components/DivisionsPanel";
import AccountsPanel from "@/components/AccountsPanel";
import AccountLinker from "@/components/AccountLinker";
import PostTypesPanel from "@/components/PostTypesPanel";
import GeneratePanel from "@/components/GeneratePanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-xl font-bold tracking-tight">
            Social Bulk Poster
          </h1>
          <p className="text-sm text-zinc-500">
            Generate SocialPilot bulk posting CSVs from weekly CDN exports
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <ConfigHeader />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DivisionsPanel />
          <AccountsPanel />
        </div>

        <AccountLinker />
        <PostTypesPanel />
        <GeneratePanel />
      </main>
    </div>
  );
}
