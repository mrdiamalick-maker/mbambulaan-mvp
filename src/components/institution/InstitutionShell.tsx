"use client";

import { Bell, LogOut, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { usePresentationGuide } from "@/components/providers/PresentationGuideProvider";
import { EtatMobileNav, EtatSidebar } from "@/components/institution/EtatSidebar";

// Entrée technique distincte pour l'Espace État (D9, PRODUCT_DECISION_LOG.md) :
// pas AppSidebar/SidebarProvider composés différemment, une structure de
// navigation propre à ce que voit la Ministre. Aucun import de
// src/components/ui/sidebar ici — EtatSidebar est un composant propre à
// ce shell, pas une réutilisation du rail générique Coordinateur/
// Opérateur.
//
// A14 ("pas de rail de navigation permanent pour l'Espace État") est
// consciemment renversée ici (mandat CEO "nouvelle DA Vue d'ensemble",
// arbitrage Lot 0 2026-08-23, Décision 1) — historique complet dans
// git blame de ce fichier.
//
// P2.DESIGN-1A.2 (North Star Claude Design, addendum CEO) — shell
// reconstruit pour correspondre au prototype fourni (Espace Etat.dc.html) :
// sidebar marine pleine hauteur (EtatSidebar, 252px) + en-tête clair
// (#FBF8F0) au lieu du header sombre "bg-sidebar" générique. .etat-scope
// posé ici, à la racine du shell (pas seulement sur le contenu des
// pages) : sidebar, header et contenu partagent exactement les mêmes
// tokens --etat-* et la même police (--font-etat-*, chargée par
// src/app/app/etat/layout.tsx via next/font/google) — un seul système,
// pas un habillage par page.
function initials(name?: string) {
  if (!name) return "MB";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

// La barre de recherche du prototype ("Rechercher un territoire, une
// situation…") n'a pas d'équivalent fonctionnel réel dans le référentiel
// (aucune recherche transverse État aujourd'hui) : l'ajouter ici serait un
// habillage vide, contraire au mandat ("n'afficher que les capacités
// réellement supportées"). Volontairement omise plutôt que simulée.

export function InstitutionShell({
  children,
  orgName,
  actorName,
  persistence,
  unread,
  lastRefreshedAt,
  onLogout,
  error,
  showLoading
}: {
  children: React.ReactNode;
  orgName?: string;
  actorName?: string;
  persistence: string;
  unread: number;
  lastRefreshedAt: Date | null;
  onLogout: () => void;
  error: string;
  showLoading: boolean;
}) {
  const { start } = usePresentationGuide();
  return (
    <div className="etat-scope flex min-h-screen">
      {/* Sidebar : reste visible même pendant le chargement plutôt que
          d'apparaître seulement une fois les données prêtes — chrome
          stable, pas un flash de mise en page. Masquée sous lg
          (EtatSidebar gère son propre `hidden lg:flex`). */}
      <EtatSidebar onLogout={onLogout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[62px] shrink-0 items-center gap-5 border-b border-[var(--etat-line)] px-6 lg:px-[34px]" style={{ background: "var(--etat-warm-white)" }}>
          {/* XXL-RC1 (§2) — déclencheur du tiroir de navigation État,
              visible uniquement sous 1024px (même point de rupture que
              EtatSidebar, masquée au-dessus) : sans lui, Atlas/
              Arbitrages/Programmes/Résultats étaient injoignables sous
              ce seuil. */}
          <EtatMobileNav onLogout={onLogout} />
          <div className="flex-1" />
          {/* Horodatage réel — capturé au premier chargement des données
              (InstitutionProductShell.tsx), pas une heure fixe recopiée
              d'une maquette. Masqué tant que rien n'est encore chargé. */}
          {lastRefreshedAt && (
            <span className="hidden text-[11.5px] lg:inline" style={{ color: "rgba(11,26,42,.50)", fontFamily: "var(--font-etat-body), sans-serif" }}>
              MAJ aujourd’hui {lastRefreshedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button variant="ghost" size="sm" className="hidden gap-1.5 text-[var(--etat-navy)] hover:bg-black/5 sm:inline-flex" onClick={start} style={{ fontFamily: "var(--font-etat-body), sans-serif", fontSize: 12.5 }}>
            <PlayCircle size={15} /> Présentation guidée
          </Button>
          {/* XXL-R2 (§8, couleurs sémantiques) : pastille alignée sur
              --mb-success au lieu du vert Tailwind par défaut. */}
          <span className="hidden items-center gap-2 rounded-full border px-3 py-[5px] text-[11px] xl:inline-flex" style={{ borderColor: "rgba(11,26,42,.16)", color: "rgba(11,26,42,.60)", fontFamily: "var(--font-etat-body), sans-serif" }}>
            <span className="size-1.5 rounded-full" style={{ background: "var(--mb-success)" }} />
            {persistence === "postgresql" ? "Base de production" : "Mode démonstration"}
          </span>
          <div className="hidden h-6 w-px xl:block" style={{ background: "rgba(11,26,42,.12)" }} />
          {/* Cloche : compte réel de notifications non lues pour le rôle
              institution (state.notifications), jamais un chiffre
              illustratif. */}
          <Button variant="ghost" size="icon" className="relative text-[var(--etat-navy)] hover:bg-black/5" aria-label={`${unread} notification(s) non lue(s)`}>
            <Bell size={17} />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full border-2 bg-destructive text-[9px] font-bold text-white" style={{ borderColor: "var(--etat-warm-white)" }}>{unread}</span>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto gap-2.5 px-2 py-1.5 text-[var(--etat-navy)] hover:bg-black/5">
                <span className="grid size-[30px] shrink-0 place-items-center rounded-full text-[11px] font-semibold" style={{ background: "var(--etat-navy)", color: "var(--etat-cream)" }}>{initials(actorName)}</span>
                {/* "Accès État" décrit l'espace consulté, pas le rôle
                    système exact — jamais rendu en dehors de /app/etat
                    (garde de layout.tsx), reste honnête pour institution
                    comme pour administrateur. */}
                <span className="hidden flex-col items-start leading-tight sm:flex">
                  <span className="text-[12.5px] font-semibold" style={{ fontFamily: "var(--font-etat-body), sans-serif" }}>{actorName}</span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-[.13em]" style={{ color: "rgba(11,26,42,.45)" }}>Accès État</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{actorName ?? "Mon compte"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* orgName reste dynamique (organization?.name) — jamais un
                  Ministère précis recopié d'une maquette (mandat §11). */}
              {orgName && <div className="px-2 pb-1.5 text-xs text-muted-foreground">{orgName}</div>}
              <DropdownMenuItem onClick={onLogout} variant="destructive">
                <LogOut /> Quitter l’espace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        {error && (
          <div role="alert" className="border-b border-destructive/20 bg-destructive/10 px-5 py-3 text-sm font-semibold text-destructive">
            {error}
          </div>
        )}
        {showLoading ? (
          <div className="grid min-h-[70vh] flex-1 place-items-center text-sm" style={{ color: "var(--etat-stone-600)" }}>Initialisation de votre espace…</div>
        ) : (
          <main className="min-w-0 flex-1" style={{ background: "var(--etat-cream)" }}>{children}</main>
        )}
      </div>
    </div>
  );
}
