"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BellRing, Radio } from "lucide-react";
import type { ProductState, Role } from "@/domain/types";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { DecisionIcon, EngagementIcon } from "@/components/etat/MotifIcons";
import { ChannelBadge, TrustBadge } from "@/components/shared/StatusBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CoordinatorSignalForm } from "@/components/work/CoordinatorSignalForm";
import { glyphBorderColor, priorityLabels, priorityToTag } from "@/lib/status-tokens";

const priorityWeight = { critique: 4, haute: 3, moyenne: 2, faible: 1 } as const;
const SITUATIONS_PAGE_SIZE = 8;

function TerritoryTexture() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden md:block" aria-hidden="true">
      <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <g stroke="#f7f3e9" strokeWidth="1.5" fill="none" opacity="0.09">
          <path d="M0,140 C300,190 640,110 980,170 S1440,150 1600,210" />
          <path d="M0,260 C320,300 660,230 1000,280 S1460,270 1600,320" />
          <path d="M0,400 C300,440 640,380 980,420 S1440,410 1600,450" />
        </g>
        <g stroke="#0b1a2a" strokeWidth="1.5" fill="none" opacity="0.12">
          <path d="M0,80 C280,40 640,100 980,60 S1420,80 1600,50" />
          <path d="M0,530 C300,570 640,510 980,540 S1440,530 1600,570" />
          <path d="M0,630 C300,670 620,610 960,640 S1400,620 1600,660" />
        </g>
        <g stroke="#f7f3e9" strokeWidth="1" opacity="0.10">
          <line x1="1180" y1="420" x2="1320" y2="500" />
          <line x1="1320" y1="500" x2="1440" y2="440" />
          <line x1="1440" y1="440" x2="1500" y2="560" />
        </g>
        <g fill="#f7f3e9" opacity="0.13">
          <circle cx="1180" cy="420" r="4" />
          <circle cx="1320" cy="500" r="4" />
          <circle cx="1500" cy="560" r="4" />
          <circle cx="1250" cy="590" r="3.5" />
          <circle cx="1050" cy="500" r="3.5" />
        </g>
        <circle cx="1440" cy="440" r="4" fill="#b6522f" opacity="0.13" />
      </svg>
      <p className="absolute bottom-3 right-3 rounded-md bg-black/25 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white/45 backdrop-blur-sm">Placeholder · coordinator-territory-texture.svg</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "À planifier";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function CoordinatorHub({ state, actorId, role }: { state: ProductState; actorId: string; role: Role }) {
  const [signalDrawerOpen, setSignalDrawerOpen] = useState(false);
  const [visibleSituationsCount, setVisibleSituationsCount] = useState(SITUATIONS_PAGE_SIZE);
  const actor = state.actors.find((item) => item.id === actorId);
  const territoryIds = new Set(actor?.territoryIds ?? []);
  const territory = state.territories.find((item) => territoryIds.has(item.id)) ?? state.territories[0];
  const situations = state.situations.filter((item) => territoryIds.size === 0 || territoryIds.has(item.territoryId));
  const openSituations = situations.filter((item) => item.status !== "reglee").sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  const critical = openSituations.filter((item) => item.priority === "critique");
  const resolvedCount = situations.filter((item) => item.status === "reglee").length;
  const primarySituation = openSituations[0];
  const unreadCount = state.notifications.filter((item) => item.role === role && !item.read).length;

  const engagementFor = (situationId: string) => {
    const space = state.coordinationSpaces.find((item) => item.situationId === situationId);
    const commitment = space?.commitments.find((item) => item.status !== "terminee");
    if (!space || !commitment) return undefined;
    return { commitment, actorName: state.actors.find((item) => item.id === commitment.actorId)?.name };
  };

  const primarySignal = primarySituation ? state.signals.find((item) => primarySituation.signalIds.includes(item.id)) : undefined;

  return (
    <div className="shadcn-scope space-y-8 bg-background p-5 pb-16 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Coordination · {territory?.name ?? "Votre territoire"}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Ce qui compte maintenant.</h1>
          {unreadCount > 0 && <p className="mt-2 text-sm text-muted-foreground">{unreadCount} alerte(s) non lue(s).</p>}
        </div>
        <Button variant="outline" onClick={() => setSignalDrawerOpen(true)}><Radio /> Signaler une situation</Button>
      </div>

      <div className="grid grid-cols-3 divide-x rounded-xl border bg-card/40 px-2 py-4 sm:px-4">
        <div className="px-2 sm:px-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Situations ouvertes</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-[#0b1a2a]">{openSituations.length}</p></div>
        <div className="px-2 sm:px-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Critiques</p><p className={`mt-1.5 text-2xl font-bold tracking-tight ${critical.length > 0 ? "text-[#b6522f]" : "text-[#0b1a2a]"}`}>{critical.length}</p></div>
        <div className="px-2 sm:px-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Réglées</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-[#0b1a2a]">{resolvedCount}</p></div>
      </div>

      {primarySituation ? (
        <Card className="relative overflow-hidden border-none bg-sidebar text-sidebar-foreground">
          <TerritoryTexture />
          <CardContent className="relative z-10 p-6 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <TensionGlyph status={priorityToTag[primarySituation.priority]} size={100} pulse={primarySituation.priority === "critique"} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-bold uppercase tracking-widest text-primary">Priorité du moment</span><span className="text-sidebar-foreground/50">{primarySituation.reference}</span></div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{primarySituation.title}</h2>
                <p className="mt-3 max-w-2xl text-sm text-sidebar-foreground/70">{primarySituation.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2"><ChannelBadge signal={primarySignal} />{primarySignal && <TrustBadge trust={primarySignal.trust} />}</div>
                <div className="mt-5 flex items-start gap-2"><DecisionIcon size={20} color="#fff8f2" /><div><p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/50">Prochaine action</p><p className="mt-1 text-sm font-semibold">{primarySituation.nextStep}</p></div></div>
                <Button className="mt-5" variant="secondary" asChild><Link href={`/app/situations/${primarySituation.id}`}>Ouvrir le dossier <ArrowRight /></Link></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative overflow-hidden border-none bg-sidebar text-sidebar-foreground"><TerritoryTexture /><CardContent className="relative z-10 p-6 md:p-10"><p className="text-xs font-bold uppercase tracking-widest text-primary">Priorité du moment</p><h2 className="mt-3 text-2xl font-semibold tracking-tight">Aucune situation ouverte sur ce périmètre.</h2><p className="mt-3 max-w-2xl text-sm text-sidebar-foreground/70">Le territoire reste sous surveillance ; les nouveaux signaux apparaîtront ici dès leur qualification.</p></CardContent></Card>
      )}

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Décider et agir</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Situations à traiter, par priorité.</h2>
        {openSituations.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Aucune situation en attente d’action sur ce périmètre.</p> : (
          <div className="mt-5 divide-y border-y">
            {openSituations.slice(0, visibleSituationsCount).map((situation) => {
              const territoryName = state.territories.find((item) => item.id === situation.territoryId)?.name ?? situation.territoryId;
              const signal = state.signals.find((item) => situation.signalIds.includes(item.id));
              const tag = priorityToTag[situation.priority];
              const engagement = engagementFor(situation.id);
              return (
                <div key={situation.id} className="relative flex flex-col gap-3 py-5 pl-5 md:flex-row md:flex-wrap md:items-center md:justify-between">
                  <span className="absolute inset-y-4 left-0 w-1 rounded-full" style={{ backgroundColor: glyphBorderColor[tag] }} aria-hidden="true" />
                  <div className="flex items-start gap-3"><TensionGlyph status={tag} size={30} /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-muted-foreground">{situation.reference}</span><Badge variant={tag === "critique" ? "terracotta" : tag === "vigilance" ? "amber" : "marine"}>{priorityLabels[situation.priority]}</Badge><ChannelBadge signal={signal} />{signal && <TrustBadge trust={signal.trust} />}</div><p className="mt-1.5 text-sm font-semibold">{situation.title} · {territoryName}</p><p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary"><DecisionIcon size={14} color="#b6522f" /> {situation.nextStep}</p>{engagement && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground"><EngagementIcon size={13} /> {engagement.commitment.label} — {engagement.actorName ?? "acteur à confirmer"} · {formatDate(engagement.commitment.dueAt)}</p>}</div></div>
                  <Button size="sm" variant="outline" asChild><Link href={`/app/situations/${situation.id}`}>Ouvrir <ArrowRight /></Link></Button>
                </div>
              );
            })}
            {visibleSituationsCount < openSituations.length && <div className="py-4"><Button variant="outline" className="w-full" onClick={() => setVisibleSituationsCount((count) => count + SITUATIONS_PAGE_SIZE)}>Charger plus ({openSituations.length - visibleSituationsCount} restante(s))</Button></div>}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-5 border-t pt-7 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Suivre le résultat</p><h2 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">Coordinations en cours et rapport de pilotage.</h2><p className="mt-2 max-w-xl text-sm text-muted-foreground">{unreadCount > 0 ? `${unreadCount} alerte(s) non lue(s) · ` : ""}toutes les coordinations et le pilotage territorial restent accessibles au même endroit.</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link href="/app/coordination">Voir les coordinations <ArrowRight /></Link></Button><Button variant="ghost" asChild><Link href="/app/pilotage"><BellRing /> Pilotage & rapports</Link></Button></div>
      </section>

      <Sheet open={signalDrawerOpen} onOpenChange={setSignalDrawerOpen}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Signaler une situation</SheetTitle><SheetDescription>Le signal reste déclaratif jusqu’à sa qualification.</SheetDescription></SheetHeader><CoordinatorSignalForm territories={state.territories} onDone={() => setSignalDrawerOpen(false)} /></SheetContent></Sheet>
    </div>
  );
}
