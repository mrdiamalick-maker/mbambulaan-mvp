import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  // La livraison publique est une recette démontrable. Un déploiement relié à
  // un fournisseur OTP réel doit définir explicitement DEMO_MODE=false.
  env: {
    DEMO_MODE: process.env.DEMO_MODE ?? "true"
  }
};

export default nextConfig;
