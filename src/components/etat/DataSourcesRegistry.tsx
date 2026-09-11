import type { ProductState } from "@/domain/types";
import { dataSourceRegistry } from "@/domain/data-sources";

// LOT V3.7 (structure initiale), refait au LOT V3.22 ("copie conforme
// littérale, seconde passe") — reprend cette fois l'écran `isSources` du
// prototype Claude Design en gardant les valeurs LITTÉRALES extraites du
// rendu réel du bundle standalone.html (px/rgba exacts, animation
// d'entrée `mb-rise` .4s comprise) plutôt qu'une réinterprétation en
// classes Tailwind approximatives. Seul écart volontaire : la grille
// 3 colonnes fixes du prototype (`repeat(3, 1fr)`, jamais responsive
// dans son canevas desktop) reçoit un unique repli `max-sm:grid-cols-1`
// pour ne pas casser l'écran à 390px — aucune autre valeur n'est
// approximée. Contenu 100 % réel (voir domain/data-sources.ts pour le
// détail de la vérification carte par carte).
export function DataSourcesRegistry({ state }: { state: ProductState }) {
  const sources = dataSourceRegistry(state);

  return (
    <div className="mb-rise" style={{ padding: "24px 30px 60px" }}>
      <div style={{ maxWidth: "74ch", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>
          Sources connectées
        </div>
        <h1 style={{ fontFamily: "Newsreader, serif", fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: "0 0 12px" }}>
          Deux sources alimentent réellement Mbàmbulaan aujourd’hui
        </h1>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: "rgba(11,26,42,.72)" }}>
          Mbàmbulaan est conçu pour devenir une couche de supervision au-dessus des systèmes existants du ministère. Cette page distingue ce
          qui est effectivement connecté de ce qui ne l’est pas — parce qu’une donnée absente change la lecture de toutes les autres.
        </p>
      </div>

      <div
        className="grid max-sm:grid-cols-1"
        style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(11,26,42,.12)", border: "1px solid rgba(11,26,42,.12)" }}
      >
        {sources.map((source) => (
          <div key={source.key} className="min-w-0" style={{ background: "#fff", padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: sourceColor(source.connectionState), flex: "0 0 auto" }} />
              <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: sourceColor(source.connectionState), fontWeight: 500 }}>
                {source.stateLabel}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{source.name}</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.7)", flex: 1 }}>{source.what}</div>
            <div style={{ paddingTop: 11, borderTop: "1px solid rgba(11,26,42,.09)" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 5 }}>
                Conséquence aujourd’hui
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(11,26,42,.72)" }}>{source.effect}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-sm:flex-col" style={{ marginTop: 22, padding: "19px 22px", background: "#0B1A2A", color: "#F7F3E9", display: "flex", gap: 26, alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 auto", width: 180, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#DE9C74", paddingTop: 3 }}>
          Principe
        </div>
        <div style={{ flex: 1, fontSize: 14, lineHeight: 1.65, color: "rgba(247,243,233,.86)", maxWidth: "82ch" }}>
          Une intégration n’est jamais présentée comme acquise avant de l’être. Chaque chiffre du produit porte la trace de son origine, et
          chaque absence de source est affichée avec la même visibilité qu’une donnée disponible. C’est ce qui permet à un ministre de savoir
          non seulement ce que le système dit, mais ce qu’il ne peut pas encore dire.
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
      return "rgba(11,26,42,.4)";
  }
}
