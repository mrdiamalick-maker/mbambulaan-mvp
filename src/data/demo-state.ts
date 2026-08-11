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
    ["popenguine", "Popenguine", "Thiès", 14.56, -17.11, "vigilance"],
    ["foundiougne", "Foundiougne", "Fatick", 14.13, -16.47, "stable"],
    ["missirah", "Missirah", "Fatick", 13.73, -16.50, "vigilance"],
    ["elinkine", "Elinkine", "Ziguinchor", 12.50, -16.67, "stable"]
  ] as const;

  const organizations: ProductState["organizations"] = [
    { id: "org-capitaines", name: "Collectif des capitaines de Joal", type: "organisation_professionnelle" },
    { id: "org-mareyeurs", name: "GIE des mareyeurs de la Petite-Côte", type: "organisation_professionnelle" },
    { id: "org-transform", name: "Unité de transformation Naatangué", type: "entreprise" },
    { id: "org-froid", name: "Froid Sénégal Services", type: "entreprise" },
    { id: "org-site", name: "Gestion des quais pilotes", type: "collectivite" },
    { id: "org-coordination", name: "Cellule nationale de coordination", type: "service_public" },
    { id: "org-partner", name: "Partenaire résilience littorale", type: "partenaire" },
    { id: "org-grande-cote", name: "Union professionnelle de la Grande-Côte", type: "organisation_professionnelle" },
    { id: "org-cap-vert", name: "Réseau des sites du Cap-Vert", type: "collectivite" },
    { id: "org-saloum", name: "Plateforme de valorisation du Sine-Saloum", type: "entreprise" },
    { id: "org-casamance", name: "Alliance halieutique de Casamance", type: "organisation_professionnelle" },
    { id: "org-finance", name: "Facilité bleue de cofinancement", type: "partenaire" },
    { id: "org-logistique", name: "Littoral Logistique Froid", type: "entreprise" },
    { id: "org-mb", name: "Mbàmbulaan Ops", type: "entreprise" }
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
    actor("act-partenaire", "Sophie Martin", "partenaire", "org-partner", territoryRows.map(([id]) => id))
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
      status: index === 2 ? "fragile" : "operationnelle",
      theoreticalCapacity: 8,
      availableCapacity: index === 2 ? 2 : 5,
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
    { id: "trip-kayar", vesselId: "vessel-ndiambour", captainId: "act-capitaine-kayar", departureAt: "2026-07-29T01:20:00.000Z", expectedReturnAt: "2026-07-29T10:40:00.000Z", announcedReturnAt: "2026-07-29T10:15:00.000Z", status: "retour_annonce", zone: "Grande-Côte Sud", crewCount: 8, source: "Message WhatsApp Business structuré" },
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
    { id: "vessel-goree", name: "Gorée", registration: "DEMO-SN-SOUMB-031", ownerId: "act-gestionnaire", captainId: "act-capitaine-dakar", homeSiteId: "quai-soumbedioune", type: "pirogue_artisanale", trust: "declaree" },
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
    { id: "landing-kayar", tripId: "trip-kayar", siteId: "quai-kayar", status: "attendu", catches: [{ id: "catch-k1", speciesId: "sp-thiof", quantityKg: 140, quality: "A", productForm: "entier_frais" }, { id: "catch-k2", speciesId: "sp-maquereau", quantityKg: 780, quality: "B", productForm: "entier_frais" }], totalWeightKg: 920, weighingSource: "Quantités annoncées, pesée attendue", trust: "declaree" },
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
    const actorId = index < 6 ? "act-mareyeur-nord" : index < 13 ? "act-mareyeur" : "act-mareyeur-sud";
    return [
      { id: `need-${territoryId}-achat`, reference: `MBA-SR-${territoryId.toUpperCase()}-ACHAT`, channel: "web" as const, actorId, territoryId, speciesId: primarySpeciesId, quantityKg: 320 + ((index * 73) % 540), quality: "A" as const, intent: "achat" as const, status: "ouvert" as const, priority: index % 4 === 0 ? ("haute" as const) : ("moyenne" as const), createdAt: now, source: "Besoin consolidé par le relais territorial" },
      { id: `need-${territoryId}-valorisation`, reference: `MBA-SR-${territoryId.toUpperCase()}-VALORISATION`, channel: index % 2 === 0 ? ("terrain" as const) : ("telephone" as const), actorId: `act-relais-${territoryId}`, territoryId, speciesId: secondarySpeciesId, quantityKg: 180 + ((index * 41) % 360), quality: index % 3 === 0 ? ("B" as const) : ("A" as const), intent: index % 2 === 0 ? ("transformation" as const) : ("transport" as const), status: index % 5 === 0 ? ("couvert" as const) : ("ouvert" as const), priority: "moyenne" as const, createdAt: now, source: index % 2 === 0 ? "Formulaire terrain qualifié" : "Appel téléphonique qualifié" }
    ];
  });

  serviceRequests.push(...generatedServiceRequests);

  const opportunities: ProductState["opportunities"] = [
    { id: "opp-mbour", lotId: "lot-mbour-sardinelle", serviceRequestId: "need-sardinelle", territoryId: "mbour", score: 91, reasons: ["Espèce identique", "Quantité suffisante", "Même territoire", "Qualité compatible"], status: "proposee", humanValidationRequired: true },
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

  const situations = [
    situation("sit-glace", "joal", "Machine à glace indisponible au quai de Joal", "recue", "declaree", "Qualifier le signal avec le poste de quai", "critique"),
    situation("sit-mbour", "mbour", "Capacité froide sous tension après deux débarquements", "qualification", "declaree", "Confirmer la priorité territoriale"),
    situation("sit-kayar", "kayar", "Thiof rare et besoin mareyeur non couvert", "priorisee", "verifiee", "Rechercher une substitution et alerter le territoire"),
    situation("sit-hann", "hann", "Maintenance préventive de la chambre froide", "coordination", "verifiee", "Démarrer l’intervention planifiée", "moyenne"),
    situation("sit-saint-louis", "saint-louis", "Retour de pirogue retardé de 90 minutes", "attente", "verifiee", "Confirmer le contact avec le poste de sécurité"),
    situation("sit-soumbedioune", "soumbedioune", "Immatriculation déclarée à vérifier avant rattachement", "qualification", "declaree", "Comparer la pièce présentée au référentiel", "moyenne"),
    situation("sit-rufisque", "rufisque", "Capacité de transport froid insuffisante pour le prochain enlèvement", "priorisee", "observee", "Confirmer un véhicule alternatif avant 12 h", "haute"),
    situation("sit-djiffer", "djiffer", "Balance de quai à recalibrer avant la prochaine pesée", "intervention", "verifiee", "Enregistrer le contrôle métrologique", "haute"),
    situation("sit-kafountine", "kafountine", "Transport groupé vers le marché régional", "reglee", "consolidee", "Partager l’apprentissage dans Community", "faible"),
    situation("sit-cap-skirring", "cap-skirring", "Chambre froide à 35 % de capacité disponible", "coordination", "observee", "Arbitrer les lots prioritaires et réserver un délestage", "haute")
  ];

  const situationTemplates = [
    ["Fenêtre de débarquement à consolider", "Confirmer l’heure de retour avec le capitaine et le quai"],
    ["Capacité froide à confirmer avant la pointe", "Réserver une capacité ou documenter un délestage"],
    ["Immatriculations en attente de rapprochement", "Qualifier les dossiers avec leur source"],
    ["Besoin de transport groupé à organiser", "Confirmer le volume, l’itinéraire et le responsable"],
    ["Relais sécurité à confirmer", "Tester la chaîne d’appel et consigner le résultat"]
  ] as const;
  const situationStatuses: SituationStatus[] = ["qualification", "priorisee", "coordination", "intervention", "attente", "resultat"];
  const generatedSituations = territoryRows.map(([territoryId, territoryName], index) => {
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

  const generatedCoordinationSpaces: ProductState["coordinationSpaces"] = generatedSituations.map((item, index) => ({
    id: `coord-${item.territoryId}-veille`,
    situationId: item.id,
    title: `Cellule opérationnelle · ${territoryRows[index][1]}`,
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
    situationIds: program.territoryIds.map((territoryId) => `sit-${territoryId}-veille`),
    objective: program.objective,
    status: program.status,
    ownerId: index === 1 ? "act-institution" : "act-coordinateur",
    budgetFcfa: program.budget,
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
    convertedObjectId: index % 3 === 0 ? `sit-${territoryId}-veille` : undefined,
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
      href: `/app/situations/sit-${territoryId}-veille`,
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
    // distinct du trust de la situation ("verifiee") une fois vérifiée.
    // Condition Lot 3 (référentiel D9, intake omnicanal) : au moins un
    // signal du scénario canonique reçu par téléphone/WhatsApp, visible
    // avec son origine et son niveau de confiance propre.
    signals: situations.map((item) => ({
      id: `obs-${item.id}`,
      territoryId: item.territoryId,
      actorId: "act-operateur",
      createdAt: now,
      channel: item.id === "sit-glace" ? "poste_quai" : item.id === "sit-saint-louis" ? "telephone" : "terrain",
      category: item.id === "sit-glace" ? "infrastructure" : item.id === "sit-saint-louis" ? "securite" : "production",
      title: item.title,
      description: item.description,
      trust: item.id === "sit-saint-louis" ? "declaree" : item.trust,
      source: item.id === "sit-glace" ? "Poste de quai de Joal" : item.id === "sit-saint-louis" ? "Appel d’un proche habilité" : "Relais territorial"
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
        id: "coord-rufisque",
        situationId: "sit-rufisque",
        title: "Continuité du transport froid à Rufisque-Bargny",
        participantIds: ["act-mareyeur", "act-prestataire", "act-coordinateur"],
        objective: "Trouver une capacité alternative avant la fin de la fenêtre de conservation",
        decision: "Comparer deux véhicules référencés et confirmer les conditions d’activation",
        commitments: [{ id: "eng-rufisque-1", actorId: "act-prestataire", label: "Confirmer une capacité de 2 tonnes", dueAt: "2026-07-29T12:00:00.000Z", status: "a_faire" }],
        risks: ["Capacité déclarée déjà engagée", "Délai d’arrivée du véhicule"],
        nextReviewAt: "2026-07-29T11:30:00.000Z"
      },
      {
        id: "coord-djiffer",
        situationId: "sit-djiffer",
        title: "Fiabilisation de la pesée à Djiffer",
        participantIds: ["act-operateur", "act-prestataire", "act-coordinateur"],
        objective: "Rétablir une pesée fiable avant le prochain débarquement attendu",
        decision: "Effectuer un contrôle avec masse étalon puis consigner le résultat",
        commitments: [{ id: "eng-djiffer-1", actorId: "act-prestataire", label: "Réaliser le recalibrage", dueAt: "2026-07-29T11:45:00.000Z", status: "en_cours" }],
        risks: ["Débarquement avant fin du contrôle"],
        nextReviewAt: "2026-07-29T11:30:00.000Z"
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
      }
    ],
    priceObservations: [
      { id: "price-thiof-kayar", speciesId: "sp-thiof", territoryId: "kayar", marketName: "Marché de Kayar", priceFcfaKg: 3900, observedAt: now, source: "Relevé déclaratif mareyeur", trust: "declaree", trend: "hausse", flagged: false },
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
      { id: "scar-thiof-kayar", speciesId: "sp-thiof", territoryId: "kayar", status: "rare", availableKg: 140, requestedKg: 600, reasons: ["Besoin quatre fois supérieur au volume observé", "Deux retours sans thiof", "Prix en hausse"], trust: "verifiee" },
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
      { id: "sust-soumb-sard", lotId: "lot-soumb-sardinelle", provenanceComplete: false, practice: "Méthode à confirmer", zone: "Cap-Vert Ouest", status: "incomplet", reasons: ["Méthode de pêche manquante", "Immatriculation déclarée non vérifiée"], recommendation: "Qualifier l’actif et la méthode avant diffusion partenaire", trust: "declaree" },
      { id: "sust-kaf-sard", lotId: "lot-kaf-sardinelle", provenanceComplete: true, practice: "Filet tournant déclaré", zone: "Casamance Nord", status: "vigilance", reasons: ["Traçabilité complète à 86 %", "Transport groupé documenté"], recommendation: "Confirmer la température à la livraison", trust: "verifiee" },
      { id: "sust-cap-sole", lotId: "lot-cap-sole", provenanceComplete: true, practice: "Filet maillant déclaré", zone: "Casamance Sud", status: "favorable", reasons: ["Zone et pirogue vérifiées", "Qualité A"], recommendation: "Maintenir la continuité froide pendant le transport", trust: "verifiee" },
      ...generatedSustainability
    ],
    communityPosts: [
      { id: "post-glace", authorId: "act-operateur", territoryId: "joal", community: "Infrastructures et services", category: "alerte", title: "Machine à glace arrêtée à Joal", body: "Le poste de quai confirme l’indisponibilité depuis 08:10.", createdAt: now, status: "transforme", convertedObjectId: "sit-glace", comments: [{ id: "comment-1", authorId: "act-prestataire", body: "Technicien mobilisable avant midi." }] },
      { id: "post-sard", authorId: "act-mareyeur", territoryId: "mbour", community: "Opportunités territoriales", category: "opportunite", title: "Sardinelle disponible à Mbour", body: "Lot vérifié de qualité B, orientation rapide souhaitée.", createdAt: now, status: "publie", comments: [] },
      { id: "post-learning", authorId: "act-coordinateur", territoryId: "kafountine", community: "Bonnes pratiques", category: "apprentissage", title: "Préparer les itinéraires de délestage", body: "L’accord préalable entre quai et transporteurs réduit le délai d’orientation.", createdAt: now, status: "publie", comments: [] },
      { id: "post-securite", authorId: "act-operateur", territoryId: "saint-louis", community: "Sécurité des sorties", category: "information", title: "Procédure commune pour un retour retardé", body: "Le poste de quai partage un point de contact unique afin d’éviter les messages contradictoires.", createdAt: now, status: "transforme", convertedObjectId: "sit-saint-louis", comments: [] },
      { id: "post-balance", authorId: "act-prestataire", territoryId: "djiffer", community: "Qualité et pesée", category: "capacite", title: "Contrôle de balance en cours à Djiffer", body: "Une masse étalon est mobilisée avant le prochain débarquement attendu.", createdAt: now, status: "transforme", convertedObjectId: "sit-djiffer", comments: [] },
      { id: "post-immatriculation", authorId: "act-gestionnaire", territoryId: "soumbedioune", community: "Actifs et conformité", category: "question", title: "Comment vérifier une immatriculation déclarée ?", body: "Le document présenté doit être rapproché du référentiel avant rattachement au profil de la pirogue.", createdAt: now, status: "publie", comments: [{ id: "comment-imm-1", authorId: "act-institution", body: "Conserver la source et le statut non vérifié jusqu’au contrôle." }] },
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
      { id: "service-saloum", organizationId: "org-saloum", name: "Regroupement et transformation estuarienne", category: "logistique", territoryIds: ["foundiougne", "djiffer", "missirah"], status: "reference", trust: "observee", activationConditions: "Fenêtre de collecte et volumes confirmés par les relais" }
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
        funding: [{ id: "fund-1", partnerId: "act-partenaire", amountFcfa: 80000000, status: "en_instruction", condition: "Plan de maintenance et cofinancement territorial" }],
        indicators: [
          { label: "Lots orientés vers une capacité froide", baseline: 34, target: 85, current: 58, unit: "%" },
          { label: "Temps moyen de remise en service", baseline: 72, target: 24, current: 41, unit: "h" }
        ]
      },
      {
        id: "init-securite",
        title: "Dispositif territorial de suivi des retours et alertes",
        territoryIds: ["saint-louis", "kayar", "djiffer"],
        situationIds: ["sit-saint-louis", "sit-djiffer"],
        objective: "Réduire les délais de qualification et fiabiliser la chaîne d’alerte entre capitaines, quais et responsables territoriaux",
        status: "cadrage",
        ownerId: "act-coordinateur",
        budgetFcfa: 95000000,
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
        funding: [{ id: "fund-imm-1", partnerId: "act-partenaire", amountFcfa: 25000000, status: "confirme", condition: "Audit des droits d’accès et conservation des sources" }],
        indicators: [
          { label: "Pirogues avec immatriculation vérifiée", baseline: 18, target: 75, current: 43, unit: "%" },
          { label: "Dossiers incomplets requalifiés", baseline: 0, target: 120, current: 36, unit: "dossiers" }
        ]
      },
      ...generatedInitiatives
    ],
    learnings: [
      { id: "learn-1", situationId: "sit-kafountine", title: "Activer un itinéraire de délestage avant saturation", summary: "Un accord préalable entre quai, transporteurs et chambre froide réduit le temps d’orientation des lots.", reusableIn: ["joal", "mbour", "kayar"] },
      { id: "learn-2", situationId: "sit-soumbedioune", title: "Conserver le statut déclaré jusqu’à la vérification de l’actif", summary: "Une immatriculation saisie peut être utilisée pour le suivi sans être présentée comme vérifiée ; la source et la pièce restent liées au dossier.", reusableIn: ["hann", "rufisque", "saint-louis"] },
      { id: "learn-3", situationId: "sit-djiffer", title: "Planifier le contrôle de pesée avant la fenêtre de débarquement", summary: "La disponibilité d’une masse étalon et d’un prestataire réduit le risque de retarder toute la chaîne de lots.", reusableIn: ["joal", "mbour", "kafountine"] }
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
      { id: "not-4", role: "institution", title: "Référentiel pirogues : dossier à vérifier à Soumbédioune", href: "/app/situations/sit-soumbedioune", read: false },
      { id: "not-5", role: "prestataire", title: "Djiffer : contrôle de balance attendu avant 11:45", href: "/app/situations/sit-djiffer", read: false },
      { id: "not-6", role: "mareyeur", title: "Cap Skirring : lot de sole et transport à confirmer", href: "/app/coordination", read: false },
      ...generatedNotifications
    ],
    audit: []
  };
}
