import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductWorkspace, type ProductCode } from "@/platform/product-suite/integrated-product-suite";

const productCodes: ProductCode[] = ["fisher", "cooperative", "business", "government", "development", "finance", "community", "knowledge", "atlas"];

export function generateStaticParams() {
  return productCodes.map((code) => ({ code }));
}

export default async function ProductWorkspacePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!productCodes.includes(code as ProductCode)) notFound();
  const product = getProductWorkspace(code as ProductCode);
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] p-5 text-[var(--mb-neutral-900)] sm:p-8 lg:p-10">
      <div className="mx-auto max-w-[84rem]">
        <Link href="/produit" className="text-xs font-bold text-[var(--mb-ocean-700)]">← Suite produit</Link>
        <header className="mt-5 border border-[var(--mb-neutral-200)] bg-white p-6 sm:p-8">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">{product.actor}</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--mb-navy-900)] sm:text-4xl">{product.name}</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--mb-neutral-600)]">{product.purpose}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Fact label="Valeur métier" value={product.value} />
            <Fact label="Payeur durable" value={product.payer} />
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,.7fr)]">
          <div className="border border-[var(--mb-neutral-200)] bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--mb-navy-900)]">Poste de travail</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {product.capabilities.map((capability) => (
                <article key={capability.code} className="border border-[var(--mb-neutral-200)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{capability.name}</h3>
                    <span className="rounded border border-[var(--mb-neutral-300)] px-2 py-1 font-mono text-[8px] uppercase">
                      {capability.status === "available" ? "Disponible" : capability.status === "attention" ? "À finaliser" : capability.status === "blocked" ? "Bloqué" : "Planifié"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[var(--mb-neutral-600)]">{capability.description}</p>
                  <p className="mt-4 text-xs font-semibold text-[var(--mb-ocean-700)]">{capability.operationalValue}</p>
                  <Link href={capability.href} className="mt-5 inline-flex text-xs font-bold text-[var(--mb-navy-900)]">Ouvrir →</Link>
                </article>
              ))}
            </div>
          </div>

          <aside className="border border-[var(--mb-neutral-200)] bg-white p-6">
            <h2 className="text-xl font-semibold text-[var(--mb-navy-900)]">Parcours principal</h2>
            <ol className="mt-5 space-y-3">
              {product.primaryJourney.map((step, index) => (
                <li key={step} className="flex gap-3 border-b border-[var(--mb-neutral-200)] pb-3 text-sm last:border-0">
                  <span className="font-mono text-[var(--mb-ocean-600)]">{String(index + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 border-t border-[var(--mb-neutral-200)] pt-5">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">Dépendances produit</p>
              <p className="mt-3 text-sm leading-6 text-[var(--mb-neutral-600)]">
                {product.dependencies.length ? product.dependencies.join(" · ") : "Aucune dépendance obligatoire"}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="border border-[var(--mb-neutral-200)] p-4"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-sm leading-6">{value}</p></div>;
}
