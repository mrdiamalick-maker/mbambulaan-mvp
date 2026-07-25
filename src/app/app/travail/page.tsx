"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  Handshake,
  MapPinned,
  ShieldCheck,
  UsersRound,
  WalletCards,
  Wrench
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { SituationRow } from "@/components/situations/SituationRow";
import type { Role } from "@/domain/types";

const framing: Record<Role, { title: string; detail: string; promise: string; icon: typeof Wrench; benefits: string[]; contribution: string }> = {
  agent_terrain: {
    title: "Mes opérations terrain",
    detail: "Signaler, confirmer et suivre les problèmes qui affectent directement l’activité du quai",
    promise: "Réduire le temps perdu entre un problème constaté et sa prise en charge.",
    icon: ClipboardCheck,
    benefits: ["Mes signalements suivis jusqu’à résolution", "Les réponses et interventions attendues", "L’historique utile pour éviter les répétitions"],
    contribution: "Je contribue avec des observations fiables, des confirmations terrain et des preuves simples."
  },
  coordinateur: {
    title: "Mon centre de coordination",
    detail: "Prioriser les situations, mobiliser les bons acteurs et suivre les engagements jusqu’au résultat",
    promise: "Piloter plusieurs territoires sans perdre les responsabilités, délais et blocages.",
    icon: UsersRound,
    benefits: ["Une file de travail priorisée", "Qui fait quoi, pour quand", "Les blocages à lever avant qu’ils ne deviennent des crises"],
    contribution: "Je contribue en organisant la réponse collective et en maintenant les décisions traçables."
  },
  responsable_initiative: {
    title: "Mes interventions et engagements",
    detail: "Exécuter les actions, documenter l’avancement et sécuriser les moyens nécessaires",
    promise: "Transformer les demandes dispersées en interventions planifiées et valorisables.",
    icon: Wrench,
    benefits: ["Les interventions qui me concernent", "Les échéances, ressources et dépendances", "Des preuves de réalisation réutilisables"],
    contribution: "Je contribue avec mes capacités, mes délais, mes coûts et les résultats réellement livrés."
  },
  decideur: {
    title: "Mes arbitrages et décisions",
    detail: "Décider sur des priorités consolidées, des impacts attendus et des responsabilités explicites",
    promise: "Décider plus vite avec une information vérifiée et reliée aux réalités territoriales.",
    icon: Building2,
    benefits: ["Les arbitrages réellement attendus", "Les impacts territoriaux et risques associés", "La traçabilité des décisions et de leur exécution"],
    contribution: "Je contribue par les priorités, arbitrages, autorisations et ressources publiques mobilisées."
  },
  partenaire: {
    title: "Mon portefeuille d’initiatives",
    detail: "Instruire, financer et suivre les initiatives avec des preuves d’exécution et de résultat",
    promise: "Réduire le risque de financement et suivre l’usage réel des fonds engagés.",
    icon: WalletCards,
    benefits: ["Les dossiers prêts à instruire", "Les conditions et jalons à contrôler", "Les résultats et écarts documentés"],
    contribution: "Je contribue avec du financement, des conditions explicites et un suivi orienté résultat."
  },
  expert: {
    title: "Mes validations et connaissances",
    detail: "Qualifier les informations, formaliser les méthodes utiles et rendre l’expertise réutilisable",
    promise: "Valoriser l’expertise au-delà d’une mission ponctuelle et éviter de repartir de zéro.",
    icon: BadgeCheck,
    benefits: ["Les éléments à vérifier", "Les avis et recommandations attendus", "Une base de connaissances issue des cas réels"],
    contribution: "Je contribue avec des validations, méthodes, diagnostics et enseignements réutilisables."
  },
  administrateur: {
    title: "Ma plateforme et sa qualité de service",
    detail: "Gérer les accès, la qualité des données, les règles de fonctionnement et la continuité du service",
    promise: "Exploiter une infrastructure fiable, gouvernée et capable de monter en charge.",
    icon: ShieldCheck,
    benefits: ["Les accès et organisations à administrer", "Les anomalies et données à corriger", "La continuité, l’audit et la conformité du service"],
    contribution: "Je contribue en garantissant les règles, la sécurité et la qualité opérationnelle de l’écosystème."
  }
};

export default function WorkPage() {
  const { state, role } = useProduct();
  if (!state) return null;

  const open = state.situations.filter((item) => item.status !== "reglee");
  const critical = open.filter((item) => item.priority === "critique");
  const completed = state.situations.filter((item) => item.status === "reglee");
  const current = framing[role];
  const ValueIcon = current.icon;
  const next = role === "partenaire"
    ? open.filter((item) => item.initiativeId)
    : role === "agent_terrain"
      ? open.filter((item) => item.trust === "declaree")
      : [...critical, ...open.filter((item) => item.priority !== "critique")];

  return (
    <>
      <PageHeader
        eyebrow="Espace de travail professionnel"
        title={current.title}
        description={`${current.detail}. Cet espace est conçu pour accomplir un travail concret, pas seulement consulter des indicateurs.`}
        actions={<Link href="/demo" className="inline-flex items-center gap-2 border border-[#9ecbd2] px-4 py-2.5 text-sm font-bold text-[#075466]">Voir le cycle complet <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-8 p-5 lg:p-8">
        <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <div className="surface border-l-4 border-l-[#18a394] p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center bg-[#e6f7f4] text-[#087c70]"><ValueIcon size={22} /></span>
              <div>
                <p className="label">Pourquoi cet espace mérite un abonnement ou une licence</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#062d36]">{current.promise}</h2>
                <ul className="mt-5 grid gap-3 text-sm text-[#40575f] md:grid-cols-3">
                  {current.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2 leading-6"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#18a394]" />{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <div className="flex items-center gap-3">
              <Handshake className="text-[#087287]" />
              <div>
                <p className="label">Contribution à l’écosystème</p>
                <h2 className="mt-1 text-lg font-bold text-[#062d36]">La valeur circule dans les deux sens</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#526970]">{current.contribution}</p>
            <p className="mt-3 border-t border-[#dce6e7] pt-3 text-xs leading-5 text-[#60737a]">Mbàmbulaan ne vend pas un tableau de bord. Il organise un échange de valeur : chaque acteur reçoit un service métier utile et alimente, selon ses droits, une coordination collective plus fiable.</p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Travail ouvert" value={String(open.length)} detail="Situations encore actives dans mon périmètre" icon={ClipboardList} />
          <Metric label="Priorité immédiate" value={String(critical.length)} detail="Action ou arbitrage attendu aujourd’hui" icon={AlertTriangle} tone="coral" />
          <Metric label="Engagements coordonnés" value={String(state.coordinationSpaces.length)} detail="Responsabilités et échéances suivies" icon={Handshake} tone="lagoon" />
          <Metric label="Résultats capitalisés" value={String(completed.length)} detail="Cas résolus transformés en connaissance utile" icon={BookOpenCheck} tone="sand" />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="label">File de travail</p><h2 className="mt-1 text-xl font-bold text-[#062d36]">Ce qui demande mon action maintenant</h2></div>
            <Link href="/app/situations" className="text-sm font-bold text-[#075466]">Ouvrir toute ma file</Link>
          </div>
          <div className="surface overflow-hidden">
            {next.length > 0 ? next.slice(0, 3).map((item) => <SituationRow key={item.id} situation={item} state={state} />) : (
              <div className="p-6 text-sm text-[#60737a]">Aucune action immédiate pour ce rôle. Les contributions et validations à venir apparaîtront ici.</div>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Link href="/app/territoires" className="surface group p-5 hover:border-[#8dcbd1]">
            <MapPinned className="text-[#087287]" /><h3 className="mt-4 font-bold">Comprendre avant d’agir</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">Lire les capacités, tensions et dépendances d’un territoire pour éviter les décisions hors-sol.</p>
          </Link>
          <Link href="/app/coordination" className="surface group p-5 hover:border-[#8dcbd1]">
            <BriefcaseBusiness className="text-[#18a394]" /><h3 className="mt-4 font-bold">Exécuter avec les autres</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">Partager les engagements, dépendances, pièces utiles et décisions dans un même flux de travail.</p>
          </Link>
          <Link href="/app/resultats" className="surface group p-5 hover:border-[#8dcbd1]">
            <FileCheck2 className="text-[#d89614]" /><h3 className="mt-4 font-bold">Prouver la valeur créée</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">Documenter ce qui a été réalisé, avec quelles ressources, pour quels bénéficiaires et avec quel résultat.</p>
          </Link>
        </section>
      </div>
    </>
  );
}
