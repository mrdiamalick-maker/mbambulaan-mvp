# Codex V13 — Dernier passage MVP design premium

Contexte : Mbàmbulaan doit être présenté et vendu au Ministère des Pêches. La logique produit V1-V12 est validée : Atlas maritime, signal terrain, dossier opérationnel, preuve, décision, financement, rapport/note, posture institutionnelle prudente. Ne pas refaire le produit. Ne pas casser V8/V9/V10/V11/V12.

Objectif final : faire passer la MVP d'un prototype fonctionnel à une démonstration premium crédible : institutionnel sobre + control room maritime + dossier administratif premium.

Contraintes absolues :
- Ne pas ajouter de vraie API, backend, persistance serveur ou transmission WhatsApp réelle.
- Ne pas inventer l'organisation interne du Ministère.
- Garder la mention de posture V12 : modèle de coordination réaliste, paramétrable après cadrage.
- Garder la chaîne : signal -> dossier -> preuve -> décision -> financement.
- Garder une seule action principale par écran.
- Ne pas créer un dashboard SaaS générique.
- Ne pas réintroduire Kanban, ticketing, cartes colorées ou badges multicolores.
- Ne pas faire de refonte massive. Commits courts, vérifications après chaque lot.

Source V13 design system :
- Style cible : Institutional Maritime Operations.
- Inter pour UI, IBM Plex Mono pour références, chiffres, timestamps.
- Panneaux type document : bordures fines, sections séparées par lignes, peu ou pas d'ombres.
- Radius modéré, boutons professionnels, densité maîtrisée.
- Couleur réservée aux alertes réelles : ambre/rouge uniquement.
- Badges neutres bleu-gris par défaut.
- Pictos utiles seulement si métier : pirogue, quai, signal, preuve, dossier, arbitrage, financement, rapport, partenaire, alerte, confiance, canal.

Priorité d'exécution : faire uniquement les lots qui ont le meilleur ratio impact/risque.

Lot 1 — Boutons et hiérarchie d'action
Objectif : rendre évident ce que l'utilisateur doit faire.
Actions :
- Auditer les styles de boutons existants dans private-space.
- Renforcer la différence entre action primaire, secondaire, consultation, génération et transmission manuelle.
- Un seul bouton visuellement primaire par panneau ou écran de travail.
- Libellés à privilégier : Ouvrir le dossier, Traiter le prochain dossier, Arbitrer, Générer la note, Consulter les preuves, Valider le constat, Confirmer la transmission, Relancer.
Critère d'acceptation : on comprend l'action principale en moins de 3 secondes.

Lot 2 — Badges et statuts
Objectif : supprimer l'effet ticketing.
Actions :
- Limiter l'affichage à un badge de confiance, un badge canal, un badge criticité si nécessaire.
- Remplacer les badges trop colorés par des styles neutres.
- Garder ambre/rouge uniquement pour vigilance/critique réelles.
Critère d'acceptation : jamais plus de 3 badges sur un même élément ; aucun effet Jira/Zendesk.

Lot 3 — Panneau dossier
Objectif : renforcer l'effet dossier administratif premium.
Actions :
- Vérifier que le panneau dossier reste un document : référence mono encadrée, type en petites capitales, objet, faits clés, fil signal->dossier->preuve->décision->sortie.
- Notes/Pièces/Historique séparés par lignes fines.
- Supprimer toute sensation de carte colorée ou ticket.
Critère d'acceptation : le dossier paraît imprimable, traçable et institutionnel.

Lot 4 — Atlas maritime
Objectif : créer l'effet wow sérieux.
Actions :
- Ne pas refaire la carte.
- Rendre les marqueurs plus sobres si nécessaire.
- Clarifier les couches : quais / pirogues / cycle / alertes.
- Éviter les labels envahissants.
- Garder le click vers dossier/quai/pirogue.
Critère d'acceptation : en 5 secondes, on comprend mer, littoral, quai, pirogue, signal prioritaire.

Lot 5 — Situation nationale Ministère
Objectif : vendre au sponsor.
Actions :
- Pour le profil Ministère, renforcer la vue Situation nationale : une ligne de situation, 2-3 décisions/dossiers à arbitrer, impact/preuve consolidée.
- Ne pas montrer le détail opérationnel WhatsApp ou terrain brut ici.
- CTA principal : Arbitrer ou Générer la note.
Critère d'acceptation : le Ministère voit immédiatement pourquoi Mbàmbulaan sert à décider.

Lot 6 — Portefeuille finançable Partenaire/Bailleur
Objectif : montrer la valeur économique.
Actions :
- Mettre en avant montants, bénéficiaires, preuves, statut honnête de transmission.
- Masquer le jargon interne et les détails terrain bruts.
- CTA principal : Consulter le dossier.
Critère d'acceptation : un bailleur voit des dossiers instruisibles, pas un back-office.

Méthode de travail :
1. Inspecter les composants existants avant de modifier.
2. Modifier le minimum de fichiers possible.
3. Éviter de réécrire les fichiers volumineux.
4. Après chaque changement, vérifier que le fichier n'est pas tronqué.
5. Lancer npm run typecheck puis npm run build.
6. Mettre à jour la PR avec : fichiers modifiés, ce qui a changé, limites restantes, résultats CI/build.

Fichiers probables à regarder :
- src/app/globals.css
- src/components/private-space/MinistryControlTowerParts.tsx
- src/components/private-space/MinistryDossierExperience.tsx
- src/components/private-space/MinistryDailyExperience.tsx
- src/components/private-space/MinistryValueWorkflows.tsx
- src/components/private-space/MinistryControlTower.tsx

Démo cible à préserver :
1. Vue Ministère : Situation nationale.
2. Atlas : repérer Kayar / signal prioritaire.
3. Ouvrir le dossier.
4. Montrer canal, poste local reconnu, preuves, historique.
5. Traiter / valider / générer rapport ou note.
6. Montrer financement / impact.
7. Revenir à la situation nationale.

Livrable attendu : une passe finale premium, sobre et crédible. Si un changement est risqué, ne le fais pas : documente-le comme prochain chantier après cadrage.