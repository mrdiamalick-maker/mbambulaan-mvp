import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  // Migration de l'ancien Espace État vers l'expérience privée V3.
  // Les redirections restent temporaires jusqu'à validation du lot : le
  // navigateur ne doit pas mémoriser définitivement une migration qui n'a
  // pas encore été intégrée ni déployée.
  async redirects() {
    return [
      { source: "/private-v3", destination: "/etat", permanent: false },
      { source: "/app/etat", destination: "/etat", permanent: false },
      { source: "/app/etat/territoires", destination: "/etat?ecran=atlas", permanent: false },
      { source: "/app/etat/situations", destination: "/etat?ecran=situations", permanent: false },
      { source: "/app/etat/arbitrages", destination: "/etat?ecran=arbitrages", permanent: false },
      { source: "/app/etat/programmes", destination: "/etat?ecran=programmes", permanent: false },
      { source: "/app/etat/rapport", destination: "/etat?ecran=resultats", permanent: false },
      { source: "/app/etat/redevabilite", destination: "/etat?ecran=arbitrages", permanent: false }
    ];
  },
  // La livraison publique est une recette démontrable. Un déploiement relié à
  // un fournisseur OTP réel doit définir explicitement DEMO_MODE=false.
  env: {
    DEMO_MODE: process.env.DEMO_MODE ?? "true"
  }
};

export default nextConfig;
