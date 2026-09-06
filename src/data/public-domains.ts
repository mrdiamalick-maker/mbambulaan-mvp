import type { PublicContentDomain } from "@/data/public-content";

export type PublicDomainDefinition = {
  slug: string;
  title: PublicContentDomain;
  definition: string;
  stakes: string;
  solutionHref: string;
};

export const publicDomains: PublicDomainDefinition[] = [
  { slug: "peche-ressources", title: "Pêche & ressources", definition: "Pratiques de pêche, espèces, saisonnalité et dynamiques de la ressource structurent tout ce qui vient ensuite.", stakes: "Mieux lire la ressource permet d’éviter de traiter séparément capture, qualité, revenus et durabilité.", solutionHref: "/solutions" },
  { slug: "debarquement", title: "Débarquement", definition: "Le quai concentre les premiers flux, transactions, opérations de tri et décisions qui conditionnent la suite de la chaîne.", stakes: "Organisation, information et infrastructures au débarquement influencent directement qualité, pertes et circulation des produits.", solutionHref: "/solutions" },
  { slug: "conservation-froid", title: "Conservation & froid", definition: "Glace, stockage et chaîne du froid préservent la qualité entre capture, transformation, transport et vente.", stakes: "Une capacité de froid n’est utile que si elle est correctement dimensionnée, accessible et intégrée aux usages du territoire.", solutionHref: "/solutions?intent=conservation" },
  { slug: "transformation-valorisation", title: "Transformation & valorisation", definition: "Transformation artisanale, conditionnement et valorisation prolongent la durée de vie du produit et créent de la valeur locale.", stakes: "Les contraintes d’équipement, de qualité, de débouchés et d’organisation doivent être lues ensemble.", solutionHref: "/solutions?intent=transformation" },
  { slug: "transport-logistique", title: "Transport & logistique", definition: "Collecte, manutention et acheminement relient les territoires de production aux lieux de transformation et de vente.", stakes: "Origine, destination, volume, fréquence et température déterminent la réponse logistique réellement pertinente.", solutionHref: "/solutions?intent=transport" },
  { slug: "commerce-debouches", title: "Commerce & débouchés", definition: "Mareyage, marchés et distribution déterminent où et comment la valeur produite trouve un acheteur.", stakes: "Un débouché durable dépend autant de la qualité, du volume et de la régularité que de la mise en relation commerciale.", solutionHref: "/solutions?intent=debouches" },
  { slug: "equipements-maintenance", title: "Équipements & maintenance", definition: "Moteurs, froid, matériel de transformation et équipements de sécurité doivent rester disponibles et maintenables.", stakes: "L’équipement seul ne suffit pas : disponibilité des pièces, compétences et maintenance conditionnent sa valeur dans le temps.", solutionHref: "/solutions?intent=maintenance" },
  { slug: "competences-formation", title: "Compétences & formation", definition: "Savoirs métier, sécurité, qualité et gestion renforcent la capacité des acteurs à mieux produire, décider et coopérer.", stakes: "Une formation utile part d’un besoin opérationnel précis et doit pouvoir être appliquée dans les conditions réelles du terrain.", solutionHref: "/solutions?intent=formation" },
  { slug: "financement-developpement", title: "Financement & développement", definition: "Programmes, appuis et investissements peuvent accélérer une réponse lorsqu’ils partent d’un problème correctement documenté.", stakes: "Le financement crée davantage d’impact quand bénéficiaires, territoire, résultat attendu et conditions d’exécution sont clarifiés en amont.", solutionHref: "/solutions?intent=financement" },
  { slug: "territoires-infrastructures", title: "Territoires & infrastructures", definition: "Quais, sites et équipements collectifs prennent leur sens lorsqu’ils sont reliés aux activités et aux besoins d’un territoire.", stakes: "Une lecture territoriale commune permet de mieux prioriser les interventions et de coordonner les acteurs concernés.", solutionHref: "/solutions?intent=comprendre-territoire" },
  { slug: "durabilite-environnement", title: "Durabilité & environnement", definition: "Préserver la ressource et réduire les pertes suppose de relier pratiques, équipements, information et décisions collectives.", stakes: "La durabilité devient opérationnelle lorsqu’elle peut être traduite en situations observables et en actions vérifiables.", solutionHref: "/solutions" }
];

export function findPublicDomainBySlug(slug: string) {
  return publicDomains.find((domain) => domain.slug === slug);
}

export function findPublicDomainByTitle(title: PublicContentDomain) {
  return publicDomains.find((domain) => domain.title === title);
}
