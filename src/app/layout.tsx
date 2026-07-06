import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mbàmbulaan — Coordination de la pêche artisanale",
  description: "Infrastructure numérique de coordination pour la pêche artisanale sénégalaise."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <footer className="border-t border-cyan-100 bg-white px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-7xl text-sm font-bold text-slate-600">
            <p>2026 Mbàmbulaan, une solution de Epic Conseil.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
