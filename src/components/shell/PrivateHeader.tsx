"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut, PlayCircle, RotateCcw } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePresentationGuide } from "@/components/providers/PresentationGuideProvider";
import { spaceIdentityLabel, type PrivateSpace } from "@/domain/platform/private-nav";

function initials(name?: string) {
  if (!name) return "MB";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

// LOT V3.1 (Scope A/G) — en-tête UNIQUE pour tout l'espace privé,
// remplaçant src/components/shell/SiteHeader.tsx (Coordination) et l'en-tête
// dédié construit à la main dans src/components/institution/InstitutionShell.tsx
// (Espace État). Les deux affichaient déjà le même contenu réel (badge de
// persistance, cloche de notifications, menu de compte avec déconnexion) —
// seule la présentation divergeait, plus deux capacités qui existaient dans
// un seul des deux en-têtes sans raison de fond de le rester : le bouton
// "Présentation guidée" (état seulement, alors que le fil rouge traverse
// aussi la Coordination — cf. src/lib/presentation-guide.ts) et le bouton
// de réinitialisation démo (Coordination seulement, alors que
// useProduct().reset() est une capacité générique, pas propre à un rôle).
// Les deux sont désormais proposés dans les deux espaces (Scope G : retirer
// les signaux de séparation qui n'en sont pas, sans jamais fabriquer une
// capacité qui n'existe pas). `title`/`subtitle` restent optionnels : omis
// pour l'Espace État (son en-tête n'en affichait pas avant ce lot — aucune
// régression visuelle introduite), renseignés pour la Coordination (identique
// à l'ancien SiteHeader).
export function PrivateHeader({
  space,
  title,
  subtitle,
  actorName,
  unread,
  persistence,
  onReset,
  onLogout,
  error,
  showLoading
}: {
  space: PrivateSpace;
  title?: string;
  subtitle?: string;
  actorName?: string;
  unread: number;
  persistence: string;
  onReset?: () => void;
  onLogout: () => void;
  error: string;
  showLoading: boolean;
}) {
  const { start } = usePresentationGuide();
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  useEffect(() => {
    if (!showLoading && !lastRefreshedAt) setLastRefreshedAt(new Date());
  }, [showLoading, lastRefreshedAt]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        {(title || subtitle) && (
          <>
            <Separator orientation="vertical" className="mr-1 h-4" />
            <div className="min-w-0">
              {title && <p className="truncate text-sm font-semibold">{title}</p>}
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          {/* Horodatage réel du premier chargement des données — même mécanisme
              que l'ancien InstitutionShell.tsx, désormais commun aux deux
              espaces plutôt que propre à l'un d'eux. */}
          {lastRefreshedAt && (
            <span className="hidden text-xs text-muted-foreground lg:inline">
              MAJ aujourd’hui {lastRefreshedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {/* Libellé masqué sous lg (icône seule dès sm) — sans ce repli,
              l'ajout de ce bouton aux DEUX espaces (il n'existait qu'à
              l'Espace État avant ce lot) fait déborder l'en-tête à 768px
              une fois combiné aux autres affordances déjà présentes côté
              Coordination (réinitialisation démo, cloche, compte) —
              trouvé en QA visuelle réelle à 768px, pas en inspection de
              code seule. */}
          <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex" onClick={start} aria-label="Présentation guidée">
            <PlayCircle size={15} /> <span className="hidden lg:inline">Présentation guidée</span>
          </Button>
          <Badge variant="outline" className="hidden gap-1.5 xl:inline-flex">
            <span className="size-1.5 rounded-full" style={{ background: "var(--mb-success)" }} />
            {persistence === "postgresql" ? "Base de production" : "Mode démonstration · données non opérationnelles"}
          </Badge>
          {onReset && (
            <Button variant="outline" size="icon" onClick={onReset} title="Réinitialiser la démonstration" aria-label="Réinitialiser la démonstration">
              <RotateCcw />
            </Button>
          )}
          {/* Cloche : compte réel de notifications non lues (jamais un
              chiffre illustratif) — mêmes données que l'ancien en-tête État,
              désormais avec le même affichage pour les deux espaces. */}
          <Button variant="ghost" size="icon" className="relative" aria-label={`${unread} notification(s) non lue(s)`}>
            <Bell />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full border-2 border-background bg-destructive text-[9px] font-bold text-white">{unread}</span>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[11px]">{initials(actorName)}</AvatarFallback>
                </Avatar>
                <span className="hidden flex-col items-start leading-tight sm:flex">
                  <span className="text-sm font-medium">{actorName}</span>
                  {/* Décrit l'espace consulté, pas le rôle système exact —
                      jamais rendu ailleurs (garde de layout serveur), reste
                      honnête pour institution comme pour administrateur. */}
                  <span className="text-[9.5px] font-semibold uppercase tracking-[.1em] text-muted-foreground">{spaceIdentityLabel(space)}</span>
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
    </>
  );
}
