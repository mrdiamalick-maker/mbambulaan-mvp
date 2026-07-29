import Link from "next/link";
import { ShipWheel } from "lucide-react";

export function PublicHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`relative z-30 flex min-h-18 min-w-0 items-center justify-between gap-2 border-b px-4 md:px-10 ${dark ? "border-white/15 bg-[#062d36] text-white" : "border-[#d8e1e2] bg-white text-[#062d36]"}`}>
      <Link href="/" className="flex min-w-0 items-center gap-2.5">
        <span className={`grid size-9 place-items-center ${dark ? "bg-white text-[#075466]" : "bg-[#075466] text-white"}`}><ShipWheel size={19} /></span>
        <span className="min-w-0"><strong className="block truncate text-sm">Mbàmbulaan</strong><span className={`hidden text-xs sm:block ${dark ? "text-white/70" : "text-[#60737a]"}`}>Écosystème numérique de la filière halieutique</span></span>
      </Link>
      <nav className="flex shrink-0 items-center gap-1 text-sm font-bold">
        <Link href="/atlas" className="hidden px-3 py-2 md:block">Atlas</Link>
        <Link href="/offres" className="hidden px-3 py-2 md:block">Offres</Link>
        <Link href="/demo" className="px-2 py-2 sm:px-3">
          <span className="sm:hidden">Démo</span>
          <span className="hidden sm:inline">Démonstration</span>
        </Link>
        <Link href="/connexion" className={`${dark ? "bg-white text-[#075466]" : "bg-[#075466] text-white"} px-3 py-2.5 sm:px-4`}>
          <span className="sm:hidden">Accès</span>
          <span className="hidden sm:inline">Se connecter</span>
        </Link>
      </nav>
    </header>
  );
}
