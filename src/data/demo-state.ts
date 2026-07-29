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
  return {
    id,
    reference: `MBA-SIT-${id.slice(-4).toUpperCase()}`,
    observationIds: [`obs-${id}`],
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
    result: ["resultat", "reglee"].includes(status) ? "Production de glace rétablie à 80 % de capacité" : undefined,
    confirmation: ["resultat", "reglee"].includes(status) ? "Constat terrain signé et photo horodatée" : undefined,
    coordinationId: ["coordination", "intervention", "attente", "resultat", "reglee"].includes(status) ? "coord-froid" : undefined,
    initiativeId: "init-froid",
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
    ["kafountine", "Kafountine", "Ziguinchor", 12.93, -16.75, "stable"]
  ] as const;

  const organizations: ProductState["organizations"] = [
    { id: "org-capitaines", name: "Collectif des capitaines de Joal", type: "organisation_professionnelle" },
    { id: "org-mareyeurs", name: "GIE des mareyeurs de la Petite-Côte", type: "organisation_professionnelle" },
    { id: "org-transform", name: "Unité de transformation Naatangué", type: "entreprise" },
    { id: "org-froid", name: "Froid Sénégal Services", type: "entreprise" },
    { id: "org-site", name: "Gestion des quais pilotes", type: "collectivite" },
    { id: "org-coordination", name: "Cellule nationale de coordination", type: "service_public" },
    { id: "org-partner", name: "Partenaire résilience littorale", type: "partenaire" },
    { id: "org-mb", name: "Mbàmbulaan Ops", type: "entreprise" }
  ];

  const actors: ProductState["actors"] = [
    actor("act-admin", "Ndeye Mbaye", "administrateur", "org-mb", territoryRows.map(([id]) => id)),
    actor("act-operateur", "Awa Diouf", "operateur", "org-site", territoryRows.map(([id]) => id)),
    actor("act-capitaine", "Ousmane Diop", "capitaine", "org-capitaines", ["joal"]),
    actor("act-mareyeur", "Mariama Sène", "mareyeur", "org-mareyeurs", ["joal", "mbour"]),
    actor("act-transform", "Rokhaya Fall", "transformateur", "org-transform", ["mbour", "hann"]),
    actor("act-prestataire", "Ibrahima Sarr", "prestataire", "org-froid", ["joal", "mbour", "kayar"]),
    actor("act-gestionnaire", "Cheikh Bâ", "gestionnaire_organisation", "org-capitaines", ["joal", "mbour"]),
    actor("act-coordinateur", "Mamadou Fall", "coordinateur", "org-coordination", territoryRows.map(([id]) => id)),
    actor("act-institution", "Fatou Ndiaye", "institution", "org-coordination", territoryRows.map(([id]) => id)),
    actor("act-partenaire", "Sophie Martin", "partenaire", "org-partner", territoryRows.map(([id]) => id))
  ];

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
    { id: "sp-sole", name: "Sole", family: "Soleidés", seasonality: "Disponibilité limitée", sensitivity: "surveillance", indicativePriceFcfaKg: 2800 }
  ];

  const trips: ProductState["trips"] = [
    { id: "trip-joal", vesselId: "vessel-jambar", captainId: "act-capitaine", departureAt: "2026-07-29T02:10:00.000Z", expectedReturnAt: "2026-07-29T11:30:00.000Z", status: "en_mer", zone: "Petite-Côte Ouest", crewCount: 9, source: "Déclaration du capitaine" },
    { id: "trip-mbour", vesselId: "vessel-teranga", captainId: "act-capitaine", departureAt: "2026-07-28T23:40:00.000Z", expectedReturnAt: "2026-07-29T08:00:00.000Z", announcedReturnAt: "2026-07-29T07:20:00.000Z", arrivedAt: "2026-07-29T08:05:00.000Z", status: "debarquee", zone: "Petite-Côte Sud", crewCount: 11, source: "Poste de quai" }
  ];

  const vessels: ProductState["vessels"] = [
    { id: "vessel-jambar", name: "Jambar II", registration: "DEMO-SN-JOAL-017", ownerId: "act-gestionnaire", captainId: "act-capitaine", homeSiteId: "quai-joal", type: "pirogue_artisanale", trust: "verifiee" },
    { id: "vessel-teranga", name: "Teranga", registration: "DEMO-SN-MBOUR-042", ownerId: "act-gestionnaire", captainId: "act-capitaine", homeSiteId: "quai-mbour", type: "pirogue_artisanale", trust: "observee" }
  ];

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
    }
  ];

  const lots: ProductState["lots"] = [
    { id: "lot-mbour-sardinelle", landingId: "landing-mbour", speciesId: "sp-sardinelle", siteId: "quai-mbour", quantityKg: 2100, availableKg: 1400, quality: "B", productForm: "entier_frais", conservation: "glace", status: "disponible", trust: "verifiee", traceabilityCompleteness: 88 },
    { id: "lot-mbour-sole", landingId: "landing-mbour", speciesId: "sp-sole", siteId: "quai-mbour", quantityKg: 240, availableKg: 240, quality: "A", productForm: "entier_frais", conservation: "froid", status: "disponible", trust: "verifiee", traceabilityCompleteness: 92 }
  ];

  const needs: ProductState["needs"] = [
    { id: "need-sardinelle", actorId: "act-transform", territoryId: "mbour", speciesId: "sp-sardinelle", quantityKg: 900, quality: "B", purpose: "transformation", status: "ouvert", priority: "haute", createdAt: now, source: "Déclaration de l’unité de transformation" },
    { id: "need-thiof", actorId: "act-mareyeur", territoryId: "kayar", speciesId: "sp-thiof", quantityKg: 600, quality: "A", purpose: "achat", status: "ouvert", priority: "critique", createdAt: now, source: "Besoin professionnel déclaré" }
  ];

  const opportunities: ProductState["opportunities"] = [
    { id: "opp-mbour", lotId: "lot-mbour-sardinelle", needId: "need-sardinelle", territoryId: "mbour", score: 91, reasons: ["Espèce identique", "Quantité suffisante", "Même territoire", "Qualité compatible"], status: "proposee", humanValidationRequired: true }
  ];

  const situations = [
    situation("sit-glace", "joal", "Machine à glace indisponible au quai de Joal", "recue", "declaree", "Qualifier le signal avec le poste de quai", "critique"),
    situation("sit-mbour", "mbour", "Capacité froide sous tension après deux débarquements", "qualification", "declaree", "Confirmer la priorité territoriale"),
    situation("sit-kayar", "kayar", "Thiof rare et besoin mareyeur non couvert", "priorisee", "verifiee", "Rechercher une substitution et alerter le territoire"),
    situation("sit-hann", "hann", "Maintenance préventive de la chambre froide", "coordination", "verifiee", "Démarrer l’intervention planifiée", "moyenne"),
    situation("sit-saint-louis", "saint-louis", "Retour de pirogue retardé de 90 minutes", "attente", "verifiee", "Confirmer le contact avec le poste de sécurité"),
    situation("sit-kafountine", "kafountine", "Transport groupé vers le marché régional", "reglee", "consolidee", "Partager l’apprentissage dans Community", "faible")
  ];

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
    needs,
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
    observations: situations.map((item) => ({
      id: `obs-${item.id}`,
      territoryId: item.territoryId,
      actorId: "act-operateur",
      createdAt: now,
      channel: item.id === "sit-glace" ? "poste_quai" : "terrain",
      category: item.id === "sit-glace" ? "infrastructure" : item.id === "sit-saint-louis" ? "securite" : "production",
      title: item.title,
      description: item.description,
      trust: item.trust,
      source: item.id === "sit-glace" ? "Poste de quai de Joal" : "Relais territorial"
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
      }
    ],
    priceObservations: [
      { id: "price-thiof-kayar", speciesId: "sp-thiof", territoryId: "kayar", marketName: "Marché de Kayar", priceFcfaKg: 3900, observedAt: now, source: "Relevé déclaratif mareyeur", trust: "declaree", trend: "hausse", flagged: false },
      { id: "price-thiof-joal", speciesId: "sp-thiof", territoryId: "joal", marketName: "Marché de Joal", priceFcfaKg: 3400, observedAt: now, source: "Relais marché", trust: "observee", trend: "hausse", flagged: false },
      { id: "price-sard-mbour", speciesId: "sp-sardinelle", territoryId: "mbour", marketName: "Marché de Mbour", priceFcfaKg: 900, observedAt: now, source: "Relevé de marché", trust: "verifiee", trend: "baisse", flagged: false },
      { id: "price-sole-hann", speciesId: "sp-sole", territoryId: "hann", marketName: "Marché de Hann", priceFcfaKg: 2950, observedAt: now, source: "Déclaration acheteur", trust: "declaree", trend: "stable", flagged: false }
    ],
    scarcity: [
      { id: "scar-thiof-kayar", speciesId: "sp-thiof", territoryId: "kayar", status: "rare", availableKg: 140, requestedKg: 600, reasons: ["Besoin quatre fois supérieur au volume observé", "Deux retours sans thiof", "Prix en hausse"], trust: "verifiee" },
      { id: "scar-sard-mbour", speciesId: "sp-sardinelle", territoryId: "mbour", status: "abondant", availableKg: 2100, requestedKg: 900, reasons: ["Débarquement supérieur au besoin ouvert", "Capacité froide limitée"], trust: "verifiee" },
      { id: "scar-sole-hann", speciesId: "sp-sole", territoryId: "hann", status: "sous_tension", availableKg: 240, requestedKg: 360, reasons: ["Disponibilité inférieure à la demande récente"], trust: "observee" }
    ],
    sustainability: [
      { id: "sust-mbour-sard", lotId: "lot-mbour-sardinelle", provenanceComplete: true, practice: "Filet tournant déclaré", zone: "Petite-Côte Sud", status: "vigilance", reasons: ["Traçabilité complète à 88 %", "Espèce sous surveillance locale"], recommendation: "Conserver la zone et la méthode dans la trace jusqu’à destination", trust: "verifiee" },
      { id: "sust-mbour-sole", lotId: "lot-mbour-sole", provenanceComplete: true, practice: "Filet maillant déclaré", zone: "Petite-Côte Sud", status: "favorable", reasons: ["Provenance renseignée", "Qualité A", "Chaîne froide documentée"], recommendation: "Maintenir les relevés de conservation", trust: "verifiee" }
    ],
    communityPosts: [
      { id: "post-glace", authorId: "act-operateur", territoryId: "joal", community: "Infrastructures et services", category: "alerte", title: "Machine à glace arrêtée à Joal", body: "Le poste de quai confirme l’indisponibilité depuis 08:10.", createdAt: now, status: "transforme", convertedObjectId: "sit-glace", comments: [{ id: "comment-1", authorId: "act-prestataire", body: "Technicien mobilisable avant midi." }] },
      { id: "post-sard", authorId: "act-mareyeur", territoryId: "mbour", community: "Opportunités territoriales", category: "opportunite", title: "Sardinelle disponible à Mbour", body: "Lot vérifié de qualité B, orientation rapide souhaitée.", createdAt: now, status: "publie", comments: [] },
      { id: "post-learning", authorId: "act-coordinateur", territoryId: "kafountine", community: "Bonnes pratiques", category: "apprentissage", title: "Préparer les itinéraires de délestage", body: "L’accord préalable entre quai et transporteurs réduit le délai d’orientation.", createdAt: now, status: "publie", comments: [] }
    ],
    partnerServices: [
      { id: "service-froid", organizationId: "org-froid", name: "Maintenance et production de glace", category: "froid", territoryIds: ["joal", "mbour", "kayar"], status: "qualifie", trust: "verifiee", activationConditions: "Diagnostic validé et bon d’intervention" },
      { id: "service-logistique", organizationId: "org-mareyeurs", name: "Transport froid groupé", category: "logistique", territoryIds: ["joal", "mbour", "hann"], status: "reference", trust: "declaree", activationConditions: "Volume minimal de 500 kg" },
      { id: "service-finance", organizationId: "org-partner", name: "Appui aux infrastructures territoriales", category: "financement", territoryIds: ["joal", "mbour", "kayar"], status: "a_activer", trust: "observee", activationConditions: "Dossier d’investissement et cofinancement documentés" }
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
      }
    ],
    learnings: [
      { id: "learn-1", situationId: "sit-kafountine", title: "Activer un itinéraire de délestage avant saturation", summary: "Un accord préalable entre quai, transporteurs et chambre froide réduit le temps d’orientation des lots.", reusableIn: ["joal", "mbour", "kayar"] }
    ],
    reports: [
      {
        id: "report-national",
        title: "Situation halieutique de démonstration",
        territoryIds: territoryRows.map(([id]) => id),
        generatedAt: now,
        period: "29 juillet 2026",
        status: "pret",
        metrics: [
          { label: "Volume débarqué observé", value: "2,34 t", source: "Pesée du quai de Mbour", trust: "verifiee", limit: "Un débarquement confirmé dans le jeu de démonstration" },
          { label: "Volume orientable", value: "1,64 t", source: "Lots disponibles", trust: "verifiee", limit: "Disponibilité instantanée simulée" },
          { label: "Valeur potentiellement préservée", value: "1,3 M FCFA", source: "Volume × prix indicatif", trust: "observee", limit: "Estimation, non transaction réalisée" }
        ]
      }
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
      { id: "not-3", role: "capitaine", title: "Jambar II : retour attendu avant 11:30", href: "/app/operations", read: false }
    ],
    audit: []
  };
}
