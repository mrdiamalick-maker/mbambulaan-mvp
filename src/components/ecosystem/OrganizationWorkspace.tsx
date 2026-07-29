"use client";

import { Building2, Check, LockKeyhole, Network, ShieldCheck, UsersRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/ui/Badges";

export function OrganizationWorkspace() {
  const { state, actorId } = useProduct();
  if (!state) return null;
  const actor = state.actors.find((item) => item.id === actorId) ?? state.actors[0];
  const organization = state.organizations.find((item) => item.id === actor.organizationId);
  const subscription = state.subscriptions.find((item) => item.organizationId === organization?.id);
  const plan = state.plans.find((item) => item.id === subscription?.planId);
  const members = state.actors.filter((item) => item.organizationId === organization?.id);
  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <article className="surface p-5 lg:p-6">
          <div className="flex items-start gap-4"><span className="grid size-12 place-items-center bg-[#075466] text-white"><Building2 /></span><div><p className="label">Organisation active</p><h2 className="mt-1 text-xl font-bold">{organization?.name}</h2><p className="mt-1 text-sm text-[#60737a]">{organization?.type.replaceAll("_", " ")} · tenant de démonstration</p></div></div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="bg-[#f4fbfc] p-4"><dt className="text-xs text-[#60737a]">Membres visibles</dt><dd className="mt-1 text-2xl font-bold">{members.length}</dd></div>
            <div className="bg-[#f1faf7] p-4"><dt className="text-xs text-[#60737a]">Territoires</dt><dd className="mt-1 text-2xl font-bold">{actor.territoryIds.length}</dd></div>
            <div className="bg-[#fcfaf4] p-4"><dt className="text-xs text-[#60737a]">Droits actifs</dt><dd className="mt-1 text-2xl font-bold">{subscription?.entitlements.length ?? 0}</dd></div>
          </dl>
        </article>
        <aside className="surface border-t-4 border-t-[#18a394] p-5 lg:p-6">
          <div className="flex items-center gap-2 text-[#126b58]"><ShieldCheck size={19} /><p className="label">Niveau d’accès</p></div>
          <h2 className="mt-3 text-xl font-bold">{plan?.name}</h2>
          <p className="mt-2 text-sm leading-6 text-[#60737a]">{plan?.value}</p>
          <div className="mt-4 flex flex-wrap gap-2">{subscription?.entitlements.map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[#e9f7f1] px-2.5 py-1 text-xs font-bold text-[#126b58]"><Check size={12} /> {item.replaceAll("_", " ")}</span>)}</div>
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#60737a]"><LockKeyhole size={14} className="mt-0.5 shrink-0" /> Les fonctions Premium restent visibles avec leur valeur, mais les actions respectent le mandat et le plan.</p>
        </aside>
      </section>
      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <div className="surface p-5">
          <div className="flex items-center gap-2"><UsersRound size={19} className="text-[#087287]" /><p className="label">Membres et mandats</p></div>
          <div className="mt-4 divide-y divide-[#e1e8e8]">{members.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-bold">{member.name}</p><p className="text-xs text-[#60737a]">{member.role.replaceAll("_", " ")}</p></div><span className="text-xs font-bold text-[#126b58]">{member.verified ? "Identité vérifiée" : "À vérifier"}</span></div>)}</div>
        </div>
        <div className="surface p-5">
          <div className="flex items-center gap-2"><Network size={19} className="text-[#087287]" /><p className="label">Services partenaires</p></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{state.partnerServices.map((service) => <article key={service.id} className="border border-[#d8e1e2] p-4"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-bold">{service.name}</h3><TrustBadge trust={service.trust} /></div><p className="mt-2 text-xs text-[#60737a]">{service.category} · {service.status.replaceAll("_", " ")}</p><p className="mt-3 text-xs leading-5 text-[#60737a]">Activation : {service.activationConditions}</p></article>)}</div>
        </div>
      </section>
    </div>
  );
}
