// LOT V3.7 (registre initial), corrigé au LOT V3.22 ("Sources — copie
// conforme littérale, seconde passe") : reprend cette fois les 6 noms de
// carte EXACTS de la maquette (`sourcesVals`), dans son ordre exact —
// "Relais de quai mandatés", "Formulaires et contributions", "Système
// budgétaire du ministère", "Registre national des immatriculations",
// "Systèmes de suivi des navires", "Référentiels institutionnels" — au
// lieu des 2 cartes reformulées ("Signaux de terrain et de quai" /
// "Déclarations téléphoniques et espace public") qui les remplaçaient à
// tort. Les textes "what"/"effect" du prototype sont repris mot pour mot
// partout où ils sont honnêtes pour ce produit (vérifié un par un
// ci-dessous) ; seule une vraie valeur chiffrée fabriquée par la fixture
// du prototype ("Elle couvre 4 sites sur 18") est remplacée par une
// mesure réelle équivalente.
//
// Vérification honnêteté, carte par carte (contre le Core réel) :
//  - "Relais de quai mandatés" : Signal.channel (domain/types.ts) est le
//    seul concept réel de canal d'entrée du produit. terrain/poste_quai/
//    whatsapp_structure sont les 3 canaux recoupés sur site — seuls eux
//    permettent Signal.trust==="verifiee" (TrustGlyph). Le nombre
//    "4 sites sur 18" de la fixture du prototype ne correspond à aucun
//    champ réel (Site n'a pas de notion de "relais mandaté" — vérifié).
//    Remplacé par : nombre réel de territoires ayant reçu au moins un
//    signal par ces canaux, sur le nombre réel total de territoires.
//  - "Formulaires et contributions" : telephone/espace_public sont les 2
//    canaux déclaratifs réels restants (jamais vérifiés sur site,
//    "espace_public" ajouté précisément pour ne pas fabriquer de
//    provenance — cf. le commentaire du champ lui-même dans types.ts).
//  - "Système budgétaire du ministère" : Initiative.funding[].amountFcfa
//    est saisi à la main, sans commande de synchronisation budgétaire
//    (vérifié par lecture de types.ts et l'absence de tout appel réseau
//    sortant dans src/domain, src/server, src/app/api).
//  - "Registre national des immatriculations" : Vessel.registration/trust
//    (réel) n'a aucun champ ni commande qui le relie à un registre
//    national externe.
//  - "Systèmes de suivi des navires" : Vessel.type ne porte qu'une seule
//    valeur, "pirogue_artisanale" — la pêche industrielle est absente à
//    100 % du modèle de données (catégorie honnêtement déclarée absente).
//  - "Référentiels institutionnels" : Territory[]/Organization[] (réels)
//    sont des référentiels saisis et maintenus dans le produit, sans
//    synchronisation externe. Le prototype qualifie cette carte "En
//    discussion" (une négociation en cours) — affirmation invérifiable
//    ici, donc non reprise : l'état réel honnête est "Gérée manuellement"
//    (même state que documenté depuis le LOT V3.7), seule divergence
//    delibérée de tout ce fichier vis-à-vis du texte litéral du
//    prototype, pour ne jamais fabriquer un statut de gouvernance.
import type { Organization, ProductState, Territory, TrustLevel, Vessel } from "@/domain/types";

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
  absente: "Non envisagée à ce stade"
};

// Couleurs — valeurs littérales exactes du prototype (rgb(78,123,90) /
// rgb(200,69,43) / rgb(216,154,74) / navy à 40%), qui se trouvent être
// déjà les tokens du système de design réel de l'Espace État (--etat-vert
// #4e7b5a, --etat-critique #c8452b, --etat-ocre #d89a4a) — aucune
// nouvelle palette introduite.
export const dataSourceStateColorVar: Record<DataSourceConnectionState, string> = {
  connectee: "var(--etat-vert)",
  non_connectee: "var(--etat-critique)",
  manuelle: "var(--etat-ocre)",
  absente: "rgba(11,26,42,.4)"
};

const CHANNEL_ON_SITE: Array<"terrain" | "poste_quai" | "whatsapp_structure"> = ["terrain", "poste_quai", "whatsapp_structure"];
const CHANNEL_DECLARATIVE: Array<"telephone" | "espace_public"> = ["telephone", "espace_public"];

function trustCount(items: Array<{ trust: TrustLevel }>, trust: TrustLevel): number {
  return items.filter((item) => item.trust === trust).length;
}

export function dataSourceRegistry(state: ProductState): DataSourceCard[] {
  const onSiteSignals = state.signals.filter((signal) => CHANNEL_ON_SITE.includes(signal.channel as (typeof CHANNEL_ON_SITE)[number]));
  const declarativeSignals = state.signals.filter((signal) => CHANNEL_DECLARATIVE.includes(signal.channel as (typeof CHANNEL_DECLARATIVE)[number]));
  const onSiteVerified = trustCount(onSiteSignals, "verifiee");
  const territoriesWithOnSite = new Set(onSiteSignals.map((signal) => signal.territoryId).filter((id): id is string => id != null));

  const totalFunding = state.initiatives.flatMap((initiative) => initiative.funding);
  const fundingTotalFcfa = totalFunding.reduce((sum, item) => sum + item.amountFcfa, 0);

  const verifiedVessels = state.vessels.filter((vessel: Vessel) => vessel.trust === "verifiee").length;

  const territories: Territory[] = state.territories;
  const organizations: Organization[] = state.organizations;

  return [
    {
      key: "relais-quai",
      name: "Relais de quai mandatés",
      connectionState: "connectee",
      stateLabel: dataSourceStateLabel.connectee,
      what: "Relevés horodatés de débarquements, pesées et heures de retour, produits par des personnes mandatées sur le terrain ou à un poste de quai.",
      effect: `C’est la seule source qui permet de faire passer un signal de « déclaré » à « vérifié » (${onSiteVerified} aujourd’hui). Elle couvre ${territoriesWithOnSite.size} territoire${territoriesWithOnSite.size > 1 ? "s" : ""} sur ${territories.length}.`
    },
    {
      key: "formulaires",
      name: "Formulaires et contributions",
      connectionState: "connectee",
      stateLabel: dataSourceStateLabel.connectee,
      what: "Déclarations d’acteurs, contributions publiques, signalements téléphoniques transcrits.",
      effect: `${declarativeSignals.length} ${declarativeSignals.length > 1 ? "signaux" : "signal"} sur ${state.signals.length} proviennent de ces canaux — alimente une part réelle du volume reçu, mais ne produit jamais seul un fait vérifié.`
    },
    {
      key: "budget",
      name: "Système budgétaire du ministère",
      connectionState: "non_connectee",
      stateLabel: dataSourceStateLabel.non_connectee,
      what: "Engagements, mandatements et exécution budgétaire des programmes.",
      effect: `Tous les montants du portefeuille (${totalFunding.length} ligne${totalFunding.length > 1 ? "s" : ""}, ${new Intl.NumberFormat("fr-FR").format(fundingTotalFcfa)} FCFA identifiés) proviennent de saisies manuelles. Aucun système budgétaire n’est connecté pour les recouper.`
    },
    {
      key: "immatriculation",
      name: "Registre national des immatriculations",
      connectionState: "non_connectee",
      stateLabel: dataSourceStateLabel.non_connectee,
      what: "Référentiel officiel des pirogues et embarcations enregistrées.",
      effect: `Le taux d’immatriculation vérifiée (${verifiedVessels} sur ${state.vessels.length}) est calculé sur un dénominateur estimé par Mbàmbulaan, pas sur le registre officiel.`
    },
    {
      key: "suivi-navires",
      name: "Systèmes de suivi des navires",
      connectionState: "absente",
      stateLabel: dataSourceStateLabel.absente,
      what: "Positions et activités de la pêche industrielle et des navires sous licence.",
      effect: "La pêche industrielle est entièrement absente de Mbàmbulaan aujourd’hui. Aucune lecture du produit ne la couvre."
    },
    {
      key: "referentiels",
      name: "Référentiels institutionnels",
      connectionState: "manuelle",
      stateLabel: dataSourceStateLabel.manuelle,
      what: "Découpage administratif, organisations enregistrées, données de référence du ministère.",
      effect: `${territories.length} territoires et ${organizations.length} organisations sont saisis et mis à jour à la main dans Mbàmbulaan, avec un risque de divergence dans le temps. Aucune synchronisation avec un référentiel administratif externe n’existe.`
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
