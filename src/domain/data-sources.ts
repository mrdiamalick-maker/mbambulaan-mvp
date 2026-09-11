// LOT V3.7 ("Arbitrages / Sources" — les deux derniers écrans du plan V3 à
// 8 écrans jamais couverts par un lot dédié, cf. le flag `screen` du
// prototype Claude Design : brief/atlas/situations/arbitrages/programmes/
// resultats/flux/sources) — même discipline pré-code A/B/C/D/E que tous
// les lots précédents (domain/atlas-overview.ts, programme-intelligence.ts,
// results-analytics.ts) : uniquement des lectures depuis un ProductState
// déjà chargé, aucune commande, aucune donnée fabriquée.
//
// Constat structurant (mandat "Respecte méticuleusement cette maquette. Je
// ne veux pas d'écarts") : l'écran « Sources » du prototype (fonction
// `sourcesVals`/`fluxVals`, 6 cartes) décrit 6 systèmes externes avec des
// libellés et des chiffres propres à SA fixture ("Teranga Data",
// "immatriculations vérifiées 18 % → 43 %"...) qui ne correspondent à
// AUCUNE donnée réelle de ce produit — les reproduire aurait fabriqué une
// provenance inexacte, à l'exact opposé de ce que cet écran affirme
// vouloir montrer ("chaque chiffre du produit porte la trace de son
// origine"). Ce module reprend donc la STRUCTURE exacte du prototype
// (grille de 6 cartes état/nom/description/conséquence + panneau
// "Principe") avec un contenu entièrement réel, vérifié par lecture directe
// du Core :
//  - Signal.channel (domain/types.ts) est le seul concept réel de "canal
//    d'entrée" du produit — 5 valeurs typées, jamais un canal inventé
//    (cf. le commentaire du champ lui-même : "espace_public" a été ajouté
//    précisément pour ne pas fabriquer de provenance inexacte). Regroupé
//    en 2 cartes réelles (terrain/poste de quai/relais structuré vs
//    téléphone/espace public), reflétant la même distinction "recoupé sur
//    site" / "déclaratif" que le reste du produit (TrustGlyph).
//  - Vessel.registration/trust (réel) : aucun champ ni commande ne relie
//    une pirogue à un registre national externe — vérifié par lecture de
//    types.ts et l'absence de tout appel réseau sortant dans
//    src/domain, src/server, src/app/api (grep direct, aucun fetch/axios
//    vers un système tiers nulle part dans le produit).
//  - Initiative.funding[].amountFcfa (réel) : saisi à la main par
//    programme (aucune commande de synchronisation budgétaire n'existe).
//  - Pêche industrielle / navires sous licence : absente à 100 % du
//    modèle de données (Vessel.type ne porte qu'une seule valeur,
//    "pirogue_artisanale") — catégorie D, absence totale honnêtement
//    déclarée plutôt qu'omise.
//  - Territory[]/Organization[] (réels) : référentiels saisis et
//    maintenus dans le produit, sans synchronisation externe.
import type { Organization, ProductState, Signal, Territory, TrustLevel, Vessel } from "@/domain/types";

export type DataSourceConnectionState = "connectee" | "non_connectee" | "manuelle" | "absente";

export interface DataSourceCard {
  key: string;
  name: string;
  connectionState: DataSourceConnectionState;
  stateLabel: string;
  what: string;
  effect: string;
}

export const dataSourceStateLabel: Record<DataSourceConnectionState, string> = {
  connectee: "Connectée",
  non_connectee: "Non connectée",
  manuelle: "Gérée manuellement",
  absente: "Absente du modèle"
};

// Couleurs déjà utilisées par l'Espace État (jamais une nouvelle palette) :
// vert = etat-vert (réel/vérifié), rouge = etat-critique (écart/absence),
// ambre = etat-ocre (intermédiaire), gris = stone-400 (hors-champ).
export const dataSourceStateColorVar: Record<DataSourceConnectionState, string> = {
  connectee: "var(--etat-vert)",
  non_connectee: "var(--etat-critique)",
  manuelle: "var(--etat-ocre)",
  absente: "var(--etat-stone-400)"
};

const CHANNEL_ON_SITE: Signal["channel"][] = ["terrain", "poste_quai", "whatsapp_structure"];
const CHANNEL_DECLARATIVE: Signal["channel"][] = ["telephone", "espace_public"];

function trustCount(items: Array<{ trust: TrustLevel }>, trust: TrustLevel): number {
  return items.filter((item) => item.trust === trust).length;
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count > 1 ? plural : singular;
}

export function dataSourceRegistry(state: ProductState): DataSourceCard[] {
  const onSiteSignals = state.signals.filter((signal) => CHANNEL_ON_SITE.includes(signal.channel));
  const declarativeSignals = state.signals.filter((signal) => CHANNEL_DECLARATIVE.includes(signal.channel));
  const onSiteVerified = trustCount(onSiteSignals, "verifiee");
  const declarativeVerified = trustCount(declarativeSignals, "verifiee");

  const totalFunding = state.initiatives.flatMap((initiative) => initiative.funding);
  const fundingTotalFcfa = totalFunding.reduce((sum, item) => sum + item.amountFcfa, 0);

  const verifiedVessels = state.vessels.filter((vessel: Vessel) => vessel.trust === "verifiee").length;

  const territories: Territory[] = state.territories;
  const organizations: Organization[] = state.organizations;

  return [
    {
      key: "terrain",
      name: "Signaux de terrain et de quai",
      connectionState: "connectee",
      stateLabel: dataSourceStateLabel.connectee,
      what: "Déclarations et relevés saisis directement par un agent ou un relais, sur le terrain, à un poste de quai, ou via un canal structuré.",
      effect: `${onSiteSignals.length} ${pluralize(onSiteSignals.length, "signal", "signaux")} sur ${state.signals.length} proviennent de ces canaux ; ${onSiteVerified} ${pluralize(onSiteVerified, "y atteint", "y atteignent")} aujourd’hui un niveau de connaissance vérifié.`
    },
    {
      key: "declaratif",
      name: "Déclarations téléphoniques et espace public",
      connectionState: "connectee",
      stateLabel: dataSourceStateLabel.connectee,
      what: "Appels et contributions publiques transmis sans passage par un relais mandaté sur site.",
      effect: `${declarativeSignals.length} ${pluralize(declarativeSignals.length, "signal", "signaux")} sur ${state.signals.length} proviennent de ces canaux ; ${declarativeVerified} ${pluralize(declarativeVerified, "y atteint", "y atteignent")} aujourd’hui un niveau de connaissance vérifié.`
    },
    {
      key: "budget",
      name: "Système budgétaire du ministère",
      connectionState: "non_connectee",
      stateLabel: dataSourceStateLabel.non_connectee,
      what: "Montants engagés par bailleur, pour chaque programme du portefeuille.",
      effect: `${totalFunding.length} ligne${totalFunding.length > 1 ? "s" : ""} de financement pour un total identifié de ${new Intl.NumberFormat("fr-FR").format(fundingTotalFcfa)} FCFA, saisies à la main. Aucun système budgétaire n’est connecté pour les recouper automatiquement.`
    },
    {
      key: "immatriculation",
      name: "Registre des pirogues",
      connectionState: "non_connectee",
      stateLabel: dataSourceStateLabel.non_connectee,
      what: "Immatriculation et rattachement capitaine / site de chaque pirogue enregistrée dans Mbàmbulaan.",
      effect: `${verifiedVessels} pirogue${verifiedVessels > 1 ? "s" : ""} sur ${state.vessels.length} porte${verifiedVessels > 1 ? "nt" : ""} aujourd’hui un niveau vérifié. Aucun registre national officiel n’est connecté pour recouper ce chiffre.`
    },
    {
      key: "peche-industrielle",
      name: "Pêche industrielle et suivi des navires",
      connectionState: "absente",
      stateLabel: dataSourceStateLabel.absente,
      what: "Positions et activité des navires sous licence, hors pirogues artisanales.",
      effect: "Cette activité est entièrement absente du modèle de données de Mbàmbulaan aujourd’hui — aucune vue du produit ne la couvre."
    },
    {
      key: "referentiels",
      name: "Référentiels institutionnels",
      connectionState: "manuelle",
      stateLabel: dataSourceStateLabel.manuelle,
      what: "Découpage territorial et organisations enregistrées dans Mbàmbulaan.",
      effect: `${territories.length} territoires et ${organizations.length} organisations sont saisis et mis à jour à la main. Aucune synchronisation avec un référentiel administratif externe n’existe.`
    }
  ];
}

export interface DataSourceSummary {
  connectedCount: number;
  totalCount: number;
  fundingTotalFcfa: number;
}

export function dataSourceSummary(state: ProductState): DataSourceSummary {
  const cards = dataSourceRegistry(state);
  const totalFunding = state.initiatives.flatMap((initiative) => initiative.funding);
  return {
    connectedCount: cards.filter((card) => card.connectionState === "connectee").length,
    totalCount: cards.length,
    fundingTotalFcfa: totalFunding.reduce((sum, item) => sum + item.amountFcfa, 0)
  };
}
