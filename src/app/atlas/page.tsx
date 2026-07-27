import Link from "next/link";
import { AtlasConsole } from "@/components/atlas/AtlasConsole";

export default function AtlasPage() {
  return (
    <>
      <div className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="text-sm font-semibold text-[var(--mb-navy-900)]">Mbàmbulaan</Link>
          <nav className="flex items-center gap-4 text-xs font-bold text-[var(--mb-neutral-600)]">
            <Link href="/operations/retours">Opérations</Link>
            <Link href="/atlas" className="text-[var(--mb-ocean-600)]">Atlas</Link>
          </nav>
        </div>
      </div>
      <AtlasConsole />
    </>
  );
}
