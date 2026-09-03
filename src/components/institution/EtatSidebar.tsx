"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileCheck2, Home, LayoutGrid, LogOut, MapPin, Menu, Scale, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Sidebar permanente Espace État (mandat CEO "nouvelle DA Vue d'ensemble",
// arbitrage Lot 0 2026-08-23, Décision 1 : "A14 est renversé
// consciemment"). A14 posait explicitement "pas de rail de navigation
// permanent" pour distinguer l'Espace État du shell Coordinateur/
// Opérateur — le CEO a validé ce renversement en toute connaissance de
// cause, ce n'est pas une régression accidentelle. Rendue par
// InstitutionShell.tsx (partagé /app/etat + /app/etat/rapport, arbitrage
// Lot 0 : "Option A retenue, Rapport en hérite aussi dès ce lot").
//
// Cibles de navigation (correctif "pas de scroll infini", 2026-08-26) :
// de vraies routes désormais, pas des ancres — Arbitrages/Programmes ont
// leurs propres pages dédiées (/app/etat/arbitrages, /app/etat/
// programmes), extraites du Brief national qui ne garde plus que carte +
// brief + synthèse + teasers. "Rapports & redevabilité" pointe vers
// /app/etat/rapport (le vrai rapport bailleurs déjà entièrement construit)
// — corrige au passage une incohérence héritée du lot précédent (son
// état "actif" testait déjà pathname === "/app/etat/rapport" alors que
// son href pointait ailleurs). Le nouveau registre "Décisions" (ex-
// #redevabilite sur /app/etat) vit sur /app/etat/redevabilite, atteint
// depuis le Brief national ("Ce qui est documenté" → "Décisions
// récentes") plutôt que depuis ce rail — pas un oubli, un choix pour ne
// pas dépasser les 6 items déjà nommés par le mandat d'origine.
//
// Territoires (mandat "2 changements décidés", 2026-08-28) : page dédiée
// construite (/app/etat/territoires, registre des 18 territoires +
// TerritoryDetail réutilisé tel quel) — item activé, plus de disabled.
//
// Performance & impact retiré de ce rail (même mandat, décision CEO
// explicite) : "un menu à 6 entrées dont une visiblement désactivée
// n'est pas acceptable pour une présentation au Ministère — mieux vaut
// 5 entrées toutes fonctionnelles". Retrait complet de l'entrée, pas un
// masquage CSS — reste dans le backlog produit (pas dans ce fichier)
// pour un sprint de raffinement post-rencontre, pas supprimé du projet,
// juste plus une ligne grisée ici tant qu'aucune page ne l'accompagne.
// XXL-R2 (§4 du mandat, "une navigation État claire") : libellés alignés
// sur les 5 niveaux de lecture demandés — "Vue d'ensemble" devient "Brief
// national" (c'est la même page, /app/etat, seul le nom change pour
// nommer ce qu'elle est réellement) ; "Rapports & redevabilité" devient
// "Résultats" (§18, arbitrage rendu ce lot : /app/etat/rapport est déjà
// la lecture la plus complète — synthèse exécutive, baseline/actuel/
// cible, financements, chaîne situation→preuve — donc la vraie
// destination "Résultats" ; /app/etat/redevabilite, plus étroite [un
// registre de décisions], reste volontairement hors de ce rail et
// continue à se lire comme une sous-profondeur, atteignable depuis le
// Brief national et depuis Rapport lui-même — jamais une 6e destination
// principale, cf. commentaire dans rapport/page.tsx).
// Exporté (XXL-RC1 §2) : même liste consommée par la sidebar desktop
// ci-dessous ET par EtatMobileNav (même fichier, plus bas) — une seule
// définition des 5 destinations, jamais une seconde liste à maintenir en
// parallèle pour le menu mobile.
export const navItems = [
  { href: "/app/etat", label: "Brief national", icon: Home },
  { href: "/app/etat/territoires", label: "Territoires", icon: MapPin },
  { href: "/app/etat/arbitrages", label: "Arbitrages", icon: Scale },
  { href: "/app/etat/programmes", label: "Programmes", icon: LayoutGrid },
  { href: "/app/etat/rapport", label: "Résultats", icon: FileCheck2 }
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

// XXL-RC1 (§2) — extrait de EtatSidebar (rendu identique, aucun style ni
// libellé changé) pour être partagé par la sidebar desktop ci-dessous ET
// par EtatMobileNav (même fichier, plus bas) : une seule implémentation
// des liens, jamais deux copies à faire évoluer en parallèle.
// onNavigate (optionnel) : appelé après un clic, utilisé par
// EtatMobileNav pour refermer le tiroir — no-op côté desktop (la sidebar
// permanente n'a rien à refermer).
function EtatNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-0.5">
      {navItems.map((item) => {
        // Actif = route courante exacte, un vrai test de pathname
        // désormais (ce sont de vraies pages, plus des ancres sur une
        // page qu'on ne rend jamais soi-même). Plus de branche
        // "désactivé" ici (mandat "2 changements décidés", 2026-08-28) :
        // Territoires est devenu une vraie page, Performance & impact a
        // été retiré entièrement — tous les items de navItems ont
        // désormais un href réel.
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition"
            style={active
              ? { backgroundColor: D9.terracottaDim, color: D9.terracotta, borderLeft: `3px solid ${D9.terracotta}` }
              : { color: D9.navy800, borderLeft: "3px solid transparent" }}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Idem : pied commun (Réglages désactivé + Déconnexion), extrait pour la
// même raison. Réglages reste désactivé pour la raison déjà documentée
// (aucune page de réglages Espace État n'existe encore) — inchangé.
function EtatNavFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="mt-4 space-y-0.5 pt-3" style={{ borderTop: `1px solid ${D9.line}` }}>
      <span className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold" style={{ color: D9.stone400 }} aria-disabled="true" title="Pas encore disponible">
        <Settings size={17} />
        Réglages
      </span>
      <button onClick={onLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#5c6a74] transition hover:bg-[#f6f1e7] hover:text-[#b6522f]">
        <LogOut size={17} />
        Déconnexion
      </button>
    </div>
  );
}

export function EtatSidebar({ onLogout }: { onLogout: () => void }) {
  // XXL-R2 (§3, §6, §41.A) — renverse l'arbitrage "Option A" du mandat
  // Brief national (2026-08-23), qui retirait la sidebar de /app/etat
  // lui-même ("pas six modules concurrents à l'ouverture"). Ce nouvel
  // arbitrage, explicite dans le mandat courant, part du même constat que
  // le CEO : "le Brief national paraît isolé des autres pages /app/etat"
  // — masquer la seule navigation permanente précisément sur la page la
  // plus visitée était la cause structurelle de cet isolement, pas une
  // qualité éditoriale à préserver. Le Brief garde toute sa composition
  // narrative (rien retiré de son contenu) ; il gagne seulement le même
  // repère de navigation que Territoires/Arbitrages/Programmes/Résultats
  // ont toujours eu — condition explicite de "grammaire commune" (§6) et
  // du test de continuité (§32).
  return (
    <aside className="hidden w-56 shrink-0 flex-col bg-white p-3 lg:flex" style={{ borderRight: `1px solid ${D9.line}` }}>
      <EtatNavLinks />
      <EtatNavFooter onLogout={onLogout} />
    </aside>
  );
}

// XXL-RC1 (§2) — navigation État compacte pour tablette/mobile : sous
// 1024px, EtatSidebar est entièrement `hidden` (cf. ci-dessus) et aucun
// repli n'existait — Territoires/Arbitrages/Programmes/Résultats
// devenaient injoignables sans URL directe (P1 confirmé par les deux
// audits de release). Un bouton discret dans le header (InstitutionShell,
// visible seulement `lg:hidden`, même discipline que la sidebar qui se
// cache au même point de rupture) ouvre un tiroir Sheet reprenant EXACTEMENT
// les mêmes 5 destinations et le même pied (EtatNavLinks/EtatNavFooter,
// composants partagés ci-dessus) — aucune route nouvelle, aucune
// navigation métier inventée pour ce lot. Se referme automatiquement au
// clic sur un lien (onNavigate) : sur mobile, un tiroir qui reste ouvert
// après avoir déjà navigué est le premier signe d'une navigation qui a
// l'air cassée.
export function EtatMobileNav({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-9 shrink-0 place-items-center rounded-md text-sidebar-foreground transition hover:bg-white/10 lg:hidden"
        aria-label="Ouvrir la navigation de l’Espace État"
      >
        <Menu size={19} />
      </button>
      <SheetContent side="left" className="w-72 gap-0 bg-white p-3">
        <SheetHeader className="p-1 pb-2">
          <SheetTitle className="text-left text-sm font-bold" style={{ color: D9.navy800 }}>Espace État</SheetTitle>
        </SheetHeader>
        {/* onNavigate referme le tiroir (état contrôlé open/setOpen) au
            clic sur une destination — pas de SheetClose ici : ses liens
            sont imbriqués dans EtatNavLinks (composant partagé avec le
            desktop), et Radix Close n'intercepte que son enfant direct,
            pas des liens plus profonds dans l'arbre. */}
        <EtatNavLinks onNavigate={() => setOpen(false)} />
        <EtatNavFooter onLogout={onLogout} />
      </SheetContent>
    </Sheet>
  );
}
