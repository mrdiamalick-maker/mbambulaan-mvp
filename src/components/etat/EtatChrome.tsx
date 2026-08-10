"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShipWheel } from "lucide-react";

// Chrome dédié à l'Espace État : le module ne doit pas ressembler à une
// page de plus dans la console opérationnelle (op-*, fond clair, accent
// bleu). Deux destinations seulement — pas de sidebar disproportionnée,
// une barre haute sobre, navy de bout en bout, cohérente avec le contenu.
const links = [
  { href: "/app/etat", label: "Espace État" },
  { href: "/app/etat/rapport", label: "Rapport bailleurs" }
];

export function EtatChrome({
  children,
  actorName,
  tenantName,
  showLoading,
  error,
  onLogout
}: {
  children: React.ReactNode;
  actorName?: string;
  tenantName?: string;
  showLoading: boolean;
  error: string;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="etat-scope min-h-screen bg-[var(--etat-offwhite)]">
      <header className="no-print sticky top-0 z-40 flex h-16 items-center gap-3 overflow-x-auto border-b border-white/8 bg-[var(--etat-navy-950)] px-4 sm:gap-5 lg:px-8">
        <Link href="/app/etat" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--etat-terracotta)] text-white"><ShipWheel size={16} /></span>
          <span className="whitespace-nowrap text-sm font-bold text-white">Mbàmbulaan <span className="hidden font-normal text-white/40 sm:inline">· Espace État</span></span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition ${active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/6 hover:text-white"}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-4">
          {tenantName && <span className="hidden text-xs text-white/40 md:inline">{tenantName}</span>}
          {actorName && <span className="hidden text-xs font-semibold text-white/70 sm:inline">{actorName}</span>}
          <button type="button" onClick={onLogout} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-white/50 hover:text-white">
            <LogOut size={13} /> Quitter
          </button>
        </div>
      </header>

      <main className="mobile-safe min-w-0">
        {error && <div role="alert" className="border-b border-[var(--etat-terracotta-dim)] bg-[var(--etat-terracotta-dim)] px-5 py-3 text-sm font-semibold text-[var(--etat-terracotta)]">{error}</div>}
        {showLoading ? <div className="grid min-h-[70vh] place-items-center text-sm text-[var(--etat-stone-600)]">Initialisation de votre espace…</div> : children}
      </main>
    </div>
  );
}
