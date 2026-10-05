"use client";

// PresentationView — Mode Présentation réel, mandat "Intégration /etat
// V5 + Corrections Produit" §13 : une narration décisionnelle, pas un
// plein écran du tableau de bord. Moins de KPI, plus de message —
// utilisable devant le Ministre ou une direction de programme.
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { buildPresentationSlides } from "../lib/presentation-bridge";
import { V3_FONT_MONO, V3_FONT_SERIF } from "../theme";

export function PresentationView({ onClose }: { onClose: () => void }) {
  const slides = buildPresentationSlides();
  const [index, setIndex] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const slide = slides[index];

  // §18 du mandat — retour du focus à la fermeture.
  useEffect(() => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => lastFocusedRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIndex((i) => Math.min(slides.length - 1, i + 1));
      if (event.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, slides.length]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Mode présentation" style={{ position: "fixed", inset: 0, zIndex: 300, background: "#0B1A2A", color: "#F7F3E9", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 28px" }}>
        <span style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(247,243,233,.5)", flex: 1 }}>Mode présentation · {index + 1} / {slides.length}</span>
        <button onClick={onClose} ref={closeButtonRef} aria-label="Quitter le mode présentation" style={{ border: "1px solid rgba(247,243,233,.3)", background: "transparent", color: "#F7F3E9", cursor: "pointer", borderRadius: 999, padding: 7, display: "flex" }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10vw", maxWidth: 980, margin: "0 auto", width: "100%" }}>
        <div style={{ fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "#DE9C74", marginBottom: 18 }}>{slide.kicker}</div>
        <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: "clamp(28px,4.2vw,52px)", lineHeight: 1.12, margin: "0 0 30px", maxWidth: "26ch" }}>{slide.title}</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {slide.lines.map((line, i) => (
            <p key={i} style={{ margin: 0, fontSize: "clamp(15px,1.6vw,19px)", lineHeight: 1.6, color: "rgba(247,243,233,.86)", maxWidth: "70ch" }}>{line}</p>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "22px 28px 30px" }}>
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} aria-label="Diapositive précédente" style={{ border: "1px solid rgba(247,243,233,.3)", background: "transparent", color: index === 0 ? "rgba(247,243,233,.3)" : "#F7F3E9", cursor: index === 0 ? "default" : "pointer", borderRadius: 999, padding: 9, display: "flex" }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ display: "flex", gap: 7 }}>
          {slides.map((s, i) => (
            <button key={s.kicker} onClick={() => setIndex(i)} aria-label={`Aller à la diapositive ${i + 1}`} aria-current={i === index} style={{ width: 8, height: 8, borderRadius: "50%", border: 0, cursor: "pointer", background: i === index ? "#DE9C74" : "rgba(247,243,233,.25)" }} />
          ))}
        </div>
        <button onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))} disabled={index === slides.length - 1} aria-label="Diapositive suivante" style={{ border: "1px solid rgba(247,243,233,.3)", background: "transparent", color: index === slides.length - 1 ? "rgba(247,243,233,.3)" : "#F7F3E9", cursor: index === slides.length - 1 ? "default" : "pointer", borderRadius: 999, padding: 9, display: "flex" }}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div style={{ textAlign: "center", paddingBottom: 14, fontFamily: V3_FONT_MONO, fontSize: 10, color: "rgba(247,243,233,.35)" }}>
        Mbàmbulaan — données du Demo World, projet à valider.
      </div>
    </div>
  );
}
