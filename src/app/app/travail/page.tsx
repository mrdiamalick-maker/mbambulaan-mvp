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
import { CapitaineWorkView } from "@/components/workspaces/CapitaineWorkView";
import { MareyeurWorkView } from "@/components/workspaces/MareyeurWorkView";
import { PrestataireWorkView } from "@/components/workspaces/PrestataireWorkView";
import { TransformatriceWorkView } from "@/components/workspaces/TransformatriceWorkView";
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
  if (role === "capitaine") return <CapitaineWorkView />;
  if (role === "mareyeur") return <MareyeurWorkView />;
  if (role === "transformateur") return <TransformatriceWorkView />;
  if (role === "prestataire") return <PrestataireWorkView />;

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
  const visibleTripCount = state.trips.filter((trip) => {
    const vessel = state.vessels.find((item) => item.id === trip.vesselId);
    const site = state.sites.find((item) => item.id === vessel?.homeSiteId);
    return !actor || actor.territoryIds.length === 0 || (site ? actor.territoryIds.includes(site.territoryId) : false);
  }).length;

  const next = role === "partenaire"
    ? open.filter((item) => item.initiativeId)
    : role === "operateur"
      ? open.filter((item) => item.trust === "declaree" || item.trust === "observee")
      : [...critical, ...open.filter((item) => item.priority !== "critique")];

  const arrivalSummary = getArrivalSummary(sharedArrivalDemo);
  const isOperator = role === "operateur";
  const mainDecision = isOperator ? arrivalSummary.nextAction : next[0]?.title ?? "Aucune action urgente dans votre périmètre.";
  const mainActionHref = isOperator ? "/app/operations" : next[0] ? `/app/situations/${next[0].id}` : space.primaryAction.href;
  const mainActionLabel = isOperator ? "Ouvrir les arrivées" : "Traiter la prochaine action";

  const signaturePoints = isOperator
    ? [
        { label: `${sharedArrivalDemo.eta}`, position: 18 },
        { label: `${arrivalSummary.missingItems.length} besoin à traiter`, position: 55, hot: arrivalSummary.missingItems.length > 0 },
        { label: sharedArrivalDemo.weightKg ? `${sharedArrivalDemo.weightKg} kg` : "Pesée à venir", position: 82 }
      ]
    : [
        { label: `${open.length} situations`, position: 18 },
        { label: `${awaiting.length} éléments à faire`, position: 53 },
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
          title={isOperator ? `${sharedArrivalDemo.arrivalId} · ${mainDecision}` : critical.length > 0 ? `${critical.length} priorité critique demande une action maintenant.` : "Votre périmètre est stable."}
          detail={isOperator ? `${sharedArrivalDemo.vessel} · ${sharedArrivalDemo.captain} · quai de ${sharedArrivalDemo.quay}. Le messaging, le téléphone et cet espace portent sur la même arrivée.` : "Les informations affichées sont limitées à votre rôle, votre territoire et ce que vous devez réellement décider."}
          points={signaturePoints}
        />

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[#2f9d91]"><Target size={18} /><p className="label">À faire maintenant</p></div>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[#122b33]">{mainDecision}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#66767a]">{isOperator ? "Voyez uniquement l’arrivée à traiter, ce qui est prêt, ce qui manque et la prochaine action utile." : "Vous ne voyez que les informations nécessaires à votre rôle."}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={mainActionHref} className="btn-accent">{mainActionLabel} <ArrowRight size={16} /></Link>
              <Link href="/app/atlas" className="btn-secondary"><MapPinned size={16} /> Voir mon territoire</Link>
            </div>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Ce que cet espace vous apporte</p>
            <div className="mt-5 space-y-4">
              {space.outcomes.map((outcome, index) => <div key={outcome} className="flex items-start gap-4 border-t border-black/10 pt-4 first:border-t-0 first:pt-0"><span className="text-2xl text-[#bd5f43]" style={{ fontFamily: "var(--mb-font-display)" }}>0{index + 1}</span><p className="pt-1 text-sm font-bold text-[#23474e]">{outcome}</p></div>)}
            </div>
          </aside>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label={isOperator ? "Arrivées à traiter" : "Sujets ouverts"} value={String(isOperator ? 1 : open.length)} detail="Dans votre périmètre" icon={Clock3} />
          <Metric label={isOperator ? "Éléments manquants" : "Priorités immédiates"} value={String(isOperator ? arrivalSummary.missingItems.length : critical.length)} detail="À faire" icon={AlertTriangle} tone="coral" />
          <Metric label={isOperator ? "Éléments prêts" : "Ce que vous avez accepté"} value={String(isOperator ? arrivalSummary.readyItems.length : awaiting.length)} detail={isOperator ? "Confirmés pour cette arrivée" : "À faire ou à débloquer"} icon={Handshake} tone="lagoon" />
          <Metric label={isOperator ? "Poids débarqué" : "Résultats terminés"} value={isOperator ? (sharedArrivalDemo.weightKg ? `${sharedArrivalDemo.weightKg} kg` : "À venir") : String(completed.length)} detail={isOperator ? "Partagé avec le capitaine" : "Dans votre périmètre"} icon={isOperator ? ShipWheel : CheckCircle2} tone="sand" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <div className="surface overflow-hidden">
            <div className="flex items-end justify-between gap-4 border-b border-black/10 px-6 py-5">
              <div><p className="label">À traiter</p><h2 className="mt-1 text-2xl font-black text-[#122b33]">Maintenant</h2></div>
              <Link href={isOperator ? "/app/operations" : "/app/situations"} className="link-action">Voir la liste <ArrowRight size={15} /></Link>
            </div>
            {isOperator ? (
              <div className="p-6">
                <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5">
                  <p className="text-sm font-semibold text-[var(--ink)]">{sharedArrivalDemo.vessel} · {sharedArrivalDemo.captain}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{sharedArrivalDemo.arrivalId} · {sharedArrivalDemo.eta}</p>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">À préparer : {sharedArrivalDemo.needs.join(", ")}</p>
                  <Link href="/app/operations" className="btn-secondary mt-5">Ouvrir l’arrivée</Link>
                </div>
              </div>
            ) : next.length > 0 ? next.slice(0, 4).map((item) => <SituationRow key={item.id} situation={item} state={state} />) : <p className="p-6 text-sm text-[#66767a]">Rien à faire maintenant.</p>}
          </div>

          <aside className="surface p-6">
            <div className="flex items-center gap-2 text-[#2f9d91]"><ShipWheel size={18} /><p className="label">Votre périmètre</p></div>
            <h2 className="mt-3 text-2xl font-black text-[#122b33]">Seulement ce qui vous concerne</h2>
            <p className="mt-3 text-sm leading-6 text-[#66767a]">Votre organisation, votre territoire et vos droits déterminent ce que vous voyez.</p>
            <div className="mt-6 border-l-2 border-[#bd5f43] pl-4">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#8b6f3f]">Information utile</p>
              <p className="mt-2 text-sm font-bold text-[#153d44]">{isOperator ? `L’arrivée ${sharedArrivalDemo.arrivalId} conserve le même état dans tous les canaux.` : `${trusted.length} information${trusted.length > 1 ? "s" : ""} vérifiée${trusted.length > 1 ? "s" : ""} dans votre périmètre.`}</p>
            </div>
            <p className="mt-5 text-xs text-[var(--muted)]">{visibleTripCount} sortie{visibleTripCount > 1 ? "s" : ""} visible{visibleTripCount > 1 ? "s" : ""} dans ce périmètre.</p>
          </aside>
        </section>
      </div>
    </>
  );
}
