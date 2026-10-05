"use client";

// Lecteur vidéo placeholder — Public V2, écran "03 Contenu". Aucun lecteur
// (YouTube/Vimeo/hébergement propre) n'est branché à ce stade : l'état
// "lecture" l'annonce honnêtement plutôt que de simuler une vidéo.
import { useState } from "react";
import Image from "next/image";

export function ContentVideoHero({ img, alt, dur }: { img: string; alt: string; dur?: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(0px,4vw,48px)" }}>
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#0B1A2A", overflow: "hidden" }}>
        {!playing ? (
          <>
            <Image src={img} alt={alt} fill sizes="100vw" style={{ objectFit: "cover", opacity: 0.85 }} priority />
            <button
              onClick={() => setPlaying(true)}
              aria-label="Lire la vidéo"
              style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "transparent", border: 0, cursor: "pointer" }}
            >
              <span style={{ width: 84, height: 84, borderRadius: "50%", background: "#F7F3E9", display: "grid", placeItems: "center", color: "#0B1A2A", fontSize: 24, paddingLeft: 5 }}>▶</span>
            </button>
            {dur && <span style={{ position: "absolute", right: 16, bottom: 16, padding: "4px 10px", background: "rgba(11,26,42,.85)", fontSize: 13, fontWeight: 600, color: "#F7F3E9" }}>{dur}</span>}
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#F7F3E9", textAlign: "center", padding: 24 }}>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26 }}>Lecteur vidéo</span>
            <span style={{ fontSize: 14, color: "rgba(247,243,233,.7)", maxWidth: 420 }}>Emplacement du lecteur intégré (YouTube, Vimeo ou hébergement Mbàmbulaan), sous-titres français et wolof.</span>
            <button
              onClick={() => setPlaying(false)}
              style={{ marginTop: 8, background: "none", border: "1px solid rgba(247,243,233,.4)", color: "#F7F3E9", padding: "10px 16px", font: "600 14px var(--font-instrument-sans), sans-serif", borderRadius: 2, cursor: "pointer" }}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
