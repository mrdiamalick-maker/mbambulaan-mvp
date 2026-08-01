"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Factory,
  FileBarChart,
  KeyRound,
  LockKeyhole,
  MapPin,
  Network,
  Radio,
  ShieldCheck,
  UserCheck,
  UsersRound
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/ui/Badges";

const roleNames: Record<string, string> = {
  administrateur: "Administration de la plateforme",
  operateur: "Opérations de quai",
  capitaine: "Conduite de pirogue",
  mareyeur: "Mareyage et débouchés",
  transformateur: "Transformation",
  prestataire: "Services et capacités",
  gestionnaire_organisation: "Gestion de l’organisation",
  coordinateur: "Coordination territoriale",
  institution: "Pilotage institutionnel",
  partenaire: "Partenaire d’impact"
};

export function OrganizationWorkspace() {
  const { state, actorId } = useProduct();
  if (!state) return null;
  const actor = state.actors.find((item) => item.id === actorId) ?? state.actors[0];
  const organization = state.organizations.find((item) => item.id === actor.organizationId);
  const subscription = state.subscriptions.find((item) => item.organizationId === organization?.id);
  const plan = state.plans.find((item) => item.id === subscription?.planId);
  const members = state.actors.filter((item) => item.organizationId === organization?.id);
  const verifiedMembers = members.filter((item) => item.verified);
  const territoryIds = new Set(members.flatMap((item) => item.territoryIds));
  const ownedInfrastructure = state.infrastructures.filter((item) => item.organizationId === organization?.id);
  const availableServices = state.partnerServices.filter((service) => service.organizationId === organization?.id || service.status !== "a_activer");
  const openCommitments = state.coordinationSpaces.flatMap((space) => space.commitments).filter((commitment) => members.some((member) => member.id === commitment.actorId) && commitment.status !== "terminee");

  return (
    <div className="space-y-6">
      <section className="mission-strip p-6 lg:p-7">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-[#70e3d5]"><Building2 size={15} /> Organisation active</div>
            <h2 className="mt-4 text-3xl font-black tracking-[-.045em] lg:text-4xl">{organization?.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">Un périmètre de droits, de personnes, de capacités et de responsabilités. La plateforme montre qui peut agir, sur quel territoire et avec quelles preuves.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="ops-live-chip"><ShieldCheck size={13} /> Plan {plan?.name}</span>
            <span className="ops-live-chip"><Radio size={13} /> Tenant de démonstration</span>
          </div>
        </div>
        <div className="mt-7 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [UsersRound, "Membres habilités", `${verifiedMembers.length}/${members.length}`, "Identités vérifiées"],
            [MapPin, "Territoires couverts", String(territoryIds.size), "Selon les mandats actifs"],
            [Factory, "Capacités propres", String(ownedInfrastructure.length), "Actifs reliés à l’organisation"],
            [CheckCircle2, "Engagements ouverts", String(openCommitments.length), "Responsabilités en cours"]
          ].map(([Icon, label, value, detail]) => {
            const ItemIcon = Icon as typeof UsersRound;
            return <div key={String(label)} className="bg-white/[.035] p-4 text-white"><ItemIcon size={17} className="text-[#70e3d5]" /><p className="mt-3 text-2xl font-black tracking-[-.04em]">{String(value)}</p><p className="mt-1 text-xs font-bold">{String(label)}</p><p className="mt-1 text-[10px] text-white/35">{String(detail)}</p></div>;
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-[#d9e3e3] p-5">
            <div><div className="flex items-center gap-2 text-[#08758a]"><UserCheck size={18} /><p className="label">Réseau habilité</p></div><h2 className="mt-2 text-xl font-black">Membres actifs et mandats</h2></div>
            <span className="data-chip"><span className="size-1.5 rounded-full bg-[#1fb6a4]" /> {verifiedMembers.length} vérifiés</span>
          </div>
          <div className="divide-y divide-[#e1e9e9]">{members.map((member) => {
            const territories = member.territoryIds.map((id) => state.territories.find((territory) => territory.id === id)?.name).filter(Boolean);
            const commitments = state.coordinationSpaces.flatMap((space) => space.commitments).filter((commitment) => commitment.actorId === member.id && commitment.status !== "terminee");
            return <article key={member.id} className="grid gap-4 p-4 transition hover:bg-[#f8fbfa] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-5">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e5f7f3] font-black text-[#075568]">{member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{member.name}</h3>{member.verified && <span title="Identité vérifiée"><ShieldCheck size={14} className="text-[#118f83]" /></span>}</div><p className="mt-1 text-xs font-semibold text-[#526970]">{roleNames[member.role] ?? member.role}</p><p className="mt-1 truncate text-[10px] text-[#8a9a9e]">{territories.join(", ") || "Périmètre non attribué"}</p></div>
              <div className="sm:text-right"><p className="text-sm font-black text-[#075568]">{commitments.length}</p><p className="text-[10px] text-[#71858a]">engagement(s) ouvert(s)</p></div>
            </article>;
          })}</div>
        </div>

        <aside className="surface overflow-hidden">
          <div className="border-b border-[#d9e3e3] bg-[#f8fbfa] p-5"><div className="flex items-center gap-2 text-[#08758a]"><KeyRound size={18} /><p className="label">Gouvernance des accès</p></div><h2 className="mt-2 text-xl font-black">Capacités autorisées</h2></div>
          <div className="p-5">
            <p className="text-sm leading-6 text-[#667b81]">{plan?.value}</p>
            <div className="mt-5 space-y-2">{subscription?.entitlements.map((item) => <div key={item} className="flex items-center gap-2 rounded-lg border border-[#d9e3e3] bg-white p-3 text-xs font-bold text-[#294951]"><span className="grid size-6 place-items-center rounded-md bg-[#e9f7f1] text-[#126b58]"><Check size={12} /></span>{item.replaceAll("_", " ")}</div>)}</div>
            <p className="mt-5 flex items-start gap-2 rounded-xl bg-[#f3f7f6] p-4 text-xs leading-5 text-[#60737a]"><LockKeyhole size={14} className="mt-0.5 shrink-0" /> Les informations et actions restent limitées au mandat de l’organisation. Une fonctionnalité visible n’est pas automatiquement une donnée accessible.</p>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.95fr_1.05fr]">
        <div className="surface p-5">
          <div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-[#08758a]"><Factory size={18} /><p className="label">Portefeuille de capacités</p></div><h2 className="mt-2 text-lg font-black">Actifs et services mobilisables</h2></div><Network size={20} className="text-[#08758a]" /></div>
          <div className="mt-5 space-y-3">{availableServices.map((service) => {
            const owner = state.organizations.find((item) => item.id === service.organizationId);
            return <article key={service.id} className="rounded-xl border border-[#d9e3e3] bg-[#fbfdfc] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.08em] text-[#7a8e94]">{service.category} · {owner?.name}</p><h3 className="mt-1.5 text-sm font-black">{service.name}</h3></div><TrustBadge trust={service.trust} /></div><p className="mt-3 text-xs leading-5 text-[#667b81]">Activation : {service.activationConditions}</p></article>;
          })}</div>
          <Link href="/app/coordination" className="link-action mt-5">Ouvrir la salle de coordination <ArrowRight size={14} /></Link>
        </div>

        <div className="surface p-5">
          <div className="flex items-center gap-2 text-[#08758a]"><FileBarChart size={18} /><p className="label">Redevabilité</p></div>
          <h2 className="mt-2 text-lg font-black">Rapports prêts à partager</h2>
          <div className="mt-5 space-y-3">{state.reports.map((report) => <article key={report.id} className="rounded-xl border border-[#d9e3e3] p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.08em] text-[#118f83]">{report.status} · {report.period}</p><h3 className="mt-1.5 text-sm font-black">{report.title}</h3><p className="mt-1 text-xs text-[#667b81]">{report.metrics.length} indicateurs avec sources et limites</p></div><Link href="/app/pilotage" className="btn-secondary whitespace-nowrap">Consulter <ArrowRight size={14} /></Link></div></article>)}</div>
          <div className="mt-5 rounded-xl border border-[#cce2e1] bg-[#f0f8f6] p-4"><p className="text-xs font-black text-[#153d44]">La confiance est une capacité produit</p><p className="mt-2 text-xs leading-5 text-[#667b81]">Membres, sources, actifs et rapports utilisent le même référentiel : l’organisation ne reconstruit plus manuellement son récit d’impact.</p></div>
        </div>
      </section>
    </div>
  );
}
