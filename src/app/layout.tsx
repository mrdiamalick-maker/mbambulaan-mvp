import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mbàmbulaan — Coordination de la pêche artisanale",
  description: "Infrastructure numérique de coordination pour la pêche artisanale sénégalaise."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
