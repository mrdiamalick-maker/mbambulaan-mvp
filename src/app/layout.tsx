import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { PwaRegistration } from "@/components/providers/PwaRegistration";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = "Mbàmbulaan | Coordination de la pêche artisanale";
  const description = "Infrastructure numérique de coordination territoriale pour la pêche artisanale sénégalaise.";

  return {
    metadataBase,
    title,
    description,
    manifest: "/manifest.webmanifest",
    openGraph: {
      title,
      description,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Mbàmbulaan relie la filière halieutique sénégalaise." }]
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
  themeColor: "#075466"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><PwaRegistration />{children}</body>
    </html>
  );
}
