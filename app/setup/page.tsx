import AccountsPanel from "@/components/AccountsPanel";
import AccountLinker from "@/components/AccountLinker";

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AccountLinker />
        </div>
        <AccountsPanel />
      </div>
    </main>
  );
}
