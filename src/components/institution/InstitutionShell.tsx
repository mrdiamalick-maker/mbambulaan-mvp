"use client";

import Link from "next/link";
import { LogOut, PlayCircle } from "lucide-react";
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

// Entrée technique distincte pour l'Espace État (D9, PRODUCT_DECISION_LOG.md) :
// pas AppSidebar/SidebarProvider composés différemment, une structure de
// navigation propre à ce que voit la Ministre. Décision-first (A14) :
// un seul niveau (le fil national → territoire → situation), pas de rail
// de navigation à items multiples — le retour se fait par un lien, pas
// par un menu permanent. Aucun import de src/components/ui/sidebar ici.
function initials(name?: string) {
  if (!name) return "MB";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function InstitutionShell({
  children,
  orgName,
  actorName,
  persistence,
  onLogout,
  error,
  showLoading
}: {
  children: React.ReactNode;
  orgName?: string;
  actorName?: string;
  persistence: string;
  onLogout: () => void;
  error: string;
  showLoading: boolean;
}) {
  const { start } = usePresentationGuide();
  return (
    <div className="shadcn-scope flex min-h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-sidebar px-5 text-sidebar-foreground lg:px-8">
        <Link href="/app/etat" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-black text-primary-foreground">M</span>
          <span className="hidden text-sm font-semibold sm:inline">Espace État</span>
        </Link>
        <span className="hidden truncate text-xs text-sidebar-foreground/60 md:inline">
          {orgName ?? "Ministère de la Pêche et de l’Économie Maritime"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden gap-1.5 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground sm:inline-flex" onClick={start}>
            <PlayCircle size={15} /> Présentation guidée
          </Button>
          <Badge variant="outline" className="hidden gap-1.5 border-white/15 text-sidebar-foreground/70 xl:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {persistence === "postgresql" ? "Base de production" : "Environnement de démonstration"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[11px]">{initials(actorName)}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{actorName}</span>
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
      {showLoading ? (
        <div className="grid min-h-[70vh] flex-1 place-items-center text-sm text-muted-foreground">Initialisation de votre espace…</div>
      ) : (
        <main className="min-w-0 flex-1">{children}</main>
      )}
    </div>
  );
}
