import type {
  EcosystemCapabilityCode,
  EcosystemDomainData,
  EcosystemOrganizationProfile,
  EcosystemPartnership,
  InterventionProgram,
  ProgramBeneficiary,
  ProgramCommitment,
  ProgramOutcomeMetric,
} from "./ecosystem";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function assertUniqueId<T extends { id: string }>(items: T[], id: string, label: string) {
  if (items.some((item) => item.id === id)) {
    throw new Error(`${label} ${id} existe déjà.`);
  }
}

export interface ProgramProgress {
  programId: string;
  enrolledBeneficiaries: number;
  eligibleBeneficiaries: number;
  deliveredCommitments: number;
  approvedCommitments: number;
  outcomeMetricsCount: number;
}

export interface OrganizationAccessDecision {
  organizationId: string;
  capability: EcosystemCapabilityCode;
  allowed: boolean;
  reason?: string;
}

export class EcosystemService {
  private state: EcosystemDomainData;

  constructor(initialState?: Partial<EcosystemDomainData>) {
    this.state = {
      organizationProfiles: initialState?.organizationProfiles ?? [],
      interventionPrograms: initialState?.interventionPrograms ?? [],
      beneficiaries: initialState?.beneficiaries ?? [],
      commitments: initialState?.commitments ?? [],
      outcomeMetrics: initialState?.outcomeMetrics ?? [],
      partnerships: initialState?.partnerships ?? [],
    };
  }

  snapshot(): EcosystemDomainData {
    return clone(this.state);
  }

  registerOrganizationProfile(profile: EcosystemOrganizationProfile) {
    assertUniqueId(this.state.organizationProfiles, profile.id, "Le profil organisation");
    this.state.organizationProfiles.push(clone(profile));
    return clone(profile);
  }

  verifyOrganization(profileId: string, verifiedAt: string, verifiedByActorId: string) {
    const profile = this.state.organizationProfiles.find((item) => item.id === profileId);
    if (!profile) throw new Error(`Le profil ${profileId} est introuvable.`);
    profile.status = "verified";
    profile.verifiedAt = verifiedAt;
    profile.verifiedByActorId = verifiedByActorId;
    return clone(profile);
  }

  assessCapability(
    organizationId: string,
    capability: EcosystemCapabilityCode,
  ): OrganizationAccessDecision {
    const profile = this.state.organizationProfiles.find(
      (item) => item.organizationId === organizationId,
    );

    if (!profile) {
      return { organizationId, capability, allowed: false, reason: "Profil organisation absent." };
    }

    if (profile.status !== "verified") {
      return { organizationId, capability, allowed: false, reason: "Organisation non vérifiée." };
    }

    if (!profile.capabilityCodes.includes(capability)) {
      return { organizationId, capability, allowed: false, reason: "Capability non attribuée." };
    }

    return { organizationId, capability, allowed: true };
  }

  publishProgram(program: InterventionProgram) {
    assertUniqueId(this.state.interventionPrograms, program.id, "Le programme");
    const access = this.assessCapability(program.ownerOrganizationId, "publish_program");
    if (!access.allowed) throw new Error(access.reason);
    this.state.interventionPrograms.push(clone(program));
    return clone(program);
  }

  enrollBeneficiary(beneficiary: ProgramBeneficiary) {
    assertUniqueId(this.state.beneficiaries, beneficiary.id, "Le bénéficiaire");
    const program = this.state.interventionPrograms.find(
      (item) => item.id === beneficiary.programId,
    );
    if (!program) throw new Error(`Le programme ${beneficiary.programId} est introuvable.`);
    if (!["open", "active"].includes(program.status)) {
      throw new Error("Le programme n'accepte pas de nouveaux bénéficiaires.");
    }
    this.state.beneficiaries.push(clone(beneficiary));
    return clone(beneficiary);
  }

  approveBeneficiary(beneficiaryId: string, reason?: string) {
    const beneficiary = this.state.beneficiaries.find((item) => item.id === beneficiaryId);
    if (!beneficiary) throw new Error(`Le bénéficiaire ${beneficiaryId} est introuvable.`);
    beneficiary.eligibilityStatus = "eligible";
    beneficiary.eligibilityReason = reason;
    return clone(beneficiary);
  }

  registerCommitment(commitment: ProgramCommitment) {
    assertUniqueId(this.state.commitments, commitment.id, "L'engagement");
    const program = this.state.interventionPrograms.find(
      (item) => item.id === commitment.programId,
    );
    if (!program) throw new Error(`Le programme ${commitment.programId} est introuvable.`);

    const beneficiary = this.state.beneficiaries.find(
      (item) => item.id === commitment.beneficiaryId,
    );
    if (!beneficiary || beneficiary.eligibilityStatus !== "eligible") {
      throw new Error("Le bénéficiaire n'est pas éligible à cet engagement.");
    }

    this.state.commitments.push(clone(commitment));
    return clone(commitment);
  }

  deliverCommitment(commitmentId: string) {
    const commitment = this.state.commitments.find((item) => item.id === commitmentId);
    if (!commitment) throw new Error(`L'engagement ${commitmentId} est introuvable.`);
    if (!["planned", "approved"].includes(commitment.status)) {
      throw new Error("Cet engagement ne peut pas être livré dans son état actuel.");
    }
    commitment.status = "delivered";
    return clone(commitment);
  }

  registerOutcomeMetric(metric: ProgramOutcomeMetric) {
    assertUniqueId(this.state.outcomeMetrics, metric.id, "La métrique d'impact");
    const program = this.state.interventionPrograms.find((item) => item.id === metric.programId);
    if (!program) throw new Error(`Le programme ${metric.programId} est introuvable.`);
    this.state.outcomeMetrics.push(clone(metric));
    return clone(metric);
  }

  createPartnership(partnership: EcosystemPartnership) {
    assertUniqueId(this.state.partnerships, partnership.id, "Le partenariat");
    const lead = this.state.organizationProfiles.find(
      (item) => item.organizationId === partnership.leadOrganizationId,
    );
    const partner = this.state.organizationProfiles.find(
      (item) => item.organizationId === partnership.partnerOrganizationId,
    );
    if (!lead || !partner) throw new Error("Les deux organisations doivent être référencées.");
    this.state.partnerships.push(clone(partnership));
    return clone(partnership);
  }

  getProgramProgress(programId: string): ProgramProgress {
    const program = this.state.interventionPrograms.find((item) => item.id === programId);
    if (!program) throw new Error(`Le programme ${programId} est introuvable.`);

    const beneficiaries = this.state.beneficiaries.filter(
      (item) => item.programId === programId,
    );
    const commitments = this.state.commitments.filter(
      (item) => item.programId === programId,
    );
    const metrics = this.state.outcomeMetrics.filter(
      (item) => item.programId === programId,
    );

    return {
      programId,
      enrolledBeneficiaries: beneficiaries.length,
      eligibleBeneficiaries: beneficiaries.filter(
        (item) => item.eligibilityStatus === "eligible",
      ).length,
      deliveredCommitments: commitments.filter((item) => item.status === "delivered").length,
      approvedCommitments: commitments.filter((item) => item.status === "approved").length,
      outcomeMetricsCount: metrics.length,
    };
  }
}
