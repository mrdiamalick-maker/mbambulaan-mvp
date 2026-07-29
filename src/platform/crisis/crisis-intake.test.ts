import { describe, expect, it } from "@/test/vitest-compat";
import { createCrisisCommandFromTrigger } from "./crisis-intake";

describe("createCrisisCommandFromTrigger", () => {
  it("transforme un avis institutionnel en situation de crise traçable", () => {
    const result = createCrisisCommandFromTrigger({
      triggerId: "notice-1",
      sourceType: "institutional_notice",
      sourceReferenceId: "notice-ministry-1",
      territoryIds: ["territory-dakar", "territory-thies"],
      title: "Protection obligatoire des cargaisons réfrigérées",
      description: "Le programme public impose une couverture contractuelle pour les transports financés.",
      severity: "high",
      category: "transport",
      reportedByActorId: "government-1",
      supportingDocumentIds: ["official-notice-1"],
      occurredAt: "2026-07-28T12:00:00.000Z",
      institutionalConstraint: {
        kind: "mandatory_insurance",
        institutionName: "Programme public de modernisation",
        requirementReference: "ARTICLE-12",
        contractOrDecisionDocumentIds: ["program-contract-1"],
      },
    });

    expect(result.command.type).toBe("report_crisis");
    expect(result.institutionalContext?.kind).toBe("mandatory_insurance");
    if (result.command.type === "report_crisis") {
      expect(result.command.crisis.situationDocumentIds).toContain("program-contract-1");
    }
  });

  it("refuse une contrainte institutionnelle sans document", () => {
    expect(() => createCrisisCommandFromTrigger({
      triggerId: "notice-2",
      sourceType: "institutional_notice",
      sourceReferenceId: "notice-2",
      territoryIds: ["territory-dakar"],
      title: "Exigence partenaire",
      description: "Exigence à vérifier.",
      severity: "moderate",
      category: "market",
      reportedByActorId: "partner-1",
      supportingDocumentIds: ["meeting-note-1"],
      occurredAt: "2026-07-28T12:00:00.000Z",
      institutionalConstraint: {
        kind: "partner_requirement",
        institutionName: "Partenaire",
        requirementReference: "CLAUSE-4",
        contractOrDecisionDocumentIds: [],
      },
    })).toThrow("document imposant");
  });
});
