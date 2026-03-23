import ConfigHeader from "@/components/ConfigHeader";
import PostTypesPanel from "@/components/PostTypesPanel";
import AccountSelector from "@/components/AccountSelector";
import GeneratePanel from "@/components/GeneratePanel";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <ConfigHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <PostTypesPanel />
        </div>
        <div className="flex min-h-0 max-h-[min(75vh,52rem)] w-full flex-col overflow-hidden">
          <AccountSelector />
        </div>
      </div>
      <GeneratePanel />
    </main>
  );
}
