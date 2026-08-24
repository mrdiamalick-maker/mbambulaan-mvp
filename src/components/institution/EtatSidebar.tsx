"use client";

import { usePathname } from "next/navigation";
import { FileCheck2, Home, LayoutGrid, LineChart, LogOut, MapPin, Scale, Settings } from "lucide-react";

// Sidebar permanente Espace État (mandat CEO "nouvelle DA Vue d'ensemble",
// arbitrage Lot 0 2026-08-23, Décision 1 : "A14 est renversé
// consciemment"). A14 posait explicitement "pas de rail de navigation
// permanent" pour distinguer l'Espace État du shell Coordinateur/
// Opérateur — le CEO a validé ce renversement en toute connaissance de
// cause, ce n'est pas une régression accidentelle. Rendue par
// InstitutionShell.tsx (partagé /app/etat + /app/etat/rapport, arbitrage
// Lot 0 : "Option A retenue, Rapport en hérite aussi dès ce lot").
//
// Cibles d'ancrage : les items pointent vers les sections de /app/etat
// (#terrain, #arbitrage-detail, etc.), toujours une vraie navigation
// /app/etat#ancre depuis ce composant — il ne se rend jamais SUR /app/etat
// lui-même désormais (cf. garde plus haut), donc plus besoin de choisir
// entre ancrage natif et navigation complète.
//
// Territoires et Performance & impact (mandat "Brief national",
// 2026-08-23) : les chapitres #territoires et #performance ont été
// retirés de /app/etat (carrousel "Où concentrer l'attention" → future
// page dédiée /app/etat/territoires ; "Résultats de la coordination" →
// future page dédiée /app/etat/performance, aucune des deux construite
// pour l'instant). Items gardés présents mais désactivés — même
// discipline que "Réglages" ci-dessous : la structure nommée par le
// mandat d'origine reste visible, sans pointer vers une ancre qui
// n'existe plus ou une route qui n'existe pas encore.
const navItems = [
  { anchor: "#terrain", label: "Vue d’ensemble", icon: Home },
  { anchor: "#territoires", label: "Territoires", icon: MapPin, disabled: true },
  { anchor: "#arbitrage-detail", label: "Arbitrages", icon: Scale },
  { anchor: "#programmes-detail", label: "Programmes", icon: LayoutGrid },
  { anchor: "#performance", label: "Performance & impact", icon: LineChart, disabled: true },
  { anchor: "#redevabilite", label: "Rapports & redevabilité", icon: FileCheck2 }
] as const;

// Couleurs D9 en valeurs littérales, pas en var(--etat-*) : ce shell est
// rendu hors de tout conteneur .etat-scope (celui-ci n'enveloppe que le
// contenu de /app/etat/page.tsx, pas le header/sidebar partagés) — les
// tokens etat-* ne résolvent donc à rien ici. Mêmes valeurs exactes que
// etat-design-system.css (--etat-terracotta, --etat-terracotta-dim,
// --etat-line, --etat-navy-800, --etat-stone-600, --etat-stone-400,
// --etat-offwhite), pas de nouvelle teinte inventée pour ce composant.
const D9 = {
  terracotta: "#b6522f",
  terracottaDim: "#f1ded3",
  line: "rgba(16, 41, 68, .12)",
  navy800: "#102944",
  stone600: "#5c6a74",
  stone400: "#8c9aa2",
  offwhite: "#f6f1e7"
};

export function EtatSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();

  // Retrait du premier écran (mandat "Brief national", arbitrage
  // 2026-08-23, Décision "Option A") : la sidebar permanente disparaît de
  // /app/etat lui-même — "pas six modules concurrents à l'ouverture" — mais
  // /app/etat/rapport la garde, explicitement ("reste un explorateur de
  // preuves formelles où la navigation permanente a du sens"). Ce n'est pas
  // un retour silencieux à l'A14 d'origine : c'est un nouvel arbitrage,
  // scopé à cette seule route, qui prévaut sur la Décision 1 du mandat
  // précédent (sidebar partagée sur les deux pages). onEtatPage n'a donc
  // plus qu'un seul rôle : ce garde de sortie précoce.
  if (pathname === "/app/etat") return null;

  return (
    <aside className="hidden w-56 shrink-0 flex-col bg-white p-3 lg:flex" style={{ borderRight: `1px solid ${D9.line}` }}>
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          if ("disabled" in item && item.disabled) {
            return (
              <span key={item.anchor} className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold" style={{ color: D9.stone400, borderLeft: "3px solid transparent" }} aria-disabled="true" title="Page dédiée à venir">
                <item.icon size={17} />
                {item.label}
              </span>
            );
          }
          // Approximation honnête, pas un scroll-spy réel (gain marginal
          // pour un observer supplémentaire, non demandé par le mandat) :
          // seul "Rapports & redevabilité" a un état actif ici, puisque
          // ce composant ne se rend jamais SUR /app/etat lui-même — les
          // autres items naviguent toujours vers /app/etat, jamais "actifs"
          // depuis /app/etat/rapport.
          const active = item.anchor === "#redevabilite" && pathname === "/app/etat/rapport";
          return (
            <a
              key={item.anchor}
              href={`/app/etat${item.anchor}`}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition"
              style={active
                ? { backgroundColor: D9.terracottaDim, color: D9.terracotta, borderLeft: `3px solid ${D9.terracotta}` }
                : { color: D9.navy800, borderLeft: "3px solid transparent" }}
            >
              <item.icon size={17} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="mt-4 space-y-0.5 pt-3" style={{ borderTop: `1px solid ${D9.line}` }}>
        {/* Réglages (mandat, structure explicite du sidebar) : aucune
            page de réglages Espace État n'existe encore dans le produit —
            rendu présent (le mandat le nomme dans la structure à
            reproduire) mais désactivé plutôt que de pointer vers une
            route qui n'existe pas ou de simuler un comportement. */}
        <span className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold" style={{ color: D9.stone400 }} aria-disabled="true" title="Pas encore disponible">
          <Settings size={17} />
          Réglages
        </span>
        <button onClick={onLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#5c6a74] transition hover:bg-[#f6f1e7] hover:text-[#b6522f]">
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
