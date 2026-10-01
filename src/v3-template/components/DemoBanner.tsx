export function DemoBanner({ roleNote }: { roleNote: string }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "9px 30px", background: "rgba(11,26,42,.04)",
        borderBottom: "1px solid rgba(11,26,42,.08)", fontSize: 11.5, color: "rgba(11,26,42,.6)", flexWrap: "wrap"
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4E7B5A" }} />
        Données de démonstration — structure réelle, valeurs illustratives
      </span>
      <span style={{ width: 1, height: 12, background: "rgba(11,26,42,.15)" }} />
      <span>{roleNote}</span>
      <span style={{ flex: 1 }} />
      <span>2 sources connectées sur 6 envisagées</span>
    </div>
  );
}
