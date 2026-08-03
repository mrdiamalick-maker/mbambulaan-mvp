"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Handshake,
  MapPinned,
  ShipWheel,
  Target
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { MbambulaanSignature } from "@/components/ui/MbambulaanSignature";
import { SituationRow } from "@/components/situations/SituationRow";
import { professionalSpaces } from "@/config/professional-spaces";
import { getArrivalSummary, sharedArrivalDemo } from "@/lib/mbambulaan/arrival-demo";
import type { ProductState, Role, Situation } from "@/domain/types";

function visibleSituations(state: ProductState, role: Role, actorId: string) {
  const actor = state.actors.find((item) => item.id === actorId);
  const territoryIds = new Set(actor?.territoryIds ?? []);
  const inTerritory = (item: Situation) => territoryIds.size === 0 || territoryIds.has(item.territoryId);

  if (role === "administrateur" || role === "institution") return state.situations;
  if (role === "partenaire") {
    return state.situations.filter((item) => (item.visibility === "partenaires" || item.visibility === "publique") && Boolean(item.initiativeId));
  }
  return state.situations.filter(inTerritory);
}

function visibleCommitments(state: ProductState, role: Role, actorId: string, situationIds: Set<string>) {
  return state.coordinationSpaces
    .filter((space) => !space.situationId || situationIds.has(space.situationId))
    .flatMap((space) => space.commitments)
    .filter((commitment) => {
      if (role === "administrateur" || role === "institution" || role === "coordinateur" || role === "gestionnaire_organisation") return true;
      return commitment.actorId === actorId;
    });
}

export default function WorkPage() {
  const { state, role, actorId } = useProduct();
  if (!state) return null;

  const space = professionalSpaces[role];
  const scopedSituations = visibleSituations(state, role, actorId);
  const open = scopedSituations.filter((item) => item.status !== "reglee");
  const critical = open.filter((item) => item.priority === "critique");
  const completed = scopedSituations.filter((item) => item.status === "reglee");
  const trusted = scopedSituations.filter((item) => item.trust === "verifiee" || item.trust === "consolidee");
  const situationIds = new Set(scopedSituations.map((item) => item.id));
  const commitments = visibleCommitments(state, role, actorId, situationIds);
  const awaiting = commitments.filter((item) => item.status === "a_faire" || item.status === "bloquee");

  const actor = state.actors.find((item) => item.id === actorId);
  const visibleTripCount = role === "capitaine"
    ? state.trips.filter((trip) => trip.captainId === actorId).length
    : state.trips.filter((trip) => {
        const vessel = state.vessels.find((item) => item.id === trip.vesselId);
        const site = state.sites.find((item) => item.id === vessel?.homeSiteId);
        return !actor || actor.territoryIds.length === 0 || (site ? actor.territoryIds.includes(site.territoryId) : false);
      }).length;

  const next = role === "partenaire"
    ? open.filter((item) => item.initiativeId)
    : role === "capitaine" || role === "operateur"
      ? open.filter((item) => item.trust === "declaree" || item.trust === "observee")
      : role === "mareyeur" || role === "transformateur"
        ? open.filter((item) => item.status === "coordination" || item.status === "intervention" || item.status === "attente")
        : [...critical, ...open.filter((item) => item.priority !== "critique")];

  const arrivalSummary = getArrivalSummary(sharedArrivalDemo);
  const isOperator = role === "operateur";
  const isCaptain = role === "capitaine";
  const isArrivalRole = isOperator || isCaptain;

  const captainDecision = sharedArrivalDemo.captainDecision === "contesté"
    ? "Votre pesée doit être vérifiée avec le quai"
    : !sharedArrivalDemo.arrived
      ? "Votre retour est annoncé ; vérifiez ce qui sera prêt au quai"
      : !sharedArrivalDemo.weightKg
        ? "Votre arrivée est confirmée ; la pesée reste à enregistrer"
        : sharedArrivalDemo.captainDecision === "en attente"
          ? "Confirmez ou contestez la pesée reçue"
          : "Votre sortie est terminée et confirmée";

  const mainDecision = isOperator
    ? arrivalSummary.nextAction
    : isCaptain
      ? captainDecision
      : next[0]?.title ?? "Aucune action urgente dans votre périmètre.";

  const mainActionHref = isOperator
    ? "/app/operations"
    : isCaptain
      ? "/app/operations"
      : next[0]
        ? `/app/situations/${next[0].id}`
        : space.primaryAction.href;

  const mainActionLabel = isOperator
    ? "Ouvrir les arrivées"
    : isCaptain
      ? "Voir ma sortie"
      : "Traiter la prochaine action";

  const signaturePoints = isOperator
    ? [
        { label: `${sharedArrivalDemo.eta}`, position: 18 },
        { label: `${arrivalSummary.missingItems.length} besoin à traiter`, position: 55, hot: arrivalSummary.missingItems.length > 0 },
        { label: sharedArrivalDemo.weightKg ? `${sharedArrivalDemo.weightKg} kg` : "Pesée à venir", position: 82 }
      ]
    : isCaptain
      ? [
          { label: `${sharedArrivalDemo.vessel}`, position: 18 },
          { label: `${sharedArrivalDemo.eta}`, position: 52 },
          { label: sharedArrivalDemo.captainDecision === "contesté" ? "Pesée à vérifier" : sharedArrivalDemo.weightKg ? `${sharedArrivalDemo.weightKg} kg` : "Pesée à venir", position: 82, hot: sharedArrivalDemo.captainDecision === "contesté" }
        ]
      : [
          { label: `${open.length} situations`, position: 18 },
          { label: `${awaiting.length} engagements`, position: 53 },
          { label: `${critical.length} priorité${critical.length > 1 ? "s" : ""}`, position: 82, hot: critical.length > 0 }
        ];

  return (
    <>
      <PageHeader
        eyebrow={space.eyebrow}
        title={space.title}
        description={space.valuePromise}
        actions={<Link href={space.primaryAction.href} className="btn-primary">{space.primaryAction.label} <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <MbambulaanSignature
          title={isArrivalRole ? `${sharedArrivalDemo.arrivalId} · ${mainDecision}` : critical.length > 0 ? `${critical.length} priorité critique demande une action maintenant.` : "Votre périmètre est stable, les engagements restent suivis."}
          detail={isOperator ? `${sharedArrivalDemo.vessel} · ${sharedArrivalDemo.captain} · quai de ${sharedArrivalDemo.quay}. Les réponses WhatsApp, téléphone et espace professionnel portent sur la même arrivée.` : isCaptain ? `Votre sortie, le quai, les besoins et la pesée restent les mêmes quel que soit le canal utilisé.` : "Cette ligne relie les signaux visibles, les engagements attendus et les priorités de votre rôle. Elle devient le repère commun de l’expérience Mbàmbulaan."}
          points={signaturePoints}
        />

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[#2f9d91]"><Target size={18} /><p className="label">Votre prochaine décision</p></div>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[#122b33]">{mainDecision}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#66767a]">{isOperator ? "Voyez uniquement l’arrivée à traiter, ce qui est prêt, ce qui manque et la prochaine action utile." : isCaptain ? "Voyez uniquement votre sortie, votre retour, ce qui sera prêt au quai et ce que vous devez confirmer." : "Vous ne voyez que vos situations, vos actions, vos engagements et les informations nécessaires à votre rôle."}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={mainActionHref} className="btn-accent">{mainActionLabel} <ArrowRight size={16} /></Link>
              <Link href="/app/atlas" className="btn-secondary"><MapPinned size={16} /> Lire mon territoire</Link>
            </div>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Valeur de votre espace</p>
            <h2 className="mt-3 text-2xl font-black text-[#122b33]">Ce que Mbàmbulaan doit vous apporter</h2>
            <div className="mt-5 space-y-4">
              {space.outcomes.map((outcome, index) => <div key={outcome} className="flex items-start gap-4 border-t border-black/10 pt-4 first:border-t-0 first:pt-0"><span className="text-2xl text-[#bd5f43]" style={{ fontFamily: "var(--mb-font-display)" }}>0{index + 1}</span><p className="pt-1 text-sm font-bold text-[#23474e]">{outcome}</p></div>)}
            </div>
          </aside>
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-black/10 px-6 py-5">
            <p className="label">Vos priorités</p>
            <h2 className="mt-1 text-2xl font-black text-[#122b33]">Les trois sujets à surveiller dans cet espace</h2>
          </div>
          <div className="divide-y divide-black/10 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
            {space.priorities.map((priority, index) => <div key={priority} className="bg-transparent p-6"><span className="text-4xl text-[#d5bd8a]" style={{ fontFamily: "var(--mb-font-display)" }}>0{index + 1}</span><p className="mt-4 text-lg font-black text-[#122b33]">{priority}</p><p className="mt-2 text-sm leading-6 text-[#66767a]">Ouvrez le détail pour comprendre la source, le responsable et la prochaine action.</p></div>)}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label={isOperator ? "Arrivées à traiter" : isCaptain ? "Sortie en cours" : "Situations ouvertes"} value={String(isArrivalRole ? 1 : open.length)} detail="Dans votre périmètre" icon={Clock3} />
          <Metric label={isOperator ? "Besoins manquants" : isCaptain ? "Besoins au quai" : "Priorités immédiates"} value={String(isOperator ? arrivalSummary.missingItems.length : isCaptain ? sharedArrivalDemo.needs.length : critical.length)} detail="Action attendue" icon={AlertTriangle} tone="coral" />
          <Metric label={isOperator ? "Éléments prêts" : isCaptain ? "Éléments prêts" : "Mes engagements"} value={String(isArrivalRole ? arrivalSummary.readyItems.length : awaiting.length)} detail={isArrivalRole ? "Confirmés pour cette arrivée" : "À faire ou à débloquer"} icon={Handshake} tone="lagoon" />
          <Metric label={isArrivalRole ? "Poids débarqué" : "Résultats documentés"} value={isArrivalRole ? (sharedArrivalDemo.weightKg ? `${sharedArrivalDemo.weightKg} kg` : "À venir") : String(completed.length)} detail={isArrivalRole ? "Partagé entre le quai et le capitaine" : "Dans votre périmètre"} icon={isArrivalRole ? ShipWheel : CheckCircle2} tone="sand" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <div className="surface overflow-hidden">
            <div className="flex items-end justify-between gap-4 border-b border-black/10 px-6 py-5">
              <div><p className="label">Votre file de travail</p><h2 className="mt-1 text-2xl font-black text-[#122b33]">À traiter maintenant</h2></div>
              <Link href={isArrivalRole ? "/app/operations" : "/app/situations"} className="link-action">Voir ma file complète <ArrowRight size={15} /></Link>
            </div>
            {isArrivalRole ? (
              <div className="p-6">
                <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">{sharedArrivalDemo.vessel} · {sharedArrivalDemo.captain}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{sharedArrivalDemo.arrivalId} · {sharedArrivalDemo.eta}</p>
                    </div>
                    <span className="rounded-full bg-[var(--sand-100)] px-3 py-1 text-xs font-semibold text-[var(--sand-500)]">{mainDecision}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Besoins : {sharedArrivalDemo.needs.join(", ")}</p>
                  <Link href="/app/operations" className="btn-secondary mt-5">{isCaptain ? "Voir ma sortie" : "Ouvrir l’arrivée"}</Link>
                </div>
              </div>
            ) : next.length > 0 ? next.slice(0, 4).map((item) => <SituationRow key={item.id} situation={item} state={state} />) : <p className="p-6 text-sm text-[#66767a]">Aucune action ne correspond actuellement à votre rôle et à votre périmètre.</p>}
          </div>

          <aside className="surface p-6">
            <div className="flex items-center gap-2 text-[#2f9d91]"><ShipWheel size={18} /><p className="label">Périmètre visible</p></div>
            <h2 className="mt-3 text-2xl font-black text-[#122b33]">Votre espace, pas celui des autres rôles</h2>
            <p className="mt-3 text-sm leading-6 text-[#66767a]">Votre session, votre organisation, votre territoire et vos droits déterminent les informations affichées. Le changement de rôle reste limité à l’entrée de démonstration.</p>
            <div className="mt-6 border-l-2 border-[#bd5f43] pl-4">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#8b6f3f]">Information exploitable</p>
              <p className="mt-2 text-sm font-bold text-[#153d44]">{isArrivalRole ? `L’arrivée ${sharedArrivalDemo.arrivalId} conserve le même état, quel que soit le canal utilisé.` : `${trusted.length} situation${trusted.length > 1 ? "s" : ""} de votre périmètre dispose${trusted.length > 1 ? "nt" : ""} d’un niveau de confiance vérifié ou consolidé.`}</p>
            </div>
            <Link href={space.primaryAction.href} className="btn-secondary mt-6 w-full justify-center">{space.primaryAction.label}</Link>
          </aside>
        </section>
      </div>
    </>
  );
}
