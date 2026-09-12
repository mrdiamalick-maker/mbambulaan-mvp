import type { Metadata } from "next";
import "../../v3-template/fonts.css";
import "../../v3-template/private-v3.css";

// Shell dédié, isolé de src/app/app/layout.tsx (ProductProvider + bandeau
// de présentation guidée de l'Espace État existant). Décision documentée
// dans le rapport de lot : /app/private aurait hérité de ce layout legacy
// (tout /app/** le traverse), ce qui aurait fait fuir de l'état et de la
// navigation de l'ancien produit dans un template censé en être isolé
// (§3/§14/§19 du mandat). Cette route vit donc hors de /app.
//
// Typographie : Newsreader / IBM Plex Sans / IBM Plex Mono auto-hébergées
// via des fichiers .woff2 extraits OCTET POUR OCTET du bundle standalone
// lui-même (fonts.css) plutôt que via next/font/google — voir fonts.css
// pour le pourquoi (next/font sert sa propre copie des polices, aux
// métriques mesurablement différentes à l'écran).
export const metadata: Metadata = {
  title: "Mbàmbulaan — Environnement privé (template V3)",
  description: "Reconstruction fidèle du gabarit Claude Design V3 — phase template, données de démonstration."
};

export default function PrivateV3Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
