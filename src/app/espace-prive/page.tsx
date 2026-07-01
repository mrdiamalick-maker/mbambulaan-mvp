"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { roleProfiles, workspaces, type RoleSlug } from "@/components/experience/RoleWorkspaceV2";

const premiumSlugs: RoleSlug[] = ["etat", "ong", "collectivite", "mareyeur", "exportateur", "organisation", "investisseur"];
const levelClasses: Record<string, string> = {
  critical: "bg-[#c64d4d]",
  high: "bg-[#e87c45]",
  watch: "bg-[#e6b84f]",
  stable: "bg-[#2f9e73]"
};

const territories = [
  ["Joal", "critical", "12 signaux", "Commune / GIE", "Prioriser le froid"],
  ["Mbour", "high", "8 signaux", "Mareyeurs", "Organiser les flux"],
  ["Kayar", "watch", "5 signaux", "Relais quai", "Surveiller les prix"],
  ["Saint-Louis", "watch", "4 signaux", "Service pêche", "Suivre sécurité"],
  ["Dakar", "stable", "6 signaux", "Entreprises", "Qualifier demandes"]
];

const reports = [
  ["Note ministère", "prêt", "Système", "Arbitrage Joal"],
  ["Reporting bailleur", "en cours", "Estimé", "Programme Petite-Côte"],
  ["Dossier financement", "prêt", "Validé", "Chaîne du froid"],
  ["Synthèse entreprise", "à vérifier", "Système", "Opportunités qualifiées"],
  ["Note collectivité", "prêt", "Validé", "Action communale"],
  ["Dossier organisation professionnelle", "en cours", "Déclaratif", "Demandes membres"]
];

function statusClass(status: string) {
  if (status.includes("prêt") || status.includes("actif")) return "bg-[#e4f6ee] text-[#17624a]";
  if (status.includes("cours") || status.includes("lancer")) return "bg-[#fff1d4] text-[#6a4a00]";
  return "bg-[#eef2f3] text-[#405158]";
}

export default function Page() {
  const [activeRole, setActiveRole] = useState<RoleSlug>("etat");
  const workspace = workspaces[activeRole];
  const profile = roleProfiles.find((item) => item.slug === activeRole) ?? roleProfiles[0];
  const actions = useMemo(() => workspace.actions.concat(workspaces.etat.actions).slice(0, 6), [workspace.actions]);
  const modules = [
    ["Vue territoire", workspace.context, "Tensions, quais, zones et signaux.", "Ouvrir la carte"],
    ["Registre acteurs", `${workspace.actors.length} acteurs`, "Rôles, responsabilités et interlocuteurs.", "Voir registre"],
    ["Signaux qualifiés", workspace.kpis[1]?.[1] ?? "12", "Sources, statuts et niveaux de preuve.", "Qualifier"],
    ["Programmes", activeRole === "ong" ? "4 actifs" : "5 actifs", "Actions partenaires et doublons possibles.", "Suivre"],
    ["Financements", activeRole === "investisseur" ? "3 flux" : "8 demandes", "Demandes, priorités et dossiers.", "Cadrer"],
    ["Produits / flux", activeRole === "mareyeur" ? "3 lots" : "9 lots suivis", "Lots, qualité, logistique et risques.", "Analyser"],
    ["Coordination", `${workspace.actions.length} actions`, "Files de décision et responsables.", "Piloter"],
    ["Rapports", "6 modèles", "Notes, synthèses et reporting.", "Préparer"],
    ["Preuves", workspace.proof, "Ce qui est confirmé, estimé ou à vérifier.", "Consolider"],
    ["Paramètres d’accès", "Simulation", "Rôles, territoire et modules activés.", "Configurer"]
  ];

  return (
    <main className="min-h-screen bg-[#f6f3ea] text-[#112f36]">
      <header className="sticky top-0 z-20 border-b border-[#d9e4e6] bg-[#f6f3ea]/92 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 font-black text-[#102f3a]">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#102f3a] text-sm text-white">Mb</span>
            <span>Mbàmbulaan</span>
          </Link>
          <div className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#50636a] sm:grid-cols-4 lg:min-w-[38rem]">
            <span className="rounded-full bg-white px-3 py-2">Organisation simulée</span>
            <span className="rounded-full bg-white px-3 py-2">{workspace.role}</span>
            <span className="rounded-full bg-white px-3 py-2">{workspace.context}</span>
            <span className="rounded-full bg-[#102f3a] px-3 py-2 text-white">Simulation premium</span>
          </div>
          <Link href="/devis" className="rounded-full bg-[#0d6f8d] px-5 py-3 text-center text-sm font-black text-white">Cadrer l’offre</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0d6f8d]">Espace premium simulé</p>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.055em] text-[#102f3a]">Bienvenue dans votre espace Mbàmbulaan</h1>
          <p className="mt-5 text-lg font-bold leading-8 text-[#52656f]">
            Vue consolidée des territoires, acteurs, signaux, programmes, financements, produits, actions et preuves.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Signaux actifs", workspace.signals.length + 9, "qualification continue"],
            ["Actions ouvertes", actions.length, "file de coordination"],
            ["Acteurs coordonnés", workspace.actors.length, "rôles identifiés"],
            ["Financements suivis", activeRole === "investisseur" ? 12 : 8, "dossiers actifs"],
            ["Programmes actifs", activeRole === "ong" ? 4 : 5, "partenaires"],
            ["Rapports prêts", 3, "notes disponibles"],
            ["Preuve moyenne", "76%", workspace.proof],
            ["Territoires couverts", 5, "littoral pilote"]
          ].map(([label, value, detail]) => (
            <article key={label} className="rounded-[1.4rem] border border-[#d9e4e6] bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0d6f8d]">{label}</p>
              <p className="mt-2 text-3xl font-black text-[#102f3a]">{value}</p>
              <p className="mt-1 text-xs font-bold text-[#65767c]">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 sm:px-8 lg:grid-cols-[17rem_1fr]">
        <aside className="rounded-[2rem] border border-[#d9e4e6] bg-white p-4 shadow-xl">
          <p className="px-2 text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Rôle actif</p>
          <div className="mt-4 grid gap-2">
            {premiumSlugs.map((slug) => {
              const item = roleProfiles.find((role) => role.slug === slug);
              const isActive = activeRole === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setActiveRole(slug)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition ${isActive ? "bg-[#102f3a] text-white" : "bg-[#f3f7f7] text-[#102f3a] hover:bg-[#e6efef]"}`}
                >
                  {item?.shortLabel ?? slug}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="grid gap-5">
          <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
            <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Modules activés</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#102f3a]">{profile.label}</h2>
                </div>
                <span className="rounded-full bg-[#e3f3f8] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#0d5970]">{workspace.proof}</span>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {modules.map(([title, data, description, action]) => (
                  <div key={title} className="rounded-2xl border border-[#e0e9ea] bg-[#f9fbf8] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-[#102f3a]">{title}</strong>
                      <span className="rounded-full bg-[#e4f6ee] px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[#17624a]">actif</span>
                    </div>
                    <p className="mt-2 text-xl font-black text-[#0d6f8d]">{data}</p>
                    <p className="mt-1 text-sm font-bold leading-6 text-[#65767c]">{description}</p>
                    <button className="mt-3 rounded-full bg-white px-3 py-2 text-xs font-black text-[#102f3a]" type="button">{action}</button>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] bg-[#102f3a] p-5 text-white shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Carte opérationnelle</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Territoires couverts</h2>
              <div className="relative mt-5 min-h-[20rem] rounded-[1.5rem] bg-white/10">
                {territories.map(([name, level], index) => (
                  <div key={name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${24 + index * 15}%`, top: `${70 - (index % 3) * 18}%` }}>
                    <span className={`mx-auto block h-5 w-5 rounded-full border-2 border-white ${levelClasses[level]}`} />
                    <span className="mt-2 block rounded-full bg-white px-3 py-1 text-xs font-black text-[#102f3a]">{name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                {territories.map(([name, level, signals, actor, action]) => (
                  <div key={name} className="grid gap-2 rounded-2xl bg-white/10 p-3 text-sm md:grid-cols-[0.7fr_0.7fr_1fr_1fr]">
                    <strong>{name}</strong><span>{signals}</span><span>{actor}</span><span>{action}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
            <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Vue coordination</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#102f3a]">Actions quotidiennes</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[42rem] text-left text-sm">
                  <tbody>
                    {actions.map(([action, owner, impact, status]) => (
                      <tr key={`${action}-${owner}`} className="border-t border-[#edf2f3]">
                        <td className="py-4 pr-4 font-black text-[#102f3a]">{action}</td>
                        <td className="py-4 pr-4 font-bold text-[#52656f]">{owner}</td>
                        <td className="py-4 pr-4 font-bold text-[#52656f]">{workspace.context}</td>
                        <td className="py-4 pr-4"><span className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.1em] ${statusClass(status)}`}>{status}</span></td>
                        <td className="py-4 font-bold text-[#0d6f8d]">{impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Rapports</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#102f3a]">Notes prêtes ou en cours</h2>
              <div className="mt-5 grid gap-3">
                {reports.map(([title, status, proof, subject]) => (
                  <div key={title} className="rounded-2xl bg-[#f3f7f7] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-[#102f3a]">{title}</strong>
                      <span className={`rounded-full px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.1em] ${statusClass(status)}`}>{status}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-[#52656f]">{subject} · preuve {proof}</p>
                    <button className="mt-3 rounded-full bg-white px-3 py-2 text-xs font-black text-[#102f3a]" type="button">Voir aperçu</button>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
