export type TransformationStatus =
  | "a_securiser"
  | "partiel"
  | "pret"
  | "production"
  | "termine"
  | "bloque";

export type TransformationConstraintKind = "matiere" | "froid" | "transport" | "equipe" | "qualite";

export type TransformationConstraint = {
  id: string;
  kind: TransformationConstraintKind;
  label: string;
  blocking: boolean;
  resolved: boolean;
};

export type TransformationSupplyOption = {
  id: string;
  source: string;
  territoryId: string;
  species: string;
  quantityKg: number;
  availableAt: string;
  condition: "frais" | "refrigere";
  trust: "declare" | "verifie";
  transportReady: boolean;
  coldChainReady: boolean;
};

export type TransformationEvent = {
  id: string;
  type:
    | "plan_cree"
    | "lot_propose"
    | "lot_affecte"
    | "contrainte_levee"
    | "production_lancee"
    | "production_terminee";
  label: string;
  at: string;
  actor: string;
};

export type TransformationPlanDemo = {
  planId: string;
  processor: string;
  unit: string;
  territoryId: string;
  product: string;
  species: string;
  targetKg: number;
  securedKg: number;
  requiredBy: string;
  status: TransformationStatus;
  constraints: TransformationConstraint[];
  supplyOptions: TransformationSupplyOption[];
  selectedSupplyIds: string[];
  events: TransformationEvent[];
};

export type TransformationDecision = {
  canStart: boolean;
  primaryAction: "completer_matiere" | "lever_blocage" | "lancer_production" | "suivre_production" | "aucune_action";
  title: string;
  reason: string;
  consequences: string[];
  recommendedSupplyIds: string[];
};

export const sharedTransformationDemo: TransformationPlanDemo = {
  planId: "TRF-2026-0018",
  processor: "Fatou Sarr",
  unit: "GIE Jappo Liggey",
  territoryId: "hann",
  product: "Sardinelle fumée",
  species: "Sardinelle",
  targetKg: 600,
  securedKg: 360,
  requiredBy: "Demain avant 08h",
  status: "partiel",
  constraints: [
    { id: "ctr-matiere", kind: "matiere", label: "240 kg restent à trouver", blocking: true, resolved: false },
    { id: "ctr-froid", kind: "froid", label: "Le froid est disponible jusqu’à 10h", blocking: true, resolved: true },
    { id: "ctr-equipe", kind: "equipe", label: "L’équipe est prête à 08h", blocking: true, resolved: true },
    { id: "ctr-transport", kind: "transport", label: "Le transport doit être confirmé", blocking: true, resolved: false }
  ],
  supplyOptions: [
    {
      id: "LOT-HANN-121",
      source: "Hann",
      territoryId: "hann",
      species: "Sardinelle",
      quantityKg: 240,
      availableAt: "Demain 06h30",
      condition: "frais",
      trust: "verifie",
      transportReady: true,
      coldChainReady: true
    },
    {
      id: "LOT-MBOUR-052",
      source: "Mbour",
      territoryId: "mbour",
      species: "Sardinelle",
      quantityKg: 300,
      availableAt: "Demain 08h30",
      condition: "refrigere",
      trust: "declare",
      transportReady: false,
      coldChainReady: true
    }
  ],
  selectedSupplyIds: [],
  events: [
    { id: "evt-trf-1", type: "plan_cree", label: "Production prévue pour demain", at: "14:10", actor: "Fatou Sarr" },
    { id: "evt-trf-2", type: "lot_propose", label: "240 kg disponibles à Hann", at: "14:18", actor: "Mbàmbulaan" }
  ]
};

export function getTransformationSummary(plan: TransformationPlanDemo) {
  const remainingKg = Math.max(plan.targetKg - plan.securedKg, 0);
  const unresolvedBlocking = plan.constraints.filter((item) => item.blocking && !item.resolved);

  return {
    remainingKg,
    completionRate: plan.targetKg === 0 ? 0 : Math.min(100, Math.round((plan.securedKg / plan.targetKg) * 100)),
    unresolvedBlocking,
    nextAction:
      remainingKg > 0
        ? `Trouver encore ${remainingKg} kg`
        : unresolvedBlocking.length > 0
          ? `Régler ${unresolvedBlocking[0].label.toLowerCase()}`
          : plan.status === "production"
            ? "Suivre la production"
            : plan.status === "termine"
              ? "Aucune action attendue"
              : "Lancer la production"
  };
}

export function getTransformationDecision(plan: TransformationPlanDemo): TransformationDecision {
  const summary = getTransformationSummary(plan);
  const compatibleOptions = plan.supplyOptions
    .filter((option) => option.species === plan.species && option.coldChainReady)
    .sort((a, b) => {
      if (a.trust !== b.trust) return a.trust === "verifie" ? -1 : 1;
      if (a.transportReady !== b.transportReady) return a.transportReady ? -1 : 1;
      return Math.abs(summary.remainingKg - a.quantityKg) - Math.abs(summary.remainingKg - b.quantityKg);
    });

  if (plan.status === "termine") {
    return {
      canStart: false,
      primaryAction: "aucune_action",
      title: "La production est terminée",
      reason: "Aucune action n’est attendue pour cette production.",
      consequences: [],
      recommendedSupplyIds: []
    };
  }

  if (plan.status === "production") {
    return {
      canStart: false,
      primaryAction: "suivre_production",
      title: "La production est en cours",
      reason: "La matière et les moyens ont déjà été confirmés.",
      consequences: ["Surveiller l’heure de fin", "Préparer la sortie des produits"],
      recommendedSupplyIds: []
    };
  }

  if (summary.remainingKg > 0) {
    return {
      canStart: false,
      primaryAction: "completer_matiere",
      title: `Il manque ${summary.remainingKg} kg pour démarrer`,
      reason: compatibleOptions.length > 0
        ? "Une disponibilité compatible a été trouvée."
        : "Aucune disponibilité compatible n’est confirmée pour le moment.",
      consequences: ["Sans complément, la production sera décalée", "Le froid et l’équipe risquent d’être mobilisés inutilement"],
      recommendedSupplyIds: compatibleOptions.slice(0, 2).map((item) => item.id)
    };
  }

  if (summary.unresolvedBlocking.length > 0) {
    return {
      canStart: false,
      primaryAction: "lever_blocage",
      title: "Un point empêche encore le démarrage",
      reason: summary.unresolvedBlocking.map((item) => item.label).join(" · "),
      consequences: ["La production reste en attente", "Les autres acteurs doivent être prévenus si le retard se confirme"],
      recommendedSupplyIds: []
    };
  }

  return {
    canStart: true,
    primaryAction: "lancer_production",
    title: "La production peut démarrer",
    reason: "La matière, le froid, le transport et l’équipe sont prêts.",
    consequences: ["La matière affectée ne sera plus proposée ailleurs", "L’équipe peut commencer à l’heure prévue"],
    recommendedSupplyIds: []
  };
}

export function assignSupply(plan: TransformationPlanDemo, supplyId: string): TransformationPlanDemo {
  const supply = plan.supplyOptions.find((item) => item.id === supplyId);
  if (!supply || plan.selectedSupplyIds.includes(supplyId)) return plan;

  const securedKg = Math.min(plan.targetKg, plan.securedKg + supply.quantityKg);
  const selectedSupplyIds = [...plan.selectedSupplyIds, supplyId];
  const constraints = plan.constraints.map((constraint) => {
    if (constraint.kind === "matiere" && securedKg >= plan.targetKg) return { ...constraint, resolved: true, label: "La matière est complète" };
    if (constraint.kind === "transport" && supply.transportReady) return { ...constraint, resolved: true, label: "Le transport est confirmé" };
    return constraint;
  });
  const allReady = securedKg >= plan.targetKg && constraints.every((item) => !item.blocking || item.resolved);

  return {
    ...plan,
    securedKg,
    selectedSupplyIds,
    constraints,
    status: allReady ? "pret" : securedKg > 0 ? "partiel" : "a_securiser",
    events: [
      ...plan.events,
      {
        id: `evt-${plan.planId}-${selectedSupplyIds.length}`,
        type: "lot_affecte",
        label: `${supply.quantityKg} kg de ${supply.species} affectés depuis ${supply.source}`,
        at: "Maintenant",
        actor: plan.processor
      }
    ]
  };
}

export function startTransformation(plan: TransformationPlanDemo): TransformationPlanDemo {
  const decision = getTransformationDecision(plan);
  if (!decision.canStart) return plan;

  return {
    ...plan,
    status: "production",
    events: [
      ...plan.events,
      {
        id: `evt-${plan.planId}-start`,
        type: "production_lancee",
        label: `Production de ${plan.product} lancée`,
        at: "Maintenant",
        actor: plan.processor
      }
    ]
  };
}

export function completeTransformation(plan: TransformationPlanDemo): TransformationPlanDemo {
  if (plan.status !== "production") return plan;

  return {
    ...plan,
    status: "termine",
    events: [
      ...plan.events,
      {
        id: `evt-${plan.planId}-done`,
        type: "production_terminee",
        label: `Production de ${plan.product} terminée`,
        at: "Maintenant",
        actor: plan.processor
      }
    ]
  };
}
