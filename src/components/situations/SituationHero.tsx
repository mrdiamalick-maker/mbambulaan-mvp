import type { Actor, Situation, Territory } from "@/domain/types";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { Badge } from "@/components/ui/badge";
import { TrustIndicator } from "@/components/foundations";
import { priorityLabels, type GlyphTag } from "@/lib/status-tokens";

// XXL-R3 (§17-18) — signature de dossier PARTAGÉE entre la Situation Room
// (Coordinateur, SituationRoom.tsx) et le drawer Situation de l'Espace État
// (SituationDetail, etat/shared.tsx) : un seul hero, une seule lecture —
// territoire / titre / phrase / priorité / état / responsable / dernière
// évolution — plutôt qu'un hero Room et une simple ligne de badges côté
// État. Construit avec les tokens --mb-* (mb-foundations.css), globaux et
// non scopés, précisément pour rester correct à la fois sous .shadcn-scope
// (Room) et .etat-scope (Drawer) — TensionGlyph et Badge (variantes
// marine/terracotta/amber/success, couleurs fixes) le sont déjà, réutilisés
// tels quels (§19 R1, pas de component factory).
//
// statusLabel reste un prop plutôt qu'un vocabulaire recalculé ici : Room
// et l'Espace État gardent chacun leur propre Record<Situation["status"],
// string> existant (légère différence de ton assumée ailleurs dans le
// produit, cf. lib/status-tokens.ts) — ce hero n'invente pas un 3e
// vocabulaire, il uniformise seulement la COMPOSITION.
export function SituationHero({
  situation,
  territory,
  responsible,
  tag,
  statusLabel,
  statusVariant = "marine",
  lastEvolution
}: {
  situation: Situation;
  territory?: Territory;
  responsible?: Actor;
  tag: GlyphTag;
  statusLabel: string;
  /** Couleur du badge d'état — laissée au vocabulaire déjà défini par chaque appelant (§17, un hero commun n'invente pas un 3e Record<status, variant>). */
  statusVariant?: "marine" | "amber" | "terracotta" | "success";
  lastEvolution?: { label: string; detail?: string; at: string };
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "var(--mb-navy-900)", color: "var(--mb-cream-100)" }}
    >
      <div className="p-6 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <TensionGlyph status={tag} size={80} pulse={situation.priority === "critique"} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="mb-evidence" style={{ color: "var(--mb-terracotta-500)" }}>Situation opérationnelle</span>
              <span style={{ color: "rgba(247,243,233,.5)" }}>{situation.reference}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{situation.title}</h1>
            {/* Certains dossiers portent la même chaîne en title et
                description (donnée réelle, non modifiée ici — §42) : ne
                pas répéter la phrase telle quelle sous le titre dans ce
                cas, purement un choix d'affichage. */}
            {situation.description && situation.description.trim() !== situation.title.trim() && (
              <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "rgba(247,243,233,.72)" }}>{situation.description}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant={tag === "critique" ? "terracotta" : tag === "vigilance" ? "amber" : "marine"}>{priorityLabels[situation.priority]}</Badge>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              <TrustIndicator trust={situation.trust} />
            </div>
          </div>
        </div>
      </div>
      <div
        className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        style={{ borderTop: "1px solid rgba(247,243,233,.12)", borderColor: "rgba(247,243,233,.12)" }}
      >
        <HeroMeta label="Territoire" value={territory?.name ?? "Non défini"} />
        <HeroMeta label="Responsable" value={responsible?.name ?? "À désigner"} />
        <HeroMeta
          label="Dernière évolution"
          value={lastEvolution ? lastEvolution.label : "Aucune évolution consignée"}
          detail={lastEvolution ? `${new Date(lastEvolution.at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}${lastEvolution.detail ? ` · ${lastEvolution.detail}` : ""}` : undefined}
        />
      </div>
    </div>
  );
}

function HeroMeta({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="px-6 py-4 md:px-8" style={{ borderColor: "rgba(247,243,233,.12)" }}>
      <p className="mb-evidence" style={{ color: "rgba(247,243,233,.45)" }}>{label}</p>
      <p className="mt-1.5 text-sm font-semibold leading-5">{value}</p>
      {detail && <p className="mt-0.5 text-xs" style={{ color: "rgba(247,243,233,.55)" }}>{detail}</p>}
    </div>
  );
}
