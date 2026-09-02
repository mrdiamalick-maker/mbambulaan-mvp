"use client";

// WorkdayHub — LOT 9 (mandat "Operating Experience — faire disparaître les
// modules derrière le travail réel"). Remplace CoordinatorHub pour
// coordinateur/administrateur/gestionnaire_organisation/partenaire :
// CoordinatorHub ne montrait que des Situations (jamais les Findings/
// détections LOT 8, les Commitments à échéance, les Missions terrain, le
// développement de programme ou le réseau) — un vrai manque face au
// mandat §9/§11/§12. Consomme uniquement buildWorkdayView
// (src/domain/workday.ts) : aucune donnée recalculée ici, ce composant ne
// fait que la mettre en forme — "bureau de travail", pas un dashboard KPI
// ni un Kanban (mandat §30).
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Info, Radio } from "lucide-react";
import type { ProductState, Role } from "@/domain/types";
import { buildWorkdayView, sortWorkdayItems, type WorkdayItem } from "@/domain/workday";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CoordinatorSignalForm } from "@/components/work/CoordinatorSignalForm";
import { glyphBorderColor } from "@/lib/status-tokens";

const urgencyTag: Record<WorkdayItem["urgency"], "critique" | "vigilance" | "stable"> = {
  critique: "critique",
  vigilance: "vigilance",
  normale: "stable"
};

const urgencyBadgeVariant: Record<WorkdayItem["urgency"], "terracotta" | "amber" | "marine"> = {
  critique: "terracotta",
  vigilance: "amber",
  normale: "marine"
};

const categoryLabel: Record<WorkdayItem["category"], string> = {
  decision: "Décision",
  coordination: "Coordination",
  bloque: "Bloqué",
  echeance: "Échéance",
  mission: "Mission terrain",
  qualification_finding: "À qualifier",
  qualification_besoin: "Développement",
  qualification_reseau: "Réseau",
  gouvernance: "Gouvernance"
};

// Rôles autorisés à qualifier une contribution réseau (permissions.ts,
// mêmes trois rôles que record_finding/dismiss_detection + institution,
// qui n'atteint jamais /app/travail — non repris ici) — mirroré plutôt
// qu'importé du serveur, même discipline que workday.ts.
const NETWORK_CONTRIBUTION_ROLES: Role[] = ["administrateur", "coordinateur", "gestionnaire_organisation"];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

function ItemRow({ item }: { item: WorkdayItem }) {
  return (
    <div className="relative flex flex-col gap-3 py-4 pl-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
      <span className="absolute inset-y-2 left-0 w-1 rounded-full" style={{ backgroundColor: glyphBorderColor[urgencyTag[item.urgency]] }} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={urgencyBadgeVariant[item.urgency]}>{categoryLabel[item.category]}</Badge>
          {item.territoryName && <span className="text-xs text-muted-foreground">{item.territoryName}</span>}
        </div>
        <p className="mt-1.5 text-sm font-semibold">{item.title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.why}</p>
      </div>
      <Button size="sm" variant="outline" asChild><Link href={item.href}>{item.ctaLabel} <ArrowRight size={14} /></Link></Button>
    </div>
  );
}

export function WorkdayHub({ state, actorId, role }: { state: ProductState; actorId: string; role: Role }) {
  const actor = state.actors.find((item) => item.id === actorId);
  const [networkItem, setNetworkItem] = useState<WorkdayItem | null>(null);
  const [signalOpen, setSignalOpen] = useState(false);

  // Contributions publiques à qualifier — pas dans ProductState (dépôt
  // séparé, cf. server/public-repository.ts, réutilisé tel quel), donc un
  // fetch léger plutôt qu'une donnée recalculée dans buildWorkdayView
  // (qui doit rester une projection pure de ProductState). Même mécanisme
  // que CoordinationWorkspace.tsx/OrganizationWorkspace.tsx.
  useEffect(() => {
    if (!NETWORK_CONTRIBUTION_ROLES.includes(role)) return;
    let cancelled = false;
    fetch("/api/coordination/public-contributions")
      .then(async (response) => {
        if (!response.ok || cancelled) return;
        const payload = await response.json();
        const count = (payload.contributions ?? []).length;
        if (!cancelled && count > 0) {
          setNetworkItem({
            id: "network-contribution:pending",
            category: "qualification_reseau",
            title: `${count} contribution${count > 1 ? "s" : ""} publique${count > 1 ? "s" : ""} à qualifier`,
            why: "Une capacité a été proposée depuis l’espace public et attend une qualification humaine.",
            ctaLabel: "Qualifier la contribution",
            href: "/app/organisation",
            urgency: "normale"
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [role]);

  const view = buildWorkdayView(state, actorId, role);
  const myAttention = networkItem ? sortWorkdayItems([...view.myAttention, networkItem]) : view.myAttention;
  const top3 = myAttention.slice(0, 3);
  const rest = myAttention.slice(3);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="shadcn-scope space-y-8 bg-background p-5 pb-16 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468] capitalize">{dateLabel}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{greeting()}, {actor?.name?.split(" ")[0] ?? ""}.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Voici ce qui demande votre attention aujourd’hui, pourquoi cela vous concerne, et où agir.</p>
        </div>
        <Button variant="outline" onClick={() => setSignalOpen(true)}><Radio /> Signaler une situation</Button>
      </div>

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Vos priorités</p>
        {top3.length === 0 ? (
          <Card className="mt-3"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Rien ne demande votre attention immédiate pour le moment.</p></CardContent></Card>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {top3.map((item) => (
              <Card key={item.id} className="relative overflow-hidden">
                <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: glyphBorderColor[urgencyTag[item.urgency]] }} aria-hidden="true" />
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <Badge variant={urgencyBadgeVariant[item.urgency]} className="w-fit">{categoryLabel[item.category]}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.why}</p>
                  </div>
                  <Button size="sm" asChild><Link href={item.href}>{item.ctaLabel} <ArrowRight size={14} /></Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {rest.length > 0 && (
        <section className="border-t pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Votre travail</p>
          <div className="mt-2 divide-y border-y">{rest.map((item) => <ItemRow key={item.id} item={item} />)}</div>
        </section>
      )}

      {view.waitingOnOthers.length > 0 && (
        <section className="border-t pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce que vous attendez des autres</p>
          <div className="mt-2 space-y-1">
            {view.waitingOnOthers.map((item) => (
              <Link key={item.id} href={item.href} className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-xs hover:bg-accent">
                <span><span className="font-semibold">{item.title}</span> — {item.detail}</span>
                <ArrowRight size={13} className="shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {view.whatChanged.length > 0 && (
        <section className="border-t pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui a changé</p>
          <div className="mt-2 space-y-1">
            {view.whatChanged.map((item) => (
              <Link key={item.id} href={item.href} className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-xs hover:bg-accent">
                <span><span className="font-semibold">{item.title}</span> — {item.detail}</span>
                <ArrowRight size={13} className="shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="flex items-start gap-2 border-t pt-6 text-xs leading-5 text-muted-foreground">
        <Info size={14} className="mt-0.5 shrink-0" />
        Cette page ne montre que ce qui vous concerne réellement — les autres situations, programmes et réseaux restent accessibles dans leurs espaces respectifs.
      </p>

      <Sheet open={signalOpen} onOpenChange={setSignalOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Signaler une situation</SheetTitle>
            <SheetDescription>Le signal reste déclaratif jusqu’à sa qualification.</SheetDescription>
          </SheetHeader>
          <CoordinatorSignalForm territories={state.territories} onDone={() => setSignalOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
