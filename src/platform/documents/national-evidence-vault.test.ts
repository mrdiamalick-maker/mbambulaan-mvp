import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryDocumentRepository,
  NationalEvidenceVault,
  type MalwareScanner,
  type ObjectStorage,
} from "./national-evidence-vault";

class MemoryStorage implements ObjectStorage {
  existing = new Set<string>();
  deleted: string[] = [];
  async createUploadUrl(input: { bucket: string; key: string }) { this.existing.add(`${input.bucket}/${input.key}`); return `https://upload/${input.key}`; }
  async createDownloadUrl(input: { key: string }) { return `https://download/${input.key}`; }
  async exists(input: { bucket: string; key: string }) { return this.existing.has(`${input.bucket}/${input.key}`); }
  async delete(input: { bucket: string; key: string }) { this.deleted.push(`${input.bucket}/${input.key}`); }
}

function createVault(scanResult: "clean" | "infected" = "clean") {
  const repository = new InMemoryDocumentRepository();
  const storage = new MemoryStorage();
  const scanner: MalwareScanner = { async scan() { return scanResult; } };
  let sequence = 0;
  const vault = new NationalEvidenceVault(
    repository,
    storage,
    scanner,
    { now: () => "2026-07-27T12:00:00Z" },
    { next: (prefix) => `${prefix}-${++sequence}` },
  );
  return { vault, repository, storage };
}

const upload = {
  fileName: "preuve.pdf",
  mediaType: "application/pdf",
  sizeBytes: 2048,
  sha256: "a".repeat(64),
  classification: "restricted" as const,
  territoryIds: ["territory-joal"],
  organizationId: "org-quai-joal",
  subjects: [{ subjectType: "landing" as const, subjectId: "landing-001" }],
  uploadedByIdentityId: "identity-agent",
};

test("un document propre devient disponible après quarantaine", async () => {
  const { vault, repository } = createVault();
  const intent = await vault.prepareUpload(upload);
  const document = await vault.finalizeUpload(intent.documentId);
  assert.equal(document.status, "available");
  assert.equal(document.malwareStatus, "clean");
  assert.equal(repository.documents.size, 1);
});

test("un document infecté est rejeté", async () => {
  const { vault } = createVault("infected");
  const intent = await vault.prepareUpload(upload);
  const document = await vault.finalizeUpload(intent.documentId);
  assert.equal(document.status, "rejected");
});

test("un document restreint exige une authentification forte", async () => {
  const { vault } = createVault();
  const intent = await vault.prepareUpload(upload);
  await vault.finalizeUpload(intent.documentId);
  await assert.rejects(
    () => vault.createDownload({
      documentId: intent.documentId,
      access: { identityId: "identity-agent", permissionCodes: ["documents.read"], territoryIds: ["territory-joal"], organizationId: "org-quai-joal", strongAuthentication: false },
      purpose: "Contrôle qualité",
    }),
    /authentification forte/i,
  );
});

test("un téléchargement autorisé produit une preuve de consultation", async () => {
  const { vault, repository } = createVault();
  const intent = await vault.prepareUpload(upload);
  await vault.finalizeUpload(intent.documentId);
  const download = await vault.createDownload({
    documentId: intent.documentId,
    access: { identityId: "identity-agent", permissionCodes: ["documents.read"], territoryIds: ["territory-joal"], organizationId: "org-quai-joal", strongAuthentication: true },
    purpose: "Contrôle qualité",
  });
  assert.match(download.downloadUrl, /download/);
  assert.equal(repository.receipts[0]?.action, "download");
});

test("la rétention et la conservation légale bloquent la suppression", async () => {
  const { vault, repository } = createVault();
  const intent = await vault.prepareUpload({ ...upload, retentionUntil: "2027-07-27T12:00:00Z" });
  await vault.finalizeUpload(intent.documentId);
  const access = { identityId: "identity-admin", permissionCodes: ["documents.delete"], territoryIds: ["territory-joal"], organizationId: "org-quai-joal", strongAuthentication: true };
  await assert.rejects(() => vault.delete({ documentId: intent.documentId, access, purpose: "Purge" }), /conservation/i);
  const document = repository.documents.get(intent.documentId)!;
  document.retentionUntil = undefined;
  document.legalHold = true;
  repository.documents.set(document.id, document);
  await assert.rejects(() => vault.delete({ documentId: intent.documentId, access, purpose: "Purge" }), /conservation légale/i);
});

test("une nouvelle version référence la précédente", async () => {
  const { vault, repository } = createVault();
  const first = await vault.prepareUpload(upload);
  const firstDocument = repository.documents.get(first.documentId)!;
  const second = await vault.prepareUpload({ ...upload, logicalDocumentId: firstDocument.logicalDocumentId });
  const secondDocument = repository.documents.get(second.documentId)!;
  assert.equal(secondDocument.version, 2);
  assert.equal(secondDocument.supersedesDocumentId, first.documentId);
});
