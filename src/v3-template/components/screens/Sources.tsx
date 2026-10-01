import { SOURCES } from "../../data/flux";
import { V3_FONT_SERIF } from "../../theme";

export function Sources() {
  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ maxWidth: "74ch", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Sources connectées</div>
        <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: "0 0 12px" }}>
          Deux sources alimentent réellement Mbàmbulaan aujourd’hui
        </h1>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: "rgba(11,26,42,.72)" }}>
          Mbàmbulaan est conçu pour devenir une couche de supervision au-dessus des systèmes existants du ministère. Cette page distingue ce qui est effectivement connecté de ce qui ne l’est pas — parce qu’une donnée absente change la lecture de toutes les autres.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(11,26,42,.12)", border: "1px solid rgba(11,26,42,.12)" }}>
        {SOURCES.map((s) => (
          <div key={s.n} style={{ background: "#FFFFFF", padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.c, flex: "none" }} />
              <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: s.c, fontWeight: 500 }}>{s.state}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{s.n}</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.7)", flex: 1 }}>{s.what}</div>
            <div style={{ paddingTop: 11, borderTop: "1px solid rgba(11,26,42,.09)" }}>
              <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 5 }}>Conséquence aujourd’hui</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(11,26,42,.72)" }}>{s.effect}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22, padding: "19px 22px", background: "#0B1A2A", color: "#F7F3E9", display: "flex", gap: 26, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "none", width: 180, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#DE9C74", paddingTop: 3 }}>Principe</div>
        <div style={{ flex: 1, fontSize: 14, lineHeight: 1.65, color: "rgba(247,243,233,.86)", maxWidth: "82ch" }}>
          Une intégration n’est jamais présentée comme acquise avant de l’être. Chaque chiffre du produit porte la trace de son origine, et chaque absence de source est affichée avec la même visibilité qu’une donnée disponible. C’est ce qui permet à un ministre de savoir non seulement ce que le système dit, mais ce qu’il ne peut pas encore dire.
        </div>
      </div>
    </div>
  );
}
