import { describe, expect, it } from "../../test/vitest-compat";
import { EndToEndQualityComplianceCertificationTraceabilityCapability } from "./end-to-end-quality-compliance-certification-traceability-capability";

const t = (value: string) => value as `${string}T${string}Z`;

describe("EndToEndQualityComplianceCertificationTraceabilityCapability", () => {
  it("gère la chaîne complète de preuve, contrôle, remédiation et certification", () => {
    const capability = new EndToEndQualityComplianceCertificationTraceabilityCapability();
    capability.openCase({ id: "quality:1", caseCode: "QUAL-2026-001", countryId: "sn", territoryIds: ["joal", "dakar"], createdAt: t("2026-07-01T08:00:00Z") });

    capability.registerRequirement({
      caseId: "quality:1",
      registeredAt: t("2026-07-01T08:10:00Z"),
      requirement: {
        id: "req:temperature",
        code: "TEMP-COLD",
        label: "Température maximale chaîne du froid",
        category: "temperature",
        appliesToNodeTypes: ["storage", "transport", "delivery"],
        targetValue: 4,
        warningThreshold: 6,
        criticalThreshold: 10,
        unit: "°C",
        mandatory: true,
        evidenceRequired: true,
        status: "active",
      },
    });

    const nodes = [
      { id: "node:campaign", nodeType: "campaign" as const, referenceId: "campaign:1", territoryId: "joal", occurredAt: t("2026-07-02T04:00:00Z"), quantityKg: 1000, parentNodeIds: [], evidenceIds: ["ev:campaign"] },
      { id: "node:landing", nodeType: "landing" as const, referenceId: "landing:1", territoryId: "joal", occurredAt: t("2026-07-02T10:00:00Z"), quantityKg: 980, parentNodeIds: ["node:campaign"], evidenceIds: ["ev:landing"] },
      { id: "node:lot", nodeType: "lot" as const, referenceId: "lot:1", territoryId: "joal", occurredAt: t("2026-07-02T10:15:00Z"), quantityKg: 950, parentNodeIds: ["node:landing"], evidenceIds: ["ev:lot"] },
      { id: "node:storage", nodeType: "storage" as const, referenceId: "storage:1", territoryId: "joal", occurredAt: t("2026-07-02T10:30:00Z"), quantityKg: 950, parentNodeIds: ["node:lot"], evidenceIds: ["ev:storage"] },
      { id: "node:transport", nodeType: "transport" as const, referenceId: "transport:1", territoryId: "dakar", occurredAt: t("2026-07-02T12:00:00Z"), quantityKg: 940, parentNodeIds: ["node:storage"], evidenceIds: ["ev:transport"] },
      { id: "node:delivery", nodeType: "delivery" as const, referenceId: "delivery:1", territoryId: "dakar", occurredAt: t("2026-07-02T15:00:00Z"), quantityKg: 930, parentNodeIds: ["node:transport"], evidenceIds: ["ev:delivery"] },
    ];
    for (const node of nodes) capability.addTraceabilityNode({ caseId: "quality:1", node });

    const compliantStorage = capability.recordControl({ caseId: "quality:1", control: { id: "control:storage", nodeId: "node:storage", requirementId: "req:temperature", controlledByActorId: "inspector:1", controlledAt: t("2026-07-02T10:40:00Z"), measuredValue: 4.5, remarks: [], evidenceIds: ["ev:temperature:storage"], sourceDeviceIds: ["sensor:1"] } });
    const criticalTransport = capability.recordControl({ caseId: "quality:1", control: { id: "control:transport", nodeId: "node:transport", requirementId: "req:temperature", controlledByActorId: "inspector:1", controlledAt: t("2026-07-02T13:00:00Z"), measuredValue: 11, remarks: ["Rupture de froid"], evidenceIds: ["ev:temperature:transport"], sourceDeviceIds: ["sensor:2"] } });
    capability.recordControl({ caseId: "quality:1", control: { id: "control:delivery", nodeId: "node:delivery", requirementId: "req:temperature", controlledByActorId: "inspector:2", controlledAt: t("2026-07-02T15:05:00Z"), measuredValue: 5, remarks: [], evidenceIds: ["ev:temperature:delivery"], sourceDeviceIds: ["sensor:3"] } });
    expect(compliantStorage.result).toBe("compliant");
    expect(criticalTransport.result).toBe("critical");

    capability.openNonCompliance({ caseId: "quality:1", nonCompliance: { id: "nc:1", nodeId: "node:transport", requirementId: "req:temperature", controlId: "control:transport", severity: "critical", liableActorIds: ["carrier:1"], affectedLotIds: ["lot:1"], affectedQuantityKg: 940, commercialValueAtRiskXof: 1_880_000, status: "open", containmentActions: ["Quarantaine immédiate"], correctiveActionIds: [], evidenceIds: ["ev:nc:1"], openedAt: t("2026-07-02T13:10:00Z") } });

    expect(() => capability.decideMarketAuthorization({ caseId: "quality:1", authorization: { id: "auth:blocked", nodeId: "node:lot", lotId: "lot:1", marketType: "national", decision: "authorized", decidedByActorId: "authority:1", conditions: [], validFrom: t("2026-07-02T14:00:00Z"), controlIds: ["control:transport"], evidenceIds: ["ev:auth"] } })).toThrow(/non-conformité critique/i);

    capability.registerCorrectiveAction({ caseId: "quality:1", registeredAt: t("2026-07-02T13:20:00Z"), action: { id: "action:1", nonComplianceId: "nc:1", actionType: "reconditioning", ownerActorId: "operator:1", dueAt: t("2026-07-02T17:00:00Z"), status: "planned", protectedQuantityKg: 900, protectedValueXof: 1_800_000, evidenceIds: [] } });
    capability.completeCorrectiveAction({ caseId: "quality:1", actionId: "action:1", completedAt: t("2026-07-02T16:00:00Z"), evidenceIds: ["ev:corrective:1"] });

    const reinspection = capability.recordControl({ caseId: "quality:1", control: { id: "control:reinspection", nodeId: "node:transport", requirementId: "req:temperature", controlledByActorId: "inspector:2", controlledAt: t("2026-07-02T16:10:00Z"), measuredValue: 4, remarks: ["Conformité restaurée"], evidenceIds: ["ev:reinspection"], sourceDeviceIds: ["sensor:4"] } });
    expect(reinspection.result).toBe("compliant");

    capability.decideMarketAuthorization({ caseId: "quality:1", authorization: { id: "auth:1", nodeId: "node:lot", lotId: "lot:1", marketType: "processing_only", decision: "authorized_with_conditions", decidedByActorId: "authority:1", conditions: ["Transformation sous 4 heures"], validFrom: t("2026-07-02T16:20:00Z"), validUntil: t("2026-07-02T20:20:00Z"), controlIds: ["control:reinspection"], evidenceIds: ["ev:auth:1"] } });

    const certificate = capability.issueCertificate({ caseId: "quality:1", certificate: { id: "cert:1", certificateType: "traceability", subjectType: "lot", subjectId: "lot:1", issuedByActorId: "authority:1", issuedAt: t("2026-07-02T16:30:00Z"), validUntil: t("2026-07-03T16:30:00Z"), status: "active", requirementIds: ["req:temperature"], controlIds: ["control:storage", "control:reinspection", "control:delivery"], evidenceIds: ["ev:certificate:1"] } });
    expect(certificate.status).toBe("active");

    const commandCenter = capability.getQualityCommandCenter({ caseId: "quality:1", generatedAt: t("2026-07-02T17:00:00Z") });
    expect(commandCenter.traceabilityAudit.complete).toBe(true);
    expect(commandCenter.activeCertificateCount).toBe(1);
    expect(commandCenter.protectedQuantityKg).toBe(900);
    expect(commandCenter.protectedValueXof).toBe(1_800_000);
  });

  it("refuse les ruptures de quantité et la certification sur contrôle en échec", () => {
    const capability = new EndToEndQualityComplianceCertificationTraceabilityCapability();
    capability.openCase({ id: "quality:2", caseCode: "QUAL-2", countryId: "sn", territoryIds: ["joal"], createdAt: t("2026-07-01T08:00:00Z") });
    capability.registerRequirement({ caseId: "quality:2", registeredAt: t("2026-07-01T08:05:00Z"), requirement: { id: "req:temp", code: "TEMP", label: "Température", category: "temperature", appliesToNodeTypes: ["lot"], targetValue: 4, warningThreshold: 6, criticalThreshold: 10, unit: "°C", mandatory: true, evidenceRequired: true, status: "active" } });
    capability.addTraceabilityNode({ caseId: "quality:2", node: { id: "node:parent", nodeType: "campaign", referenceId: "campaign:2", territoryId: "joal", occurredAt: t("2026-07-01T09:00:00Z"), quantityKg: 100, parentNodeIds: [], evidenceIds: ["ev:parent"] } });
    capability.addTraceabilityNode({ caseId: "quality:2", node: { id: "node:lot2", nodeType: "lot", referenceId: "lot:2", territoryId: "joal", occurredAt: t("2026-07-01T10:00:00Z"), quantityKg: 120, parentNodeIds: ["node:parent"], evidenceIds: ["ev:lot"] } });
    capability.recordControl({ caseId: "quality:2", control: { id: "control:bad", nodeId: "node:lot2", requirementId: "req:temp", controlledByActorId: "inspector:1", controlledAt: t("2026-07-01T10:10:00Z"), measuredValue: 12, remarks: [], evidenceIds: ["ev:bad"], sourceDeviceIds: [] } });

    const audit = capability.auditTraceability({ caseId: "quality:2", generatedAt: t("2026-07-01T11:00:00Z") });
    expect(audit.complete).toBe(false);
    expect(audit.brokenQuantityNodeIds).toContain("node:lot2");
    expect(() => capability.issueCertificate({ caseId: "quality:2", certificate: { id: "cert:bad", certificateType: "quality", subjectType: "lot", subjectId: "lot:2", issuedByActorId: "authority:1", issuedAt: t("2026-07-01T11:10:00Z"), status: "active", requirementIds: ["req:temp"], controlIds: ["control:bad"], evidenceIds: ["ev:cert"] } })).toThrow(/contrôle en échec/i);
  });
});
