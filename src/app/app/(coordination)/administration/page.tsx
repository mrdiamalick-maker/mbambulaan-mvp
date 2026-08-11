"use client";

// Restylé en D9 (Lot 7, étape 2/4) : dernière page sarcelle explicitement
// reportée au « polish général du Lot 6 » sans être traitée — reprise ici.
// PageHeader (palette sarcelle) abandonné pour un en-tête inline, comme
// les autres pages déjà migrées (Lot 2 à 6).
import { Database, KeyRound, ScrollText, ShieldCheck } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Card, CardContent } from "@/components/ui/card";

export default function AdministrationPage() {
  const { state, persistence } = useProduct();
  if (!state) return null;
  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Paramétrage et gouvernance</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Administration</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Accès réservé : mandats, qualité des données, journal des changements et état du stockage.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card><CardContent className="p-5"><KeyRound className="text-[#1d4468]" /><h2 className="mt-4 font-semibold">Mandats actifs</h2><p className="mt-2 text-3xl font-bold">{state.actors.length}</p><p className="mt-2 text-sm text-muted-foreground">Acteurs dotés d’un rôle et d’un périmètre territorial simulés.</p></CardContent></Card>
        <Card><CardContent className="p-5"><Database className="text-[#1d8a5f]" /><h2 className="mt-4 font-semibold">Source de vérité</h2><p className="mt-2 text-lg font-bold">{persistence === "postgresql" ? "PostgreSQL" : "Mémoire de démonstration"}</p><p className="mt-2 text-sm text-muted-foreground">Révision courante : {state.revision}</p></CardContent></Card>
        <Card><CardContent className="p-5"><ShieldCheck className="text-[#c68a2c]" /><h2 className="mt-4 font-semibold">Tenant isolé</h2><p className="mt-2 text-lg font-bold">{state.tenant.name}</p><p className="mt-2 text-sm text-muted-foreground">Aucune donnée de démonstration n’est une statistique officielle.</p></CardContent></Card>
        <Card className="overflow-hidden lg:col-span-3">
          <div className="border-b p-5">
            <div className="flex items-center gap-3">
              <ScrollText className="text-[#1d4468]" />
              <div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Journal immuable</p><h2 className="mt-1 font-semibold">Derniers changements sensibles</h2></div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground"><tr><th className="p-3">Date</th><th className="p-3">Acteur</th><th className="p-3">Objet</th><th className="p-3">Action</th><th className="p-3">Détail</th></tr></thead>
              <tbody>{state.audit.map((entry) => <tr key={entry.id} className="border-t"><td className="p-3">{new Date(entry.at).toLocaleString("fr-FR")}</td><td className="p-3">{entry.actorId}</td><td className="p-3">{entry.objectId}</td><td className="p-3 font-semibold">{entry.action}</td><td className="p-3">{entry.detail}</td></tr>)}</tbody>
            </table>
            {state.audit.length === 0 && <p className="p-6 text-sm text-muted-foreground">Le journal s’alimentera à la première action de démonstration.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
