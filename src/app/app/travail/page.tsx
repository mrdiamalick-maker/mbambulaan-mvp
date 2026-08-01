"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Handshake,
  MapPinned,
  Radio,
  ShipWheel,
  Sparkles
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { SituationRow } from "@/components/situations/SituationRow";

const framing = {
  administrateur: { eyebrow: "Supervision du service", title: "Continuité et qualité du dispositif", action: "Contrôler les référentiels", href: "/app/administration" },
  operateur: { eyebrow: "Permanence opérationnelle", title: "Retours et débarquements à confirmer", action: "Ouvrir les opérations", href: "/app/operations" },
  capitaine: { eyebrow: "Activité du jour", title: "Votre sortie, du retour au débarquement", action: "Suivre ma sortie", href: "/app/operations" },
  mareyeur: { eyebrow: "Approvisionnement", title: "Lots disponibles et besoins à rapprocher", action: "Voir les opportunités", href: "/app/marches" },
  transformateur: { eyebrow: "Approvisionnement", title: "Volumes à sécuriser et capacités à activer", action: "Voir les opportunités", href: "/app/marches" },
  prestataire: { eyebrow: "Services territoriaux", title: "Interventions et capacités attendues", action: "Voir la coordination", href: "/app/coordination" },
  gestionnaire_organisation: { eyebrow: "Organisation", title: "Membres, actifs et engagements collectifs", action: "Ouvrir l’organisation", href: "/app/organisation" },
  coordinateur: { eyebrow: "Centre de situation", title: "Coordonner la filière aujourd’hui", action: "Traiter la priorité", href: "/app/situations" },
  institution: { eyebrow: "Situation nationale", title: "Voir, arbitrer et documenter l’action publique", action: "Ouvrir le pilotage", href: "/app/pilotage" },
  partenaire: { eyebrow: "Portefeuille d’impact", title: "Instruire les besoins qualifiés et leurs résultats", action: "Voir les initiatives", href: "/app/initiatives" }
} as const;

export default function WorkPage() {
  const { state, role } = useProduct();
  if (!state) return null;

  const open = state.situations.filter((item) => item.status !== "reglee");
  const critical = open.filter((item) => item.priority === "critique");
  const completed = state.situations.filter((item) => item.status === "reglee");
  const trusted = state.situations.filter((item) => item.trust === "verifiee" || item.trust === "consolidee");
  const awaiting = state.coordinationSpaces.flatMap((item) => item.commitments).filter((item) => item.status === "a_faire" || item.status === "bloquee");
  const totalFunding = state.initiatives.flatMap((item) => item.funding).reduce((sum, item) => sum + item.amountFcfa, 0);
  const frame = framing[role];
  const next = role === "partenaire"
    ? open.filter((item) => item.initiativeId)
    : role === "operateur" || role === "capitaine"
      ? open.filter((item) => item.trust === "declaree" || item.trust === "observee")
      : [...critical, ...open.filter((item) => item.priority !== "critique")];

  return (
    <>
      <PageHeader
        eyebrow={frame.eyebrow}
        title={frame.title}
        description="Une lecture commune de la situation, puis une action claire. Les sources, responsabilités et résultats restent visibles à chaque étape."
        actions={<Link href={frame.href} className="btn-primary">{frame.action} <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-6 p-5 lg:p-8">
        <section className="overflow-hidden rounded-[22px] bg-[#062f38] text-white shadow-[0_24px_70px_rgba(4,43,52,.18)]">
          <div className="grid lg:grid-cols-[1.3fr_.7fr]">
            <div className="relative overflow-hidden p-6 lg:p-8">
              <div className="absolute inset-0 opacity-30 ocean-grid" />
              <div className="relative max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#64decd]"><Radio size={15} /> Point de situation · actualisé aujourd’hui</div>
                <h2 className="mt-5 text-3xl font-black leading-tight lg:text-4xl">{critical.length > 0 ? `${critical.length} situation critique demande une coordination immédiate.` : "La situation est stable, les engagements restent suivis."}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c9dfe2]">{open.length} situations sont ouvertes sur {state.territories.length} territoires. {trusted.length} disposent déjà d’un niveau de confiance vérifié ou consolidé.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={next[0] ? `/app/situations/${next[0].id}` : "/app/situations"} className="btn-accent">Traiter la prochaine situation <ArrowRight size={16} /></Link>
                  <Link href="/app/atlas" className="btn-on-dark"><MapPinned size={16} /> Lire le territoire</Link>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 bg-white/[.05] p-6 lg:border-l lg:border-t-0 lg:p-8">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#9cc9cf]">Ce que le dispositif produit</p>
              <div className="mt-5 space-y-5">
                {[
                  [FileCheck2, `${trusted.length} informations qualifiées`, "utilisables pour décider"],
                  [Handshake, `${state.coordinationSpaces.length} coordinations actives`, "responsables et échéances connus"],
                  [CircleDollarSign, `${(totalFunding / 1_000_000).toFixed(0)} M FCFA`, "de financement en instruction"],
                  [CheckCircle2, `${completed.length} résultat documenté`, "réutilisable par la filière"]
                ].map(([Icon, value, detail]) => {
                  const ItemIcon = Icon as typeof FileCheck2;
                  return <div key={String(value)} className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#36c6b1]/15 text-[#64decd]"><ItemIcon size={18} /></span><div><p className="font-extrabold">{String(value)}</p><p className="mt-1 text-xs text-[#a9c8cd]">{String(detail)}</p></div></div>;
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Situations ouvertes" value={String(open.length)} detail="Avec source et prochaine action" icon={Clock3} />
          <Metric label="Priorités immédiates" value={String(critical.length)} detail="Arbitrage ou intervention attendue" icon={AlertTriangle} tone="coral" />
          <Metric label="Engagements attendus" value={String(awaiting.length)} detail="À faire ou à débloquer" icon={Handshake} tone="lagoon" />
          <Metric label="Sorties suivies" value={String(state.trips.length)} detail="Du départ au débarquement" icon={ShipWheel} tone="sand" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <div className="surface overflow-hidden">
            <div className="flex items-end justify-between gap-4 border-b border-[#d9e3e3] px-5 py-4">
              <div><p className="label">File de coordination</p><h2 className="mt-1 text-xl font-black text-[#07323c]">À traiter maintenant</h2></div>
              <Link href="/app/situations" className="link-action">Toutes les situations <ArrowRight size={15} /></Link>
            </div>
            {next.length > 0 ? next.slice(0, 4).map((item) => <SituationRow key={item.id} situation={item} state={state} />) : <p className="p-5 text-sm text-[#667b81]">Aucune action ne correspond à cette vue.</p>}
          </div>

          <aside className="surface p-5">
            <div className="flex items-center gap-2 text-[#087287]"><Sparkles size={18} /><p className="label">Assistance Mbàmbulaan</p></div>
            <h2 className="mt-3 text-lg font-black text-[#07323c]">Synthèse explicable, décision humaine</h2>
            <p className="mt-3 text-sm leading-6 text-[#667b81]">L’assistance peut regrouper les signaux, résumer les preuves et préparer une note. Elle n’agit jamais sans validation et peut être désactivée.</p>
            <div className="mt-5 rounded-xl border border-[#cce2e1] bg-[#f0f8f6] p-4">
              <p className="text-xs font-black uppercase tracking-[.12em] text-[#397169]">Suggestion du jour</p>
              <p className="mt-2 text-sm font-bold text-[#153d44]">Prioriser la continuité du froid entre Joal et Mbour avant le prochain volume annoncé.</p>
              <p className="mt-2 text-xs leading-5 text-[#667b81]">Fondée sur les capacités déclarées, les situations ouvertes et les engagements existants.</p>
            </div>
            <Link href="/app/pilotage" className="btn-secondary mt-5 w-full justify-center">Vérifier dans le pilotage</Link>
          </aside>
        </section>
      </div>
    </>
  );
}
