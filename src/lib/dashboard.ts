import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import type { Opportunite } from "@/lib/matching";

export const misesEnRelationStorageKey = "mbambulaan:mises-en-relation";

export type DashboardData = {
  stats: {
    arrivagesPublies: number;
    volumeTotalDebarque: string;
    besoinsOuverts: number;
    opportunitesDetectees: number;
    misesEnRelationInitiees: number;
    tauxCouvertureBesoins: number;
  };
  quaisActifs: {
    quai: string;
    arrivages: number;
    volumeTotal: string;
    besoinsLies: number;
  }[];
  especesDemandees: {
    espece: string;
    volumeDisponible: string;
    volumeDemande: string;
    ecart: string;
    ecartKg: number;
  }[];
  opportunitesRecentes: {
    id: string;
    espece: string;
    quai: string;
    acteurDemandeur: string;
    statut: string;
  }[];
  insights: string[];
};

export function createDashboardData(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[], misesEnRelationInitiees = 0): DashboardData {
  const besoinsCouverts = new Set(opportunites.map((opportunite) => opportunite.besoinId)).size;
  const quaisActifs = createQuaisActifs(arrivages, besoins);
  const especesDemandees = createEspecesDemandees(arrivages, besoins);
  const opportunitesRecentes = opportunites.slice(0, 5).map((opportunite) => ({
    id: opportunite.id,
    espece: opportunite.espece,
    quai: opportunite.lieu,
    acteurDemandeur: opportunite.acheteur,
    statut: opportunite.statut
  }));

  return {
    stats: {
      arrivagesPublies: arrivages.length,
      volumeTotalDebarque: formatKg(sumQuantites(arrivages.map((arrivage) => arrivage.quantite))),
      besoinsOuverts: besoins.length,
      opportunitesDetectees: opportunites.length,
      misesEnRelationInitiees,
      tauxCouvertureBesoins: besoins.length === 0 ? 0 : Math.round((besoinsCouverts / besoins.length) * 100)
    },
    quaisActifs,
    especesDemandees,
    opportunitesRecentes,
    insights: createInsights(quaisActifs, especesDemandees, misesEnRelationInitiees)
  };
}

function createQuaisActifs(arrivages: Arrivage[], besoins: Besoin[]) {
  const grouped = new Map<string, { quai: string; arrivages: number; volumeKg: number; besoinsLies: number }>();

  arrivages.forEach((arrivage) => {
    const current = grouped.get(arrivage.quai) ?? { quai: arrivage.quai, arrivages: 0, volumeKg: 0, besoinsLies: 0 };
    current.arrivages += 1;
    current.volumeKg += parseQuantiteEnKg(arrivage.quantite);
    grouped.set(arrivage.quai, current);
  });

  besoins.forEach((besoin) => {
    const current = grouped.get(besoin.quai) ?? { quai: besoin.quai, arrivages: 0, volumeKg: 0, besoinsLies: 0 };
    current.besoinsLies += 1;
    grouped.set(besoin.quai, current);
  });

  return Array.from(grouped.values())
    .sort((first, second) => second.arrivages - first.arrivages || second.volumeKg - first.volumeKg)
    .map((item) => ({
      quai: item.quai,
      arrivages: item.arrivages,
      volumeTotal: formatKg(item.volumeKg),
      besoinsLies: item.besoinsLies
    }));
}

function createEspecesDemandees(arrivages: Arrivage[], besoins: Besoin[]) {
  const grouped = new Map<string, { espece: string; disponibleKg: number; demandeKg: number }>();

  arrivages.forEach((arrivage) => {
    const key = normalize(arrivage.espece);
    const current = grouped.get(key) ?? { espece: arrivage.espece, disponibleKg: 0, demandeKg: 0 };
    current.disponibleKg += parseQuantiteEnKg(arrivage.quantite);
    grouped.set(key, current);
  });

  besoins.forEach((besoin) => {
    const key = normalize(besoin.espece);
    const current = grouped.get(key) ?? { espece: besoin.espece, disponibleKg: 0, demandeKg: 0 };
    current.demandeKg += parseQuantiteEnKg(besoin.quantite);
    grouped.set(key, current);
  });

  return Array.from(grouped.values())
    .sort((first, second) => second.demandeKg - first.demandeKg)
    .map((item) => {
      const ecartKg = item.disponibleKg - item.demandeKg;

      return {
        espece: item.espece,
        volumeDisponible: formatKg(item.disponibleKg),
        volumeDemande: formatKg(item.demandeKg),
        ecart: `${ecartKg >= 0 ? "+" : "-"}${formatKg(Math.abs(ecartKg))}`,
        ecartKg
      };
    });
}

function createInsights(
  quaisActifs: DashboardData["quaisActifs"],
  especesDemandees: DashboardData["especesDemandees"],
  misesEnRelationInitiees: number
) {
  const deficits = especesDemandees.filter((item) => item.ecartKg < 0).map((item) => item.espece);
  const topQuais = quaisActifs.slice(0, 2).map((item) => item.quai).join(" et ");
  const demandePhrase = deficits.length > 0 ? `La demande depasse l'offre sur ${deficits.join(", ")}.` : "Les volumes disponibles couvrent les besoins mockes detectes.";
  const quaisPhrase = topQuais ? `${topQuais} concentrent l'activite la plus visible.` : "Aucun quai actif n'est encore detecte.";
  const relationPhrase =
    misesEnRelationInitiees > 0
      ? `${misesEnRelationInitiees} mise(s) en relation sont deja activees.`
      : "Aucune mise en relation n'est encore activee dans cette session.";

  return [demandePhrase, quaisPhrase, relationPhrase];
}

function sumQuantites(values: string[]) {
  return values.reduce((total, value) => total + parseQuantiteEnKg(value), 0);
}

function parseQuantiteEnKg(value: string) {
  const normalized = value.trim().toLowerCase().replace(",", ".");
  const amount = Number.parseFloat(normalized);

  if (Number.isNaN(amount)) return 0;

  return normalized.includes("t") ? amount * 1000 : amount;
}

function formatKg(value: number) {
  if (value >= 1000) {
    const tonnes = value / 1000;
    return `${Number.isInteger(tonnes) ? tonnes : tonnes.toFixed(1).replace(".", ",")} t`;
  }

  return `${Math.round(value)} kg`;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
