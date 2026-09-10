"use client";

import { useState } from "react";
import { MessageCircleMore, Mail, PhoneCall, MessageSquare } from "lucide-react";
import type { CommunicationChannel, CommunicationStatus, ProductState, Role, Situation } from "@/domain/types";
import { communicationChannelLabels, communicationStatusLabels } from "@/domain/types";
import { availableAction } from "@/domain/rules";
import { buildValueTrail, resultsForSituation } from "@/domain/situation-narrative";
import { canRole } from "@/server/permissions";
import { roleLabel } from "@/domain/platform/private-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SituationAction } from "@/components/situations/SituationAction";
import { ValueTrailSection } from "@/components/situations/SituationNarrative";
import { CoordinationProposal } from "@/components/coordination/CoordinationProposal";
import { CommunicationForm } from "@/components/situations/CommunicationForm";
import { OutcomeForm } from "@/components/impact/OutcomeForm";
import { LearningForm } from "@/components/impact/LearningForm";

const ALL_ROLES: Role[] = ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"];

const communicationChannelIcons: Record<CommunicationChannel, typeof PhoneCall> = {
  whatsapp: MessageCircleMore,
  telephone: PhoneCall,
  sms: MessageSquare,
  email: Mail,
  notification_produit: Mail,
  saisie_terrain: MessageSquare
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

// LOT V3.2 (mandat §8/§9, "Actions" — le point le plus critique du lot) —
// n'affiche QUE des commandes réelles :
//  - SituationAction (réutilisé sans modification) reste la SEULE
//    prochaine étape possible, dérivée de availableAction(status) — mais
//    désormais visible seulement si canRole(role, action) l'autorise
//    (garde-fou absent du composant d'origine, ajouté ici : "confirm
//    permission" pour CHAQUE CTA visible, mandat §8). Un rôle qui ne peut
//    pas agir voit qui le peut (roleLabel), jamais un bouton mort.
//  - CoordinationProposal (décisions, coordination, engagements) et les
//    formulaires Communication/Résultat/Outcome/Learning sont réutilisés
//    à l'identique — aucune commande inventée, aucun bouton qui imite un
//    flux non supporté (mandat §8 : "prefer omission").
export function SituationActionsTab({ state, situation, role }: { state: ProductState; situation: Situation; role: Role }) {
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [learningOpen, setLearningOpen] = useState(false);

  const coordination = state.coordinationSpaces.find((item) => item.id === situation.coordinationId);
  const commitments = coordination?.commitments ?? [];
  const communications = state.communications
    .filter((item) => item.situationId === situation.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const valueTrail = buildValueTrail(state, situation);
  const situationResults = resultsForSituation(state, situation);

  const nextAction = availableAction(situation.status);
  const canPerformNext = nextAction ? canRole(role, nextAction) : false;
  const authorizedRoles = nextAction ? ALL_ROLES.filter((candidate) => canRole(candidate, nextAction)) : [];

  return (
    <div className="space-y-7">
      {nextAction && !canPerformNext ? (
        <div className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--mb-hairline)" }}>
          <p className="font-semibold">Prochaine étape en attente d’un mandat autorisé.</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Réservée à : {authorizedRoles.map((candidate) => roleLabel(candidate)).join(", ")}.
          </p>
        </div>
      ) : (
        <SituationAction situation={situation} />
      )}

      <CoordinationProposal coordination={coordination} state={state} situationId={situation.id} />

      <section className="space-y-4 border-t pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1d4468]"><MessageCircleMore size={15} /> Communications</p>
          {canRole(role, "log_communication") && <Button variant="outline" size="sm" onClick={() => setCommunicationOpen(true)}>Consigner une communication</Button>}
        </div>
        {communications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune communication consignée pour cette situation pour le moment.</p>
        ) : (
          <div className="divide-y border-y">
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
      </section>

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

      <section className="space-y-4 border-t pt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Progression — de la réalité à la valeur</p>
        <ValueTrailSection steps={valueTrail} />
        <div className="flex flex-wrap gap-2">
          {canRole(role, "record_outcome") && (
            <Button variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-left" disabled={situationResults.length === 0} onClick={() => setOutcomeOpen(true)}>
              {situationResults.length === 0 ? "Documenter le changement observé (nécessite un résultat)" : "Documenter le changement observé"}
            </Button>
          )}
          {canRole(role, "record_learning") && <Button variant="outline" onClick={() => setLearningOpen(true)}>Enregistrer un apprentissage</Button>}
        </div>
      </section>

      <Sheet open={communicationOpen} onOpenChange={setCommunicationOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Consigner une communication</SheetTitle><SheetDescription>Communication simulée : aucun message, appel ou notification réel n’est envoyé. L’échange est uniquement consigné dans Mbàmbulaan.</SheetDescription></SheetHeader>
          <CommunicationForm situationId={situation.id} commitments={commitments} onDone={() => setCommunicationOpen(false)} />
        </SheetContent>
      </Sheet>

      <Sheet open={outcomeOpen} onOpenChange={setOutcomeOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Documenter le changement observé</SheetTitle><SheetDescription>Une activité réalisée n’est pas un changement en soi — décrivez ce qui a réellement évolué, avec son niveau d’attribution.</SheetDescription></SheetHeader>
          {situationResults.length > 0 && <OutcomeForm results={situationResults} onDone={() => setOutcomeOpen(false)} onCancel={() => setOutcomeOpen(false)} />}
        </SheetContent>
      </Sheet>

      <Sheet open={learningOpen} onOpenChange={setLearningOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Enregistrer un apprentissage</SheetTitle><SheetDescription>Que devons-nous faire différemment ou réutiliser ailleurs ?</SheetDescription></SheetHeader>
          <LearningForm situationId={situation.id} onDone={() => setLearningOpen(false)} onCancel={() => setLearningOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
