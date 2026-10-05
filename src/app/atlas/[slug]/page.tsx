import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { TerritoryMiniMap } from "@/components/public/TerritoryMiniMap";
import { PHOTOS, TERRITORIES, contentForTerritory, territoryBySlug } from "@/data/public-v2-content";

export function generateStaticParams() {
  return TERRITORIES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = territoryBySlug(slug);
  if (!t) return {};
  return {
    title: `${t.name} | Atlas Mbàmbulaan`,
    description: t.intro,
    alternates: { canonical: `/atlas/${t.slug}` },
    openGraph: { title: t.name, description: t.intro }
  };
}

export default async function TerritoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = territoryBySlug(slug);
  if (!t) notFound();

  const contents = contentForTerritory(t.slug);

  return (
    <main style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif", color: "#1E2A38", background: "#fff" }}>
      <PublicHeader />

      <section style={{ position: "relative", background: "#0B1A2A", color: "#F7F3E9", minHeight: "clamp(420px,62vh,640px)", display: "flex", overflow: "hidden" }}>
        <Image src={PHOTOS[t.img]} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} priority />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(11,26,42,.92) 0%,rgba(11,26,42,.35) 55%,rgba(11,26,42,.25) 100%)" }} />
        <div style={{ position: "relative", maxWidth: 1280, width: "100%", margin: "0 auto", padding: "28px clamp(20px,4vw,48px) clamp(40px,5vw,64px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
          <Link href="/atlas" className="pv2-back-light" style={{ alignSelf: "flex-start", fontSize: 14.5, fontWeight: 600, color: "#F7F3E9", textDecoration: "none" }}>← Atlas</Link>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 820 }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#E8A07F" }}>{t.zone}</span>
            <h1 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(48px,7vw,96px)", lineHeight: 0.98, letterSpacing: "-.025em" }}>{t.name}</h1>
            <p style={{ margin: 0, fontSize: "clamp(17px,1.6vw,20px)", lineHeight: 1.5, color: "rgba(247,243,233,.88)", maxWidth: 640 }}>{t.intro}</p>
          </div>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,96px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,72px)" }}>
          <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(28px,3vw,38px)" }}>Où sommes-nous ?</h2>
            <p style={{ margin: 0, fontSize: 17.5, lineHeight: 1.6, color: "#3A4556" }}>{t.where}</p>
            <p style={{ margin: 0, fontSize: 14.5, color: "#4C5566" }}>{t.place}</p>
          </div>
          <div style={{ flex: "1 1 420px", aspectRatio: "4/3", position: "relative", background: "#EFE7D6" }}>
            <TerritoryMiniMap lat={t.lat} lon={t.lon} name={t.name} />
          </div>
        </div>
      </section>

      <section style={{ background: "#F7F3E9" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(56px,7vw,96px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(28px,3vw,38px)" }}>Ce qui caractérise le territoire</h2>
          <p style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontSize: "clamp(21px,2vw,25px)", lineHeight: 1.5, color: "#1E2A38" }}>{t.charac}</p>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,96px) clamp(20px,4vw,48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "clamp(32px,4vw,56px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 28, paddingBottom: 12, borderBottom: "1px solid #0B1A2A" }}>Activités</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 16.5, color: "#1E2A38" }}>
              {t.activities.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 28, paddingBottom: 12, borderBottom: "1px solid #0B1A2A" }}>Espèces &amp; ressources</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 16.5, color: "#1E2A38" }}>
              {t.species.map((s) => (
                <li key={s.n} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span>{s.n}</span>
                  {s.w && <span style={{ fontStyle: "italic", color: "#4C5566", fontFamily: "var(--font-newsreader), serif" }}>{s.w}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 28, paddingBottom: 12, borderBottom: "1px solid #0B1A2A" }}>Sites &amp; infrastructures</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 16.5, color: "#1E2A38" }}>
              {t.sites.map((s) => (
                <li key={s.n} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span>{s.n}</span>
                  <span style={{ fontSize: 13.5, color: "#4C5566" }}>{s.t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {contents.length > 0 && (
        <section style={{ borderTop: "1px solid rgba(11,26,42,.1)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,96px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 32 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(28px,3vw,38px)" }}>À lire et à voir</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: "clamp(24px,3vw,40px)" }}>
              {contents.map((c) => (
                <Link key={c.slug} href={`/decouvrir/${c.slug}`} className="pv2-card" style={{ display: "flex", flexDirection: "column", gap: 12, textDecoration: "none", color: "#0B1A2A" }}>
                  <span style={{ position: "relative", display: "block", aspectRatio: "3/2", overflow: "hidden", background: "#12263A" }}>
                    <Image src={PHOTOS[c.img]} alt="" fill sizes="(min-width: 900px) 30vw, 100vw" style={{ objectFit: "cover" }} />
                    {c.type === "Vidéo" && (
                      <span style={{ position: "absolute", left: 14, bottom: 14, width: 44, height: 44, borderRadius: "50%", background: "#F7F3E9", display: "grid", placeItems: "center", color: "#0B1A2A", fontSize: 14, paddingLeft: 3 }}>▶</span>
                    )}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#B6522F" }}>{c.type}</span>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 23, lineHeight: 1.18 }}>{c.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ background: "#0B1A2A", color: "#F7F3E9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(28px,3vw,38px)", lineHeight: 1.15 }}>Vous connaissez {t.name} ?</h2>
            <p style={{ margin: 0, fontSize: 16.5, color: "rgba(247,243,233,.82)" }}>Partagez une situation, une information ou une correction sur ce territoire.</p>
          </div>
          <Link href={`/partager?territoire=${t.slug}`} className="pv2-btn-rust" style={{ display: "inline-flex", alignItems: "center", minHeight: 52, padding: "0 26px", background: "#B6522F", color: "#fff", fontWeight: 600, fontSize: 15.5, textDecoration: "none", borderRadius: 2 }}>
            Contribuer sur ce territoire →
          </Link>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .pv2-back-light:hover { color: #E8A07F; }
        .pv2-card:hover { color: #9E431F; }
        .pv2-btn-rust:hover { background: #9E431F; }
      `}</style>
    </main>
  );
}
