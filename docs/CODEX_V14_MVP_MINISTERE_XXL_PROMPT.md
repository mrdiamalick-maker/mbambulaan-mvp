# CODEX V14 — MVP Ministère simplifié, cohérent et démontrable

## Mission

Tu travailles sur le repository `mrdiamalick-maker/mbambulaan-mvp`, sur la branche existante `feature-atlas-quais-pivot` et dans la PR #35.

Exécute une dernière refonte structurante du MVP Mbàmbulaan. Il ne s’agit pas d’ajouter davantage de fonctionnalités : il faut rendre le produit plus simple, plus cohérent, plus crédible et plus démontrable devant le Ministère des Pêches.

Le critère d’arbitrage absolu est le suivant :

> Entre ajouter une fonctionnalité et renforcer la boucle Kayar — signal → dossier → preuve → décision → document — la boucle Kayar gagne toujours.

Le produit doit prouver une capacité de coordination. Il ne doit pas prétendre connaître l’organisation définitive du Ministère avant les ateliers de cadrage.

## Résultat attendu

À la fin de cette passe, Mbàmbulaan doit raconter une seule histoire :

1. une situation est remontée depuis le terrain ;
2. elle est visible dans son contexte territorial, autour d’un quai ;
3. elle est qualifiée et rattachée à un dossier unique ;
4. l’agent voit immédiatement la prochaine action ;
5. les échanges, notes et pièces rendent le traitement traçable ;
6. une preuve est validée humainement ;
7. le dossier produit une décision, un rapport, une note ou un dossier finançable ;
8. la clôture et le résultat obtenu sont visibles.

Le parcours complet doit être compréhensible sans formation et exécutable en quelques clics.

---

# 1. Décisions produit non négociables

## 1.1 Navigation finale : trois entrées seulement

La navigation principale de l’espace Ministère doit contenir exactement :

- **Atlas**
- **Dossiers**
- **Pilotage**

Supprimer de la navigation principale :

- Briefing du jour / Aujourd’hui ;
- Filière & Financement ;
- le sélecteur global Ministère / Direction régionale / Partenaire-Bailleur.

Ne pas supprimer les capacités utiles de ces écrans : les réintégrer dans les trois espaces finaux.

## 1.2 Où vont les capacités supprimées

- Le **Briefing** devient l’état d’ouverture de **Pilotage** pour le sponsor Ministère.
- Un briefing opérationnel compact devient l’état d’ouverture de **Dossiers** pour l’agent.
- **Filière & Financement** devient un filtre et un parcours de dossiers : **Besoin filière**.
- Les dossiers prêts à être partagés avec un partenaire deviennent un filtre : **Prêts à partager**.
- Les indicateurs d’impact et montants restent dans Pilotage et dans les dossiers concernés.
- Les partenaires ne disposent pas d’un portail autonome dans ce MVP. Le produit démontre ce que le Ministère peut préparer et partager, sans inventer un accès ou une transmission réelle.

## 1.3 Point d’entrée

`/espace-prive/etat` s’ouvre par défaut sur **Pilotage**, car le sponsor et acheteur visé est le Ministère.

Le premier écran doit répondre en moins de dix secondes à cinq questions :

- Que se passe-t-il ?
- Qu’est-ce qui nécessite une attention ?
- Qu’est-ce qui a été traité ?
- Quelle décision ou action est attendue ?
- Sur quelles preuves repose cette lecture ?

Un CTA principal **Voir dans l’Atlas** ouvre le quai ou la situation prioritaire. Un second CTA contextuel peut ouvrir le dossier correspondant.

## 1.4 Positionnement affiché

Employer une formulation sobre, par exemple :

> Mbàmbulaan transforme les informations dispersées de la pêche artisanale en dossiers traçables, en preuves exploitables et en décisions documentées.

Éviter toute promesse juridiquement excessive telle que « preuve opposable ». Employer :

- preuve documentée ;
- preuve traçable ;
- information vérifiée ;
- élément exploitable pour la décision.

Conserver une mention discrète :

> Modèle de coordination de démonstration, paramétrable avec les services du Ministère après cadrage.

---

# 2. Modèle métier cohérent

## 2.1 Le quai est le pivot territorial, pas un dossier

Le **quai** est l’objet pivot de l’Atlas. Il possède une fiche territoriale qui agrège :

- activité du jour ;
- débarquements ;
- pirogues rattachées ;
- espèces et volumes ;
- situations en cours ;
- dossiers actifs ;
- poste ou relais local reconnu ;
- niveau de fraîcheur et de confiance des données.

Le CTA d’un quai doit être :

- **Ouvrir la fiche du quai**

Ne jamais employer **Ouvrir le dossier du quai**. Un dossier porte sur une situation, une vérification, un débarquement, une pirogue, un besoin filière ou une décision — pas sur le quai lui-même.

## 2.2 Une situation n’est pas automatiquement un incident

Ne modélise pas un parcours obligatoire `Signalé → Situation à traiter → Incident confirmé`.

Créer ou consolider un objet métier générique **Situation** avec deux dimensions distinctes.

### Statut de traitement

- Signalée
- À qualifier
- À traiter
- En vérification
- Vérifiée
- Clôturée

### Nature qualifiée

- Information
- Alerte préventive
- Incident
- Besoin filière

Une situation signalée peut :

- être qualifiée comme simple information ;
- devenir une alerte préventive ;
- être confirmée comme incident ;
- révéler un besoin filière ;
- être clôturée sans incident.

L’**alerte** est un niveau d’attention ou une nature préventive.  
L’**incident** est un événement confirmé qui exige une réponse et un dossier de traitement.

Dans l’Atlas, ne crée pas deux couches de points concurrentes « Alertes » et « Incidents ». Les situations sont rattachées aux quais ; leur nature et leur niveau d’attention apparaissent dans la fiche du quai et dans les dossiers.

## 2.3 Un dossier unique partout

Un même dossier doit conserver partout :

- le même identifiant ;
- le même titre ;
- la même situation de travail ;
- le même responsable ;
- le même canal d’origine ;
- le même niveau de confiance ;
- la même prochaine action ;
- les mêmes notes ;
- les mêmes pièces ;
- le même historique ;
- la même condition de clôture ;
- la même sortie attendue.

Il doit utiliser le même composant de présentation lorsqu’il est ouvert depuis :

- Pilotage ;
- Dossiers ;
- la fiche d’un quai dans l’Atlas.

Aucune duplication de dossier et aucune variante contradictoire.

## 2.4 Trois chaînes de traitement seulement

Réduire les multiples workflows existants à trois chaînes compréhensibles.

### A. Situation terrain

Signal reçu  
→ qualification  
→ vérification demandée  
→ retour terrain reçu  
→ preuve validée  
→ décision ou clôture  
→ rapport si nécessaire

Couvre : alerte, incident, écart, contrôle, constat.

### B. Besoin filière

Besoin remonté  
→ qualification  
→ pièces manquantes  
→ estimation et bénéficiaires  
→ dossier prêt  
→ document à partager  
→ suivi du financement

Couvre : équipement, chaîne du froid, sécurité, formation, programme communautaire.

### C. Décision institutionnelle

Sujet consolidé  
→ sources et preuves  
→ arbitrage attendu  
→ note préparée  
→ validation humaine  
→ décision enregistrée  
→ suivi

Couvre : note, arbitrage, rapport consolidé et suivi institutionnel.

Ne conserve pas dix formulaires ou tiroirs distincts si trois parcours paramétrés suffisent.

---

# 3. Refonte de la landing page

Fichier principal probable :  
`src/components/landing/InstitutionalLanding.tsx`

La landing actuelle est trop longue et répète certaines promesses. La réduire à six sections fortes.

## Section 1 — Hero

Titre :

> L’information terrain devient décision publique.

Sous-titre :

> Mbàmbulaan organise les remontées de la pêche artisanale, les rattache aux quais, les transforme en dossiers traçables et prépare les décisions, rapports et financements.

CTA principal :

- **Demander un atelier de cadrage**

CTA secondaire :

- **Voir la démonstration**

Le CTA de démonstration mène à l’espace de connexion ou directement au parcours de démonstration existant, sans inventer d’authentification.

## Section 2 — Le problème

Montrer sobrement les canaux dispersés :

- appels ;
- WhatsApp ;
- documents ;
- visites terrain ;
- fichiers isolés.

Puis montrer leur transformation en un dossier traçable.

## Section 3 — La boucle Mbàmbulaan

Afficher une seule chaîne claire :

> Signal → Quai → Dossier → Preuve → Décision → Document

Le quai apporte le contexte territorial ; le dossier porte le traitement.

## Section 4 — La démonstration Kayar

Présenter un seul scénario crédible en 4 ou 5 étapes, sans reproduire toute l’interface :

- signal reçu depuis le poste local ;
- dossier de vérification ouvert ;
- preuve terrain ajoutée et validée ;
- décision documentée ;
- rapport produit.

## Section 5 — Ce que le Ministère obtient

Limiter à quatre bénéfices :

- une situation nationale lisible ;
- des dossiers et responsabilités traçables ;
- des décisions fondées sur des preuves ;
- des besoins structurés pour financement.

## Section 6 — Cadrage / CTA final

Rappeler que les rôles, circuits et libellés seront paramétrés avec les services du Ministère.

Supprimer ou fusionner les sections répétitives et les anciennes prévisualisations cartographiques qui contredisent le nouvel Atlas centré sur les quais.

---

# 4. Refonte du shell Ministère

Fichier principal probable :  
`src/components/private-space/MinistryControlTower.tsx`

Ce composant reste l’orchestrateur de la console. Il ne devient pas lui-même le module Pilotage.

## Travail attendu

- Remplacer le type de workspace par trois valeurs uniquement : Atlas, Dossiers, Pilotage.
- Supprimer les anciennes entrées Briefing et Financement de la navigation.
- Supprimer le sélecteur de rôle global visible.
- Ouvrir Pilotage par défaut.
- Conserver un bandeau très discret indiquant que le modèle est paramétrable après cadrage.
- Garantir la navigation desktop et mobile.
- Ne pas multiplier les barres, menus secondaires ou onglets globaux.

Créer si nécessaire :

- `MinistryDossiersView.tsx`
- `MinistryPilotageView.tsx`
- `DossierActionFlow.tsx`

Éviter de continuer à grossir `MinistryControlTower.tsx`.

---

# 5. Atlas : garder le quai au centre

Fichiers principaux probables :

- `src/components/private-space/MinistryQuayAtlas.tsx`
- `src/components/private-space/QuayProfileSheet.tsx`
- `src/data/ministryControlTowerData.ts`

Conserver les acquis de la PR #35 :

- carte dégagée ;
- quais comme marqueurs principaux ;
- deux lectures maximum : quais et activité / suivi en mer ;
- fiche quai riche ;
- cycle pirogue représenté dans les fiches et non comme une pluie de points ;
- dossiers et preuves accessibles depuis la fiche.

## Règle de présentation

- **Carte = contexte**
- **Fiche = compréhension**
- **Dossier = traitement**

La carte ne doit pas porter le formulaire de traitement.

## Clics à différencier

### Quai

Ouvre la fiche du quai avec :

- synthèse ;
- activité du jour ;
- débarquements ;
- pirogues ;
- espèces et volumes ;
- situations ;
- dossiers et preuves.

### Pirogue

Ouvre une fiche unité avec :

- identification et immatriculation ;
- quai de rattachement ;
- cycle de sortie ;
- derniers débarquements ;
- situations associées ;
- CTA contextuel vers un dossier uniquement s’il en existe un.

### Débarquement

Ouvre une fiche opération avec :

- date et heure ;
- pirogue ;
- quai ;
- espèces ;
- volumes ;
- déclaration ;
- preuves ;
- écarts éventuels ;
- dossier associé si nécessaire.

### Situation

Ouvre un aperçu de la situation avec :

- origine ;
- canal ;
- nature ;
- niveau d’attention ;
- confiance ;
- action disponible : **Ouvrir le dossier** ou **Créer le dossier**.

Ne pas afficher simultanément tous les objets en marqueurs. Les pirogues ne sont visibles qu’en mode de suivi en mer. Les débarquements, espèces, cycles, alertes et incidents vivent principalement dans la fiche du quai.

## Filtre Atlas

Limiter les filtres visibles à ce qui aide réellement :

- recherche ;
- région ou zone ;
- quai ;
- situation : normale / attention / critique ;
- activité récente.

Les filtres détaillés par espèce, cycle ou dossier doivent se trouver dans la fiche quai si nécessaire.

---

# 6. Dossiers : le bureau opérationnel unique

Créer ou refondre une vue `MinistryDossiersView`.

Fichiers principaux probables :

- `src/components/private-space/MinistryDossierExperience.tsx`
- `src/lib/ministryOperationalDossiers.ts`
- `src/components/private-space/MinistryValueWorkflows.tsx`
- `src/components/private-space/MinistryOperationalRegisters.tsx`

## État d’ouverture

Le haut de l’écran affiche un briefing opérationnel compact, pas une page indépendante :

- dossiers à traiter aujourd’hui ;
- dossiers en attente de retour terrain ;
- dossiers bloqués ;
- dossiers prêts à clôturer ;
- CTA **Traiter le prochain dossier**.

## Liste unique

Pas de Kanban. Pas de colonnes de tickets.

Une liste documentaire priorisée avec filtres :

- Tous ;
- Situation terrain ;
- Besoin filière ;
- Décision institutionnelle ;
- À traiter ;
- En attente ;
- Bloqué ;
- Prêt à clôturer ;
- Prêt à partager ;
- quai ;
- canal.

Limiter le nombre de filtres visibles simultanément ; placer les filtres avancés dans un panneau secondaire.

## Panneau dossier unique

Le dossier doit ressembler à un document de travail institutionnel. Il affiche en priorité :

1. objet et référence ;
2. résultat attendu ;
3. situation actuelle ;
4. prochaine action ;
5. responsable ;
6. canal d’origine et trajet de l’information ;
7. pièces manquantes ;
8. notes et pièces ;
9. historique ;
10. condition de clôture.

Éviter le panneau à douze cartes colorées. Utiliser un en-tête sobre, des sections séparées par des lignes fines et une seule action principale.

## Espace d’action intégré

Lorsqu’un agent clique sur la prochaine action :

- ne pas ouvrir une succession de tiroirs imbriqués ;
- afficher l’action dans le panneau du dossier ou dans un espace latéral cohérent ;
- conserver le contexte du dossier ;
- montrer le résultat attendu de l’action ;
- une fois l’action faite, proposer immédiatement l’étape suivante ;
- une action déjà accomplie ne redevient jamais principale.

Garantie UX :

> Depuis l’ouverture d’un dossier, la prochaine action doit être atteignable en trois interactions maximum.

## Canaux

Afficher clairement, sans simuler de connexion :

- Poste local reconnu ;
- WhatsApp manuel ;
- Téléphone ;
- Agent terrain ;
- Formulaire ;
- Import ;
- Document.

Pour WhatsApp :

- préparer un message ;
- permettre de le copier ;
- marquer l’envoi comme manuel ;
- permettre d’enregistrer le retour reçu.

Pour le téléphone :

- afficher l’appel comme canal d’origine ou de relance ;
- permettre d’ajouter un compte rendu d’appel ;
- enregistrer le prochain rappel ;
- ne jamais prétendre qu’un appel a été passé depuis l’application.

---

# 7. Pilotage : décision Ministère, pas dashboard générique

Créer ou refondre `MinistryPilotageView.tsx`.

Le module Pilotage ne doit plus contenir l’ancienne carte ou les anciennes couches. L’Atlas est l’unique composant cartographique.

## État d’ouverture

Construire une « Situation nationale » sobre avec six indicateurs maximum :

- quais suivis ;
- activité / débarquements du jour ;
- situations nécessitant attention ;
- dossiers en attente de décision ;
- dossiers prêts à clôturer ;
- besoins filière documentés ou montant à instruire.

Chaque indicateur doit mener à une liste filtrée utile, pas à un graphique décoratif.

## Blocs prioritaires

### Situation du jour

Une synthèse narrative courte, fondée sur les données simulées visibles.

### Décisions attendues

Deux ou trois dossiers maximum, avec :

- sujet ;
- territoire ;
- preuve disponible ;
- niveau de confiance ;
- décision attendue ;
- CTA **Ouvrir le dossier**.

### Couverture et confiance

Montrer :

- fraîcheur des informations ;
- couverture des quais ;
- données déclarées / vérifiées / consolidées ;
- source consultable.

### Filière et financement

Un bloc compact présente :

- besoins filière qualifiés ;
- dossiers prêts ;
- montant estimé ;
- reste à instruire ;
- bénéficiaires estimés ;
- CTA vers Dossiers filtré sur **Besoin filière**.

### Documents récents

Rapports, notes et dossiers prêts à partager, avec actions explicites :

- Relire la note ;
- Imprimer le rapport ;
- Ouvrir le dossier source.

Ne pas créer une BI complexe. Les graphiques doivent être rares et répondre à une question décisionnelle.

---

# 8. Couche IA : utile, limitée et honnête

Ajouter une couche d’assistance locale et déterministe, sans API, sans SDK OpenAI, sans clé et sans backend.

Créer par exemple :

`src/lib/mbambulaanAssistant.ts`

Cette couche expose des fonctions pures basées sur les données mockées et les états existants.

## Deux usages seulement

### A. Synthèse du dossier

Produire :

- une synthèse courte ;
- les faits disponibles ;
- les pièces manquantes ;
- la prochaine action suggérée ;
- les sources utilisées.

### B. Projet de note d’arbitrage

Produire :

- objet ;
- faits établis ;
- incertitudes ;
- options ;
- recommandation proposée ;
- sources.

## Règles d’affichage

Toujours afficher :

- **Proposition à valider**
- sources visibles ;
- validation humaine obligatoire ;
- aucune décision automatique.

Ne jamais écrire :

- « l’IA a détecté » ;
- « décision automatique » ;
- « fraude confirmée par l’IA » ;
- « immigration irrégulière détectée ».

Ne pas faire de l’IA une entrée de navigation ou un chatbot générique.

L’architecture doit rester compatible avec une future intégration de fournisseur IA, mais cette V14 ne branche aucun service externe.

---

# 9. Documents et sorties

Réduire les sorties du MVP à trois documents démontrables :

- rapport de situation ou de zone ;
- note d’arbitrage ;
- dossier de besoin filière prêt à partager.

Créer une présentation institutionnelle imprimable et cohérente. Privilégier une vue HTML `print` propre ou le mécanisme d’export déjà présent.

Ne pas investir cette V14 dans :

- export CSV brut ;
- export JSON ;
- gestion avancée des partenaires ;
- signature électronique ;
- transmission externe réelle ;
- génération serveur de PDF si elle impose une architecture lourde.

Chaque document doit rappeler :

- le dossier source ;
- le quai ou territoire ;
- les preuves ;
- le niveau de confiance ;
- la date ;
- le responsable de validation.

---

# 10. Design premium XXL, mais discipliné

Conserver l’identité maritime institutionnelle existante et la rendre plus cohérente.

## Principes

- une action principale par panneau ;
- trois niveaux de hiérarchie typographique maximum ;
- fonds clairs, blanc, bleu profond, cyan/teal mesuré, accent sable/or rare ;
- alertes rouges réservées aux cas réellement critiques ;
- badges neutres et peu nombreux ;
- pictogrammes uniquement lorsqu’ils aident la compréhension ;
- sections documentaires séparées par des lignes fines ;
- grands espaces de respiration autour de la carte ;
- tableaux uniquement pour comparer des données ;
- listes documentaires pour les dossiers ;
- pas de gradients décoratifs excessifs ;
- pas de glassmorphism envahissant ;
- pas de template SaaS générique ;
- pas de Kanban ;
- pas de multiplication de cartes colorées ;
- pas d’animations gadget.

## Boutons

- primaire : prochaine action utile ;
- secondaire : consulter ou ouvrir ;
- tertiaire : copier, imprimer, filtrer ;
- critique : réservé à une action réellement sensible.

Employer des verbes métier :

- Voir dans l’Atlas
- Ouvrir la fiche du quai
- Ouvrir le dossier
- Traiter le prochain dossier
- Demander une vérification
- Préparer le message
- Enregistrer le retour
- Valider la preuve
- Préparer la note
- Clôturer le dossier
- Imprimer le rapport

---

# 11. Architecture de fichiers recommandée

Inspecte l’existant avant de modifier. Adapte cette proposition à la structure réelle.

## À conserver et affiner

- `src/components/private-space/MinistryQuayAtlas.tsx`
- `src/components/private-space/QuayProfileSheet.tsx`
- `src/components/private-space/MinistryDossierExperience.tsx`
- `src/lib/ministryOperationalDossiers.ts`
- `src/data/ministryControlTowerData.ts`
- `src/data/ministryValueJourneyData.ts`

## À créer si cela réduit réellement la complexité

- `src/components/private-space/MinistryDossiersView.tsx`
- `src/components/private-space/MinistryPilotageView.tsx`
- `src/components/private-space/DossierActionFlow.tsx`
- `src/lib/mbambulaanAssistant.ts`

## À refondre

- `src/components/landing/InstitutionalLanding.tsx`
- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryValueWorkflows.tsx`
- `src/components/private-space/MinistryOperationalRegisters.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/app/globals.css`

## À retirer seulement après vérification des usages

- ancienne carte `MapCanvas` ;
- ancien `LayerControl` ;
- anciens panneaux ou boards non utilisés ;
- composants Today/Briefing autonomes devenus inutiles ;
- workflows dupliqués remplacés par les trois chaînes ;
- imports, types et données mortes.

Ne laisse pas deux cartes, deux vues de financement ou deux composants concurrents pour un même dossier.

---

# 12. Acquis V8 à V13 à préserver

Préserver les capacités métier utiles, pas nécessairement leur ancienne présentation :

- machine d’état Kayar ;
- anti-répétition des actions ;
- niveaux de confiance ;
- traçabilité des canaux ;
- notes, pièces et historique ;
- poste ou relais local reconnu ;
- WhatsApp et téléphone manuels ;
- Atlas centré sur les quais ;
- fiche quai ;
- pirogues, débarquements, espèces et volumes ;
- génération de rapport et de note ;
- besoin filière et financement ;
- posture paramétrable après cadrage ;
- design institutionnel premium.

Tu peux supprimer ou refondre un composant V8–V13 si sa capacité utile est conservée ailleurs de manière plus simple.

---

# 13. Parcours Kayar de référence

Le scénario Kayar doit rester jouable de bout en bout.

## Départ

Une situation liée à un écart de pesée est visible dans :

- Pilotage comme priorité ;
- Atlas dans la fiche du quai de Kayar ;
- Dossiers avec le même identifiant.

## Parcours

1. Depuis Pilotage, cliquer **Voir dans l’Atlas**.
2. L’Atlas ouvre ou met en évidence le quai de Kayar.
3. Ouvrir la fiche du quai.
4. Ouvrir la situation d’écart de pesée.
5. Ouvrir le dossier unique.
6. Voir immédiatement : origine, canal, responsable, preuve attendue, prochaine action.
7. Cliquer **Demander une vérification**.
8. Préparer puis copier le message WhatsApp manuel.
9. Enregistrer que la demande a été transmise manuellement.
10. Enregistrer le retour reçu du poste local ou du relais terrain.
11. Ajouter le constat ou la pièce.
12. Valider humainement la preuve.
13. Préparer le rapport ou la note.
14. Relire le document.
15. Enregistrer la décision ou clôturer le dossier.
16. Voir le résultat final et l’historique complet.

## Règles

- Une action accomplie disparaît comme action principale.
- La prochaine action est toujours explicite.
- La condition de clôture est visible.
- Le résultat de chaque action est visible.
- Aucun faux envoi WhatsApp.
- Aucune fausse persistance serveur.
- Aucun changement d’identifiant du dossier entre les modules.

---

# 14. Contraintes techniques

- Rester sur Next.js, React, TypeScript et Tailwind existants.
- Ne pas changer de framework.
- Ne pas ajouter de dépendance cartographique lourde.
- Ne pas ajouter de backend.
- Ne pas intégrer d’API externe.
- Ne pas intégrer OpenAI ou un autre fournisseur IA dans cette V14.
- Ne pas créer de nouvelle authentification.
- Conserver des données mockées structurées et clairement simulées.
- Éviter les fichiers monolithiques ; extraire uniquement si cela clarifie réellement.
- Faire des commits courts et logiques sur la branche existante.
- Ne pas réécrire ou supprimer des changements utilisateur non liés.
- Vérifier chaque fichier après modification.

---

# 15. Critères d’acceptation

La V14 est réussie si :

- la navigation principale contient exactement Atlas, Dossiers, Pilotage ;
- Pilotage est l’état d’ouverture ;
- Briefing et Filière & Financement ne sont plus des espaces autonomes ;
- le quai est le pivot de l’Atlas ;
- le quai ouvre une fiche et non un faux dossier de quai ;
- le cycle pirogue n’est plus un ensemble ambigu de marqueurs ;
- alertes et incidents ne sont plus deux couches concurrentes ;
- la taxonomie Situation distingue statut de traitement et nature qualifiée ;
- un dossier possède une représentation unique partout ;
- l’agent trouve la prochaine action en trois interactions maximum ;
- les dix workflows sont ramenés à trois chaînes compréhensibles ;
- le parcours Kayar est complet et ne régresse pas ;
- le financement passe par le filtre Besoin filière ;
- le Ministère voit les décisions et preuves sans dashboard générique ;
- l’assistance IA se limite à deux usages simulés et affiche Proposition à valider ;
- la landing raconte la même boucle que le produit ;
- aucune promesse de connexion réelle n’est faite ;
- le design est premium, institutionnel et lisible ;
- la console est utilisable sur desktop et acceptable sur mobile ;
- aucun scroll horizontal parasite ;
- aucun composant mort ou ancien écran contradictoire ne reste visible.

---

# 16. Validation obligatoire

Exécuter et corriger jusqu’à réussite :

```bash
npm run typecheck
npm run build
git diff --check
```

Tester manuellement au minimum :

1. `/`
2. `/espace-prive`
3. `/espace-prive/etat`
4. navigation Atlas / Dossiers / Pilotage ;
5. ouverture par défaut sur Pilotage ;
6. CTA Pilotage vers Kayar dans l’Atlas ;
7. fiche quai Kayar ;
8. fiche pirogue ;
9. fiche débarquement ;
10. ouverture du même dossier depuis Atlas, Dossiers et Pilotage ;
11. parcours Kayar complet ;
12. ajout d’une note et d’une pièce simulée ;
13. préparation WhatsApp manuelle ;
14. validation humaine de la preuve ;
15. génération et relecture du rapport ;
16. clôture et résultat final ;
17. filtre Besoin filière ;
18. dossier prêt à partager ;
19. synthèse assistée du dossier ;
20. projet de note d’arbitrage ;
21. affichage mobile et desktop.

---

# 17. Compte rendu final

À la fin, fournir dans la PR :

- résumé produit des changements ;
- fichiers créés, modifiés et supprimés ;
- simplifications réalisées ;
- ancien nombre de workflows et nouveau nombre ;
- résultat du parcours Kayar ;
- résultat de `typecheck`, `build` et `git diff --check` ;
- limites assumées du MVP ;
- éléments à confirmer pendant les ateliers avec le Ministère.

Ne propose pas une V15. Stabilise cette V14.

## Dernière règle

> Si une décision ajoute de la complexité sans renforcer directement Signal → Dossier → Preuve → Décision → Document, ne l’implémente pas.
