"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductState, Role } from "@/domain/types";
import { deriveDatasetReferenceAt } from "@/domain/signal-crossing";
import { fluxChannelDistribution, fluxStats, messageAgeLabel } from "@/domain/incoming-message";
import { channelMeta } from "@/lib/status-tokens";
import { BarMetricChart } from "@/components/private/BarMetricChart";
import { SegmentedControl } from "@/components/private/primitives";
import { FindingConvergenceView } from "@/components/ecosystem/FindingConvergenceView";
import { FluxDetailPanel } from "@/components/flux/FluxDetailPanel";

const CAN_QUALIFY_ROLES: Role[] = ["administrateur", "coordinateur", "operateur"];
type StageFilter = "toutes" | "nouveau" | "converti" | "ecarte";

// LOT V3.3 (mandat "Flux / Dossiers & Convergence") — module dédié,
// composant partagé par /app/flux (aucun deep-link externe existant vers
// un IncomingMessage précis, contrairement à Situations — sélection
// gérée en état local plutôt que dans l'URL). Réutilise le pipeline réel
// (IncomingMessage → convert_message_to_signal | dismiss_incoming_message,
// déjà exposé par CoordinationWorkspace.tsx/IncomingMessageThread) —
// aucune commande, aucune entité "Dossier" persistée n'est créée ici
// (mandat §8, explicite) : un élément sélectionné et son panneau de
// détail restent une vue, jamais une nouvelle donnée.
export function FluxExplorer({ state, role }: { state: ProductState; role: Role }) {
  const router = useRouter();
  const [stage, setStage] = useState<StageFilter>("toutes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [area, setArea] = useState<"file" | "convergence">("file");

  const canQualify = CAN_QUALIFY_ROLES.includes(role);
  useEffect(() => {
    if (!canQualify) router.replace("/app/travail");
  }, [canQualify, router]);
  if (!canQualify) return null;

  const referenceAtMs = (() => {
    const at = deriveDatasetReferenceAt(state);
    return at ? new Date(at).getTime() : Date.now();
  })();

  const stats = fluxStats(state);
  const channelDistribution = fluxChannelDistribution(state);

  // "Plus ancien en premier" (mandat, maquette V3 — un élément qui
  // vieillit sans qualification est le risque réel, pas une simple
  // liste chronologique inversée).
  const sorted = [...state.incomingMessages].sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());
  const filtered = stage === "toutes" ? sorted : sorted.filter((item) => item.status === stage);
  const active = (selectedId ? filtered.find((item) => item.id === selectedId) : undefined) ?? filtered[0];

  const stageTiles: Array<{ key: StageFilter; label: string; value: number; def: string; color: string }> = [
    { key: "toutes", label: "Toutes", value: stats.total, def: "Tout le flux entrant, tous statuts confondus.", color: "rgba(11,26,42,.55)" },
    { key: "nouveau", label: "À qualifier", value: stats.nouveau, def: "Arrivé dans le système, en attente d’une décision de qualification.", color: "#B6522F" },
    { key: "converti", label: "Converti en signal", value: stats.converti, def: "Devenu un Signal réel, structuré et rattaché à un territoire.", color: "#4E7B5A" },
    { key: "ecarte", label: "Écarté", value: stats.ecarte, def: "Écarté avec motif — consultable, jamais supprimé.", color: "rgba(11,26,42,.4)" }
  ];

  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <header className="max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Flux entrant</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-[32px]">L’information reçue n’est pas encore de la connaissance</h1>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">Tout ce qui arrive dans Mbàmbulaan passe ici avant d’exister ailleurs. Rien n’apparaît dans un tableau de bord, une situation ou un résultat sans avoir été qualifié — ou explicitement écarté, avec un motif.</p>
      </header>

      <SegmentedControl
        aria-label="Zone du module"
        value={area}
        onChange={setArea}
        options={[
          { value: "file", label: "File d’entrée" },
          { value: "convergence", label: "Convergence" }
        ]}
      />

      {area === "file" ? (
        <>
          {/* Vue d'ensemble (paliers/canal) — masquée sous lg quand un
              élément est ouvert : même correctif que SituationsExplorer
              (LOT V3.2, trouvé en QA visuelle réelle à 390px) appliqué
              directement ici, sans attendre de le redécouvrir. */}
          <div className={selectedId ? "hidden lg:block" : undefined}>
            <div className="space-y-6">
              <div className="grid gap-0 overflow-hidden rounded-lg border sm:grid-cols-4">
                {stageTiles.map((tile) => (
                  <button
                    key={tile.key}
                    type="button"
                    onClick={() => setStage(tile.key)}
                    className={`border-b p-4 text-left transition sm:border-b-0 sm:border-r last:border-r-0 ${stage === tile.key ? "bg-primary/[.06]" : "hover:bg-muted/50"}`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl leading-none" style={{ color: tile.color }}>{tile.value}</span>
                      <span className={`text-[12.5px] ${stage === tile.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{tile.label}</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-tight text-muted-foreground">{tile.def}</p>
                    <div className="mt-2.5 h-[3px] rounded-full" style={{ background: stage === tile.key ? "#B6522F" : "rgba(11,26,42,.1)" }} />
                  </button>
                ))}
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Répartition par canal</p>
                <BarMetricChart
                  valueLabel="remontée(s)"
                  data={channelDistribution.map((item) => ({ key: item.channel, label: channelMeta[item.channel].label, value: item.count }))}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-0 overflow-hidden rounded-lg border lg:grid-cols-[400px_1fr]">
            <div className={`min-w-0 divide-y border-b lg:border-b-0 lg:border-r ${selectedId ? "hidden lg:block" : ""}`}>
              <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
                <span className="flex-1 text-[11.5px] text-muted-foreground">{filtered.length} élément{filtered.length > 1 ? "s" : ""} {stage === "toutes" ? "au total" : "dans ce palier"}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">Plus ancien en premier</span>
              </div>
              {filtered.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">Rien dans ce palier pour le moment.</p>
              ) : (
                filtered.map((item) => {
                  const meta = channelMeta[item.channel];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="block w-full px-4 py-3.5 text-left transition"
                      style={active?.id === item.id ? { background: "rgba(182,82,47,.07)", boxShadow: "inset 3px 0 0 #B6522F" } : undefined}
                    >
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="font-semibold uppercase tracking-wide text-primary">{meta.label}</span>
                        <span className="flex-1" />
                        <span className="font-mono text-muted-foreground">{messageAgeLabel(item, referenceAtMs)}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-5">{item.body}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{item.territoryHint ?? "Territoire non déclaré"}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{item.reportedBy}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className={`min-w-0 p-5 lg:p-6 ${selectedId ? "" : "hidden lg:block"}`}>
              {selectedId && (
                <button type="button" onClick={() => setSelectedId(null)} className="mb-4 text-sm font-semibold text-muted-foreground lg:hidden">← File d’entrée</button>
              )}
              {active ? <FluxDetailPanel state={state} message={active} /> : <p className="text-sm text-muted-foreground">Sélectionnez un élément pour en voir le détail.</p>}
            </div>
          </div>
        </>
      ) : (
        <FindingConvergenceView state={state} />
      )}
    </div>
  );
}
