import { Suspense, type ReactNode } from "react";

export default function WhatsAppSimulationLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)]">
          <div className="mx-auto max-w-6xl rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--white)] p-6">
            <p className="text-sm font-semibold">Chargement du canal messaging Mbàmbulaan…</p>
          </div>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}
