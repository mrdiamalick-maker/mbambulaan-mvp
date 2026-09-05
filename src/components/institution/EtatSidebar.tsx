"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileCheck2, Home, LayoutGrid, LogOut, MapPin, Menu, Scale } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TrustGlyph } from "@/components/etat/TrustGlyph";

// Sidebar permanente Espace État (mandat CEO "nouvelle DA Vue d'ensemble",
// arbitrage Lot 0 2026-08-23, Décision 1 : "A14 est renversé
// consciemment") — historique complet conservé dans l'ancienne version de
// ce fichier (git blame). Cibles de navigation : de vraies routes, pas des
// ancres.
//
// P2.DESIGN-1A.2 (North Star Claude Design, addendum CEO) — habillage
// entièrement reconstruit pour correspondre au prototype fourni
// (Espace Etat.dc.html) : wordmark serif + vaguelettes, nav à puce ronde
// (pleine si active, creuse sinon) sur fond marine plein, légende de
// confiance en pied de sidebar. Les 5 destinations réelles ne changent
// pas ; "Dossiers"/"Paramètres" du prototype ne sont PAS ajoutés comme
// routes qui n'existent pas dans le référentiel (mandat explicite,
// "repository routes remain authoritative") — seul "Réglages" (déjà
// existant, déjà désactivé faute de page dédiée) est conservé.
export const navItems = [
  { href: "/app/etat", label: "Brief national", icon: Home },
  { href: "/app/etat/territoires", label: "Atlas territorial", icon: MapPin },
  { href: "/app/etat/arbitrages", label: "Arbitrages", icon: Scale },
  { href: "/app/etat/programmes", label: "Programmes", icon: LayoutGrid },
  { href: "/app/etat/rapport", label: "Résultats", icon: FileCheck2 }
] as const;

// XXL-RC1 (§2) — extrait de EtatSidebar (rendu identique, aucun style ni
// libellé changé) pour être partagé par la sidebar desktop ci-dessous ET
// par EtatMobileNav (même fichier, plus bas) : une seule implémentation
// des liens, jamais deux copies à faire évoluer en parallèle.
function EtatNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex w-full items-center gap-3 rounded-sm px-3.5 py-2.5 text-left font-medium transition"
            style={{
              fontFamily: "var(--font-etat-body), 'IBM Plex Sans', sans-serif",
              fontSize: 13.5,
              background: active ? "rgba(182,82,47,.20)" : "transparent",
              color: active ? "#F7F3E9" : "rgba(247,243,233,.70)",
              boxShadow: active ? "inset 2px 0 0 #B6522F" : undefined,
              fontWeight: active ? 600 : 500
            }}
          >
            <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full" style={{ background: active ? "#DE7A50" : "rgba(247,243,233,.28)" }} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Idem : légende de confiance + pied (Réglages désactivé + Déconnexion),
// extrait pour la même raison. Signature de confiance (mandat P2.DESIGN-
// 1A.2 §10) : ○ Déclarée / ◐ Observée / ● Vérifiée, même vocabulaire que
// TrustGlyph (partagé avec les registres et le dossier territorial) —
// jamais un second lexique de confiance pour la sidebar.
function EtatNavFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="mt-auto">
      <div className="mx-6 h-px" style={{ background: "rgba(247,243,233,.12)" }} />
      <div className="px-6 py-5">
        <p className="mb-3 text-[9.5px] font-semibold uppercase tracking-[.16em]" style={{ color: "rgba(247,243,233,.45)" }}>Niveau de connaissance</p>
        <div className="flex flex-col gap-2 text-[11.5px]" style={{ color: "rgba(247,243,233,.72)", fontFamily: "var(--font-etat-body), 'IBM Plex Sans', sans-serif" }}>
          <div className="flex items-center gap-2.5"><TrustGlyph level="declaree" onDark /> Déclarée</div>
          <div className="flex items-center gap-2.5"><TrustGlyph level="observee" onDark /> Observée</div>
          <div className="flex items-center gap-2.5"><TrustGlyph level="verifiee" onDark /> Vérifiée</div>
        </div>
      </div>
      <div className="mx-6 h-px" style={{ background: "rgba(247,243,233,.12)" }} />
      <div className="space-y-0.5 px-3 py-3">
        <span className="flex cursor-not-allowed items-center gap-2.5 rounded-sm px-3.5 py-2 text-[13px] font-medium" style={{ color: "rgba(247,243,233,.40)" }} aria-disabled="true" title="Pas encore disponible">
          Réglages
        </span>
        <button onClick={onLogout} className="flex w-full items-center gap-2.5 rounded-sm px-3.5 py-2 text-left text-[13px] font-medium transition hover:bg-white/[.07]" style={{ color: "rgba(247,243,233,.70)" }}>
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
    </div>
  );
}

export function EtatSidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col lg:flex" style={{ background: "var(--etat-navy, #0B1A2A)" }}>
      <div className="flex items-center gap-3 px-6 pb-[22px] pt-[26px]">
        <svg viewBox="0 0 28 28" width="26" height="26" className="shrink-0" aria-hidden="true">
          <path d="M2 11 Q7 5 14 11 T26 11" fill="none" stroke="#B6522F" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M2 18 Q7 12 14 18 T26 18" fill="none" stroke="#F7F3E9" strokeWidth="2.1" strokeLinecap="round" opacity="0.85" />
        </svg>
        <div>
          <div style={{ fontFamily: "var(--font-etat-display), Newsreader, serif", fontSize: 19, lineHeight: 1, letterSpacing: ".01em", color: "#F7F3E9" }}>Mbàmbulaan</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[.16em]" style={{ color: "rgba(247,243,233,.55)" }}>Espace État</div>
        </div>
      </div>
      <EtatNavLinks />
      <EtatNavFooter onLogout={onLogout} />
    </aside>
  );
}

// XXL-RC1 (§2) — navigation État compacte pour tablette/mobile : sous
// 1024px, EtatSidebar est entièrement masquée — un bouton discret dans le
// header ouvre un tiroir Sheet reprenant les mêmes destinations.
export function EtatMobileNav({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-9 shrink-0 place-items-center rounded-sm text-[var(--etat-navy)] transition hover:bg-black/5 lg:hidden"
        aria-label="Ouvrir la navigation de l’Espace État"
      >
        <Menu size={19} />
      </button>
      <SheetContent side="left" className="w-72 gap-0 border-0 p-0" style={{ background: "var(--etat-navy, #0B1A2A)" }}>
        <SheetHeader className="px-6 pb-3 pt-6">
          <SheetTitle className="text-left text-sm font-semibold" style={{ fontFamily: "var(--font-etat-display), Newsreader, serif", color: "#F7F3E9" }}>Espace État</SheetTitle>
        </SheetHeader>
        <EtatNavLinks onNavigate={() => setOpen(false)} />
        <EtatNavFooter onLogout={onLogout} />
      </SheetContent>
    </Sheet>
  );
}
