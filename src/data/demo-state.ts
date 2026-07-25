import type { ProductState, Situation, SituationStatus, TrustLevel } from "@/domain/types";

const now = "2026-06-26T08:30:00.000Z";
const actor = (id: string, name: string, role: ProductState["actors"][number]["role"], organizationId: string, territoryIds: string[]) => ({
  id,
  name,
  role,
  organizationId,
  territoryIds,
  phone: "+221 77 000 00 00"
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
    reference: `MBA-SIT-${id.slice(-3).toUpperCase()}`,
    observationIds: [`obs-${id}`],
    territoryId,
    title,
    description: title,
    status,
    priority,
    trust,
    visibility: "partenaires",
    responsibleId: ["coordination", "intervention", "attente"].includes(status) ? "act-coordinateur" : undefined,
    dueAt: ["coordination", "intervention", "attente"].includes(status) ? "2026-06-27T16:00:00.000Z" : undefined,
    waitingReason: status === "attente" ? "Pièce de rechange en acheminement depuis Dakar" : undefined,
    nextStep,
    result: status === "resultat" || status === "reglee" ? "Production de glace rétablie à 80 % de capacité" : undefined,
    confirmation: status === "resultat" || status === "reglee" ? "Constat terrain signé et photo horodatée" : undefined,
    coordinationId: ["coordination", "intervention", "attente", "resultat", "reglee"].includes(status) ? "coord-froid" : undefined,
    initiativeId: "init-froid",
    history: [{ id: `hist-${id}`, at: now, actor: "act-terrain", label: "Signal reçu", detail: title }]
  };
}

export function createDemoState(): ProductState {
  const territories = [
    ["joal", "Joal-Fadiouth", "Fatick", 14.17, -16.83, "critique"],
    ["mbour", "Mbour", "Thiès", 14.42, -16.97, "vigilance"],
    ["kayar", "Kayar", "Thiès", 14.92, -17.12, "vigilance"],
    ["saint-louis", "Saint-Louis", "Saint-Louis", 16.03, -16.49, "stable"],
    ["hann", "Hann", "Dakar", 14.71, -17.43, "vigilance"],
    ["kafountine", "Kafountine", "Ziguinchor", 12.93, -16.75, "stable"]
  ] as const;

  const situations = [
    situation("sit-glace", "joal", "Machine à glace indisponible au quai de Joal", "recue", "declaree", "Qualifier le signal avec le poste de quai", "critique"),
    situation("sit-mbour", "mbour", "Capacité froide sous tension après deux débarquements", "qualification", "declaree", "Confirmer la priorité territoriale"),
    situation("sit-kayar", "kayar", "Lot de sardinelle à orienter vers un débouché", "priorisee", "verifiee", "Mobiliser transformateur et mareyeurs"),
    situation("sit-hann", "hann", "Maintenance préventive de la chambre froide", "coordination", "verifiee", "Démarrer l'intervention planifiée", "moyenne"),
    situation("sit-saint-louis", "saint-louis", "Accès au carburant perturbé", "attente", "verifiee", "Lever le blocage et reprendre l'intervention"),
    situation("sit-kafountine", "kafountine", "Organisation du transport vers le marché régional", "reglee", "consolidee", "Partager l'apprentissage avec les autres quais", "faible")
  ];

  return {
    revision: 1,
    tenant: { id: "tenant-demo", name: "Démonstration nationale Mbàmbulaan", mode: "demonstration" },
    organizations: [
      { id: "org-terrain", name: "Postes de quai pilotes", type: "organisation_professionnelle" },
      { id: "org-coordination", name: "Cellule nationale de coordination", type: "service_public" },
      { id: "org-tech", name: "Froid Sénégal Services", type: "entreprise" },
      { id: "org-funder", name: "Partenaire chaîne du froid", type: "partenaire" }
    ],
    actors: [
      actor("act-terrain", "Awa Diouf", "agent_terrain", "org-terrain", territories.map(([id]) => id)),
      actor("act-coordinateur", "Mamadou Fall", "coordinateur", "org-coordination", territories.map(([id]) => id)),
      actor("act-tech", "Ibrahima Sarr", "responsable_initiative", "org-tech", ["joal", "mbour"]),
      actor("act-decision", "Fatou Ndiaye", "decideur", "org-coordination", territories.map(([id]) => id)),
      actor("act-partner", "Sophie Martin", "partenaire", "org-funder", territories.map(([id]) => id))
    ],
    territories: territories.map(([id, name, region, latitude, longitude, activity]) => ({
      id,
      name,
      region,
      latitude,
      longitude,
      activity,
      infrastructureIds: [`quai-${id}`, `froid-${id}`]
    })),
    infrastructures: territories.flatMap(([id, name], index) => [
      { id: `quai-${id}`, territoryId: id, name: `Quai de ${name}`, type: "quai" as const, status: "operationnelle" as const },
      {
        id: `froid-${id}`,
        territoryId: id,
        name: `Infrastructure froide de ${name}`,
        type: index === 0 ? ("fabrique_glace" as const) : ("chambre_froide" as const),
        status: index === 0 ? ("indisponible" as const) : index < 3 ? ("fragile" as const) : ("operationnelle" as const)
      }
    ]),
    observations: situations.map((item) => ({
      id: `obs-${item.id}`,
      territoryId: item.territoryId,
      actorId: "act-terrain",
      createdAt: now,
      channel: item.id === "sit-glace" ? ("poste_quai" as const) : ("terrain" as const),
      category: item.id === "sit-glace" ? ("infrastructure" as const) : ("production" as const),
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
        participantIds: ["act-coordinateur", "act-tech", "act-decision", "act-partner"],
        objective: "Réduire les pertes post-capture pendant les indisponibilités froides",
        decision: "Prioriser la remise en service à Joal et organiser un itinéraire de délestage vers Mbour",
        commitments: [
          { id: "eng-1", actorId: "act-tech", label: "Diagnostiquer et réparer la machine", dueAt: "2026-06-27T16:00:00.000Z", status: "a_faire" },
          { id: "eng-2", actorId: "act-coordinateur", label: "Organiser le délestage temporaire", dueAt: "2026-06-26T14:00:00.000Z", status: "en_cours" }
        ],
        risks: ["Retard de la pièce de rechange", "Saturation temporaire à Mbour"],
        nextReviewAt: "2026-06-27T09:00:00.000Z"
      }
    ],
    initiatives: [
      {
        id: "init-froid",
        title: "Programme territorial de résilience de la chaîne du froid",
        territoryIds: ["joal", "mbour", "kayar"],
        situationIds: ["sit-glace", "sit-mbour", "sit-kayar"],
        objective: "Sécuriser la conservation et valoriser les débarquements de la Petite-Côte",
        status: "cadrage",
        ownerId: "act-tech",
        budgetFcfa: 185000000,
        funding: [
          { id: "fund-1", partnerId: "act-partner", amountFcfa: 80000000, status: "en_instruction", condition: "Plan de maintenance et cofinancement territorial" }
        ],
        indicators: [
          { label: "Lots orientés vers une capacité froide", baseline: 34, target: 85, current: 58, unit: "%" },
          { label: "Temps moyen de remise en service", baseline: 72, target: 24, current: 41, unit: "h" }
        ]
      }
    ],
    learnings: [
      {
        id: "learn-1",
        situationId: "sit-kafountine",
        title: "Activer un itinéraire de délestage avant saturation",
        summary: "Un accord préalable entre quai, transporteurs et chambre froide réduit le temps d'orientation des lots.",
        reusableIn: ["joal", "mbour", "kayar"]
      }
    ],
    notifications: [
      { id: "not-1", role: "coordinateur", title: "Joal : signal critique à qualifier", href: "/app/situations/sit-glace", read: false },
      { id: "not-2", role: "partenaire", title: "Dossier froid : financement en instruction", href: "/app/initiatives", read: false }
    ],
    audit: []
  };
}
