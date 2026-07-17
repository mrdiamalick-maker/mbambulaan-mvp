import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mbàmbulaan — Coordination maritime nationale",
  description: "Mbàmbulaan rend visible le cycle de la pêche artisanale sénégalaise et transforme chaque étape en preuve, financement et décision coordonnée."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <footer className="border-t border-white/10 bg-[var(--mb-navy-900)] px-5 py-7 text-white sm:px-8">
          <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-3 text-[10px] text-white/45">
            <p>Copyright 2026 Mbàmbulaan, une solution d’Epic Conseil.</p>
            <p className="font-mono uppercase tracking-[0.08em]">Coordination de la pêche artisanale sénégalaise</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
