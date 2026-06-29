# Mbàmbulaan Design System v2.0

## 1. Statut du document

Ce document fige le langage visuel officiel de Mbàmbulaan avant toute reprise du développement frontend.

Il complète l'UX cible définie dans `docs/05_UX_INFORMATION_ARCHITECTURE.md`. Il ne remplace pas la vision produit, le Product Book, l'architecture fonctionnelle ou le modèle économique. Il transforme ces références en règles visuelles, composants, templates et critères directement utilisables par une équipe produit, design ou frontend.

Ce document sert à :

- guider l'implémentation premium de l'interface ;
- éviter les dérives vers une marketplace, un ERP ou un dashboard public ;
- garantir une cohérence entre public, démo, privé, admin et data ;
- cadrer les composants, statuts, badges, formulaires et états UX ;
- choisir ou adapter un template premium sans trahir le positionnement ;
- permettre à Codex ou à une équipe frontend d'implémenter sans inventer.

Mbàmbulaan reste un Operating System de coordination pour la pêche artisanale sénégalaise. Le design doit rendre cette promesse visible sans surpromesse, sans gadget et sans exposition publique de la valeur privée.

## 2. Direction artistique

Mbàmbulaan doit évoquer :

- infrastructure ;
- coordination ;
- confiance ;
- territoire ;
- filière ;
- décision ;
- donnée fiable ;
- preuve ;
- Sénégal contemporain ;
- sobriété premium ;
- sérieux institutionnel ;
- efficacité terrain.

L'intention visuelle est celle d'une plateforme structurante : un outil que des organisations, collectivités, partenaires, entreprises et acteurs terrain peuvent prendre au sérieux. Le design doit inspirer l'idée d'un système robuste, mais rester accessible à des utilisateurs non techniciens.

Mbàmbulaan ne doit pas évoquer :

- site associatif amateur ;
- marketplace poisson ;
- ERP administratif ;
- dashboard gadget ;
- template SaaS sans âme ;
- landing startup générique ;
- application publique gratuite ;
- outil de contrôle vertical.

Règle directrice : chaque élément visuel doit aider à comprendre, décider, coordonner, prouver ou convertir.

## 3. Personnalité visuelle

La personnalité visuelle est :

- sobre ;
- premium ;
- claire ;
- institutionnelle ;
- humaine ;
- ancrée terrain ;
- décisionnelle ;
- fiable ;
- moderne ;
- crédible devant un investisseur, une collectivité, une coopérative ou un ministère.

Métaphores visuelles autorisées :

| Métaphore | Traduction UI |
| --- | --- |
| Système nerveux de la filière | Flux, signaux, alertes, décisions reliées |
| Carte vivante | Territoires, quais, tensions, zones d'action |
| Cockpit de coordination | Synthèse, priorités, file d'action, preuves |
| Réseau de confiance | Acteurs, statuts, validations, historique |
| Territoire lisible | Carte, agrégats, niveaux de tension, actions locales |
| Preuve circulante | Badges de preuve, sources, timeline, rapport |

Le rendu doit être professionnel sans devenir froid. Les acteurs terrain doivent sentir que le produit est fait pour leur réalité ; les décideurs doivent sentir qu'il peut structurer une filière.

## 4. Palette couleurs

La palette repose sur un bleu profond identitaire, des surfaces claires respirantes et des couleurs de statut strictement fonctionnelles.

### Couleurs primaires

| Nom | Hex | Usage | Usage interdit | Contraste | Exemple |
| --- | --- | --- | --- | --- | --- |
| Bleu mer profond | `#073B4C` | Identité, titres forts, header premium, fonds institutionnels ponctuels | Fond global permanent, badges d'alerte | Très fort avec blanc | Hero public, bandeau executive |
| Bleu coordination | `#0B6E8F` | CTA principal, lien actif, élément sélectionné, action de coordination | Statut succès ou risque | Fort avec blanc, bon sur fond clair | Bouton Demander une démo |
| Bleu information | `#E7F5FA` | Fonds informatifs, panneaux de contexte, cartes de démo | CTA principal, texte long blanc | Lisible avec bleu profond | Encadré données simulées |

### Couleurs secondaires et fonctionnelles

| Nom | Hex | Usage | Usage interdit | Contraste | Exemple |
| --- | --- | --- | --- | --- | --- |
| Sable clair | `#F5E8C7` | Accent territorial, séparation douce, contexte Sénégal sans cliché | Fond dominant beige, CTA critique | Moyen avec texte profond | Bloc territoire pilote |
| Écume / blanc cassé | `#F8FBFA` | Fond global, surfaces publiques, respiration | Texte, badge, alerte | Très bon avec texte profond | Background page |
| Vert confiance | `#168A5B` | Succès, validation, confiance élevée, action confirmée | Décoration gratuite | Fort avec blanc | Badge validé |
| Orange alerte | `#D97706` | Attention, tension surveillée, action à traiter | CTA commercial permanent | Fort avec blanc, meilleur avec fond clair | Badge tension forte |
| Rouge risque | `#C2410C` | Risque, tension critique, erreur bloquante | Décoration, illustration | Fort avec blanc | Alerte critique |
| Gris texte | `#1F2933` | Texte principal, titres, données | Fond coloré | Très fort sur fond clair | Corps et titres métier |
| Gris bordure | `#D7DEE5` | Bordures, tableaux, séparation | Texte faible | Neutre | Cartes, champs |
| Gris fond | `#EEF3F6` | Fond de zones secondaires, admin, panneaux | Fond unique de landing premium | Bon avec texte profond | Section dense |

Règles d'usage :

- Le bleu mer profond porte l'identité, mais ne doit pas noircir tout le produit.
- Le fond global reste clair, respirant et lisible.
- Les blocs sombres sont rares : hero, executive, citation forte, synthèse institutionnelle.
- Les textes blancs sur fond coloré doivent être courts et très lisibles.
- Les couleurs d'alerte servent seulement les statuts, risques et priorités.
- Un statut n'est jamais communiqué par la couleur seule : texte, icône ou label obligatoire.
- Le produit ne doit jamais devenir monochrome bleu ni palette arc-en-ciel.

## 5. Typographie

Aucune dépendance typographique externe n'est obligatoire. La hiérarchie peut reposer sur des polices système robustes.

Police principale recommandée : `Inter`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, sans-serif.

Police système de secours : `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif.

| Niveau | Taille desktop | Taille mobile | Usage | Règle |
| --- | --- | --- | --- | --- |
| H1 public | 56-64 | 36-42 | Landing, promesse forte | Court, concret, jamais technique |
| H1 produit | 36-44 | 28-34 | Démo, executive, territoire | Une mission claire par page |
| H2 | 28-34 | 24-28 | Section majeure | Introduit une décision ou une valeur |
| H3 | 22-26 | 20-22 | Sous-section, bloc important | Titre compact |
| H4 | 18-20 | 17-19 | Carte, panneau, tableau | Direct et lisible |
| H5/H6 | 14-16 | 14-16 | Labels structurants | Éviter la surcharge |
| Paragraphe | 16-18 | 15-16 | Texte métier | 2 à 4 lignes maximum dans l'interface |
| Label | 12-14 | 12-14 | Champ, filtre, badge | Stable, explicite |
| Microcopy | 12-13 | 12-13 | Aide, source, limite | Toujours utile |
| Chiffres / KPI | 32-48 | 28-36 | Valeur principale | Unité visible, sens explicite |
| Badges | 12-13 | 12-13 | Statut | Pas plus de 3 mots si possible |
| Boutons | 14-16 | 14-16 | Action | Verbe d'action clair |
| Tableaux | 13-15 | 13-14 | Comparaison | Troncature contrôlée, unité visible |

Règles typographiques :

- Les titres sont courts et forts.
- Les paragraphes sont courts, actifs et métier.
- Les textes longs appartiennent aux documents, pas aux écrans opérationnels.
- Les KPI doivent toujours avoir une unité, une source ou une limite.
- Les mots `estimé`, `simulé`, `validé`, `déclaratif` doivent rester visibles quand ils cadrent la preuve.
- Éviter le style corporate froid : les phrases doivent rester humaines et concrètes.

## 6. Grille et layout

| Élément | Valeur cible | Usage |
| --- | --- | --- |
| Largeur maximale public | 1180 à 1240 px | Landing, pages publiques |
| Largeur maximale produit | 1280 à 1440 px | Démo, territoire, executive, workspace |
| Conteneur admin | 1440 px et plus | Tables et panneaux denses |
| Marges desktop | 32 à 48 px | Respiration latérale |
| Marges mobile | 16 px | Lisibilité terrain |
| Gutter desktop | 24 px | Grilles 12 colonnes |
| Gutter mobile | 16 px | Une colonne principale |
| Breakpoint mobile | < 768 px | Navigation simplifiée |
| Breakpoint tablet | 768-1024 px | Deux colonnes maximum |
| Breakpoint desktop | > 1024 px | Grilles comparatives |

Layouts à cadrer :

| Layout | Structure | Règle |
| --- | --- | --- |
| Landing teaser | Hero, problème, transformation, aperçus, preuve, CTA | Ne pas dévoiler tout le produit |
| Page démo | Contexte, scénario, étapes, preuves, valeur, CTA | Narration guidée, pas tableau brut |
| Territoire pilote | Hero territoire, tension, flux, acteurs, preuves, synthèse | Cockpit narratif premium |
| Page métier | Résumé, filtres, liste, détail, action | Une action principale visible |
| Executive | Décision, KPI, risques, preuves, rapport | Compréhension en 60 secondes |
| Espace privé | Contexte acteur, priorités, actions, données autorisées | Valeur achetée, pas teaser |
| Admin | Tables, validations, audit, actions sensibles | Dense, gouverné, contrôlé |

## 7. Espacements

| Valeur | Usage |
| --- | --- |
| 4 px | Icône + texte, micro-séparation, détails de badge |
| 8 px | Badges, petits groupes, lignes compactes |
| 12 px | Champs, filtres, cartes compactes |
| 16 px | Padding mobile, carte simple, bouton |
| 24 px | Gap standard entre cartes liées |
| 32 px | Séparation de blocs dans une page métier |
| 48 px | Séparation de sections fortes |
| 64 px | Sections landing, executive, démo narrative |
| 96 px | Hero ou transition majeure, usage rare |

Règles :

- Entre cards : 16 px mobile, 24 px desktop.
- Dans les cards : 16 à 24 px selon densité.
- Entre sections : 48 px minimum sur desktop, 32 px sur mobile.
- Dans un hero : 64 à 96 px selon hauteur, avec contenu concis.
- Dans les tableaux : densité contrôlée, hauteur de ligne 40 à 48 px.
- Sur mobile : réduire les marges, pas la lisibilité.

## 8. Rayons, bordures, ombres

| Élément | Règle |
| --- | --- |
| Radius standard | 8 px |
| Cards | 8 à 12 px selon importance |
| Boutons | 8 px |
| Badges | 999 px uniquement pour petits labels |
| Champs | 8 px |
| Modales / drawers | 12 px |
| Bordures | 1 px, gris bordure ou teinte très légère |
| Ombre légère | Pour cartes interactives ou panneaux superposés |
| Ombre premium | Rare, douce, floue, jamais dramatique |
| Ombres interdites | Ombres lourdes, néon, cartes flottantes partout, relief cartoon |

Le rendu doit être premium, pas cartoon. Les bordures doivent souvent remplacer les ombres pour garder un produit sobre.

## 9. Iconographie

Style : icônes linéaires, simples, géométriques, lisibles à petite taille. Stroke recommandé : 1.75 à 2 px. Tailles : 16 px inline, 20 px bouton, 24 px carte, 32 px bloc vide.

Couleur par défaut : gris texte ou bleu mer profond. Les couleurs statut ne s'appliquent que si l'icône porte un statut réel.

Icônes métier à prévoir :

| Concept | Usage | Interdit |
| --- | --- | --- |
| Signal | Remontée terrain, événement | Décoration abstraite |
| Quai | Territoire, débarquement | Icône de port touristique |
| Territoire | Carte, zone, pilotage | Carte décorative sans action |
| Acteur | Personne ou rôle | Avatar caricatural |
| Organisation | GIE, institution, entreprise | Logo générique trop corporate |
| Besoin | Demande structurée | Panier e-commerce |
| Opportunité | Mise en relation | Icône achat pur |
| Preuve | Source, validation, historique | Sceau officiel non justifié |
| Confiance | Score, réputation | Certification abusive |
| Qualité | Lot sensible, fraîcheur | Label sanitaire officiel non validé |
| Action | File, priorité | Bouton vague |
| Rapport | Synthèse, export | Document administratif lourd |
| Alerte | Risque ou tension | Sirène décorative |
| Coordination | Flux, orchestration | Réseau trop abstrait |
| Donnée | Source, référentiel | Base de données froide |
| Décision | Arbitrage, priorité | Icône magie |
| Programme | Projet, ONG, territoire | Badge financement confus |
| Entreprise | Acheteur, partenaire | Marketplace |
| Institution | État, collectivité | Contrôle vertical |

## 10. Ton visuel par espace

| Espace | Ton | Densité | Composants dominants | Erreurs à éviter |
| --- | --- | --- | --- | --- |
| Public | Teaser, premium, aspirationnel, crédible | Faible à moyenne | Hero, cartes valeur, aperçus contrôlés, CTA | Montrer tout le produit, faire freemium |
| Démo | Guidé, narratif, clair, rassurant | Moyenne | Stepper, timeline, cards scénario, preuves | Copier l'espace privé réel |
| Privé | Actionnable, efficace, contextualisé | Moyenne à élevée | Résumé, file d'action, listes, détails, badges | Trop de storytelling, pas assez d'action |
| Admin | Dense, contrôlé, sérieux, gouverné | Élevée | Tables, filtres, audit, validation, logs | Design marketing, actions non sécurisées |
| Executive | Institutionnel, synthétique, décisionnel | Moyenne | KPI, risques, preuves, décisions, rapport | Trop de détails bruts |
| Terrain | Simple, mobile, concret, lisible | Faible à moyenne | Cards, grands CTA, statut, confirmation | Formulaire long, jargon, tableau dense |

## 11. Composants principaux

Chaque composant doit afficher uniquement ce qui aide à comprendre, agir, décider ou prouver. Les variantes doivent rester limitées.

| # | Composant | Usage | Structure | Variantes | États | Données affichées | Exemple de contenu | Erreurs à éviter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Header public | Orienter et convertir | Logo, nav courte, CTA démo/devis | Transparent, clair, compact mobile | Normal, sticky, menu mobile | Pages publiques | Demander une démo | Menu long, accès privé trop visible |
| 2 | Header démo | Guider le scénario | Logo, titre démo, profil, CTA retour/contact | Profil, territoire, executive | Étape active, retour | Profil démo, limite donnée | Démo Collectivité | Navigation produit complète |
| 3 | Header privé | Travailler vite | Logo, espace, recherche, notifications, profil | Role-based, admin, terrain | Connecté, alerte, mobile | Rôle, notifications | Espace Mareyeur | Trop de liens publics |
| 4 | Footer public | Crédibilité et conversion | Liens, contact, vision, mentions | Court, institutionnel | Standard | Contacts, pages clés | Demander un rendez-vous | Footer annuaire géant |
| 5 | Hero premium | Installer la promesse | H1, sous-titre, deux CTA, visuel contrôlé | Public, démo, territoire | Chargé, prêt | Promesse, segment | Coordonner la filière | Capture complète produit |
| 6 | CTA principal | Déclencher action majeure | Verbe + objet | Plein, icône optionnelle | Hover, focus, disabled, loading | Action | Demander une démo | Deux CTA principaux concurrents |
| 7 | CTA secondaire | Explorer sans convertir | Texte, bordure | Ghost, outline | Hover, focus | Navigation douce | Découvrir la vision | Même poids que principal |
| 8 | Segment selector | Choisir profil | Boutons segments | Cards, tabs | Actif, disabled | Profil, besoin | Collectivité | Trop de segments visibles |
| 9 | Demo profile card | Présenter une démo | Profil, problème, valeur, CTA | Institution, terrain, entreprise | Hover, actif | Segment, promesse | Démo État | Montrer modules privés |
| 10 | Demo stepper | Montrer progression | Étapes, statut, lien | Horizontal, vertical | Active, done, locked | Étape, module | Signal -> preuve | Étapes trop nombreuses |
| 11 | Product card | Capacité produit | Titre, bénéfice, preuve | Public, privé | Hover | Capacité | Qualifier un signal | Feature list générique |
| 12 | KPI card | Décision chiffrée | Valeur, label, contexte, source | Compact, executive, dashboard | Normal, alert, estimated | KPI, unité, limite | 42 lots suivis | Chiffre sans décision |
| 13 | Signal card | Remontée terrain | Source, territoire, statut, action | Terrain, admin, démo | Nouveau, qualifié, contesté | Acteur, date, preuve | Signal Joal 08:15 | Confondre signal et vérité |
| 14 | Need card | Besoin structuré | Espèce, volume, quai, urgence, statut | Compact, détaillé | Ouvert, couvert, critique | Demande, délai | Besoin 600 kg | Style panier d'achat |
| 15 | Opportunity card | Mise en relation | Offre, besoin, score, raison, action | Liste, détail | Nouvelle, proposée, réservée | Score, acteurs, preuve | Compatibilité 92 % | Réduire à acheter/réserver |
| 16 | Territory card | Synthèse zone | Quai, tension, volume, action | Public aperçu, privé | Faible à critique | Tension, signal, action | Joal sous tension | Carte décorative |
| 17 | Territory map panel | Lire le territoire | Carte, légende, panneau détail | Démo, privé, executive | Point actif, filtré | Quais, tensions | Petite-Côte | Google-like inutile |
| 18 | Action queue | Prioriser | Liste actions, niveau, responsable | Privé, admin, coordination | Ouverte, en cours, bloquée | Priorité, échéance | Mobiliser acheteur | Liste sans owner |
| 19 | Proof badge | Qualifier preuve | Label + aide | Déclaratif, estimé, validé, système, audité | Normal, info | Niveau preuve | Donnée estimée | Audité sans audit |
| 20 | Trust badge | Confiance acteur | Label + score optionnel | Élevée, moyenne, à vérifier | Normal, warning | Score, raison | Confiance moyenne | Certification abusive |
| 21 | Quality badge | Qualité lot | Niveau + action | Déclarée, vérifiée, sensible | Normal, risk | Qualité, risque | Lot sensible | Promesse sanitaire officielle |
| 22 | Status badge | Statut générique | Label court | Info, success, warning, risk | Normal | Statut | En cours | Badge décoratif |
| 23 | Alert card | Risque/action | Niveau, titre, description, CTA | Info, attention, critique | Nouvelle, traitée | Alerte, zone | Tension forte Kayar | Alertes partout |
| 24 | Timeline | Traçabilité | Événements datés | Vertical, compact | Done, current, pending | Date, action, preuve | Lot déclaré -> suivi | Événements sans source |
| 25 | Decision summary | Aider à décider | Contexte, recommandation, risque, preuve | Executive, coordination | Normal, critique | Décision, raison | Prioriser Joal | Texte trop long |
| 26 | Executive panel | Lire vite | KPI, risques, décisions | Institution, investisseur | Normal, attention | Agrégats, limites | Synthèse 60 secondes | Tableau brut |
| 27 | Report card | Rapport prêt | Titre, période, statut, CTA | Brouillon, prêt | Loading, ready | Rapport, source | Rapport territoire | Export non justifié |
| 28 | Actor card | Acteur | Nom, rôle, zone, confiance | Terrain, admin | Actif, à vérifier | Rôle, score | Mareyeur Joal | Données sensibles publiques |
| 29 | Organization card | Organisation | Nom, type, territoire, statut | Client, partenaire | Validée, pilote | Organisation, accès | GIE Petite-Côte | Logo décoratif |
| 30 | Empty state | Guider sans données | Icône, titre, cause, prochaine action | Public, privé, admin | Empty, no access | Cause | Aucun signal qualifié | Écran vide sans action |
| 31 | Form field | Saisie fiable | Label, aide, input, erreur | Text, number, date | Focus, error, disabled | Valeur, unité | Quantité en kg | Placeholder comme label |
| 32 | Form select | Choix contrôlé | Label, options, aide | Simple, searchable | Open, selected, error | Option | Niveau de preuve | Liste incohérente |
| 33 | Modal | Action courte | Titre, contenu, actions | Confirm, form | Open, loading, success | Décision | Confirmer action | Flux long en modal |
| 34 | Drawer | Détail contextuel | Header, sections, CTA | Right, bottom mobile | Open, loading | Détail | Détail quai | Remplacer une page majeure |
| 35 | Table | Comparer | Colonnes, tri, statut, action | Standard, admin, compact | Loading, empty | Données denses | Acteurs à valider | Tableaux sur mobile terrain |
| 36 | Filter bar | Réduire liste | Recherche, filtres, reset | Chips, selects | Active, empty | Critères | Quai, statut | Filtres plus lourds que la liste |
| 37 | Page summary | Donner contexte | Titre, intro, KPI, action | Public, privé | Normal | Mission page | Ce qu'il faut regarder | Long manifeste |
| 38 | Workspace header | Cadrer espace | Rôle, priorités, notifications | Terrain, institution | Normal, alert | Profil, contexte | Espace Collectivité | Header marketing |
| 39 | Admin audit row | Gouvernance | Événement, acteur, date, preuve | Compact, détaillé | Flagged, resolved | Log, source | Donnée corrigée | Audit invisible |
| 40 | Route guard message | Protéger valeur | Message, raison, CTA | Public, private, admin | Denied, demo only | Raison accès | Démo sur demande | Page 404 brutale |

## 12. Badges et statuts

### Preuve

| Texte | Couleur | Usage | Limite | Message d'aide |
| --- | --- | --- | --- | --- |
| Déclaratif | Bleu information | Donnée transmise par un acteur | Pas une validation | Transmis par un acteur, à qualifier si nécessaire |
| Estimé | Sable clair | Calcul, synthèse indicative, impact simulé | Pas officiel | Calcul indicatif basé sur données disponibles |
| Validé | Vert confiance | Validation humaine ou terrain simulée | Pas audit institutionnel | Vérifié dans le cadre du pilote ou de la démo |
| Système | Bleu coordination clair | Généré localement par l'application | Pas source externe | Produit automatiquement par Mbàmbulaan |
| Audité | Bleu mer profond | Audit réel, preuve institutionnelle formalisée | Rare, interdit en mock simple | Preuve formalisée par un cadre d'audit identifié |

### Qualité

| Texte | Couleur | Usage | Limite | Message d'aide |
| --- | --- | --- | --- | --- |
| Non renseignée | Gris fond | Qualité absente | Demande qualification | Qualité à compléter |
| Déclarée | Bleu information | Qualité annoncée par acteur | À vérifier | Information déclarative |
| Estimée | Sable clair | Qualité calculée ou inférée | Indicatif | Estimation locale |
| Vérifiée | Vert confiance | Contrôle simulé ou humain | Pas certification officielle | Qualité vérifiée dans le cadre indiqué |
| Contestée | Orange alerte | Désaccord ou incohérence | Action requise | Donnée à clarifier |
| Sensible | Orange alerte | Lot à traiter vite | Pas encore perte | Action recommandée |
| À risque | Rouge risque | Risque de perte ou qualité dégradée | Priorité forte | Coordination urgente recommandée |

### Tension

| Texte | Couleur | Usage | Limite | Message d'aide |
| --- | --- | --- | --- | --- |
| Faible | Vert confiance | Offre et demande équilibrées | Surveillance légère | Situation stable |
| Surveillée | Sable clair | Déséquilibre léger | Pas urgence | À suivre dans la journée |
| Forte | Orange alerte | Déséquilibre opérationnel | Action recommandée | Coordination locale souhaitable |
| Critique | Rouge risque | Risque élevé ou besoin non couvert | Intervention prioritaire | Action immédiate recommandée |

### Confiance

| Texte | Couleur | Usage | Limite | Message d'aide |
| --- | --- | --- | --- | --- |
| Confiance élevée | Vert confiance | Historique solide | Pas garantie absolue | Acteur prioritaire selon signaux disponibles |
| Confiance moyenne | Sable clair | Profil utilisable mais à suivre | Vérification utile | Quelques points à confirmer |
| Confiance à vérifier | Orange alerte | Profil incomplet ou risque | Ne pas bloquer sans raison | Vérification recommandée avant action |

### Action

| Texte | Couleur | Usage | Limite | Message d'aide |
| --- | --- | --- | --- | --- |
| Ouverte | Bleu information | Action créée | Pas encore prise en charge | Action disponible |
| En cours | Bleu coordination | Action active | Suivi nécessaire | Coordination en cours |
| À traiter | Orange alerte | Priorité opérationnelle | Ne pas multiplier | Action attendue |
| Clôturée | Vert confiance | Action terminée | Garder preuve | Action finalisée |
| Bloquée | Rouge risque | Empêchement | Expliquer cause | Intervention nécessaire |

## 13. Templates de pages

### Template Landing Teaser Premium

Sections : Hero, Problème filière, Transformation, Pour qui, Ce que Mbàmbulaan rend possible, Aperçu contrôlé, Preuve de sérieux, CTA démo/devis.

Règle : la landing vend la transformation, pas l'inventaire complet du produit.

### Template Hub Démo

Sections : choix de profil, promesse de démo personnalisée, cartes segments, limites des données de démo, CTA vers démo personnalisée.

Règle : le hub démo est un sas de projection, pas un menu de modules.

### Template Démo Personnalisée

Sections : contexte de l'acteur, problème spécifique, scénario simulé, données visibles, décisions possibles, preuves, valeur livrée, limites, CTA commercial.

Règle : une démo montre uniquement ce que le segment doit comprendre pour avancer.

### Template Territoire Pilote

Sections : hero territoire, pourquoi ce territoire, valeur pilote, flux démontrable, acteurs, preuves, synthèse, actions suivantes.

Règle : plus proche d'un cockpit narratif premium que d'un dashboard.

### Template Page Métier

Sections : résumé, filtre, liste, détail, action principale, preuve / statut.

Règle : l'utilisateur doit comprendre quoi faire ensuite.

### Template Executive

Sections : résumé décisionnel, KPI, tensions, actions, preuves, limites, CTA rapport.

Règle : un décideur comprend en moins de 60 secondes.

### Template Espace Privé

Sections : contexte acteur, priorités, actions, données autorisées, notifications, preuves, prochain pas.

Règle : l'espace privé montre la valeur achetée et utilisée.

### Template Admin

Sections : anomalies, validations, données, acteurs, audit, actions sensibles.

Règle : l'admin gouverne le système, il ne vend pas la promesse.

## 14. Landing publique - spécification visuelle

Above the fold :

- logo simple, lisible, posé ;
- navigation courte : Vision, Solutions, Cas d'usage, Impact, Contact ;
- H1 fort : Mbàmbulaan coordonne la pêche artisanale, du signal terrain à la décision ;
- sous-titre court : une plateforme pour relier acteurs, territoires, besoins, preuves et impact ;
- CTA principal : Demander une démo ;
- CTA secondaire : Découvrir la vision ;
- visuel contrôlé du produit : carte stylisée, flux, preuve, synthèse, jamais capture complète.

Sections suivantes :

- problème filière : fragmentation, perte d'information, décision difficile ;
- transformation : signal -> qualification -> coordination -> preuve -> rapport ;
- acteurs : collectivités, organisations, entreprises, institutions, terrain ;
- territoire : exemple Joal / Petite-Côte sans données sensibles ;
- confiance : sources, limites, preuves, partenaires futurs ;
- démo : choisir un profil ;
- CTA final : demander démo ou devis.

Interdits :

- montrer toutes les fonctionnalités ;
- ouvrir des pages métier en public ;
- donner impression freemium ;
- faire e-commerce ;
- lister tous les modules ;
- promettre données officielles ou temps réel sans preuve.

## 15. Démo personnalisée - spécification visuelle

Toutes les démos doivent afficher un bandeau clair : données simulées, projection personnalisée, pas espace réel.

| Page | Ton visuel | Composants | Sections | CTA final | Données cachées | Preuve visible |
| --- | --- | --- | --- | --- | --- | --- |
| Hub démo | Choix clair et premium | Segment selector, profile cards | Profil, promesse, limites | Choisir une démo | Produit réel | Mention données simulées |
| État | Institutionnel | Executive panel, map panel, KPI | Tensions, impact, priorités | Demander échange | Nominatifs | Sources et limites |
| Collectivité | Territorial | Territory card, map, action queue | Quais, tension, action | Lancer pilote | Données privées | Signal, action, synthèse |
| ONG | Impact prudent | KPI, report card, timeline | Bénéficiaires, actions, indicateurs | Cadrer programme | Données personnelles | Impact estimé |
| Entreprise | Supply intelligence | Need card, opportunity card, quality badge | Besoin, lots, risques | Demander devis | Stock garanti | Qualité estimée |
| Exportateur | Traçabilité | Timeline, proof badge, quality badge | Lot, historique, qualité | Cadrer traçabilité | Certification officielle | Historique simulé |
| Acteur terrain | Simple, mobile | Signal card, need card, CTA | Déclarer, suivre, recevoir retour | Tester pilote | Admin | Confirmation et statut |
| Investisseur | Vision + traction | KPI, executive panel, report card | Modèle, marché, risques | Demander data room | Données confidentielles | Documents source |
| Partenaire technique | Gouvernance data | Table, audit row, route guard | Référentiels, droits, intégrations | Atelier technique | API réelle | Logs simulés |

## 16. Territoire pilote - spécification visuelle

La page `/territoire-pilote` doit montrer Joal / Petite-Côte comme un espace de coordination lisible.

Elle doit afficher :

- pourquoi Joal / Petite-Côte est pertinent ;
- le signal terrain initial ;
- la tension ou le besoin associé ;
- l'action coordonnée ;
- les acteurs mobilisés ;
- la preuve conservée ;
- la synthèse territoriale ;
- la valeur locale ;
- la valeur future pour Mbàmbulaan.

Structure recommandée :

1. Hero territoire : nom, promesse, contexte.
2. Carte ou panneau territorial : quais, tension, légende.
3. Flux démontrable : signal -> qualification -> action -> preuve -> synthèse.
4. Valeur pilote : collectivité, organisation locale, partenaire, Mbàmbulaan.
5. Preuves et limites : niveaux de preuve, données simulées.
6. Prochain pas : cadrer pilote, demander échange, voir executive.

Règle : la page doit être plus proche d'un cockpit narratif premium que d'un tableau de bord.

## 17. Executive - spécification visuelle

La page `/executive` doit aider un décideur à comprendre rapidement : ce qui se passe, pourquoi c'est important, quelles actions prioriser et quelles limites garder en tête.

Elle doit montrer :

- décision principale recommandée ;
- impact estimé ;
- limites de preuve ;
- tensions ;
- risques ;
- actions prioritaires ;
- synthèse de preuve ;
- rapport ou prochaine réunion.

Règles :

- compréhension en moins de 60 secondes ;
- un résumé avant les détails ;
- aucun tableau brut en première lecture ;
- KPI reliés à une décision ;
- limites visibles pour éviter la surpromesse.

## 18. Pages métier - spécification visuelle

| Page | Hiérarchie | CTA | Card principale | Données à montrer | Données à cacher | État vide | Erreur à éviter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Arrivages | Résumé, signaux, lots, qualité | Déclarer ou qualifier un signal | Signal card | Espèce, quai, statut, preuve, qualité | Contacts privés | Expliquer comment déclarer | Faire un catalogue public |
| Besoins | Résumé, urgence, couverture | Publier un besoin | Need card | Espèce, quantité, urgence, zone | Conditions commerciales privées | Guider publication | Style panier e-commerce |
| Opportunités | Résumé, recommandations, preuves | Consulter / coordonner | Opportunity card | Score, raison, acteurs, preuve | Contacts non autorisés | Expliquer absence de match | Réduire à réserver |
| Opportunité détail | Décision, matching, qualité, trace | Coordonner action | Decision summary | Offre, besoin, score, historique | Données sensibles tiers | Retour liste + raison | CTA achat dominant |
| Coordination | Priorités, alertes, actions | Traiter action | Action queue | Actions, tensions, preuves | Configuration admin | Proposer premier signal | Panneau gadget |
| Rapports | Synthèses, périodes, preuves | Générer rapport | Report card | KPI, limites, sources | Données nominatives | Expliquer conditions | Rapport sans source |

## 19. Formulaires

| Formulaire | Champs | Ordre | Validation | Succès | Erreur | Microcopy | Données sensibles à éviter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Demande de démo | Nom, organisation, rôle, email/téléphone, segment, objectif | Identité -> besoin -> contact | Email ou téléphone requis | Demande reçue, réponse prochaine | Champ manquant ou format invalide | Démo personnalisée selon votre profil | Données opérationnelles détaillées |
| Demande de devis | Organisation, territoire, type acteur, besoin, volume estimé, échéance, contact | Organisation -> besoin -> contexte -> contact | Contact + besoin requis | Proposition à cadrer | Besoin trop vague | Aucun prix automatique sans échange | Budget sensible optionnel |
| Contact | Nom, message, contact | Simple | Message + contact | Message envoyé | Message trop court | Réponse par l'équipe Mbàmbulaan | Données personnelles inutiles |
| Déclaration signal | Espèce, quai, quantité, heure, source, preuve | Signal -> quantité -> source | Espèce, quai, quantité requis | Signal enregistré | Donnée incohérente | Donnée déclarative à qualifier | Identité publique non nécessaire |
| Publication besoin | Espèce, quantité, zone, urgence, délai, commentaire | Besoin -> urgence -> délai | Espèce, quantité, zone requis | Besoin publié | Quantité invalide | Le besoin peut générer une opportunité | Conditions commerciales sensibles |
| Qualification donnée | Niveau preuve, commentaire, responsable, statut | Statut -> preuve -> note | Niveau preuve requis | Donnée qualifiée | Niveau incohérent | La preuve indique la limite d'usage | Faux audit |

## 20. États UX/UI

| État | UI recommandée | Message |
| --- | --- | --- |
| Loading | Skeleton clair, pas spinner seul | Chargement des données disponibles |
| Empty | Empty state avec cause et action | Aucun signal qualifié pour ce filtre |
| Error | Bloc rouge sobre avec action de retour | Impossible d'afficher cette donnée |
| Success | Toast ou bandeau vert court | Action enregistrée |
| Access denied | Route guard message | Cet espace est réservé aux acteurs autorisés |
| Demo data | Badge et bandeau démo | Données simulées pour démonstration |
| Estimated data | Proof badge estimé | Calcul indicatif, non officiel |
| No proof | Badge gris + explication | Preuve non renseignée |
| No opportunity | Empty state métier | Aucune correspondance exploitable pour le moment |
| Action pending | Badge orange + file d'action | Action à traiter |
| Report ready | Report card prêt | Synthèse prête à partager |
| High tension | Alerte critique | Tension forte détectée, action recommandée |

## 21. Responsive

| Sujet | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Navigation | Header ou sidebar selon espace | Header + menus courts | Menu compact, CTA unique |
| Cards | Grilles 2 à 4 colonnes | 2 colonnes maximum | 1 colonne, action visible |
| Timeline | Verticale ou horizontale selon récit | Verticale compacte | Verticale, labels courts |
| Tables | Tri, filtres, colonnes utiles | Colonnes réduites | Transformer en cards ou lignes extensibles |
| Cartes territoriales | Carte + panneau latéral | Carte + panneau dessous | Carte simplifiée + liste |
| Formulaires | Deux colonnes si utile | Une ou deux colonnes | Une colonne, champs courts |
| CTA | Principal + secondaire | Principal visible | Une action principale sticky si nécessaire |

Règle mobile : préserver la décision. Si tout ne tient pas, cacher les détails secondaires, jamais l'action principale, le statut ou la preuve.

## 22. Accessibilité

Exigences :

- contraste suffisant pour texte, badges, boutons et cartes ;
- focus visible sur tous les éléments interactifs ;
- labels explicites pour chaque champ ;
- taille de texte lisible sur mobile ;
- futurs aria labels sur boutons iconiques, menus, modales, cartes interactives ;
- ne jamais utiliser la couleur seule pour un statut ;
- navigation clavier possible dans menus, formulaires, modales et tableaux ;
- langage simple, phrases courtes, unités visibles ;
- messages d'erreur utiles et non culpabilisants ;
- pas de texte critique dans des images.

## 23. Règles de contenu interface

Ton : clair, sobre, concret, utile, non publicitaire.

Longueur :

- H1 : 5 à 10 mots si possible ;
- H2 : 4 à 8 mots ;
- paragraphes UI : 1 à 3 phrases ;
- CTA : verbe + objet ;
- messages d'erreur : cause + action ;
- microcopy : une phrase courte.

Termes préférés :

- coordination ;
- signal ;
- preuve ;
- territoire ;
- décision ;
- action ;
- donnée qualifiée ;
- partenaire ;
- pilote ;
- valeur.

Termes interdits ou prudents :

- marketplace ;
- dashboard complet ;
- certification ;
- audit ;
- IA magique ;
- données officielles ;
- temps réel si ce n'est pas vrai.

CTA recommandés :

- Demander une démo ;
- Demander un devis ;
- Voir le scénario ;
- Cadrer un pilote ;
- Qualifier le signal ;
- Coordonner l'action ;
- Consulter la preuve ;
- Générer une synthèse.

## 24. Design anti-dérive

Interdictions explicites :

- trop de cards ;
- trop de badges ;
- trop de texte ;
- fond sombre partout ;
- textes blancs peu lisibles ;
- couleurs aléatoires ;
- tableaux lourds ;
- marketplace visuelle ;
- SaaS générique ;
- animations gadget ;
- cartes décoratives ;
- KPI sans décision ;
- templates impossibles à maintenir ;
- graphes sans légende ;
- boutons concurrents ;
- menus interminables ;
- preuve surpromettue ;
- vocabulaire officiel sans cadre.

Règle de contrôle : si un élément n'aide pas à comprendre, décider, agir, prouver ou convertir, il doit être retiré.

## 25. Critères template premium

Le template doit :

- être Next.js ;
- être TypeScript ;
- être Tailwind CSS ;
- être compatible App Router ;
- être premium ;
- être B2B / SaaS / BI / operations ;
- offrir landing, dashboard, cards, tables, forms, sidebar, top nav ;
- être personnalisable sans réécriture totale ;
- éviter les dépendances lourdes ;
- avoir une bonne responsivité ;
- avoir des composants accessibles ;
- supporter des layouts clairs, denses et sobres ;
- permettre des cartes, KPI, filtres, tableaux, timelines et panneaux latéraux ;
- ne pas imposer une identité visuelle forte impossible à adapter.

Le template ne doit pas :

- imposer e-commerce ;
- imposer marketplace ;
- imposer crypto ;
- être trop flashy ;
- avoir design générique impossible à différencier ;
- ajouter trop de complexité ;
- dépendre d'animations ou d'effets décoratifs ;
- rendre difficile la distinction public / démo / privé / admin.

Recommandation : chercher un template premium Next.js / Tailwind orienté SaaS B2B, BI ou operations dashboard, puis adapter fortement la direction artistique, le vocabulaire, la palette et les templates Mbàmbulaan.

## 26. Critères d'acceptation avant développement

Avant reprise du développement, il faut :

- landing validée ;
- démos personnalisées validées ;
- templates de pages validés ;
- composants listés et priorisés ;
- palette validée ;
- navigation validée ;
- états UX validés ;
- anti-dérive validée ;
- choix template décidé ou critères prêts ;
- règles de preuve validées ;
- responsive cible validé ;
- accessibilité minimale cadrée ;
- termes interdits et préférés partagés avec l'équipe.

## 27. Synthèse Design System

| Élément | Nombre / décision |
| --- | --- |
| Couleurs cadrées | 11 couleurs nommées |
| Composants principaux | 40 composants |
| Templates de pages | 8 templates |
| États UX/UI | 12 états |
| Badges / statuts | 24 statuts répartis en 5 familles |
| Familles de badges | Preuve, qualité, tension, confiance, action |
| Règles anti-dérive | 18 interdictions explicites + règle de contrôle |
| Recommandation template | Next.js / TypeScript / Tailwind, B2B SaaS, BI ou operations dashboard, fortement personnalisable |
| Prochaine étape | Implémentation premium après validation UX + Design System |

Ce Design System doit empêcher Mbàmbulaan de devenir une interface générique. Il doit guider une plateforme crédible, territoriale, décisionnelle et premium, capable de montrer que la filière pêche artisanale peut être coordonnée comme une infrastructure stratégique.