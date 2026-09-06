"use client";

// TerritoryDossierSections — LOT 5 (mandat "Atlas & Territoire : voir la
// réalité territoriale comme un système"). Rendu partagé du dossier
// territorial : une seule source de données (buildTerritoryIntelligence,
// src/domain/territory-intelligence.ts), deux habillages visuels
// (`tone="atlas"` pour le poste de travail professionnel, `tone="etat"`
// pour l'Espace État) — mandat §26, "une seule réalité, différentes
// expériences". Aucune donnée n'est recalculée ou dupliquée ici : ce
// composant ne fait que mettre en forme ce que la projection renvoie.
//
// Discipline appliquée dans tout ce fichier (mandat §7/§30) : jamais de
// score, jamais de synthèse rouge/vert opaque ; quand une section est
// vide, le dire explicitement plutôt que la masquer en silence — un
// territoire peu documenté doit se lire comme "peu documenté", jamais
// comme "stable".
import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  Footprints,
  GraduationCap,
  HelpCircle,
  Layers,
  Radio,
  Sparkles,
  Target,
  UsersRound
} from "lucide-react";
import type { PartnerService, TrustLevel } from "@/domain/types";
import { attributionLevelLabels, collectiveNeedStatusLabels, fieldMissionStatusLabels, findingStatusLabels, programOpportunityStatusLabels } from "@/domain/types";

// LOT 7 — libellés locaux (PartnerService n'exporte pas encore de
// Record centralisé, même situation que signalCategoryLabel dans
// CoordinationWorkspace.tsx avant LOT 3).
const partnerServiceStatusLabel: Record<PartnerService["status"], string> = {
  reference: "Référencée",
  qualifie: "Qualifiée",
  a_activer: "À activer"
};
import { trustLabels } from "@/lib/status-tokens";
import { currentTerritoryView, hasSufficientKnowledge, type TerritoryIntelligence } from "@/domain/territory-intelligence";

type Tone = "atlas" | "etat";

function formatDate(value?: string) {
  if (!value) return undefined;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

const palette: Record<Tone, {
  sectionTitle: string;
  sectionHint: string;
  cardBorder: string;
  cardBg: string;
  heading: string;
  text: string;
  muted: string;
  faint: string;
  link: string;
  divider: string;
}> = {
  atlas: {
    sectionTitle: "flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#1d4468]",
    sectionHint: "mt-1 text-xs text-muted-foreground",
    cardBorder: "border",
    cardBg: "bg-card",
    heading: "text-sm font-semibold text-foreground",
    text: "text-sm leading-5 text-foreground",
    muted: "text-xs text-muted-foreground",
    faint: "text-xs text-muted-foreground",
    link: "text-[#1d4468] hover:text-[#1d4468]/70",
    divider: "divide-y"
  },
  etat: {
    sectionTitle: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]",
    sectionHint: "mt-1 text-xs text-[var(--etat-stone-600)]",
    cardBorder: "border border-[var(--etat-line)]",
    cardBg: "bg-white",
    heading: "text-sm font-semibold text-[var(--etat-navy-950)]",
    text: "text-sm leading-5 text-[var(--etat-navy-950)]",
    muted: "text-xs text-[var(--etat-stone-600)]",
    faint: "text-xs text-[var(--etat-stone-400)]",
    link: "text-[var(--etat-navy-800)] hover:opacity-70",
    divider: "divide-y divide-[var(--etat-line)]"
  }
};

function TrustPill({ trust, tone }: { trust: TrustLevel; tone: Tone }) {
  const cls = tone === "atlas"
    ? "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
    : "etat-tag etat-tag--stable";
  return <span className={cls}>{trustLabels[trust]}</span>;
}

function Section({ tone, icon: Icon, title, hint, empty, children }: { tone: Tone; icon: typeof Radio; title: string; hint: string; empty?: string; children: React.ReactNode }) {
  const p = palette[tone];
  const isEmptyArray = Array.isArray(children) ? children.length === 0 : !children;
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <p className={p.sectionTitle}><Icon size={13} /> {title}</p>
      <p className={p.sectionHint}>{hint}</p>
      <div className="mt-3 space-y-2.5">
        {isEmptyArray && empty ? <p className={p.faint}>{empty}</p> : children}
      </div>
    </div>
  );
}

export function TerritoryDossierSections({ intelligence, tone }: { intelligence: TerritoryIntelligence; tone: Tone }) {
  const p = palette[tone];
  const sufficient = hasSufficientKnowledge(intelligence);

  // "AUJOURD'HUI À [TERRITOIRE]" (mandat §9) — 3 à 5 éléments dérivés,
  // jamais un widget décoratif de plus : un simple constat de ce qui
  // compte maintenant, formulé à partir des mêmes objets que le reste du
  // dossier, jamais recalculé séparément.
  //
  // Micro-correctif final LOT 5 : "Aujourd'hui" est une surface CURRENT —
  // elle ne doit jamais présenter comme actifs des objets réglés, réalisés,
  // rejetés/remplacés ou convertis. currentTerritoryView() ne filtre rien
  // dans `intelligence` elle-même (le dossier complet plus bas reste
  // historique) — elle ne fait que dériver une lecture "maintenant".
  const current = currentTerritoryView(intelligence);
  const criticalSituations = current.situations.filter((item) => item.priority === "critique");
  const inProgressCount = intelligence.coordinations.length + current.programOpportunities.length + current.fieldMissions.filter((item) => item.status === "en_cours").length;
  const recentOutcome = [...intelligence.outcomes].sort((a, b) => (a.observedAt < b.observedAt ? 1 : -1))[0];
  const today: string[] = [];
  if (criticalSituations.length > 0) today.push(`${criticalSituations.length} situation(s) prioritaire(s) à suivre`);
  else if (current.situations.length > 0) today.push(`${current.situations.length} situation(s) ouverte(s), aucune en priorité critique`);
  if (current.knowledgeGaps.length > 0) today.push(`${current.knowledgeGaps.length} connaissance(s) manquante(s) identifiée(s)`);
  if (inProgressCount > 0) today.push(`${inProgressCount} action(s) en cours`);
  if (recentOutcome) today.push(`1 changement récemment documenté : « ${recentOutcome.title} »`);
  if (today.length === 0) today.push(sufficient ? "Aucun enjeu prioritaire identifié sur les données disponibles" : "Peu d’éléments récents disponibles pour ce territoire");

  // "Ce qui est en cours" (mandat §12) — jamais fusionné sous "Projets" :
  // trois natures distinctes, affichées séparément.
  const developpement = [
    ...intelligence.programOpportunities.map((item) => ({ id: item.id, label: item.problem, status: programOpportunityStatusLabels[item.status] })),
    ...intelligence.initiatives.filter((item) => item.status !== "terminee").map((item) => ({ id: item.id, label: item.title, status: item.status === "execution" ? "En exécution" : item.status === "financee" ? "Financé" : "Cadrage" }))
  ];

  // XXL-R4 (§16, §22) — "Écosystème" : qui/quoi est réellement PRÉSENT sur
  // ce territoire (identity.actors/identity.infrastructures, déjà
  // calculés par buildTerritoryIntelligence mais jusqu'ici jamais
  // affichés dans ce dossier partagé — seulement dans l'en-tête de la
  // page, séparément) — puis, distinct, ce que le Network rend
  // mobilisable AILLEURS ("Qui peut agir ?" d'origine, LOT 7). "Ne pas
  // refaire Réseau" (§22) : un aperçu de quelques éléments, jamais la
  // liste complète, avec un lien vers Réseau. Array explicite (pas des
  // divs conditionnelles) pour que le mécanisme d'état vide de `Section`
  // (isEmptyArray) reste correct, même convention que les autres sections.
  const ecosystemCards: ReactNode[] = [];
  if (intelligence.identity.actors.length > 0 || intelligence.identity.infrastructures.length > 0) {
    const actorsByRole = intelligence.identity.actors.reduce<Record<string, number>>((acc, actor) => { acc[actor.role] = (acc[actor.role] ?? 0) + 1; return acc; }, {});
    ecosystemCards.push(
      <div key="identity" className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
        <p className={`${p.faint} uppercase tracking-wide`}>Sur ce territoire</p>
        {intelligence.identity.actors.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {Object.entries(actorsByRole).map(([role, count]) => (
              <span key={role} className={tone === "atlas" ? "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground" : "etat-tag etat-tag--stable capitalize"}>{role.replaceAll("_", " ")} · {count}</span>
            ))}
          </div>
        )}
        {intelligence.identity.infrastructures.length > 0 && (
          <div className={`mt-2 space-y-1 ${intelligence.identity.actors.length > 0 ? "border-t pt-2" : ""}`}>
            {intelligence.identity.infrastructures.slice(0, 4).map((infra) => (
              <div key={infra.id} className="flex items-center justify-between gap-2">
                <span className={`truncate capitalize ${p.text}`}>{infra.name}</span>
                <span className={`shrink-0 capitalize ${p.faint}`}>{infra.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  if (intelligence.networkCapacities.length > 0) {
    ecosystemCards.push(
      <div key="network" className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
        <p className={`${p.faint} uppercase tracking-wide`}>Capacités du réseau mobilisables ailleurs</p>
        <div className="mt-1.5 space-y-1.5">{intelligence.networkCapacities.slice(0, 3).map((service) => (
          <div key={service.id} className="flex items-center justify-between gap-2">
            <span className={`truncate ${p.text}`}>{service.name}</span>
            <span className={`shrink-0 ${p.faint}`}>{partnerServiceStatusLabel[service.status]}</span>
          </div>
        ))}</div>
        <Link href="/app/organisation" className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${p.link}`}>Voir dans le réseau <ArrowRight size={12} /></Link>
      </div>
    );
  }

  return (
    <div>
      <div className={`rounded-xl ${p.cardBorder} ${p.cardBg} p-4`}>
        <p className={p.sectionTitle}><Sparkles size={13} /> Aujourd’hui à {intelligence.territory.name}</p>
        <ul className="mt-3 space-y-1.5">
          {today.slice(0, 5).map((line) => <li key={line} className={`flex items-start gap-2 ${p.text}`}><span className="mt-1.5 size-1 shrink-0 rounded-full bg-current opacity-60" />{line}</li>)}
        </ul>
        {!sufficient && (
          <p className={`mt-3 flex items-start gap-1.5 ${p.faint}`}><HelpCircle size={13} className="mt-0.5 shrink-0" /> Connaissance insuffisante sur ce territoire — l’absence de signal ne signifie pas que la situation est stable.</p>
        )}
      </div>

      <div className={p.divider}>
        <Section tone={tone} icon={Radio} title="Ce qui se passe" hint="Signaux, constats et situations réellement reliés à ce territoire — regroupés par sujet, pas par type technique." empty="Aucun signal ni situation documenté sur ce territoire pour le moment.">
          {intelligence.situations.slice(0, 4).map((situation) => {
            const lastHistory = situation.history?.[situation.history.length - 1];
            return (
              <div key={situation.id} className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={p.heading}>{situation.title}</p>
                  <TrustPill trust={situation.trust} tone={tone} />
                </div>
                <p className={`mt-1 ${p.muted}`}>{situation.description}</p>
                <p className={`mt-1.5 ${p.faint}`}>Pourquoi c’est important · {situation.nextStep}</p>
                {lastHistory && <p className={`mt-1 ${p.faint}`}>Dernière évolution · {lastHistory.label}{formatDate(lastHistory.at) ? ` (${formatDate(lastHistory.at)})` : ""}</p>}
                <Link href={`/app/situations/${situation.id}`} className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${p.link}`}>Accéder au dossier <ArrowRight size={12} /></Link>
              </div>
            );
          })}
        </Section>

        <Section tone={tone} icon={Layers} title="Ce qui émerge" hint="Besoins collectifs rapprochés à partir de remontées dispersées, avant toute décision d’intervention." empty="Aucun besoin collectif émergent identifié sur ce territoire.">
          {intelligence.collectiveNeeds.slice(0, 4).map((need) => (
            <div key={need.id} className={`flex items-center justify-between gap-3 rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
              <div className="min-w-0"><p className={`truncate ${p.heading}`}>{need.title}</p><p className={`mt-0.5 ${p.faint}`}>{collectiveNeedStatusLabels[need.status]}</p></div>
              <Link href={`/app/initiatives?need=${need.id}`} className={`shrink-0 text-xs font-bold ${p.link}`}>Ouvrir <ArrowRight size={12} className="inline" /></Link>
            </div>
          ))}
        </Section>

        {/* XXL-R4 (§16, §22) — Écosystème, remonté avant "Ce que nous ne
            savons pas" (ordre du mandat : se passe/émerge → savons →
            ne savons pas → écosystème → action — regroupé ici juste
            après "ce qui se passe/émerge" car c'est la même famille de
            lecture "qui/quoi est là"). Fusionne l'ancienne section "Qui
            peut agir ?" (LOT 7) avec identity.actors/infrastructures,
            jusqu'ici jamais montrés dans ce dossier partagé. */}
        <Section tone={tone} icon={UsersRound} title="Écosystème" hint="Acteurs et capacités du territoire, puis ce que le réseau rend mobilisable ailleurs — jamais une recommandation automatique, la décision de mobiliser reste humaine." empty="Écosystème documenté insuffisant sur ce territoire pour le moment — l'absence d'acteur ou de capacité enregistré ne signifie pas qu'aucun n'existe réellement.">
          {ecosystemCards}
        </Section>

        <Section tone={tone} icon={HelpCircle} title="Ce que nous ne savons pas" hint="Connaissances manquantes identifiées explicitement — signature du produit : ce qui manque compte autant que ce qui est su." empty="Aucune connaissance manquante formalisée sur ce territoire pour le moment.">
          {intelligence.knowledgeGaps.slice(0, 4).map((gap) => {
            const mission = intelligence.fieldMissions.find((item) => item.knowledgeGapFindingId === gap.id);
            const newObservations = mission ? intelligence.observations.filter((item) => item.missionId === mission.id).length : 0;
            return (
              <div key={gap.id} className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
                <p className={p.heading}>{gap.title}</p>
                <p className={`mt-1 ${p.muted}`}>Pourquoi cette connaissance manque · {gap.explanation}</p>
                <p className={`mt-1.5 ${p.faint}`}>{mission ? `Mission terrain associée · ${mission.title} (${fieldMissionStatusLabels[mission.status]})` : "Aucune mission terrain associée pour l’instant"}</p>
                {mission && <p className={`mt-1 ${p.faint}`}>{newObservations > 0 ? `${newObservations} nouvelle(s) observation(s) disponible(s)` : "Aucune observation enregistrée pour l’instant"}</p>}
                <p className={`mt-1 ${p.faint}`}>Statut · {findingStatusLabels[gap.status]}</p>
              </div>
            );
          })}
        </Section>

        <Section tone={tone} icon={Footprints} title="Ce que le terrain vérifie" hint="Missions de vérification et observations effectivement remontées, jamais des conclusions préétablies." empty="Aucune mission terrain sur ce territoire pour le moment.">
          {intelligence.fieldMissions.slice(0, 4).map((mission) => {
            const observations = intelligence.observations.filter((item) => item.missionId === mission.id);
            return (
              <div key={mission.id} className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
                <div className="flex flex-wrap items-center justify-between gap-2"><p className={p.heading}>{mission.title}</p><span className={p.faint}>{fieldMissionStatusLabels[mission.status]}</span></div>
                <p className={`mt-1 ${p.muted}`}>{mission.objective}</p>
                <p className={`mt-1.5 ${p.faint}`}>{observations.length > 0 ? `${observations.length} observation(s) remontée(s)` : "Aucune observation remontée pour l’instant"}</p>
                <Link href="/app/terrain" className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${p.link}`}>Voir le terrain <ArrowRight size={12} /></Link>
              </div>
            );
          })}
        </Section>

        <Section tone={tone} icon={Compass} title="Ce qui est en cours" hint="Coordination (réponse à une situation), Développement (opportunité/programme), Terrain (mission de vérification) — jamais fondus en un seul « Projets »." empty="Aucune action en cours documentée sur ce territoire pour le moment.">
          {intelligence.coordinations.length > 0 && (
            <div className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
              <p className={`${p.faint} uppercase tracking-wide`}>Coordination</p>
              <div className="mt-1.5 space-y-1.5">{intelligence.coordinations.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <p className={`truncate ${p.text}`}>{item.title}</p>
                  {item.situationId && <Link href={`/app/situations/${item.situationId}`} className={`shrink-0 text-xs font-bold ${p.link}`}>Ouvrir</Link>}
                </div>
              ))}</div>
            </div>
          )}
          {developpement.length > 0 && (
            <div className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
              <p className={`${p.faint} uppercase tracking-wide`}>Développement</p>
              <div className="mt-1.5 space-y-1.5">{developpement.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <p className={`truncate ${p.text}`}>{item.label}</p>
                  <span className={`shrink-0 ${p.faint}`}>{item.status}</span>
                </div>
              ))}</div>
              <Link href="/app/initiatives" className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${p.link}`}>Voir les programmes <ArrowRight size={12} /></Link>
            </div>
          )}
          {intelligence.fieldMissions.some((item) => item.status === "en_cours" || item.status === "planifiee") && (
            <div className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
              <p className={`${p.faint} uppercase tracking-wide`}>Terrain</p>
              <div className="mt-1.5 space-y-1.5">{intelligence.fieldMissions.filter((item) => item.status === "en_cours" || item.status === "planifiee").slice(0, 3).map((item) => (
                <p key={item.id} className={`truncate ${p.text}`}>{item.title} · {fieldMissionStatusLabels[item.status]}</p>
              ))}</div>
            </div>
          )}
        </Section>

        <Section tone={tone} icon={Target} title="Ce qui a été réalisé" hint="Résultats concrets enregistrés — ce qui a été produit, distinct de ce qui a changé." empty="Aucun résultat enregistré sur ce territoire pour le moment.">
          {intelligence.results.slice(0, 3).map((result) => (
            <div key={result.id} className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
              <p className={p.heading}>{result.title}</p>
              <p className={`mt-1 ${p.muted}`}>{result.description}</p>
            </div>
          ))}
        </Section>

        <Section tone={tone} icon={AlertTriangle} title="Ce qui change" hint="Changements réellement observés — jamais une activité présentée comme un changement." empty="Aucun changement suffisamment documenté à ce stade.">
          {intelligence.outcomes.slice(0, 3).map((outcome) => (
            <div key={outcome.id} className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><p className={p.heading}>{outcome.title}</p><span className={p.faint}>{attributionLevelLabels[outcome.attribution]}</span></div>
              <p className={`mt-1 ${p.muted}`}>{outcome.statement}</p>
              {outcome.attributionJustification && <p className={`mt-1.5 ${p.faint}`}><span className="font-semibold">Justification · </span>{outcome.attributionJustification}</p>}
              {outcome.limits && <p className={`mt-1 ${p.faint}`}><span className="font-semibold">Limites · </span>{outcome.limits}</p>}
              <p className={`mt-1 ${p.faint}`}>Source · {trustLabels[outcome.trust]}</p>
            </div>
          ))}
        </Section>

        <Section tone={tone} icon={GraduationCap} title="Ce que nous apprenons" hint="Apprentissages réutilisables ailleurs — le territoire nourrit la connaissance nationale." empty="Aucun apprentissage documenté sur ce territoire pour le moment.">
          {intelligence.learnings.slice(0, 3).map((learning) => (
            <div key={learning.id} className={`rounded-lg ${p.cardBorder} ${p.cardBg} p-3`}>
              <p className={p.heading}>{learning.title}</p>
              <p className={`mt-1 ${p.muted}`}>{learning.summary}</p>
              {learning.context && <p className={`mt-1 ${p.faint}`}><span className="font-semibold">Contexte · </span>{learning.context}</p>}
              {learning.reusableIn.length > 0 && <p className={`mt-1 ${p.faint}`}><span className="font-semibold">Réutilisable · </span>{learning.reusableIn.join(", ")}</p>}
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}
