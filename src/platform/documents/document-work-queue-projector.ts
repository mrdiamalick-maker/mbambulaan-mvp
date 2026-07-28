import type { DecisionRecord, OperationalDocument, OperationalDocumentType } from "./operational-document-registry";
import { DocumentAccessAndGovernance } from "./document-access-and-governance";

export interface RequiredDocumentRule {
  id: string;
  relatedEntityType: OperationalDocument["relatedEntityType"];
  relatedEntityId: string;
  requiredDocumentTypes: OperationalDocumentType[];
  responsibleOrganizationId: string;
  responsibleActorId?: string;
  territoryId: string;
  dueAt: string;
  reason