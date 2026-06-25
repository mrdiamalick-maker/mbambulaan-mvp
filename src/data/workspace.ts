export type WorkspacePageData = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
};

export const workspacePages = {
  dashboard: {
    eyebrow: "Dashboard",
    title: "Pilotage general",
    description: "Vue de preparation pour suivre les signaux essentiels du reseau Mbàmbulaan: activite des quais, arrivages recents et besoins ouverts.",
    metrics: [
      { label: "Quais suivis", value: "5" },
      { label: "Arrivages mockes", value: "18" },
      { label: "Besoins ouverts", value: "9" }
    ]
  },
  quais: {
    eyebrow: "Quais",
    title: "Sites de debarquement",
    description: "Espace destine aux fiches quais, aux capacites d'accueil et aux contacts operationnels.",
    metrics: [
      { label: "Sites pilotes", value: "5" },
      { label: "Zones couvertes", value: "3" },
      { label: "Referents", value: "7" }
    ]
  },
  arrivages: {
    eyebrow: "Arrivages",
    title: "Volumes disponibles",
    description: "Base de travail pour afficher les especes, les volumes et les horaires de debarquement a partir de donnees mockees.",
    metrics: [
      { label: "Lots recenses", value: "18" },
      { label: "Especes", value: "6" },
      { label: "Alertes fraicheur", value: "4" }
    ]
  },
  opportunites: {
    eyebrow: "Opportunites",
    title: "Mises en relation",
    description: "Ecran prepare pour rapprocher disponibilites et demandes commerciales entre mareyeurs, transformateurs et quais.",
    metrics: [
      { label: "Offres actives", value: "12" },
      { label: "Acheteurs cibles", value: "24" },
      { label: "Priorites", value: "5" }
    ]
  },
  besoins: {
    eyebrow: "Besoins",
    title: "Demandes exprimees",
    description: "Point d'entree pour structurer les demandes par espece, volume, calendrier et zone de collecte.",
    metrics: [
      { label: "Demandes mockees", value: "9" },
      { label: "Volumes recherches", value: "3,2 t" },
      { label: "Delais urgents", value: "3" }
    ]
  }
} satisfies Record<string, WorkspacePageData>;
