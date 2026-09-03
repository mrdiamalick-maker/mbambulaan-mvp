"use client";

import { useState } from "react";
import { Compass, Mail, MessageCircleMore, MessageSquare, PhoneCall } from "lucide-react";
import { communicationChannelLabels, communicationStatusLabels, evidenceTypeLabels, type CommunicationChannel, type CommunicationStatus, type ProductState, type Situation } from "@/domain/types";
import {
  buildValueTrail,
  findKnowledgeGapForSituation,
  resolveFindingForSituation,
  resolveSourceRefDisplay,
  resultsForSituation
} from "@/domain/situation-narrative";
import { EngagementIcon, PreuveIcon } from "@/components/etat/MotifIcons";
import { ChannelBadge } from "@/components/shared/StatusBadges";
import { EvidenceLine, KnowledgeState } from "@/components/foundations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SituationAction } from "@/components/situations/SituationAction";
import { SituationTimeline } from "@/components/situations/SituationTimeline";
import { SituationHero } from "@/components/situations/SituationHero";
import { WhyMbambulaan, ValueTrailSection } from "@/components/situations/SituationNarrative";
import { EvidenceForm } from "@/components/situations/EvidenceForm";
import { CommunicationForm } from "@/components/situations/CommunicationForm";
import { CoordinationProposal } from "@/components/coordination/CoordinationProposal";
import { OutcomeForm } from "@/components/impact/OutcomeForm";
import { LearningForm } from "@/components/impact/LearningForm";
import { priorityToTag } from "@/lib/status-tokens";

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

  // XXL-R3 (§17-18, §21-22) — convergence Drawer/Room : la Situation Room
  // n'affichait jusqu'ici ni "pourquoi Mbàmbulaan vous le signale" ni la
  // limite de connaissance associée, alors même que c'est la personne qui
  // agit sur le dossier — le drawer État seul les montrait. Mêmes
  // dérivations pures que etat/shared.tsx (SituationDetail), aucune
  // logique dupliquée.
  const finding = resolveFindingForSituation(state, situation);
  const sourceElements = finding ? finding.sourceRefs.map((ref) => resolveSourceRefDisplay(state, ref)).filter((item): item is NonNullable<typeof item> => Boolean(item)) : [];
  const knowledgeGap = findKnowledgeGapForSituation(state, situation);
  const lastEvolution = situation.history[situation.history.length - 1];

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
      {/* XXL-R3 (§17) — hero de dossier partagé (SituationHero) : territoire /
          titre / phrase / priorité / état / responsable / dernière évolution,
          même composition que le drawer État — remplace le Card sombre +
          grille ContextItem séparée d'avant (deux blocs pour une seule
          information). "Prochaine décision" quittait le hero : sa valeur
          réelle (situation.nextStep) est désormais la Recommandation
          ci-dessous, jamais fusionnée avec les Décisions réellement prises
          (CoordinationProposal). */}
      <SituationHero
        situation={situation}
        territory={territory}
        responsible={responsible}
        tag={tag}
        statusLabel={statusLabels[situation.status]}
        statusVariant={statusVariant[situation.status]}
        lastEvolution={lastEvolution}
      />
      <div className="flex flex-wrap items-center gap-2"><ChannelBadge signal={signal} /></div>

      <WhyMbambulaan finding={finding} sources={sourceElements} />
      {knowledgeGap && (
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--mb-hairline)" }}>
          <KnowledgeState level="a_verifier">{knowledgeGap.statement}</KnowledgeState>
        </div>
      )}

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

      {/* XXL-R3 (§18) — Recommandation, distincte de la Décision : une
          orientation proposée par Mbàmbulaan (finding.nextStep en priorité,
          sinon situation.nextStep), jamais confondue avec les décisions
          effectivement prises et tracées ci-dessous (CoordinationProposal).
          Même distinction et même texte que le drawer État. */}
      <div className="border-t pt-7">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground"><Compass size={14} /> Recommandation</p>
        <p className="mt-2 max-w-2xl text-sm leading-6">{finding?.nextStep ?? situation.nextStep}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">Une orientation proposée — distincte d’une décision effectivement prise (ci-dessous).</p>
      </div>

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
                      <EvidenceLine className="mt-1" source={new Date(evidence.recordedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} detail={author?.name} />
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

      {/* XXL-R3 (§18) — Résultat : rupture visuelle claire avec les Preuves
          ci-dessus (bordure + fond distincts), jamais fondu avec la liste
          de preuves qui l'accompagne — un résultat constaté est un énoncé,
          pas une pièce jointe de plus. situation.result reste la même
          donnée que le drawer État affiche déjà ; la Room ne l'affichait
          nulle part jusqu'ici alors qu'elle mène l'action. */}
      <section className="rounded-xl border p-5" style={{ borderColor: "var(--mb-hairline)", background: "var(--mb-cream-200)" }}>
        <p className="mb-evidence" style={{ color: "var(--mb-navy-800)" }}>Résultat</p>
        {situation.result ? (
          <>
            <p className="mt-2 text-sm font-medium leading-6" style={{ color: "var(--mb-navy-950)" }}>{situation.result}</p>
            {situation.confirmation && <p className="mt-1 text-xs leading-5" style={{ color: "var(--mb-stone-600)" }}>{situation.confirmation}</p>}
          </>
        ) : (
          <p className="mt-2 text-sm" style={{ color: "var(--mb-stone-400)" }}>Effet à confirmer — aucun résultat constaté pour le moment.</p>
        )}
      </section>

      <section className="space-y-5 border-t pt-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">De la réalité à la valeur</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Ce qui a été fait, ce qui a changé, ce que nous en retenons.</h2>
        </div>
        {/* XXL-R1 (§28, surface témoin B) — remplace les 8 cases empilées
            (effet "checklist" identifié par l'Audit Maritime Intelligence)
            par NarrativeFlow (§18.8) : un rythme vertical continu, jamais
            de BPMN. XXL-R3 (§18) — ValueTrailSection (SituationNarrative.tsx)
            partagée avec le drawer État, même donnée réelle
            (buildValueTrail), rien de fabriqué. */}
        <ValueTrailSection steps={valueTrail} />
        {/* XXL-R1 (§34, vérification mobile) — débordement horizontal
            pré-existant trouvé lors de la vérification de cette surface
            témoin (390px) : le libellé long ("...nécessite un résultat")
            héritait whitespace-nowrap du composant Button partagé, qui ne
            peut pas se rétrécir sous sa largeur de contenu dans un
            conteneur flex-wrap. Corrigé localement (whitespace-normal +
            largeur bornée) sans toucher au composant Button lui-même,
            utilisé par des centaines d'autres boutons du produit. */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-left" disabled={situationResults.length === 0} onClick={() => setOutcomeDrawerOpen(true)}>
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
