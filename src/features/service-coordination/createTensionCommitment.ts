import {
  createCommitment,
  type CreateCommitmentResult,
} from "../../application/createCommitment";
import { getCommitmentsByTension } from "../../domain/selectors";
import type {
  CreateCommitmentInput,
  DomainService,
} from "../../domain/services";

export interface CreateTensionCommitmentInput
  extends CreateCommitmentInput {}

export interface CreateTensionCommitmentResult {
  commitment: CreateCommitmentResult["commitment"];
  commitments: ReturnType<typeof getCommitmentsByTension>;
}

export function createTensionCommitment(
  service: DomainService,
  input: CreateTensionCommitmentInput,
): CreateTensionCommitmentResult {
  const commitment = createCommitment(service, input).commitment;
  const commitments = getCommitmentsByTension(
    service.getSnapshot(),
    input.tensionId,
  );

  return {
    commitment,
    commitments,
  };
}
