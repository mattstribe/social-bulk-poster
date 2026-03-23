import ConfigHeader from "@/components/ConfigHeader";
import PostTypesPanel from "@/components/PostTypesPanel";
import AccountSelector from "@/components/AccountSelector";
import GeneratePanel from "@/components/GeneratePanel";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <ConfigHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="flex h-full min-h-0 flex-col lg:col-span-2">
          <PostTypesPanel />
        </div>
        <div className="flex h-full min-h-0 w-full flex-col">
          <AccountSelector />
        </div>
      </div>
      <GeneratePanel />
    </main>
  );
}
