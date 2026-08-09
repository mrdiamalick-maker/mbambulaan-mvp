import test from "node:test";
import assert from "node:assert/strict";
import { OperationalDocumentRegistry } from "./operational-document-registry";

const checksum = "a".repeat(64);

test("enregistre, verifie et utilise une decision signee", () => {
  const runtime = new OperationalDocumentRegistry();
  runtime.execute({
    commandId: "cmd-doc-1",
    actorId: "actor-admin",
    activeTerritoryId: "territory-national",
    command: {
      type: "register_document",
      document: {
        id: "document-decision-1",
        documentType: "institutional_decision",
        title: "Décision de suspension du contrat froid",
        issuingOrganizationId: "org-ministry-fisheries",
        issuedByActorId: "actor-supervisor",
        territoryIds: ["territory-dakar"],
        relatedEntityType: "contract",
        relatedEntityId: "contract-cold-chain-1",
        storageReference: "documents/decisions/suspension-contract-cold-chain-1.pdf",
        checksumSha256: checksum,
        issuedAt: "2026-07-28T08:00:00.000Z",
        confidentiality: "restricted",
        status: "registered",
        registeredAt: "2026-07-28T08:05:00.000Z",
        registeredByActorId: "actor-admin",
      },
    },
  });

  runtime.execute({
    commandId: "cmd-doc-2",
    actorId: "actor-reviewer",
    activeTerritoryId: "territory-national",
    command: {
      type: "verify_document",
      verification: {
        id: "verification-1",
        documentId: "document-decision-1",
        verifiedByActorId: "actor-reviewer",
        verificationMethod: "issuer_confirmation",
        verificationDocumentIds: ["courrier-confirmation-ministere"],
        conclusion: "valid",
        comment: "La décision a été confirmée par l'autorité émettrice.",
        verifiedAt: "2026-07-28T09:00:00.000Z",
      },
    },
  });

  runtime.execute({
    commandId: "cmd-doc-3",
    actorId: "actor-supervisor",
    activeTerritoryId: "territory-national",
    command: {
      type: "record_decision",
      decision: {
        id: "decision-1",
        decisionType: "suspend",
        subjectType: "contract",
        subjectId: "contract-cold-chain-1",
        decidedByActorIds: ["actor-supervisor"],
        organizationId: "org-ministry-fisheries",
        territoryIds: ["territory-dakar"],
        reason: "Rupture persistante du niveau de disponibilité contractuel.",
        decisionDocumentIds: ["document-decision-1"],
        effectiveAt: "2026-07-29T00:00:00.000Z",
        status: "effective",
        recordedAt: "2026-07-28T09:30:00.000Z",
      },
    },
  });

  const snapshot = runtime.snapshot("2026-07-28T10:00:00.000Z");
  assert.equal(snapshot.metrics.verifiedDocumentCount, 1);
  assert.equal(snapshot.metrics.effectiveDecisionCount, 1);
});

test("refuse une decision appuyee par un document revoque", () => {
  const runtime = new OperationalDocumentRegistry();
  runtime.execute({
    commandId: "cmd-doc-r1",
    actorId: "actor-admin",
    activeTerritoryId: "territory-national",
    command: {
      type: "register_document",
      document: {
        id: "document-revoque",
        documentType: "meeting_minutes",
        title: "Compte rendu invalide",
        issuingOrganizationId: "org-1",
        issuedByActorId: "actor-1",
        territoryIds: ["territory-dakar"],
        relatedEntityType: "other",
        relatedEntityId: "subject-1",
        storageReference: "documents/invalid.pdf",
        checksumSha256: checksum,
        issuedAt: "2026-07-28T08:00:00.000Z",
        confidentiality: "restricted",
        status: "registered",
        registeredAt: "2026-07-28T08:00:00.000Z",
        registeredByActorId: "actor-admin",
      },
    },
  });
  runtime.execute({ commandId: "cmd-doc-r2", actorId: "actor-admin", activeTerritoryId: "territory-national", command: { type: "revoke_document", documentId: "document-revoque", reason: "Document non authentique.", decisionDocumentId: "decision-revocation-1" } });

  assert.throws(() => runtime.execute({
    commandId: "cmd-doc-r3",
    actorId: "actor-admin",
    activeTerritoryId: "territory-national",
    command: {
      type: "record_decision",
      decision: {
        id: "decision-invalid",
        decisionType: "approve",
        subjectType: "other",
        subjectId: "subject-1",
        decidedByActorIds: ["actor-admin"],
        organizationId: "org-1",
        territoryIds: ["territory-dakar"],
        reason: "Décision non valable.",
        decisionDocumentIds: ["document-revoque"],
        effectiveAt: "2026-07-28T10:00:00.000Z",
        status: "effective",
        recordedAt: "2026-07-28T10:00:00.000Z",
      },
    },
  }), /n'est pas utilisable/i);
});
