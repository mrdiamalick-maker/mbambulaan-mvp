"use client";

import Link from "next/link";
import { LogOut, ShipWheel } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Entrée technique distincte pour le Terrain mobile (D9,
// PRODUCT_DECISION_LOG.md — échéance Lot 6, symétrique à InstitutionShell
// pour l'Espace État au Lot 2) : ni AppSidebar/SidebarProvider composé
// différemment, ni la simulation décorative retirée (UnifiedWorkView) —
// une structure de navigation propre, mobile-first réelle (§11.1 du spec
// maître) : une colonne centrée étroite même sur grand écran (le geste
// reste celui d'un téléphone), un seul niveau, pas de rail latéral, gros
// boutons. Aucun import de src/components/ui/sidebar ici.
function initials(name?: string) {
  if (!name) return "MB";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function TerrainShell({
  children,
  actorName,
  onLogout,
  error,
  showLoading
}: {
  children: React.ReactNode;
  actorName?: string;
  onLogout: () => void;
  error: string;
  showLoading: boolean;
}) {
  return (
    <div className="shadcn-scope flex min-h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-sidebar px-4 text-sidebar-foreground">
        <Link href="/app/terrain" className="flex shrink-0 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><ShipWheel size={16} /></span>
          <span className="text-sm font-semibold">Terrain</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground">
                <Avatar className="size-7"><AvatarFallback className="text-[11px]">{initials(actorName)}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{actorName ?? "Mon compte"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} variant="destructive"><LogOut /> Quitter l’espace</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {error && (
        <div role="alert" className="border-b border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </div>
      )}
      {showLoading ? (
        <div className="grid min-h-[70vh] flex-1 place-items-center text-sm text-muted-foreground">Initialisation de votre espace…</div>
      ) : (
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-5 pb-16">{children}</main>
      )}
    </div>
  );
}
