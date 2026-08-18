import type { ProductState, Role, Situation, SituationStatus, TrustLevel } from "@/domain/types";

const now = "2026-07-29T08:30:00.000Z";
const tomorrow = "2026-07-30T16:00:00.000Z";

const actor = (
  id: string,
  name: string,
  role: Role,
  organizationId: string,
  territoryIds: string[],
  verified = true
): ProductState["actors"][number] => ({
  id,
  name,
  role,
  organizationId,
  territoryIds,
  phone: "+221 77 000 00 00",
  verified
});

function situation(
  id: string,
  territoryId: string,
  title: string,
  status: SituationStatus,
  trust: TrustLevel,
  nextStep: string,
  priority: Situation["priority"] = "haute"
): Situation {
  const resultBySituation: Record<string, string> = {
    "sit-kafountine": "1,2 tonne regroupée et livrée au marché régional sans rupture documentée",
    "sit-glace": "Production de glace rétablie à 80 % de capacité"
  };
  const confirmationBySituation: Record<string, string> = {
    "sit-kafountine": "Bordereau de livraison et confirmations des trois participants",
    "sit-glace": "Constat terrain signé et photo horodatée"
  };
  const coordinationBySituation: Record<string, string> = {
    "sit-glace": "coord-froid",
    "sit-saint-louis": "coord-securite",
    "sit-rufisque": "coord-rufisque",
    "sit-djiffer": "coord-djiffer",
    "sit-kafountine": "coord-casamance"
  };
  return {
    id,
    reference: `MBA-SIT-${id.slice(-4).toUpperCase()}`,
    signalIds: [`obs-${id}`],
    territoryId,
    title,
    description: title,
    status,
    priority,
    trust,
    visibility: "partenaires",
    responsibleId: ["coordination", "intervention", "attente"].includes(status) ? "act-coordinateur" : undefined,
    dueAt: ["coordination", "intervention", "attente"].includes(status) ? tomorrow : undefined,
    waitingReason: status === "attente" ? "Pièce de rechange en acheminement depuis Dakar" : undefined,
    nextStep,
    result: ["resultat", "reglee"].includes(status) ? resultBySituation[id] ?? "Résultat documenté dans la situation" : undefined,
    confirmation: ["resultat", "reglee"].includes(status) ? confirmationBySituation[id] ?? "Confirmation du responsable territorial" : undefined,
    coordinationId: coordinationBySituation[id],
    initiativeId: ["sit-glace", "sit-mbour", "sit-kayar"].includes(id) ? "init-froid" : id === "sit-saint-louis" ? "init-securite" : undefined,
    history: [{ id: `hist-${id}`, at: now, actor: "act-operateur", label: "Signal reçu", detail: title }]
  };
}

export function createDemoState(): ProductState {
  const territoryRows = [
    ["joal", "Joal-Fadiouth", "Fatick", 14.17, -16.83, "critique"],
    ["mbour", "Mbour", "Thiès", 14.42, -16.97, "vigilance"],
    ["kayar", "Kayar", "Thiès", 14.92, -17.12, "vigilance"],
    ["saint-louis", "Saint-Louis", "Saint-Louis", 16.03, -16.49, "stable"],
    ["hann", "Hann", "Dakar", 14.71, -17.43, "vigilance"],
    ["soumbedioune", "Soumbédioune", "Dakar", 14.68, -17.46, "stable"],
    ["rufisque", "Rufisque-Bargny", "Dakar", 14.72, -17.27, "vigilance"],
    ["djiffer", "Djiffer", "Fatick", 13.93, -16.75, "stable"],
    ["kafountine", "Kafountine", "Ziguinchor", 12.93, -16.75, "stable"],
    ["cap-skirring", "Cap Skirring", "Ziguinchor", 12.39, -16.74, "vigilance"],
    ["lompoul", "Lompoul-sur-Mer", "Louga", 15.46, -16.69, "stable"],
    ["fass-boye", "Fass Boye", "Thiès", 15.20, -16.94, "vigilance"],
    ["yoff", "Yoff", "Dakar", 14.76, -17.49, "stable"],
    ["ouakam", "Ouakam", "Dakar", 14.72, -17.50, "stable"],
    ["popenguine", "Popenguine", "Thiès", 14.56, -17.11, "stable"],
    ["foundiougne", "Foundiougne", "Fatick", 14.13, -16.47, "stable"],
    ["missirah", "Missirah", "Fatick", 13.73, -16.50, "vigilance"],
    ["elinkine", "Elinkine", "Ziguinchor", 12.50, -16.67, "stable"]
  ] as const;

  // networkStatus (gap analysis "adhérent / non-adhérent", arbitrage CEO
  // 2026-08-15) : posé explicitement à "libre" sur toutes les organisations
  // de démonstration — c'est le comportement actuel (gratuit, sans
  // distinction), rendu visible dans les données plutôt que laissé implicite
  // via l'absence du champ. Aucun consommateur de ce champ dans ce lot.
  const organizations: ProductState["organizations"] = [
    { id: "org-capitaines", name: "Collectif des capitaines de Joal", type: "organisation_professionnelle", networkStatus: "libre" },
    { id: "org-mareyeurs", name: "GIE des mareyeurs de la Petite-Côte", type: "organisation_professionnelle", networkStatus: "libre" },
    { id: "org-transform", name: "Unité de transformation Naatangué", type: "entreprise", networkStatus: "libre" },
    { id: "org-froid", name: "Froid Sénégal Services", type: "entreprise", networkStatus: "libre" },
    { id: "org-site", name: "Gestion des quais pilotes", type: "collectivite", networkStatus: "libre" },
    { id: "org-coordination", name: "Cellule nationale de coordination", type: "service_public", networkStatus: "libre" },
    { id: "org-partner", name: "Partenaire résilience littorale", type: "partenaire", networkStatus: "libre" },
    { id: "org-grande-cote", name: "Union professionnelle de la Grande-Côte", type: "organisation_professionnelle", networkStatus: "libre" },
    { id: "org-cap-vert", name: "Réseau des sites du Cap-Vert", type: "collectivite", networkStatus: "libre" },
    { id: "org-saloum", name: "Plateforme de valorisation du Sine-Saloum", type: "entreprise", networkStatus: "libre" },
    { id: "org-casamance", name: "Alliance halieutique de Casamance", type: "organisation_professionnelle", networkStatus: "libre" },
    { id: "org-finance", name: "Facilité bleue de cofinancement", type: "partenaire", networkStatus: "libre" },
    { id: "org-logistique", name: "Littoral Logistique Froid", type: "entreprise", networkStatus: "libre" },
    { id: "org-mb", name: "Mbàmbulaan Ops", type: "entreprise", networkStatus: "libre" }
  ];

  const actors: ProductState["actors"] = [
    actor("act-admin", "Ndeye Mbaye", "administrateur", "org-mb", territoryRows.map(([id]) => id)),
    actor("act-operateur", "Awa Diouf", "operateur", "org-site", territoryRows.map(([id]) => id)),
    actor("act-capitaine", "Ousmane Diop", "capitaine", "org-capitaines", ["joal"]),
    actor("act-capitaine-saint", "Babacar Guèye", "capitaine", "org-capitaines", ["saint-louis"]),
    actor("act-capitaine-kayar", "Moustapha Ndour", "capitaine", "org-capitaines", ["kayar"]),
    actor("act-capitaine-dakar", "Lamine Faye", "capitaine", "org-capitaines", ["hann", "soumbedioune", "rufisque"]),
    actor("act-capitaine-sud", "Seydou Badji", "capitaine", "org-capitaines", ["djiffer", "kafountine", "cap-skirring"]),
    actor("act-mareyeur", "Mariama Sène", "mareyeur", "org-mareyeurs", ["joal", "mbour"]),
    actor("act-mareyeur-nord", "Khady Fall", "mareyeur", "org-mareyeurs", ["saint-louis", "kayar"]),
    actor("act-mareyeur-sud", "Aminata Coly", "mareyeur", "org-mareyeurs", ["djiffer", "kafountine", "cap-skirring"]),
    actor("act-transform", "Rokhaya Fall", "transformateur", "org-transform", ["mbour", "hann"]),
    actor("act-transform-sud", "Aïssatou Sané", "transformateur", "org-transform", ["kafountine", "cap-skirring"]),
    actor("act-prestataire", "Ibrahima Sarr", "prestataire", "org-froid", ["joal", "mbour", "kayar"]),
    actor("act-gestionnaire", "Cheikh Bâ", "gestionnaire_organisation", "org-capitaines", ["joal", "mbour"]),
    actor("act-coordinateur", "Mamadou Fall", "coordinateur", "org-coordination", territoryRows.map(([id]) => id)),
    actor("act-institution", "Fatou Ndiaye", "institution", "org-coordination", territoryRows.map(([id]) => id)),
    actor("act-partenaire", "Sophie Martin", "partenaire", "org-partner", territoryRows.map(([id]) => id)),
    // Lot 1 (R&D, arbitrage CEO 13/08/2026) : Yoff et Foundiougne n'étaient
    // couverts par aucun acteur mareyeur/transformateur dédié.
    actor("act-mareyeuse-yoff", "Ndèye Fatou Diagne", "mareyeur", "org-mareyeurs", ["yoff"]),
    actor("act-transform-foundiougne", "Coumba Sarr", "transformateur", "org-saloum", ["foundiougne"]),
    // Élargissement du jeu de démonstration (validation CEO 18/08/2026) :
    // acteurs opérationnels dédiés aux trois territoires qui ne portaient
    // jusque-là qu'une veille générique. Aucun rôle ni permission nouvelle.
    actor("act-mareyeur-popenguine", "Sokhna Cissé", "mareyeur", "org-mareyeurs", ["popenguine"]),
    actor("act-collectrice-missirah", "Awa Sagna", "transformateur", "org-saloum", ["missirah"]),
    actor("act-mareyeur-missirah", "Mame Diarra Sarr", "mareyeur", "org-saloum", ["missirah"]),
    actor("act-mareyeur-ouakam", "Rama Guèye", "mareyeur", "org-mareyeurs", ["ouakam"]),
    actor("act-mareyeur-rufisque", "Moussa Lô", "mareyeur", "org-mareyeurs", ["rufisque"]),
    actor("act-transporteur-rufisque", "Boubacar Diallo", "prestataire", "org-logistique", ["rufisque"]),
    actor("act-metrologue-djiffer", "Ibrahima Thiam", "prestataire", "org-froid", ["djiffer"])
  ];

  const captainNames = ["Abdoulaye Diatta", "Moussa Seck", "Pape Ndiaye", "Samba Sarr", "Ibrahima Cissé", "Alioune Ba", "Omar Mané", "Cheikh Thiam", "Youssoupha Diallo"];
  const relayNames = ["Aminata Diop", "Fatou Kiné Sow", "Ndeye Awa Fall", "Marième Faye", "Aïda Badji", "Khady Ndiaye", "Rama Sène", "Astou Mbodj", "Sokhna Gueye"];
  territoryRows.forEach(([id, name], index) => {
    actors.push(
      actor(`act-capitaine-${id}-demo`, captainNames[index % captainNames.length], "capitaine", "org-capitaines", [id], index % 4 !== 0),
      actor(`act-relais-${id}`, `${relayNames[index % relayNames.length]} · ${name}`, "operateur", "org-site", [id], true)
    );
  });

  const sites: ProductState["sites"] = territoryRows.flatMap(([id, name, , latitude, longitude]) => [
    { id: `quai-${id}`, territoryId: id, name: `Quai de ${name}`, type: "quai" as const, latitude, longitude, source: "Référentiel de démonstration" },
    { id: `marche-${id}`, territoryId: id, name: `Marché de ${name}`, type: "marche" as const, latitude: latitude + 0.015, longitude: longitude + 0.012, source: "Référentiel de démonstration" },
    { id: `zone-${id}`, territoryId: id, name: `Zone de pêche ${name}`, type: "zone_peche" as const, latitude: latitude + 0.09, longitude: longitude - 0.12, source: "Géométrie illustrative, non officielle" }
  ]);

  const territories: ProductState["territories"] = territoryRows.map(([id, name, region, latitude, longitude, activity]) => ({
    id,
    name,
    region,
    latitude,
    longitude,
    activity,
    siteIds: [`quai-${id}`, `marche-${id}`, `zone-${id}`],
    infrastructureIds: [`froid-${id}`, `balance-${id}`, `transport-${id}`]
  }));

  const infrastructures: ProductState["infrastructures"] = territoryRows.flatMap(([id, name], index) => [
    {
      id: `froid-${id}`,
      territoryId: id,
      siteId: `quai-${id}`,
      organizationId: "org-froid",
      name: index === 0 ? `Machine à glace de ${name}` : `Chambre froide de ${name}`,
      type: index === 0 ? ("fabrique_glace" as const) : ("chambre_froide" as const),
      status: index === 0 ? ("indisponible" as const) : index < 3 ? ("fragile" as const) : ("operationnelle" as const),
      theoreticalCapacity: index === 0 ? 12 : 18,
      availableCapacity: index === 0 ? 0 : index < 3 ? 6 : 14,
      unit: "tonnes/jour",
      trust: index === 0 ? "verifiee" : "observee",
      updatedAt: now
    },
    {
      id: `balance-${id}`,
      territoryId: id,
      siteId: `quai-${id}`,
      organizationId: "org-site",
      name: `Balance du quai de ${name}`,
      type: "balance",
      status: "operationnelle",
      theoreticalCapacity: 15,
      availableCapacity: 12,
      unit: "tonnes/jour",
      trust: "verifiee",
      updatedAt: now
    },
    {
      id: `transport-${id}`,
      territoryId: id,
      siteId: `quai-${id}`,
      organizationId: "org-mareyeurs",
      name: `Capacité transport froid ${name}`,
      type: "transport",
      status: ["kayar", "rufisque"].includes(id) ? "fragile" : "operationnelle",
      theoreticalCapacity: 8,
      availableCapacity: id === "kayar" ? 2 : id === "rufisque" ? 1 : 5,
      unit: "tonnes/jour",
      trust: "declaree",
      updatedAt: now
    }
  ]);

  const species: ProductState["species"] = [
    { id: "sp-sardinelle", name: "Sardinelle ronde", family: "Clupéidés", seasonality: "Pic de novembre à mai (simulation)", sensitivity: "surveillance", indicativePriceFcfaKg: 950 },
    { id: "sp-thiof", name: "Thiof", family: "Serranidés", seasonality: "Disponibilité irrégulière", sensitivity: "sensible", indicativePriceFcfaKg: 3200 },
    { id: "sp-maquereau", name: "Maquereau", family: "Scombridés", seasonality: "Toute l’année, variations locales", sensitivity: "stable", indicativePriceFcfaKg: 1450 },
    { id: "sp-mulet", name: "Mulet", family: "Mugilidés", seasonality: "Saison fraîche", sensitivity: "stable", indicativePriceFcfaKg: 1800 },
    { id: "sp-sole", name: "Sole", family: "Soleidés", seasonality: "Disponibilité limitée", sensitivity: "surveillance", indicativePriceFcfaKg: 2800 },
    { id: "sp-ethmalose", name: "Ethmalose", family: "Clupéidés", seasonality: "Présence variable selon les estuaires", sensitivity: "stable", indicativePriceFcfaKg: 850 },
    { id: "sp-carangue", name: "Carangue", family: "Carangidés", seasonality: "Variations côtières", sensitivity: "stable", indicativePriceFcfaKg: 1650 },
    { id: "sp-ceinture", name: "Poisson-ceinture", family: "Trichiuridés", seasonality: "Disponibilité irrégulière", sensitivity: "surveillance", indicativePriceFcfaKg: 1350 },
    { id: "sp-poulpe", name: "Poulpe", family: "Octopodidés", seasonality: "Fenêtres saisonnières", sensitivity: "sensible", indicativePriceFcfaKg: 3100 },
    { id: "sp-crevette", name: "Crevette côtière", family: "Pénéidés", seasonality: "Zones estuariennes et saison des pluies", sensitivity: "surveillance", indicativePriceFcfaKg: 3600 }
  ];

  const trips: ProductState["trips"] = [
    { id: "trip-joal", vesselId: "vessel-jambar", captainId: "act-capitaine", departureAt: "2026-07-29T02:10:00.000Z", expectedReturnAt: "2026-07-29T11:30:00.000Z", status: "en_mer", zone: "Petite-Côte Ouest", crewCount: 9, source: "Déclaration du capitaine" },
    { id: "trip-mbour", vesselId: "vessel-teranga", captainId: "act-capitaine", departureAt: "2026-07-28T23:40:00.000Z", expectedReturnAt: "2026-07-29T08:00:00.000Z", announcedReturnAt: "2026-07-29T07:20:00.000Z", arrivedAt: "2026-07-29T08:05:00.000Z", status: "debarquee", zone: "Petite-Côte Sud", crewCount: 11, source: "Poste de quai" },
    { id: "trip-kayar", vesselId: "vessel-ndiambour", captainId: "act-capitaine-kayar", departureAt: "2026-07-29T01:20:00.000Z", expectedReturnAt: "2026-07-29T10:40:00.000Z", announcedReturnAt: "2026-07-29T10:15:00.000Z", arrivedAt: "2026-07-29T10:36:00.000Z", status: "debarquee", zone: "Grande-Côte Sud", crewCount: 8, source: "Message WhatsApp Business structuré puis constat du poste de quai" },
    { id: "trip-saint-louis", vesselId: "vessel-ndaar", captainId: "act-capitaine-saint", departureAt: "2026-07-28T22:15:00.000Z", expectedReturnAt: "2026-07-29T06:30:00.000Z", announcedReturnAt: "2026-07-29T07:35:00.000Z", arrivedAt: "2026-07-29T08:00:00.000Z", status: "debarquee", zone: "Grande-Côte Nord", crewCount: 12, source: "Relais sécurité et poste de quai" },
    { id: "trip-hann", vesselId: "vessel-dakar", captainId: "act-capitaine-dakar", departureAt: "2026-07-29T00:30:00.000Z", expectedReturnAt: "2026-07-29T07:10:00.000Z", arrivedAt: "2026-07-29T07:18:00.000Z", status: "debarquee", zone: "Presqu’île du Cap-Vert", crewCount: 10, source: "Poste de quai de Hann" },
    { id: "trip-soumbedioune", vesselId: "vessel-goree", captainId: "act-capitaine-dakar", departureAt: "2026-07-29T03:05:00.000Z", expectedReturnAt: "2026-07-29T09:20:00.000Z", arrivedAt: "2026-07-29T09:28:00.000Z", status: "debarquee", zone: "Cap-Vert Ouest", crewCount: 7, source: "Opérateur de site" },
    { id: "trip-rufisque", vesselId: "vessel-lebu", captainId: "act-capitaine-dakar", departureAt: "2026-07-29T02:50:00.000Z", expectedReturnAt: "2026-07-29T10:00:00.000Z", announcedReturnAt: "2026-07-29T09:42:00.000Z", arrivedAt: "2026-07-29T10:06:00.000Z", status: "arrivee_confirmee", zone: "Baie de Gorée Est", crewCount: 9, source: "Appel du capitaine qualifié par le quai" },
    { id: "trip-djiffer", vesselId: "vessel-sine", captainId: "act-capitaine-sud", departureAt: "2026-07-29T01:40:00.000Z", expectedReturnAt: "2026-07-29T12:10:00.000Z", status: "en_mer", zone: "Delta du Saloum", crewCount: 8, source: "Déclaration du capitaine" },
    { id: "trip-kafountine", vesselId: "vessel-casamance", captainId: "act-capitaine-sud", departureAt: "2026-07-28T23:10:00.000Z", expectedReturnAt: "2026-07-29T08:20:00.000Z", arrivedAt: "2026-07-29T08:12:00.000Z", status: "debarquee", zone: "Casamance Nord", crewCount: 13, source: "Relais territorial" },
    { id: "trip-cap-skirring", vesselId: "vessel-diamoral", captainId: "act-capitaine-sud", departureAt: "2026-07-29T00:05:00.000Z", expectedReturnAt: "2026-07-29T07:45:00.000Z", arrivedAt: "2026-07-29T07:51:00.000Z", status: "debarquee", zone: "Casamance Sud", crewCount: 8, source: "Opérateur de débarquement" }
  ];

  const vessels: ProductState["vessels"] = [
    { id: "vessel-jambar", name: "Jambar II", registration: "DEMO-SN-JOAL-017", ownerId: "act-gestionnaire", captainId: "act-capitaine", homeSiteId: "quai-joal", type: "pirogue_artisanale", trust: "verifiee" },
    { id: "vessel-teranga", name: "Teranga", registration: "DEMO-SN-MBOUR-042", ownerId: "act-gestionnaire", captainId: "act-capitaine", homeSiteId: "quai-mbour", type: "pirogue_artisanale", trust: "observee" },
    { id: "vessel-ndiambour", name: "Ndiambour", registration: "DEMO-SN-KAYAR-108", ownerId: "act-gestionnaire", captainId: "act-capitaine-kayar", homeSiteId: "quai-kayar", type: "pirogue_artisanale", trust: "verifiee" },
    { id: "vessel-ndaar", name: "Ndar Ndar", registration: "DEMO-SN-STL-064", ownerId: "act-gestionnaire", captainId: "act-capitaine-saint", homeSiteId: "quai-saint-louis", type: "pirogue_artisanale", trust: "verifiee" },
    { id: "vessel-dakar", name: "Dakar Dem Dikk", registration: "DEMO-SN-HANN-221", ownerId: "act-gestionnaire", captainId: "act-capitaine-dakar", homeSiteId: "quai-hann", type: "pirogue_artisanale", trust: "consolidee" },
    { id: "vessel-goree", name: "Gorée", registration: "DEMO-SN-SOUMB-031", ownerId: "act-gestionnaire", captainId: "act-capitaine-dakar", homeSiteId: "quai-soumbedioune", type: "pirogue_artisanale", trust: "officielle" },
    { id: "vessel-lebu", name: "Lebu Gui", registration: "DEMO-SN-RUF-078", ownerId: "act-gestionnaire", captainId: "act-capitaine-dakar", homeSiteId: "quai-rufisque", type: "pirogue_artisanale", trust: "observee" },
    { id: "vessel-sine", name: "Sine Saloum", registration: "DEMO-SN-DJIF-015", ownerId: "act-gestionnaire", captainId: "act-capitaine-sud", homeSiteId: "quai-djiffer", type: "pirogue_artisanale", trust: "verifiee" },
    { id: "vessel-casamance", name: "Casamance Express", registration: "DEMO-SN-KAF-093", ownerId: "act-gestionnaire", captainId: "act-capitaine-sud", homeSiteId: "quai-kafountine", type: "pirogue_artisanale", trust: "consolidee" },
    { id: "vessel-diamoral", name: "Diamoral", registration: "DEMO-SN-CAP-026", ownerId: "act-gestionnaire", captainId: "act-capitaine-sud", homeSiteId: "quai-cap-skirring", type: "pirogue_artisanale", trust: "observee" }
  ];

  const fleetNames = ["Jàmm", "Teranga", "Naatangué"];
  const fleetTrust: TrustLevel[] = ["verifiee", "observee", "declaree"];
  const tripStatuses: ProductState["trips"][number]["status"][] = ["debarquee", "debarquee", "retour_annonce"];
  const generatedVessels: ProductState["vessels"] = [];
  const generatedTrips: ProductState["trips"] = [];

  territoryRows.forEach(([id, name], territoryIndex) => {
    fleetNames.forEach((fleetName, vesselIndex) => {
      const suffix = `${String(territoryIndex + 1).padStart(2, "0")}${vesselIndex + 1}`;
      const vesselId = `vessel-${id}-${vesselIndex + 1}`;
      const tripId = `trip-${id}-${vesselIndex + 1}`;
      const status = tripStatuses[(territoryIndex + vesselIndex) % tripStatuses.length];
      generatedVessels.push({
        id: vesselId,
        name: `${fleetName} ${name}`,
        registration: `DEMO-SN-${id.replaceAll("-", "").slice(0, 6).toUpperCase()}-${suffix}`,
        ownerId: "act-gestionnaire",
        captainId: `act-capitaine-${id}-demo`,
        homeSiteId: `quai-${id}`,
        type: "pirogue_artisanale",
        trust: fleetTrust[(territoryIndex + vesselIndex) % fleetTrust.length]
      });
      generatedTrips.push({
        id: tripId,
        vesselId,
        captainId: `act-capitaine-${id}-demo`,
        departureAt: `2026-08-08T0${(territoryIndex + vesselIndex) % 6}:15:00.000Z`,
        expectedReturnAt: `2026-08-08T${String(8 + ((territoryIndex + vesselIndex) % 5)).padStart(2, "0")}:30:00.000Z`,
        announcedReturnAt: status !== "en_mer" ? `2026-08-08T${String(7 + ((territoryIndex + vesselIndex) % 5)).padStart(2, "0")}:55:00.000Z` : undefined,
        arrivedAt: status === "debarquee" || status === "arrivee_confirmee" ? `2026-08-08T${String(8 + ((territoryIndex + vesselIndex) % 5)).padStart(2, "0")}:24:00.000Z` : undefined,
        status,
        zone: `Zone côtière de ${name}`,
        crewCount: 7 + ((territoryIndex + vesselIndex) % 7),
        source: vesselIndex === 0 ? "Poste de quai" : vesselIndex === 1 ? "Appel téléphonique qualifié" : "WhatsApp Business structuré"
      });
    });
  });

  vessels.push(...generatedVessels);
  trips.push(...generatedTrips);

  const landings: ProductState["landings"] = [
    {
      id: "landing-joal",
      tripId: "trip-joal",
      siteId: "quai-joal",
      status: "attendu",
      catches: [
        { id: "catch-j1", speciesId: "sp-sardinelle", quantityKg: 1450, quality: "A", productForm: "entier_frais" },
        { id: "catch-j2", speciesId: "sp-maquereau", quantityKg: 620, quality: "A", productForm: "entier_frais" }
      ],
      totalWeightKg: 2070,
      weighingSource: "Pesée à confirmer",
      trust: "declaree"
    },
    {
      id: "landing-mbour",
      tripId: "trip-mbour",
      siteId: "quai-mbour",
      arrivedAt: "2026-07-29T08:05:00.000Z",
      weighedAt: "2026-07-29T08:34:00.000Z",
      status: "lots_crees",
      catches: [
        { id: "catch-m1", speciesId: "sp-sardinelle", quantityKg: 2100, quality: "B", productForm: "entier_frais" },
        { id: "catch-m2", speciesId: "sp-sole", quantityKg: 240, quality: "A", productForm: "entier_frais" }
      ],
      totalWeightKg: 2340,
      weighingSource: "Balance du quai de Mbour",
      trust: "verifiee"
    },
    { id: "landing-kayar", tripId: "trip-kayar", siteId: "quai-kayar", arrivedAt: "2026-07-29T10:36:00.000Z", weighedAt: "2026-07-29T10:58:00.000Z", status: "lots_crees", catches: [{ id: "catch-k1", speciesId: "sp-thiof", quantityKg: 140, quality: "A", productForm: "entier_frais" }, { id: "catch-k2", speciesId: "sp-maquereau", quantityKg: 780, quality: "B", productForm: "entier_frais" }], totalWeightKg: 920, weighingSource: "Balance du quai de Kayar — pesée de démonstration", trust: "observee" },
    { id: "landing-saint-louis", tripId: "trip-saint-louis", siteId: "quai-saint-louis", arrivedAt: "2026-07-29T08:00:00.000Z", weighedAt: "2026-07-29T08:22:00.000Z", status: "lots_crees", catches: [{ id: "catch-sl1", speciesId: "sp-mulet", quantityKg: 1040, quality: "A", productForm: "entier_frais" }, { id: "catch-sl2", speciesId: "sp-sardinelle", quantityKg: 610, quality: "B", productForm: "entier_frais" }], totalWeightKg: 1650, weighingSource: "Balance du quai de Saint-Louis", trust: "verifiee" },
    { id: "landing-hann", tripId: "trip-hann", siteId: "quai-hann", arrivedAt: "2026-07-29T07:18:00.000Z", weighedAt: "2026-07-29T07:43:00.000Z", status: "lots_crees", catches: [{ id: "catch-h1", speciesId: "sp-maquereau", quantityKg: 1280, quality: "A", productForm: "entier_frais" }, { id: "catch-h2", speciesId: "sp-sole", quantityKg: 360, quality: "A", productForm: "entier_frais" }, { id: "catch-h3", speciesId: "sp-thiof", quantityKg: 260, quality: "B", productForm: "entier_frais" }], totalWeightKg: 1900, weighingSource: "Balance du quai de Hann", trust: "consolidee" },
    { id: "landing-soumbedioune", tripId: "trip-soumbedioune", siteId: "quai-soumbedioune", arrivedAt: "2026-07-29T09:28:00.000Z", weighedAt: "2026-07-29T09:52:00.000Z", status: "lots_crees", catches: [{ id: "catch-so1", speciesId: "sp-sardinelle", quantityKg: 760, quality: "B", productForm: "entier_frais" }, { id: "catch-so2", speciesId: "sp-mulet", quantityKg: 360, quality: "A", productForm: "entier_frais" }], totalWeightKg: 1120, weighingSource: "Pesée opérateur Soumbédioune", trust: "observee" },
    { id: "landing-rufisque", tripId: "trip-rufisque", siteId: "quai-rufisque", arrivedAt: "2026-07-29T10:06:00.000Z", status: "arrive", catches: [{ id: "catch-r1", speciesId: "sp-sardinelle", quantityKg: 980, quality: "B", productForm: "entier_frais" }], totalWeightKg: 980, weighingSource: "Pesée à réaliser", trust: "declaree" },
    { id: "landing-djiffer", tripId: "trip-djiffer", siteId: "quai-djiffer", status: "attendu", catches: [{ id: "catch-d1", speciesId: "sp-mulet", quantityKg: 540, quality: "A", productForm: "entier_frais" }, { id: "catch-d2", speciesId: "sp-sole", quantityKg: 180, quality: "A", productForm: "entier_frais" }], totalWeightKg: 720, weighingSource: "Estimation déclarative", trust: "declaree" },
    { id: "landing-kafountine", tripId: "trip-kafountine", siteId: "quai-kafountine", arrivedAt: "2026-07-29T08:12:00.000Z", weighedAt: "2026-07-29T08:46:00.000Z", status: "lots_crees", catches: [{ id: "catch-ka1", speciesId: "sp-sardinelle", quantityKg: 980, quality: "B", productForm: "entier_frais" }, { id: "catch-ka2", speciesId: "sp-maquereau", quantityKg: 500, quality: "A", productForm: "entier_frais" }], totalWeightKg: 1480, weighingSource: "Balance du quai de Kafountine", trust: "verifiee" },
    { id: "landing-cap-skirring", tripId: "trip-cap-skirring", siteId: "quai-cap-skirring", arrivedAt: "2026-07-29T07:51:00.000Z", weighedAt: "2026-07-29T08:17:00.000Z", status: "lots_crees", catches: [{ id: "catch-c1", speciesId: "sp-sole", quantityKg: 410, quality: "A", productForm: "entier_frais" }, { id: "catch-c2", speciesId: "sp-thiof", quantityKg: 210, quality: "A", productForm: "entier_frais" }, { id: "catch-c3", speciesId: "sp-mulet", quantityKg: 340, quality: "B", productForm: "entier_frais" }], totalWeightKg: 960, weighingSource: "Pesée du site de Cap Skirring", trust: "verifiee" }
  ];

  const generatedLandings: ProductState["landings"] = generatedTrips.map((trip, index) => {
    const territoryIndex = Math.floor(index / fleetNames.length);
    const vesselIndex = index % fleetNames.length;
    const [territoryId, territoryName] = territoryRows[territoryIndex];
    const firstSpecies = species[(territoryIndex + vesselIndex) % species.length];
    const secondSpecies = species[(territoryIndex + vesselIndex + 3) % species.length];
    const firstQuantity = 420 + ((territoryIndex * 97 + vesselIndex * 83) % 880);
    const secondQuantity = 180 + ((territoryIndex * 61 + vesselIndex * 47) % 520);
    const weighed = trip.status === "debarquee";

    return {
      id: `landing-${territoryId}-demo-${vesselIndex + 1}`,
      tripId: trip.id,
      siteId: `quai-${territoryId}`,
      arrivedAt: trip.arrivedAt,
      weighedAt: weighed ? `2026-08-08T${String(9 + ((territoryIndex + vesselIndex) % 5)).padStart(2, "0")}:12:00.000Z` : undefined,
      status: weighed ? "lots_crees" : "attendu",
      catches: [
        { id: `catch-${territoryId}-${vesselIndex + 1}-a`, speciesId: firstSpecies.id, quantityKg: firstQuantity, quality: vesselIndex === 2 ? "B" : "A", productForm: "entier_frais" },
        { id: `catch-${territoryId}-${vesselIndex + 1}-b`, speciesId: secondSpecies.id, quantityKg: secondQuantity, quality: territoryIndex % 3 === 0 ? "B" : "A", productForm: "entier_frais" }
      ],
      totalWeightKg: firstQuantity + secondQuantity,
      weighingSource: weighed ? `Balance du quai de ${territoryName}` : "Quantités annoncées, pesée attendue",
      trust: weighed ? (vesselIndex === 0 ? "verifiee" : "observee") : "declaree"
    };
  });

  landings.push(...generatedLandings);

  const lots: ProductState["lots"] = [
    { id: "lot-mbour-sardinelle", landingId: "landing-mbour", speciesId: "sp-sardinelle", siteId: "quai-mbour", quantityKg: 2100, availableKg: 1400, quality: "B", productForm: "entier_frais", conservation: "glace", status: "disponible", trust: "verifiee", traceabilityCompleteness: 88 },
    { id: "lot-mbour-sole", landingId: "landing-mbour", speciesId: "sp-sole", siteId: "quai-mbour", quantityKg: 240, availableKg: 240, quality: "A", productForm: "entier_frais", conservation: "froid", status: "disponible", trust: "verifiee", traceabilityCompleteness: 92 },
    { id: "lot-kayar-thiof", landingId: "landing-kayar", speciesId: "sp-thiof", siteId: "quai-kayar", quantityKg: 140, availableKg: 0, quality: "A", productForm: "entier_frais", conservation: "glace", status: "engage", trust: "observee", traceabilityCompleteness: 84 },
    { id: "lot-saint-mulet", landingId: "landing-saint-louis", speciesId: "sp-mulet", siteId: "quai-saint-louis", quantityKg: 1040, availableKg: 720, quality: "A", productForm: "entier_frais", conservation: "glace", status: "disponible", trust: "verifiee", traceabilityCompleteness: 84 },
    { id: "lot-hann-maquereau", landingId: "landing-hann", speciesId: "sp-maquereau", siteId: "quai-hann", quantityKg: 1280, availableKg: 580, quality: "A", productForm: "entier_frais", conservation: "froid", status: "engage", trust: "consolidee", traceabilityCompleteness: 96 },
    { id: "lot-hann-sole", landingId: "landing-hann", speciesId: "sp-sole", siteId: "quai-hann", quantityKg: 360, availableKg: 360, quality: "A", productForm: "entier_frais", conservation: "froid", status: "disponible", trust: "verifiee", traceabilityCompleteness: 93 },
    { id: "lot-soumb-sardinelle", landingId: "landing-soumbedioune", speciesId: "sp-sardinelle", siteId: "quai-soumbedioune", quantityKg: 760, availableKg: 760, quality: "B", productForm: "entier_frais", conservation: "glace", status: "disponible", trust: "observee", traceabilityCompleteness: 71 },
    { id: "lot-kaf-sardinelle", landingId: "landing-kafountine", speciesId: "sp-sardinelle", siteId: "quai-kafountine", quantityKg: 980, availableKg: 480, quality: "B", productForm: "entier_frais", conservation: "glace", status: "engage", trust: "verifiee", traceabilityCompleteness: 86 },
    { id: "lot-cap-sole", landingId: "landing-cap-skirring", speciesId: "sp-sole", siteId: "quai-cap-skirring", quantityKg: 410, availableKg: 310, quality: "A", productForm: "entier_frais", conservation: "froid", status: "disponible", trust: "verifiee", traceabilityCompleteness: 90 }
  ];

  const generatedLots: ProductState["lots"] = generatedLandings.flatMap((landing, landingIndex) => {
    if (landing.status !== "lots_crees") return [];
    return landing.catches.map((item, catchIndex) => ({
      id: `lot-${landing.id.replace("landing-", "")}-${catchIndex + 1}`,
      landingId: landing.id,
      speciesId: item.speciesId,
      siteId: landing.siteId,
      quantityKg: item.quantityKg,
      availableKg: Math.round(item.quantityKg * (catchIndex === 0 ? 0.68 : 0.82)),
      quality: item.quality,
      productForm: item.productForm,
      conservation: (landingIndex + catchIndex) % 2 === 0 ? ("glace" as const) : ("froid" as const),
      status: (landingIndex + catchIndex) % 4 === 0 ? ("engage" as const) : ("disponible" as const),
      trust: landing.trust,
      traceabilityCompleteness: 72 + ((landingIndex * 5 + catchIndex * 7) % 26)
    }));
  });

  lots.push(...generatedLots);

  // ServiceRequest — anciennement Need (D1) : identifiants "need-*" conservés
  // pour ne pas perturber les autres références de démonstration, mais la
  // forme est désormais celle de PublicRequest (reference, channel, intent).
  const serviceRequests: ProductState["serviceRequests"] = [
    { id: "need-sardinelle", reference: "MBA-SR-SARDINELLE", channel: "web", actorId: "act-transform", territoryId: "mbour", speciesId: "sp-sardinelle", quantityKg: 900, quality: "B", intent: "transformation", status: "ouvert", priority: "haute", createdAt: now, source: "Déclaration de l’unité de transformation" },
    { id: "need-thiof", reference: "MBA-SR-THIOF", channel: "web", actorId: "act-mareyeur", territoryId: "kayar", speciesId: "sp-thiof", quantityKg: 600, quality: "A", intent: "achat", status: "ouvert", priority: "critique", createdAt: now, source: "Besoin professionnel déclaré" },
    { id: "need-maquereau-hann", reference: "MBA-SR-MAQUEREAU-HANN", channel: "web", actorId: "act-transform", territoryId: "hann", speciesId: "sp-maquereau", quantityKg: 700, quality: "A", intent: "transformation", status: "couvert", priority: "haute", createdAt: now, source: "Plan de production de l’unité" },
    { id: "need-sole-dakar", reference: "MBA-SR-SOLE-DAKAR", channel: "web", actorId: "act-mareyeur", territoryId: "soumbedioune", speciesId: "sp-sole", quantityKg: 350, quality: "A", intent: "achat", status: "ouvert", priority: "haute", createdAt: now, source: "Demande mareyeur qualifiée" },
    { id: "need-mulet-saint", reference: "MBA-SR-MULET-SAINT", channel: "telephone", actorId: "act-mareyeur-nord", territoryId: "saint-louis", speciesId: "sp-mulet", quantityKg: 500, quality: "A", intent: "achat", status: "ouvert", priority: "moyenne", createdAt: now, source: "Besoin groupé de deux acheteurs" },
    { id: "need-sardinelle-kaf", reference: "MBA-SR-SARDINELLE-KAF", channel: "terrain", actorId: "act-transform-sud", territoryId: "kafountine", speciesId: "sp-sardinelle", quantityKg: 500, quality: "B", intent: "transformation", status: "couvert", priority: "haute", createdAt: now, source: "Programme de transformation locale" },
    { id: "need-sole-cap", reference: "MBA-SR-SOLE-CAP", channel: "web", actorId: "act-mareyeur-sud", territoryId: "cap-skirring", speciesId: "sp-sole", quantityKg: 260, quality: "A", intent: "transport", status: "ouvert", priority: "moyenne", createdAt: now, source: "Besoin logistique déclaré" },
    // Grappe "formation" (Lot 5, besoin collectif → programme) : trois
    // organisations distinctes, trois territoires distincts, la même
    // intention — le scénario canonique du §8.5 (plusieurs organisations
    // expriment le même besoin) devient démontrable sans être fabriqué
    // pour une seule fiche isolée.
    { id: "need-formation-mbour", reference: "MBA-SR-FORMATION-MBOUR", channel: "web", actorId: "act-transform", territoryId: "mbour", speciesId: "sp-sardinelle", quantityKg: 400, quality: "B", intent: "formation", status: "ouvert", priority: "moyenne", createdAt: now, source: "Demande de formation en manipulation et hygiène post-capture" },
    { id: "need-formation-joal", reference: "MBA-SR-FORMATION-JOAL", channel: "terrain", actorId: "act-gestionnaire", territoryId: "joal", speciesId: "sp-thiof", quantityKg: 350, quality: "B", intent: "formation", status: "ouvert", priority: "moyenne", createdAt: now, source: "Demande de formation en manipulation et hygiène post-capture" },
    { id: "need-formation-saint-louis", reference: "MBA-SR-FORMATION-SAINT-LOUIS", channel: "telephone", actorId: "act-mareyeur-nord", territoryId: "saint-louis", speciesId: "sp-mulet", quantityKg: 300, quality: "B", intent: "formation", status: "ouvert", priority: "moyenne", createdAt: now, source: "Demande de formation en manipulation et hygiène post-capture" }
  ];

  const generatedServiceRequests: ProductState["serviceRequests"] = territoryRows.flatMap(([territoryId], index) => {
    const territoryLots = generatedLots.filter((lot) => lot.siteId === `quai-${territoryId}`);
    const primarySpeciesId = territoryLots[0]?.speciesId ?? species[index % species.length].id;
    const secondarySpeciesId = territoryLots[1]?.speciesId ?? species[(index + 2) % species.length].id;
    const dedicatedMareyeurByTerritory: Record<string, string> = {
      ouakam: "act-mareyeur-ouakam",
      popenguine: "act-mareyeur-popenguine",
      missirah: "act-mareyeur-missirah",
      rufisque: "act-mareyeur-rufisque"
    };
    const actorId = dedicatedMareyeurByTerritory[territoryId] ?? (index < 6 ? "act-mareyeur-nord" : index < 13 ? "act-mareyeur" : "act-mareyeur-sud");
    return [
      { id: `need-${territoryId}-achat`, reference: `MBA-SR-${territoryId.toUpperCase()}-ACHAT`, channel: "web" as const, actorId, territoryId, speciesId: primarySpeciesId, quantityKg: 320 + ((index * 73) % 540), quality: "A" as const, intent: "achat" as const, status: "ouvert" as const, priority: index % 4 === 0 ? ("haute" as const) : ("moyenne" as const), createdAt: now, source: "Besoin consolidé par le relais territorial" },
      { id: `need-${territoryId}-valorisation`, reference: `MBA-SR-${territoryId.toUpperCase()}-VALORISATION`, channel: index % 2 === 0 ? ("terrain" as const) : ("telephone" as const), actorId: `act-relais-${territoryId}`, territoryId, speciesId: secondarySpeciesId, quantityKg: 180 + ((index * 41) % 360), quality: index % 3 === 0 ? ("B" as const) : ("A" as const), intent: index % 2 === 0 ? ("transformation" as const) : ("transport" as const), status: index % 5 === 0 ? ("couvert" as const) : ("ouvert" as const), priority: "moyenne" as const, createdAt: now, source: index % 2 === 0 ? "Formulaire terrain qualifié" : "Appel téléphonique qualifié" }
    ];
  });

  serviceRequests.push(...generatedServiceRequests);

  const opportunities: ProductState["opportunities"] = [
    { id: "opp-mbour", lotId: "lot-mbour-sardinelle", serviceRequestId: "need-sardinelle", territoryId: "mbour", score: 91, reasons: ["Espèce identique", "Quantité suffisante", "Même territoire", "Qualité compatible"], status: "proposee", humanValidationRequired: true },
    { id: "opp-kayar-thiof-partiel", lotId: "lot-kayar-thiof", serviceRequestId: "need-thiof", territoryId: "kayar", score: 87, reasons: ["Espèce et qualité compatibles", "Lot pesé localement", "Couverture partielle explicitement acceptée", "Reliquat du besoin maintenu ouvert"], status: "executee", humanValidationRequired: true },
    { id: "opp-hann", lotId: "lot-hann-maquereau", serviceRequestId: "need-maquereau-hann", territoryId: "hann", score: 96, reasons: ["Lot vérifié", "Besoin couvert", "Enlèvement planifié", "Chaîne froide documentée"], status: "engagee", humanValidationRequired: true },
    { id: "opp-saint", lotId: "lot-saint-mulet", serviceRequestId: "need-mulet-saint", territoryId: "saint-louis", score: 88, reasons: ["Espèce et qualité compatibles", "Volume disponible", "Acheteurs identifiés"], status: "proposee", humanValidationRequired: true },
    { id: "opp-kaf", lotId: "lot-kaf-sardinelle", serviceRequestId: "need-sardinelle-kaf", territoryId: "kafountine", score: 94, reasons: ["Transformation locale", "Quantité exacte", "Engagement confirmé"], status: "executee", humanValidationRequired: true },
    { id: "opp-cap", lotId: "lot-cap-sole", serviceRequestId: "need-sole-cap", territoryId: "cap-skirring", score: 84, reasons: ["Produit compatible", "Transport à confirmer", "Délai de conservation court"], status: "detectee", humanValidationRequired: true }
  ];

  const generatedOpportunities: ProductState["opportunities"] = territoryRows.flatMap(([territoryId], index) => {
    const lot = generatedLots.find((item) => item.siteId === `quai-${territoryId}`);
    const request = generatedServiceRequests.find((item) => item.territoryId === territoryId && item.speciesId === lot?.speciesId);
    if (!lot || !request) return [];
    const opportunityStatuses: ProductState["opportunities"][number]["status"][] = ["detectee", "proposee", "engagee"];
    return [{
      id: `opp-${territoryId}-demo`,
      lotId: lot.id,
      serviceRequestId: request.id,
      territoryId,
      score: 79 + (index % 18),
      reasons: ["Espèce et qualité compatibles", "Volume disponible", "Proximité territoriale", "Validation humaine requise"],
      status: opportunityStatuses[index % opportunityStatuses.length],
      humanValidationRequired: true
    }];
  });

  opportunities.push(...generatedOpportunities);

  const situations: Situation[] = [
    situation("sit-glace", "joal", "Machine à glace indisponible au quai de Joal", "recue", "declaree", "Qualifier le signal avec le poste de quai", "critique"),
    situation("sit-mbour", "mbour", "Capacité froide sous tension après deux débarquements", "qualification", "declaree", "Confirmer la priorité territoriale"),
    {
      id: "sit-kayar",
      reference: "MBA-SIT-KAYR",
      signalIds: ["obs-sit-kayar"],
      territoryId: "kayar",
      title: "Tension locale entre disponibilité de thiof et besoin ouvert",
      description: "Un besoin professionnel déclaré de 600 kg est rapproché d’un lot local pesé de 140 kg. Cette tension commerciale locale ne constitue ni une statistique d’inflation ni une conclusion sur l’état biologique de l’espèce.",
      status: "resultat",
      priority: "haute",
      trust: "documentee",
      visibility: "partenaires",
      responsibleId: "act-operateur",
      dueAt: tomorrow,
      nextStep: "Maintenir le reliquat ouvert et ne publier que les nouveaux lots réellement pesés.",
      result: "Le lot local de 140 kg a été accepté comme couverture partielle ; le reliquat du besoin reste ouvert et visible.",
      confirmation: "Pesée du lot, acceptation humaine du mareyeur et maintien du reliquat dans la demande.",
      coordinationId: "coord-kayar-marche",
      initiativeId: "init-froid",
      history: [{ id: "hist-sit-kayar", at: now, actor: "act-mareyeur-nord", label: "Besoin déclaré rapproché d’un lot observé", detail: "La demande de 600 kg et la disponibilité locale de 140 kg restent distinguées par leur source et leur niveau de confiance." }]
    },
    situation("sit-hann", "hann", "Maintenance préventive de la chambre froide", "coordination", "verifiee", "Démarrer l’intervention planifiée", "moyenne"),
    situation("sit-saint-louis", "saint-louis", "Retour de pirogue retardé de 90 minutes", "attente", "verifiee", "Confirmer le contact avec le poste de sécurité"),
    {
      id: "sit-soumbedioune",
      reference: "MBA-SIT-SOUM",
      signalIds: ["obs-sit-soumbedioune"],
      territoryId: "soumbedioune",
      title: "Immatriculation déclarée puis confirmée par le service compétent",
      description: "Une photographie transmise au relais de quai a été rapprochée du bateau et soumise au service compétent. Le statut officiel n’est appliqué qu’à la réponse institutionnelle simulée jointe au dossier.",
      status: "reglee",
      priority: "moyenne",
      trust: "officielle",
      visibility: "partenaires",
      responsibleId: "act-institution",
      dueAt: tomorrow,
      nextStep: "Conserver la pièce, la réponse et l’identité de la source avec le profil de la pirogue.",
      result: "Le numéro, la pirogue et le titulaire ont été rapprochés ; le rattachement administratif est confirmé dans la démonstration.",
      confirmation: "Réponse simulée du service compétent, datée et reliée à la copie du document.",
      coordinationId: "coord-soumbedioune-immatriculation",
      initiativeId: "init-immatriculation",
      history: [{ id: "hist-sit-soumbedioune", at: now, actor: "act-relais-soumbedioune", label: "Document reçu par relais", detail: "Photographie transmise par le capitaine puis saisie par l’agent de quai sans augmentation automatique du niveau de confiance." }]
    },
    {
      id: "sit-rufisque",
      reference: "MBA-SIT-RUFI",
      signalIds: ["obs-sit-rufisque"],
      territoryId: "rufisque",
      title: "Capacité de transport froid insuffisante pour le prochain enlèvement",
      description: "La capacité immédiatement disponible ne couvre pas l’enlèvement annoncé. Un véhicule alternatif doit être confirmé avant d’être compté comme capacité mobilisable.",
      status: "resultat",
      priority: "haute",
      trust: "documentee",
      visibility: "partenaires",
      responsibleId: "act-coordinateur",
      dueAt: tomorrow,
      nextStep: "Confirmer le second enlèvement et conserver le relevé de température jusqu’à destination.",
      result: "Un premier enlèvement a été exécuté dans le créneau confirmé ; le solde est planifié avec le même niveau de preuve attendu.",
      confirmation: "Acceptation du prestataire, bordereau de prise en charge et relevé de température simulés.",
      coordinationId: "coord-rufisque",
      history: [{ id: "hist-sit-rufisque", at: now, actor: "act-relais-rufisque", label: "Capacité insuffisante qualifiée", detail: "Le véhicule habituel ne couvre pas le prochain enlèvement ; aucune perte n’est déclarée au stade du signal." }]
    },
    {
      id: "sit-djiffer",
      reference: "MBA-SIT-DJIF",
      signalIds: ["obs-sit-djiffer"],
      territoryId: "djiffer",
      title: "Balance de quai recalibrée après lectures incohérentes",
      description: "Deux lectures différentes pour une même masse ont conduit à suspendre l’usage de la balance pour les pesées faisant foi, puis à lancer un contrôle avec masse étalon.",
      status: "reglee",
      priority: "haute",
      trust: "documentee",
      visibility: "partenaires",
      responsibleId: "act-coordinateur",
      dueAt: tomorrow,
      nextStep: "Utiliser la balance remise en service et exclure les mesures antérieures contestées des consolidations.",
      result: "La balance est remise en service après test étalon documenté ; les pesées antérieures douteuses restent exclues.",
      confirmation: "Relevés avant/après et fiche de contrôle du prestataire.",
      coordinationId: "coord-djiffer",
      history: [{ id: "hist-sit-djiffer", at: now, actor: "act-relais-djiffer", label: "Lectures incohérentes signalées", detail: "L’agent de quai a consigné deux résultats différents avant de suspendre les pesées officielles." }]
    },
    situation("sit-kafountine", "kafountine", "Transport groupé vers le marché régional", "reglee", "consolidee", "Partager l’apprentissage dans Community", "faible"),
    situation("sit-cap-skirring", "cap-skirring", "Chambre froide à 35 % de capacité disponible", "coordination", "observee", "Arbitrer les lots prioritaires et réserver un délestage", "haute"),
    // Élargissement du jeu de démonstration (validation CEO 18/08/2026) :
    // les trois territoires ci-dessous remplacent leur veille générique par
    // une boucle complète, sans introduire de nouvel identifiant territorial.
    {
      id: "sit-popenguine-vente-locale",
      reference: "MBA-SIT-POPV",
      signalIds: ["obs-sit-popenguine-vente-locale"],
      territoryId: "popenguine",
      title: "Vente locale coordonnée sans situation de crise",
      description: "Un lot pesé est disponible et un acheteur local a confirmé son intérêt. La coordination porte uniquement sur les créneaux de retrait et la preuve de remise.",
      status: "reglee",
      priority: "faible",
      trust: "documentee",
      visibility: "partenaires",
      responsibleId: "act-relais-popenguine",
      dueAt: tomorrow,
      nextStep: "Conserver ce parcours comme référence d’une opération territoriale stable.",
      result: "Le lot a été remis dans le créneau convenu, sans intervention d’urgence ni incident déclaré.",
      confirmation: "Fiche de lot, acceptation de l’acheteur et bordereau de remise simulé.",
      coordinationId: "coord-popenguine-vente-locale",
      history: [{ id: "hist-sit-popenguine-vente-locale", at: now, actor: "act-capitaine-popenguine-demo", label: "Lot disponible déclaré", detail: "L’agent de quai a rapproché le lot pesé de l’intérêt confirmé par un acheteur local." }]
    },
    {
      id: "sit-missirah-traceabilite",
      reference: "MBA-SIT-MSTR",
      signalIds: ["obs-sit-missirah-traceabilite"],
      territoryId: "missirah",
      title: "Traçabilité d’un lot de crevettes complétée avant enlèvement",
      description: "Un groupe de collecte a annoncé un lot par note vocale, mais le lieu précis et l’heure de collecte manquaient. Le relais a complété la provenance et la chaîne de remise avant diffusion au mareyeur.",
      status: "reglee",
      priority: "moyenne",
      trust: "documentee",
      visibility: "partenaires",
      responsibleId: "act-relais-missirah",
      dueAt: tomorrow,
      nextStep: "Maintenir la provenance et les preuves de conservation attachées au lot jusqu’à destination.",
      result: "La provenance et la remise sont documentées ; le lot peut être pris en charge sans revendication de certification environnementale.",
      confirmation: "Fiche de lot complétée, photographie et bordereau de remise simulé.",
      coordinationId: "coord-missirah-traceabilite",
      history: [{ id: "hist-sit-missirah-traceabilite", at: now, actor: "act-relais-missirah", label: "Note vocale saisie par le relais", detail: "La collectrice reste identifiée comme source ; l’agent de quai est le saisisseur du signal structuré." }]
    },
    {
      id: "sit-ouakam-creneau-quai",
      reference: "MBA-SIT-OUAQ",
      signalIds: ["obs-sit-ouakam-creneau-quai"],
      territoryId: "ouakam",
      title: "Créneau de débarquement réorganisé à Ouakam",
      description: "Un point de débarquement est temporairement indisponible au moment du retour annoncé d’une pirogue. L’agent de quai organise un autre créneau avant que la contrainte ne devienne critique.",
      status: "reglee",
      priority: "moyenne",
      trust: "documentee",
      visibility: "partenaires",
      responsibleId: "act-relais-ouakam",
      dueAt: tomorrow,
      nextStep: "Clôturer la vigilance et conserver le parcours comme exemple de coordination préventive.",
      result: "Le débarquement et la remise au mareyeur sont réalisés sur le créneau confirmé, sans incident déclaré.",
      confirmation: "Confirmation du créneau, heure d’arrivée et bordereau de remise simulé.",
      coordinationId: "coord-ouakam-creneau-quai",
      history: [{ id: "hist-sit-ouakam-creneau-quai", at: now, actor: "act-relais-ouakam", label: "Contrainte d’accès observée", detail: "L’agent de quai a signalé l’indisponibilité temporaire avant le retour de la pirogue." }]
    },
    // Lot 1 (R&D, validation CEO 13/08/2026) : six scénarios élargissant la
    // couverture démontrable au nord, au centre et au sud du littoral, sans
    // remplacer les parcours déjà profonds ci-dessus. Objets hand-authored
    // (pas via le helper situation()) pour porter le récit complet — voir
    // docs/rd/LOT1_COUVERTURE_DEMONTRABLE_ELARGIE_SCENARIOS.md sur
    // codex/rd-exploration (commit 93def7d) pour la boucle détaillée.
    {
      id: "sit-lompoul-balises",
      reference: "MBA-SIT-LMPB",
      signalIds: ["obs-sit-lompoul-balises"],
      territoryId: "lompoul",
      title: "Équipement de géolocalisation insuffisant pour le suivi des retours",
      description: "Un premier groupe de pirogues souhaite pouvoir signaler sa position quand un retour se prolonge ; les exigences (autonomie, étanchéité, déclenchement, formation, maintenance, responsabilité de suivi) restent à documenter avant tout choix technique.",
      status: "coordination",
      priority: "haute",
      trust: "documentee",
      visibility: "partenaires",
      responsibleId: "act-coordinateur",
      dueAt: tomorrow,
      nextStep: "Confirmer les pirogues volontaires et suivre l’instruction du dossier auprès du responsable de quai.",
      coordinationId: "coord-lompoul-balises",
      initiativeId: "init-lompoul-balises",
      history: [{ id: "hist-sit-lompoul-balises", at: now, actor: "act-relais-lompoul", label: "Signal saisi depuis une note vocale", detail: "Besoin de balises de géolocalisation rapporté par un capitaine, confirmé par trois capitaines et le responsable du quai." }]
    },
    {
      id: "sit-fass-boye-conformite",
      reference: "MBA-SIT-FBCF",
      signalIds: ["obs-sit-fass-boye-conformite"],
      territoryId: "fass-boye",
      title: "Rattachement administratif d’une pirogue à vérifier",
      description: "Écart de dénomination détecté entre la pièce d’immatriculation présentée et le profil déclaré de la pirogue ; pièce complémentaire demandée avant tout statut définitif.",
      status: "attente",
      priority: "moyenne",
      trust: "rapprochee",
      visibility: "partenaires",
      responsibleId: "act-operateur",
      dueAt: tomorrow,
      waitingReason: "Réponse du service compétent sur le rattachement administratif",
      nextStep: "Consigner la réponse du point administratif mandaté dès réception.",
      coordinationId: "coord-fass-boye-conformite",
      history: [{ id: "hist-sit-fass-boye-conformite", at: now, actor: "act-capitaine-fass-boye-demo", label: "Pièce déposée directement", detail: "Immatriculation photographiée et déposée via le formulaire structuré." }]
    },
    {
      id: "sit-yoff-marche",
      reference: "MBA-SIT-YFMC",
      signalIds: ["obs-sit-yoff-marche"],
      territoryId: "yoff",
      title: "Écart local entre prix proposés et débouché disponible",
      description: "Trois observations de prix restent comparables après exclusion d’une offre non comparable ; un volume de sardinelle reste sans débouché confirmé.",
      status: "resultat",
      priority: "haute",
      trust: "observee",
      visibility: "partenaires",
      responsibleId: "act-operateur",
      dueAt: tomorrow,
      nextStep: "Confirmer le poids à l’enlèvement pour faire passer le résultat de documentée à vérifiée.",
      result: "Volume orienté vers un transformateur ; délai d’enlèvement confirmé, poids en cours de confirmation.",
      confirmation: "Offre acceptée par le transformateur et bordereau simulé d’enlèvement.",
      coordinationId: "coord-yoff-marche",
      history: [{ id: "hist-sit-yoff-marche", at: now, actor: "act-mareyeuse-yoff", label: "Écart de prix déclaré", detail: "Quatre prix déclarés pour la sardinelle, un volume sans débouché confirmé." }]
    },
    {
      id: "sit-foundiougne-claies",
      reference: "MBA-SIT-FDCL",
      signalIds: ["obs-sit-foundiougne-claies"],
      territoryId: "foundiougne",
      title: "Capacité de fumage réduite avant la prochaine préparation",
      description: "Deux claies de fumage hors service ; constat visuel réalisé et réparation locale jugée possible par le relais.",
      status: "resultat",
      priority: "haute",
      trust: "verifiee",
      visibility: "partenaires",
      responsibleId: "act-coordinateur",
      dueAt: tomorrow,
      nextStep: "Confirmer la disponibilité des claies restantes avant la prochaine fenêtre de préparation.",
      result: "Une claie de fumage remise en service ; capacité restante encore réduite tant que la seconde n’est pas réparée.",
      confirmation: "Photos avant/après, fiche d’intervention et confirmation de la responsable du groupement.",
      coordinationId: "coord-foundiougne-claies",
      history: [{ id: "hist-sit-foundiougne-claies", at: now, actor: "act-relais-foundiougne", label: "Appel reçu et consigné", detail: "Deux claies de fumage inutilisables signalées par appel." }]
    },
    {
      id: "sit-elinkine-retour",
      reference: "MBA-SIT-ELKR",
      signalIds: ["obs-sit-elinkine-retour"],
      territoryId: "elinkine",
      title: "Retour retardé à qualifier",
      description: "Heure de départ, heure attendue et dernier contact confirmés par deux recoupements ; position toujours inconnue au moment de l’escalade.",
      status: "reglee",
      priority: "critique",
      trust: "verifiee",
      visibility: "partenaires",
      responsibleId: "act-coordinateur",
      dueAt: tomorrow,
      nextStep: "Partager l’apprentissage dans Community.",
      result: "Équipage revenu au quai ; chaîne d’alerte clôturée et responsables informés.",
      confirmation: "Heure d’arrivée observée et validée par l’agent de quai.",
      coordinationId: "coord-elinkine-retour",
      history: [{ id: "hist-sit-elinkine-retour", at: now, actor: "act-relais-elinkine", label: "Appel consigné", detail: "Retour retardé signalé par un proche habilité, position non confirmée." }]
    },
    {
      id: "sit-cap-skirring-debouche",
      reference: "MBA-SIT-CSDB",
      signalIds: ["obs-sit-cap-skirring-debouche"],
      territoryId: "cap-skirring",
      title: "Lot préparé sans débouché confirmé",
      description: "Lot vérifié et fenêtre de conservation confirmée après qualification ; aucun engagement actif au moment du signal.",
      status: "resultat",
      priority: "haute",
      trust: "verifiee",
      visibility: "partenaires",
      responsibleId: "act-operateur",
      dueAt: tomorrow,
      nextStep: "Confirmer la réception à destination pour clore le dossier.",
      result: "Lot orienté vers un débouché alternatif dans la fenêtre de conservation documentée.",
      confirmation: "Bordereau d’enlèvement et confirmation de réception simulés.",
      coordinationId: "coord-cap-skirring-debouche",
      history: [{ id: "hist-sit-cap-skirring-debouche", at: now, actor: "act-transform-sud", label: "Annulation saisie directement", detail: "Acheteur ayant annulé l’enlèvement d’un lot déjà préparé." }]
    }
  ];

  const situationTemplates = [
    ["Fenêtre de débarquement à consolider", "Confirmer l’heure de retour avec le capitaine et le quai"],
    ["Capacité froide à confirmer avant la pointe", "Réserver une capacité ou documenter un délestage"],
    ["Immatriculations en attente de rapprochement", "Qualifier les dossiers avec leur source"],
    ["Besoin de transport groupé à organiser", "Confirmer le volume, l’itinéraire et le responsable"],
    ["Relais sécurité à confirmer", "Tester la chaîne d’appel et consigner le résultat"]
  ] as const;
  const deepenedSituationIdsByTerritory: Record<string, string> = {
    kayar: "sit-kayar",
    soumbedioune: "sit-soumbedioune",
    rufisque: "sit-rufisque",
    djiffer: "sit-djiffer",
    popenguine: "sit-popenguine-vente-locale",
    missirah: "sit-missirah-traceabilite",
    ouakam: "sit-ouakam-creneau-quai"
  };
  const deepenedTerritoryIds = new Set(Object.keys(deepenedSituationIdsByTerritory));
  const canonicalSituationIdForTerritory = (territoryId: string) =>
    deepenedSituationIdsByTerritory[territoryId] ?? `sit-${territoryId}-veille`;
  const situationStatuses: SituationStatus[] = ["qualification", "priorisee", "coordination", "intervention", "attente", "resultat"];
  const generatedSituations = territoryRows.filter(([territoryId]) => !deepenedTerritoryIds.has(territoryId)).map(([territoryId, territoryName], index) => {
    const template = situationTemplates[index % situationTemplates.length];
    return situation(
      `sit-${territoryId}-veille`,
      territoryId,
      `${template[0]} · ${territoryName}`,
      situationStatuses[index % situationStatuses.length],
      index % 4 === 0 ? "verifiee" : index % 4 === 1 ? "observee" : "declaree",
      template[1],
      index % 5 === 0 ? "critique" : index % 2 === 0 ? "haute" : "moyenne"
    );
  });

  situations.push(...generatedSituations);

  // Dérogations ponctuelles à la dérivation générique signal ← situation
  // ci-dessous (channel/category/trust/source/actorId/reportedBy propres à
  // un scénario). sit-glace et sit-saint-louis portaient déjà ces
  // dérogations sous forme de ternaires en ligne ; Lot 1 (R&D, 13/08/2026)
  // en ajoute six, avec la distinction auteur/saisisseur (Signal.reportedBy)
  // pour les trois scénarios de relais (Lompoul, Foundiougne, Elinkine).
  const signalOverridesById: Record<string, Partial<ProductState["signals"][number]>> = {
    "sit-glace": { channel: "poste_quai", category: "infrastructure", source: "Poste de quai de Joal" },
    "sit-saint-louis": { channel: "telephone", category: "securite", trust: "declaree", source: "Appel d’un proche habilité" },
    "sit-kayar": {
      actorId: "act-mareyeur-nord",
      channel: "whatsapp_structure",
      category: "marche",
      trust: "declaree",
      source: "Besoin professionnel déclaré, rapproché ensuite d’une pesée locale"
    },
    "sit-soumbedioune": {
      actorId: "act-relais-soumbedioune",
      channel: "telephone",
      category: "conformite",
      trust: "declaree",
      source: "Photographie et appel du capitaine, saisis par le relais de quai",
      reportedBy: "Capitaine de la pirogue Gorée (appel et photographie)"
    },
    "sit-rufisque": {
      actorId: "act-relais-rufisque",
      channel: "poste_quai",
      category: "infrastructure",
      trust: "observee",
      source: "Capacité disponible constatée par le relais de quai"
    },
    "sit-djiffer": {
      actorId: "act-relais-djiffer",
      channel: "poste_quai",
      category: "qualite",
      trust: "observee",
      source: "Deux lectures incohérentes consignées par l’agent de quai"
    },
    "sit-popenguine-vente-locale": {
      actorId: "act-capitaine-popenguine-demo",
      channel: "terrain",
      category: "marche",
      trust: "declaree",
      source: "Disponibilité annoncée par le capitaine puis rapprochée d’un lot pesé"
    },
    "sit-missirah-traceabilite": {
      actorId: "act-relais-missirah",
      channel: "poste_quai",
      category: "qualite",
      trust: "declaree",
      source: "Note vocale d’une collectrice, saisie par le relais territorial",
      reportedBy: "Awa Sagna, collectrice de Missirah (note vocale)"
    },
    "sit-ouakam-creneau-quai": {
      actorId: "act-relais-ouakam",
      channel: "poste_quai",
      category: "infrastructure",
      trust: "observee",
      source: "Contrainte d’accès constatée directement par l’agent de quai"
    },
    "sit-lompoul-balises": {
      actorId: "act-relais-lompoul",
      channel: "poste_quai",
      category: "securite",
      trust: "declaree",
      source: "Note vocale d’un capitaine, saisie par le relais territorial",
      reportedBy: "Un capitaine de pirogue (note vocale)"
    },
    "sit-fass-boye-conformite": {
      actorId: "act-capitaine-fass-boye-demo",
      channel: "terrain",
      category: "conformite",
      trust: "declaree",
      source: "Formulaire structuré rempli directement par le capitaine"
    },
    "sit-yoff-marche": {
      actorId: "act-mareyeuse-yoff",
      channel: "whatsapp_structure",
      category: "marche",
      trust: "declaree",
      source: "Déclaration directe via WhatsApp structuré"
    },
    "sit-foundiougne-claies": {
      actorId: "act-relais-foundiougne",
      channel: "poste_quai",
      category: "infrastructure",
      trust: "declaree",
      source: "Appel reçu et saisi par le relais territorial",
      reportedBy: "Responsable d’un groupement de transformatrices (appel)"
    },
    "sit-elinkine-retour": {
      actorId: "act-relais-elinkine",
      channel: "telephone",
      category: "securite",
      trust: "declaree",
      source: "Appel radio/téléphone consigné par l’agent de quai",
      reportedBy: "Un proche habilité de l’équipage (appel)"
    },
    "sit-cap-skirring-debouche": {
      actorId: "act-transform-sud",
      channel: "terrain",
      category: "marche",
      trust: "declaree",
      source: "Annulation saisie directement par la transformatrice"
    }
  };

  const generatedCoordinationSpaces: ProductState["coordinationSpaces"] = generatedSituations.map((item, index) => ({
    id: `coord-${item.territoryId}-veille`,
    situationId: item.id,
    title: `Cellule opérationnelle · ${territoryRows.find(([territoryId]) => territoryId === item.territoryId)?.[1] ?? item.territoryId}`,
    participantIds: [`act-relais-${item.territoryId}`, `act-capitaine-${item.territoryId}-demo`, "act-coordinateur", index % 3 === 0 ? "act-prestataire" : "act-gestionnaire"],
    objective: "Partager une lecture commune, décider du prochain pas et conserver les confirmations.",
    decision: index % 3 === 0 ? "Activer le relais territorial et vérifier la capacité disponible." : "Confirmer le besoin, le responsable et l’échéance avant diffusion.",
    commitments: [
      { id: `eng-${item.territoryId}-relais`, actorId: `act-relais-${item.territoryId}`, label: "Qualifier le signal par le canal convenu", dueAt: tomorrow, status: index % 4 === 0 ? "terminee" : "en_cours", result: index % 4 === 0 ? "Qualification consignée avec source" : undefined },
      { id: `eng-${item.territoryId}-coord`, actorId: "act-coordinateur", label: "Valider la prochaine décision", dueAt: tomorrow, status: index % 3 === 0 ? "a_faire" : "en_cours" }
    ],
    risks: ["Source terrain à maintenir à jour", "Disponibilité du responsable à confirmer"],
    nextReviewAt: tomorrow
  }));

  const coastalPrograms = [
    { id: "grande-cote", title: "Sécurité et continuité des opérations · Grande-Côte", territoryIds: ["saint-louis", "lompoul", "fass-boye", "kayar"], objective: "Fiabiliser les retours, les relais et les capacités critiques du nord littoral.", budget: 240000000, status: "cadrage" as const },
    { id: "cap-vert", title: "Qualité, immatriculations et flux · Cap-Vert", territoryIds: ["yoff", "ouakam", "soumbedioune", "hann", "rufisque"], objective: "Rapprocher actifs, quais, pesées et débouchés dans un référentiel partagé.", budget: 310000000, status: "execution" as const },
    { id: "petite-cote", title: "Valorisation et froid · Petite-Côte", territoryIds: ["popenguine", "mbour", "joal"], objective: "Réduire les pertes et sécuriser l’orientation des volumes débarqués.", budget: 225000000, status: "financee" as const },
    { id: "saloum", title: "Logistique estuarienne · Sine-Saloum", territoryIds: ["foundiougne", "djiffer", "missirah"], objective: "Organiser la pesée, le regroupement et le transport entre sites dispersés.", budget: 175000000, status: "cadrage" as const },
    { id: "casamance", title: "Transformation et accès au marché · Casamance", territoryIds: ["kafountine", "elinkine", "cap-skirring"], objective: "Renforcer la transformation locale et documenter les flux vers les débouchés régionaux.", budget: 265000000, status: "execution" as const }
  ];

  const generatedInitiatives: ProductState["initiatives"] = coastalPrograms.map((program, index) => ({
    id: `init-${program.id}-xxl`,
    title: program.title,
    territoryIds: program.territoryIds,
    situationIds: program.territoryIds.map(canonicalSituationIdForTerritory),
    objective: program.objective,
    status: program.status,
    ownerId: index === 1 ? "act-institution" : "act-coordinateur",
    budgetFcfa: program.budget,
    budgetStatus: "valide" as const,
    funding: [
      { id: `fund-${program.id}-partner`, partnerId: "act-partenaire", amountFcfa: Math.round(program.budget * 0.42), status: index % 2 === 0 ? "en_instruction" : "confirme", condition: "Ciblage territorial, gouvernance et indicateurs validés" },
      { id: `fund-${program.id}-public`, partnerId: "act-institution", amountFcfa: Math.round(program.budget * 0.18), status: index < 2 ? "confirme" : "a_mobiliser", condition: "Mandat public et contrepartie documentés" }
    ],
    indicators: [
      { label: "Situations closes avec confirmation", baseline: 18 + index * 3, target: 80, current: 36 + index * 7, unit: "%" },
      { label: "Sites avec relais opérationnel", baseline: 1, target: program.territoryIds.length, current: Math.max(1, program.territoryIds.length - 1), unit: "sites" },
      { label: "Délai médian de qualification", baseline: 74, target: 20, current: 47 - index * 3, unit: "min" }
    ]
  }));

  const generatedReports: ProductState["reports"] = coastalPrograms.map((program, index) => ({
    id: `report-${program.id}-xxl`,
    title: `Revue de coordination · ${program.title.split(" · ")[1]}`,
    territoryIds: program.territoryIds,
    generatedAt: now,
    period: "Semaine du 3 août 2026",
    status: index % 3 === 0 ? "a_actualiser" : "pret",
    metrics: [
      { label: "Territoires reliés", value: `${program.territoryIds.length}`, source: "Référentiel territorial de démonstration", trust: "consolidee", limit: "Périmètre illustratif et non réglementaire" },
      { label: "Situations actives", value: `${program.territoryIds.length + index}`, source: "Registre des situations", trust: "observee", limit: "État simulé à la date de génération" },
      { label: "Budget programmé", value: `${Math.round(program.budget / 1000000)} M FCFA`, source: "Portefeuille de programmes", trust: "declaree", limit: "Programmation distincte d’un décaissement" },
      { label: "Financement confirmé", value: `${Math.round(program.budget * 0.36 / 1000000)} M FCFA`, source: "Conventions et conditions de démonstration", trust: "observee", limit: "Montants fictifs destinés à la démonstration" }
    ]
  }));

  const generatedCommunityPosts: ProductState["communityPosts"] = territoryRows.map(([territoryId, territoryName], index) => ({
    id: `post-${territoryId}-veille`,
    authorId: `act-relais-${territoryId}`,
    territoryId,
    community: index % 3 === 0 ? "Sécurité et continuité" : index % 3 === 1 ? "Capacités et services" : "Flux et valorisation",
    category: index % 4 === 0 ? "alerte" : index % 4 === 1 ? "capacite" : index % 4 === 2 ? "besoin" : "information",
    title: `Point de situation partagé depuis ${territoryName}`,
    body: index % 2 === 0 ? "Le relais territorial consolide les retours, la disponibilité du quai et les besoins à traiter avant la prochaine fenêtre." : "Un point téléphonique a été qualifié puis relié à la situation, au responsable et à l’échéance correspondante.",
    createdAt: now,
    status: index % 3 === 0 ? "transforme" : "publie",
    convertedObjectId: index % 3 === 0 ? canonicalSituationIdForTerritory(territoryId) : undefined,
    comments: index % 4 === 0 ? [{ id: `comment-${territoryId}`, authorId: "act-coordinateur", body: "Source vérifiée ; prochaine revue programmée avec le relais." }] : []
  }));

  const generatedPriceObservations: ProductState["priceObservations"] = territoryRows.map(([territoryId, territoryName], index) => {
    const item = species[index % species.length];
    return {
      id: `price-${territoryId}-demo`,
      speciesId: item.id,
      territoryId,
      marketName: `Marché de ${territoryName}`,
      priceFcfaKg: item.indicativePriceFcfaKg + (index % 5 - 2) * 75,
      observedAt: now,
      source: index % 2 === 0 ? "Relevé opérateur qualifié" : "Déclaration croisée de deux acheteurs",
      trust: index % 3 === 0 ? "verifiee" : "observee",
      trend: index % 3 === 0 ? "baisse" : index % 3 === 1 ? "stable" : "hausse",
      flagged: index % 7 === 0
    };
  });

  const generatedScarcity: ProductState["scarcity"] = territoryRows.map(([territoryId], index) => {
    const territoryLots = lots.filter((item) => item.siteId === `quai-${territoryId}`);
    const territoryNeeds = serviceRequests.filter((item) => item.territoryId === territoryId);
    const speciesId = territoryNeeds[0]?.speciesId ?? species[index % species.length].id;
    const availableKg = territoryLots.filter((item) => item.speciesId === speciesId).reduce((sum, item) => sum + item.availableKg, 0);
    const requestedKg = territoryNeeds.filter((item) => item.speciesId === speciesId).reduce((sum, item) => sum + item.quantityKg, 0);
    return {
      id: `scar-${territoryId}-demo`,
      speciesId,
      territoryId,
      status: availableKg === 0 ? "donnee_insuffisante" : availableKg > requestedKg * 1.4 ? "abondant" : availableKg >= requestedKg ? "disponible" : availableKg >= requestedKg * 0.55 ? "sous_tension" : "rare",
      availableKg,
      requestedKg,
      reasons: ["Volumes disponibles reliés aux lots", "Besoins ouverts reliés aux acteurs", "Lecture indicative à confirmer par le territoire"],
      trust: index % 3 === 0 ? "verifiee" : "observee"
    };
  });

  const generatedSustainability: ProductState["sustainability"] = generatedLots.slice(0, 36).map((lot, index) => ({
    id: `sust-${lot.id}`,
    lotId: lot.id,
    provenanceComplete: lot.traceabilityCompleteness >= 80,
    practice: index % 3 === 0 ? "Filet tournant déclaré" : index % 3 === 1 ? "Ligne déclarée" : "Méthode à confirmer",
    zone: generatedVessels[index % generatedVessels.length]?.homeSiteId.replace("quai-", "Zone côtière de ") ?? "Zone côtière déclarée",
    status: lot.traceabilityCompleteness >= 88 ? "favorable" : lot.traceabilityCompleteness >= 80 ? "vigilance" : "incomplet",
    reasons: [`Traçabilité complétée à ${lot.traceabilityCompleteness} %`, "Pirogue, sortie, débarquement et lot reliés"],
    recommendation: lot.traceabilityCompleteness < 80 ? "Compléter la méthode et la preuve de conservation avant partage partenaire" : "Maintenir les preuves de conservation jusqu’à destination",
    trust: lot.trust
  }));

  const generatedNotifications: ProductState["notifications"] = territoryRows.slice(0, 12).map(([territoryId, territoryName], index) => {
    const roles: Role[] = ["coordinateur", "institution", "gestionnaire_organisation", "prestataire", "mareyeur", "partenaire"];
    return {
      id: `not-${territoryId}-veille`,
      role: roles[index % roles.length],
      title: `${territoryName} : prochaine confirmation attendue`,
      href: `/app/situations/${canonicalSituationIdForTerritory(territoryId)}`,
      read: index % 5 === 0
    };
  });

  return {
    revision: 1,
    tenant: { id: "tenant-demo", name: "Démonstration nationale Mbàmbulaan", mode: "demonstration" },
    organizations,
    actors,
    territories,
    sites,
    infrastructures,
    vessels,
    trips,
    species,
    landings,
    lots,
    serviceRequests,
    capacities: infrastructures
      .filter((item) => ["fabrique_glace", "chambre_froide", "transport", "transformation"].includes(item.type))
      .map((item) => ({
        id: `capacity-${item.id}`,
        infrastructureId: item.id,
        type: item.type === "transport" ? "transport" : item.type === "transformation" ? "transformation" : item.type === "fabrique_glace" ? "glace" : "stockage",
        availableQuantity: item.availableCapacity,
        unit: item.unit,
        validUntil: tomorrow,
        status: item.status === "indisponible" ? "indisponible" : "disponible"
      })),
    opportunities,
    // Origine des signaux : diversifiée volontairement pour le scénario
    // canonique. sit-saint-louis suit le §8.4 du spec maître (« Retour
    // retardé / sécurité » — « Signal par quai ou proche habilité ») :
    // un appel d'un proche, moins certain à réception qu'une fois la
    // situation qualifiée — d'où un trust de signal ("declaree")
    // Messages entrants simulés (arbitrage CEO 13/08/2026, gap analysis
    // "Messages entrants") : un message non converti par canal existant,
    // pour que la file présentée dans CoordinationWorkspace.tsx ne soit
    // jamais vide à la démonstration. Aucune connexion réelle
    // WhatsApp/SMS/téléphonie — tout est simulé et étiqueté comme tel (D5).
    incomingMessages: [
      { id: "msg-whatsapp-1", channel: "whatsapp_structure", territoryHint: "Kayar", reportedBy: "Aïda Fall (mareyeuse, message vocal WhatsApp)", body: "Le thiof se vend cher aujourd’hui à Kayar, plusieurs acheteurs en même temps mais je ne sais pas si c’est partout pareil. Vous pouvez regarder ?", receivedAt: now, status: "nouveau" },
      { id: "msg-telephone-1", channel: "telephone", territoryHint: "Djiffer", reportedBy: "Responsable du site de pesée de Djiffer (appel)", body: "La balance du quai donne des résultats différents depuis ce matin pour un même lot pesé deux fois. On continue à peser ou on attend un contrôle ?", receivedAt: now, status: "nouveau" },
      { id: "msg-poste-quai-1", channel: "poste_quai", territoryHint: "Saint-Louis", reportedBy: "Un capitaine (note vocale relayée par l’agent de quai)", body: "Note vocale transcrite par l’agent : « On a un souci avec la glace ce matin, la production tourne au ralenti et deux pirogues attendent déjà pour charger. »", receivedAt: now, status: "nouveau" },
      { id: "msg-terrain-1", channel: "terrain", territoryHint: "Mbour", reportedBy: "Un opérateur de quai (constat direct)", body: "Constat direct au quai de Mbour : un des deux véhicules de transport habituels ne s’est pas présenté ce matin, les lots en attente de départ s’accumulent.", receivedAt: now, status: "nouveau" }
    ],
    // distinct du trust de la situation ("verifiee") une fois vérifiée.
    // Condition Lot 3 (référentiel D9, intake omnicanal) : au moins un
    // signal du scénario canonique reçu par téléphone/WhatsApp, visible
    // avec son origine et son niveau de confiance propre.
    signals: situations.map((item) => ({
      id: `obs-${item.id}`,
      territoryId: item.territoryId,
      actorId: "act-operateur",
      createdAt: now,
      channel: "terrain",
      category: "production",
      title: item.title,
      description: item.description,
      trust: item.trust,
      source: "Relais territorial",
      ...signalOverridesById[item.id]
    })),
    situations,
    coordinationSpaces: [
      {
        id: "coord-froid",
        situationId: "sit-glace",
        title: "Continuité de la chaîne du froid Petite-Côte",
        participantIds: ["act-coordinateur", "act-prestataire", "act-institution", "act-partenaire"],
        objective: "Réduire les pertes post-capture pendant l’indisponibilité à Joal",
        decision: "Remettre en service à Joal et organiser un délestage temporaire vers Mbour",
        commitments: [
          { id: "eng-1", actorId: "act-prestataire", label: "Diagnostiquer et réparer la machine", dueAt: tomorrow, status: "a_faire" },
          { id: "eng-2", actorId: "act-coordinateur", label: "Organiser le délestage temporaire", dueAt: "2026-07-29T14:00:00.000Z", status: "en_cours" }
        ],
        risks: ["Retard de la pièce de rechange", "Saturation temporaire à Mbour"],
        nextReviewAt: "2026-07-30T09:00:00.000Z"
      },
      {
        id: "coord-opportunity",
        opportunityId: "opp-mbour",
        title: "Valorisation de la sardinelle de Mbour",
        participantIds: ["act-mareyeur", "act-transform", "act-coordinateur"],
        objective: "Orienter 900 kg vers la transformation avant dégradation",
        decision: "Conditions à confirmer par les deux acteurs",
        commitments: [],
        risks: ["Capacité froide limitée"],
        nextReviewAt: "2026-07-29T13:00:00.000Z"
      },
      {
        id: "coord-securite",
        situationId: "sit-saint-louis",
        title: "Suivi du retour retardé à Saint-Louis",
        participantIds: ["act-capitaine-saint", "act-operateur", "act-coordinateur", "act-institution"],
        objective: "Confirmer la position de l’équipage et partager une information fiable aux responsables mandatés",
        decision: "Maintenir le suivi téléphonique renforcé jusqu’à confirmation de l’arrivée",
        commitments: [
          { id: "eng-securite-1", actorId: "act-operateur", label: "Relancer le contact de sécurité", dueAt: "2026-07-29T09:00:00.000Z", status: "en_cours" },
          { id: "eng-securite-2", actorId: "act-coordinateur", label: "Informer le dispositif territorial", dueAt: "2026-07-29T09:10:00.000Z", status: "a_faire" }
        ],
        risks: ["Information de position non confirmée", "Multiplication de messages contradictoires"],
        nextReviewAt: "2026-07-29T09:15:00.000Z"
      },
      {
        id: "coord-casamance",
        situationId: "sit-kafountine",
        title: "Transport groupé Kafountine vers le marché régional",
        participantIds: ["act-capitaine-sud", "act-mareyeur-sud", "act-transform-sud", "act-coordinateur"],
        objective: "Regrouper les volumes et sécuriser l’acheminement sans rupture de conservation",
        decision: "Activer le véhicule référencé après consolidation des volumes",
        commitments: [
          { id: "eng-casamance-1", actorId: "act-mareyeur-sud", label: "Consolider les volumes", dueAt: "2026-07-29T10:00:00.000Z", status: "terminee", result: "1,2 tonne confirmée" },
          { id: "eng-casamance-2", actorId: "act-coordinateur", label: "Confirmer le transporteur", dueAt: "2026-07-29T11:00:00.000Z", status: "terminee", result: "Véhicule et horaire confirmés" }
        ],
        risks: ["Retard au point de regroupement"],
        nextReviewAt: "2026-07-30T08:30:00.000Z"
      },
      {
        id: "coord-kayar-marche",
        situationId: "sit-kayar",
        opportunityId: "opp-kayar-thiof-partiel",
        title: "Couverture partielle du besoin de thiof · Kayar",
        participantIds: ["act-capitaine-kayar", "act-mareyeur-nord", "act-relais-kayar", "act-operateur"],
        objective: "Couvrir la part réellement disponible sans présenter une tension locale comme une raréfaction biologique ou une tendance d’inflation.",
        decision: "Accepter le lot pesé comme couverture partielle et conserver le reliquat du besoin ouvert.",
        commitments: [
          { id: "eng-kayar-capitaine", actorId: "act-capitaine-kayar", label: "Confirmer le lot par une pesée au quai", dueAt: tomorrow, status: "terminee", result: "Lot de 140 kg pesé et relié au débarquement" },
          { id: "eng-kayar-mareyeur", actorId: "act-mareyeur-nord", label: "Accepter ou refuser explicitement la couverture partielle", dueAt: tomorrow, status: "terminee", result: "Couverture partielle acceptée" },
          { id: "eng-kayar-operateur", actorId: "act-operateur", label: "Maintenir le reliquat visible dans la demande", dueAt: tomorrow, status: "terminee", result: "Reliquat conservé en statut ouvert" }
        ],
        risks: ["Confondre disponibilité commerciale et état biologique", "Déduire une tendance de prix à partir d’un point isolé"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-soumbedioune-immatriculation",
        situationId: "sit-soumbedioune",
        title: "Vérification d’immatriculation · Soumbédioune",
        participantIds: ["act-relais-soumbedioune", "act-capitaine-dakar", "act-operateur", "act-institution"],
        objective: "Fiabiliser le rattachement de la pirogue sans confondre document reçu et statut officiel.",
        decision: "Transmettre le dossier au service compétent et n’élever le niveau de confiance qu’après sa réponse.",
        commitments: [
          { id: "eng-soumb-relais", actorId: "act-relais-soumbedioune", label: "Saisir la pièce en conservant le capitaine comme source", dueAt: tomorrow, status: "terminee", result: "Document et provenance consignés" },
          { id: "eng-soumb-institution", actorId: "act-institution", label: "Rapprocher le numéro, la pirogue et le titulaire", dueAt: tomorrow, status: "terminee", result: "Rattachement confirmé dans la simulation" },
          { id: "eng-soumb-operateur", actorId: "act-operateur", label: "Lier la réponse au profil de la pirogue", dueAt: tomorrow, status: "terminee", result: "Réponse institutionnelle jointe au dossier" }
        ],
        risks: ["Présenter une photographie comme une preuve officielle", "Perdre la distinction entre auteur et saisisseur"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-rufisque",
        situationId: "sit-rufisque",
        title: "Continuité du transport froid à Rufisque-Bargny",
        participantIds: ["act-relais-rufisque", "act-mareyeur-rufisque", "act-transporteur-rufisque", "act-coordinateur"],
        objective: "Trouver une capacité alternative avant la fin de la fenêtre de conservation",
        decision: "Mobiliser un véhicule alternatif confirmé et organiser les enlèvements successifs si nécessaire.",
        commitments: [
          { id: "eng-rufisque-transporteur", actorId: "act-transporteur-rufisque", label: "Confirmer le véhicule, la capacité et le créneau", dueAt: tomorrow, status: "terminee", result: "Premier créneau et capacité confirmés" },
          { id: "eng-rufisque-mareyeur", actorId: "act-mareyeur-rufisque", label: "Confirmer l’ordre des enlèvements", dueAt: tomorrow, status: "terminee", result: "Premier lot priorisé, solde planifié" },
          { id: "eng-rufisque-relais", actorId: "act-relais-rufisque", label: "Consigner la prise en charge et la température", dueAt: tomorrow, status: "terminee", result: "Bordereau et relevé joints" }
        ],
        risks: ["Capacité déclarée déjà engagée", "Délai d’arrivée du second véhicule", "Revendiquer une perte évitée sans preuve"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-djiffer",
        situationId: "sit-djiffer",
        title: "Fiabilisation de la pesée à Djiffer",
        participantIds: ["act-relais-djiffer", "act-metrologue-djiffer", "act-operateur", "act-coordinateur"],
        objective: "Rétablir une pesée fiable avant le prochain débarquement attendu",
        decision: "Suspendre les pesées faisant foi, effectuer un contrôle avec masse étalon puis consigner le résultat.",
        commitments: [
          { id: "eng-djiffer-relais", actorId: "act-relais-djiffer", label: "Suspendre les pesées officielles et signaler la balance", dueAt: tomorrow, status: "terminee", result: "Balance isolée avant le contrôle" },
          { id: "eng-djiffer-metrologue", actorId: "act-metrologue-djiffer", label: "Réaliser le recalibrage avec masse étalon", dueAt: tomorrow, status: "terminee", result: "Contrôle avant/après consigné" },
          { id: "eng-djiffer-operateur", actorId: "act-operateur", label: "Exclure les mesures contestées des consolidations", dueAt: tomorrow, status: "terminee", result: "Mesures antérieures marquées non exploitables" }
        ],
        risks: ["Débarquement avant fin du contrôle", "Réutilisation accidentelle des pesées contestées"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-popenguine-vente-locale",
        situationId: "sit-popenguine-vente-locale",
        opportunityId: "opp-popenguine-demo",
        title: "Remise locale d’un lot · Popenguine",
        participantIds: ["act-capitaine-popenguine-demo", "act-mareyeur-popenguine", "act-relais-popenguine"],
        objective: "Organiser une vente locale ordinaire avec des confirmations simples et vérifiables.",
        decision: "Réserver le lot et attribuer un créneau de retrait après confirmation de l’acheteur.",
        commitments: [
          { id: "eng-popenguine-capitaine", actorId: "act-capitaine-popenguine-demo", label: "Confirmer le lot pesé et sa disponibilité", dueAt: tomorrow, status: "terminee", result: "Lot et fenêtre confirmés" },
          { id: "eng-popenguine-mareyeur", actorId: "act-mareyeur-popenguine", label: "Confirmer le retrait du lot", dueAt: tomorrow, status: "terminee", result: "Créneau accepté" },
          { id: "eng-popenguine-relais", actorId: "act-relais-popenguine", label: "Consigner la remise", dueAt: tomorrow, status: "terminee", result: "Bordereau de remise ajouté" }
        ],
        risks: ["Rendez-vous non confirmé", "Confondre intérêt déclaré et vente réalisée"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-missirah-traceabilite",
        situationId: "sit-missirah-traceabilite",
        title: "Complétude d’un lot de crevettes · Missirah",
        participantIds: ["act-collectrice-missirah", "act-relais-missirah", "act-mareyeur-missirah"],
        objective: "Compléter la provenance et la chaîne de remise avant diffusion au mareyeur, sans revendiquer de certification écologique.",
        decision: "Maintenir le lot en information incomplète jusqu’à réception du lieu, de l’heure et de la preuve de remise.",
        commitments: [
          { id: "eng-missirah-collectrice", actorId: "act-collectrice-missirah", label: "Confirmer le lieu et l’heure de collecte", dueAt: tomorrow, status: "terminee", result: "Provenance complétée" },
          { id: "eng-missirah-relais", actorId: "act-relais-missirah", label: "Joindre la photographie et structurer la fiche de lot", dueAt: tomorrow, status: "terminee", result: "Fiche de lot documentée" },
          { id: "eng-missirah-mareyeur", actorId: "act-mareyeur-missirah", label: "Confirmer la prise en charge après vérification du dossier", dueAt: tomorrow, status: "terminee", result: "Prise en charge confirmée" }
        ],
        risks: ["Confondre traçabilité et certification environnementale", "Perdre l’auteur de la note vocale"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-ouakam-creneau-quai",
        situationId: "sit-ouakam-creneau-quai",
        title: "Réorganisation d’un débarquement · Ouakam",
        participantIds: ["act-relais-ouakam", "act-capitaine-ouakam-demo", "act-mareyeur-ouakam"],
        objective: "Absorber une contrainte légère d’accès au quai avant qu’elle ne retarde le débarquement.",
        decision: "Attribuer un autre créneau et obtenir l’accord du capitaine et du mareyeur.",
        commitments: [
          { id: "eng-ouakam-relais", actorId: "act-relais-ouakam", label: "Confirmer le point et le créneau disponibles", dueAt: tomorrow, status: "terminee", result: "Créneau alternatif réservé" },
          { id: "eng-ouakam-capitaine", actorId: "act-capitaine-ouakam-demo", label: "Confirmer la nouvelle heure d’arrivée", dueAt: tomorrow, status: "terminee", result: "Nouvelle heure confirmée" },
          { id: "eng-ouakam-mareyeur", actorId: "act-mareyeur-ouakam", label: "Confirmer la présence au retrait", dueAt: tomorrow, status: "terminee", result: "Rendez-vous accepté" }
        ],
        risks: ["Information tardive au mareyeur", "Transformer une contrainte légère en fausse alerte critique"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-lompoul-balises",
        situationId: "sit-lompoul-balises",
        title: "Équipement de sécurité en mer · Lompoul-sur-Mer",
        participantIds: ["act-relais-lompoul", "act-capitaine-lompoul-demo", "act-coordinateur", "act-prestataire"],
        objective: "Documenter un besoin d’équipement de géolocalisation exploitable pour instruction de financement, sans engager de fournisseur.",
        decision: "Dresser la liste volontaire des pirogues, produire une note d’options techniques puis ouvrir le dossier initiative.",
        commitments: [
          { id: "eng-lompoul-relais", actorId: "act-relais-lompoul", label: "Confirmer les pirogues candidates et leurs contacts", dueAt: tomorrow, status: "terminee", result: "Liste volontaire de 25 pirogues rapprochée" },
          { id: "eng-lompoul-prestataire", actorId: "act-prestataire", label: "Produire une note d’options techniques sans proposition commerciale engageante", dueAt: tomorrow, status: "en_cours" },
          { id: "eng-lompoul-coord", actorId: "act-coordinateur", label: "Définir les critères de financement et de gouvernance", dueAt: tomorrow, status: "a_faire" }
        ],
        risks: ["Technologie et coût encore non validés", "Responsabilité de maintenance à clarifier"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-fass-boye-conformite",
        situationId: "sit-fass-boye-conformite",
        title: "Rapprochement administratif · Fass Boye",
        participantIds: ["act-capitaine-fass-boye-demo", "act-relais-fass-boye", "act-operateur", "act-institution"],
        objective: "Rapprocher les pièces présentées sans effacer le dossier ni le présenter comme conforme avant réponse officielle.",
        decision: "Afficher « conformité en vérification » et transmettre la demande de contrôle au service compétent.",
        commitments: [
          { id: "eng-fass-boye-capitaine", actorId: "act-capitaine-fass-boye-demo", label: "Déposer la pièce complémentaire", dueAt: tomorrow, status: "terminee", result: "Deuxième pièce déposée et rapprochée" },
          { id: "eng-fass-boye-terrain", actorId: "act-relais-fass-boye", label: "Vérifier l’identité du dossier présenté au quai", dueAt: tomorrow, status: "terminee", result: "Dossier identifié et rattaché" },
          { id: "eng-fass-boye-institution", actorId: "act-institution", label: "Confirmer ou corriger le statut administratif", dueAt: tomorrow, status: "a_faire" }
        ],
        risks: ["Réponse du service compétent non garantie dans le délai", "Confusion possible entre dossier incomplet et irrégularité"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-yoff-marche",
        situationId: "sit-yoff-marche",
        title: "Débouché sardinelle · Yoff",
        participantIds: ["act-mareyeuse-yoff", "act-transform", "act-operateur"],
        objective: "Orienter le volume disponible vers un débouché compatible avant dégradation, sans revendiquer d’effet sur le prix du marché.",
        decision: "Réserver le volume auprès du transformateur après confirmation de la capacité et du prix de reprise.",
        commitments: [
          { id: "eng-yoff-mareyeuse", actorId: "act-mareyeuse-yoff", label: "Confirmer quantité, qualité et délai", dueAt: tomorrow, status: "terminee", result: "Volume et qualité confirmés" },
          { id: "eng-yoff-transform", actorId: "act-transform", label: "Confirmer capacité et prix de reprise", dueAt: tomorrow, status: "terminee", result: "Capacité et prix de reprise acceptés" }
        ],
        risks: ["Fenêtre de conservation courte", "Prix de reprise encore déclaratif"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-foundiougne-claies",
        situationId: "sit-foundiougne-claies",
        title: "Remise en service des claies de fumage · Foundiougne",
        participantIds: ["act-relais-foundiougne", "act-transform-foundiougne", "act-prestataire", "act-coordinateur"],
        objective: "Rétablir une capacité de fumage suffisante avant la prochaine préparation, sans avancer de volume sauvé non relié à un lot.",
        decision: "Réparer une claie prioritaire et réorganiser l’ordre des lots en attendant la seconde.",
        commitments: [
          { id: "eng-foundiougne-prestataire", actorId: "act-prestataire", label: "Diagnostiquer et réparer une claie prioritaire", dueAt: tomorrow, status: "terminee", result: "Claie remise en service après remplacement d’un élément" },
          { id: "eng-foundiougne-transform", actorId: "act-transform-foundiougne", label: "Libérer la zone et confirmer l’ordre des lots", dueAt: tomorrow, status: "terminee", result: "Zone libérée, ordre des lots confirmé" },
          { id: "eng-foundiougne-relais", actorId: "act-relais-foundiougne", label: "Suivre l’arrivée et déposer le constat final", dueAt: tomorrow, status: "en_cours" }
        ],
        risks: ["Seconde claie encore indisponible", "Retard possible avant la prochaine préparation"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-elinkine-retour",
        situationId: "sit-elinkine-retour",
        title: "Suivi du retour retardé · Elinkine",
        participantIds: ["act-relais-elinkine", "act-capitaine-elinkine-demo", "act-operateur", "act-coordinateur"],
        objective: "Confirmer la situation de l’équipage et informer le responsable mandaté sans transformer un retard déclaré en détresse certaine.",
        decision: "Maintenir un point de contact unique et consigner chaque tentative jusqu’à confirmation de l’arrivée.",
        commitments: [
          { id: "eng-elinkine-relais", actorId: "act-relais-elinkine", label: "Relancer le contact convenu", dueAt: tomorrow, status: "terminee", result: "Deuxième contact radio confirme le retour vers la côte" },
          { id: "eng-elinkine-operateur", actorId: "act-operateur", label: "Consigner chaque appel", dueAt: tomorrow, status: "terminee", result: "Trois tentatives consignées" },
          { id: "eng-elinkine-coord", actorId: "act-coordinateur", label: "Informer le responsable mandaté", dueAt: tomorrow, status: "terminee", result: "Dispositif territorial informé" }
        ],
        risks: ["Information de position non confirmée avant contact", "Messages contradictoires si plusieurs canaux sont utilisés"],
        nextReviewAt: tomorrow
      },
      {
        id: "coord-cap-skirring-debouche",
        situationId: "sit-cap-skirring-debouche",
        title: "Débouché alternatif · Cap Skirring",
        participantIds: ["act-transform-sud", "act-mareyeur-sud", "act-operateur"],
        objective: "Orienter le lot annulé vers un débouché alternatif avant la fin de la fenêtre de conservation.",
        decision: "Réserver le transport auprès du mareyeur après acceptation explicite de l’acheteur alternatif.",
        commitments: [
          { id: "eng-cap-skirring-transform", actorId: "act-transform-sud", label: "Maintenir le lot dans les conditions annoncées", dueAt: tomorrow, status: "terminee", result: "Lot maintenu et conditions confirmées" },
          { id: "eng-cap-skirring-mareyeur", actorId: "act-mareyeur-sud", label: "Confirmer véhicule et débouché alternatif", dueAt: tomorrow, status: "terminee", result: "Véhicule et débouché confirmés" }
        ],
        risks: ["Fenêtre de conservation courte", "Acceptation de l’acheteur alternatif non garantie"],
        nextReviewAt: tomorrow
      },
      ...generatedCoordinationSpaces
    ],
    decisions: [
      {
        id: "dec-glace-1",
        situationId: "sit-glace",
        type: "demander_verification",
        rationale: "Confirmer l’indisponibilité avec le poste de quai avant de mobiliser une capacité de remplacement.",
        decidedByActorId: "act-coordinateur",
        decidedAt: now
      },
      {
        id: "dec-glace-2",
        situationId: "sit-glace",
        type: "ouvrir_coordination",
        rationale: "Panne confirmée : organiser sans délai un délestage temporaire vers Mbour pendant la réparation.",
        decidedByActorId: "act-coordinateur",
        decidedAt: now,
        coordinationId: "coord-froid"
      },
      {
        id: "dec-securite-1",
        situationId: "sit-saint-louis",
        type: "escalader",
        rationale: "Retard non expliqué : informer le dispositif territorial et renforcer le suivi téléphonique.",
        decidedByActorId: "act-coordinateur",
        decidedAt: now,
        coordinationId: "coord-securite"
      },
      {
        id: "dec-kayar-1",
        situationId: "sit-kayar",
        type: "ouvrir_coordination",
        rationale: "Rapprocher le lot réellement pesé du besoin déclaré, accepter une couverture partielle et conserver le reliquat ouvert sans conclure à une raréfaction biologique.",
        decidedByActorId: "act-operateur",
        decidedAt: now,
        coordinationId: "coord-kayar-marche"
      },
      {
        id: "dec-soumbedioune-1",
        situationId: "sit-soumbedioune",
        type: "demander_verification",
        rationale: "Une photographie transmise par le capitaine reste déclarative jusqu’au rapprochement par le service compétent.",
        decidedByActorId: "act-operateur",
        decidedAt: now,
        coordinationId: "coord-soumbedioune-immatriculation"
      },
      {
        id: "dec-rufisque-1",
        situationId: "sit-rufisque",
        type: "mobiliser_capacite",
        rationale: "La capacité immédiatement disponible ne couvre pas l’enlèvement ; un véhicule alternatif doit être confirmé avant d’être compté comme mobilisable.",
        decidedByActorId: "act-coordinateur",
        decidedAt: now,
        coordinationId: "coord-rufisque"
      },
      {
        id: "dec-djiffer-1",
        situationId: "sit-djiffer",
        type: "lancer_intervention",
        rationale: "Deux lectures incohérentes rendent la balance impropre aux pesées faisant foi jusqu’au contrôle avec masse étalon.",
        decidedByActorId: "act-coordinateur",
        decidedAt: now,
        coordinationId: "coord-djiffer"
      },
      {
        id: "dec-popenguine-1",
        situationId: "sit-popenguine-vente-locale",
        type: "ouvrir_coordination",
        rationale: "Un lot pesé et un intérêt local confirmé justifient une coordination légère des créneaux, sans situation de crise.",
        decidedByActorId: "act-relais-popenguine",
        decidedAt: now,
        coordinationId: "coord-popenguine-vente-locale"
      },
      {
        id: "dec-missirah-1",
        situationId: "sit-missirah-traceabilite",
        type: "demander_verification",
        rationale: "Le lieu et l’heure de collecte manquent au signal initial ; le lot ne doit pas être diffusé comme documenté avant leur confirmation.",
        decidedByActorId: "act-operateur",
        decidedAt: now,
        coordinationId: "coord-missirah-traceabilite"
      },
      {
        id: "dec-ouakam-1",
        situationId: "sit-ouakam-creneau-quai",
        type: "ouvrir_coordination",
        rationale: "La contrainte d’accès peut être absorbée par un autre créneau confirmé avant le retour de la pirogue.",
        decidedByActorId: "act-relais-ouakam",
        decidedAt: now,
        coordinationId: "coord-ouakam-creneau-quai"
      },
      {
        id: "dec-lompoul-1",
        situationId: "sit-lompoul-balises",
        type: "demander_verification",
        rationale: "Dresser une liste nominative volontaire des pirogues candidates et qualifier l’usage avant tout choix technique.",
        decidedByActorId: "act-coordinateur",
        decidedAt: now
      },
      {
        id: "dec-lompoul-2",
        situationId: "sit-lompoul-balises",
        type: "constituer_programme",
        rationale: "Besoin documenté et confirmé par plusieurs capitaines : transformer le signal en dossier de programme pour instruire un financement.",
        decidedByActorId: "act-coordinateur",
        decidedAt: now,
        coordinationId: "coord-lompoul-balises"
      },
      {
        id: "dec-fass-boye-1",
        situationId: "sit-fass-boye-conformite",
        type: "demander_verification",
        rationale: "Écart de dénomination détecté entre les deux pièces : demander le rapprochement auprès du point administratif mandaté sans bloquer la trace d’activité.",
        decidedByActorId: "act-operateur",
        decidedAt: now,
        coordinationId: "coord-fass-boye-conformite"
      },
      {
        id: "dec-yoff-1",
        situationId: "sit-yoff-marche",
        type: "ouvrir_coordination",
        rationale: "Chercher un débouché compatible pour le volume disponible plutôt que d’intervenir sur le prix du marché.",
        decidedByActorId: "act-operateur",
        decidedAt: now,
        coordinationId: "coord-yoff-marche"
      },
      {
        id: "dec-foundiougne-1",
        situationId: "sit-foundiougne-claies",
        type: "mobiliser_capacite",
        rationale: "Activer un prestataire référencé pour une réparation courte et réorganiser la file de préparation en attendant.",
        decidedByActorId: "act-coordinateur",
        decidedAt: now,
        coordinationId: "coord-foundiougne-claies"
      },
      {
        id: "dec-elinkine-1",
        situationId: "sit-elinkine-retour",
        type: "escalader",
        rationale: "Retard non expliqué : escalader selon la procédure territoriale et maintenir un point de contact unique.",
        decidedByActorId: "act-coordinateur",
        decidedAt: now,
        coordinationId: "coord-elinkine-retour"
      },
      {
        id: "dec-cap-skirring-debouche-1",
        situationId: "sit-cap-skirring-debouche",
        type: "ouvrir_coordination",
        rationale: "Proposer une solution avant l’échéance de conservation, avec un mareyeur et un second transformateur, sans modifier automatiquement le prix.",
        decidedByActorId: "act-operateur",
        decidedAt: now,
        coordinationId: "coord-cap-skirring-debouche"
      }
    ],
    evidences: [
      {
        id: "ev-glace-1",
        situationId: "sit-glace",
        commitmentId: "eng-1",
        type: "photo",
        label: "Constat terrain de la panne",
        detail: "Photo horodatée du compresseur à l’arrêt, prise au poste de quai de Joal.",
        recordedByActorId: "act-prestataire",
        recordedAt: now,
        trust: "observee"
      },
      {
        id: "ev-glace-2",
        situationId: "sit-glace",
        commitmentId: "eng-2",
        type: "confirmation",
        label: "Délestage vers Mbour confirmé",
        detail: "Confirmation du coordinateur territorial : volumes réorientés sans rupture de la chaîne du froid.",
        recordedByActorId: "act-coordinateur",
        recordedAt: now,
        trust: "declaree"
      },
      {
        id: "ev-securite-1",
        situationId: "sit-saint-louis",
        commitmentId: "eng-securite-1",
        type: "appel_consigne",
        label: "Contact radio avec l’équipage",
        detail: "Appel consigné à 08:42 : équipage en vue de côte, retour estimé sous 40 minutes.",
        recordedByActorId: "act-operateur",
        recordedAt: now,
        trust: "declaree"
      },
      {
        id: "ev-kayar-pesee",
        situationId: "sit-kayar",
        commitmentId: "eng-kayar-capitaine",
        type: "mesure",
        label: "Pesée du lot de thiof",
        detail: "Lot de 140 kg relié au débarquement de Kayar ; cette mesure décrit une disponibilité locale, pas l’état biologique de l’espèce.",
        recordedByActorId: "act-relais-kayar",
        recordedAt: now,
        trust: "observee"
      },
      {
        id: "ev-kayar-acceptation",
        situationId: "sit-kayar",
        commitmentId: "eng-kayar-mareyeur",
        type: "validation",
        label: "Couverture partielle acceptée",
        detail: "Le mareyeur accepte le lot pesé et maintient explicitement le reliquat de la demande en statut ouvert.",
        recordedByActorId: "act-mareyeur-nord",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-soumb-document",
        situationId: "sit-soumbedioune",
        commitmentId: "eng-soumb-relais",
        type: "document",
        label: "Copie de l’immatriculation et provenance",
        detail: "Photographie reçue du capitaine, saisie par le relais avec l’auteur et le canal d’origine conservés.",
        recordedByActorId: "act-relais-soumbedioune",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-soumb-validation",
        situationId: "sit-soumbedioune",
        commitmentId: "eng-soumb-institution",
        type: "validation",
        label: "Rattachement confirmé par le service compétent",
        detail: "Réponse institutionnelle simulée confirmant le numéro, la pirogue et le titulaire dans le jeu de démonstration.",
        recordedByActorId: "act-institution",
        recordedAt: now,
        trust: "officielle"
      },
      {
        id: "ev-rufisque-capacite",
        situationId: "sit-rufisque",
        commitmentId: "eng-rufisque-transporteur",
        type: "confirmation",
        label: "Véhicule et créneau confirmés",
        detail: "Le prestataire confirme le véhicule, la capacité mobilisable et le premier créneau d’enlèvement.",
        recordedByActorId: "act-transporteur-rufisque",
        recordedAt: now,
        trust: "verifiee"
      },
      {
        id: "ev-rufisque-bordereau",
        situationId: "sit-rufisque",
        commitmentId: "eng-rufisque-relais",
        type: "bordereau",
        label: "Prise en charge du premier enlèvement",
        detail: "Bordereau et relevé de température simulés ; aucune quantité perdue ou sauvée n’est déduite de cette preuve.",
        recordedByActorId: "act-relais-rufisque",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-djiffer-etalon",
        situationId: "sit-djiffer",
        commitmentId: "eng-djiffer-metrologue",
        type: "mesure",
        label: "Contrôle avec masse étalon",
        detail: "Lectures avant/après consignées lors du recalibrage de la balance.",
        recordedByActorId: "act-metrologue-djiffer",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-djiffer-exclusion",
        situationId: "sit-djiffer",
        commitmentId: "eng-djiffer-operateur",
        type: "validation",
        label: "Mesures contestées exclues",
        detail: "L’opérateur confirme que les pesées antérieures au contrôle ne sont pas utilisées dans les consolidations.",
        recordedByActorId: "act-operateur",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-popenguine-remise",
        situationId: "sit-popenguine-vente-locale",
        commitmentId: "eng-popenguine-relais",
        type: "bordereau",
        label: "Remise du lot au créneau convenu",
        detail: "Fiche de lot, acceptation de l’acheteur et remise sont reliées dans une opération territoriale stable.",
        recordedByActorId: "act-relais-popenguine",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-missirah-fiche",
        situationId: "sit-missirah-traceabilite",
        commitmentId: "eng-missirah-relais",
        type: "document",
        label: "Fiche de provenance complétée",
        detail: "Lieu, heure, collectrice et chaîne de remise sont renseignés pour le lot de crevettes.",
        recordedByActorId: "act-relais-missirah",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-missirah-remise",
        situationId: "sit-missirah-traceabilite",
        commitmentId: "eng-missirah-mareyeur",
        type: "bordereau",
        label: "Prise en charge du lot",
        detail: "Le mareyeur confirme la prise en charge après vérification du dossier ; cette preuve n’est pas une certification environnementale.",
        recordedByActorId: "act-mareyeur-missirah",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-ouakam-creneau",
        situationId: "sit-ouakam-creneau-quai",
        commitmentId: "eng-ouakam-relais",
        type: "confirmation",
        label: "Créneau alternatif confirmé",
        detail: "Le point de débarquement, l’heure et les accords du capitaine et du mareyeur sont consignés avant l’arrivée.",
        recordedByActorId: "act-relais-ouakam",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-lompoul-1",
        situationId: "sit-lompoul-balises",
        commitmentId: "eng-lompoul-relais",
        type: "confirmation",
        label: "Liste volontaire des pirogues candidates",
        detail: "Trois capitaines et le responsable du quai confirment l’existence du besoin ; 25 pirogues volontaires recensées.",
        recordedByActorId: "act-relais-lompoul",
        recordedAt: now,
        trust: "rapprochee"
      },
      {
        id: "ev-lompoul-2",
        situationId: "sit-lompoul-balises",
        type: "document",
        label: "Fiche d’exigences du besoin",
        detail: "Autonomie, étanchéité, déclenchement, formation, maintenance et responsabilité de suivi listés avant tout choix technique.",
        recordedByActorId: "act-coordinateur",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-fass-boye-1",
        situationId: "sit-fass-boye-conformite",
        commitmentId: "eng-fass-boye-capitaine",
        type: "document",
        label: "Pièce d’immatriculation complémentaire",
        detail: "Deuxième pièce déposée par le capitaine ; identifiants rapprochés avec la première.",
        recordedByActorId: "act-operateur",
        recordedAt: now,
        trust: "rapprochee"
      },
      {
        id: "ev-yoff-1",
        situationId: "sit-yoff-marche",
        commitmentId: "eng-yoff-transform",
        type: "bordereau",
        label: "Bordereau d’enlèvement simulé",
        detail: "Offre acceptée entre la mareyeuse et le transformateur ; enlèvement programmé dans la fenêtre annoncée.",
        recordedByActorId: "act-operateur",
        recordedAt: now,
        trust: "documentee"
      },
      {
        id: "ev-foundiougne-1",
        situationId: "sit-foundiougne-claies",
        commitmentId: "eng-foundiougne-prestataire",
        type: "photo",
        label: "Photos avant/après de la claie réparée",
        detail: "Essai de stabilité effectué avant remise en service.",
        recordedByActorId: "act-prestataire",
        recordedAt: now,
        trust: "verifiee"
      },
      {
        id: "ev-elinkine-1",
        situationId: "sit-elinkine-retour",
        commitmentId: "eng-elinkine-relais",
        type: "appel_consigne",
        label: "Journal d’appels et confirmation radio",
        detail: "Trois tentatives consignées ; le deuxième contact radio confirme que l’équipage se dirige vers la côte.",
        recordedByActorId: "act-relais-elinkine",
        recordedAt: now,
        trust: "verifiee"
      },
      {
        id: "ev-cap-skirring-debouche-1",
        situationId: "sit-cap-skirring-debouche",
        commitmentId: "eng-cap-skirring-mareyeur",
        type: "bordereau",
        label: "Bordereau d’enlèvement et confirmation de réception",
        detail: "Toutes les pièces (annulation initiale, fiche lot, acceptation alternative, bordereau) sont reliées au dossier.",
        recordedByActorId: "act-operateur",
        recordedAt: now,
        trust: "verifiee"
      }
    ],
    communications: [
      {
        id: "com-glace-1",
        channel: "whatsapp",
        status: "lu",
        actorId: "act-operateur",
        situationId: "sit-glace",
        subject: "Panne machine à glace — quai de Joal",
        body: "Le poste de quai signale la machine à glace à l’arrêt depuis 08:10. Confirmation demandée avant mobilisation.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-glace-2",
        channel: "telephone",
        status: "repondu",
        actorId: "act-coordinateur",
        situationId: "sit-glace",
        commitmentId: "eng-2",
        subject: "Organisation du délestage vers Mbour",
        body: "Appel au prestataire froid pour confirmer la capacité disponible à Mbour le temps de la réparation.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-securite-1",
        channel: "sms",
        status: "envoye",
        actorId: "act-operateur",
        situationId: "sit-saint-louis",
        subject: "Suivi retour retardé",
        body: "SMS de relance envoyé au dispositif territorial de sécurité, en attente de réponse.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-kayar-partiel",
        channel: "whatsapp",
        status: "repondu",
        actorId: "act-mareyeur-nord",
        situationId: "sit-kayar",
        commitmentId: "eng-kayar-mareyeur",
        subject: "Couverture partielle du besoin de thiof",
        body: "Le lot pesé est accepté ; le reliquat reste ouvert. Aucune conclusion statistique ou biologique n’est tirée de cette disponibilité locale.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-soumb-verification",
        channel: "notification_produit",
        status: "repondu",
        actorId: "act-institution",
        situationId: "sit-soumbedioune",
        commitmentId: "eng-soumb-institution",
        subject: "Rattachement administratif confirmé",
        body: "Réponse simulée du service compétent : numéro, pirogue et titulaire rapprochés dans le dossier de démonstration.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-rufisque-transport",
        channel: "telephone",
        status: "repondu",
        actorId: "act-transporteur-rufisque",
        situationId: "sit-rufisque",
        commitmentId: "eng-rufisque-transporteur",
        subject: "Véhicule alternatif confirmé",
        body: "Le prestataire confirme le véhicule, la capacité et le premier créneau ; le solde reste planifié séparément.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-djiffer-controle",
        channel: "saisie_terrain",
        status: "remis",
        actorId: "act-metrologue-djiffer",
        situationId: "sit-djiffer",
        commitmentId: "eng-djiffer-metrologue",
        subject: "Contrôle métrologique terminé",
        body: "Les lectures avant/après sont consignées ; la balance peut revenir en service et les anciennes mesures restent exclues.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-popenguine-retrait",
        channel: "whatsapp",
        status: "repondu",
        actorId: "act-mareyeur-popenguine",
        situationId: "sit-popenguine-vente-locale",
        commitmentId: "eng-popenguine-mareyeur",
        subject: "Créneau de retrait accepté",
        body: "L’acheteur confirme le retrait du lot au créneau proposé par le relais de Popenguine.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-missirah-note-vocale",
        channel: "saisie_terrain",
        status: "remis",
        actorId: "act-relais-missirah",
        situationId: "sit-missirah-traceabilite",
        commitmentId: "eng-missirah-relais",
        subject: "Note vocale transformée en fiche de lot",
        body: "Le relais conserve Awa Sagna comme source et complète le lieu, l’heure et la chaîne de remise avant diffusion.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-ouakam-creneau",
        channel: "notification_produit",
        status: "repondu",
        actorId: "act-capitaine-ouakam-demo",
        situationId: "sit-ouakam-creneau-quai",
        commitmentId: "eng-ouakam-capitaine",
        subject: "Nouveau créneau de débarquement accepté",
        body: "Le capitaine confirme la nouvelle heure et le mareyeur reçoit le même rendez-vous.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-lompoul-1",
        channel: "saisie_terrain",
        status: "remis",
        actorId: "act-relais-lompoul",
        situationId: "sit-lompoul-balises",
        subject: "Note vocale reçue — besoin de balises",
        body: "Note vocale d’un capitaine transcrite et confirmée par rappel : plusieurs équipages veulent signaler leur position en cas de retour prolongé.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-fass-boye-1",
        channel: "notification_produit",
        status: "envoye",
        actorId: "act-operateur",
        situationId: "sit-fass-boye-conformite",
        subject: "Demande de contrôle transmise",
        body: "Demande de rapprochement transmise au point administratif mandaté ; statut affiché « vérification en attente ».",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-yoff-1",
        channel: "whatsapp",
        status: "repondu",
        actorId: "act-mareyeuse-yoff",
        situationId: "sit-yoff-marche",
        subject: "Volume de sardinelle sans débouché confirmé",
        body: "Quatre prix déclarés au même stade de marché ; recherche d’un débouché avant dégradation.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-foundiougne-1",
        channel: "telephone",
        status: "repondu",
        actorId: "act-relais-foundiougne",
        situationId: "sit-foundiougne-claies",
        commitmentId: "eng-foundiougne-relais",
        subject: "Suivi de la remise en service",
        body: "Appel de suivi avec la responsable du groupement pour confirmer l’heure de remise en service.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-elinkine-1",
        channel: "telephone",
        status: "repondu",
        actorId: "act-relais-elinkine",
        situationId: "sit-elinkine-retour",
        commitmentId: "eng-elinkine-relais",
        subject: "Contact radio avec l’équipage",
        body: "Deuxième contact radio confirmé : l’équipage se dirige vers la côte, le quai prépare l’accueil.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "com-cap-skirring-debouche-1",
        channel: "notification_produit",
        status: "repondu",
        actorId: "act-transform-sud",
        situationId: "sit-cap-skirring-debouche",
        subject: "Débouché alternatif proposé",
        body: "Proposition transmise à un second transformateur et à un mareyeur pour orienter le lot avant l’échéance.",
        simulated: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    priceObservations: [
      { id: "price-thiof-kayar", speciesId: "sp-thiof", territoryId: "kayar", marketName: "Marché de Kayar", priceFcfaKg: 3900, observedAt: now, source: "Point de prix déclaratif isolé — aucune tendance statistique", trust: "declaree", trend: "hausse", flagged: true },
      { id: "price-thiof-joal", speciesId: "sp-thiof", territoryId: "joal", marketName: "Marché de Joal", priceFcfaKg: 3400, observedAt: now, source: "Relais marché", trust: "observee", trend: "hausse", flagged: false },
      { id: "price-sard-mbour", speciesId: "sp-sardinelle", territoryId: "mbour", marketName: "Marché de Mbour", priceFcfaKg: 900, observedAt: now, source: "Relevé de marché", trust: "verifiee", trend: "baisse", flagged: false },
      { id: "price-sole-hann", speciesId: "sp-sole", territoryId: "hann", marketName: "Marché de Hann", priceFcfaKg: 2950, observedAt: now, source: "Déclaration acheteur", trust: "declaree", trend: "stable", flagged: false },
      { id: "price-mulet-saint", speciesId: "sp-mulet", territoryId: "saint-louis", marketName: "Marché de Saint-Louis", priceFcfaKg: 1725, observedAt: now, source: "Relevé groupé de deux mareyeurs", trust: "observee", trend: "stable", flagged: false },
      { id: "price-maquereau-hann", speciesId: "sp-maquereau", territoryId: "hann", marketName: "Marché de Hann", priceFcfaKg: 1375, observedAt: now, source: "Relevé opérateur", trust: "verifiee", trend: "baisse", flagged: false },
      { id: "price-sard-soumb", speciesId: "sp-sardinelle", territoryId: "soumbedioune", marketName: "Marché de Soumbédioune", priceFcfaKg: 1025, observedAt: now, source: "Déclaration mareyeur", trust: "declaree", trend: "stable", flagged: true },
      { id: "price-sard-kaf", speciesId: "sp-sardinelle", territoryId: "kafountine", marketName: "Marché de Kafountine", priceFcfaKg: 875, observedAt: now, source: "Relais territorial", trust: "observee", trend: "baisse", flagged: false },
      { id: "price-sole-cap", speciesId: "sp-sole", territoryId: "cap-skirring", marketName: "Marché de Cap Skirring", priceFcfaKg: 3050, observedAt: now, source: "Relevé acheteur", trust: "observee", trend: "hausse", flagged: false },
      ...generatedPriceObservations
    ],
    scarcity: [
      { id: "scar-thiof-kayar", speciesId: "sp-thiof", territoryId: "kayar", status: "sous_tension", availableKg: 140, requestedKg: 600, reasons: ["Besoin déclaré supérieur au lot local pesé", "Lecture commerciale locale et ponctuelle", "Aucune conclusion sur le stock biologique ni sur l’inflation"], trust: "observee" },
      { id: "scar-sard-mbour", speciesId: "sp-sardinelle", territoryId: "mbour", status: "abondant", availableKg: 2100, requestedKg: 900, reasons: ["Débarquement supérieur au besoin ouvert", "Capacité froide limitée"], trust: "verifiee" },
      { id: "scar-sole-hann", speciesId: "sp-sole", territoryId: "hann", status: "disponible", availableKg: 360, requestedKg: 350, reasons: ["Lot vérifié disponible", "Besoin proche du volume observé"], trust: "verifiee" },
      { id: "scar-mulet-saint", speciesId: "sp-mulet", territoryId: "saint-louis", status: "abondant", availableKg: 1040, requestedKg: 500, reasons: ["Volume disponible supérieur au besoin groupé"], trust: "verifiee" },
      { id: "scar-sard-kaf", speciesId: "sp-sardinelle", territoryId: "kafountine", status: "disponible", availableKg: 980, requestedKg: 500, reasons: ["Transformation locale engagée", "Solde disponible à confirmer"], trust: "observee" },
      { id: "scar-sole-cap", speciesId: "sp-sole", territoryId: "cap-skirring", status: "sous_tension", availableKg: 410, requestedKg: 520, reasons: ["Deux besoins récents", "Transport encore non confirmé"], trust: "observee" },
      ...generatedScarcity
    ],
    sustainability: [
      { id: "sust-mbour-sard", lotId: "lot-mbour-sardinelle", provenanceComplete: true, practice: "Filet tournant déclaré", zone: "Petite-Côte Sud", status: "vigilance", reasons: ["Traçabilité complète à 88 %", "Espèce sous surveillance locale"], recommendation: "Conserver la zone et la méthode dans la trace jusqu’à destination", trust: "verifiee" },
      { id: "sust-mbour-sole", lotId: "lot-mbour-sole", provenanceComplete: true, practice: "Filet maillant déclaré", zone: "Petite-Côte Sud", status: "favorable", reasons: ["Provenance renseignée", "Qualité A", "Chaîne froide documentée"], recommendation: "Maintenir les relevés de conservation", trust: "verifiee" },
      { id: "sust-hann-maquereau", lotId: "lot-hann-maquereau", provenanceComplete: true, practice: "Ligne et filet déclarés", zone: "Presqu’île du Cap-Vert", status: "favorable", reasons: ["Trace complète à 96 %", "Conservation documentée"], recommendation: "Associer la preuve de livraison à la trace", trust: "consolidee" },
      { id: "sust-soumb-sard", lotId: "lot-soumb-sardinelle", provenanceComplete: false, practice: "Méthode à confirmer", zone: "Cap-Vert Ouest", status: "incomplet", reasons: ["Méthode de pêche manquante", "Immatriculation rapprochée par le service compétent"], recommendation: "Compléter la méthode avant diffusion partenaire ; la vérification administrative ne suffit pas à qualifier la pratique", trust: "documentee" },
      { id: "sust-kaf-sard", lotId: "lot-kaf-sardinelle", provenanceComplete: true, practice: "Filet tournant déclaré", zone: "Casamance Nord", status: "vigilance", reasons: ["Traçabilité complète à 86 %", "Transport groupé documenté"], recommendation: "Confirmer la température à la livraison", trust: "verifiee" },
      { id: "sust-cap-sole", lotId: "lot-cap-sole", provenanceComplete: true, practice: "Filet maillant déclaré", zone: "Casamance Sud", status: "favorable", reasons: ["Zone et pirogue vérifiées", "Qualité A"], recommendation: "Maintenir la continuité froide pendant le transport", trust: "verifiee" },
      { id: "sust-missirah-crevette", lotId: "lot-missirah-demo-1-2", provenanceComplete: true, practice: "Méthode de collecte déclarée", zone: "Zone estuarienne de Missirah", status: "vigilance", reasons: ["Provenance et chaîne de remise documentées", "Aucune certification environnementale attachée au lot"], recommendation: "Maintenir les preuves de provenance et de conservation sans transformer la traçabilité en allégation de durabilité", trust: "documentee" },
      ...generatedSustainability
    ],
    communityPosts: [
      { id: "post-glace", authorId: "act-operateur", territoryId: "joal", community: "Infrastructures et services", category: "alerte", title: "Machine à glace arrêtée à Joal", body: "Le poste de quai confirme l’indisponibilité depuis 08:10.", createdAt: now, status: "transforme", convertedObjectId: "sit-glace", comments: [{ id: "comment-1", authorId: "act-prestataire", body: "Technicien mobilisable avant midi." }] },
      { id: "post-sard", authorId: "act-mareyeur", territoryId: "mbour", community: "Opportunités territoriales", category: "opportunite", title: "Sardinelle disponible à Mbour", body: "Lot vérifié de qualité B, orientation rapide souhaitée.", createdAt: now, status: "publie", comments: [] },
      { id: "post-learning", authorId: "act-coordinateur", territoryId: "kafountine", community: "Bonnes pratiques", category: "apprentissage", title: "Préparer les itinéraires de délestage", body: "L’accord préalable entre quai et transporteurs réduit le délai d’orientation.", createdAt: now, status: "publie", comments: [] },
      { id: "post-securite", authorId: "act-operateur", territoryId: "saint-louis", community: "Sécurité des sorties", category: "information", title: "Procédure commune pour un retour retardé", body: "Le poste de quai partage un point de contact unique afin d’éviter les messages contradictoires.", createdAt: now, status: "transforme", convertedObjectId: "sit-saint-louis", comments: [] },
      { id: "post-balance", authorId: "act-metrologue-djiffer", territoryId: "djiffer", community: "Qualité et pesée", category: "capacite", title: "Contrôle de balance terminé à Djiffer", body: "Le relevé avant/après est disponible et les pesées antérieures contestées restent exclues.", createdAt: now, status: "transforme", convertedObjectId: "sit-djiffer", comments: [] },
      { id: "post-immatriculation", authorId: "act-relais-soumbedioune", territoryId: "soumbedioune", community: "Actifs et conformité", category: "information", title: "Rattachement administratif confirmé à Soumbédioune", body: "Le document déclaré, le relais de saisie et la réponse du service compétent restent liés au dossier.", createdAt: now, status: "transforme", convertedObjectId: "sit-soumbedioune", comments: [{ id: "comment-imm-1", authorId: "act-institution", body: "La réponse institutionnelle simulée est jointe à la pièce initiale." }] },
      { id: "post-popenguine-vente", authorId: "act-relais-popenguine", territoryId: "popenguine", community: "Opérations territoriales", category: "information", title: "Remise locale coordonnée à Popenguine", body: "Le lot, l’acheteur et le créneau ont été confirmés sans intervention d’urgence.", createdAt: now, status: "transforme", convertedObjectId: "sit-popenguine-vente-locale", comments: [] },
      { id: "post-missirah-traceabilite", authorId: "act-relais-missirah", territoryId: "missirah", community: "Traçabilité des lots", category: "apprentissage", title: "Compléter une provenance reçue par note vocale", body: "La fiche conserve la collectrice comme source et distingue la traçabilité d’une certification environnementale.", createdAt: now, status: "transforme", convertedObjectId: "sit-missirah-traceabilite", comments: [] },
      { id: "post-ouakam-creneau", authorId: "act-relais-ouakam", territoryId: "ouakam", community: "Organisation des quais", category: "information", title: "Créneau alternatif confirmé à Ouakam", body: "Une contrainte légère d’accès a été résolue avant l’arrivée de la pirogue.", createdAt: now, status: "transforme", convertedObjectId: "sit-ouakam-creneau-quai", comments: [] },
      ...generatedCommunityPosts
    ],
    partnerServices: [
      { id: "service-froid", organizationId: "org-froid", name: "Maintenance et production de glace", category: "froid", territoryIds: ["joal", "mbour", "kayar"], status: "qualifie", trust: "verifiee", activationConditions: "Diagnostic validé et bon d’intervention" },
      { id: "service-logistique", organizationId: "org-mareyeurs", name: "Transport froid groupé", category: "logistique", territoryIds: ["joal", "mbour", "hann", "rufisque", "kafountine", "cap-skirring"], status: "reference", trust: "declaree", activationConditions: "Volume minimal de 500 kg" },
      { id: "service-finance", organizationId: "org-partner", name: "Appui aux infrastructures territoriales", category: "financement", territoryIds: ["joal", "mbour", "kayar", "djiffer"], status: "a_activer", trust: "observee", activationConditions: "Dossier d’investissement et cofinancement documentés" },
      { id: "service-maintenance-sud", organizationId: "org-froid", name: "Maintenance itinérante Casamance", category: "maintenance", territoryIds: ["kafountine", "cap-skirring"], status: "reference", trust: "observee", activationConditions: "Tournée planifiée et pièces critiques disponibles" },
      { id: "service-assurance", organizationId: "org-partner", name: "Couverture pilote des équipements de froid", category: "assurance", territoryIds: ["hann", "soumbedioune", "rufisque"], status: "a_activer", trust: "declaree", activationConditions: "Inventaire vérifié et protocole de maintenance actif" },
      { id: "service-logistique-national", organizationId: "org-logistique", name: "Lignes froides littorales mutualisées", category: "logistique", territoryIds: territoryRows.map(([id]) => id), status: "qualifie", trust: "observee", activationConditions: "Volume consolidé, itinéraire et température cible confirmés" },
      { id: "service-finance-bleue", organizationId: "org-finance", name: "Cofinancement d’équipements productifs", category: "financement", territoryIds: territoryRows.map(([id]) => id), status: "a_activer", trust: "declaree", activationConditions: "Besoin qualifié, gouvernance et plan de maintenance documentés" },
      { id: "service-saloum", organizationId: "org-saloum", name: "Regroupement et transformation estuarienne", category: "logistique", territoryIds: ["foundiougne", "djiffer", "missirah"], status: "reference", trust: "observee", activationConditions: "Fenêtre de collecte et volumes confirmés par les relais" },
      { id: "service-metrologie-djiffer", organizationId: "org-froid", name: "Contrôle et recalibrage des équipements de pesée", category: "maintenance", territoryIds: ["djiffer"], status: "qualifie", trust: "documentee", activationConditions: "Équipement isolé, masse étalon disponible et relevé avant/après exigé" }
    ],
    initiatives: [
      {
        id: "init-froid",
        title: "Programme territorial de résilience de la chaîne du froid",
        territoryIds: ["joal", "mbour", "kayar"],
        situationIds: ["sit-glace", "sit-mbour", "sit-kayar"],
        objective: "Sécuriser la conservation et valoriser les débarquements de la Petite-Côte",
        status: "cadrage",
        ownerId: "act-gestionnaire",
        budgetFcfa: 185000000,
        budgetStatus: "valide" as const,
        funding: [{ id: "fund-1", partnerId: "act-partenaire", amountFcfa: 80000000, status: "en_instruction", condition: "Plan de maintenance et cofinancement territorial" }],
        indicators: [
          { label: "Lots orientés vers une capacité froide", baseline: 34, target: 85, current: 58, unit: "%" },
          { label: "Temps moyen de remise en service", baseline: 72, target: 24, current: 41, unit: "h" }
        ]
      },
      {
        id: "init-securite",
        title: "Dispositif territorial de suivi des retours et alertes",
        territoryIds: ["saint-louis", "kayar"],
        situationIds: ["sit-saint-louis"],
        objective: "Réduire les délais de qualification et fiabiliser la chaîne d’alerte entre capitaines, quais et responsables territoriaux",
        status: "cadrage",
        ownerId: "act-coordinateur",
        budgetFcfa: 95000000,
        budgetStatus: "valide" as const,
        funding: [
          { id: "fund-securite-1", partnerId: "act-partenaire", amountFcfa: 40000000, status: "a_mobiliser", condition: "Protocole partagé et responsables territoriaux désignés" },
          { id: "fund-securite-2", partnerId: "act-institution", amountFcfa: 15000000, status: "confirme", condition: "Phase de cadrage et formation des relais" }
        ],
        indicators: [
          { label: "Alertes qualifiées en moins de 15 minutes", baseline: 22, target: 80, current: 46, unit: "%" },
          { label: "Quais avec relais mandaté", baseline: 1, target: 8, current: 3, unit: "quais" }
        ]
      },
      {
        id: "init-immatriculation",
        title: "Référentiel progressif des pirogues et immatriculations",
        territoryIds: ["hann", "soumbedioune", "rufisque", "mbour"],
        situationIds: ["sit-soumbedioune"],
        objective: "Fiabiliser le rattachement des actifs sans bloquer la déclaration initiale des acteurs",
        status: "execution",
        ownerId: "act-institution",
        budgetFcfa: 60000000,
        budgetStatus: "valide" as const,
        funding: [{ id: "fund-imm-1", partnerId: "act-partenaire", amountFcfa: 25000000, status: "confirme", condition: "Audit des droits d’accès et conservation des sources" }],
        indicators: [
          { label: "Pirogues avec immatriculation vérifiée", baseline: 18, target: 75, current: 43, unit: "%" },
          { label: "Dossiers incomplets requalifiés", baseline: 0, target: 120, current: 36, unit: "dossiers" }
        ]
      },
      // Lot 3 (R&D, arbitrage CEO 13/08/2026) : budget non chiffré,
      // aucun financeur engagé — statut "cadrage" affiché comme
      // « Recherche de financement », budgetFcfa absent plutôt que 0
      // (arbitrage 3, Initiative.budgetStatus).
      {
        id: "init-lompoul-balises",
        title: "Équipement de géolocalisation pour pirogues · Lompoul-sur-Mer",
        territoryIds: ["lompoul"],
        situationIds: ["sit-lompoul-balises"],
        objective: "Documenter et instruire le financement d’un dispositif de géolocalisation pour les pirogues volontaires, avant tout choix technique ou fournisseur.",
        status: "cadrage",
        ownerId: "act-coordinateur",
        budgetStatus: "a_estimer",
        funding: [],
        indicators: []
      },
      ...generatedInitiatives
    ],
    learnings: [
      { id: "learn-1", situationId: "sit-kafountine", title: "Activer un itinéraire de délestage avant saturation", summary: "Un accord préalable entre quai, transporteurs et chambre froide réduit le temps d’orientation des lots.", reusableIn: ["joal", "mbour", "kayar"] },
      { id: "learn-kayar-marche", situationId: "sit-kayar", title: "Séparer tension commerciale locale, prix et état biologique", summary: "Un besoin supérieur au lot disponible peut déclencher une coordination sans devenir une statistique d’inflation ni une preuve de raréfaction de l’espèce.", reusableIn: ["yoff", "mbour", "popenguine"] },
      { id: "learn-2", situationId: "sit-soumbedioune", title: "Une vérification positive doit conserver toute sa chaîne de source", summary: "Le document reste déclaré à réception ; seule la réponse du service compétent permet d’élever son statut, sans effacer le capitaine et le relais à l’origine du dossier.", reusableIn: ["hann", "rufisque", "saint-louis"] },
      { id: "learn-rufisque-transport", situationId: "sit-rufisque", title: "Une capacité n’existe opérationnellement qu’après confirmation", summary: "Le véhicule, la capacité et le créneau doivent être acceptés par le prestataire avant d’être comptés comme mobilisables.", reusableIn: ["joal", "mbour", "kafountine"] },
      { id: "learn-3", situationId: "sit-djiffer", title: "La confiance dans les données commence par l’équipement de mesure", summary: "Isoler la balance, documenter le contrôle et exclure les mesures contestées évitent de consolider des volumes artificiellement précis.", reusableIn: ["joal", "mbour", "kafountine"] },
      { id: "learn-popenguine-vente", situationId: "sit-popenguine-vente-locale", title: "La coordination crée aussi de la valeur quand le territoire va bien", summary: "Un lot, un acheteur et un créneau confirmés suffisent à démontrer une opération utile sans fabriquer une crise.", reusableIn: ["yoff", "mbour", "joal"] },
      { id: "learn-missirah-traceabilite", situationId: "sit-missirah-traceabilite", title: "Une provenance documentée n’est pas une certification environnementale", summary: "La traçabilité permet de suivre le lot et sa remise ; elle ne prouve ni la durabilité de la pratique ni l’état de la ressource.", reusableIn: ["foundiougne", "djiffer", "elinkine"] },
      { id: "learn-ouakam-creneau", situationId: "sit-ouakam-creneau-quai", title: "Traiter tôt une petite contrainte évite une fausse urgence", summary: "Un créneau alternatif confirmé par le quai, le capitaine et le mareyeur peut absorber une indisponibilité légère sans escalade inutile.", reusableIn: ["yoff", "soumbedioune", "hann"] },
      { id: "learn-lompoul-balises", situationId: "sit-lompoul-balises", title: "Un message vocal court peut devenir un dossier d’équipement exploitable", summary: "Si l’auteur, le relais, les confirmations et les limites restent visibles, une note vocale peut être transformée en dossier de programme finançable — sans devenir une preuve d’impact sécurité.", reusableIn: ["fass-boye", "kayar", "elinkine"] },
      { id: "learn-fass-boye-conformite", situationId: "sit-fass-boye-conformite", title: "Une donnée administrative déclarée peut soutenir le suivi sans être confondue avec une donnée officielle", summary: "Afficher « vérification en attente » plutôt que d’effacer le dossier ou de le présenter comme conforme rend l’incertitude visible et actionnable.", reusableIn: ["soumbedioune", "hann", "rufisque"] },
      { id: "learn-yoff-marche", situationId: "sit-yoff-marche", title: "Un signal de prix devient utile s’il déclenche une coordination documentée", summary: "Comparer des offres réellement comparables puis orienter le volume évite de transformer un signal de prix en indice d’inflation non vérifié.", reusableIn: ["kayar", "soumbedioune", "mbour"] },
      { id: "learn-foundiougne-claies", situationId: "sit-foundiougne-claies", title: "Distinguer équipement réparé, capacité disponible et volume traité", summary: "Séparer ces trois niveaux évite de gonfler le résultat d’une réparation d’équipement de transformation.", reusableIn: ["djiffer", "missirah", "kafountine"] },
      { id: "learn-elinkine-retour", situationId: "sit-elinkine-retour", title: "Escalader l’incertitude sans transformer un retard déclaré en détresse certaine", summary: "Un point de contact unique et un journal d’appels évitent les informations contradictoires pendant l’attente.", reusableIn: ["lompoul", "saint-louis"] },
      { id: "learn-cap-skirring-debouche", situationId: "sit-cap-skirring-debouche", title: "Une annulation devient coordonnable si lot, délai et engagements sont reliés", summary: "Relier le lot, le délai et les engagements dans un même dossier évite de perdre la traçabilité d’une annulation de dernière minute.", reusableIn: ["yoff", "kafountine"] }
    ],
    reports: [
      {
        id: "report-national",
        title: "Situation halieutique de démonstration",
        territoryIds: territoryRows.map(([id]) => id),
        generatedAt: now,
        period: "Semaine du 3 août 2026",
        status: "pret",
        metrics: [
          { label: "Volume débarqué observé", value: "9,45 t", source: "Six pesées reliées aux quais", trust: "verifiee", limit: "Échantillon déterministe de démonstration" },
          { label: "Volume immédiatement orientable", value: "4,85 t", source: "Lots disponibles et engagements", trust: "verifiee", limit: "Disponibilité instantanée simulée" },
          { label: "Valeur potentielle documentée", value: "12,6 M FCFA", source: "Volumes × prix indicatifs", trust: "observee", limit: "Estimation, aucune transaction réalisée" },
          { label: "Territoires représentés", value: `${territories.length}`, source: "Référentiel de démonstration", trust: "consolidee", limit: "Géométrie illustrative, non réglementaire" }
        ]
      },
      {
        id: "report-petite-cote",
        title: "Continuité de la chaîne du froid · Petite-Côte",
        territoryIds: ["kayar", "mbour", "joal"],
        generatedAt: now,
        period: "Semaine du 3 août 2026",
        status: "pret",
        metrics: [
          { label: "Capacités fragiles ou indisponibles", value: "3", source: "Référentiel des infrastructures", trust: "verifiee", limit: "États simulés à un instant donné" },
          { label: "Financement en instruction", value: "80 M FCFA", source: "Programme résilience froid", trust: "observee", limit: "Instruction non équivalente à un engagement ferme" }
        ]
      },
      {
        id: "report-casamance",
        title: "Flux et valorisation · Casamance",
        territoryIds: ["kafountine", "cap-skirring"],
        generatedAt: now,
        period: "Semaine du 3 août 2026",
        status: "a_actualiser",
        metrics: [
          { label: "Volume pesé dans la démonstration", value: "2,44 t", source: "Deux débarquements reliés", trust: "verifiee", limit: "Ne représente pas l’activité totale du territoire" },
          { label: "Volume orienté par transport groupé", value: "1,2 t", source: "Coordination Casamance", trust: "consolidee", limit: "Scénario de démonstration" }
        ]
      },
      ...generatedReports
    ],
    plans: [
      { id: "plan-public", name: "Public", target: "Visiteurs et acteurs de la filière", capabilities: ["Atlas public", "Contenus ouverts", "Démonstration guidée"], limits: ["Données agrégées", "Pas d’action opérationnelle"], value: "Comprendre la filière et Mbàmbulaan", onQuote: false },
      { id: "plan-pro", name: "Professionnel", target: "Pêcheurs, capitaines, mareyeurs, transformateurs et prestataires", capabilities: ["Espace professionnel", "Coordination", "Besoins et capacités", "Community", "Atlas professionnel"], limits: ["Un utilisateur", "Exports limités"], value: "Agir plus vite et conserver un historique métier", onQuote: true },
      { id: "plan-org", name: "Organisation", target: "GIE, coopératives et entreprises", capabilities: ["Membres", "Actifs", "Capacités", "Rapports", "Multi-utilisateurs"], limits: ["Un périmètre organisationnel"], value: "Coordonner collectivement et démontrer les résultats", onQuote: true },
      { id: "plan-territory", name: "Territoire", target: "Sites, collectivités et programmes territoriaux", capabilities: ["Atlas territorial", "Infrastructures", "Incidents", "Comparaisons", "Rapports"], limits: ["Territoires contractualisés"], value: "Piloter les capacités et prioriser les investissements", onQuote: true },
      { id: "plan-institution", name: "Institution", target: "Ministères, agences et programmes publics", capabilities: ["Vision consolidée", "Pilotage multi-territoires", "Durabilité", "Exports", "Aide à la décision"], limits: ["Données selon mandats et sources"], value: "Fiabiliser l’information et documenter les décisions", onQuote: true },
      { id: "plan-partner", name: "Partenaire", target: "Opérateurs techniques, logistiques et financiers", capabilities: ["Besoins qualifiés", "Services", "Engagements", "Résultats partenaires"], limits: ["Accès contrôlé aux dossiers"], value: "Intervenir dans un cadre qualifié et mesurable", onQuote: true },
      { id: "plan-atlas", name: "Atlas Premium", target: "Organisations et institutions", capabilities: ["Historique", "Comparaison", "Filtres avancés", "Prix", "Rareté", "Exports"], limits: ["Périmètres souscrits"], value: "Transformer les données territoriales en décisions explicables", onQuote: true }
    ],
    subscriptions: organizations.map((organization) => ({
      id: `sub-${organization.id}`,
      organizationId: organization.id,
      planId: organization.id === "org-coordination" ? "plan-institution" : organization.id === "org-partner" ? "plan-partner" : organization.id === "org-capitaines" ? "plan-org" : "plan-pro",
      status: "demonstration",
      entitlements: organization.id === "org-coordination"
        ? ["atlas_premium", "coordination", "rapports", "administration_referentiels"]
        : ["atlas_professionnel", "coordination", "community"]
    })),
    notifications: [
      { id: "not-1", role: "coordinateur", title: "Joal : signal critique à qualifier", href: "/app/situations/sit-glace", read: false },
      { id: "not-2", role: "partenaire", title: "Chaîne du froid : financement en instruction", href: "/app/initiatives", read: false },
      { id: "not-3", role: "capitaine", title: "Jambar II : retour attendu avant 11:30", href: "/app/operations", read: false },
      { id: "not-4", role: "institution", title: "Soumbédioune : rattachement administratif confirmé et sourcé", href: "/app/situations/sit-soumbedioune", read: false },
      { id: "not-5", role: "prestataire", title: "Djiffer : contrôle de balance terminé, relevé disponible", href: "/app/situations/sit-djiffer", read: false },
      // href corrigé vers /app/travail (Lot 2, refonte navigation par rôle,
      // CEO 2026-08-16) : /app/coordination n'est plus accessible au
      // mareyeur (nav retirée + garde serveur) — BuyerTaskView, sur
      // /app/travail, est désormais l'endroit où ce type de proposition se
      // traite réellement (accept_opportunity/complete_logistics).
      { id: "not-6", role: "mareyeur", title: "Cap Skirring : lot de sole et transport à confirmer", href: "/app/travail", read: false },
      { id: "not-lompoul-balises", role: "prestataire", title: "Lompoul-sur-Mer : note technique attendue pour le dossier balises", href: "/app/situations/sit-lompoul-balises", read: false },
      { id: "not-fass-boye-conformite", role: "institution", title: "Fass Boye : rattachement administratif en attente de réponse", href: "/app/situations/sit-fass-boye-conformite", read: false },
      { id: "not-yoff-marche", role: "mareyeur", title: "Yoff : débouché à confirmer avant dégradation", href: "/app/situations/sit-yoff-marche", read: false },
      { id: "not-foundiougne-claies", role: "prestataire", title: "Foundiougne : seconde claie encore à réparer", href: "/app/situations/sit-foundiougne-claies", read: false },
      { id: "not-elinkine-retour", role: "coordinateur", title: "Elinkine : chaîne d’alerte clôturée, équipage revenu", href: "/app/situations/sit-elinkine-retour", read: false },
      { id: "not-cap-skirring-debouche", role: "mareyeur", title: "Cap Skirring : débouché alternatif à confirmer avant échéance", href: "/app/situations/sit-cap-skirring-debouche", read: false },
      { id: "not-popenguine-vente", role: "mareyeur", title: "Popenguine : remise locale terminée dans le créneau convenu", href: "/app/situations/sit-popenguine-vente-locale", read: false },
      { id: "not-missirah-traceabilite", role: "operateur", title: "Missirah : provenance du lot complétée avant enlèvement", href: "/app/situations/sit-missirah-traceabilite", read: false },
      { id: "not-ouakam-creneau", role: "capitaine", title: "Ouakam : nouveau créneau de débarquement confirmé", href: "/app/situations/sit-ouakam-creneau-quai", read: false },
      ...generatedNotifications
    ],
    audit: []
  };
}
