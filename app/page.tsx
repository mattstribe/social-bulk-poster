import ConfigHeader from "@/components/ConfigHeader";
import PostTypesPanel from "@/components/PostTypesPanel";
import GeneratePanel from "@/components/GeneratePanel";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <ConfigHeader />
      <PostTypesPanel />
      <GeneratePanel />
    </main>
  );
}
