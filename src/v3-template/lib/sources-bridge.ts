// Pont Sources connectées ↔ domaine réel (G2.2, mandat "Simplification
// des vues"). Le domaine ne porte aucun type canonique "source de
// données / connecteur" (aucun DataSource/Connector dans domain/types.ts) :
// les 6 intégrations système (data/flux.ts, SOURCES) restent donc la seule
// source honnête de "statut de connexion" à l'échelle nationale — texte
// déjà prudent, jamais une donnée fabriquée pour ressembler à un KPI.
//
// Quand un filtre territorial est actif (state.territoryFilterId), cet
// écran complète ces 6 intégrations système par la provenance réelle,
// territoire par territoire : les Signal réels de ce territoire
// (territoryId, source, reportedBy, trust, createdAt) — la même doctrine
// de confiance/provenance que la section "Sources et confiance" de la
// fiche territoire (territory-fiche-bridge.ts), pas une deuxième
// invention, mais pas un refactor du code G2.1 existant non plus (mandat :
// "ne pas redesign Territoires/Opportunités G2.1").
import { DEMO_STATE } from "./demo-state";
import type { ProductState } from "@/domain/types";
import { trustLabels } from "@/lib/status-tokens";
import { SOURCES } from "../data/flux";

export interface ConnectedSourceView {
  key: string;
  name: string;
  coverageLabel: string;
  dataTypeLabel: string;
  // freshnessLabel — absent pour les intégrations système (aucune donnée
  // réelle de fraîcheur n'existe pour un statut de connexion binaire) ;
  // présent pour une provenance territoriale réelle (date du signal).
  freshnessLabel?: string;
  connectionStatusLabel: string;
  connectionStatusColor: string;
  // confidenceLabel — niveau de confiance réel (trustLabels), uniquement
  // quand une donnée réelle existe (signal territorial) ; jamais affiché
  // pour les intégrations système, qui n'ont pas de notion de confiance
  // par relevé (mandat §5 : "uniquement si réellement disponible").
  confidenceLabel?: string;
  territoryId?: string;
}

function systemSourceRows(): ConnectedSourceView[] {
  return SOURCES.map((s) => ({
    key: s.n,
    name: s.n,
    coverageLabel: "National",
    dataTypeLabel: s.what,
    connectionStatusLabel: s.state,
    connectionStatusColor: s.c
  }));
}

export function getConnectedSources(state: ProductState = DEMO_STATE, territoryFilterId?: string | null): ConnectedSourceView[] {
  const system = systemSourceRows();
  if (!territoryFilterId) return system;

  const territoryName = state.territories.find((t) => t.id === territoryFilterId)?.name ?? territoryFilterId;
  const territorySignals = state.signals
    .filter((signal) => signal.territoryId === territoryFilterId)
    .slice(0, 6)
    .map((signal) => ({
      key: signal.id,
      name: signal.reportedBy || signal.source,
      coverageLabel: territoryName,
      dataTypeLabel: signal.title,
      freshnessLabel: signal.createdAt.slice(0, 10),
      connectionStatusLabel: "Signal reçu",
      connectionStatusColor: "#4E7B5A",
      confidenceLabel: trustLabels[signal.trust],
      territoryId: territoryFilterId
    }));

  return [...territorySignals, ...system];
}
