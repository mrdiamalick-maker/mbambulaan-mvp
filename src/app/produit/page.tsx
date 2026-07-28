import Link from "next/link";
import { ProductSuiteConsole } from "@/components/product-suite/ProductSuiteConsole";

export default function ProductSuitePage() {
  return (
    <>
      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] px-4 py-4 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Commencer par le MVP</p>
            <p className="mt-1 text-sm text-white/75">Tester la transaction, l’incident et la viabilité avant d’explorer la vision complète.</p>
          </div>
          <Link href="/demonstration-pilote" className="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[var(--mb-navy-900)]">
            Ouvrir la démonstration pilote
          </Link>
        </div>
      </section>
      <ProductSuiteConsole />
    </>
  );
}
