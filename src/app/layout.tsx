import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { PwaRegistration } from "@/components/providers/PwaRegistration";
import { PublicAnalyticsTracker } from "@/components/public/PublicAnalyticsTracker";
import "./globals.css";
import "./brand.css";
import "./public-design-system.css";
import "./produit-design-system.css";
import "./etat-design-system.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = "Mbàmbulaan — Connecter les acteurs. Coordonner les territoires. Faire circuler la valeur.";
  const description = "Mbàmbulaan construit une infrastructure de connaissance et de coordination pour l’économie maritime, en commençant par la filière halieutique sénégalaise.";

  return {
    metadataBase,
    title,
    description,
    manifest: "/manifest.webmanifest",
    openGraph: {
      title,
      description,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Mbàmbulaan, infrastructure de coordination de la filière halieutique." }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.jpg"]
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071d26"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <PwaRegistration />
        <PublicAnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
