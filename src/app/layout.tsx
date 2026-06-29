import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mbàmbulaan | Operating System de coordination",
  description:
    "Plateforme premium de coordination pour transformer les signaux terrain de la pêche artisanale sénégalaise en décisions, preuves et rapports."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
