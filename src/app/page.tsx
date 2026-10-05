import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CONTENT, LOOP3, PHOTOS } from "@/data/public-v2-content";

// Accueil — Public V2, iso-design depuis Mbambulaan_Public_V2.html
// (Claude Design, 01 Accueil). Remplace entièrement la composition V1.
export default function HomePage() {
  const [lead, side1, side2] = CONTENT;
  const doors = [
    { title: "Découvrir", desc: "Articles, dossiers et vidéos pour comprendre la pêche artisanale et la filière.", href: "/decouvrir", img: PHOTOS.mar },
    { title: "Explorer", desc: "L’Atlas des territoires maritimes, du fleuve Sénégal à la Casamance.", href: "/atlas", img: PHOTOS.pir },
    { title: "Contribuer", desc: "Partager une information, signaler une situation, proposer une collaboration.", href: "/partager", img: PHOTOS.fum }
  ];

  return (
    <main style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif", color: "#0B1A2A", background: "#fff", minHeight: "100vh", overflowX: "clip", fontSize: 16, lineHeight: 1.55 }}>
      <PublicHeader />

      {/* Hero */}
      <section style={{ position: "relative", background: "#0B1A2A", color: "#F7F3E9", overflow: "hidden", minHeight: "clamp(560px,84vh,860px)", display: "flex" }}>
        <Image src={PHOTOS.quai} alt="Débarquement du poisson sur un quai du littoral sénégalais" fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "65% 40%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(95deg,rgba(11,26,42,.94) 0%,rgba(11,26,42,.78) 42%,rgba(11,26,42,.2) 80%)" }} />
        <div style={{ position: "relative", maxWidth: 1280, width: "100%", margin: "0 auto", padding: "clamp(56px,9vw,120px) clamp(20px,4vw,48px) clamp(48px,6vw,80px)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 24 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#E8A07F" }}>Mbàmbulaan</p>
            <h1 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(46px,7.4vw,104px)", lineHeight: .98, letterSpacing: "-.025em" }}>La mer reste porteuse d’avenir.</h1>
            <p style={{ margin: 0, maxWidth: 600, fontSize: "clamp(18px,1.6vw,21px)", lineHeight: 1.5, color: "rgba(247,243,233,.88)" }}>Mbàmbulaan aide à mieux connaître, relier et organiser l’économie maritime du Sénégal — en commençant par la pêche artisanale.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
              <Link href="/atlas" className="pv2-btn-rust" style={{ display: "inline-flex", alignItems: "center", gap: 10, minHeight: 52, padding: "0 26px", background: "#B6522F", color: "#fff", fontWeight: 600, fontSize: 15.5, textDecoration: "none", borderRadius: 2 }}>Explorer les territoires <span>→</span></Link>
              <Link href="/mbambulaan" className="pv2-btn-outline-cream" style={{ display: "inline-flex", alignItems: "center", minHeight: 52, padding: "0 26px", border: "1px solid rgba(247,243,233,.5)", color: "#F7F3E9", fontWeight: 600, fontSize: 15.5, textDecoration: "none", borderRadius: 2 }}>Découvrir Mbàmbulaan</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section style={{ background: "#F7F3E9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,9vw,128px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,6vw,96px)", alignItems: "flex-start" }}>
          <h2 style={{ flex: "1 1 440px", margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(30px,3.6vw,48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>La pêche artisanale fait vivre des territoires, des familles, des métiers et des chaînes de valeur.</h2>
          <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 20, fontSize: 18, lineHeight: 1.6, color: "#3A4556", paddingTop: 8 }}>
            <p style={{ margin: 0 }}>Mais comprendre cette économie demande de relier ce qui est souvent dispersé : les territoires, les acteurs, les ressources, les infrastructures, les activités, les besoins et les opportunités.</p>
            <p style={{ margin: 0, color: "#0B1A2A", fontWeight: 500 }}>Mbàmbulaan contribue à rendre cette réalité plus visible et mieux organisée.</p>
          </div>
        </div>
      </section>

      {/* 3 portes */}
      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,4vw,48px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "clamp(28px,3vw,40px)" }}>
            {doors.map((d) => (
              <Link key={d.href} href={d.href} className="pv2-door" style={{ display: "flex", flexDirection: "column", gap: 20, textDecoration: "none", color: "#0B1A2A" }}>
                <span style={{ display: "block", aspectRatio: "4/3", overflow: "hidden", background: "#12263A", position: "relative" }}>
                  <Image src={d.img} alt="" fill sizes="(min-width:1000px) 33vw, 100vw" style={{ objectFit: "cover" }} />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, borderTop: "1px solid #0B1A2A", paddingTop: 16 }}>
                    <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, lineHeight: 1.1 }}>{d.title}</span>
                    <span style={{ fontSize: 20, color: "#B6522F" }}>→</span>
                  </span>
                  <span style={{ fontSize: 16.5, lineHeight: 1.5, color: "#3A4556" }}>{d.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* À la une */}
      <section style={{ borderTop: "1px solid rgba(11,26,42,.1)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(32px,3.6vw,48px)", lineHeight: 1.1, letterSpacing: "-.015em" }}>À la une</h2>
            <Link href="/decouvrir" style={{ fontWeight: 600, fontSize: 15, color: "#B6522F", textDecoration: "none" }}>Voir tous les contenus →</Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px,3vw,48px)" }}>
            <Link href={`/decouvrir/${lead.slug}`} className="pv2-door" style={{ flex: "2 1 520px", display: "flex", flexDirection: "column", gap: 18, textDecoration: "none", color: "#0B1A2A" }}>
              <span style={{ display: "block", aspectRatio: "16/10", overflow: "hidden", background: "#12263A", position: "relative" }}>
                <Image src={PHOTOS[lead.img]} alt="" fill sizes="(min-width:1000px) 60vw, 100vw" style={{ objectFit: "cover" }} />
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#B6522F" }}>{lead.type} · {lead.date} · {lead.dur ?? `${lead.read} de lecture`}</span>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: "clamp(28px,2.8vw,38px)", lineHeight: 1.12, letterSpacing: "-.01em" }}>{lead.title}</span>
              <span style={{ fontSize: 17, lineHeight: 1.55, color: "#3A4556", maxWidth: 620 }}>{lead.dek}</span>
            </Link>
            <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 32 }}>
              {[side1, side2].map((c) => (
                <Link key={c.slug} href={`/decouvrir/${c.slug}`} className="pv2-door" style={{ display: "flex", flexDirection: "column", gap: 14, textDecoration: "none", color: "#0B1A2A" }}>
                  <span style={{ position: "relative", display: "block", aspectRatio: "16/9", overflow: "hidden", background: "#12263A" }}>
                    <Image src={PHOTOS[c.img]} alt="" fill sizes="(min-width:1000px) 30vw, 100vw" style={{ objectFit: "cover" }} />
                    {c.type === "Vidéo" && <span style={{ position: "absolute", left: 14, bottom: 14, width: 46, height: 46, borderRadius: "50%", background: "#F7F3E9", display: "grid", placeItems: "center", color: "#0B1A2A", fontSize: 15, paddingLeft: 3 }}>▶</span>}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#B6522F" }}>{c.type} · {c.date} · {c.dur ?? `${c.read} de lecture`}</span>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 24, lineHeight: 1.18 }}>{c.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Qu'est-ce que Mbàmbulaan ? */}
      <section style={{ background: "#0B1A2A", color: "#F7F3E9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "clamp(40px,6vw,96px)" }}>
          <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(32px,3.6vw,48px)", lineHeight: 1.1, letterSpacing: "-.015em" }}>Qu’est-ce que Mbàmbulaan ?</h2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: "rgba(247,243,233,.85)", maxWidth: 520 }}>Un programme de développement, appuyé sur un outil numérique, qui rassemble ce que l’on sait de l’économie maritime pour aider ceux qui y travaillent à mieux se comprendre et à mieux agir ensemble.</p>
            <Link href="/mbambulaan" className="pv2-btn-cream" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 10, minHeight: 50, padding: "0 24px", background: "#F7F3E9", color: "#0B1A2A", fontWeight: 600, fontSize: 15.5, textDecoration: "none", borderRadius: 2, marginTop: 8 }}>Comprendre Mbàmbulaan →</Link>
          </div>
          <ol style={{ flex: "1 1 400px", listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            {LOOP3.map((s) => (
              <li key={s.n} style={{ display: "flex", gap: 24, padding: "24px 0", borderTop: "1px solid rgba(247,243,233,.18)" }}>
                <span style={{ flex: "none", width: 140, fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 26, color: "#E8A07F", lineHeight: 1.2 }}>{s.n}</span>
                <span style={{ fontSize: 16.5, lineHeight: 1.55, color: "rgba(247,243,233,.85)" }}>{s.d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Vous avez quelque chose à partager ? */}
      <section style={{ background: "#F7F3E9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "clamp(40px,6vw,96px)", alignItems: "center" }}>
          <div style={{ flex: "1 1 380px", display: "flex", flexDirection: "column", gap: 28 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(32px,3.6vw,48px)", lineHeight: 1.1, letterSpacing: "-.015em" }}>Vous avez quelque chose d’utile à partager ?</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 18, color: "#3A4556" }}>
              <li>Vous êtes professionnel de la pêche ou de la filière.</li>
              <li>Vous connaissez une situation importante sur un quai ou un site.</li>
              <li>Vous représentez une organisation ou une institution.</li>
              <li>Vous souhaitez contribuer à Mbàmbulaan.</li>
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href="/partager" className="pv2-btn-rust" style={{ display: "inline-flex", alignItems: "center", gap: 10, minHeight: 52, padding: "0 26px", background: "#B6522F", color: "#fff", fontWeight: 600, fontSize: 15.5, textDecoration: "none", borderRadius: 2 }}>Partager une information</Link>
              <Link href="/contact" className="pv2-btn-outline-navy" style={{ display: "inline-flex", alignItems: "center", minHeight: 52, padding: "0 26px", border: "1px solid #0B1A2A", color: "#0B1A2A", fontWeight: 600, fontSize: 15.5, textDecoration: "none", borderRadius: 2 }}>Nous contacter</Link>
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#4C5566", maxWidth: 520 }}>Les informations reçues peuvent être vérifiées, complétées ou recoupées avant d’être utilisées par Mbàmbulaan.</p>
          </div>
          <div style={{ flex: "1 1 380px", aspectRatio: "4/3", overflow: "hidden", background: "#12263A", position: "relative" }}>
            <Image src={PHOTOS.rel} alt="Échange entre professionnels sur une plage de débarquement" fill sizes="(min-width:1000px) 45vw, 100vw" style={{ objectFit: "cover" }} />
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .pv2-door:hover { color: #9E431F; }
        .pv2-btn-rust:hover { background: #9E431F; }
        .pv2-btn-outline-cream:hover { background: #F7F3E9; color: #0B1A2A; }
        .pv2-btn-cream:hover { background: #E8A07F; }
        .pv2-btn-outline-navy:hover { background: #0B1A2A; color: #fff; }
      `}</style>
    </main>
  );
}
