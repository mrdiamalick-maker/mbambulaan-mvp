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
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Info, Radio } from "lucide-react";
import type { ProductState, Role } from "@/domain/types";
import { buildWorkdayView, capItemsForDisplay, sortWorkdayItems, type WorkdayItem } from "@/domain/workday";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CoordinatorSignalForm } from "@/components/work/CoordinatorSignalForm";
import { glyphBorderColor } from "@/lib/status-tokens";
import { AttentionItem, PageIntro } from "@/components/foundations";

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

// XXL-R0 (Demo Integrity, correctif n°5) — garde-fou mécanique contre le
// défilement de ~23 000px observé par l'Audit Maritime Intelligence sur
// mobile. Cause réelle vérifiée : "rest" (myAttention au-delà du Top 3)
// et waitingOnOthers étaient rendus intégralement, sans plafond — 89
// éléments pour le coordinateur de démonstration, chacun haut de
// plusieurs lignes en colonne sur mobile (ItemRow, flex-col en dessous de
// md). Pas un redesign d'Aujourd'hui (qui appartient à XXL-R3, cf. audit
// §10) : seulement une limite d'affichage par défaut + un "Voir tout",
// qui révèle la même liste réelle déjà calculée par buildWorkdayView —
// rien n'est masqué en permanence, rien n'est fabriqué. Le Top 3 n'est
// jamais concerné par ce plafond (toujours affiché en entier).
//
// "Voir tout" reste ici une bascule d'affichage plutôt qu'un lien vers
// une page tierce : buildWorkdayView() agrège des catégories hétérogènes
// (décisions, coordination, missions terrain, qualification réseau…)
// sans registre unique existant qui les recouvre toutes — inventer une
// telle page serait le redesign explicitement exclu de ce lot. La
// "vraie surface" est donc cette liste elle-même, dans son intégralité,
// pas un extrait tronqué.
const WORK_LIST_VISIBLE_COUNT = 5;

function CappedList<T extends { id: string }>({ items, visibleCount, renderItem }: { items: T[]; visibleCount: number; renderItem: (item: T) => ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const { visible, hiddenCount } = expanded ? { visible: items, hiddenCount: 0 } : capItemsForDisplay(items, visibleCount);
  return (
    <>
      {visible.map(renderItem)}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary hover:underline"
        >
          Voir tout ({items.length}) <ChevronDown size={13} />
        </button>
      )}
    </>
  );
}

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
      {/* XXL-R1 (§29, surface témoin C) — en-tête devenu PageIntro (§18.1) ;
          Top 3 devenu trois AttentionItem (§18.4) dans un seul panneau
          plutôt que trois cartes bordées-ombrées individuelles (cause
          principale de l'effet générique identifiée par l'audit sur
          l'écran le plus utilisé du produit). Reconstruction complète
          d'Aujourd'hui hors scope — réservée à XXL-R3 (audit §10). */}
      <PageIntro
        eyebrow={dateLabel}
        title={`${greeting()}, ${actor?.name?.split(" ")[0] ?? ""}.`}
        dek="Voici ce qui demande votre attention aujourd’hui, pourquoi cela vous concerne, et où agir."
        action={<Button variant="outline" onClick={() => setSignalOpen(true)}><Radio /> Signaler une situation</Button>}
        signature
      />

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Vos priorités</p>
        {top3.length === 0 ? (
          <Card className="mt-3"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Rien ne demande votre attention immédiate pour le moment.</p></CardContent></Card>
        ) : (
          <div className="mt-2 overflow-hidden rounded-lg border px-4 [&>a:last-child]:border-b-0 [&>div:last-child]:border-b-0" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-cream-100)" }}>
            {top3.map((item) => (
              <AttentionItem
                key={item.id}
                level={urgencyTag[item.urgency]}
                levelLabel={categoryLabel[item.category]}
                territory={item.territoryName}
                reason={item.title}
                nextStep={item.why}
                ctaLabel={item.ctaLabel}
                href={item.href}
              />
            ))}
          </div>
        )}
      </section>

      {rest.length > 0 && (
        <section className="border-t pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Votre travail</p>
          <div className="mt-2 divide-y border-y">
            <CappedList items={rest} visibleCount={WORK_LIST_VISIBLE_COUNT} renderItem={(item) => <ItemRow key={item.id} item={item} />} />
          </div>
        </section>
      )}

      {view.waitingOnOthers.length > 0 && (
        <section className="border-t pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce que vous attendez des autres</p>
          <div className="mt-2 space-y-1">
            <CappedList
              items={view.waitingOnOthers}
              visibleCount={WORK_LIST_VISIBLE_COUNT}
              renderItem={(item) => (
                <Link key={item.id} href={item.href} className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-xs hover:bg-accent">
                  <span><span className="font-semibold">{item.title}</span> — {item.detail}</span>
                  <ArrowRight size={13} className="shrink-0 text-muted-foreground" />
                </Link>
              )}
            />
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
