"use client";

import { useState } from "react";
import { Mail, MessageCircleMore, MessageSquare, PhoneCall, Sparkles } from "lucide-react";
import { communicationChannelLabels, communicationStatusLabels, evidenceTypeLabels, type CommunicationChannel, type CommunicationStatus, type ProductState, type Situation } from "@/domain/types";
import { buildValueTrail, resultsForSituation } from "@/domain/situation-narrative";
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
import { OutcomeForm } from "@/components/impact/OutcomeForm";
import { LearningForm } from "@/components/impact/LearningForm";
import { priorityLabels, priorityToTag } from "@/lib/status-tokens";

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
  const [outcomeDrawerOpen, setOutcomeDrawerOpen] = useState(false);
  const [learningDrawerOpen, setLearningDrawerOpen] = useState(false);
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  const signal = state.signals.find((item) => situation.signalIds.includes(item.id));
  const signalCapturedBy = state.actors.find((item) => item.id === signal?.actorId);
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
  // LOT 4 (mandat "de l'action à la valeur démontrable", §10) — Value
  // Trail étendue (Signal → ... → Résultat → Changement → Impact →
  // Apprentissage), et les Results canoniques réels de cette Situation
  // (source du bouton "Documenter le changement observé" ci-dessous).
  const valueTrail = buildValueTrail(state, situation);
  const situationResults = resultsForSituation(state, situation);

  const alternativeCapacities = state.capacities
    .filter((item) => item.status === "disponible")
    .map((item) => {
      const infra = state.infrastructures.find((infraItem) => infraItem.id === item.infrastructureId);
      return { capacity: item, infra, territoryName: infra ? state.territories.find((t) => t.id === infra.territoryId)?.name : undefined };
    })
    .filter((item) => item.infra && item.infra.territoryId !== situation.territoryId)
    .slice(0, 4);

  return (
    <div className="space-y-7">
      <Card className="overflow-hidden border-none bg-sidebar text-sidebar-foreground">
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

      <div className="grid divide-y border-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <ContextItem label="Territoire" value={territory?.name ?? "Non défini"} />
        <ContextItem label="Responsable" value={responsible?.name ?? "À désigner"} />
        <ContextItem label="Prochaine décision" value={situation.nextStep} accent />
      </div>

      <SituationAction situation={situation} />
      <SituationTimeline status={situation.status} />

      <section className="space-y-4 border-t pt-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Comprendre la situation</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Origine et capacités mobilisables.</h2>
        </div>
        <div className="grid gap-7 lg:grid-cols-[1fr_.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Origine du signal</p>
            <h3 className="mt-2 text-lg font-semibold">{signal?.source ?? "Source inconnue"}</h3>
            {signal?.reportedBy && <p className="mt-1.5 text-xs font-semibold text-muted-foreground">Rapporté par {signal.reportedBy}{signalCapturedBy ? ` · Saisi par ${signalCapturedBy.name}` : ""}</p>}
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal?.description}</p>
          </div>
          <div className="border-l-0 lg:border-l lg:pl-7">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground"><EngagementIcon size={14} color="#1d4468" /> Capacité mobilisable ailleurs</p>
            {alternativeCapacities.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Aucune capacité disponible identifiée ailleurs sur le réseau pour le moment.</p>
            ) : (
              <div className="mt-3 divide-y border-y">
                {alternativeCapacities.map(({ capacity, infra, territoryName }) => (
                  <div key={capacity.id} className="py-3 text-sm">
                    <p className="font-semibold">{infra?.name} · {territoryName ?? infra?.territoryId}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{capacityTypeLabels[capacity.type]} · {capacity.availableQuantity} {capacity.unit} disponible(s)</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <CoordinationProposal coordination={coordination} state={state} situationId={situation.id} />

      <section className="space-y-5 border-t pt-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Prouver et communiquer</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Conserver la preuve et la trace des échanges.</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><PreuveIcon size={15} color="#b6522f" /> Preuves</p>
              <Button variant="outline" size="sm" onClick={() => setEvidenceDrawerOpen(true)}>Enregistrer une preuve</Button>
            </div>
            {evidences.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Aucune preuve enregistrée pour cette situation pour le moment.</p> : (
              <div className="mt-4 divide-y border-y">
                {evidences.map((evidence) => {
                  const author = state.actors.find((item) => item.id === evidence.recordedByActorId);
                  return (
                    <div key={evidence.id} className="py-3">
                      <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{evidenceTypeLabels[evidence.type]} — {evidence.label}</p>{evidence.commitmentId && <Badge variant="marine">Engagement lié</Badge>}</div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{evidence.detail}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{new Date(evidence.recordedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}{author ? ` · ${author.name}` : ""}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1d4468]"><MessageCircleMore size={15} /> Communications</p>
              <Button variant="outline" size="sm" onClick={() => setCommunicationDrawerOpen(true)}>Consigner une communication</Button>
            </div>
            {communications.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Aucune communication consignée pour cette situation pour le moment.</p> : (
              <div className="mt-4 divide-y border-y">
                {communications.map((communication) => {
                  const Icon = communicationChannelIcons[communication.channel];
                  const author = state.actors.find((item) => item.id === communication.actorId);
                  return (
                    <div key={communication.id} className="py-3">
                      <div className="flex flex-wrap items-center gap-2"><Icon size={14} className="text-[#1d4468]" /><p className="text-sm font-semibold">{communication.subject}</p><Badge variant="marine">{communicationChannelLabels[communication.channel]}</Badge><Badge variant={communicationStatusVariant[communication.status]}>{communicationStatusLabels[communication.status]}</Badge></div>
                      <p className="mt-1 text-xs text-muted-foreground">{communication.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{new Date(communication.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}{author ? ` · ${author.name}` : ""} · Simulée · aucun envoi réel</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5 border-t pt-7">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1d4468]"><Sparkles size={14} /> De la réalité à la valeur</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Ce qui a été fait, ce qui a changé, ce que nous en retenons.</h2>
        </div>
        <div className="space-y-2">
          {valueTrail.map((step, index) => (
            <div key={step.key} className="flex items-start gap-2.5 rounded-lg border bg-muted/20 p-3">
              <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${step.proven ? "bg-[#1d4468] text-white" : "border border-dashed text-muted-foreground"}`}>{index + 1}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{step.label}{!step.proven && <span className="ml-1.5 font-normal text-muted-foreground">— à confirmer</span>}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={situationResults.length === 0} onClick={() => setOutcomeDrawerOpen(true)}>
            {situationResults.length === 0 ? "Documenter le changement observé (nécessite un résultat)" : "Documenter le changement observé"}
          </Button>
          <Button variant="outline" onClick={() => setLearningDrawerOpen(true)}>Enregistrer un apprentissage</Button>
        </div>
      </section>

      <section className="border-t pt-7">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Historique</p>
        <div className="mt-4 space-y-3">
          {situation.history.map((item) => (
            <div key={item.id} className="border-l-2 border-[#1d4468]/30 pl-4">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <Sheet open={evidenceDrawerOpen} onOpenChange={setEvidenceDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Enregistrer une preuve</SheetTitle><SheetDescription>Photo, document, mesure ou appel consigné — rattaché à la situation ou à un engagement précis.</SheetDescription></SheetHeader>
          <EvidenceForm situationId={situation.id} commitments={commitments} onDone={() => setEvidenceDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <Sheet open={communicationDrawerOpen} onOpenChange={setCommunicationDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Consigner une communication</SheetTitle><SheetDescription>Communication simulée : aucun message, appel ou notification réel n’est envoyé. L’échange est uniquement consigné dans Mbàmbulaan.</SheetDescription></SheetHeader>
          <CommunicationForm situationId={situation.id} commitments={commitments} onDone={() => setCommunicationDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <Sheet open={outcomeDrawerOpen} onOpenChange={setOutcomeDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Documenter le changement observé</SheetTitle><SheetDescription>Une activité réalisée n’est pas un changement en soi — décrivez ce qui a réellement évolué, avec son niveau d’attribution.</SheetDescription></SheetHeader>
          {situationResults.length > 0 && <OutcomeForm results={situationResults} onDone={() => setOutcomeDrawerOpen(false)} onCancel={() => setOutcomeDrawerOpen(false)} />}
        </SheetContent>
      </Sheet>

      <Sheet open={learningDrawerOpen} onOpenChange={setLearningDrawerOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Enregistrer un apprentissage</SheetTitle><SheetDescription>Que devons-nous faire différemment ou réutiliser ailleurs ?</SheetDescription></SheetHeader>
          <LearningForm situationId={situation.id} onDone={() => setLearningDrawerOpen(false)} onCancel={() => setLearningDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ContextItem({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-0 py-4 lg:px-5">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-2 text-sm font-semibold leading-5 ${accent ? "text-[#b6522f]" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
