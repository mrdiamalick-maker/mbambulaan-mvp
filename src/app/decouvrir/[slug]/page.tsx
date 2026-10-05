import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ContentVideoHero } from "@/components/public/ContentVideoHero";
import { CONTENT, PHOTOS, THEMES, contentBySlug, territoryBySlug } from "@/data/public-v2-content";

export function generateStaticParams() {
  return CONTENT.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = contentBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.title} | Mbàmbulaan Découvrir`,
    description: item.dek,
    alternates: { canonical: `/decouvrir/${item.slug}` },
    openGraph: { title: item.title, description: item.dek }
  };
}

function themeLabel(theme: string) {
  return THEMES.find(([key]) => key === theme)?.[1] ?? theme;
}

export default async function ContentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = contentBySlug(slug);
  if (!item) notFound();

  const related = CONTENT.filter((c) => c.theme === item.theme && c.slug !== item.slug).slice(0, 3);
  const meta = item.dur ? `${item.date} · ${item.dur}` : item.read ? `${item.date} · ${item.read} de lecture` : item.date;

  return (
    <main style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif", color: "#1E2A38", background: "#fff" }}>
      <PublicHeader />

      <header style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(36px,5vw,64px) clamp(20px,4vw,48px) 36px", display: "flex", flexDirection: "column", gap: 20 }}>
        <Link href="/decouvrir" className="pv2-back" style={{ alignSelf: "flex-start", fontSize: 14.5, fontWeight: 600, color: "#4C5566", textDecoration: "none" }}>← Découvrir</Link>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#B6522F" }}>{item.type} · {themeLabel(item.theme)}</p>
        <h1 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(38px,5vw,64px)", lineHeight: 1.04, letterSpacing: "-.02em" }}>{item.title}</h1>
        <p style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontSize: "clamp(20px,2vw,25px)", lineHeight: 1.4, color: "#3A4556" }}>{item.dek}</p>
        <p style={{ margin: 0, fontSize: 14, color: "#4C5566" }}>{meta}</p>
      </header>

      {item.type === "Vidéo" ? (
        <ContentVideoHero img={PHOTOS[item.img]} alt={item.caption ?? item.title} dur={item.dur} />
      ) : (
        <figure style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(0px,4vw,48px)" }}>
          <div style={{ aspectRatio: "21/10", overflow: "hidden", background: "#12263A", position: "relative" }}>
            <Image src={PHOTOS[item.img]} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} priority />
          </div>
          {item.caption && <figcaption style={{ padding: "10px 0 0", fontSize: 13.5, color: "#4C5566" }}>{item.caption}</figcaption>}
        </figure>
      )}

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(40px,5vw,64px) clamp(20px,4vw,48px) 24px", display: "flex", flexDirection: "column", gap: 24, fontSize: 18.5, lineHeight: 1.7, color: "#1E2A38" }}>
        {item.blocks.map((b, i) => {
          if (b.t === "p") return <p key={i} style={{ margin: 0 }}>{b.text}</p>;
          if (b.t === "h") return <h2 key={i} style={{ margin: "20px 0 0", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 30, lineHeight: 1.2, color: "#0B1A2A" }}>{b.text}</h2>;
          if (b.t === "steps")
            return (
              <ol key={i} style={{ listStyle: "none", margin: "8px 0", padding: 0, display: "flex", flexDirection: "column", borderTop: "1px solid rgba(11,26,42,.14)" }}>
                {b.items.map((s, j) => (
                  <li key={j} style={{ display: "flex", gap: 20, padding: "14px 0", borderBottom: "1px solid rgba(11,26,42,.14)", fontSize: 16.5, lineHeight: 1.5 }}>
                    <span style={{ flex: "none", width: 150, fontWeight: 600, color: "#0B1A2A" }}>{s.n}</span>
                    <span style={{ color: "#3A4556" }}>{s.d}</span>
                  </li>
                ))}
              </ol>
            );
          if (b.t === "figure")
            return (
              <figure key={i} style={{ margin: "16px 0" }}>
                <div style={{ aspectRatio: "3/2", overflow: "hidden", background: "#12263A", position: "relative" }}>
                  <Image src={PHOTOS[b.img]} alt="" fill sizes="(min-width: 760px) 720px, 100vw" style={{ objectFit: "cover" }} />
                </div>
                <figcaption style={{ paddingTop: 10, fontSize: 14, lineHeight: 1.5, color: "#4C5566" }}>{b.caption}</figcaption>
              </figure>
            );
          if (b.t === "quote")
            return (
              <blockquote key={i} style={{ margin: "20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(26px,3vw,34px)", lineHeight: 1.3, color: "#0B1A2A" }}>« {b.text} »</p>
                <cite style={{ fontStyle: "normal", fontSize: 14.5, fontWeight: 600, color: "#B6522F" }}>— {b.who}</cite>
              </blockquote>
            );
          if (b.t === "place") {
            const terr = territoryBySlug(b.terr);
            if (!terr) return null;
            return (
              <Link key={i} href={`/atlas/${terr.slug}`} className="pv2-card" style={{ display: "flex", gap: 20, alignItems: "stretch", margin: "12px 0", background: "#F7F3E9", textDecoration: "none", color: "#0B1A2A" }}>
                <span style={{ flex: "none", width: "clamp(100px,24%,160px)", overflow: "hidden", background: "#12263A", position: "relative" }}>
                  <Image src={PHOTOS[terr.img]} alt="" fill sizes="160px" style={{ objectFit: "cover" }} />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 6, padding: "18px 18px 18px 0", fontSize: 15.5, lineHeight: 1.5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#B6522F" }}>Territoire · Atlas</span>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 23, lineHeight: 1.2 }}>{terr.name}</span>
                  <span style={{ color: "#3A4556" }}>{b.text}</span>
                </span>
              </Link>
            );
          }
          if (b.t === "doc")
            return (
              <Link key={i} href="/contact?profil=info" className="pv2-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0", borderTop: "1px solid #0B1A2A", borderBottom: "1px solid rgba(11,26,42,.14)", textDecoration: "none", color: "#0B1A2A", fontSize: 16 }}>
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 600 }}>{b.title}</span>
                  <span style={{ fontSize: 14, color: "#4C5566" }}>{b.meta} · sur demande</span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#B6522F", flex: "none" }}>Nous contacter →</span>
              </Link>
            );
          return null;
        })}
        <p style={{ margin: "16px 0 0", paddingTop: 20, borderTop: "1px solid rgba(11,26,42,.14)", fontSize: 15.5, color: "#3A4556" }}>
          Vous connaissez ce sujet de près ? <Link href="/partager" style={{ color: "#B6522F", fontWeight: 600 }}>Partager une information</Link>
        </p>
      </div>

      {related.length > 0 && (
        <section style={{ borderTop: "1px solid rgba(11,26,42,.1)", marginTop: "clamp(40px,5vw,72px)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 32 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(28px,3vw,38px)" }}>À lire aussi</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "clamp(24px,3vw,40px)" }}>
              {related.map((c) => (
                <Link key={c.slug} href={`/decouvrir/${c.slug}`} className="pv2-card" style={{ display: "flex", flexDirection: "column", gap: 12, textDecoration: "none", color: "#0B1A2A" }}>
                  <span style={{ display: "block", aspectRatio: "3/2", overflow: "hidden", background: "#12263A", position: "relative" }}>
                    <Image src={PHOTOS[c.img]} alt="" fill sizes="(min-width: 900px) 30vw, 100vw" style={{ objectFit: "cover" }} />
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#B6522F" }}>{c.type} · {themeLabel(c.theme)}</span>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 23, lineHeight: 1.18 }}>{c.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicFooter />

      <style>{`
        .pv2-back:hover { color: #0B1A2A; }
        .pv2-card:hover { color: #9E431F; }
      `}</style>
    </main>
  );
}
