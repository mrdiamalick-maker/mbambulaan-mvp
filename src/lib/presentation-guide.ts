// Mode présentation guidée (Lot 6, étape 3/4) : rejoue le parcours
// canonique du fil rouge dans le vrai Produit, pas une application
// parallèle — chaque étape pointe vers une page réelle déjà construite.
// La liste reprend, dans l'ordre, les 15 critères d'acceptation du spec
// maître (§21) : ce n'est pas un choix de contenu séparé, la présentation
// EST la vérification, réutilisée pour la recette (étape 4/4).
export interface PresentationStep {
  title: string;
  description: string;
  href: string;
}

export const presentationSteps: PresentationStep[] = [
  { title: "1. Vue nationale", description: "Ouvrir la vue nationale institutionnelle — l’ensemble des territoires et leur état.", href: "/app/etat" },
  { title: "2. Territoire prioritaire", description: "Repérer Joal-Fadiouth sur la carte : en vigilance, une situation à traiter.", href: "/app/etat" },
  { title: "3. Fiche territoire", description: "Cliquer sur Joal-Fadiouth pour ouvrir sa fiche.", href: "/app/etat" },
  { title: "4. Situation et sa source", description: "Repérer « Machine à glace indisponible » et la source du signal (canal, acteur, date).", href: "/app/etat" },
  { title: "5. Impact", description: "Lire la priorité et l’impact affichés pour cette situation.", href: "/app/etat" },
  { title: "6. Dossier de situation", description: "Ouvrir la situation pour son détail complet — contexte, trajectoire, capacité alternative.", href: "/app/situations/sit-glace" },
  { title: "7. Acteurs, décisions, engagements", description: "Panneau Coordination : acteurs mobilisés, décisions enregistrées, engagements pris.", href: "/app/situations/sit-glace" },
  { title: "8. Mobiliser une capacité", description: "Sélectionner ou confirmer la capacité alternative proposée.", href: "/app/situations/sit-glace" },
  { title: "9. Préparer une communication", description: "Panneau Communication : consigner un appel ou un WhatsApp simulé.", href: "/app/situations/sit-glace" },
  { title: "10. Enregistrer une preuve", description: "Panneau Preuve : ajouter une preuve (photo, document, mesure…).", href: "/app/situations/sit-glace" },
  { title: "11. Clôturer avec résultat", description: "Enregistrer le résultat et clôturer la situation.", href: "/app/situations/sit-glace" },
  { title: "12. Impact dans le pilotage", description: "Constater l’effet du résultat dans le pilotage consolidé.", href: "/app/pilotage" },
  { title: "13. Besoin collectif → programme", description: "Regrouper la grappe « Formation » en programme structuré.", href: "/app/initiatives" },
  { title: "14. Exporter un rapport", description: "Télécharger un rapport réel (Excel .xlsx ou impression PDF).", href: "/app/etat/rapport" },
  { title: "15. Rejouer depuis le terrain mobile", description: "Se reconnecter avec un mandat capitaine et confirmer un retour depuis /app/terrain.", href: "/app/terrain" }
];
