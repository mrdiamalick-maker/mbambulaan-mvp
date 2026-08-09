import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { CoordinationCapture } from "@/components/providers/CoordinationCapture";
import { CoordinationLoopProvider } from "@/components/providers/CoordinationLoopProvider";
import { PwaRegistration } from "@/components/providers/PwaRegistration";
import "./globals.css";
import "./brand.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = "Mbàmbulaan | La filière reliée";
  const description = "Infrastructure numérique de coordination de la pêche artisanale sénégalaise : territoires, acteurs, opérations, confiance et décision.";

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
        <CoordinationLoopProvider>
          <CoordinationCapture />
          {children}
        </CoordinationLoopProvider>
      </body>
    </html>
  );
}
