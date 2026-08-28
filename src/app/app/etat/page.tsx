"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Clock, Compass, Factory, Flag, ListChecks, Minus, Plus, Sailboat } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { Drawer } from "@/components/etat/Drawer";
import { SituationIcon } from "@/components/etat/MotifIcons";
import { AtlasImageMap } from "@/components/etat/AtlasImageMap";
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
import { type Situation, type Territory } from "@/domain/types";
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
// Écarts assumés vs la référence, validés par le CEO (2026-08-17) : pas de
// score de confiance composite fabriqué (§20, doctrine anti-score déjà
// appliquée ailleurs) ; pas de second acteur "proposé par / validé par"
// inventé pour le journal de décisions (le modèle n'a qu'un décideur).
// severityToTag reste local : n'utilisé que par le calcul `dominant` de
// cette page (aucun autre consommateur, pas déplacé vers shared.tsx).
const severityToTag: Record<VigilanceSeverity, "stable" | "vigilance" | "critique"> = { faible: "stable", moyenne: "vigilance", haute: "vigilance", critique: "critique" };

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
  // Zoom +/- (mandat "simplifier l'Atlas /app/etat", Lot C, 2026-08-27) :
  // même sémantique et mêmes bornes que l'ancienne caméra SVG (retirée au
  // Lot B) — facteur multiplicatif composé avec BASE_ZOOM_SCALE côté
  // AtlasImageMap (cameraFor). Réinitialisé à 1 sur tout changement de
  // cible caméra (effet plus bas), même raison qu'avant : un réglage
  // ponctuel de LA lecture en cours, pas un état qui "suit" d'un
  // territoire à l'autre.
  const [zoomFactor, setZoomFactor] = useState(1);
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 2.2;
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
  // Reset du zoom sur changement de cible caméra (hook, doit s'exécuter
  // inconditionnellement — placé ici, avant le garde-fou, même raison que
  // pour cameraTargetId juste au-dessus).
  useEffect(() => {
    setZoomFactor(1);
  }, [cameraTargetId]);

  if (!state) return null;

  const territoiresActifs = state.territories.length;

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
  const dominantPrioritySituation = [...dominantOpenSituations].sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])[0];

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

  return (
    <div className="etat-scope bg-[var(--etat-offwhite)] p-5 pb-16 lg:p-8">
      {/* Correctif CEO (retour "la page ne ressemble toujours pas au
          concept") : bandeau doctrine ET nav d'ancrage retirés ensemble
          de ce premier écran — les deux constats du CEO tenaient à la
          même cause (contenu ajouté avant le titre, absent de la
          référence). Bandeau doctrine : son contenu reste disponible
          ailleurs sur le produit (bandeau d'accueil Public, mentions
          légales), rien n'est perdu en le retirant d'ici. Nav d'ancrage :
          le CEO est explicite sur l'ERREUR précise du lot précédent —
          "remplacer une sidebar verticale par une nav horizontale qui
          montre toujours les 6 mêmes destinations ne respecte que la
          lettre de la décision, pas son esprit". Retirée plutôt que
          réduite : n'importe quelle rangée de liens en avant-plan
          juste sous le header aurait reproduit le même problème visuel.
          Les sections restent atteignables par défilement et par "Voir
          tout" (teasers plus bas) ; /app/etat/rapport garde sa sidebar
          complète, seule surface où une navigation permanente a été
          explicitement validée. */}

      {/* Titre + filtres (mandat "Brief national", §2 : "~104px de haut",
          mesure directe du CEO sur la maquette, pas une estimation
          visuelle). Remplace la toolbar filtres seule : "Brief national"
          redevient le vrai H1 sémantique de la page — l'eyebrow "Atlas de
          supervision" dans la carte (ci-dessous) redescend en simple
          libellé (p), un seul H1 par page. Sous-titre : texte éditorial
          nouveau (mandat, pas une donnée) — aucune correspondance
          existante trouvée ailleurs dans le produit, écrit pour ce lot.
          Filtres Périmètre/Période inchangés (même mécanisme, même
          libellés) — repositionnés à droite de cette même bande plutôt
          que dans leur propre toolbar séparée, comme demandé. */}
      <div className="etat-panel mt-3 flex flex-wrap items-center justify-between gap-6 px-5 py-4">
        <div>
          <h1 className="etat-display text-3xl not-italic text-[var(--etat-navy-950)]">Brief national</h1>
          <p className="mt-1 text-sm text-[var(--etat-stone-600)]">Filière pêche artisanale — supervision au service de la décision.</p>
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <label className="block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Périmètre</p>
            <select
              value={selectedTerritoryId ?? ""}
              onChange={(event) => { setSelectedTerritoryId(event.target.value || null); setCameraForcedNational(!event.target.value); }}
              className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
            >
              <option value="">Sénégal entier</option>
              {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => (
                <option key={territory.id} value={territory.id}>{territory.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Période</p>
            <select
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value)}
              title="S’applique aux débarquements et sorties en mer du panneau territorial."
              className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
            >
              <option value="all">Toutes les dates disponibles</option>
              {landingDates.map((date) => (
                <option key={date} value={date}>{new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Groupe des chapitres (correctif 2) : reprend exactement le
          space-y-16 qui régissait auparavant tout le conteneur racine —
          seul l'espacement AVANT ce groupe change (mt-4 au lieu des 64px
          de space-y-16 hérités du bandeau/nav/toolbar), le rythme entre
          #terrain et les chapitres suivants reste identique à avant. */}
      <div className="mt-4 space-y-16">
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
        {/* lg:h-[390px] (mandat "Brief national", §3 : "~390px de haut",
            mesure directe du CEO — remplace le 520px du lot précédent,
            compression significative assumée). Le mécanisme qui exige
            cette hauteur PROPRE sur la ligne de grille (pas seulement
            lg:items-stretch) reste celui identifié le 2026-08-22 : un
            enfant lg:h-full imbriqué dans un item de grille sans hauteur
            à soi ne se résout pas de façon fiable, cf. historique gardé
            plus haut. overflow-y-auto sur l'aside (plus bas) reste le
            filet de sécurité si le nouveau contenu éditorial dépasse
            malgré tout cette hauteur plus contrainte qu'avant.
            Ratio 66/34 (mesure directe du CEO, remplace 62/38) : même
            mécanique de grille, proportion réajustée à la nouvelle
            mesure. */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:h-[390px] lg:grid-cols-[66fr_34fr]">
          {/* Fond Atlas — asset d'illustration réel (mandat "intégrer
              l'asset d'illustration réelle", 2026-08-23), remplace
              l'habillage CSS/SVG précédent (dégradés "eau" + motif de
              vagues en <pattern> + Compass/Sailboat/Fish décoratifs,
              ajoutés au Lot 1 faute d'illustration réelle disponible à
              l'époque).

              Simplification Atlas (mandat CEO "image + marqueurs en
              pourcentage, pas de SVG calibré", 2026-08-27) : le polygone
              SVG calibré (CoastlineTerritoryMap, coastlinePath/
              territoryMapPositions) est abandonné pour CETTE page —
              décision stratégique du CEO de ne pas sur-investir dans la
              précision d'un Atlas stylisé destiné à être remplacé par une
              vraie API cartographique. Remplacé par AtlasImageMap,
              nouveau composant dédié : l'image ET les marqueurs
              (territory-map-image-positions.ts, calibré et vérifié Lot A)
              partagent désormais une seule référence — l'image elle-même,
              plus de polygone à synchroniser avec elle. /app/pilotage
              n'est pas concerné, CoastlineTerritoryMap.tsx reste utilisé
              là-bas tel quel.

              Lot B (ce lot) : composant statique, sans caméra — "Vue
              nationale" et le zoom +/- sont retirés temporairement de
              l'interface plus bas (cf. commentaires sur place), restaurés
              par le Lot C (caméra en transform CSS), déjà planifié et
              approuvé par le CEO. */}
          <div className="etat-panel relative overflow-hidden">
            {/* Lisibilité (mandat point 6 : "priorité fonctionnelle,
                l'esthétique ne doit jamais nuire") : voile clair
                translucide entre la photo et le tracé/les libellés — le
                fond réel a des zones sombres (bas-gauche) et un ciel
                très clair (haut-droite) qui, seules, faisaient perdre du
                contraste aux libellés "vigilance" (ocre) une fois posés
                dessus (vérifié par capture avant/après ce voile). Blanc
                à faible opacité, pas une nouvelle teinte D9 — n'altère
                pas la lecture des couleurs du tracé/marqueurs, seulement
                leur contraste sur le fond. */}
            <div className="pointer-events-none absolute inset-0 bg-white/30" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3 px-4 pt-4">
              {/* Contraste (correctif CEO 2026-08-22) : etat-eyebrow--on-dark
                  seul (ocre sur fond eau clair par endroits) restait
                  quasi illisible à la capture — petite plaque bg-white/90
                  identique au traitement déjà utilisé pour le bouton
                  "Vue nationale" juste à côté, pas une nouvelle couleur.
                  Libellé "Atlas de supervision" (mandat "nouvelle DA Vue
                  d'ensemble") : reprend le titre de la maquette, remplace
                  "Lecture territoriale" — même élément, même rôle
                  sémantique (H1 de ce chapitre), texte aligné sur la
                  nouvelle référence. */}
              <p className="etat-eyebrow rounded-full bg-white/90 px-3 py-1.5">Atlas de supervision</p>
              {/* Caméra Atlas (restauré Lot C, mandat "simplifier l'Atlas
                  /app/etat", 2026-08-27 — retiré temporairement au Lot B
                  le temps de construire AtlasImageMap sans caméra, cf.
                  historique). Même comportement qu'avant la simplification :
                  visible dès qu'un cadrage régional est actif, y compris
                  par défaut au chargement (territoire dominant). Condition
                  sur cameraTargetId (pas selectedTerritoryId) : la caméra
                  peut être resserrée sans sélection explicite (calcul
                  dominant), il faut quand même pouvoir en sortir. */}
              {cameraTargetId && (
                <button onClick={() => { setSelectedTerritoryId(null); setCameraForcedNational(true); }} className="etat-btn etat-btn-outline shrink-0 bg-white/90 text-xs"><Compass size={13} /> Vue nationale</button>
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
            <div className="etat-panel absolute left-4 top-16 z-10 hidden bg-white/95 p-3 text-xs shadow-sm lg:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Niveau d’attention</p>
              <div className="mt-2 space-y-1.5">
                {(["critique", "vigilance", "stable"] as const).map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: glyphBorderColor[status] }} />
                    <span className="text-[var(--etat-navy-800)]">{statusTagLabel[status]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zoom +/- (restauré Lot C) : agit sur zoomFactor, composé
                avec BASE_ZOOM_SCALE côté AtlasImageMap (cameraFor) — même
                interpolation rAF que le reste de la caméra (useAnimatedCamera),
                aucun nouveau mécanisme d'animation. Bornes désactivent
                visuellement le bouton correspondant plutôt que de le
                laisser sans effet silencieux. */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
              <button
                aria-label="Zoom avant"
                disabled={zoomFactor <= ZOOM_MIN}
                onClick={() => setZoomFactor((value) => Math.max(ZOOM_MIN, +(value - 0.3).toFixed(2)))}
                className="etat-btn etat-btn-outline bg-white/95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ minHeight: 32, minWidth: 32, padding: 0 }}
              >
                <Plus size={15} />
              </button>
              <button
                aria-label="Zoom arrière"
                disabled={zoomFactor >= ZOOM_MAX}
                onClick={() => setZoomFactor((value) => Math.min(ZOOM_MAX, +(value + 0.3).toFixed(2)))}
                className="etat-btn etat-btn-outline bg-white/95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ minHeight: 32, minWidth: 32, padding: 0 }}
              >
                <Minus size={15} />
              </button>
            </div>

            {/* lg:min-h-[520px] retiré (correctif CEO, compression du lot
                précédent) : reliquat du gabarit 520px d'avant ce lot,
                incohérent avec la ligne de grille désormais fixée à
                lg:h-[390px] plus haut — sans effet visuel observé
                (overflow-hidden du conteneur .etat-panel absorbait déjà
                l'écart) mais trompeur à la lecture, nettoyé. */}
            <div className="relative aspect-[4/5] p-4 sm:aspect-[3/4] lg:aspect-auto lg:h-full">
              <AtlasImageMap
                territories={state.territories}
                selectedId={selectedTerritoryId ?? undefined}
                onSelect={(id) => { setSelectedTerritoryId(id); setCameraForcedNational(false); }}
                cameraTargetId={cameraTargetId}
                zoomFactor={zoomFactor}
              />
            </div>
          </div>

          {/* overflow-y-auto (correctif CEO 2026-08-22, conservé) : filet de
              sécurité maintenant que la ligne a une hauteur fixe
              (lg:h-[390px], resserrée par ce lot) — si le contenu du
              panneau dépasse malgré tout cette hauteur plus contrainte
              qu'avant, il défile en interne au lieu de repousser la carte.

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
          <aside className="etat-panel flex flex-col overflow-y-auto p-6" style={{ borderLeftWidth: 4, borderLeftColor: panelBorderColor }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5" style={{ color: panelBorderColor }}>
                <TensionGlyph status={panelGlyphStatus} size={26} pulse={panelGlyphStatus !== "stable"} />
                <p className="text-[11px] font-bold uppercase tracking-widest">{panelEyebrow}</p>
              </div>
              {/* StatusBadge (mandat "nouvelle DA Vue d'ensemble") : réutilise
                  le composant déjà utilisé dans le carrousel "Où concentrer
                  l'attention" (arbitrage Lot 0 : pas un nouveau composant) —
                  qualification réelle à côté de l'eyebrow, comme la maquette. */}
              <StatusBadge status={panelGlyphStatus} />
            </div>
            <h2 className="etat-display mt-3 text-xl not-italic text-[var(--etat-navy-950)]">{panelHeading}</h2>
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Nature de la situation</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--etat-navy-950)]">{dominantPrioritySituation.title}</p>
                </div>
              </div>
            )}

            <div className={`flex items-start gap-2.5 ${dominantPrioritySituation ? "mt-3" : "mt-4 border-t border-[var(--etat-line)] pt-4"}`}>
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[var(--etat-stone-400)]" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Pourquoi cela mérite l’attention</p>
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">À considérer aujourd’hui</p>
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Prochaine étape</p>
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
                <button onClick={() => setSituationDrawer(dominantPrioritySituation)} className="etat-btn etat-btn-outline justify-center">Voir la situation <ArrowRight size={15} /></button>
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
        <div className="etat-panel mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 divide-x divide-[var(--etat-line)] p-3">
          <div className="pl-0">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]"><NumberTicker value={situationsOuvertesTotal} /></p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Situations ouvertes</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]"><NumberTicker value={territoiresActifs} /></p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Territoires couverts</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]"><NumberTicker value={capacitesFragilesTotal} /></p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Capacités fragiles</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]">{formatFcfa(financementEngageTotal)}</p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Financement engagé</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]"><NumberTicker value={programmesActifsTotal} /></p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Programmes actifs</p>
          </div>
          <Link href="/app/etat/rapport" className="ml-auto flex shrink-0 items-center gap-1.5 pl-8 text-xs font-bold text-[var(--etat-navy-800)] hover:text-[var(--etat-navy-600)]">Voir le détail de la performance <ArrowRight size={13} /></Link>
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
            <p className="etat-eyebrow">À arbitrer</p>
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
            <p className="etat-eyebrow">Programmes à suivre</p>
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
          <p className="etat-eyebrow">Ce qui est documenté</p>
          <div className="mt-3">
            <Link href="/app/etat/redevabilite" className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 text-sm font-semibold text-[var(--etat-navy-950)] first:border-t-0 first:pt-0 hover:text-[var(--etat-navy-600)]">Décisions récentes <ArrowRight size={13} className="shrink-0 text-[var(--etat-stone-400)]" /></Link>
            <Link href="/app/etat/rapport" className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 text-sm font-semibold text-[var(--etat-navy-950)] hover:text-[var(--etat-navy-600)]">Résultats et effets <ArrowRight size={13} className="shrink-0 text-[var(--etat-stone-400)]" /></Link>
            <Link href="/app/etat/rapport" className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 text-sm font-semibold text-[var(--etat-navy-950)] hover:text-[var(--etat-navy-600)]">Rapports et redevabilité <ArrowRight size={13} className="shrink-0 text-[var(--etat-stone-400)]" /></Link>
          </div>
        </div>
      </div>
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
      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""}>
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

