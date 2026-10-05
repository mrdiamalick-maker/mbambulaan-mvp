"use client";

// PublicHeader — Public V2, iso-design depuis Mbambulaan_Public_V2.html
// (Claude Design, autorité visuelle unique). Remplace entièrement la
// composition V1 (nav Découvrir/Territoires/Opportunités/Mbàmbulaan,
// fond sombre/clair variable) : nav Découvrir/Atlas/Mbàmbulaan/Contact,
// toujours blanc, sticky, CTA "Partager une information" + lien "Espace
// privé". `dark` reste accepté (12 appelants) mais n'a plus d'effet —
// le header V2 est toujours blanc, jamais de variante sombre.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/decouvrir", label: "Découvrir" },
  { href: "/atlas", label: "Atlas" },
  { href: "/mbambulaan", label: "Mbàmbulaan" },
  { href: "/contact", label: "Contact" }
];

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature kept for the 12 existing callers; V2 header is always white
export function PublicHeader(_props: { dark?: boolean }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fermer le tiroir mobile à chaque changement de route (même discipline
  // que Gallery.tsx : jamais un tiroir qui reste ouvert après navigation).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 60, background: "#fff", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)", height: 72, display: "flex", alignItems: "center", gap: 20 }}>
        <Link href="/" aria-label="Mbàmbulaan — accueil" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#0B1A2A", flex: "none" }}>
          <span style={{ width: 38, height: 38, background: "#0B1A2A", display: "grid", placeItems: "center", fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 24, color: "#E8A07F", lineHeight: 1 }}>M</span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em" }}>Mbàmbulaan</span>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: "#4C5566", marginTop: 2 }}>Économie maritime · Sénégal</span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="pv2-nav-wide" style={{ alignItems: "center", gap: 2, marginLeft: "auto", height: "100%" }}>
          {NAV.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined} style={{ position: "relative", display: "flex", alignItems: "center", height: "100%", padding: "0 16px", fontSize: 15, fontWeight: 600, textDecoration: "none", color: current ? "#0B1A2A" : "#3A4556" }} className="pv2-nav-link">
                {item.label}
                <span style={{ position: "absolute", left: 16, right: 16, bottom: -1, height: 3, background: "#B6522F", opacity: current ? 1 : 0 }} />
              </Link>
            );
          })}
        </nav>
        <div className="pv2-nav-wide" style={{ alignItems: "center", gap: 18, marginLeft: 16 }}>
          <Link href="/connexion" style={{ fontSize: 13.5, fontWeight: 500, color: "#4C5566", textDecoration: "none" }} className="pv2-link-hover">Espace privé</Link>
          <Link href="/partager" style={{ display: "inline-flex", alignItems: "center", minHeight: 42, padding: "0 18px", background: "#0B1A2A", fontSize: 14, fontWeight: 600, textDecoration: "none", color: "#fff", borderRadius: 2 }} className="pv2-cta-hover">Partager une information</Link>
        </div>

        <button
          onClick={() => setDrawerOpen((open) => !open)}
          aria-label="Menu"
          aria-expanded={drawerOpen}
          className="pv2-burger"
          style={{ marginLeft: "auto", width: 48, height: 48, display: "grid", placeItems: "center", background: "transparent", border: "1px solid rgba(11,26,42,.25)", borderRadius: 2, cursor: "pointer", flex: "none" }}
        >
          <span style={{ display: "flex", flexDirection: "column", gap: 5, width: 18 }}>
            <span style={{ height: 1.5, background: "#0B1A2A", display: "block", transform: drawerOpen ? "translateY(6.5px) rotate(45deg)" : "none", transition: "transform .25s" }} />
            <span style={{ height: 1.5, background: "#0B1A2A", display: "block", opacity: drawerOpen ? 0 : 1 }} />
            <span style={{ height: 1.5, background: "#0B1A2A", display: "block", transform: drawerOpen ? "translateY(-6.5px) rotate(-45deg)" : "none", transition: "transform .25s" }} />
          </span>
        </button>
      </div>

      {drawerOpen && (
        <div role="dialog" aria-label="Menu" style={{ position: "fixed", inset: "72px 0 0 0", zIndex: 59, background: "#0B1A2A", color: "#F7F3E9", overflowY: "auto", padding: "16px clamp(20px,5vw,48px) 40px", display: "flex", flexDirection: "column", gap: 28 }}>
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0", borderBottom: "1px solid rgba(247,243,233,.14)", fontFamily: "var(--font-newsreader), serif", fontSize: 32, textDecoration: "none", color: "#F7F3E9" }}>
                {item.label}<span style={{ font: "400 15px var(--font-instrument-sans), sans-serif", color: "#E8A07F" }}>→</span>
              </Link>
            ))}
          </nav>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/partager" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 52, background: "#B6522F", color: "#fff", fontWeight: 600, textDecoration: "none", borderRadius: 2 }}>Partager une information</Link>
            <Link href="/connexion" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 48, color: "rgba(247,243,233,.8)", fontWeight: 500, textDecoration: "none" }}>Espace privé →</Link>
          </div>
        </div>
      )}

      <style>{`
        .pv2-nav-wide { display: none; }
        .pv2-burger { display: grid; }
        @media (min-width: 1000px) {
          .pv2-nav-wide { display: flex; }
          .pv2-burger { display: none; }
        }
        .pv2-nav-link:hover, .pv2-link-hover:hover { color: #9E431F; }
        .pv2-cta-hover:hover { background: #B6522F; }
      `}</style>
    </header>
  );
}
