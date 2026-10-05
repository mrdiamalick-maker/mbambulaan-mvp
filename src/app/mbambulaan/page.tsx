import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { LOOP3, PHOTOS } from "@/data/public-v2-content";

// Mbàmbulaan — Public V2, écran "06 Mbàmbulaan". Remplace entièrement la
// composition V1 (piliers Terrain/Réseau/Technologie, tensions, LoopDiagram
// SVG, 3 portes d'entrée) par les 5 sections du HTML : hero, "En quelques
// mots", "Pourquoi ?", "Comment ça marche" (LOOP3) et "Qui porte
// Mbàmbulaan ?" (mention EPIC CONSEIL).
export const metadata: Metadata = {
  title: "Mbàmbulaan | Infrastructure de coordination",
  description: "Mbàmbulaan est un programme de développement et une infrastructure numérique de connaissance, de confiance et de coordination de l’économie maritime.",
  alternates: { canonical: "/mbambulaan" }
};

export default function MbambulaanPage() {
  return (
    <main style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif", color: "#1E2A38", background: "#fff" }}>
      <PublicHeader />

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px,6vw,96px) clamp(20px,4vw,48px) clamp(40px,5vw,64px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,80px)", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 480px", display: "flex", flexDirection: "column", gap: 22 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(42px,5.6vw,76px)", lineHeight: 1, letterSpacing: "-.02em" }}>Relier le terrain, la connaissance et l’action.</h1>
          <p style={{ margin: 0, fontSize: 19, lineHeight: 1.6, color: "#3A4556", maxWidth: 600 }}>Mbàmbulaan rassemble ce que l’on sait de l’économie maritime sénégalaise — territoires, métiers, ressources, équipements, besoins — pour que chacun puisse mieux la comprendre et mieux agir.</p>
        </div>
        <div style={{ flex: "1 1 380px", aspectRatio: "4/3", overflow: "hidden", background: "#12263A", position: "relative" }}>
          <Image src={PHOTOS.rel} alt="" fill sizes="(min-width: 900px) 40vw, 100vw" style={{ objectFit: "cover" }} priority />
        </div>
      </section>

      <section style={{ background: "#F7F3E9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,104px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,80px)" }}>
          <h2 style={{ flex: "1 1 280px", margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(30px,3.2vw,42px)", lineHeight: 1.1 }}>En quelques mots</h2>
          <div style={{ flex: "2 1 480px", display: "flex", flexDirection: "column", gap: 20, fontSize: 18, lineHeight: 1.65, color: "#1E2A38" }}>
            <p style={{ margin: 0 }}>C’est à la fois <strong>un programme de développement</strong>, qui travaille avec les acteurs du littoral, et <strong>un outil numérique</strong>, qui organise et partage la connaissance de la filière.</p>
            <p style={{ margin: 0 }}>Son premier terrain est la pêche artisanale sénégalaise. Il a vocation à s’étendre progressivement à l’ensemble de l’économie maritime : ports, transport, tourisme côtier, aquaculture, environnement.</p>
            <p style={{ margin: 0, paddingTop: 16, borderTop: "1px solid rgba(11,26,42,.15)", fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 19, color: "#3A4556" }}>« Mbàmbulaan est un programme de développement et une infrastructure numérique de connaissance, de confiance et de coordination de l’économie maritime. »</p>
          </div>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,104px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,80px)" }}>
          <h2 style={{ flex: "1 1 280px", margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(30px,3.2vw,42px)", lineHeight: 1.1 }}>Pourquoi ?</h2>
          <div style={{ flex: "2 1 480px", display: "flex", flexDirection: "column", gap: 20, fontSize: 18, lineHeight: 1.65, color: "#1E2A38" }}>
            <p style={{ margin: 0 }}>La pêche artisanale fait vivre des centaines de milliers de personnes au Sénégal. Pourtant, l’information qui la concerne est dispersée : entre les quais, les organisations, les institutions et les partenaires.</p>
            <p style={{ margin: 0 }}>Quand on ne voit pas clairement ce qui existe, ce qui manque et ce qui fonctionne, il devient difficile de bien investir, de bien former ou de bien coordonner.</p>
          </div>
        </div>
      </section>

      <section style={{ background: "#0B1A2A", color: "#F7F3E9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,104px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 40 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(30px,3.2vw,42px)", lineHeight: 1.1 }}>Comment ça marche</h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "clamp(28px,4vw,56px)" }}>
            {LOOP3.map((s) => (
              <li key={s.n} style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 20, borderTop: "1px solid rgba(247,243,233,.25)" }}>
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 32, color: "#E8A07F" }}>{s.n}</span>
                <span style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(247,243,233,.85)" }}>{s.long}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,104px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,80px)" }}>
          <h2 style={{ flex: "1 1 280px", margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(30px,3.2vw,42px)", lineHeight: 1.1 }}>Qui porte Mbàmbulaan ?</h2>
          <div style={{ flex: "2 1 480px", display: "flex", flexDirection: "column", gap: 20, fontSize: 18, lineHeight: 1.65, color: "#1E2A38" }}>
            <p style={{ margin: 0 }}>Mbàmbulaan est une initiative privée sénégalaise, conçue et développée par EPIC CONSEIL, en dialogue avec les professionnels, les organisations de la filière et les institutions.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingTop: 8 }}>
              <Link href="/contact?profil=organisation" className="pv2-btn-dark" style={{ display: "inline-flex", alignItems: "center", minHeight: 50, padding: "0 24px", background: "#0B1A2A", color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none", borderRadius: 2 }}>Proposer une collaboration</Link>
              <Link href="/partager" className="pv2-btn-outline" style={{ display: "inline-flex", alignItems: "center", minHeight: 50, padding: "0 24px", border: "1px solid #0B1A2A", color: "#0B1A2A", fontWeight: 600, fontSize: 15, textDecoration: "none", borderRadius: 2 }}>Partager une information</Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .pv2-btn-dark:hover { background: #B6522F; }
        .pv2-btn-outline:hover { background: #0B1A2A; color: #fff; }
      `}</style>
    </main>
  );
}
