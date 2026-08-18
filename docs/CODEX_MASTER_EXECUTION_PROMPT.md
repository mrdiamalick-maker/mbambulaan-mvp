# Codex Master Execution Prompt — Mbàmbulaan

> **Usage :** transmettre ce prompt à Codex avec accès complet au repository `mrdiamalick-maker/mbambulaan-mvp`.
>
> **Objectif :** produire en une itération la convergence produit et le maximum de développement utile, cohérent, testable et documenté, sans réinventer Mbàmbulaan.

---

## 1. Rôle

Tu interviens comme une équipe senior réunissant :

- Chief Product Officer ;
- Principal Software Architect ;
- Staff Full-Stack Engineer ;
- UX/Product Designer ;
- Data Architect ;
- QA Lead ;
- DevOps/SRE ;
- expert des plateformes B2B/B2G multi-acteurs ;
- expert des réalités terrain de la pêche artisanale sénégalaise.

Tu dois raisonner comme un associé responsable du produit final, pas comme un générateur de code exécutant une liste de fonctionnalités.

---

## 2. Repository et branchement

Repository : `mrdiamalick-maker/mbambulaan-mvp`

Avant toute modification :

1. inspecte le repository complet ;
2. identifie la branche de base appropriée ;
3. crée une nouvelle branche dédiée à cette exécution ;
4. n’écris jamais directement sur `main` ;
5. ouvre à la fin une pull request **draft** dédiée ;
6. ne merge rien ;
7. n’active jamais l’auto-merge.

### Contrainte absolue PR #52

La PR #52 doit rester :

- OPEN ;
- DRAFT ;
- NOT READY FOR REVIEW ;
- NOT MERGED ;
- AUTO-MERGE DISABLED.

Tu peux l’analyser. Tu ne dois jamais modifier son statut, sa base, son titre, sa description, ses reviewers, son auto-merge ou son état.

---

## 3. Mission

Transformer le repository actuel en une version beaucoup plus cohérente, navigable, crédible, extensible et proche d’un produit réel.

Tu dois :

- explorer toute la documentation GitHub du plus ancien au plus récent ;
- reconstruire la chronologie des décisions ;
- distinguer les documents normatifs des archives ;
- auditer le code avant de le modifier ;
- supprimer les duplications structurantes ;
- unifier le produit autour d’un domaine partagé ;
- développer le maximum possible en une seule itération ;
- terminer des parcours complets ;
- laisser le repository exécutable, testable et documenté ;
- produire un design exceptionnel, premium, réaliste et distinctif.

Tu ne dois pas réinventer le produit.

---

## 4. Doctrine d’autorité

Lis en priorité et applique :

1. `docs/MBAMBULAAN_PRODUCT_ENGINEERING_DOCTRINE.md` ;
2. les décisions officielles et arbitrages récents ;
3. les audits récents ;
4. `docs/MVP_FREEZE_NOTE.md` pour la séquence immédiate ;
5. le modèle métier, le Product Book et les blueprints ;
6. les issues Lots 1 à 23 pour les capabilities cibles ;
7. les anciens prompts uniquement comme historique.

En cas de contradiction, la doctrine et la décision la plus récente prévalent.

Le `MVP_FREEZE_NOTE` fixe la colonne vertébrale immédiate. Il n’annule pas l’architecture cible des Lots.

---

## 5. Définition du produit

Mbàmbulaan est une infrastructure numérique et un système d’exploitation de coordination pour la pêche artisanale sénégalaise.

Ce n’est pas :

- une marketplace ;
- un ERP ;
- un CRM ;
- un dashboard ;
- une banque ;
- un assureur ;
- un logiciel comptable ;
- un simple site vitrine ;
- une collection d’écrans par persona.

Le produit doit connecter les acteurs, organiser les flux, fiabiliser l’information, améliorer la confiance, soutenir la décision, créer de la valeur pour l’écosystème et permettre une capture de valeur économique durable pour l’entreprise.

---

## 6. Parcours cœur obligatoire

Le parcours de coordination de référence est :

`Signal terrain -> qualification -> tension ou opportunité -> action -> trace opérationnelle -> résultat observable -> rapport`

Sa traduction métier étendue est :

`Pirogue ou acteur terrain -> retour ou signal -> besoin opérationnel -> arrivée -> débarquement -> pesée -> lot -> disponibilité -> besoin ou débouché -> tension ou opportunité -> engagement -> action coordonnée -> trace -> résultat -> lecture de décision`

Ce parcours doit être fonctionnel de bout en bout avec :

- plusieurs rôles ;
- plusieurs états ;
- données cohérentes ;
- exceptions ;
- permissions ;
- traces ;
- niveaux de confiance ;
- résultats ;
- rapport final.

Ne construis pas une simple démo linéaire non réutilisable. Construis le noyau du produit autour de ce parcours.

---

## 7. Priorités d’implémentation

### 7.1 À implémenter profondément

- unification des routes et espaces par persona ;
- modèle métier partagé ;
- workspaces multi-rôles ;
- parcours complet de coordination ;
- persistance minimale réelle ;
- migrations ;
- seeds réalistes ;
- authentification minimale ;
- rôles et autorisations ;
- organisations, territoires, sites et quais ;
- traces opérationnelles ;
- niveaux de confiance ;
- données de démonstration cohérentes ;
- design system consolidé ;
- responsive ;
- accessibilité ;
- tests ;
- documentation.

### 7.2 À implémenter partiellement

- gouvernance des référentiels ;
- supervision opérationnelle ;
- observabilité métier ;
- gestion des incidents et exceptions ;
- mesure de valeur ;
- préparation multi-territoires ;
- organisations clientes et niveaux de service.

### 7.3 À préparer architecturalement

- interopérabilité externe ;
- partenaires tiers ;
- services financiers via partenaires habilités ;
- intelligence collective ;
- souveraineté et réversibilité ;
- expansion territoriale avancée ;
- conformité avancée.

### 7.4 À ne pas développer maintenant

- paiement natif ;
- assurance native ;
- scoring bancaire ;
- marketplace complète ;
- API publique générale ;
- moteur IA complexe ;
- application mobile dédiée ;
- back-office lourd ;
- pricing définitif ;
- intégrations externes réelles non nécessaires au parcours.

---

## 8. Audit obligatoire avant développement

Avant de coder, produis dans ta propre analyse un inventaire de :

- structure des routes ;
- composants dupliqués ;
- modèles métier existants ;
- moteurs métier dans `src/lib` ;
- données mockées ;
- dépendances ;
- tests ;
- migrations éventuelles ;
- branches et travaux non fusionnés pertinents ;
- incohérences documentaires ;
- code mort ;
- parcours incomplets ;
- écrans sans décision ;
- redondances Dashboard / Coordination / Executive.

Ne t’arrête pas à l’analyse. Utilise-la pour exécuter la convergence.

---

## 9. Unification des routes

Le repository contient ou peut contenir des routes concurrentes de type :

- `espaces/*` ;
- `espace-prive/*` ;
- `demo/*` ou `demo/{role}`.

Tu dois converger vers une architecture unique comprenant :

- un espace public ;
- une démo guidée ;
- une application authentifiée ;
- des workspaces dynamiques par rôle, organisation et territoire.

Règles :

- le mode démo réutilise le même domaine et les mêmes composants ;
- aucun rôle ne doit avoir trois versions concurrentes ;
- aucune logique métier ne doit être dupliquée dans les routes ;
- conserve des redirections temporaires si nécessaire pour éviter les liens cassés ;
- documente les routes supprimées, fusionnées ou redirigées.

---

## 10. Domaine métier cible

Utilise ou consolide un modèle partagé autour des entités suivantes, en adaptant aux structures déjà présentes :

- Actor ;
- Organization ;
- Membership ;
- Role ;
- Territory ;
- Site ;
- Quay ;
- Vessel ;
- Signal ;
- ReturnAnnouncement ;
- Arrival ;
- Need ;
- Capacity ;
- Lot ;
- Opportunity ;
- Tension ;
- Commitment ;
- CoordinationAction ;
- Incident ;
- OperationalTrace ;
- TrustSignal ;
- QualityStatus ;
- Decision ;
- Outcome ;
- ReportMetric.

Ne force pas tous les objets s’ils n’apportent aucune valeur immédiate. En revanche, évite les modèles concurrents portant des concepts équivalents.

Chaque objet important doit pouvoir porter, lorsque pertinent :

- source ;
- statut ;
- territoire ;
- auteur ;
- date ;
- niveau de preuve ;
- niveau de fiabilité ;
- historique ;
- organisation concernée.

---

## 11. Persistance, authentification et données

Construis un socle minimal réel sans sur-ingénierie.

Attendus :

- persistance relationnelle adaptée au stack ;
- migrations reproductibles ;
- seed complet et réaliste ;
- données de démo séparées logiquement des données persistées ;
- couche de repository/service ;
- authentification simple ;
- autorisations par rôle ;
- appartenance à une organisation ;
- filtrage par territoire ;
- journalisation des actions significatives.

Ne mets pas de secrets dans le repository.

Si l’environnement ou la stack actuelle rend une technologie particulière risquée, choisis la solution la plus simple compatible avec l’existant et documente le choix.

---

## 12. Moteurs métier

Réutilise et consolide les moteurs existants, notamment :

- coordination ;
- matching ;
- tension ;
- prioritization ;
- trust ;
- quality ;
- traceability ;
- impact.

Règles :

- aucune logique métier essentielle dans les composants React ;
- chaque moteur doit être testable ;
- aucune boîte noire ;
- chaque recommandation expose ses raisons ;
- les scores doivent être expliqués ;
- les limites de données doivent être visibles ;
- les décisions restent humaines.

---

## 13. Workspaces acteurs

Construis des workspaces cohérents pour au minimum :

- administrateur Mbàmbulaan ;
- agent ou animateur terrain ;
- acteur offre ;
- acteur demande ;
- décideur ou partenaire.

Réutilise les rôles métier déjà documentés : pêcheur, capitaine, mareyeur, transformateur, opérateur de glace, transporteur, collectivité, institution, partenaire.

Chaque workspace doit permettre de :

- comprendre la situation ;
- voir les priorités ;
- agir selon le rôle ;
- suivre les engagements ;
- traiter les exceptions ;
- vérifier les traces ;
- voir les conséquences des décisions.

Un workspace est une projection du même domaine, pas un produit séparé.

---

## 14. Expérience et design

Le design doit être exceptionnel, mais jamais décoratif.

Direction :

- premium ;
- contemporaine ;
- sobre ;
- crédible face à un ministère et à un investisseur ;
- adaptée au terrain sénégalais ;
- distinctive sans folklore artificiel ;
- mobile-first pour les usages terrain ;
- desktop puissant pour coordination et décision.

Règles UX :

- aucun dashboard passif ;
- aucun KPI sans contexte ;
- aucune notification sans action ;
- aucune liste sans priorité ;
- chaque écran répond à « que se passe-t-il, que dois-je faire, pourquoi, avec quel niveau de confiance ? » ;
- les états vides expliquent l’action suivante ;
- les erreurs permettent de reprendre ;
- les niveaux de confiance sont visibles ;
- les limites de données sont explicites ;
- les actions critiques ont une confirmation adaptée ;
- les écrans sont accessibles et responsive.

Ne lance pas un nouveau reset visuel total. Consolide, améliore et unifie ce qui existe.

---

## 15. Vues structurantes

Stabilise ou construis :

### Public / Landing

- vision claire ;
- positionnement infrastructure de coordination ;
- valeur par acteur ;
- CTA vers la démo ;
- séparation public / démo / application.

### Démo guidée

- scénario contrôlé ;
- même domaine que l’application ;
- parcours complet ;
- progression visible ;
- résultat final crédible.

### Workspace opérationnel

- entrée contextualisée ;
- priorités ;
- actions ;
- engagements ;
- traces.

### Carte territoriale

- quais, zones, capacités, tensions, alertes ;
- filtres utiles ;
- accès direct aux actions ;
- pas de carte décorative.

### Coordination Center

- file de priorités ;
- responsabilités ;
- statuts ;
- délais ;
- actions ;
- exceptions ;
- fermeture avec trace.

### Executive / Rapport

- situation ;
- tendances ;
- tensions ;
- actions prises ;
- résultats ;
- limites ;
- recommandations ;
- source et fiabilité des indicateurs.

Dashboard, Coordination Center et Executive doivent avoir des missions distinctes.

---

## 16. Exploitation et observabilité

Ajoute un socle utile pour :

- suivre les parcours critiques ;
- identifier les dossiers bloqués ;
- voir les erreurs de données ;
- traiter les incidents ;
- consulter les actions en attente ;
- auditer les modifications ;
- distinguer les erreurs techniques des ruptures de coordination.

Ne construis pas un back-office lourd. Construis uniquement ce qui permet d’exploiter le produit réellement.

---

## 17. Mode dégradé

Prépare un mode réseau dégradé raisonnable :

- états de chargement clairs ;
- cache local pour les données nécessaires ;
- formulaires résilients ;
- sauvegarde brouillon locale si pertinent ;
- file d’actions à synchroniser si la stack le permet sans complexité excessive ;
- indication claire de ce qui est synchronisé ou non.

Ne développe pas un système offline complexe complet.

---

## 18. Modèle économique dans le produit

Ne développe pas de paiement natif.

En revanche, prépare la capacité du produit à démontrer sa valeur économique :

- organisations clientes ;
- territoires servis ;
- niveau de service ;
- capabilities utilisées ;
- actions coordonnées ;
- résultats observables ;
- indicateurs d’usage ;
- coûts ou pertes évités lorsque les données le permettent ;
- rapports de valeur.

Ne suppose jamais que l’utilisateur, le bénéficiaire, le décideur et le payeur sont la même personne.

---

## 19. Tests et qualité

Ajoute ou renforce :

- tests unitaires des moteurs métier ;
- tests des règles de permissions ;
- tests des parcours critiques ;
- tests des migrations ;
- tests des seeds ;
- tests de composants structurants si pertinent ;
- tests d’intégration ou end-to-end sur le parcours cœur si la stack le permet.

Critères obligatoires :

- typecheck réussi ;
- tests réussis ;
- build réussi ;
- migrations applicables sur base vierge ;
- seed exécutable ;
- aucun secret ;
- aucune dépendance injustifiée ;
- aucun écran critique cassé sur mobile ou desktop.

Ne masque jamais un test en échec. Corrige ou documente précisément l’impossibilité.

---

## 20. Documentation attendue

À la fin, mets à jour ou crée :

- architecture actuelle et cible ;
- modèle de domaine ;
- guide de lancement local ;
- variables d’environnement ;
- migrations et seeds ;
- matrice rôles / permissions ;
- routes publiques, démo et privées ;
- moteurs métier ;
- parcours cœur ;
- décisions et arbitrages ;
- limitations connues ;
- ce qui a été reporté ;
- prochaines étapes recommandées.

Ne produis pas une nouvelle série de prompts documentaires redondants.

---

## 21. Stratégie de commits

Produis des commits cohérents par étape, par exemple :

1. audit et documentation de convergence ;
2. domaine partagé ;
3. persistance et migrations ;
4. authentification et permissions ;
5. unification des routes ;
6. parcours cœur ;
7. workspaces ;
8. design system ;
9. exploitation et observabilité ;
10. tests et documentation finale.

Adapte selon l’état réel du repository. Ne crée pas des commits artificiels si cela nuit à la cohérence.

---

## 22. Règles de décision pendant l’itération

Avant chaque ajout, vérifie :

- améliore-t-il la coordination ?
- produit-il une vraie valeur métier ?
- qui utilise ?
- qui bénéficie ?
- qui décide ?
- qui paie ?
- pourquoi paierait-il ?
- quel résultat observable ?
- quelle trace ?
- quelle confiance ?
- est-ce nécessaire maintenant ?
- peut-on réutiliser ou configurer ?
- augmente-t-il le coût d’exploitation ?

Si la réponse est faible, n’ajoute pas.

---

## 23. Interdictions

Tu ne dois pas :

- réinventer Mbàmbulaan ;
- transformer le produit en marketplace ;
- développer un ERP générique ;
- créer un dashboard passif ;
- dupliquer les routes par persona ;
- créer un fork par territoire ;
- introduire une architecture parallèle ;
- implémenter superficiellement tous les Lots ;
- créer des écrans factices ;
- supprimer du code utile sans migration ;
- ajouter des dépendances sans justification ;
- exposer de secrets ;
- modifier le statut de la PR #52 ;
- merger une PR ;
- activer l’auto-merge ;
- déclarer un succès si build ou tests échouent.

---

## 24. Critères de sortie

L’itération est réussie si :

- une seule architecture de routes existe ;
- le domaine métier est partagé ;
- les workspaces utilisent le même noyau ;
- le parcours cœur fonctionne de bout en bout ;
- les données sont persistables et seedées ;
- l’authentification et les permissions minimales fonctionnent ;
- les organisations et territoires sont gérés ;
- chaque action importante produit une trace ;
- les niveaux de confiance sont visibles ;
- la démo et l’application partagent le même produit ;
- le design est cohérent et premium ;
- mobile et desktop sont utilisables ;
- les erreurs et exceptions sont traitées ;
- typecheck, tests et build passent ;
- les migrations fonctionnent sur base vierge ;
- la documentation est à jour ;
- la PR produite est draft ;
- la PR #52 est totalement inchangée.

---

## 25. Rapport final obligatoire

Dans la description de la pull request draft, fournis :

1. résumé exécutif ;
2. diagnostic initial ;
3. architecture retenue ;
4. fonctionnalités livrées ;
5. parcours complets ;
6. routes fusionnées ou redirigées ;
7. modèle de données ;
8. migrations et seeds ;
9. authentification et permissions ;
10. améliorations UX ;
11. tests exécutés avec résultats ;
12. dette supprimée ;
13. dette restante ;
14. éléments préparés mais non activés ;
15. décisions prises ;
16. risques ;
17. prochaines étapes recommandées ;
18. confirmation explicite que la PR #52 n’a pas été modifiée.

---

## 26. Principe final

Comprends avant de proposer.

Consolide avant d’ajouter.

Connecte avant de créer.

Termine avant de disperser.

La question centrale n’est pas :

> Combien de fonctionnalités peux-tu générer ?

La question centrale est :

> Quel maximum de produit cohérent, utile, exploitable, extensible et différenciant peux-tu livrer en une itération, tout en renforçant le noyau de coordination de Mbàmbulaan ?

Exécute maintenant cette mission jusqu’au maximum raisonnablement possible dans l’itération disponible.
