import type { Metadata } from "next";
import { CoordinationDemoProvider } from "@/components/coordination-demo/CoordinationDemoProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mbàmbulaan — Coordonner les réponses du terrain",
  description: "Mbàmbulaan aide les acteurs d’un territoire à remonter une difficulté, organiser sa prise en charge et suivre sa résolution."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <CoordinationDemoProvider>{children}</CoordinationDemoProvider>
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
