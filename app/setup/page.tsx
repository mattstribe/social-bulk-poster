import DivisionsPanel from "@/components/DivisionsPanel";
import AccountsPanel from "@/components/AccountsPanel";
import AccountLinker from "@/components/AccountLinker";

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DivisionsPanel />
        <AccountsPanel />
      </div>

      <AccountLinker />
    </main>
  );
}
