"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Handshake,
  MapPinned,
  Radio,
  ShipWheel,
  Target
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { SituationRow } from "@/components/situations/SituationRow";
import { professionalSpaces } from "@/config/professional-spaces";
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
    : role === "operateur" || role === "capitaine"
      ? open.filter((item) => item.trust === "declaree" || item.trust === "observee")
      : role === "mareyeur" || role === "transformateur"
        ? open.filter((item) => item.status === "coordination" || item.status === "intervention" || item.status === "attente")
        : [...critical, ...open.filter((item) => item.priority !== "critique")];

  return (
    <>
      <PageHeader
        eyebrow={space.eyebrow}
        title={space.title}
        description={space.valuePromise}
        actions={<Link href={space.primaryAction.href} className="btn-primary">{space.primaryAction.label} <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-6 p-5 lg:p-8">
        <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
          <div className="overflow-hidden rounded-[22px] bg-[#062f38] text-white shadow-[0_24px_70px_rgba(4,43,52,.18)]">
            <div className="relative overflow-hidden p-6 lg:p-8">
              <div className="absolute inset-0 opacity-30 ocean-grid" />
              <div className="relative max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#64decd]"><Radio size={15} /> Votre espace aujourd’hui</div>
                <h2 className="mt-5 text-3xl font-black leading-tight lg:text-4xl">
                  {critical.length > 0 ? `${critical.length} priorité critique demande une action.` : "Votre périmètre est stable, les engagements restent suivis."}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c9dfe2]">Vous ne voyez que vos situations, vos actions, vos engagements et les informations nécessaires à votre rôle.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={next[0] ? `/app/situations/${next[0].id}` : space.primaryAction.href} className="btn-accent">Traiter la prochaine action <ArrowRight size={16} /></Link>
                  <Link href="/app/atlas" className="btn-on-dark"><MapPinned size={16} /> Lire mon territoire</Link>
                </div>
              </div>
            </div>
          </div>

          <aside className="surface p-5 lg:p-6">
            <div className="flex items-center gap-2 text-[#087287]"><Target size={18} /><p className="label">Valeur de votre espace</p></div>
            <h2 className="mt-3 text-lg font-black text-[#07323c]">Ce que Mbàmbulaan doit vous apporter</h2>
            <div className="mt-5 space-y-3">
              {space.outcomes.map((outcome) => <div key={outcome} className="flex items-start gap-3 rounded-xl border border-[#d7e4e4] bg-[#f7fbfa] p-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#169785]" /><p className="text-sm font-bold text-[#23474e]">{outcome}</p></div>)}
            </div>
          </aside>
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-[#d9e3e3] px-5 py-4">
            <p className="label">Vos priorités</p>
            <h2 className="mt-1 text-xl font-black text-[#07323c]">Les trois sujets à surveiller dans cet espace</h2>
          </div>
          <div className="grid gap-px bg-[#d9e3e3] md:grid-cols-3">
            {space.priorities.map((priority, index) => <div key={priority} className="bg-white p-5"><span className="grid size-8 place-items-center rounded-full bg-[#e8f6f3] text-xs font-black text-[#087287]">{index + 1}</span><p className="mt-4 font-black text-[#07323c]">{priority}</p><p className="mt-2 text-sm leading-6 text-[#667b81]">Ouvrez le détail pour comprendre la source, le responsable et la prochaine action.</p></div>)}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Situations ouvertes" value={String(open.length)} detail="Dans votre périmètre" icon={Clock3} />
          <Metric label="Priorités immédiates" value={String(critical.length)} detail="Action attendue" icon={AlertTriangle} tone="coral" />
          <Metric label="Mes engagements" value={String(awaiting.length)} detail="À faire ou à débloquer" icon={Handshake} tone="lagoon" />
          <Metric label={role === "capitaine" || role === "operateur" ? "Opérations suivies" : "Résultats documentés"} value={String(role === "capitaine" || role === "operateur" ? visibleTripCount : completed.length)} detail={role === "capitaine" || role === "operateur" ? "Dans votre activité" : "Dans votre périmètre"} icon={role === "capitaine" || role === "operateur" ? ShipWheel : CheckCircle2} tone="sand" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <div className="surface overflow-hidden">
            <div className="flex items-end justify-between gap-4 border-b border-[#d9e3e3] px-5 py-4">
              <div><p className="label">Votre file de travail</p><h2 className="mt-1 text-xl font-black text-[#07323c]">À traiter maintenant</h2></div>
              <Link href="/app/situations" className="link-action">Voir ma file complète <ArrowRight size={15} /></Link>
            </div>
            {next.length > 0 ? next.slice(0, 4).map((item) => <SituationRow key={item.id} situation={item} state={state} />) : <p className="p-5 text-sm text-[#667b81]">Aucune action ne correspond actuellement à votre rôle et à votre périmètre.</p>}
          </div>

          <aside className="surface p-5">
            <div className="flex items-center gap-2 text-[#087287]"><ShipWheel size={18} /><p className="label">Périmètre visible</p></div>
            <h2 className="mt-3 text-lg font-black text-[#07323c]">Votre espace, pas celui des autres rôles</h2>
            <p className="mt-3 text-sm leading-6 text-[#667b81]">Votre session, votre organisation, votre territoire et vos droits déterminent les informations affichées. Le changement de rôle reste limité à l’entrée de démonstration.</p>
            <div className="mt-5 rounded-xl border border-[#cce2e1] bg-[#f0f8f6] p-4">
              <p className="text-xs font-black uppercase tracking-[.12em] text-[#397169]">Information exploitable</p>
              <p className="mt-2 text-sm font-bold text-[#153d44]">{trusted.length} situation{trusted.length > 1 ? "s" : ""} de votre périmètre dispose{trusted.length > 1 ? "nt" : ""} d’un niveau de confiance vérifié ou consolidé.</p>
            </div>
            <Link href={space.primaryAction.href} className="btn-secondary mt-5 w-full justify-center">{space.primaryAction.label}</Link>
          </aside>
        </section>
      </div>
    </>
  );
}
