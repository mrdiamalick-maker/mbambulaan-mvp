import Link from "next/link";

// PublicFooter — Public V2, iso-design depuis Mbambulaan_Public_V2.html.
export function PublicFooter() {
  return (
    <footer style={{ background: "#0B1A2A", color: "rgba(247,243,233,.8)", borderTop: "1px solid rgba(247,243,233,.1)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px clamp(20px,4vw,48px) 32px", display: "flex", flexDirection: "column", gap: 40 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 360 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 36, height: 36, background: "#F7F3E9", display: "grid", placeItems: "center", fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 22, color: "#B6522F" }}>M</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#F7F3E9" }}>Mbàmbulaan</span>
            </span>
            <p style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 19, color: "#F7F3E9" }}>La mer reste porteuse d’avenir.</p>
          </div>
          <nav aria-label="Pied de page" style={{ display: "flex", flexWrap: "wrap", gap: "12px 32px", fontSize: 15 }}>
            <Link href="/decouvrir" style={{ color: "#F7F3E9", textDecoration: "none" }}>Découvrir</Link>
            <Link href="/atlas" style={{ color: "#F7F3E9", textDecoration: "none" }}>Atlas</Link>
            <Link href="/mbambulaan" style={{ color: "#F7F3E9", textDecoration: "none" }}>Mbàmbulaan</Link>
            <Link href="/partager" style={{ color: "#F7F3E9", textDecoration: "none" }}>Partager une information</Link>
            <Link href="/contact" style={{ color: "#F7F3E9", textDecoration: "none" }}>Contact</Link>
            <Link href="/connexion" style={{ color: "rgba(247,243,233,.65)", textDecoration: "none" }}>Espace privé</Link>
          </nav>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, paddingTop: 24, borderTop: "1px solid rgba(247,243,233,.12)", fontSize: 13, color: "rgba(247,243,233,.6)" }}>
          <span>Initiative privée sénégalaise · conçue et développée par EPIC CONSEIL</span>
          <span style={{ display: "flex", gap: 20 }}>
            <Link href="/mentions-legales" style={{ color: "rgba(247,243,233,.6)", textDecoration: "none" }}>Mentions légales</Link>
            <Link href="/confidentialite" style={{ color: "rgba(247,243,233,.6)", textDecoration: "none" }}>Confidentialité</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
