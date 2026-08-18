import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PirogueGlyph, QuayGlyph, IceCrystalGlyph, SmokehouseGlyph, RouteGlyph, StallGlyph } from "./MaritimeGlyphs";
import type { PublicContentDomain } from "@/data/public-content";

const stages: { title: string; text: string; glyph: (props: { className?: string }) => React.ReactNode; domain: PublicContentDomain }[] = [
  { title: "Mer", text: "Pêche artisanale et industrielle, ressource et saisonnalité.", glyph: (p) => <PirogueGlyph {...p} />, domain: "Pêche & ressources" },
  { title: "Débarquement", text: "Quai, pesée, tri, première mise en marché.", glyph: (p) => <QuayGlyph {...p} />, domain: "Débarquement" },
  { title: "Conservation", text: "Glace, froid, préservation de la qualité.", glyph: (p) => <IceCrystalGlyph {...p} />, domain: "Conservation & froid" },
  { title: "Transformation", text: "Séchage, fumage, salage, conditionnement.", glyph: (p) => <SmokehouseGlyph {...p} />, domain: "Transformation & valorisation" },
  { title: "Transport", text: "Collecte, acheminement, logistique du froid.", glyph: (p) => <RouteGlyph {...p} />, domain: "Transport & logistique" },
  { title: "Marchés", text: "Vente locale, régionale, export.", glyph: (p) => <StallGlyph {...p} />, domain: "Commerce & débouchés" }
];

export function ValueChainDiagram() {
  return (
    <div className="pub-chain">
      {stages.map((stage, index) => (
        <Link key={stage.title} href={`/decouvrir?domaine=${encodeURIComponent(stage.domain)}`} className="pub-chain-stage">
          <span className="pub-chain-index">0{index + 1}</span>
          <span className="pub-chain-glyph">{stage.glyph({ className: "pub-chain-icon" })}</span>
          <strong className="pub-chain-title">{stage.title}</strong>
          <span className="pub-chain-text">{stage.text}</span>
          {index < stages.length - 1 && <ArrowRight size={16} className="pub-chain-arrow" aria-hidden />}
        </Link>
      ))}
    </div>
  );
}
