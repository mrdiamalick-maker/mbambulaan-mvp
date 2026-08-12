"use client";

// Expérience Coordinateur — situation-first, pas un dashboard générique
// (référentiel D9, PRODUCT_EXECUTION_PLAN.md Lot 3, arbitrage CEO du
// 2026-08-11 : « fusionne par défaut »). Remplace l'ancien
// CommandCenter.tsx (grille de panneaux — engagements/flux/alertes,
// territoire/acteurs, canaux/assistance, résultats — palette sarcelle
// #08758a/#075466/#052630) et l'ancien registre séparé consommé via
// /app/situations pour ce rôle : une seule file de situations
// priorisées, avec pour chacune son origine (canal du signal) et son
// niveau de confiance visibles, et la prochaine action à mener. Même
// sévérité de palette D9 que l'Espace État (Lot 2) : marine #0b1a2a,
// terre-cuite #b6522f réservée aux moments de décision/tension, pas
// de version allégée pour le Coordinateur.
//
// /app/situations reste inchangé pour les rôles qui l'utilisent encore
// comme registre propre (opérateur, capitaine, mareyeur, transformateur,
// prestataire — expérience task-first, hors périmètre du Lot 3).

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
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CoordinatorSignalForm } from "@/components/work/CoordinatorSignalForm";
import { glyphBorderColor, glyphFillColorStrong, priorityLabels, priorityToTag } from "@/lib/status-tokens";

const priorityWeight = { critique: 4, haute: 3, moyenne: 2, faible: 1 } as const;

// Chargement progressif — gap analysis Task 3 (2026-08-12), Option B
// retenue par le CEO : un bouton explicite plutôt qu'un scroll infini
// automatique, cohérent avec le principe déjà appliqué ailleurs dans le
// Produit (D5 : rien ne se déclenche silencieusement, l'utilisateur
// choisit chaque étape).
const SITUATIONS_PAGE_SIZE = 8;

// Texture territoriale — Livrable 2 mandat DA (2026-08-11). Aucune photo
// pour le Coordinateur (brief : reste situation-first/action-first) —
// une texture vectorielle abstraite seulement, confinée au tiers droit de
// la carte « Priorité du moment » (le conteneur w-[42%] borne la matière
// graphique à droite, pas un dégradé d'opacité sur toute la largeur : les
// 60% gauches qui portent TensionGlyph/référence/titre/description ne
// reçoivent aucun élément). Courbes ton-sur-ton évoquant littoral/
// bathymétrie, nœuds de réseau très subtils concentrés en bas à droite,
// un unique micro-accent terre-cuite — jamais une donnée réelle, jamais
// un radar. SVG à la main en attendant l'asset définitif (brief
// "coordinator-territory-texture.svg", viewBox 1600×700) : même grammaire
// visuelle que la version finale, pas une recréation à refaire de zéro.
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
      <p className="absolute bottom-3 right-3 rounded-md bg-black/25 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white/45 backdrop-blur-sm">
        Placeholder · coordinator-territory-texture.svg
      </p>
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
  const openSituations = situations
    .filter((item) => item.status !== "reglee")
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
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

      {/* Résumé — fond plein plutôt qu'une phrase : les 3 chiffres qui
          font autorité pour la coordination, mêmes couleurs que
          l'Impact clé de l'Institution (terre-cuite réservée au
          chiffre qui appelle une attention, marine pour la lecture
          neutre). */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-[#1d4468] to-[#122c44] text-white shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Situations ouvertes</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">{openSituations.length}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none bg-gradient-to-br from-[#b6522f] to-[#8a3d20] text-white shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Critiques</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">{critical.length}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none bg-gradient-to-br from-[#1d4468] to-[#122c44] text-white shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Réglées</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      {primarySituation ? (
        <Card className="relative overflow-hidden border-none bg-sidebar text-sidebar-foreground shadow-lg">
          <TerritoryTexture />
          <CardContent className="relative z-10 p-6 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <TensionGlyph status={priorityToTag[primarySituation.priority]} size={100} pulse={primarySituation.priority === "critique"} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold uppercase tracking-widest text-primary">Priorité du moment</span>
                  <span className="text-sidebar-foreground/50">{primarySituation.reference}</span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{primarySituation.title}</h2>
                <p className="mt-3 max-w-2xl text-sm text-sidebar-foreground/70">{primarySituation.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <ChannelBadge signal={primarySignal} />
                  {primarySignal && <TrustBadge trust={primarySignal.trust} />}
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <DecisionIcon size={20} color="#fff8f2" />
                  <p className="text-sm font-semibold">{primarySituation.nextStep}</p>
                </div>
                <Button className="mt-5" variant="secondary" asChild>
                  <Link href={`/app/situations/${primarySituation.id}`}>Ouvrir le dossier <ArrowRight /></Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative overflow-hidden border-none bg-sidebar text-sidebar-foreground shadow-lg">
          <TerritoryTexture />
          <CardContent className="relative z-10 p-6 md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Priorité du moment</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Aucune situation ouverte sur ce périmètre.</h2>
            <p className="mt-3 max-w-2xl text-sm text-sidebar-foreground/70">Le territoire reste sous surveillance ; les nouveaux signaux apparaîtront ici dès leur qualification.</p>
          </CardContent>
        </Card>
      )}

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Décider et agir</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Situations à traiter, par priorité.</h2>
        {openSituations.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Aucune situation en attente d’action sur ce périmètre.</p>
        ) : (
          <div className="mt-5 space-y-2.5">
            {openSituations.slice(0, visibleSituationsCount).map((situation) => {
              const territoryName = state.territories.find((item) => item.id === situation.territoryId)?.name ?? situation.territoryId;
              const signal = state.signals.find((item) => situation.signalIds.includes(item.id));
              const tag = priorityToTag[situation.priority];
              const engagement = engagementFor(situation.id);
              return (
                <Card
                  key={situation.id}
                  className="flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center md:justify-between"
                  style={{ borderLeftWidth: 4, borderLeftColor: glyphBorderColor[tag], backgroundColor: glyphFillColorStrong[tag] }}
                >
                  <div className="flex items-start gap-3">
                    <TensionGlyph status={tag} size={30} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">{situation.reference}</span>
                        <Badge variant={tag === "critique" ? "terracotta" : tag === "vigilance" ? "amber" : "marine"}>{priorityLabels[situation.priority]}</Badge>
                        <ChannelBadge signal={signal} />
                        {signal && <TrustBadge trust={signal.trust} />}
                      </div>
                      <p className="mt-1.5 text-sm font-semibold">{situation.title} · {territoryName}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary"><DecisionIcon size={14} color="#b6522f" /> {situation.nextStep}</p>
                      {engagement && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <EngagementIcon size={13} /> {engagement.commitment.label} — {engagement.actorName ?? "acteur à confirmer"} · {formatDate(engagement.commitment.dueAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" asChild><Link href={`/app/situations/${situation.id}`}>Ouvrir <ArrowRight /></Link></Button>
                </Card>
              );
            })}
            {visibleSituationsCount < openSituations.length && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setVisibleSituationsCount((count) => count + SITUATIONS_PAGE_SIZE)}
              >
                Charger plus ({openSituations.length - visibleSituationsCount} restante(s))
              </Button>
            )}
          </div>
        )}
      </section>

      <Separator />

      <Card className="flex-row flex-wrap items-center justify-between gap-5 border-none bg-sidebar p-7 text-sidebar-foreground shadow-lg">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Suivre le résultat</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Coordinations en cours et rapport de pilotage.</h2>
          <p className="mt-2 max-w-xl text-sm text-sidebar-foreground/65">{unreadCount > 0 ? `${unreadCount} alerte(s) non lue(s) · ` : ""}toutes les coordinations et le pilotage territorial restent accessibles au même endroit.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild><Link href="/app/coordination">Voir les coordinations <ArrowRight /></Link></Button>
          <Button asChild><Link href="/app/pilotage"><BellRing /> Pilotage & rapports</Link></Button>
        </div>
      </Card>

      <Sheet open={signalDrawerOpen} onOpenChange={setSignalDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Signaler une situation</SheetTitle>
            <SheetDescription>Le signal reste déclaratif jusqu’à sa qualification.</SheetDescription>
          </SheetHeader>
          <CoordinatorSignalForm territories={state.territories} onDone={() => setSignalDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
