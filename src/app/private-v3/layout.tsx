import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import "../../v3-template/private-v3.css";

// Shell dédié, isolé de src/app/app/layout.tsx (ProductProvider + bandeau
// de présentation guidée de l'Espace État existant). Décision documentée
// dans le rapport de lot : /app/private aurait hérité de ce layout legacy
// (tout /app/** le traverse), ce qui aurait fait fuir de l'état et de la
// navigation de l'ancien produit dans un template censé en être isolé
// (§3/§14/§19 du mandat). Cette route vit donc hors de /app.
//
// Typographie : même trio que le standalone (Newsreader / IBM Plex Sans /
// IBM Plex Mono), mais via next/font/google plutôt que le <link>
// fonts.googleapis.com du prototype — auto-hébergé au build, aucune
// requête réseau runtime (précédent déjà posé pour ces mêmes familles par
// src/app/app/etat/layout.tsx). Variables scopées à cette route seule via
// les classes .variable posées sur le wrapper ci-dessous.
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"], variable: "--pv3-font-display" });
const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--pv3-font-body" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--pv3-font-mono" });

export const metadata: Metadata = {
  title: "Mbàmbulaan — Environnement privé (template V3)",
  description: "Reconstruction fidèle du gabarit Claude Design V3 — phase template, données de démonstration."
};

export default function PrivateV3Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${newsreader.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} contents`}>{children}</div>;
}
