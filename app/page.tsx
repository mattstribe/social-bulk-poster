import ConfigHeader from "@/components/ConfigHeader";
import PostTypesPanel from "@/components/PostTypesPanel";
import AccountSelector from "@/components/AccountSelector";
import GeneratePanel from "@/components/GeneratePanel";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <ConfigHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PostTypesPanel />
        </div>
        <AccountSelector />
      </div>
      <GeneratePanel />
    </main>
  );
}
