export type WorkHealth = "normal" | "attention" | "bloque";

export type WorkEvent = {
  id: string;
  label: string;
  at: string;
  actor: string;
  done: boolean;
};

export type WorkRoleView = {
  question: string;
  currentOwner: string;
  nextOwner: string;
  nextAction: string;
  actionLabel: string;
  actionHref: string;
};

export type MbambulaanWork = {
  id: string;
  title: string;
  health: WorkHealth;
  currentStep: string;
  participants: string[];
  events: WorkEvent[];
  roleViews: Record<"capitaine" | "operateur" | "mareyeur" | "transformateur", WorkRoleView>;
};

export const landingWorkDemo: MbambulaanWork = {
  id: "RET-2026-0814",
  title: "Débarquer le retour de pêche",
  health: "attention",
  currentStep: "Pesée terminée, lot à affecter",
  participants: ["Capitaine", "Agent de quai", "Mareyeur", "Transformatrice"],
  events: [
    { id: "evt-1", label: "Retour annoncé", at: "15:42", actor: "Capitaine", done: true },
    { id: "evt-2", label: "Quai et glace confirmés", at: "15:47", actor: "Agent de quai", done: true },
    { id: "evt-3", label: "Arrivée au quai", at: "16:08", actor: "Agent de quai", done: true },
    { id: "evt-4", label: "Pesée enregistrée : 420 kg", at: "16:15", actor: "Agent de quai", done: true },
    { id: "evt-5", label: "Lot proposé aux acheteurs concernés", at: "16:18", actor: "Mbàmbulaan", done: true },
    { id: "evt-6", label: "Décision sur le lot", at: "À faire", actor: "Mareyeur", done: false }
  ],
  roleViews: {
    capitaine: {
      question: "Où en est mon débarquement ?",
      currentOwner: "Agent de quai",
      nextOwner: "Mareyeur",
      nextAction: "Vérifier que la pesée reçue est correcte.",
      actionLabel: "Voir ma sortie",
      actionHref: "/app/operations"
    },
    operateur: {
      question: "Quelle est la prochaine action au quai ?",
      currentOwner: "Agent de quai",
      nextOwner: "Mareyeur",
      nextAction: "Confirmer que le lot issu de la pesée est disponible.",
      actionLabel: "Ouvrir l’arrivée",
      actionHref: "/app/operations"
    },
    mareyeur: {
      question: "Ce lot correspond-il à mon besoin ?",
      currentOwner: "Mareyeur",
      nextOwner: "Agent de quai",
      nextAction: "Comparer les propositions et décider avant l’échéance.",
      actionLabel: "Comparer les lots",
      actionHref: "/app/marches"
    },
    transformateur: {
      question: "Puis-je sécuriser ma production ?",
      currentOwner: "Transformatrice",
      nextOwner: "Agent de quai",
      nextAction: "Affecter une quantité disponible au plan de production.",
      actionLabel: "Voir les options",
      actionHref: "/app/marches"
    }
  }
};
