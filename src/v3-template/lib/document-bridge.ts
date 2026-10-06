// Pont Documents — générateur documentaire réel, mandat "Intégration
// /etat V5 + Corrections Produit" §11/§12. Quatre types (Note de
// synthèse, Rapport de programme, Note de situation, Note de décision),
// chacun construit à partir des mêmes ponts déjà réels du produit
// (situations-bridge.ts, programme-bridge.ts, landing-bridge.ts) —
// jamais une nouvelle source de données fabriquée pour ce lot.
//
// RÈGLE CRITIQUE (§11, non négociable) : aucune fonction de ce fichier ne
// doit jamais produire une "recommandation" institutionnelle. Ce qu'un
// document affiche comme recommandation est TOUJOURS soit (a) saisie
// explicitement par un humain au moment de la génération (voir `humanNote`
// ci-dessous, jamais pré-rempli), soit (b) une suggestion déjà présente
// dans le domaine et déjà étiquetée comme telle ailleurs dans le produit
// (SituationDetailView.systemSuggestion, PD.4), reprise ici SOUS LA MÊME
// étiquette "proposition à examiner", jamais comme décision.
import { DEMO_STATE } from "./demo-state";
import type { ProductState } from "@/domain/types";
import { decisionTypeLabels } from "@/domain/types";
import { buildSituationHeaderStats, findLatestDecisionForSituation, getSituationDetail, timeLabel, type SituationDetailView } from "./situations-bridge";
import { getProgrammeSynthesis, type ProgrammeSynthesisView } from "./programme-bridge";
import { getNationalLandingTotals } from "./landing-bridge";
import { ARB, type Arbitrage } from "../data/arbitrages";
import { PROGS } from "../data/programmes";

export type DocumentRequest =
  | { type: "synthese" }
  | { type: "programme"; programmeId: number }
  | { type: "situation"; situationId: number }
  | { type: "decision"; arbitrageIndex: number };

export interface DocumentSection {
  heading: string;
  kind: "fact" | "gap" | "note";
  lines: string[];
}

export interface GeneratedDocument {
  typeLabel: string;
  title: string;
  subtitle?: string;
  generatedAtLabel: string;
  sections: DocumentSection[];
  // hasCanonicalDecision (etat-v5 checkpoint E) — vrai uniquement pour un
  // document "decision" dont la section "Décision humaine" reflète déjà
  // une Decision réelle enregistrée (state.decisions), jamais la note
  // libre. DocumentView.tsx s'en sert pour ne pas afficher un champ de
  // saisie qui n'aurait plus aucun effet sur le contenu du document.
  hasCanonicalDecision?: boolean;
}

const TODAY_LABEL = () => new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

function syntheseDocument(state: ProductState): GeneratedDocument {
  const header = buildSituationHeaderStats(state);
  const activity = getNationalLandingTotals(state);
  const openCritical = state.situations
    .filter((s) => s.status !== "reglee" && s.priority === "critique")
    .slice(0, 6);
  return {
    typeLabel: "Note de synthèse",
    title: "Note de synthèse nationale",
    subtitle: "Supervision du littoral — état réel du domaine",
    generatedAtLabel: TODAY_LABEL(),
    sections: [
      {
        heading: "Situation d’ensemble",
        kind: "fact",
        lines: [
          `${header.openCount} situation(s) ouverte(s), dont ${header.criticalCount} critique(s).`,
          `${header.toQualifyCount} situation(s) attendent encore une qualification.`,
          `${header.closedWithProofCount} situation(s) closes avec preuve à ce jour.`,
          `${activity.landingCount} débarquement(s) enregistré(s) au total, pour ${Math.round(activity.totalLandedKg)} kg.`
        ]
      },
      {
        heading: "Situations critiques ouvertes",
        kind: openCritical.length > 0 ? "fact" : "gap",
        lines: openCritical.length > 0
          ? openCritical.map((s) => `${s.title} — ${state.territories.find((t) => t.id === s.territoryId)?.name ?? s.territoryId}.`)
          : ["Aucune situation critique ouverte à ce jour."]
      },
      {
        heading: "Limites de cette note",
        kind: "note",
        lines: ["Cette synthèse reflète l’état du Demo World au moment de sa génération — pas un flux temps réel.", "Aucune recommandation institutionnelle n’est générée automatiquement par Mbàmbulaan."]
      }
    ]
  };
}

function programmeDocument(programmeId: number, state: ProductState): GeneratedDocument {
  const p = PROGS.find((x) => x.id === programmeId) ?? PROGS[0];
  const synthesis: ProgrammeSynthesisView = getProgrammeSynthesis(p.title, state);
  const sections: DocumentSection[] = [
    {
      heading: "Objet du programme",
      kind: "fact",
      lines: [p.why, `Direction : ${p.lead} · Phase déclarée : ${p.phase} · ${p.terrs.length} territoire(s).`]
    }
  ];
  if (synthesis.hasRealMatch) {
    const lines: string[] = [];
    if (synthesis.budgetUnchiffre) {
      lines.push("Budget non chiffré à ce jour (domaine réel).");
    } else if (synthesis.budgetIdentifiedFcfa != null) {
      lines.push(`Budget identifié (réel) : ${Math.round(synthesis.budgetIdentifiedFcfa / 1_000_000)} M FCFA.`);
      lines.push(`Budget confirmé (réel) : ${Math.round((synthesis.budgetConfirmedFcfa ?? 0) / 1_000_000)} M FCFA.`);
    }
    sections.push({ heading: "Financement (domaine réel)", kind: lines.length > 0 ? "fact" : "gap", lines: lines.length > 0 ? lines : ["Aucune donnée de financement réelle rattachée à ce programme."] });
    sections.push({
      heading: "Écart majeur et décision attendue",
      kind: synthesis.gapMajor || synthesis.decisionExpected ? "fact" : "gap",
      lines: [
        synthesis.gapMajor ?? "Aucun écart majeur identifié dans le domaine réel.",
        synthesis.decisionExpected ? `Décision attendue : ${synthesis.decisionExpected}` : "Aucune décision en file d’arbitrage pour ce programme à ce jour.",
        synthesis.decisionMaker ? `Décideur pressenti : ${synthesis.decisionMaker}` : "",
        synthesis.deadline ? `Échéance : ${synthesis.deadline}.` : "Échéance : non documentée dans le domaine réel à ce jour."
      ].filter(Boolean)
    });
  } else {
    sections.push({ heading: "Correspondance au domaine réel", kind: "gap", lines: ["Ce programme n’a pas encore de correspondance vérifiée avec une Initiative du domaine réel — gap documenté, rien n’est inventé pour le combler."] });
  }
  sections.push({
    heading: "Trajectoire déclarée vs signaux de terrain",
    kind: "note",
    lines: [`Avancement déclaré : ${p.progress}%.`, p.reality.length > 0 ? `${p.reality.length} signal(aux) opérationnel(s) ouvert(s) sur ce programme (gabarit).` : "Aucun signal opérationnel ouvert rattaché (gabarit)."]
  });
  return {
    typeLabel: "Rapport de programme",
    title: p.title,
    subtitle: "Rapport de programme",
    generatedAtLabel: TODAY_LABEL(),
    sections
  };
}

function situationDocument(situationId: number, state: ProductState): GeneratedDocument {
  const s: SituationDetailView | undefined = getSituationDetail(situationId, state);
  if (!s) {
    return {
      typeLabel: "Note de situation",
      title: "Situation introuvable",
      generatedAtLabel: TODAY_LABEL(),
      sections: [{ heading: "Erreur", kind: "gap", lines: ["Cette situation n’existe plus dans le domaine réel."] }]
    };
  }
  return {
    typeLabel: "Note de situation",
    title: s.title,
    subtitle: `${s.territoryLabel} · ${s.severityLabel} · ${s.since}`,
    generatedAtLabel: TODAY_LABEL(),
    sections: [
      { heading: "Description", kind: "fact", lines: [s.description] },
      { heading: "Éléments établis", kind: s.known.length > 0 ? "fact" : "gap", lines: s.known.length > 0 ? s.known.map((k) => `${k.label} — ${k.detail}`) : ["Aucun élément établi documenté."] },
      { heading: "Incertitudes / informations manquantes", kind: s.unknown.length > 0 ? "fact" : "gap", lines: s.unknown.length > 0 ? s.unknown.map((u) => `${u.label} — ${u.detail}`) : ["Aucune incertitude documentée à ce stade."] },
      { heading: "Acteurs", kind: s.responsibleLabel ? "fact" : "gap", lines: [s.responsibleLabel ? `Responsable : ${s.responsibleLabel}.` : "Aucun responsable assigné à ce jour."] },
      { heading: "Action en cours / prochaine étape", kind: "fact", lines: [s.nextStep] },
      {
        heading: "Proposition à examiner (assistance algorithmique)",
        kind: s.systemSuggestion ? "note" : "gap",
        lines: s.systemSuggestion
          ? [`Proposition à examiner — jamais une décision : ${s.systemSuggestion}.`, s.systemNote ?? ""].filter(Boolean)
          : ["Aucune proposition disponible à ce stade."]
      },
      { heading: "Sources", kind: s.sources.length > 0 ? "fact" : "gap", lines: s.sources.length > 0 ? s.sources.map((src) => `${src.label} (${src.trustLabel})`) : ["Aucune source rattachée à ce dossier."] }
    ]
  };
}

// decisionDocument (etat-v5 checkpoint E) — la décision canonique déjà
// enregistrée pour la Situation de cet arbitrage (state.decisions, via
// create_decision depuis Arbitrages.tsx) est TOUJOURS source de vérité
// dès qu'elle existe : le texte libre humanNote ne sert plus qu'avant
// toute décision réelle, jamais en concurrence avec elle. Une décision
// canonique enregistrée ne peut pas être réécrite par une note libre
// saisie après coup dans ce générateur.
function decisionDocument(arbitrageIndex: number, humanNote: string, state: ProductState): GeneratedDocument {
  const a: Arbitrage = ARB[arbitrageIndex] ?? ARB[0];
  const canonicalDecision = a.situationId ? findLatestDecisionForSituation(state, a.situationId) : undefined;
  const decider = canonicalDecision ? state.actors.find((actor) => actor.id === canonicalDecision.decidedByActorId) : undefined;

  const decisionSection: DocumentSection = canonicalDecision
    ? {
        heading: "Décision humaine",
        kind: "fact",
        lines: [
          `Décision enregistrée : ${decisionTypeLabels[canonicalDecision.type]}.`,
          canonicalDecision.rationale,
          `${decider ? decider.name : "Décideur non identifié"} — ${timeLabel(canonicalDecision.decidedAt)}.`
        ]
      }
    : {
        heading: "Décision humaine",
        kind: humanNote.trim() ? "fact" : "gap",
        lines: humanNote.trim()
          ? [humanNote.trim()]
          : ["Aucune décision enregistrée à ce jour pour cet arbitrage. Ce document présente les options en vue d’une décision, et n’est pas lui-même une décision prise."]
      };

  return {
    typeLabel: "Note de décision",
    title: a.title,
    subtitle: `Échéance ${a.due} — ${a.urgency}`,
    generatedAtLabel: TODAY_LABEL(),
    hasCanonicalDecision: Boolean(canonicalDecision),
    sections: [
      { heading: "Contexte", kind: "fact", lines: [a.context] },
      { heading: "Faits établis", kind: "fact", lines: a.known },
      { heading: "Inconnues au moment de décider", kind: a.unknown.length > 0 ? "fact" : "gap", lines: a.unknown.length > 0 ? a.unknown : ["Aucune incertitude documentée."] },
      { heading: "Conséquence si rien n’est décidé", kind: "fact", lines: [a.inaction] },
      { heading: "Options (présentées neutrement — aucune n’est une recommandation)", kind: "fact", lines: a.options.map((o) => `${o.t} — ${o.cost}. Résout : ${o.pro} Laisse ouvert : ${o.con}`) },
      { heading: "Décideur", kind: "fact", lines: [a.decider] },
      decisionSection
    ]
  };
}

// buildDocument — point d'entrée unique du générateur. `humanNote` ne sert
// que pour le type "decision" (texte explicitement saisi par l'utilisateur
// dans DocumentView.tsx avant génération, jamais pré-rempli).
export function buildDocument(request: DocumentRequest, humanNote: string, state: ProductState = DEMO_STATE): GeneratedDocument {
  switch (request.type) {
    case "synthese":
      return syntheseDocument(state);
    case "programme":
      return programmeDocument(request.programmeId, state);
    case "situation":
      return situationDocument(request.situationId, state);
    case "decision":
      return decisionDocument(request.arbitrageIndex, humanNote, state);
  }
}
