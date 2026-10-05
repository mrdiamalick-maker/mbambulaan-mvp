"use client";

// Découvrir — Public V2, iso-design depuis Mbambulaan_Public_V2.html
// (écran "02 Découvrir"). Remplace entièrement la composition V1 (grille
// éditoriale asymétrique majors/compacts + bande durabilité) : à la une
// + filtres thématiques + onglets de type + grille de résultats + vidéos
// + opportunités + CTA Atlas.
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CONTENT, OPPORTUNITIES, PHOTOS, THEMES, TYPES, type ContentTheme, type ContentType } from "@/data/public-v2-content";

function cardMeta(c: (typeof CONTENT)[number]) {
  return c.dur ? `${c.date} · ${c.dur}` : c.read ? `${c.date} · ${c.read} de lecture` : c.date;
}

export default function DecouvrirPage() {
  const [theme, setTheme] = useState<ContentTheme | "all">("all");
  const [type, setType] = useState<ContentType | "all">("all");

  const lead = CONTENT[0];
  const videos = CONTENT.filter((c) => c.type === "Vidéo");

  const results = useMemo(
    () => CONTENT.filter((c) => (theme === "all" || c.theme === theme) && (type === "all" || c.type === type)),
    [theme, type]
  );

  const themeLabel = (t: ContentTheme) => THEMES.find(([key]) => key === t)?.[1] ?? t;

  return (
    <main style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif", color: "#1E2A38", background: "#fff" }}>
      <PublicHeader />

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px,6vw,88px) clamp(20px,4vw,48px) 40px", display: "flex", flexDirection: "column", gap: 18 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(42px,5.6vw,76px)", lineHeight: 1, letterSpacing: "-.02em" }}>Découvrir</h1>
        <p style={{ margin: 0, maxWidth: 640, fontSize: 19, lineHeight: 1.55, color: "#3A4556" }}>Articles, dossiers, vidéos et actualités pour comprendre la pêche artisanale, la filière halieutique et l’économie maritime du Sénégal.</p>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px) clamp(56px,7vw,96px)" }}>
        <Link href={`/decouvrir/${lead.slug}`} className="pv2-lead" style={{ display: "flex", flexWrap: "wrap", textDecoration: "none", color: "#F7F3E9", background: "#0B1A2A" }}>
          <span style={{ flex: "3 1 520px", display: "block", minHeight: 340, aspectRatio: "16/10", overflow: "hidden", background: "#12263A", position: "relative" }}>
            <Image src={PHOTOS[lead.img]} alt="" fill sizes="(min-width: 900px) 60vw, 100vw" style={{ objectFit: "cover" }} priority />
          </span>
          <span style={{ flex: "2 1 340px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 16, padding: "clamp(28px,4vw,48px)" }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#E8A07F" }}>À la une · {lead.type}</span>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: "clamp(30px,3vw,42px)", lineHeight: 1.1, letterSpacing: "-.01em" }}>{lead.title}</span>
            <span style={{ fontSize: 17, lineHeight: 1.55, color: "rgba(247,243,233,.82)" }}>{lead.dek}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#F7F3E9", marginTop: 8 }}>Lire le dossier →</span>
          </span>
        </Link>
      </section>

      <section style={{ borderTop: "1px solid rgba(11,26,42,.1)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 28 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.1 }}>Thématiques</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              onClick={() => setTheme("all")}
              aria-pressed={theme === "all"}
              style={{ display: "inline-flex", alignItems: "baseline", gap: 8, minHeight: 44, padding: "10px 16px", border: `1px solid ${theme === "all" ? "#0B1A2A" : "rgba(11,26,42,.2)"}`, background: theme === "all" ? "#0B1A2A" : "transparent", color: theme === "all" ? "#F7F3E9" : "#3A4556", font: "500 15px var(--font-instrument-sans), sans-serif", borderRadius: 2, cursor: "pointer" }}
            >
              Tous<span style={{ fontSize: 12.5, opacity: 0.65 }}> {CONTENT.length}</span>
            </button>
            {THEMES.map(([key, label]) => {
              const count = CONTENT.filter((c) => c.theme === key).length;
              const active = theme === key;
              return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  aria-pressed={active}
                  style={{ display: "inline-flex", alignItems: "baseline", gap: 8, minHeight: 44, padding: "10px 16px", border: `1px solid ${active ? "#0B1A2A" : "rgba(11,26,42,.2)"}`, background: active ? "#0B1A2A" : "transparent", color: active ? "#F7F3E9" : "#3A4556", font: "500 15px var(--font-instrument-sans), sans-serif", borderRadius: 2, cursor: "pointer" }}
                >
                  {label}<span style={{ fontSize: 12.5, opacity: 0.65 }}> {count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px) clamp(56px,7vw,96px)", display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(11,26,42,.12)" }}>
            <div role="tablist" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {TYPES.map(([key, label]) => {
                const active = type === key;
                return (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setType(key)}
                    style={{ position: "relative", minHeight: 48, padding: "0 14px", background: "transparent", border: 0, font: "600 15px var(--font-instrument-sans), sans-serif", color: active ? "#0B1A2A" : "#4C5566", cursor: "pointer" }}
                  >
                    {label}
                    <span style={{ position: "absolute", left: 14, right: 14, bottom: -1, height: 3, background: "#B6522F", opacity: active ? 1 : 0 }} />
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 14, color: "#4C5566", paddingBottom: 8 }}>{results.length} résultat{results.length === 1 ? "" : "s"}</span>
          </div>

          {results.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: "48px clamp(24px,3vw,40px)" }}>
              {results.map((c) => (
                <Link key={c.slug} href={`/decouvrir/${c.slug}`} className="pv2-card" style={{ display: "flex", flexDirection: "column", gap: 14, textDecoration: "none", color: "#0B1A2A" }}>
                  <span style={{ position: "relative", display: "block", aspectRatio: "3/2", overflow: "hidden", background: "#12263A" }}>
                    <Image src={PHOTOS[c.img]} alt="" fill sizes="(min-width: 900px) 30vw, 100vw" style={{ objectFit: "cover" }} />
                    {c.type === "Vidéo" && (
                      <span style={{ position: "absolute", left: 14, bottom: 14, width: 44, height: 44, borderRadius: "50%", background: "#F7F3E9", display: "grid", placeItems: "center", color: "#0B1A2A", fontSize: 14, paddingLeft: 3 }}>▶</span>
                    )}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#B6522F" }}>{c.type} · {themeLabel(c.theme)}</span>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 25, lineHeight: 1.16 }}>{c.title}</span>
                  <span style={{ fontSize: 15.5, lineHeight: 1.5, color: "#3A4556" }}>{c.dek}</span>
                  <span style={{ fontSize: 13.5, color: "#4C5566" }}>{cardMeta(c)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
              <p style={{ margin: 0, fontSize: 18, color: "#3A4556" }}>Aucun contenu pour cette combinaison pour l’instant.</p>
              <button onClick={() => { setTheme("all"); setType("all"); }} style={{ background: "none", border: 0, padding: 0, font: "600 15px var(--font-instrument-sans), sans-serif", color: "#B6522F", cursor: "pointer" }}>
                Voir tous les contenus
              </button>
            </div>
          )}
        </div>
      </section>

      <section style={{ background: "#0B1A2A", color: "#F7F3E9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,96px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 32 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.1 }}>Vidéos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "clamp(24px,3vw,40px)" }}>
            {videos.map((c) => (
              <Link key={c.slug} href={`/decouvrir/${c.slug}`} className="pv2-video" style={{ display: "flex", flexDirection: "column", gap: 14, textDecoration: "none", color: "#F7F3E9" }}>
                <span style={{ position: "relative", display: "block", aspectRatio: "16/9", overflow: "hidden", background: "#12263A" }}>
                  <Image src={PHOTOS[c.img]} alt="" fill sizes="(min-width: 900px) 40vw, 100vw" style={{ objectFit: "cover", opacity: 0.9 }} />
                  <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <span style={{ width: 64, height: 64, borderRadius: "50%", background: "#F7F3E9", display: "grid", placeItems: "center", color: "#0B1A2A", fontSize: 18, paddingLeft: 4 }}>▶</span>
                  </span>
                  <span style={{ position: "absolute", right: 12, bottom: 12, padding: "3px 8px", background: "rgba(11,26,42,.85)", fontSize: 12.5, fontWeight: 600, color: "#F7F3E9" }}>{c.dur}</span>
                </span>
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, lineHeight: 1.15 }}>{c.title}</span>
                <span style={{ fontSize: 15.5, color: "rgba(247,243,233,.75)" }}>{c.dek}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,96px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,80px)" }}>
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.1 }}>Initiatives &amp; opportunités</h2>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.55, color: "#3A4556", maxWidth: 400 }}>Formations, programmes et appels à collaboration publiés lorsqu’ils sont ouverts et utiles à la filière.</p>
          </div>
          <ul style={{ flex: "2 1 520px", listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            {OPPORTUNITIES.map((o) => (
              <li key={o.title} style={{ borderTop: "1px solid rgba(11,26,42,.14)" }}>
                <Link href={`/contact?profil=${o.profile}`} className="pv2-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px 24px", padding: "22px 0", textDecoration: "none", color: "#0B1A2A" }}>
                  <span style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: "1 1 320px" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#B6522F" }}>{o.type} · {o.where}</span>
                    <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 23, lineHeight: 1.2 }}>{o.title}</span>
                  </span>
                  <span style={{ fontSize: 14.5, color: "#4C5566", alignSelf: "center" }}>{o.when} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ background: "#F7F3E9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(26px,2.6vw,34px)", lineHeight: 1.15 }}>Lire par territoire</h2>
            <p style={{ margin: 0, fontSize: 16.5, color: "#3A4556" }}>Chaque fiche de l’Atlas rassemble les contenus liés à un territoire du littoral.</p>
          </div>
          <Link href="/atlas" className="pv2-btn-cta" style={{ display: "inline-flex", alignItems: "center", minHeight: 50, padding: "0 24px", background: "#0B1A2A", color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none", borderRadius: 2 }}>
            Ouvrir l’Atlas →
          </Link>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .pv2-lead:hover { color: #E8A07F; }
        .pv2-card:hover { color: #9E431F; }
        .pv2-video:hover { color: #E8A07F; }
        .pv2-btn-cta:hover { background: #B6522F; }
      `}</style>
    </main>
  );
}
