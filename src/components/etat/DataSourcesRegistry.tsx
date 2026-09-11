import type { ProductState } from "@/domain/types";
import { dataSourceRegistry } from "@/domain/data-sources";

// LOT V3.7 ("Arbitrages / Sources") — reprend la structure exacte du
// prototype Claude Design (écran `isSources` : grille de 3 colonnes × 2
// rangées, chaque carte état/nom/description/"conséquence aujourd'hui",
// puis un panneau sombre "Principe") avec un contenu entièrement réel
// (domain/data-sources.ts — voir l'en-tête de ce fichier pour le détail
// du classement A/B/C/D). Composant serveur pur (aucun état, aucune
// interaction) : rien ici ne justifie "use client", à la différence
// d'ArbitragesPage qui a un sélecteur.
export function DataSourcesRegistry({ state }: { state: ProductState }) {
  const sources = dataSourceRegistry(state);

  return (
    <div className="pb-16">
      <div className="border-b border-[var(--etat-line)] px-6 pt-9 pb-7 lg:px-[60px]" style={{ background: "var(--etat-warm-white)" }}>
        <p className="etat-eyebrow">
          <span className="etat-eyebrow-dot" />Sources connectées
        </p>
        <h1 className="etat-display etat-h1 etat-h1--registry mt-3.5 max-w-[30ch]">Ce qui alimente réellement Mbàmbulaan aujourd’hui</h1>
        <p className="mt-3.5 max-w-[640px] text-[13.5px] leading-[1.65]" style={{ color: "rgba(11,26,42,.72)" }}>
          Mbàmbulaan est conçu pour devenir une couche de supervision au-dessus des systèmes existants du ministère. Cette page distingue ce qui est
          effectivement connecté de ce qui ne l’est pas — parce qu’une donnée absente change la lecture de toutes les autres.
        </p>
      </div>

      <div className="px-6 py-8 lg:px-[60px]">
        <div className="grid gap-px border border-[var(--etat-line)] bg-[var(--etat-line)] sm:grid-cols-2 xl:grid-cols-3">
          {sources.map((source) => (
            <div key={source.key} className="flex min-w-0 flex-col gap-2.5 bg-white p-5">
              <div className="flex items-center gap-2.5">
                <span className="size-2 shrink-0 rounded-full" style={{ background: sourceColor(source.connectionState) }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[.1em]"
                  style={{ color: sourceColor(source.connectionState) }}
                >
                  {source.stateLabel}
                </span>
              </div>
              <p className="text-[15px] font-semibold leading-[1.35] text-[var(--etat-navy)]">{source.name}</p>
              <p className="flex-1 text-[12.5px] leading-[1.55]" style={{ color: "rgba(11,26,42,.7)" }}>
                {source.what}
              </p>
              <div className="border-t border-[var(--etat-line-soft)] pt-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[.1em]" style={{ color: "var(--etat-stone-400)" }}>
                  Conséquence aujourd’hui
                </p>
                <p className="mt-1 text-[12px] leading-[1.5]" style={{ color: "rgba(11,26,42,.72)" }}>
                  {source.effect}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:gap-7" style={{ background: "var(--etat-navy)" }}>
          <p className="w-full shrink-0 text-[10px] font-semibold uppercase tracking-[.12em] sm:w-[170px]" style={{ color: "var(--etat-terracotta-clair)" }}>
            Principe
          </p>
          <p className="max-w-[82ch] text-[13.5px] leading-[1.65]" style={{ color: "rgba(247,243,233,.86)" }}>
            Une intégration n’est jamais présentée comme acquise avant de l’être. Chaque chiffre du produit porte la trace de son origine, et chaque
            absence de source est affichée avec la même visibilité qu’une donnée disponible. C’est ce qui permet à un ministre de savoir non seulement
            ce que le système dit, mais ce qu’il ne peut pas encore dire.
          </p>
        </div>
      </div>
    </div>
  );
}

function sourceColor(state: string): string {
  switch (state) {
    case "connectee":
      return "var(--etat-vert)";
    case "non_connectee":
      return "var(--etat-critique)";
    case "manuelle":
      return "var(--etat-ocre)";
    default:
      return "var(--etat-stone-400)";
  }
}
