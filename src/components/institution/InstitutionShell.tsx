"use client";

import Link from "next/link";
import { Bell, Clock, LogOut, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { EtatSidebar } from "@/components/institution/EtatSidebar";

// Entrée technique distincte pour l'Espace État (D9, PRODUCT_DECISION_LOG.md) :
// pas AppSidebar/SidebarProvider composés différemment, une structure de
// navigation propre à ce que voit la Ministre. Aucun import de
// src/components/ui/sidebar ici — EtatSidebar est un composant propre à
// ce shell, pas une réutilisation du rail générique Coordinateur/
// Opérateur.
//
// A14 ("pas de rail de navigation permanent pour l'Espace État") est
// consciemment renversée ici (mandat CEO "nouvelle DA Vue d'ensemble",
// arbitrage Lot 0 2026-08-23, Décision 1 : "l'Option A est retenue, le
// shell partagé porte la sidebar — /app/etat/rapport en hérite aussi dès
// ce lot, avant sa propre passe de validation dédiée. C'est cohérent,
// pas une incohérence à corriger plus tard.") — ce n'est pas un oubli de
// mise à jour du commentaire A14 d'origine, c'est le nouvel arbitrage qui
// prévaut explicitement sur l'ancien.
function initials(name?: string) {
  if (!name) return "MB";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

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
    <div className="shadcn-scope private-shell flex min-h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-sidebar px-5 text-sidebar-foreground lg:px-8">
        {/* Lot 1 (Refonte Premium XXL, mandat §2) : wordmark "Mbàmbulaan"
            (même patron que AppSidebar.tsx, cohérence inter-shells) +
            "Espace État" détaché en terracotta (text-sidebar-primary,
            même token verrouillé D9 que le reste du produit, pas une
            teinte inventée) — auparavant un seul libellé "Espace État"
            sans distinction visuelle du nom du produit. orgName reste
            dynamique (organization?.name, jamais un texte recopié
            d'une maquette). */}
        <Link href="/app/etat" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-black text-primary-foreground">M</span>
          <span className="hidden text-sm font-semibold sm:inline">Mbàmbulaan</span>
        </Link>
        <span className="hidden items-baseline gap-2 truncate text-xs md:flex">
          <span className="font-bold text-sidebar-primary">Espace État</span>
          <span className="truncate text-sidebar-foreground/60">{orgName ?? "Ministère de la Pêche et de l’Économie Maritime"}</span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          {/* Raffinement visuel (maquette validée, arbitrage CEO
              2026-08-18) : horodatage réel — capturé au premier
              chargement des données (InstitutionProductShell.tsx), pas
              une heure fixe recopiée de la maquette. Masqué tant que
              rien n'est encore chargé plutôt que d'afficher une valeur
              vide ou inventée. */}
          {lastRefreshedAt && (
            <span className="hidden items-center gap-1.5 text-xs text-sidebar-foreground/60 lg:inline-flex">
              <Clock size={13} /> MAJ aujourd’hui {lastRefreshedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button variant="ghost" size="sm" className="hidden gap-1.5 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground sm:inline-flex" onClick={start}>
            <PlayCircle size={15} /> Présentation guidée
          </Button>
          <Badge variant="outline" className="hidden gap-1.5 border-white/15 text-sidebar-foreground/70 xl:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {persistence === "postgresql" ? "Base de production" : "Mode démonstration · données non opérationnelles"}
          </Badge>
          {/* Cloche : compte réel de notifications non lues pour le rôle
              institution (state.notifications, même mécanisme que
              ProductShell.tsx/SiteHeader.tsx pour le shell Coordinateur/
              Opérateur) — jamais le "3" illustratif de la maquette. */}
          <Button variant="ghost" size="icon" className="relative text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground" aria-label={`${unread} notification(s) non lue(s)`}>
            <Bell />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full border-2 border-sidebar bg-destructive text-[9px] font-bold text-white">{unread}</span>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[11px]">{initials(actorName)}</AvatarFallback>
                </Avatar>
                {/* "Accès État" (Lot 1, mandat §2) : décrit l'espace
                    consulté, pas le rôle système exact de la personne —
                    cette coquille n'est jamais rendue en dehors de
                    /app/etat (garde de layout.tsx), l'étiquette reste
                    donc honnête pour institution comme pour
                    administrateur. */}
                <span className="hidden flex-col items-start leading-tight sm:flex">
                  <span className="text-sm font-medium">{actorName}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">Accès État</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{actorName ?? "Mon compte"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} variant="destructive">
                <LogOut /> Quitter l’espace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {error && (
        <div role="alert" className="border-b border-destructive/20 bg-destructive/10 px-5 py-3 text-sm font-semibold text-destructive">
          {error}
        </div>
      )}
      {/* Ligne sidebar + contenu (Décision 1) : la sidebar reste visible
          même pendant le chargement plutôt que d'apparaître seulement une
          fois les données prêtes — chrome stable, pas un flash de mise en
          page. Masquée sous lg (EtatSidebar gère son propre `hidden
          lg:flex`) : pas de rail permanent sur mobile, cohérent avec le
          reste du produit qui n'a jamais de sidebar en dessous de ce
          point de rupture. */}
      <div className="flex flex-1">
        <EtatSidebar onLogout={onLogout} />
        {showLoading ? (
          <div className="grid min-h-[70vh] flex-1 place-items-center text-sm text-muted-foreground">Initialisation de votre espace…</div>
        ) : (
          <main className="min-w-0 flex-1">{children}</main>
        )}
      </div>
    </div>
  );
}
