"use client";

import { Database, KeyRound, ScrollText, ShieldCheck } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdministrationPage() {
  const { state, persistence } = useProduct();
  if (!state) return null;
  return (
    <>
      <PageHeader eyebrow="Paramétrage et gouvernance" title="Administration" description="Accès réservé : mandats, qualité des données, journal des changements et état du stockage." />
      <div className="grid gap-5 p-5 lg:grid-cols-3 lg:p-8">
        <section className="surface p-5"><KeyRound className="text-[#087287]" /><h2 className="mt-4 font-bold">Mandats actifs</h2><p className="mt-2 text-3xl font-bold">{state.actors.length}</p><p className="mt-2 text-sm text-[#60737a]">Acteurs dotés d’un rôle et d’un périmètre territorial simulés.</p></section>
        <section className="surface p-5"><Database className="text-[#18a394]" /><h2 className="mt-4 font-bold">Source de vérité</h2><p className="mt-2 text-lg font-bold">{persistence === "postgresql" ? "PostgreSQL" : "Mémoire de démonstration"}</p><p className="mt-2 text-sm text-[#60737a]">Révision courante : {state.revision}</p></section>
        <section className="surface p-5"><ShieldCheck className="text-[#d89614]" /><h2 className="mt-4 font-bold">Tenant isolé</h2><p className="mt-2 text-lg font-bold">{state.tenant.name}</p><p className="mt-2 text-sm text-[#60737a]">Aucune donnée de démonstration n’est une statistique officielle.</p></section>
        <section className="surface overflow-hidden lg:col-span-3"><div className="border-b border-[#d8e1e2] p-5"><div className="flex items-center gap-3"><ScrollText className="text-[#087287]" /><div><p className="label">Journal immuable</p><h2 className="mt-1 font-bold">Derniers changements sensibles</h2></div></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#f4f7f6] text-xs uppercase text-[#60737a]"><tr><th className="p-3">Date</th><th className="p-3">Acteur</th><th className="p-3">Objet</th><th className="p-3">Action</th><th className="p-3">Détail</th></tr></thead><tbody>{state.audit.map((entry) => <tr key={entry.id} className="border-t border-[#e1e7e8]"><td className="p-3">{new Date(entry.at).toLocaleString("fr-FR")}</td><td className="p-3">{entry.actorId}</td><td className="p-3">{entry.objectId}</td><td className="p-3 font-bold">{entry.action}</td><td className="p-3">{entry.detail}</td></tr>)}</tbody></table>{state.audit.length === 0 && <p className="p-6 text-sm text-[#60737a]">Le journal s’alimentera à la première action de démonstration.</p>}</div></section>
      </div>
    </>
  );
}
