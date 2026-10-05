"use client";

// Atlas — Public V2, écran "04 Atlas". Remplace entièrement l'Atlas V1
// (vulgarisation territoriale uniquement : jamais d'alertes, d'arbitrages,
// de situations privées, de scores ou de cockpit — ça reste le registre
// de /app/atlas, hors scope Public).
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { AtlasMap } from "@/components/public/AtlasMap";
import { PHOTOS, TERRITORIES } from "@/data/public-v2-content";

export default function AtlasPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const facades = useMemo(() => {
    const order: string[] = [];
    const byZone = new Map<string, typeof TERRITORIES>();
    for (const t of TERRITORIES) {
      if (!byZone.has(t.zone)) {
        byZone.set(t.zone, []);
        order.push(t.zone);
      }
      byZone.get(t.zone)!.push(t);
    }
    return order.map((zone) => ({ zone, items: byZone.get(zone)! }));
  }, []);

  const selected = selectedSlug ? TERRITORIES.find((t) => t.slug === selectedSlug) ?? null : null;

  return (
    <main style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif", color: "#1E2A38", background: "#fff" }}>
      <PublicHeader />

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(20px,4vw,48px) 32px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(40px,5.2vw,68px)", lineHeight: 1, letterSpacing: "-.02em" }}>Atlas des territoires maritimes</h1>
          <p style={{ margin: 0, fontSize: 18.5, lineHeight: 1.55, color: "#3A4556" }}>Du fleuve Sénégal à la Casamance, découvrez les territoires qui font vivre la pêche artisanale. Sélectionnez un territoire sur la carte.</p>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px) clamp(48px,6vw,80px)", display: "flex", flexWrap: "wrap", borderTop: "1px solid rgba(11,26,42,.12)" }}>
        <div style={{ flex: "3 1 520px", minHeight: "clamp(420px,70vh,720px)", position: "relative", background: "#EFE7D6" }}>
          <AtlasMap territories={TERRITORIES} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
        </div>

        <aside style={{ flex: "2 1 340px", background: "#F7F3E9", display: "flex", flexDirection: "column", minHeight: 420 }}>
          {!selected ? (
            <div style={{ padding: "28px clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 6 }}>
              {facades.map((f) => (
                <div key={f.zone} style={{ display: "flex", flexDirection: "column", padding: "10px 0 6px" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#4C5566", paddingBottom: 4 }}>{f.zone}</span>
                  {f.items.map((t) => (
                    <button
                      key={t.slug}
                      onClick={() => setSelectedSlug(t.slug)}
                      className="pv2-card"
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "12px 0", background: "none", border: 0, borderBottom: "1px solid rgba(11,26,42,.12)", textAlign: "left", cursor: "pointer", color: "#0B1A2A", font: "inherit" }}
                    >
                      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, lineHeight: 1.2 }}>{t.name}</span>
                        <span style={{ fontSize: 14, color: "#4C5566" }}>{t.dominant}</span>
                      </span>
                      <span style={{ color: "#B6522F" }}>→</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "#12263A", position: "relative" }}>
                <Image src={PHOTOS[selected.img]} alt="" fill sizes="(min-width: 900px) 40vw, 100vw" style={{ objectFit: "cover" }} />
              </div>
              <div style={{ padding: "24px clamp(20px,3vw,32px) 32px", display: "flex", flexDirection: "column", gap: 16 }}>
                <button onClick={() => setSelectedSlug(null)} style={{ alignSelf: "flex-start", background: "none", border: 0, padding: 0, font: "600 14px var(--font-instrument-sans), sans-serif", color: "#4C5566", cursor: "pointer" }}>
                  ← Tous les territoires
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#B6522F" }}>{selected.zone}</span>
                  <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 38, lineHeight: 1.05 }}>{selected.name}</h2>
                  <span style={{ fontSize: 14.5, color: "#4C5566" }}>{selected.place}</span>
                </div>
                <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.55, color: "#1E2A38" }}>{selected.intro}</p>
                <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 15 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <dt style={{ fontWeight: 600 }}>Activité dominante</dt>
                    <dd style={{ margin: 0, color: "#3A4556" }}>{selected.dominant}</dd>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <dt style={{ fontWeight: 600 }}>Espèces représentatives</dt>
                    <dd style={{ margin: 0, color: "#3A4556" }}>{selected.species.map((s) => s.n).join(", ")}</dd>
                  </div>
                </dl>
                <Link href={`/atlas/${selected.slug}`} className="pv2-btn-cta" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", minHeight: 48, padding: "0 22px", background: "#0B1A2A", color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none", borderRadius: 2, marginTop: 4 }}>
                  Découvrir le territoire →
                </Link>
              </div>
            </div>
          )}
        </aside>
      </section>

      <section style={{ background: "#F7F3E9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px 24px", fontSize: 15, color: "#3A4556" }}>
          <span>L’Atlas présente des informations publiques et pédagogiques. Il s’enrichit progressivement.</span>
          <Link href="/partager" style={{ fontWeight: 600, color: "#B6522F", textDecoration: "none" }}>Signaler une information sur un territoire →</Link>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .pv2-card:hover { color: #9E431F; }
        .pv2-btn-cta:hover { background: #B6522F; }
      `}</style>
    </main>
  );
}
