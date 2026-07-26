import type { Commitment } from "../domain/types";
import {
  DomainService,
  type CreateCommitmentInput,
} from "../domain/services";

export interface CreateCommitmentResult {
  commitment: Commitment;
}

export function createCommitment(
  service: DomainService,
  input: CreateCommitmentInput,
): CreateCommitmentResult {
  return {
    commitment: service.createCommitment(input),
  };
}
