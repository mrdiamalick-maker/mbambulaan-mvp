"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DemoProfileSwitcher, type ActiveDemoAccess } from "@/components/access/DemoProfileSwitcher";
import type { IntegratedProductSuiteSnapshot, ProductCode } from "@/platform/product-suite/integrated-product-suite";

const productOrder: ProductCode[] = ["fisher", "cooperative", "business", "government", "finance", "knowledge", "atlas"];

export function ProductSuiteConsole() {
  const [suite, setSuite] = useState<IntegratedProductSuiteSnapshot>();
  const [selected, setSelected] = useState<ProductCode>("government");
  const [activeAccess, setActiveAccess] = useState<ActiveDemoAccess>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  async function refresh() {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/v1/products", { cache: "no-store" });
      if (!response.ok) throw new Error("Impossible de charger la suite produit.");
      setSuite(await response.json() as IntegratedProductSuiteSnapshot);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const handleAccessChange = useCallback((access?: ActiveDemoAccess) => {
    setActiveAccess(access);
    const firstProduct = access?.identity.productCodes[0] as ProductCode | undefined;
    if (firstProduct) setSelected(firstProduct);
  }, []);

  const accessibleCodes = useMemo(() => {
    if (!activeAccess) return [] as ProductCode[];
    return productOrder.filter((code) => activeAccess.identity.productCodes.includes(code));
  }, [activeAccess]);

  const product = suite?.products.find((item) => item.code === selected && accessibleCodes.includes(item.code));

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-[90rem] px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Produit complet testable</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Suite Mbàmbulaan intégrée</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Choisissez un acteur pour tester son espace, ses permissions et son périmètre territorial.</p>
            </div>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
              <DemoProfileSwitcher onChange={handleAccessChange} />
              <button type="button" onClick={() => void refresh()} className="h-11 rounded bg-white px-4 text-xs font-bold text-[var(--mb-navy-900)]">Actualiser</button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[90rem] px-5 py-8 sm:px-8 lg:px-10">
        {error ? <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}
        {loading && !suite ? <p className="text-sm text-[var(--mb-neutral-500)]">Chargement du runtime et des produits…</p> : null}

        {!activeAccess ? (
          <section className="border border-[var(--mb-neutral-200)] bg-white p-8">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">Accès multi-acteurs</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--mb-navy-900)]">Sélectionnez un profil de démonstration</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mb-neutral-600)]">Le portail affichera uniquement les produits autorisés pour cet acteur. Les opérations sensibles restent également contrôlées côté serveur.</p>
          </section>
        ) : null}

        {suite && activeAccess ? (
          <>
            <section className="mb-6 border border-[var(--mb-ocean-200)] bg-[var(--mb-foam)] p-5">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-700)]">Session active</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[var(--mb-navy-900)]">{activeAccess.identity.displayName}</p>
                  <p className="text-xs text-[var(--mb-neutral-600)]">{activeAccess.identity.organizationName} · {activeAccess.session.activeTerritoryId}</p>
                </div>
                <p className="text-xs text-[var(--mb-neutral-500)]">Session valable jusqu’au {new Date(activeAccess.session.expiresAt).toLocaleString("fr-FR")}</p>
              </div>
            </section>

            <section className="grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-3 xl:grid-cols-6">
              <Metric label="Runtime" value={suite.runtime.running ? "Actif" : "Arrêté"} />
              <Metric label="Produits autorisés" value={accessibleCodes.length.toString()} />
              <Metric label="Événements en attente" value={suite.runtime.pendingEvents.toString()} />
              <Metric label="Échecs" value={suite.runtime.failedEvents.toString()} />
              <Metric label="Signaux ouverts" value={suite.runtime.openSignals.toString()} />
              <Metric label="Insights Atlas" value={suite.runtime.atlasInsights.toString()} />
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <nav className="border border-[var(--mb-neutral-200)] bg-white p-3">
                <p className="px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-neutral-400)]">Espaces autorisés</p>
                <div className="mt-2 space-y-1">
                  {accessibleCodes.map((code) => {
                    const item = suite.products.find((candidate) => candidate.code === code);
                    if (!item) return null;
                    return (
                      <button
                        type="button"
                        key={code}
                        onClick={() => setSelected(code)}
                        className={`w-full rounded px-3 py-3 text-left text-sm font-semibold ${selected === code ? "bg-[var(--mb-navy-900)] text-white" : "hover:bg-[var(--mb-foam)]"}`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </nav>

              {product ? (
                <article className="border border-[var(--mb-neutral-200)] bg-white p-6 sm:p-8">
                  <div className="flex flex-col gap-5 border-b border-[var(--mb-neutral-200)] pb-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">{product.actor}</p>
                      <h2 className="mt-2 text-3xl font-semibold text-[var(--mb-navy-900)]">{product.name}</h2>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mb-neutral-600)]">{product.purpose}</p>
                    </div>
                    <div className="flex gap-3">
                      {product.code === "atlas" ? <Link href="/atlas" className="inline-flex h-10 items-center justify-center rounded border border-[var(--mb-neutral-300)] px-4 text-xs font-bold">Console Atlas</Link> : null}
                      <Link href={`/produit/${product.code}`} className="inline-flex h-10 items-center justify-center rounded bg-[var(--mb-navy-700)] px-4 text-xs font-bold text-white">Ouvrir l’espace</Link>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <InfoCard label="Valeur créée" value={product.value} />
                    <InfoCard label="Payeur principal" value={product.payer} />
                  </div>

                  <section className="mt-8">
                    <h3 className="text-xl font-semibold text-[var(--mb-navy-900)]">Capabilities activées</h3>
                    <div className="mt-4 grid gap-4 xl:grid-cols-3">
                      {product.capabilities.map((capability) => (
                        <Link key={capability.code} href={capability.href} className="border border-[var(--mb-neutral-200)] p-5 hover:border-[var(--mb-ocean-500)]">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="font-semibold">{capability.name}</h4>
                            <StatusBadge status={capability.status} />
                          </div>
                          <p className="mt-3 text-xs leading-5 text-[var(--mb-neutral-600)]">{capability.description}</p>
                          <p className="mt-4 text-xs font-semibold text-[var(--mb-ocean-700)]">{capability.operationalValue}</p>
                        </Link>
                      ))}
                    </div>
                  </section>

                  <section className="mt-8 border-t border-[var(--mb-neutral-200)] pt-6">
                    <h3 className="text-xl font-semibold text-[var(--mb-navy-900)]">Parcours principal</h3>
                    <ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {product.primaryJourney.map((step, index) => (
                        <li key={step} className="flex gap-3 border border-[var(--mb-neutral-200)] p-4 text-sm">
                          <span className="font-mono text-[var(--mb-ocean-600)]">{String(index + 1).padStart(2, "0")}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                </article>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="bg-white p-5"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p></div>;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="border border-[var(--mb-neutral-200)] p-5"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">{label}</p><p className="mt-3 text-sm leading-6">{value}</p></div>;
}

function StatusBadge({ status }: { status: "available" | "attention" | "blocked" | "planned" }) {
  const labels = { available: "Disponible", attention: "À finaliser", blocked: "Bloqué", planned: "Planifié" };
  return <span className="rounded border border-[var(--mb-neutral-300)] px-2 py-1 font-mono text-[8px] uppercase">{labels[status]}</span>;
}
