"use client";

import Link from "next/link";
import { DEMO_SITUATION_ID } from "@/lib/coordination-demo";
import { CoordinationShell, PrimaryLink, SecondaryLink } from "./CoordinationShell";
import { useCoordinationDemo } from "./CoordinationDemoProvider";
import { Progress, StatusPill } from "./CoordinationUI";

const roles = [
  {
    number: "01",
    role: "Acteur terrain",
    value: "Remonter la panne et vérifier que la réponse avance.",
    href: "/terrain",
    action: "Commencer côté terrain"
  },
  {
    number: "02",
    role: "Coordinateur",
    value: "Comprendre la situation, désigner le responsable et organiser l’intervention.",
    href: `/coordinateur/situations/${DEMO_SITUATION_ID}`,
    action: "Organiser la réponse"
  },
  {
    number: "03",
    role: "Responsable opérationnel",
    value: "Démarrer, signaler un blocage et constater la remise en service.",
    href: `/responsable/interventions/${DEMO_SITUATION_ID}`,
    action: "Réaliser l’intervention"
  },
  {
    number: "04",
    role: "Décideur / Ministère",
    value: "Lire les délais, les responsabilités et les résultats réellement constatés.",
    href: "/pilotage",
    action: "Voir les résultats"
  }
];

export function DemoHome() {
  const { getSituation, resetDemo } = useCoordinationDemo();
  const situation = getSituation(DEMO_SITUATION_ID);

  return (
    <CoordinationShell
      eyebrow="Démonstration guidée"
      title="Jouez le parcours de la machine à glace"
      intro="Quatre points de vue sur une même situation. L’état est partagé : chaque action réalisée dans un espace devient immédiatement visible dans les autres."
      action={
        <button
          type="button"
          onClick={resetDemo}
          className="min-h-11 rounded-md border border-[#8ca9a3] bg-white px-4 text-xs font-black text-[#27514b] transition hover:border-[#087c78]"
        >
          Repartir de l’état initial
        </button>
      }
    >
      {situation ? (
        <section className="mb-6 rounded-lg border border-[#2c6d65]/18 bg-[#0d494d] p-5 text-white sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#91d5ca]">{situation.id}</p>
              <h2 className="mt-2 text-xl font-black">{situation.title}</h2>
              <p className="mt-1 text-xs font-semibold text-white/58">{situation.site}</p>
            </div>
            <StatusPill status={situation.status} />
          </div>
          <div className="mt-6">
            <Progress status={situation.status} />
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-white/12 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#91d5ca]">À faire maintenant</p>
              <p className="mt-1 text-sm font-bold">{situation.nextStep}</p>
            </div>
            <Link
              href={getNextHref(situation.status)}
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-white px-4 text-xs font-black text-[#0d494d] transition hover:bg-[#dff2ed]"
            >
              Continuer le parcours
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-4">
        {roles.map((item) => (
          <article key={item.role} className="flex min-h-64 flex-col rounded-lg border border-[#173f3a]/12 bg-white p-5">
            <span className="font-mono text-xs font-black text-[#159086]">{item.number}</span>
            <h2 className="mt-5 text-lg font-black text-[#173d38]">{item.role}</h2>
            <p className="mt-3 flex-1 text-sm font-medium leading-6 text-[#637873]">{item.value}</p>
            <Link href={item.href} className="mt-5 text-sm font-black text-[#087c78] hover:text-[#065d59]">
              {item.action} →
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-[#173f3a]/12 bg-[#e9f3f0] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-black text-[#173d38]">Deux façons de démarrer</h2>
            <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-[#5b716d]">
              Créez votre propre situation depuis le formulaire terrain, ou rejouez le scénario déterministe de Mbao pour parcourir immédiatement les sept statuts.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SecondaryLink href="/terrain/remonter">Créer une situation</SecondaryLink>
            <PrimaryLink href={`/terrain/situations/${DEMO_SITUATION_ID}`}>Suivre la panne de Mbao</PrimaryLink>
          </div>
        </div>
      </section>
    </CoordinationShell>
  );
}

function getNextHref(status: string) {
  if (["Reçu", "En cours d’examen", "Pris en charge"].includes(status)) return `/coordinateur/situations/${DEMO_SITUATION_ID}`;
  if (["Intervention prévue", "Intervention en cours", "En attente"].includes(status)) return `/responsable/interventions/${DEMO_SITUATION_ID}`;
  return "/pilotage";
}
