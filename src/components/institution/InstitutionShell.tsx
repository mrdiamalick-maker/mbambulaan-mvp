"use client";

import Link from "next/link";
import { FileText, Gavel, Landmark, LogOut, MapPinned, PlayCircle } from "lucide-react";
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
    <div className="shadcn-scope flex min-h-screen flex-col bg-[#f7f8f5]">
      <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center gap-4 border-b border-[#102944]/10 bg-white/95 px-4 text-[#071627] shadow-[0_1px_0_rgba(7,22,39,.02)] backdrop-blur-xl lg:px-8">
        <Link href="/app/etat" className="flex shrink-0 items-center gap-3 py-2">
          <span className="grid size-9 place-items-center rounded-xl bg-[#0b6f6b] text-sm font-black text-white shadow-[0_6px_18px_rgba(11,111,107,.2)]">M</span>
          <span className="leading-tight">
            <span className="block text-sm font-black tracking-[-.02em]">Mbàmbulaan</span>
            <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#5c6a74]">Espace État</span>
          </span>
        </Link>

        <nav aria-label="Navigation de l’Espace État" className="ml-5 hidden items-center gap-1 border-l border-[#102944]/10 pl-5 xl:flex">
          <Link href="/app/etat#terrain" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-[#5c6a74] transition hover:bg-[#eef7f5] hover:text-[#0b6f6b]"><MapPinned size={14} /> Vue nationale</Link>
          <Link href="/app/etat#arbitrage" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-[#5c6a74] transition hover:bg-[#eef7f5] hover:text-[#0b6f6b]"><Gavel size={14} /> Arbitrages</Link>
          <Link href="/app/etat#decisions" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-[#5c6a74] transition hover:bg-[#eef7f5] hover:text-[#0b6f6b]"><Landmark size={14} /> Décisions</Link>
          <Link href="/app/etat/rapport" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-[#5c6a74] transition hover:bg-[#eef7f5] hover:text-[#0b6f6b]"><FileText size={14} /> Rapport</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden max-w-48 truncate text-right text-[11px] leading-4 text-[#8c9aa2] 2xl:block">
            {orgName ?? "Ministère de la Pêche et de l’Économie Maritime"}
          </span>
          <Button variant="ghost" size="sm" className="hidden gap-1.5 text-[#102944] hover:bg-[#eef7f5] hover:text-[#0b6f6b] sm:inline-flex" onClick={start}>
            <PlayCircle size={15} /> Présentation guidée
          </Button>
          <Badge variant="outline" className="hidden gap-1.5 border-[#c68a2c]/25 bg-[#fff8e8] text-[#8a5b17] 2xl:inline-flex">
            <span className="size-1.5 rounded-full bg-[#c68a2c]" />
            {persistence === "postgresql" ? "Base de production" : "Mode démonstration · données non opérationnelles"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 text-[#102944] hover:bg-[#eef7f5] hover:text-[#102944]">
                <Avatar className="size-8 border border-[#102944]/10">
                  <AvatarFallback className="bg-[#f4f1e9] text-[11px] font-black text-[#102944]">{initials(actorName)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-36 truncate text-sm font-semibold lg:inline">{actorName}</span>
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
