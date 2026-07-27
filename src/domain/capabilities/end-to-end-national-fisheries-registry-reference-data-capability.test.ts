import { describe, expect, it } from "vitest";
import { EndToEndNationalFisheriesRegistryReferenceDataCapability, type RegistryRecord } from "./end-to-end-national-fisheries-registry-reference-data-capability";

const createRecord = (overrides: Partial<RegistryRecord> & Pick<RegistryRecord, "id" | "entityType" | "canonicalName">): RegistryRecord => ({
  id: overrides.id,
  entityType: overrides.entityType,
  canonicalName: overrides.canonicalName,
  aliases: overrides.aliases ?? [],
  countryId: overrides.countryId ?? "country:sn",
  territoryIds: overrides.territoryIds ?? ["territory:joal"],
  identityKeys: overrides.identityKeys ?? [],
  attributes: overrides.attributes ?? [],
  status: overrides.status ?? "active",
  verificationLevel: overrides.verificationLevel ?? "authority_verified",
  owningAuthorityActorId: overrides.owningAuthorityActorId ?? "actor:ministry",
  sourceSystemIds: overrides.sourceSystemIds ?? ["system:registry"],
  evidenceIds: overrides.evidenceIds ?? ["evidence:record"],
  duplicateOfRecordId: overrides.duplicateOfRecordId,
  createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-01-01T00:00:00.000Z",
});

describe("EndToEndNationalFisheriesRegistryReferenceDataCapability", () => {
  it("gère un référentiel national canonique et ses changements gouvernés", () => {
    const capability = new EndToEndNationalFisheriesRegistryReferenceDataCapability();
    capability.openRegistry({
      id: "registry:sn",
      registryCode: "SN-FISHERIES",
      countryId: "country:sn",
      createdAt: "2026-01-01T00:00:00.000Z",
      requiredAttributesByType: {
        vessel: ["home_port", "length_m"],
        license: ["license_scope"],
      },
    });

    capability.registerRecord({
      caseId: "registry:sn",
      actorId: "actor:ministry",
      record: createRecord({
        id: "territory:joal",
        entityType: "territory",
        canonicalName: "Joal-Fadiouth",
        territoryIds: ["territory:joal"],
        identityKeys: [{ keyType: "internal_reference", value: "SN-TH-JOAL" }],
      }),
    });

    capability.registerRecord({
      caseId: "registry:sn",
      actorId: "actor:ministry",
      record: createRecord({
        id: "vessel:ndiambour",
        entityType: "vessel",
        canonicalName: "Ndiambour 1",
        identityKeys: [{ keyType: "local_registry_number", value: "DK-2026-001" }],
        attributes: [
          { code: "home_port", label: "Port d'attache", value: "Joal", verified: true, updatedAt: "2026-01-01T00:00:00.000Z" },
          { code: "length_m", label: "Longueur", value: 14, unit: "m", verified: true, updatedAt: "2026-01-01T00:00:00.000Z" },
        ],
      }),
    });

    capability.registerRecord({
      caseId: "registry:sn",
      actorId: "actor:ministry",
      record: createRecord({
        id: "license:ndiambour:2026",
        entityType: "license",
        canonicalName: "Licence Ndiambour 2026",
        identityKeys: [{ keyType: "license_number", value: "LIC-2026-001", validFrom: "2026-01-01T00:00:00.000Z", validUntil: "2026-12-31T23:59:59.000Z" }],
        attributes: [{ code: "license_scope", label: "Périmètre", value: "Pêche artisanale", verified: true, updatedAt: "2026-01-01T00:00:00.000Z" }],
      }),
    });

    capability.addRelationship({
      caseId: "registry:sn",
      addedAt: "2026-01-02T00:00:00.000Z",
      relationship: {
        id: "relationship:vessel-license",
        relationshipType: "licensed_for",
        sourceRecordId: "vessel:ndiambour",
        targetRecordId: "license:ndiambour:2026",
        validFrom: "2026-01-01T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z",
        status: "active",
        evidenceIds: ["evidence:license-link"],
      },
    });

    capability.requestChange({
      caseId: "registry:sn",
      request: {
        id: "change:vessel:update",
        recordId: "vessel:ndiambour",
        requestedByActorId: "actor:harbor-master",
        changeType: "update",
        proposedAttributes: [{ code: "length_m", label: "Longueur", value: 14.5, unit: "m", verified: true, updatedAt: "2026-02-01T00:00:00.000Z" }],
        proposedIdentityKeys: [],
        rationale: "Mesure terrain mise à jour",
        evidenceIds: ["evidence:measurement"],
        status: "pending",
        requestedAt: "2026-02-01T00:00:00.000Z",
      },
    });

    capability.decideChange({
      caseId: "registry:sn",
      requestId: "change:vessel:update",
      approved: true,
      decidedByActorId: "actor:ministry",
      decidedAt: "2026-02-02T00:00:00.000Z",
    });

    const quality = capability.detectDataQuality({
      caseId: "registry:sn",
      generatedAt: "2026-06-01T00:00:00.000Z",
      staleAfterDays: 365,
    });

    expect(quality.complete).toBe(true);
    expect(quality.activeRecordCount).toBe(3);

    const commandCenter = capability.getNationalRegistryCommandCenter({
      caseId: "registry:sn",
      generatedAt: "2026-06-01T00:00:00.000Z",
      staleAfterDays: 365,
    });

    expect(commandCenter.byType.find((entry) => entry.entityType === "vessel")?.active).toBe(1);
    expect(commandCenter.versionCount).toBe(4);
    expect(commandCenter.activeRelationshipCount).toBe(1);
  });

  it("refuse une identité de registre déjà utilisée", () => {
    const capability = new EndToEndNationalFisheriesRegistryReferenceDataCapability();
    capability.openRegistry({ id: "registry:duplicates", registryCode: "SN-DUP", countryId: "country:sn", createdAt: "2026-01-01T00:00:00.000Z" });

    capability.registerRecord({
      caseId: "registry:duplicates",
      actorId: "actor:ministry",
      record: createRecord({
        id: "vessel:one",
        entityType: "vessel",
        canonicalName: "Pirogue 1",
        identityKeys: [{ keyType: "local_registry_number", value: "REG-001" }],
      }),
    });

    expect(() => capability.registerRecord({
      caseId: "registry:duplicates",
      actorId: "actor:ministry",
      record: createRecord({
        id: "vessel:two",
        entityType: "vessel",
        canonicalName: "Pirogue 2",
        identityKeys: [{ keyType: "local_registry_number", value: "REG-001" }],
      }),
    })).toThrow(/déjà utilisée/);
  });

  it("détecte les licences expirées, attributs manquants et données obsolètes", () => {
    const capability = new EndToEndNationalFisheriesRegistryReferenceDataCapability();
    capability.openRegistry({
      id: "registry:quality",
      registryCode: "SN-QUALITY",
      countryId: "country:sn",
      createdAt: "2025-01-01T00:00:00.000Z",
      requiredAttributesByType: { vessel: ["home_port", "length_m"], license: ["license_scope"] },
    });

    capability.registerRecord({
      caseId: "registry:quality",
      actorId: "actor:ministry",
      record: createRecord({
        id: "vessel:incomplete",
        entityType: "vessel",
        canonicalName: "Pirogue incomplète",
        identityKeys: [{ keyType: "local_registry_number", value: "INC-001" }],
        attributes: [{ code: "home_port", label: "Port", value: "Mbour", verified: false, updatedAt: "2025-01-01T00:00:00.000Z" }],
        updatedAt: "2025-01-01T00:00:00.000Z",
      }),
    });

    capability.registerRecord({
      caseId: "registry:quality",
      actorId: "actor:ministry",
      record: createRecord({
        id: "license:expired",
        entityType: "license",
        canonicalName: "Licence expirée",
        identityKeys: [{ keyType: "license_number", value: "EXP-001", validUntil: "2025-12-31T23:59:59.000Z" }],
        attributes: [{ code: "license_scope", label: "Périmètre", value: "Pêche", verified: true, updatedAt: "2025-01-01T00:00:00.000Z" }],
        updatedAt: "2025-01-01T00:00:00.000Z",
      }),
    });

    const report = capability.detectDataQuality({
      caseId: "registry:quality",
      generatedAt: "2026-07-01T00:00:00.000Z",
      staleAfterDays: 180,
    });

    expect(report.complete).toBe(false);
    expect(report.expiredAuthorizationRecordIds).toContain("license:expired");
    expect(report.missingRequiredAttributeRecordIds).toContain("vessel:incomplete");
    expect(report.staleRecordIds).toEqual(expect.arrayContaining(["vessel:incomplete", "license:expired"]));
    expect(report.blockers.length).toBeGreaterThan(0);
  });

  it("fusionne un doublon vers un enregistrement canonique", () => {
    const capability = new EndToEndNationalFisheriesRegistryReferenceDataCapability();
    capability.openRegistry({ id: "registry:merge", registryCode: "SN-MERGE", countryId: "country:sn", createdAt: "2026-01-01T00:00:00.000Z" });

    capability.registerRecord({ caseId: "registry:merge", actorId: "actor:ministry", record: createRecord({ id: "actor:canonical", entityType: "actor", canonicalName: "Mamadou Ndiaye", identityKeys: [{ keyType: "national_id_hash", value: "hash-1" }] }) });
    capability.registerRecord({ caseId: "registry:merge", actorId: "actor:ministry", record: createRecord({ id: "actor:duplicate", entityType: "actor", canonicalName: "M. Ndiaye", identityKeys: [{ keyType: "internal_reference", value: "legacy-1" }] }) });

    capability.requestChange({
      caseId: "registry:merge",
      request: {
        id: "change:merge",
        recordId: "actor:duplicate",
        requestedByActorId: "actor:registry-admin",
        changeType: "merge",
        proposedAttributes: [{ code: "duplicate_of_record_id", label: "Enregistrement canonique", value: "actor:canonical", verified: true, updatedAt: "2026-02-01T00:00:00.000Z" }],
        proposedIdentityKeys: [],
        rationale: "Doublon confirmé",
        evidenceIds: ["evidence:merge"],
        status: "pending",
        requestedAt: "2026-02-01T00:00:00.000Z",
      },
    });

    capability.decideChange({ caseId: "registry:merge", requestId: "change:merge", approved: true, decidedByActorId: "actor:ministry", decidedAt: "2026-02-02T00:00:00.000Z" });

    const canonical = capability.getCanonicalRecord({ caseId: "registry:merge", recordId: "actor:duplicate" });
    expect(canonical.id).toBe("actor:canonical");
  });
});
