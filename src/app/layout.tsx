import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mbàmbulaan MVP",
  description: "Plateforme de coordination pour les acteurs de la filiere halieutique."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
