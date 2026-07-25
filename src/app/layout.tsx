import type { Metadata, Viewport } from "next";
import { PwaRegistration } from "@/components/providers/PwaRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mbàmbulaan | Coordination de la pêche artisanale",
  description: "Infrastructure numérique de coordination territoriale pour la pêche artisanale sénégalaise.",
  manifest: "/manifest.webmanifest"
};

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
