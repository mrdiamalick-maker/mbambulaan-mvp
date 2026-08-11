"use client";

// Situation Room — reconstruite en D9 (Lot 4). Contexte, trajectoire,
// action recommandée, capacité alternative et historique sont propres
// à ce fichier ; la coordination (participants, engagements, décision)
// vit dans CoordinationProposal (restylée à l'étape 3/4, avec le
// panneau Décision — première écriture réelle sur create_decision hors
// Lot 1). Les panneaux Preuve et Communication (Evidence/Communication,
// Lot 1) et le retrait de ValueImpactPanel/value-engine.ts arrivent à
// l'étape 4/4.
import type { ProductState, Situation } from "@/domain/types";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { EngagementIcon } from "@/components/etat/MotifIcons";
import { ChannelBadge, TrustBadge } from "@/components/shared/StatusBadges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SituationAction } from "@/components/situations/SituationAction";
import { SituationTimeline } from "@/components/situations/SituationTimeline";
import { CoordinationProposal } from "@/components/coordination/CoordinationProposal";
import { ValueImpactPanel } from "@/components/impact/ValueImpactPanel";
import { glyphBorderColor, glyphFillColor, priorityLabels, priorityToTag } from "@/lib/status-tokens";

const statusLabels: Record<Situation["status"], string> = {
  recue: "Signal reçu",
  qualification: "En qualification",
  priorisee: "Priorisée",
  coordination: "Coordination engagée",
  intervention: "Intervention en cours",
  attente: "En attente",
  resultat: "Résultat enregistré",
  reglee: "Réglée"
};

const capacityTypeLabels: Record<"glace" | "stockage" | "transport" | "transformation", string> = {
  glace: "Glace",
  stockage: "Stockage",
  transport: "Transport",
  transformation: "Transformation"
};

export function SituationRoom({ situation, state }: { situation: Situation; state: ProductState }) {
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  const signal = state.signals.find((item) => situation.signalIds.includes(item.id));
  const coordination = state.coordinationSpaces.find((item) => item.id === situation.coordinationId);
  const responsible = state.actors.find((item) => item.id === situation.responsibleId);
  const tag = priorityToTag[situation.priority];

  // Capacité alternative — répond concrètement à « chercher une
  // capacité alternative » du scénario canonique (§8.2 du spec
  // maître). Capacités réellement disponibles sur d'autres
  // territoires, jointes via leur infrastructure — pas une
  // recommandation automatique feinte (aucun algorithme de matching
  // n'existe pour l'instant), une liste honnête de ce qui est mobilisable.
  const alternativeCapacities = state.capacities
    .filter((item) => item.status === "disponible")
    .map((item) => {
      const infra = state.infrastructures.find((infraItem) => infraItem.id === item.infrastructureId);
      return { capacity: item, infra, territoryName: infra ? state.territories.find((t) => t.id === infra.territoryId)?.name : undefined };
    })
    .filter((item) => item.infra && item.infra.territoryId !== situation.territoryId)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-sidebar text-sidebar-foreground shadow-lg">
        <CardContent className="p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <TensionGlyph status={tag} size={90} pulse={situation.priority === "critique"} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-widest text-primary">Situation opérationnelle</span>
                <span className="text-sidebar-foreground/50">{situation.reference}</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{situation.title}</h1>
              <p className="mt-3 max-w-2xl text-sm text-sidebar-foreground/70">{situation.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{statusLabels[situation.status]}</Badge>
                <Badge variant={situation.priority === "critique" ? "destructive" : "outline"}>{priorityLabels[situation.priority]}</Badge>
                <TrustBadge trust={situation.trust} tone="dark" />
                <ChannelBadge signal={signal} tone="dark" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard label="Territoire" value={territory?.name ?? "Non défini"} />
        <InfoCard label="Responsable" value={responsible?.name ?? "À désigner"} />
        <InfoCard label="Prochaine décision" value={situation.nextStep} />
      </div>

      <SituationAction situation={situation} />

      <SituationTimeline status={situation.status} />

      <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <Card className="border-[#1d4468]/20 bg-gradient-to-br from-[#1d4468]/[0.05] via-transparent to-transparent">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Origine du signal</p>
            <h2 className="mt-2 text-lg font-semibold">{signal?.source ?? "Source inconnue"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{signal?.description}</p>
          </CardContent>
        </Card>

        <Card style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor.stable, backgroundColor: glyphFillColor.stable }}>
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground"><EngagementIcon size={14} color="#1d4468" /> Capacité alternative</p>
            {alternativeCapacities.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Aucune capacité disponible identifiée ailleurs sur le réseau pour le moment.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {alternativeCapacities.map(({ capacity, infra, territoryName }) => (
                  <div key={capacity.id} className="rounded-lg border bg-card px-3 py-2 text-sm">
                    <p className="font-semibold">{infra?.name} · {territoryName ?? infra?.territoryId}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{capacityTypeLabels[capacity.type]} · {capacity.availableQuantity} {capacity.unit} disponible(s)</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CoordinationProposal coordination={coordination} state={state} situationId={situation.id} />

      <ValueImpactPanel state={state} situation={situation} />

      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Historique</p>
          <div className="mt-4 space-y-3">
            {situation.history.map((item) => (
              <div key={item.id} className="border-l-2 border-[#1d4468]/30 pl-4">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 text-base font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
