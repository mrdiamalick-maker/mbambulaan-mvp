"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Clock, Compass, Factory, Flag, ListChecks, Sailboat } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { Drawer } from "@/components/etat/Drawer";
import { SituationIcon } from "@/components/etat/MotifIcons";
import { TerritoryAtlasCanvas, atlasSeaBackground } from "@/components/territories/TerritoryAtlasCanvas";
import { NumberTicker } from "@/components/magicui/number-ticker";
import {
  Mission,
  MissionForm,
  SituationDetail,
  StatusBadge,
  TerritoryDetail,
  formatFcfa,
  glyphBorderColor,
  initiativeStatusLabel,
  priorityLabels,
  priorityToTag,
  situationPriorityRank,
  statusTagLabel
} from "@/components/etat/shared";
import { type CommunityPost, type Signal, type Situation, type Territory } from "@/domain/types";
import { channelMeta } from "@/lib/status-tokens";
import { findFocusSituation, resolveFindingForSituation } from "@/domain/situation-narrative";
import { vigilanceCategoryLabels, type VigilanceCase, type VigilanceSeverity } from "@/domain/ministry/vigilance";

// Audit DA Premium XXL v2 (mandat CEO 2026-08-17). Cette page adopte
// .etat-scope (etat-design-system.css), déjà construit et validé sur la
// page sœur /app/etat/rapport, plutôt qu'un 4e vocabulaire visuel — même
// discipline que le composant Drawer ci-dessus, lui aussi déjà construit
// mais jamais câblé avant le Lot A. Aucune donnée, aucun moteur métier
// touché dans ce lot.
//
// Lot A (fondations visuelles) : typographie serif d'affichage, palette
// --etat-*, cartes KPI → chiffres inline (§17 du mandat), retrait du
// Marquee (§5).
//
// Lot B (Chapitre 1 — lecture territoriale) : ancien Hero (bande sombre
// pleine largeur) + section "Atlas territorial" (DottedMap générique)
// fusionnés en un seul chapitre carte + décision prioritaire unique +
// compteurs, conformément à la référence visuelle et à l'option 2 tranchée
// par le CEO pour le point d'attention "carte" (cf. gap analysis). La
// carte réutilise la géométrie calibrée de PublicAtlasWorkspace.tsx via
// CoastlineTerritoryMap/territory-map-positions.ts — fichiers neufs, le
// Public n'est ni modifié ni affecté. Superseded 2026-08-27 (mandat
// "simplifier l'Atlas /app/etat") : cette page utilise désormais
// AtlasImageMap/territory-map-image-positions.ts, plus CoastlineTerritoryMap
// — les fichiers cités ici restent réels et utilisés par /app/pilotage,
// simplement plus par CETTE page. Paragraphe gardé tel quel comme
// historique du choix d'origine, pas mis à jour rétroactivement.
// AtlasExecutiveSummary
// (variant="institution") est retiré de cette page : composant partagé
// avec /app/atlas Pro (variant="coordinateur"), non modifié, seulement
// plus utilisé ici — ses 2 métriques encore non relogées (situations à
// arbitrer, capacités fragiles) restent trackées pour le Chapitre 2, pas
// perdues, juste pas encore leur place définitive. DottedMap n'est plus
// utilisé sur cette page (remplacé) ; InstitutionIllustration avait
// migré du Hero (retiré) vers le bandeau rapport bailleurs (§18 du
// mandat) — retirée à son tour de ce bandeau (mandat "2 assets
// d'illustration réelle", 2026-08-23) au profit du fond photo réel,
// cf. commentaire sur place. Toujours utilisée telle quelle sur
// Login/Institution (CoordinationIllustration.tsx), non modifiée.
//
// XXL-R5.5 (mandat CEO "Cartographic Signature", 2026-09-03) — le fond
// photo + caméra AtlasImageMap ci-dessus est retiré à son tour : le CEO
// juge la carte "trop sombre" et "recadrée comme une image plutôt que
// composée dans l'espace" (§2 du mandat), un défaut structurel d'un fond
// photographique zoomé au clic, pas un simple réglage de teinte. Cette
// page revient donc à CoastlineTerritoryMap/territory-map-positions.ts —
// même primitive cartographique que /app/pilotage et (depuis XXL-R4)
// /app/atlas Pro, désormais la seule et unique carte du produit (§4/§17
// du mandat XXL-R5.5, "une signature cartographique, pas trois"), rendue
// ici avec ses couleurs D9 par défaut (fond blanc .etat-panel, terre
// --etat-offwhite-dim, structure --etat-navy-600) : plus léger et plus
// lumineux que le fond illustré qu'il remplace, sans introduire de
// nouvelle teinte. Le voile bg-white/30 ajouté au lot précédent pour
// compenser l'inégalité de la photo n'a plus de raison d'être — retiré
// avec elle, pas conservé "au cas où". Le zoom manuel (+/-, zoomFactor,
// ZOOM_MIN/MAX) était un mécanisme propre à la caméra AtlasImageMap
// (cameraFor/BASE_ZOOM_SCALE, cf. historique ci-dessous) : sans elle, il
// n'a plus de cible et est retiré avec elle, pas porté vers un
// équivalent SVG — un SVG plein cadre (preserveAspectRatio="xMidYMid
// meet") montre déjà tout le territoire national sans réglage manuel.
// cameraTargetId/dominant/selectedTerritoryId (ce qui pilote réellement
// le panneau "À décider aujourd'hui") ne sont PAS retirés : seule la
// mécanique caméra/zoom disparaît, pas le calcul de territoire dominant
// qui l'utilisait — cf. commentaires sur place plus bas.
//
// Écarts assumés vs la référence, validés par le CEO (2026-08-17) : pas de
// score de confiance composite fabriqué (§20, doctrine anti-score déjà
// appliquée ailleurs) ; pas de second acteur "proposé par / validé par"
// inventé pour le journal de décisions (le modèle n'a qu'un décideur).
// severityToTag reste local : n'utilisé que par le calcul `dominant` de
// cette page (aucun autre consommateur, pas déplacé vers shared.tsx).
const severityToTag: Record<VigilanceSeverity, "stable" | "vigilance" | "critique"> = { faible: "stable", moyenne: "vigilance", haute: "vigilance", critique: "critique" };

// P2.DESIGN-1A.2 (North Star) — couleur stable par canal (pas par rang de
// tri, qui varie avec les effectifs réels) pour la barre proportionnelle
// et la légende du bloc "Le pouls de la filière" — mêmes teintes que le
// prototype Claude Design, aucune inventée.
const channelStackColor: Record<Signal["channel"], string> = {
  terrain: "#0B1A2A",
  poste_quai: "#B6522F",
  telephone: "#DE9C74",
  whatsapp_structure: "#7FB08A",
  espace_public: "rgba(11,26,42,.18)"
};

// Caméra Atlas SVG (cameraWindowFor/scaleViewBox/useAnimatedViewBox)
// retirée ici — pas fusionnée avec Lot C, une vraie suppression (mandat
// CEO "simplifier l'Atlas /app/etat : image + marqueurs en pourcentage,
// pas de SVG calibré", 2026-08-27, Lot B) : ces 3 fonctions calculaient
// une fenêtre dans l'espace de coordonnées de coastlineViewBox, abandonné
// pour cette page. Elles ne sont pas réutilisables telles quelles pour la
// caméra CSS transform du Lot C (à venir), qui travaillera dans un espace
// de coordonnées différent (pourcentage de l'image, territory-map-image-
// positions.ts) — un nouveau calcul, pas un renommage. "Vue nationale" et
// le zoom +/- sont donc temporairement retirés de l'interface avec ce
// lot (cf. plus bas, JSX) : pas de bouton dont le clic ne ferait plus
// rien. Restaurés fonctionnellement par le Lot C, déjà planifié et
// approuvé par le CEO — signalé explicitement, pas une régression
// silencieuse.

export default function EtatPage() {
  const { state, actorId } = useProduct();
  const [cases, setCases] = useState<VigilanceCase[]>([]);
  const [territoryDrawer, setTerritoryDrawer] = useState<Territory | null>(null);
  // Lot État-A (mandat CEO 2026-08-20, §3.2/§3.3) : état distinct de
  // territoryDrawer — un clic sur l'Atlas sélectionne un territoire pour
  // peupler "À décider aujourd'hui" sans ouvrir immédiatement le tiroir.
  // territoryDrawer reste réservé à l'ouverture explicite via le CTA
  // "Voir le territoire".
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  // Correctif (CEO 2026-08-22) : la caméra par défaut cadre désormais sur
  // le territoire dominant (Joal, par ex.), pas la vue nationale — donc
  // "Vue nationale" ne peut plus se contenter de faire
  // setSelectedTerritoryId(null) (déjà null par défaut, sans effet sur la
  // caméra qui retomberait aussitôt sur le dominant). Ce drapeau distinct
  // force explicitement le national tant que l'utilisateur n'a pas
  // sélectionné un territoire précis (clic carte ou Périmètre) — remis à
  // false dès qu'une sélection explicite est faite, pour ne pas bloquer
  // la caméra sur le national après un choix réel.
  const [cameraForcedNational, setCameraForcedNational] = useState(false);
  // Lot État-B (mandat §3.1, §4.2) : filtre Période réel, restreint aux
  // dates calendaires réellement présentes dans les landings (seule
  // donnée temporelle avec une vraie dispersion sur cette page — les
  // décisions de démonstration partagent toutes le même decidedAt,
  // cf. commentaire plus bas, donc pas de filtre Période fabriqué dessus).
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [situationDrawer, setSituationDrawer] = useState<Situation | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);
  // programmeStatusFilter/urgenceFilter/arbitrageSearch/signalDrawerOpen
  // supprimés (correctif "pas de scroll infini", navigation par page,
  // 2026-08-26) : ces filtres/actions n'ont plus d'interface sur cette
  // page — ils vivent désormais sur /app/etat/programmes et
  // /app/etat/arbitrages (registres complets extraits), qui gèrent leur
  // propre état local. Les garder ici, sans UI pour les faire varier,
  // aurait été un état mort trompeur (toujours "all"/"", jamais changé).
  // prioritiesTrackRef/prioritiesIndex/prioriteTab (carrousel "Où
  // concentrer l'attention") supprimés avec le Chapitre 5, retiré du
  // premier écran — cf. commentaire de retrait explicite sur place.

  // visits n'est plus lu sur cette page (la ligne "visite(s) planifiée(s)"
  // vit désormais sur /app/etat/arbitrages, cf. correctif "pas de scroll
  // infini") — seul cases reste nécessaire ici (openCases, TerritoryDetail).
  const reload = async () => {
    const response = await fetch("/api/ministry/vigilance");
    if (response.ok) setCases((await response.json()).cases ?? []);
  };

  useEffect(() => {
    void reload();
  }, []);

  const actor = state?.actors.find((item) => item.id === actorId);
  const openCases = useMemo(() => cases.filter((item) => item.status !== "clos"), [cases]);

  const dominant = useMemo(() => {
    if (openCases.length > 0) {
      const top = [...openCases].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
      return { kind: "signal" as const, glyphStatus: severityToTag[top.severity], case: top };
    }
    const critiqueTerritory = state?.territories.find((item) => item.activity === "critique");
    if (critiqueTerritory) return { kind: "territoire" as const, glyphStatus: "critique" as const, territory: critiqueTerritory };
    return { kind: "calme" as const, glyphStatus: "stable" as const };
  }, [openCases, state]);

  // Correctif (CEO 2026-08-22) : la caméra doit cadrer sur le territoire
  // dominant dès le chargement, pas seulement après un clic explicite —
  // "carte et panneau doivent déjà raconter la même chose au premier
  // coup d'œil". Même expression que dominantTerritoryId plus bas
  // (réutilisée telle quelle, cf. const dominantTerritoryId). Reste
  // nécessaire même sans caméra visuelle (Lot B) : c'est ce qui détermine
  // le territoire mis en avant dans "À décider aujourd'hui" par défaut.
  const cameraTargetId = cameraForcedNational ? null : (selectedTerritoryId ?? (dominant.kind === "territoire" ? dominant.territory.id : dominant.kind === "signal" ? dominant.case.territoryId : null));

  if (!state) return null;

  const territoiresActifs = state.territories.length;

  // Chapitre 1 — "Comment va la filière ?" (mandat "Vertical Slice Joal",
  // §5) : une phrase d'état général dérivée du même calcul `dominant` qui
  // pilote déjà la carte et le panneau ci-dessous (§9 du mandat LOT 1 —
  // « les surfaces État et Coordination consomment la même réalité Core »,
  // ici appliqué à l'intérieur même de la page). Jamais figée : "aucune
  // tension" quand `dominant.kind === "calme"`, sinon le territoire et le
  // dossier réels qui justifient l'attention — aucun `if joal`, ce texte
  // s'écrirait identiquement pour n'importe quel autre territoire dominant.
  // Le titre d'une Situation mentionne déjà le plus souvent son territoire
  // (ex. "... à Joal") — ne jamais répéter dominant.territory.name à la
  // suite pour éviter une redondance de lecture ("... à Joal ... à
  // Joal-Fadiouth") : le territoire est nommé une seule fois, en tête.
  const nationalFocusSituation = dominant.kind === "territoire" ? findFocusSituation(state, dominant.territory.id) : undefined;
  const etatGeneralSentence = dominant.kind === "territoire" && nationalFocusSituation
    ? `Situation globalement maîtrisée — ${dominant.territory.name} concentre l’attention du réseau : ${nationalFocusSituation.title}.`
    : dominant.kind === "signal"
      ? `Situation globalement maîtrisée — ${dominant.case.territoryLabel} concentre l’attention du réseau : ${vigilanceCategoryLabels[dominant.case.category]}.`
      : "Situation globalement maîtrisée — aucune tension prioritaire ne nécessite une attention immédiate à ce jour.";

  // Bloc "Le pouls de la filière" (mandat CEO "reconstruire l'Espace État
  // autour de la capture de signal", Lot B, 2026-08-29) : Mbàmbulaan capte
  // tout signal quel que soit le canal — donnée déjà réelle dans
  // ProductState (state.signals/communityPosts/incomingMessages), jamais
  // affichée sur cette page jusqu'ici. Ordre des canaux décroissant par
  // effectif réel (pas l'ordre arbitraire de channelMeta) — lecture "du
  // plus au moins fréquent", vérifié indépendamment avant ce lot : 30
  // signaux (terrain 18, poste_quai 7, téléphone 3, whatsapp_structure 2).
  const signalsByChannel = (Object.keys(channelMeta) as Array<Signal["channel"]>)
    .map((channel) => ({ channel, count: state.signals.filter((item) => item.channel === channel).length }))
    .sort((a, b) => b.count - a.count);
  const totalSignalsCaptes = state.signals.length;
  // Pont public↔privé : CommunityPost.status==="transforme" +
  // convertedObjectId pointent déjà vers une vraie Situation (13/13
  // résolus, vérifié) — jamais montré. .filter Boolean plutôt que supposé
  // toujours résolu : si un futur post transformé ne résout à rien, il
  // disparaît silencieusement de la liste d'exemples plutôt que de
  // planter ou d'afficher un exemple cassé.
  const transformedPosts = state.communityPosts.filter((item) => item.status === "transforme");
  const transformedExamples = transformedPosts
    .map((post) => ({ post, situation: state.situations.find((item) => item.id === post.convertedObjectId) }))
    .filter((item): item is { post: CommunityPost; situation: Situation } => Boolean(item.situation))
    .slice(0, 3);
  // File de capture brute : IncomingMessage.status==="nouveau" (4 dans le
  // jeu réel, vérifié) — pas encore convertis en signal qualifié.
  const newIncomingMessages = state.incomingMessages.filter((item) => item.status === "nouveau");

  // Bloc "De la capture à la décision" (mandat CEO "reconstruire l'Espace
  // État autour de la capture de signal", Lot C, 2026-08-30) : le même
  // récit que la boucle de coordination canonique déjà nommée ailleurs
  // dans le produit (MotifIcons.tsx, en-tête de fichier : Signal →
  // Qualification → Situation → Décision → Engagement → Exécution →
  // Preuve → Résultat → Apprentissage) — 5 de ces 9 étapes, celles que le
  // mandat demande explicitement de raconter ici avec de vrais effectifs,
  // pas un lexique. Point le plus important, arbitré explicitement par le
  // CEO dans le feu vert conjoint : ne jamais visualiser un rétrécissement
  // FABRIQUÉ à l'étape Signal → Qualification.
  //
  // Mise à jour (mandat "aligner le Core métier avec le Blueprint V1",
  // LOT 0, 2026-09-01) : le Core découple désormais réellement Signal et
  // Situation (Signal.disposition — "nouveau"/"rattache_finding"/
  // "oriente_situation"/... — un signal peut exister sans jamais devenir
  // une situation). Le jeu de démonstration en contient désormais une
  // preuve concrète (scénario Joal/Kayar, cf. demo-state.ts) : ce n'était
  // qu'une coïncidence du jeu de données précédent que Signal ===
  // Qualification, jamais une garantie du modèle — donc plus de phrase
  // affirmant "aucune perte" en dur ci-dessous, remplacée par les deux
  // chiffres réels, quels qu'ils soient. Rien n'est fabriqué dans un sens
  // (narrowing inventé) ni dans l'autre (égalité inventée).
  const situationsQualifiees = state.situations.length;
  // "Situation" (3e étape) = situations réellement engagées dans la boucle
  // de coordination, au-delà du seul accueil/qualification initiale.
  // SituationStatus (domain/types.ts) ordonne déjà recue → qualification →
  // priorisee → coordination → intervention → attente → resultat → reglee
  // — cette étape compte tout ce qui a dépassé qualification (priorisee et
  // au-delà, 26/30), pas un seuil fabriqué pour ce bloc : lecture directe
  // et littérale de l'ordre du champ de statut réel.
  const preQualificationStatuses = new Set<Situation["status"]>(["recue", "qualification"]);
  const situationsEngagees = state.situations.filter((item) => !preQualificationStatuses.has(item.status)).length;
  // "Décision" = situations avec au moins une Decision rattachée — une
  // situation peut recevoir plusieurs décisions au fil du temps (17
  // décisions au total sur 15 situations distinctes, vérifié).
  const situationIdsAvecDecision = new Set(state.decisions.map((item) => item.situationId));
  const situationsDecidees = situationIdsAvecDecision.size;
  const totalDecisions = state.decisions.length;
  // "Résultat" = situations dont le statut atteint resultat/reglee — un
  // résultat a été constaté et consigné, pas seulement décidé.
  const situationsAvecResultat = state.situations.filter((item) => item.status === "resultat" || item.status === "reglee").length;

  // Synthèse nationale (Lot 1, Refonte Premium XXL, mandat §9) : bande
  // fine à 5 chiffres, remplace l'ancien triptyque "Territoires suivis /
  // En vigilance / En critique" (redondant avec la lecture par couleur
  // déjà disponible sur la carte) par les 5 agrégats explicitement
  // composés dans la référence — chacun recalculé ici sur le jeu de
  // données réel, aucun repris de la maquette (vérifié par script sur
  // createDemoState() : la maquette affichait 36/9/27,4M/18 — les 4
  // valeurs réelles diffèrent, seul "18 territoires" coïncide). "Financement
  // engagé" = somme des Funding confirmés + en instruction sur l'ensemble
  // des programmes (pas la "valeur coordonnée" du Chapitre 2, qui mesure
  // autre chose — un lot pêché, pas un financement de programme).
  const situationsOuvertesTotal = state.situations.filter((item) => item.status !== "reglee").length;
  // Situations critiques/hautes (mandat "Vertical Slice Joal", §5 —
  // "quelques métriques qui répondent à une vraie question", exemple
  // explicitement cité) : sous-ensemble de situationsOuvertesTotal, pas un
  // second calcul indépendant.
  const situationsCritiquesHautesTotal = state.situations.filter((item) => item.status !== "reglee" && (item.priority === "critique" || item.priority === "haute")).length;
  const capacitesFragilesTotal = state.infrastructures.filter((item) => item.status !== "operationnelle").length;
  const financementEngageTotal = state.initiatives.reduce((sum, item) => sum + item.funding.filter((fund) => fund.status === "confirme" || fund.status === "en_instruction").reduce((fundSum, fund) => fundSum + fund.amountFcfa, 0), 0);
  const programmesActifsTotal = state.initiatives.filter((item) => item.status !== "terminee").length;

  // Chapitre 1 — décision prioritaire unique : bulles réellement dérivables
  // du territoire/dossier dominant, pas les libellés illustratifs de la
  // référence (aucun champ "sorties de pêche concernées"/"tonnage
  // impacté"/"risque de pertes" n'existe dans le modèle — non fabriqués).
  //
  // Lot État-A : selectedTerritoryId (clic Atlas explicite) prend le pas
  // sur le calcul dominant réseau — dès qu'un territoire est sélectionné,
  // tout le panneau (situations, capacités, KPI) se recalcule pour lui,
  // sans changer le calcul par défaut (dominant) quand rien n'est
  // sélectionné.
  const dominantTerritoryId = cameraTargetId ?? undefined;
  const focusTerritory = dominantTerritoryId ? state.territories.find((item) => item.id === dominantTerritoryId) : undefined;
  const dominantOpenSituations = dominantTerritoryId ? state.situations.filter((item) => item.territoryId === dominantTerritoryId && item.status !== "reglee") : [];
  const dominantFragileInfra = dominantTerritoryId ? state.infrastructures.filter((item) => item.territoryId === dominantTerritoryId && item.status !== "operationnelle").length : 0;
  // findFocusSituation (LOT 1, mandat "Vertical Slice Joal", §7) : préfère,
  // parmi les situations ouvertes du territoire, celle adossée à un Finding
  // — donc explicable ("pourquoi Mbàmbulaan vous le signale") — avant de
  // retomber sur le simple tri par priorité (comportement historique,
  // préservé pour tout territoire sans Finding). Règle générique, aucun
  // `if joal` : Joal n'est mis en avant que parce qu'il porte aujourd'hui
  // la seule Situation du jeu de démonstration reliée à un Finding.
  const dominantPrioritySituation = dominantTerritoryId ? findFocusSituation(state, dominantTerritoryId) : undefined;
  const dominantFinding = dominantPrioritySituation ? resolveFindingForSituation(state, dominantPrioritySituation) : undefined;

  // Titre adaptatif du panneau quand un territoire est sélectionné
  // explicitement (mandat §3.3) : "À décider aujourd'hui" seulement
  // quand une décision est réellement attendue (situation ouverte
  // critique/haute), sinon un wording honnête selon le statut réel —
  // jamais une urgence fabriquée pour un territoire calme.
  const selectedPanelTitle = !selectedTerritoryId || !focusTerritory ? undefined :
    dominantPrioritySituation && (dominantPrioritySituation.priority === "critique" || dominantPrioritySituation.priority === "haute")
      ? "À décider aujourd’hui"
      : dominantOpenSituations.length > 0 || focusTerritory.activity === "vigilance"
        ? "À surveiller"
        : "Lecture du territoire";

  // KPI territoriaux du copilote (Lot 1, Refonte Premium XXL, mandat §8) —
  // tous directement dérivés du modèle, aucune dérivation de confiance
  // fabriquée en 7e chiffre. Recalculés à chaque changement de
  // dominantTerritoryId (sélection Atlas ou calcul dominant par défaut).
  //
  // Recomposition (Lot 1) : le mandat nomme explicitement en premier
  // "situations ouvertes, capacités fragiles, programmes concernés" —
  // ces 3 n'étaient pas dans la grille de tuiles jusqu'ici (situations
  // ouvertes/capacités fragiles vivaient en texte séparé juste au-dessus,
  // en double avec la tuile "Capacités fragiles/indisponibles" ; aucune
  // tuile "programmes concernés" n'existait). Débarquements/Sorties en
  // mer sont conservés : seule donnée que le filtre Période affecte
  // réellement (cf. légende du filtre) — les retirer aurait rendu ce
  // filtre inopérant. Sites/Immatriculations/Acteurs retirés de CETTE
  // grille (doctrine "jamais pour remplir l'espace", §8) — restent
  // consultables dans la fiche Territoire complète ("Voir le territoire").
  const focusSites = dominantTerritoryId ? state.sites.filter((item) => item.territoryId === dominantTerritoryId) : [];
  const focusSiteIds = new Set(focusSites.map((item) => item.id));
  const focusVessels = state.vessels.filter((item) => focusSiteIds.has(item.homeSiteId));
  const focusVesselIds = new Set(focusVessels.map((item) => item.id));
  const focusTripsEnMer = state.trips.filter((item) => focusVesselIds.has(item.vesselId) && item.status === "en_mer" && (periodFilter === "all" || item.departureAt.slice(0, 10) === periodFilter)).length;
  const focusInfrastructures = dominantTerritoryId ? state.infrastructures.filter((item) => item.territoryId === dominantTerritoryId) : [];
  const focusAvailableCapacity = focusInfrastructures.filter((item) => item.status === "operationnelle").length;
  // 3 indicateurs max (mandat "nouvelle DA Vue d'ensemble", conforme à la
  // maquette : Situations ouvertes / Capacités fragiles / 3e tuile) —
  // réduit du jeu de 5 tuiles du Lot 1. Programmes concernés (valeur
  // décisionnelle la plus faible des 5 : un simple comptage de contexte,
  // pas un signal d'action) cède sa place. Entre Débarquements documentés
  // et Sorties en mer en cours, Sorties en mer est retenue (arbitrage CEO
  // 2026-08-23 : "garde celle qui a le plus de valeur décisionnelle
  // immédiate") — un état opérationnel en cours parle plus directement à
  // "à décider aujourd'hui" qu'un comptage documentaire historique.
  // Conserve un vrai effet visible au filtre Période (seul autre
  // consommateur retiré, aucun autre élément de la page n'y réagit).
  const territoryKpis = dominantTerritoryId ? [
    { icon: SituationIcon, value: dominantOpenSituations.length, label: "Situations ouvertes" },
    { icon: Factory, value: dominantFragileInfra, label: "Capacités fragiles/indisponibles", caption: `${focusAvailableCapacity} disponible(s) sur ${focusInfrastructures.length}` },
    { icon: Sailboat, value: focusTripsEnMer, label: "Sorties en mer en cours" }
  ] : [];

  // Rendu du panneau : sélection Atlas explicite prioritaire sur le
  // calcul dominant réseau (cf. commentaire dominantTerritoryId).
  const panelGlyphStatus = selectedTerritoryId && focusTerritory ? focusTerritory.activity : dominant.glyphStatus;
  const panelBorderColor = selectedTerritoryId && focusTerritory ? glyphBorderColor[focusTerritory.activity] : (dominant.kind === "calme" ? "var(--etat-navy-600)" : "var(--etat-terracotta)");
  const panelEyebrow = selectedPanelTitle ?? (dominant.kind === "calme" ? "Situation calme" : "À décider aujourd’hui");
  const panelHeading = selectedTerritoryId && focusTerritory
    ? selectedPanelTitle === "À décider aujourd’hui"
      ? `${focusTerritory.name} — une décision est attendue`
      : selectedPanelTitle === "À surveiller"
        ? `${focusTerritory.name} — à surveiller`
        : `Lecture de ${focusTerritory.name}`
    : dominant.kind === "signal" ? `${vigilanceCategoryLabels[dominant.case.category]} à ${dominant.case.territoryLabel}`
    : dominant.kind === "territoire" ? `${dominant.territory.name} concentre l’attention du réseau`
    : "Aucune tension prioritaire signalée";
  const panelDescription = selectedTerritoryId && focusTerritory
    ? (dominantPrioritySituation?.description ?? (focusTerritory.activity === "stable" ? "Aucune situation ouverte prioritaire sur ce territoire pour le moment." : "Territoire sélectionné sur la carte — voir le détail pour comprendre ce qui s’y joue."))
    : dominant.kind === "signal" ? dominant.case.description
    : dominant.kind === "territoire" ? "Territoire classé en activité critique — voir le détail pour comprendre ce qui s’y joue."
    : "Le réseau reste sous surveillance continue ; les territoires actifs restent consultables sur la carte.";

  // Lot État-B — Périmètre réel (mandat §3.1) : réutilise selectedTerritoryId
  // (même état que le clic Atlas, Lot État-A) — un seul territoire "actif"
  // pour toute la page, quelle que soit son origine (carte ou sélecteur).
  //
  // Filtre Recherche/Urgence/Statut retirés d'ici (correctif "pas de
  // scroll infini", navigation par page, 2026-08-26) : ils vivent
  // désormais sur /app/etat/arbitrages et /app/etat/programmes (registres
  // complets), qui gèrent leur propre état local — situationsAArbitrer et
  // filteredProgrammes ne servent plus qu'à calculer les 3 premiers du
  // teaser correspondant (situationsTeaser/programmesTeaser plus bas),
  // toujours filtrés par le même Périmètre partagé que le reste du Brief
  // national. recentDecisions (registre "Décisions", .slice(0,5)) est
  // retiré : plus aucun consommateur sur cette page, le registre complet
  // vit désormais sur /app/etat/redevabilite (sans plafond, cf. ce fichier).
  const situationsAArbitrer = state.situations
    .filter((item) =>
      item.status !== "reglee" &&
      (item.priority === "critique" || item.priority === "haute") &&
      (!selectedTerritoryId || item.territoryId === selectedTerritoryId)
    )
    .sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority]);
  // Dates calendaires réelles disponibles pour le filtre Période — dérivées
  // des landings (seule donnée avec une vraie dispersion temporelle ici).
  const landingDates = [...new Set(state.landings.map((item) => (item.weighedAt ?? item.arrivedAt ?? "").slice(0, 10)).filter(Boolean))].sort();

  // Lot État-E (mandat §3.8) — même Périmètre partagé que le reste du
  // Brief national ; le filtre Statut, lui, vit désormais uniquement sur
  // /app/etat/programmes (cf. remarque ci-dessus).
  const filteredProgrammes = state.initiatives.filter((item) =>
    !selectedTerritoryId || item.territoryIds.includes(selectedTerritoryId)
  );

  // Teasers "À arbitrer"/"Programmes à suivre" (mandat "Brief national",
  // §6 — mapping tranché par le CEO : "teaser de 3 + 'Voir tout'").
  // Situations : mêmes 3 premières que situationsAArbitrer, déjà triées
  // par urgence décroissante (situationPriorityRank) — pas un second tri
  // inventé pour ce teaser. Programmes : filteredProgrammes n'a pas
  // d'ordre de priorité propre (ordre d'insertion du jeu de données) —
  // dérive la même "prochaine échéance" que la carte complète plus bas
  // (situations liées les plus proches, cf. Chapitre 4) et trie dessus,
  // échéance la plus proche d'abord, programmes sans échéance documentée
  // repoussés en fin plutôt que triés arbitrairement en tête.
  const situationsTeaser = situationsAArbitrer.slice(0, 3);
  const programmesTeaser = [...filteredProgrammes]
    .map((programme) => {
      const nextDeadline = programme.situationIds
        .map((id) => state.situations.find((item) => item.id === id)?.dueAt)
        .filter((value): value is string => Boolean(value))
        .sort()[0];
      return { programme, nextDeadline };
    })
    .sort((a, b) => {
      if (!a.nextDeadline && !b.nextDeadline) return 0;
      if (!a.nextDeadline) return 1;
      if (!b.nextDeadline) return -1;
      return a.nextDeadline.localeCompare(b.nextDeadline);
    })
    .slice(0, 3);

  const todayLabel = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      {/* P2.DESIGN-1A.2 (North Star Claude Design) — hero reconstruit pour
          correspondre au prototype fourni (Espace Etat.dc.html, écran
          "Brief national") : eyebrow daté ("Brief national · {date réelle
          du jour}", jamais une date recopiée de la maquette), grand titre
          éditorial "Voir le pays, puis décider." repris tel quel du
          prototype (texte de doctrine, pas une donnée), puis
          etatGeneralSentence (calcul réel existant, inchangé) comme phrase
          d'état. Filtres Périmètre/Période : même mécanisme exact
          qu'avant (aucun état, aucune option, aucune donnée changée),
          seul l'habillage visuel passe de <select> encadré à
          etat-filter-select (soulignement, pas de boîte). */}
      <section className="border-b border-[var(--etat-line)] px-6 pb-[42px] pt-9 lg:px-[60px] lg:pb-[42px] lg:pt-[52px]" style={{ background: "var(--etat-warm-white)" }}>
        <div className="flex flex-wrap items-end gap-10 lg:gap-16">
          <div className="min-w-0 flex-1">
            <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />Brief national · {todayLabel}</p>
            <h1 className="etat-display etat-h1 etat-h1--hero mt-5">Voir le pays,<br />puis décider.</h1>
            <p className="mt-[22px] max-w-[620px] text-[15.5px] leading-[1.65]" style={{ color: "rgba(11,26,42,.70)" }}>{etatGeneralSentence}</p>
          </div>
          {/* flex-wrap seul (flex-none retiré, correctif débordement 390px
              confirmé par script : flex-none empêche cette rangée de
              rétrécir même quand flex-wrap voudrait passer les 2 <select>
              sur 2 lignes, donc elle poussait la page en largeur au lieu
              de s'adapter) — min-w-0 laisse la rangée redevenir plus
              étroite que le contenu de ses 2 enfants sur mobile, où ils
              passent naturellement l'un sous l'autre. */}
          <div className="flex min-w-0 flex-wrap gap-9 pb-1">
            <label className="block">
              <p className="etat-filter-label">Périmètre</p>
              <select
                value={selectedTerritoryId ?? ""}
                onChange={(event) => { setSelectedTerritoryId(event.target.value || null); setCameraForcedNational(!event.target.value); }}
                className="etat-filter-select"
              >
                <option value="">Sénégal entier</option>
                {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => (
                  <option key={territory.id} value={territory.id}>{territory.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <p className="etat-filter-label">Période</p>
              <select
                value={periodFilter}
                onChange={(event) => setPeriodFilter(event.target.value)}
                title="S’applique aux débarquements et sorties en mer du panneau territorial."
                className="etat-filter-select"
              >
                <option value="all">Toutes les dates disponibles</option>
                {landingDates.map((date) => (
                  <option key={date} value={date}>{new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <div className="px-6 lg:px-[60px]">
      <div className="space-y-0">
      {/* Bloc "Le pouls de la filière" (mandat CEO "reconstruire l'Espace
          État autour de la capture de signal", Lot B, 2026-08-29) : avant
          la carte/le brief du jour, montrer d'où vient l'information —
          Mbàmbulaan capte tout signal, quel que soit le canal, c'est
          l'infrastructure de confiance vendue. Chiffres inline (pas de
          graphique décoratif, consigne explicite du mandat). Exemples
          transformés cliquables : ouvrent SituationDetail dans le même
          drawer que le reste de la page (situationDrawer, déjà déclaré
          plus haut) — l'Institution ne quitte jamais /app/etat, même
          discipline que partout ailleurs sur cette page. */}
      {/* P2.DESIGN-1A.2 (North Star) — section reconstruite selon le
          prototype : plus de tuiles bordées, une barre proportionnelle
          réelle (largeur = part réelle de chaque canal dans
          totalSignalsCaptes, jamais une valeur illustrative) au-dessus
          d'une grille de chiffres nus. channelStackColor associe une
          couleur STABLE à chaque canal (pas à son rang de tri, qui varie
          avec les effectifs réels) — mêmes teintes que le prototype,
          aucune inventée. */}
      <section id="pouls" className="scroll-mt-6 border-b border-[var(--etat-line)] py-11">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <div className="lg:w-[290px] lg:flex-none">
            <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />Le pouls de la filière</p>
            <h2 className="etat-display etat-h2 mt-3.5 text-[27px]">Capter tout signal, quel que soit le canal.</h2>
            <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: "rgba(11,26,42,.62)" }}>{totalSignalsCaptes} signaux captés à ce jour, tous canaux confondus. Chaque situation suivie par le réseau en découle.</p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-end gap-2">
              <span className="etat-display text-[52px] leading-[.9]" style={{ color: "var(--etat-navy)" }}><NumberTicker value={totalSignalsCaptes} /></span>
              <span className="pb-2 text-[11.5px]" style={{ color: "rgba(11,26,42,.55)" }}>signaux captés</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-[2px]" style={{ background: "rgba(11,26,42,.08)" }} role="img" aria-label="Répartition des signaux captés par canal">
              {signalsByChannel.filter((item) => item.count > 0).map(({ channel, count }) => (
                <div key={channel} style={{ width: `${(count / Math.max(1, totalSignalsCaptes)) * 100}%`, background: channelStackColor[channel] }} title={`${channelMeta[channel].label} · ${count}`} />
              ))}
            </div>
            <div className="mt-[22px] grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-5">
              {signalsByChannel.map(({ channel, count }) => (
                <div key={channel}>
                  <div className="mb-[7px] flex items-center gap-[7px]">
                    <span aria-hidden="true" className="size-[7px] shrink-0 rounded-[2px]" style={{ background: channelStackColor[channel] }} />
                    <span className="text-[9.5px] font-semibold uppercase tracking-[.13em]" style={{ color: "rgba(11,26,42,.50)" }}>{channelMeta[channel].label}</span>
                  </div>
                  <div className="etat-display text-[26px] leading-none" style={{ color: "var(--etat-navy)" }}><NumberTicker value={count} /></div>
                </div>
              ))}
            </div>

            {/* Pont public ↔ privé : preuve concrète, pas une affirmation —
                CommunityPost.status==="transforme" + convertedObjectId
                pointent déjà vers une vraie Situation. */}
            <div className="mt-7 flex flex-wrap items-baseline gap-3.5 border-t pt-5" style={{ borderColor: "var(--etat-line)" }}>
              <span className="etat-filter-label mb-0">Le pont public ↔ privé</span>
              <span className="text-[13px]" style={{ color: "rgba(11,26,42,.72)" }}>{state.communityPosts.length} publication(s) de l’espace public reçue(s), dont <strong className="font-semibold" style={{ color: "var(--etat-navy)" }}>{transformedPosts.length} transformée(s)</strong> en situation(s) suivie(s).</span>
            </div>
            {transformedExamples.length > 0 && (
              <div className="mt-3 space-y-2">
                {transformedExamples.map(({ post, situation }) => (
                  <button key={post.id} onClick={() => setSituationDrawer(situation)} className="etat-panel--warm flex w-full items-center justify-between gap-3 p-3 text-left transition hover:border-[var(--etat-terracotta)]">
                    <div className="min-w-0">
                      <p className="truncate text-xs" style={{ color: "rgba(11,26,42,.58)" }}>« {post.title} »</p>
                      <p className="mt-0.5 truncate text-sm font-semibold" style={{ color: "var(--etat-navy)" }}>devenu {situation.title}</p>
                    </div>
                    <ArrowRight size={14} className="shrink-0" style={{ color: "var(--etat-stone-400)" }} />
                  </button>
                ))}
              </div>
            )}

            {/* File d'attente de capture brute : n'apparaît que si non
                vide — 4 messages dans le jeu réel, tous "nouveau". */}
            {newIncomingMessages.length > 0 && (
              <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--etat-line)" }}>
                <p className="etat-filter-label mb-2">File d’attente de capture brute · {newIncomingMessages.length}</p>
                <div className="space-y-1.5">
                  {newIncomingMessages.map((message) => (
                    <p key={message.id} className="etat-panel--warm p-2.5 text-xs leading-4" style={{ color: "rgba(11,26,42,.62)" }}><span className="font-semibold" style={{ color: "var(--etat-navy)" }}>{channelMeta[message.channel].label}</span> · {message.reportedBy} — {message.body}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bloc "De la capture à la décision" (mandat CEO "reconstruire
          l'Espace État autour de la capture de signal", Lot C, 2026-08-30) :
          la même boucle canonique que MotifIcons.tsx, racontée en prose
          avec de vrais effectifs à chaque étape, puis en chiffres. Tuiles
          .etat-metric/.etat-metric--{tone} réutilisées telles quelles
          (nouveau socle Codex Working, fdbd8bc "poser le socle clair des
          espaces privés", déjà utilisées par EtatRegistryHeader sur les 4
          pages registre) — même vocabulaire visuel plutôt qu'un 2e système
          de tuiles inventé pour ce bloc. Grille propre (pas
          .etat-metric-strip, qui fixe 2/4 colonnes en CSS partagé) pour
          tenir 5 étapes sans toucher un fichier CSS que Codex Working fait
          encore évoluer en parallèle. Palette : terracotta réservé à
          l'étape Décision (doctrine confirmée par le CEO, "socle clair",
          2026-08-30) ; ocre "attention" pour Situation (premier vrai
          rétrécissement) ; vert "positive" pour Résultat — les 3 tons déjà
          définis par .etat-metric, aucune teinte inventée ici. */}
      <section id="pipeline" className="scroll-mt-6 border-b border-[var(--etat-line)] py-11">
        <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />De la capture à la décision</p>
        <h2 className="etat-display etat-h2 mt-3.5 text-[27px]">Chaque signal suit le même chemin, jusqu’à la décision.</h2>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.6]" style={{ color: "rgba(11,26,42,.68)" }}>
          Les {totalSignalsCaptes} signaux captés ont donné lieu à {situationsQualifiees} situations qualifiées à ce jour — un signal peut aussi rester en observation, se rattacher à un constat, ou être écarté sans jamais devenir une situation. {situationsEngagees} sont activement engagées dans la boucle de coordination ; {situationsDecidees} portent déjà au moins une décision documentée ({totalDecisions} décisions au total), et {situationsAvecResultat} affichent un résultat constaté sur le terrain.
        </p>

        {/* grid-cols-1 jusqu'à lg (correctif vérifié sur capture mobile) :
            5 étapes ne se divisent proprement ni par 2 ni par 3 — un
            grid-cols-2/3 intermédiaire laissait une cellule vide en bas de
            grille. Empilement simple en dessous de lg, rangée unique de 5
            seulement à partir de lg (seul diviseur propre). */}
        <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-[3px] border border-[var(--etat-line)] bg-[var(--etat-line)] lg:grid-cols-5" aria-label="De la capture à la décision, par étape">
          <div className="etat-metric">
            <p className="etat-metric-value"><NumberTicker value={totalSignalsCaptes} /></p>
            <p className="etat-metric-label">Signal</p>
            <p className="etat-metric-detail">Captés, tous canaux confondus</p>
          </div>
          <div className="etat-metric">
            <p className="etat-metric-value"><NumberTicker value={situationsQualifiees} /></p>
            <p className="etat-metric-label">Qualification</p>
            <p className="etat-metric-detail">Devenus une situation suivie</p>
          </div>
          <div className="etat-metric etat-metric--attention">
            <p className="etat-metric-value"><NumberTicker value={situationsEngagees} /></p>
            <p className="etat-metric-label">Situation</p>
            <p className="etat-metric-detail">Engagées dans la boucle de coordination</p>
          </div>
          <div className="etat-metric etat-metric--critical">
            <p className="etat-metric-value"><NumberTicker value={situationsDecidees} /></p>
            <p className="etat-metric-label">Décision</p>
            <p className="etat-metric-detail">{totalDecisions} décisions documentées</p>
          </div>
          <div className="etat-metric etat-metric--positive">
            <p className="etat-metric-value"><NumberTicker value={situationsAvecResultat} /></p>
            <p className="etat-metric-label">Résultat</p>
            <p className="etat-metric-detail">Constaté et consigné sur le terrain</p>
          </div>
        </div>
      </section>

      {/* Chapitre 1 — Atlas + brief territorial (mandat §5, Lot B ;
          recomposé Lot 1 correctif CEO 2026-08-22 ; recomposé une 2e fois
          "Brief national" 2026-08-23). Historique : le H1 pleine largeur
          d'origine avait été aplati en simple eyebrow dans la carte (Lot 1,
          la référence de l'époque ne montrait pas de gros titre) — la
          nouvelle référence en redemande un explicitement, "Brief national"
          plus haut (bande titre+filtres) en est désormais le vrai H1
          sémantique ; l'eyebrow "Atlas de supervision" dans la carte
          redescend en simple <p>, un seul H1 par page. */}
      <section id="terrain" className="scroll-mt-6">
        {/* grid-cols-1 explicite (Lot 1, correctif débordement mobile) :
            sans lui, la piste implicite d'une grille display:grid en
            dessous de lg n'a pas de minmax(0, 1fr) — le texte tronqué
            "Prochaine étape" (nouveau dans ce lot) laissait fuir sa
            largeur min-content non contrainte, poussant toute la piste
            (donc la carte ET le panneau) à ~393px sur un viewport à
            390px. Confirmé par script (git stash sur ce lot : aucun
            débordement avant, +23px après) avant d'écrire ce correctif. */}
        {/* lg:h-[480px] (mandat XXL-RC1 §1, "la carte doit devenir le
            moment visuel dominant du chapitre territorial") : remplace le
            390px du lot "Brief national" (2026-08-23) — ce lot avait
            délibérément compressé la carte au profit du texte ; le
            contre-audit visuel indépendant (Pass 2) constate que la carte,
            censée porter la signature territoriale du produit, en devient
            "l'élément le plus discret de l'écran". Correction de
            composition pure : plus de hauteur, donc plus de respiration —
            ni la géométrie (CoastlineTerritoryMap, coastlinePath,
            territoryMapPositions), ni les données, ni le récit du panneau
            ne changent. Le mécanisme qui exige cette hauteur PROPRE sur la
            ligne de grille (pas seulement lg:items-stretch) reste celui
            identifié le 2026-08-22 : un enfant lg:h-full imbriqué dans un
            item de grille sans hauteur à soi ne se résout pas de façon
            fiable. overflow-y-auto sur l'aside (plus bas) reste le filet
            de sécurité, désormais avec plus de marge qu'avant.
            Ratio 70/30 (XXL-RC1, remplace 66/34) : la carte gagne en
            largeur en plus de la hauteur — l'aside conserve largement de
            quoi afficher son format éditorial complet (nature/pourquoi/
            à considérer/prochaine étape/2 CTA), vérifié aux 5 largeurs de
            test du mandat (1440/1280/1024/768/390) sans passer par le
            filet overflow-y-auto en pratique. */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:h-[480px] lg:grid-cols-[70fr_30fr]">
          {/* Carte — signature cartographique unique (XXL-R5.5, cf.
              historique en tête de fichier) : CoastlineTerritoryMap avec
              ses couleurs par défaut (calibrées pour .etat-scope, déjà le
              cas avant le détour AtlasImageMap du 2026-08-27) — fond
              .etat-panel blanc, terre --etat-offwhite-dim, structure
              --etat-navy-600, aucune teinte inventée pour ce lot. Composé
              en entier (preserveAspectRatio="xMidYMid meet") : le
              national se voit toujours en un seul cadre, jamais recadré
              comme une photo qu'on pan/zoome. territories={"{state.territories}"}
              volontairement non filtré (mandat §6, "présence territoriale
              ≠ niveau d'attention") : les 18 territoires documentés sont
              tous dessinés — seuls les non-"stable" portent un libellé
              (comportement natif du composant, cf. CoastlineTerritoryMap.tsx),
              la liste latérale "À arbitrer"/"Programmes" plus bas reste,
              elle, scopée à ce qui mérite réellement l'attention. */}
          <div className="etat-panel relative overflow-hidden">
            <div className="relative flex items-center justify-between gap-3 px-4 pt-4">
              {/* Libellé "Atlas de supervision" (mandat "nouvelle DA Vue
                  d'ensemble") : reprend le titre de la maquette — même
                  élément, même rôle sémantique (H1 de ce chapitre), texte
                  aligné sur la référence. Plus besoin d'une plaque
                  bg-white/90 pour le contraste (correctif CEO 2026-08-22) :
                  posé directement sur le fond .etat-panel blanc de la
                  carte, plus sur une photo aux zones sombres imprévisibles. */}
              <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />Atlas de supervision</p>
              {/* "Vue nationale" (conservé XXL-R5.5) : reste un vrai
                  désélecteur même sans caméra à recentrer — un territoire
                  mis en avant (sélection explicite ou dominant par défaut)
                  reste visuellement souligné (selectedId ci-dessous) tant
                  qu'on ne revient pas explicitement au national. */}
              {cameraTargetId && (
                <button onClick={() => { setSelectedTerritoryId(null); setCameraForcedNational(true); }} className="etat-btn etat-btn-outline shrink-0 text-xs"><Compass size={13} /> Vue nationale</button>
              )}
            </div>

            {/* Légende "Niveau d'attention" (mandat "nouvelle DA Vue
                d'ensemble", Décision 2 : 3 catégories réelles, pas les 5
                de la maquette). Territory.activity n'a que "stable" |
                "vigilance" | "critique" (confirmé domain/types.ts) —
                "Élevé", "Normal" et "Non évalué" de la maquette n'ont
                aucune valeur correspondante dans le modèle et ne sont pas
                reproduits. Mêmes couleurs que glyphBorderColor/
                statusTagLabel, déjà utilisées ailleurs sur cette page
                (marqueurs de carte, carrousel) — pas une nouvelle
                palette pour cette légende.
                hidden lg:block (trouvé en vérifiant le rendu mobile réel,
                pas supposé sain par défaut) : sur le viewport compact
                (carte réduite à aspect-[4/5]), cette légende chevauchait
                géométriquement le marqueur "Rufisque-Bargny" et le
                rendait réellement inaccessible au clic (confirmé par
                locator.click() en échec, pas seulement visuellement) —
                pas un simple souci esthétique. Masquée sous lg, même
                discipline que la sidebar (EtatSidebar) qui suit le même
                point de rupture pour la même raison : un raffinement de
                supervision desktop, pas une régression fonctionnelle
                acceptée sur mobile où l'espace de la carte est déjà
                contraint. */}
            <div className="etat-panel absolute left-4 top-16 z-10 hidden bg-white/95 p-3 text-xs lg:block">
              <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Niveau d’attention</p>
              <div className="mt-2 space-y-1.5">
                {(["critique", "vigilance", "stable"] as const).map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: glyphBorderColor[status] }} />
                    <span className="text-[var(--etat-navy)]" style={{ fontFamily: "var(--etat-font-body)" }}>{statusTagLabel[status]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* P2.DESIGN-1A (addendum CEO "Cartography is non-negotiable") —
                TerritoryAtlasCanvas remplace CoastlineTerritoryMap ici :
                même donnée géométrique réelle et calibrée
                (territory-map-positions.ts, aucune position inventée),
                rendu entièrement neuf (mer pleine cadre, texture, ombre
                portée, étiquettes en pastille) scopé à cette page et à
                /app/etat/territoires — CoastlineTerritoryMap reste
                inchangé pour Public/Pro/Pilotage, hors périmètre de ce
                lot. */}
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:h-full" style={{ background: atlasSeaBackground }}>
              <TerritoryAtlasCanvas
                territories={state.territories}
                selectedId={cameraTargetId ?? undefined}
                onSelect={(id) => { setSelectedTerritoryId(id); setCameraForcedNational(false); }}
              />
            </div>
          </div>

          {/* overflow-y-auto (correctif CEO 2026-08-22, conservé) : filet de
              sécurité maintenant que la ligne a une hauteur fixe
              (lg:h-[480px], XXL-RC1) — si le contenu du panneau dépasse
              malgré tout cette hauteur, il défile en interne au lieu de
              repousser la carte.

              Format éditorial (mandat "Brief national", §3, côté brief
              34%) : "nature de la situation, pourquoi elle mérite
              l'attention, points à considérer (2-3 max, réels), prochaine
              étape, deux CTA". Reformulation du contenu déjà réel de ce
              panneau (Lot 1/nouvelle DA), pas une nouvelle source de
              données — aucun champ Situation/CoordinationSpace inventé :
              - Nature : dominantPrioritySituation.title (déjà utilisé
                ailleurs, ex. le tiroir Situation) — rangée omise plutôt que
                remplie d'un texte fabriqué quand aucune situation
                prioritaire n'existe (territoire calme).
              - Pourquoi : panelDescription, réutilisé tel quel (déjà une
                phrase de justification dans les 4 branches dominant.kind,
                pas une reformulation).
              - À considérer : territoryKpis, MÊME tableau que le Lot
                précédent (3 entrées réelles : situations ouvertes /
                capacités fragiles/indisponibles / sorties en mer en
                cours), seulement rendu en lignes plutôt qu'en grille de
                tuiles — aucun 4e point ajouté pour coller au "2-3" de la
                maquette, le tableau réel en compte 3.
              - Prochaine étape : dominantPrioritySituation.nextStep,
                inchangé. */}
          <aside className="etat-panel flex flex-col overflow-y-auto p-6" style={{ borderLeftWidth: 3, borderLeftColor: panelBorderColor }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5" style={{ color: panelBorderColor }}>
                <TensionGlyph status={panelGlyphStatus} size={24} pulse={panelGlyphStatus !== "stable"} />
                <p className="text-[10px] font-semibold uppercase tracking-[.14em]" style={{ fontFamily: "var(--etat-font-body)" }}>{panelEyebrow}</p>
              </div>
              {/* StatusBadge (mandat "nouvelle DA Vue d'ensemble") : réutilise
                  le composant déjà utilisé dans le carrousel "Où concentrer
                  l'attention" (arbitrage Lot 0 : pas un nouveau composant) —
                  qualification réelle à côté de l'eyebrow, comme la maquette. */}
              <StatusBadge status={panelGlyphStatus} />
            </div>
            <h2 className="etat-h2 mt-3 text-xl">{panelHeading}</h2>
            {/* Zone (Territory.region, mandat "nouvelle DA Vue d'ensemble") :
                champ réel confirmé au Lot 0, absent jusqu'ici de CE panneau
                (déjà présent dans le tiroir Territoire). Affiché seulement
                pour une sélection explicite — dominant.kind "calme"/"signal"
                n'a pas de territoire unique à qualifier par une zone. */}
            {selectedTerritoryId && focusTerritory && <p className="mt-1 text-xs font-semibold text-[var(--etat-stone-400)]">{focusTerritory.region}</p>}
            {selectedTerritoryId && (
              <button onClick={() => { setSelectedTerritoryId(null); setCameraForcedNational(false); }} className="mt-2 self-start text-[11px] font-semibold text-[var(--etat-stone-400)] underline decoration-dotted underline-offset-2 hover:text-[var(--etat-stone-600)]">Revenir à la lecture par défaut</button>
            )}

            {dominantPrioritySituation && (
              <div className="mt-4 flex items-start gap-2.5 border-t border-[var(--etat-line)] pt-4">
                <Flag size={15} className="mt-0.5 shrink-0 text-[var(--etat-stone-400)]" />
                <div className="min-w-0">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Nature de la situation</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--etat-navy-950)]">{dominantPrioritySituation.title}</p>
                </div>
              </div>
            )}

            <div className={`flex items-start gap-2.5 ${dominantPrioritySituation ? "mt-3" : "mt-4 border-t border-[var(--etat-line)] pt-4"}`}>
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[var(--etat-stone-400)]" />
              <div className="min-w-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Pourquoi cela mérite l’attention</p>
                <p className="mt-1 text-sm leading-6 text-[var(--etat-stone-600)]">{panelDescription}</p>
              </div>
            </div>

            {/* "À considérer aujourd'hui" (mandat) : mêmes 3 indicateurs
                réels que le Lot précédent (territoryKpis), en lignes
                plutôt qu'en tuiles — même discipline "2-3 max, réels", pas
                de 4e point ajouté pour remplir. */}
            {territoryKpis.length > 0 && (
              <div className="mt-3 flex items-start gap-2.5">
                <ListChecks size={15} className="mt-0.5 shrink-0 text-[var(--etat-stone-400)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>À considérer aujourd’hui</p>
                  <ul className="mt-1.5 space-y-1">
                    {territoryKpis.map((kpi) => (
                      <li key={kpi.label} className="flex items-baseline gap-1.5 text-sm text-[var(--etat-navy-950)]">
                        <span className="etat-display shrink-0 text-base not-italic font-semibold"><NumberTicker value={kpi.value} /></span>
                        <span className="min-w-0 break-words text-[var(--etat-stone-600)]">{kpi.label.toLowerCase()}{"caption" in kpi && kpi.caption ? ` · ${kpi.caption}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {dominantPrioritySituation && (
              <div className="mt-3 flex items-start gap-2.5 border-t border-[var(--etat-line)] pt-4">
                <Clock size={15} className="mt-0.5 shrink-0 text-[var(--etat-stone-400)]" />
                <div className="min-w-0">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Prochaine étape</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--etat-navy-950)]">{dominantPrioritySituation.nextStep}</p>
                </div>
              </div>
            )}

            {/* Libellés et ordre du mandat ("nouvelle DA Vue d'ensemble",
                §4, conservé) : "Voir la situation" (outline) puis "Ouvrir
                le territoire" (primaire). #arbitrage-detail (mandat "Brief
                national") : la table complète "Situations à arbitrer" a
                changé d'ancre (destination secondaire, cf. section
                "À arbitrer" plus bas) — même destination finale, ancre
                renommée pour rester cohérente avec le nouveau plan de la
                page. */}
            <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
              {dominantPrioritySituation ? (
                // CTA (mandat "Vertical Slice Joal", §7) : "Comprendre
                // pourquoi" quand le dossier résout à un vrai Finding — la
                // signature produit centrale de ce lot — sinon "Examiner la
                // situation", jamais un "Voir détail" générique.
                <button onClick={() => setSituationDrawer(dominantPrioritySituation)} className="etat-btn etat-btn-outline justify-center">{dominantFinding ? "Comprendre pourquoi" : "Examiner la situation"} <ArrowRight size={15} /></button>
              ) : (
                <a href="#arbitrage-detail" className="etat-btn etat-btn-outline justify-center">Voir les situations à arbitrer <ArrowRight size={15} /></a>
              )}
              {focusTerritory && <button className="etat-btn etat-btn-primary justify-center" onClick={() => setTerritoryDrawer(focusTerritory)}>Ouvrir le territoire <ArrowRight size={15} /></button>}
            </div>
          </aside>
        </div>

        {/* Bande resserrée (mandat "Brief national", §4 : "~73-80px de
            haut, nettement plus fine que les ~105px annoncés" — mesure
            directe du CEO, contredit le chiffre de la maquette elle-même).
            py-5→py-3, text-xl→text-lg : mêmes 5 agrégats réels qu'avant
            (aucun retiré, aucun ajouté), juste un gabarit plus compact.
            Lien de fin repointé vers /app/etat/rapport (arbitrage CEO
            "Brief national") : #performance n'existe plus sur cette page
            (Chapitre 3 retiré) — /app/etat/rapport reste "la seule
            destination preuve pleinement construite aujourd'hui", même
            raisonnement que "Résultats et effets" dans "Ce qui est
            documenté" plus bas. */}
        <div className="etat-headline-strip mt-5">
          <div className="etat-headline-cell">
            <p className="etat-headline-value"><NumberTicker value={situationsOuvertesTotal} /></p>
            <p className="etat-headline-label">Situations ouvertes</p>
          </div>
          <div className="etat-headline-cell">
            <p className="etat-headline-value"><NumberTicker value={situationsCritiquesHautesTotal} /></p>
            <p className="etat-headline-label">Critiques/hautes</p>
          </div>
          <div className="etat-headline-cell">
            <p className="etat-headline-value"><NumberTicker value={territoiresActifs} /></p>
            <p className="etat-headline-label">Territoires couverts</p>
          </div>
          <div className="etat-headline-cell">
            <p className="etat-headline-value"><NumberTicker value={capacitesFragilesTotal} /></p>
            <p className="etat-headline-label">Capacités fragiles</p>
          </div>
          <div className="etat-headline-cell">
            <p className="etat-headline-value">{formatFcfa(financementEngageTotal)}</p>
            <p className="etat-headline-label">Financement engagé</p>
          </div>
          <div className="etat-headline-cell flex flex-col justify-between">
            <p className="etat-headline-value"><NumberTicker value={programmesActifsTotal} /></p>
            <div className="flex items-end justify-between gap-3">
              <p className="etat-headline-label">Programmes actifs</p>
              <Link href="/app/etat/rapport" className="mb-[1px] flex shrink-0 items-center gap-1 text-[10.5px] font-semibold text-[var(--etat-terracotta)] hover:text-[var(--etat-terracotta-hover)]" style={{ fontFamily: "var(--etat-font-body)" }}>Détail <ArrowRight size={11} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 sections sous le fold (mandat "Brief national", §6, mapping
          tranché par le CEO — "À arbitrer"/"Programmes à suivre" en
          teaser de 3 réels + "Voir tout" ; "Ce qui est documenté" en 3
          liens de navigation, sans donnée à calculer — la maquette
          elle-même n'affiche qu'un tiret "—" identique sur ses 3 lignes,
          pas un chiffre placeholder à reproduire).

          Navigation par page (correctif CEO 2026-08-26, "pas de scroll
          infini") : les 3 destinations pointent désormais vers de vraies
          routes (/app/etat/arbitrages, /app/etat/programmes,
          /app/etat/redevabilite) plutôt que des ancres plus bas sur
          cette même page — les registres complets (table/filtres/
          recherche pour Arbitrages, portefeuille filtrable pour
          Programmes, chronologie pour Décisions) ont été extraits vers
          ces pages, PROPREMENT (composants/constantes partagés déplacés
          dans src/components/etat/shared.tsx, aucune reconstruction —
          "Résultats et effets"/"Rapports et redevabilité" restent
          inchangés, ils pointaient déjà vers de vraies pages
          (/app/etat/rapport) avant ce correctif. Le Brief national
          s'arrête ici : carte + brief du jour + synthèse + ces 3
          teasers, rien de plus en dessous (plus de chapitres complets,
          plus de bandeau passerelle — cf. suite du fichier). */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="etat-panel p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />À arbitrer</p>
            <Link href="/app/etat/arbitrages" className="flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--etat-navy-800)] hover:text-[var(--etat-navy-600)]">Voir tout <ArrowRight size={12} /></Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {situationsTeaser.length === 0 ? (
              <p className="text-sm text-[var(--etat-stone-600)]">Aucune situation critique ou de risque élevé en attente d’arbitrage.</p>
            ) : situationsTeaser.map((situation) => {
              const territory = state.territories.find((item) => item.id === situation.territoryId);
              const tag = priorityToTag[situation.priority];
              return (
                <div key={situation.id} className="flex items-start justify-between gap-2 border-t border-[var(--etat-line)] pt-2.5 first:border-t-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--etat-navy-950)]">{situation.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--etat-stone-600)]">{territory?.name ?? situation.territoryId}</p>
                  </div>
                  <span className={`etat-tag shrink-0 ${tag === "critique" ? "etat-tag--critique" : "etat-tag--vigilance"}`}>{priorityLabels[situation.priority]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="etat-panel p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />Programmes à suivre</p>
            <Link href="/app/etat/programmes" className="flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--etat-navy-800)] hover:text-[var(--etat-navy-600)]">Voir tout <ArrowRight size={12} /></Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {programmesTeaser.length === 0 ? (
              <p className="text-sm text-[var(--etat-stone-600)]">Aucun programme ne correspond à ce filtre pour le moment.</p>
            ) : programmesTeaser.map(({ programme }) => (
              <div key={programme.id} className="flex items-start justify-between gap-2 border-t border-[var(--etat-line)] pt-2.5 first:border-t-0 first:pt-0">
                <p className="min-w-0 truncate text-sm font-semibold text-[var(--etat-navy-950)]">{programme.title}</p>
                <span className="etat-tag etat-tag--stable shrink-0">{initiativeStatusLabel[programme.status]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* "Ce qui est documenté" : 3 liens, aucune donnée calculée (cf.
            commentaire ci-dessus). "Décisions récentes" pointe désormais
            vers /app/etat/redevabilite (vraie page, correctif "pas de
            scroll infini") ; "Résultats et effets"/"Rapports et
            redevabilité" pointent vers /app/etat/rapport, inchangé —
            même raisonnement que le lien de la bande de synthèse plus
            haut ("seule destination preuve pleinement construite
            aujourd'hui"). */}
        <div className="etat-panel p-5">
          <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />Ce qui est documenté</p>
          <div className="mt-3">
            <Link href="/app/etat/redevabilite" className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 text-sm font-semibold text-[var(--etat-navy-950)] first:border-t-0 first:pt-0 hover:text-[var(--etat-navy-600)]">Décisions récentes <ArrowRight size={13} className="shrink-0 text-[var(--etat-stone-400)]" /></Link>
            <Link href="/app/etat/rapport" className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 text-sm font-semibold text-[var(--etat-navy-950)] hover:text-[var(--etat-navy-600)]">Résultats et effets <ArrowRight size={13} className="shrink-0 text-[var(--etat-stone-400)]" /></Link>
            <Link href="/app/etat/rapport" className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 text-sm font-semibold text-[var(--etat-navy-950)] hover:text-[var(--etat-navy-600)]">Rapports et redevabilité <ArrowRight size={13} className="shrink-0 text-[var(--etat-stone-400)]" /></Link>
          </div>
        </div>
      </div>
      </div>
      </div>

      {/* Bande de clôture éditoriale (mandat "Brief national", prototype
          Espace Etat.dc.html, écran Brief : bande sombre finale "Géej tasul
          yaakaar" — "la mer ne manque jamais d'espoir", proverbe wolof cité
          tel quel dans le prototype comme signature éditoriale de fin de
          page, pas une donnée produit. N'existait pas dans le code réel
          avant ce lot (confirmé par recherche) — ajoutée ici verbatim,
          texte de doctrine fixe, pleine largeur (hors des deux wrappers
          px-6/space-y-0 ci-dessus, comme le hero). etat-canvas-dark
          (déjà défini, réutilisé tel quel — pas un nouveau dégradé). */}
      <div className="etat-canvas-dark px-6 py-14 text-center lg:px-[60px]">
        <p className="etat-eyebrow etat-eyebrow--on-dark justify-center"><span className="etat-eyebrow-dot" />Géej tasul yaakaar</p>
        <p className="etat-h2 mx-auto mt-4 max-w-[560px] text-2xl" style={{ color: "var(--etat-cream)" }}>La mer ne manque jamais d’espoir.</p>
        <p className="mx-auto mt-3 max-w-[480px] text-[13px] leading-[1.6]" style={{ color: "rgba(247,243,233,.62)", fontFamily: "var(--etat-font-body)" }}>Proverbe wolof — le même esprit qui porte chaque pêcheur, chaque territoire, chaque décision documentée sur cette page.</p>
      </div>

      <Drawer open={!!territoryDrawer} onClose={() => setTerritoryDrawer(null)} eyebrow="Territoire" title={territoryDrawer?.name ?? ""}>
        {territoryDrawer && <TerritoryDetail territory={territoryDrawer} cases={cases.filter((item) => item.territoryId === territoryDrawer.id)} onOpenSituation={(situation) => { setTerritoryDrawer(null); setSituationDrawer(situation); }} />}
      </Drawer>
      {/* Panneau situation — correctif 2026-08-17 : "Arbitrer"/"Voir la
          situation"/"Ouvrir l'arbitrage"/"Entrer dans le dossier"
          pointaient tous vers /app/situations/[id] (groupe de routes
          (coordination)), dont la garde serveur redirige systématiquement
          le rôle institution vers /app/etat — retour silencieux, aucune
          erreur visible, CTA sans destination réelle pour ce rôle (bug
          signalé par le CEO, vérifié en conditions réelles, présent aux
          5 endroits ci-dessus). Corrigé en panneau inline plutôt qu'en
          nouvelle route : même pattern déjà correct pour "Voir le détail"
          (territoire) sur cette page — l'Institution n'a jamais quitté
          /app/etat pour explorer un territoire, pas de raison qu'elle le
          fasse pour une situation. Contenu volontairement en lecture
          (pas le poste de travail complet de SituationRoom.tsx, pensé
          pour le Coordinateur) — cohérent avec le rôle décisionnel de
          l'Institution. */}
      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""} size="lg">
        {situationDrawer && <SituationDetail situation={situationDrawer} state={state} onPlanVisit={() => { const territory = state.territories.find((item) => item.id === situationDrawer.territoryId); setSituationDrawer(null); setMissionDrawer({ key: `situation-${situationDrawer.id}`, territoryId: situationDrawer.territoryId, territoryLabel: territory?.name ?? situationDrawer.territoryId, raison: situationDrawer.title, action: situationDrawer.nextStep, glyphStatus: priorityToTag[situationDrawer.priority], suggestedObjective: "verification_vigilance" }); }} />}
      </Drawer>
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => { setMissionDrawer(null); void reload(); }} />}
      </Drawer>
    </div>
  );
}

// severityRank reste local : n'utilisé que par le calcul `dominant` de
// cette page, comme severityToTag plus haut.
function severityRank(severity: VigilanceSeverity) {
  return { faible: 0, moyenne: 1, haute: 2, critique: 3 }[severity];
}

