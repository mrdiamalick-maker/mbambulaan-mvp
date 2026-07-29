"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Handshake, MapPinned, ShipWheel } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { SituationRow } from "@/components/situations/SituationRow";

const framing = {
  administrateur: ["À superviser", "Qualité des données, droits, parcours critiques et continuité du service"],
  operateur: ["À confirmer au quai", "Retours, débarquements, pesées et signaux terrain"],
  capitaine: ["Votre activité aujourd’hui", "Retour attendu, déclaration et besoins opérationnels"],
  mareyeur: ["À anticiper", "Lots disponibles, besoins ouverts, prix et engagements"],
  transformateur: ["À sécuriser", "Approvisionnements, surplus et retraits coordonnés"],
  prestataire: ["À servir", "Demandes qualifiées, capacités et interventions attendues"],
  gestionnaire_organisation: ["À coordonner collectivement", "Membres, actifs, besoins et résultats de l’organisation"],
  coordinateur: ["À coordonner aujourd’hui", "Situations, engagements et blocages entre acteurs"],
  institution: ["À décider", "Tensions territoriales, résultats et besoins d’investissement"],
  partenaire: ["À instruire", "Besoins qualifiés, engagements et résultats documentés"]
} as const;

export default function WorkPage() {
  const { state, role } = useProduct();
  if (!state) return null;
  const open = state.situations.filter((item) => item.status !== "reglee");
  const critical = open.filter((item) => item.priority === "critique");
  const completed = state.situations.filter((item) => item.status === "reglee");
  const [title, detail] = framing[role];
  const next = role === "partenaire"
    ? open.filter((item) => item.initiativeId)
    : role === "operateur" || role === "capitaine"
      ? open.filter((item) => item.trust === "declaree")
      : [...critical, ...open.filter((item) => item.priority !== "critique")];

  return (
    <>
      <PageHeader
        eyebrow="Briefing du jour"
        title={title}
        description={`${detail}. Chaque entrée indique ce qui est connu, le niveau de confiance et la prochaine action utile.`}
        actions={<Link href="/demo" className="inline-flex items-center gap-2 border border-[#9ecbd2] px-4 py-2.5 text-sm font-bold text-[#075466]">Parcours guidé <ArrowRight size={16} /></Link>}
      />
      <div className="space-y-8 p-5 lg:p-8">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Situations ouvertes" value={String(open.length)} detail="Tous territoires et niveaux de confiance" icon={ClipboardList} />
          <Metric label="À traiter en priorité" value={String(critical.length)} detail="Action ou arbitrage attendu aujourd’hui" icon={AlertTriangle} tone="coral" />
          <Metric label="Coordinations actives" value={String(state.coordinationSpaces.length)} detail="Engagements répartis entre acteurs" icon={Handshake} tone="lagoon" />
          <Metric label="Sorties suivies" value={String(state.trips.length)} detail="Retours annoncés, arrivées et débarquements reliés" icon={ShipWheel} tone="sand" />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="label">Prochaine action</p><h2 className="mt-1 text-xl font-bold text-[#062d36]">À traiter maintenant</h2></div>
            <Link href="/app/situations" className="text-sm font-bold text-[#075466]">Voir toutes les situations</Link>
          </div>
          <div className="surface overflow-hidden">{next.slice(0, 3).map((item) => <SituationRow key={item.id} situation={item} state={state} />)}</div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Link href="/app/atlas" className="surface group p-5 hover:border-[#8dcbd1]">
            <MapPinned className="text-[#087287]" /><h3 className="mt-4 font-bold">Lire le territoire</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">Situer les quais, les infrastructures et les tensions avant d’agir.</p>
          </Link>
          <Link href="/app/coordination" className="surface group p-5 hover:border-[#8dcbd1]">
            <Handshake className="text-[#18a394]" /><h3 className="mt-4 font-bold">Suivre les engagements</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">Voir qui fait quoi, pour quand, et quels blocages doivent être levés.</p>
          </Link>
          <Link href="/app/pilotage" className="surface group p-5 hover:border-[#8dcbd1]">
            <CheckCircle2 className="text-[#d89614]" /><h3 className="mt-4 font-bold">Mesurer et apprendre</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">{completed.length} situation réglée alimente déjà la connaissance partagée.</p>
          </Link>
        </section>
      </div>
    </>
  );
}
