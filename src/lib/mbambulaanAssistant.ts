import type { DossierOperationnel } from "./ministryOperationalDossiers";

export type AssistedDossierSummary = {
  summary: string;
  facts: string[];
  missingPieces: string[];
  suggestedNextAction: string;
  sources: string[];
};

export type ArbitrationNoteDraft = {
  subject: string;
  establishedFacts: string[];
  uncertainties: string[];
  options: string[];
  recommendation: string;
  sources: string[];
};

export function summarizeDossier(dossier: DossierOperationnel): AssistedDossierSummary {
  const available = dossier.pieces.filter((piece) => piece.status === "Disponible");
  const missing = dossier.pieces.filter((piece) => piece.status === "Attendue");
  return {
    summary: `${dossier.linkedObject} est ${dossier.businessStatus.toLowerCase()}. Le traitement relève de ${dossier.currentOwner}.`,
    facts: [
      `Dossier ${dossier.id} ouvert depuis le canal ${dossier.originChannel}.`,
      `${available.length} pièce(s) disponible(s) et ${dossier.history.length} événement(s) tracé(s).`,
      `Sortie attendue : ${dossier.finalOutput}`,
    ],
    missingPieces: missing.map((piece) => piece.label),
    suggestedNextAction: dossier.nextAction,
    sources: [...available.map((piece) => `${piece.type} · ${piece.label}`), ...dossier.history.slice(-2).map((entry) => `${entry.channel} · ${entry.label}`)],
  };
}

export function draftArbitrationNote(dossier: DossierOperationnel): ArbitrationNoteDraft {
  const summary = summarizeDossier(dossier);
  return {
    subject: `Arbitrage proposé · ${dossier.linkedObject}`,
    establishedFacts: summary.facts,
    uncertainties: summary.missingPieces.length ? summary.missingPieces.map((piece) => `Pièce attendue : ${piece}`) : ["Aucune incertitude documentaire majeure dans les données simulées."],
    options: ["Poursuivre l’instruction avec le responsable actuel.", "Demander un complément terrain avant arbitrage.", "Clôturer si la condition de sortie est satisfaite."],
    recommendation: dossier.workStatus === "Bloqué" ? `Lever le blocage avant décision : ${dossier.nextAction}.` : `Valider humainement la prochaine étape : ${dossier.nextAction}.`,
    sources: summary.sources,
  };
}
