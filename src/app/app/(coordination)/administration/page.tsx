"use client";

// Restylé en D9 (Lot 7, étape 2/4) : dernière page sarcelle explicitement
// reportée au « polish général du Lot 6 » sans être traitée — reprise ici.
// PageHeader (palette sarcelle) abandonné pour un en-tête inline, comme
// les autres pages déjà migrées (Lot 2 à 6).
import { Database, KeyRound, ScrollText, ShieldCheck } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";

export default function AdministrationPage() {
  const { state, persistence } = useProduct();
  if (!state) return null;
  return (
    <div className="shadcn-scope space-y-8 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Paramétrage et gouvernance</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Administration</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Accès réservé : mandats, qualité des données, journal des changements et état du stockage.</p>
      </div>

      <section className="grid border-y lg:grid-cols-3">
        <div className="py-5 lg:pr-6">
          <KeyRound className="text-[#1d4468]" />
          <h2 className="mt-4 font-semibold">Mandats actifs</h2>
          <p className="mt-2 text-3xl font-bold">{state.actors.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">Acteurs dotés d’un rôle et d’un périmètre territorial simulés.</p>
        </div>
        <div className="border-t py-5 lg:border-l lg:border-t-0 lg:px-6">
          <Database className="text-[#1d4468]" />
          <h2 className="mt-4 font-semibold">Source de vérité</h2>
          <p className="mt-2 text-lg font-bold">{persistence === "postgresql" ? "PostgreSQL" : "Mémoire de démonstration"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Révision courante : {state.revision}</p>
        </div>
        <div className="border-t py-5 lg:border-l lg:border-t-0 lg:pl-6">
          <ShieldCheck className="text-[#1d4468]" />
          <h2 className="mt-4 font-semibold">Tenant isolé</h2>
          <p className="mt-2 text-lg font-bold">{state.tenant.name}</p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#1d4468]">Aucune donnée de démonstration n’est une statistique officielle.</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-[#1d4468]/20 bg-card">
        <div className="border-b border-[#1d4468]/15 px-5 py-4">
          <div className="flex items-center gap-3">
            <ScrollText className="text-[#1d4468]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Journal immuable</p>
              <h2 className="mt-1 font-semibold">Derniers changements sensibles</h2>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Acteur</th><th className="p-3">Objet</th><th className="p-3">Action</th><th className="p-3">Détail</th></tr>
            </thead>
            <tbody>{state.audit.map((entry) => <tr key={entry.id} className="border-t"><td className="p-3">{new Date(entry.at).toLocaleString("fr-FR")}</td><td className="p-3">{entry.actorId}</td><td className="p-3">{entry.objectId}</td><td className="p-3 font-semibold">{entry.action}</td><td className="p-3">{entry.detail}</td></tr>)}</tbody>
          </table>
          {state.audit.length === 0 && <p className="p-6 text-sm text-muted-foreground">Le journal s’alimentera à la première action de démonstration.</p>}
        </div>
      </section>
    </div>
  );
}
