"use client";

// Situation Room — reconstruite en D9 (Lot 4). Contexte, trajectoire,
// action recommandée, capacité alternative, preuve, communication et
// historique sont propres à ce fichier ; la coordination (participants,
// engagements, décision) vit dans CoordinationProposal. ValueImpactPanel
// (métriques globales mal placées dans une vue par situation, doublon
// de l'Impact clé de l'Institution — value-engine.ts n'avait pas d'autre
// consommateur) est retiré à cette étape.
import { useState } from "react";
import { Mail, MessageCircleMore, MessageSquare, PhoneCall } from "lucide-react";
import { communicationChannelLabels, communicationStatusLabels, evidenceTypeLabels, type CommunicationChannel, type CommunicationStatus, type ProductState, type Situation } from "@/domain/types";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { EngagementIcon, PreuveIcon } from "@/components/etat/MotifIcons";
import { ChannelBadge, TrustBadge } from "@/components/shared/StatusBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SituationAction } from "@/components/situations/SituationAction";
import { SituationTimeline } from "@/components/situations/SituationTimeline";
import { EvidenceForm } from "@/components/situations/EvidenceForm";
import { CommunicationForm } from "@/components/situations/CommunicationForm";
import { CoordinationProposal } from "@/components/coordination/CoordinationProposal";
import { glyphBorderColor, glyphFillColor, priorityLabels, priorityToTag } from "@/lib/status-tokens";

const communicationChannelIcons: Record<CommunicationChannel, typeof PhoneCall> = {
  whatsapp: MessageCircleMore,
  telephone: PhoneCall,
  sms: MessageSquare,
  email: Mail,
  notification_produit: Mail,
  saisie_terrain: MessageSquare
};

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

// Statut de la situation — dernier badge encore en variant par défaut
// (secondary) identifié lors de la vérification du resserrage visuel :
// gradient sémantique cohérent avec les autres badges de statut du
// produit (recue/qualification = neutre, coordination/intervention =
// suivi actif, attente = appelle une attention, résultat/réglée =
// confirmé).
const statusVariant: Record<Situation["status"], "marine" | "amber" | "terracotta" | "success"> = {
  recue: "marine",
  qualification: "marine",
  priorisee: "amber",
  coordination: "amber",
  intervention: "amber",
  attente: "terracotta",
  resultat: "success",
  reglee: "success"
};

const communicationStatusVariant: Record<CommunicationStatus, "marine" | "amber" | "terracotta" | "success"> = {
  prepare: "marine",
  envoye: "marine",
  remis: "success",
  lu: "success",
  repondu: "success",
  relance_requise: "amber",
  echec: "terracotta"
};

const capacityTypeLabels: Record<"glace" | "stockage" | "transport" | "transformation", string> = {
  glace: "Glace",
  stockage: "Stockage",
  transport: "Transport",
  transformation: "Transformation"
};

export function SituationRoom({ situation, state }: { situation: Situation; state: ProductState }) {
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [communicationDrawerOpen, setCommunicationDrawerOpen] = useState(false);
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  const signal = state.signals.find((item) => situation.signalIds.includes(item.id));
  const coordination = state.coordinationSpaces.find((item) => item.id === situation.coordinationId);
  const responsible = state.actors.find((item) => item.id === situation.responsibleId);
  const tag = priorityToTag[situation.priority];
  const commitments = coordination?.commitments ?? [];

  const evidences = state.evidences
    .filter((item) => item.situationId === situation.id)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  const communications = state.communications
    .filter((item) => item.situationId === situation.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
                <Badge variant={statusVariant[situation.status]}>{statusLabels[situation.status]}</Badge>
                <Badge variant={tag === "critique" ? "terracotta" : tag === "vigilance" ? "amber" : "marine"}>{priorityLabels[situation.priority]}</Badge>
                <TrustBadge trust={situation.trust} />
                <ChannelBadge signal={signal} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard label="Territoire" value={territory?.name ?? "Non défini"} />
        <InfoCard label="Responsable" value={responsible?.name ?? "À désigner"} />
        {/* Seule tuile décisionnelle des 3 — accent terre-cuite, les
            deux autres restent neutres (information de contexte). */}
        <InfoCard label="Prochaine décision" value={situation.nextStep} accent />
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
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground"><EngagementIcon size={14} color="#1d4468" /> Capacité mobilisable ailleurs</p>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#b6522f]"><PreuveIcon size={14} color="#fff8f2" /></span>
                Preuve
              </p>
              <Button variant="outline" size="sm" onClick={() => setEvidenceDrawerOpen(true)}>Enregistrer une preuve</Button>
            </div>
            {evidences.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Aucune preuve enregistrée pour cette situation pour le moment.</p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {evidences.map((evidence) => {
                  const author = state.actors.find((item) => item.id === evidence.recordedByActorId);
                  return (
                    <div key={evidence.id} className="rounded-lg border bg-card px-3.5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{evidenceTypeLabels[evidence.type]} — {evidence.label}</p>
                        {evidence.commitmentId && <Badge variant="marine">Engagement lié</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{evidence.detail}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {new Date(evidence.recordedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                        {author ? ` · ${author.name}` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1d4468]">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#1d4468]"><MessageCircleMore size={14} color="#eef2f4" /></span>
                Communication
              </p>
              <Button variant="outline" size="sm" onClick={() => setCommunicationDrawerOpen(true)}>Consigner une communication</Button>
            </div>
            {communications.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Aucune communication consignée pour cette situation pour le moment.</p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {communications.map((communication) => {
                  const Icon = communicationChannelIcons[communication.channel];
                  const author = state.actors.find((item) => item.id === communication.actorId);
                  return (
                    <div key={communication.id} className="rounded-lg border bg-card px-3.5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Icon size={14} className="text-[#1d4468]" />
                        <p className="text-sm font-semibold">{communication.subject}</p>
                        <Badge variant="marine">{communicationChannelLabels[communication.channel]}</Badge>
                        <Badge variant={communicationStatusVariant[communication.status]}>{communicationStatusLabels[communication.status]}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{communication.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {new Date(communication.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                        {author ? ` · ${author.name}` : ""} · Simulée · aucun envoi réel
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

      <Sheet open={evidenceDrawerOpen} onOpenChange={setEvidenceDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Enregistrer une preuve</SheetTitle>
            <SheetDescription>Photo, document, mesure ou appel consigné — rattaché à la situation ou à un engagement précis.</SheetDescription>
          </SheetHeader>
          <EvidenceForm situationId={situation.id} commitments={commitments} onDone={() => setEvidenceDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <Sheet open={communicationDrawerOpen} onOpenChange={setCommunicationDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Consigner une communication</SheetTitle>
            <SheetDescription>Communication simulée : aucun message, appel ou notification réel n’est envoyé. L’échange est uniquement consigné dans Mbàmbulaan.</SheetDescription>
          </SheetHeader>
          <CommunicationForm situationId={situation.id} commitments={commitments} onDone={() => setCommunicationDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InfoCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  if (accent) {
    return (
      <Card className="overflow-hidden border-none bg-gradient-to-br from-[#b6522f] to-[#8a3d20] text-white shadow-lg">
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">{label}</p>
          <p className="mt-2 text-base font-semibold">{value}</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 text-base font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
