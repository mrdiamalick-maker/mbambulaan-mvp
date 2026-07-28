"use client";

import { useCallback, useEffect, useState } from "react";

type Snapshot = {
  needs: Array<{ id: string; status: string; requestedAmountXof: number }>;
  offers: Array<{ id: string; status: string; principalAmountXof: number; acquisitionCostXof?: number; disclosedMarginXof?: number; serviceFeeXof: number }>;
  disbursements: Array<{ amountXof: number; paymentReference: string }>;
  solidarityFunds: Array<{ id: string; status: string; contributionBalanceXof: number }>;
  solidaritySupports: Array<{ id: string; status: string; approvedSupportXof: number }>;
  metrics: { activeFinancingAmountXof: number; solidarityFundBalanceXof: number; solidaritySupportPaidXof: number; mbambulaanServiceRevenueXof: number };
};

const empty: Snapshot = { needs: [], offers: [], disbursements: [], solidarityFunds: [], solidaritySupports: [], metrics: { activeFinancingAmountXof: 0, solidarityFundBalanceXof: 0, solidaritySupportPaidXof: 0, mbambulaanServiceRevenueXof: 0 } };

export function EthicalFinanceWorkstation() {
  const [sessionId, setSessionId] = useState<string>();
  const [snapshot, setSnapshot] = useState<Snapshot>(empty);
  const [message, setMessage] = useState("Ouverture du poste Finance…");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const sessionResponse = await fetch("/api/v1/access/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ identityId: "demo-finance-officer", territoryId: "territory-national" }) });
      const sessionBody = await sessionResponse.json();
      if (!sessionResponse.ok) throw new Error(sessionBody?.error?.message ?? "Impossible d’ouvrir la session.");
      const token = sessionBody.session.id as string;
      setSessionId(token);
      const response = await fetch("/api/v1/ethical-finance", { headers: { "x-mbambulaan-demo-session": token } });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Impossible de charger les dossiers.");
      setSnapshot(body);
      setMessage("Les coûts, la marge, les frais de service et le partage du risque sont visibles avant tout accord.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function execute(command: Record<string, unknown>, success: string) {
    if (!sessionId) return;
    setBusy(true);
    try {
      const response = await fetch("/api/v1/ethical-finance", { method: "POST", headers: { "content-type": "application/json", "x-mbambulaan-demo-session": sessionId }, body: JSON.stringify({ commandId: `${String(command.type)}-${crypto.randomUUID()}`, command }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Action refusée.");
      setSnapshot(body.snapshot);
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action impossible.");
    } finally {
      setBusy(false);
    }
  }

  const at = new Date().toISOString();
  const need = snapshot.needs[0];
  const offer = snapshot.offers[0];
  const fund = snapshot.solidarityFunds[0];
  const support = snapshot.solidaritySupports[0];

  return <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <header className="bg-[var(--mb-navy-900)] px-5 py-8 text-white"><div className="mx-auto max-w-6xl"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Mbàmbulaan Finance</p><h1 className="mt-2 text-3xl font-semibold">Financer une activité réelle sans intérêt</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Chaque dossier montre ce qui est financé, le coût d’achat, la marge connue, les frais Mbàmbulaan et la manière dont le risque est partagé.</p></div></header>
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6"><div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4 text-sm">{message}</div>
      <section className="mt-5 grid gap-4 lg:grid-cols-4">
        <Step title="1. Besoin réel" status={need?.status ?? "À déposer"} value={need ? `${need.requestedAmountXof.toLocaleString("fr-FR")} FCFA` : "Aucun besoin"}>{!need && <Action disabled={busy} onClick={() => execute({ type: "submit_need", need: { id: `need-${crypto.randomUUID()}`, territoryId: "territory-dakar", applicantActorId: "fisher-1", applicantOrganizationId: "coop-1", purpose: "equipment", requestedAmountXof: 6_000_000, activityReferenceIds: ["campaign-2026"], assetReferenceIds: ["engine-quote-01"], expectedValueXof: 9_000_000, expectedSettlementSource: "revenus des campagnes", supportingDocumentIds: ["supplier-quote-01"], status: "submitted", submittedAt: at } }, "Besoin enregistré avec le devis du moteur.")}>Enregistrer le besoin</Action>}{need?.status === "submitted" && <Action disabled={busy} onClick={() => execute({ type: "qualify_need", needId: need.id }, "Le besoin et son lien avec l’activité sont confirmés.")}>Confirmer le besoin</Action>}</Step>
        <Step title="2. Offre transparente" status={offer?.status ?? "À préparer"} value={offer ? `${offer.principalAmountXof.toLocaleString("fr-FR")} FCFA` : "Aucune offre"}>{need?.status === "qualified" && !offer && <Action disabled={busy} onClick={() => execute({ type: "propose_offer", offer: { id: `offer-${crypto.randomUUID()}`, financingNeedId: need.id, providerOrganizationId: "org-finance-partner", mode: "murabaha", principalAmountXof: 6_000_000, acquisitionCostXof: 5_400_000, disclosedMarginXof: 600_000, installments: [{ dueAt: "2026-12-31T00:00:00.000Z", amountXof: 6_000_000 }], serviceFeeXof: 100_000, serviceDescription: "Qualification et suivi de l’achat du moteur", activityReferenceIds: ["engine-quote-01"], contractDocumentIds: ["purchase-resale-agreement-01"], independentReviewRequired: true, status: "draft", proposedAt: at } }, "Offre préparée avec coût d’achat, marge et frais visibles.")}>Préparer l’offre</Action>}{offer?.status === "under_review" && <Action disabled={busy} onClick={() => execute({ type: "review_offer", review: { id: `review-${crypto.randomUUID()}`, offerId: offer.id, reviewerActorId: "independent-reviewer-01", decision: "compliant", findings: [], requiredConditions: [], reviewDocumentIds: ["independent-review-report-01"], reviewedAt: at } }, "Revue indépendante enregistrée.")}>Enregistrer la revue</Action>}{offer?.status === "compliant" && <Action disabled={busy} onClick={() => execute({ type: "accept_offer", offerId: offer.id }, "Offre acceptée avec tous les coûts connus.")}>Accepter l’offre</Action>}</Step>
        <Step title="3. Achat et suivi" status={snapshot.disbursements.length ? "Fournisseur payé" : "À payer"} value={`${snapshot.metrics.activeFinancingAmountXof.toLocaleString("fr-FR")} FCFA actifs`}>{offer?.status === "accepted" && <Action disabled={busy} onClick={() => execute({ type: "record_disbursement", disbursement: { id: `payment-${crypto.randomUUID()}`, offerId: offer.id, amountXof: 6_000_000, paidToActorId: "supplier-1", supplierActorId: "supplier-1", purposeReferenceIds: ["engine-quote-01"], paymentReference: `TRANSFER-${Date.now()}`, status: "released", disbursedAt: at } }, "Paiement au fournisseur enregistré avec sa référence.")}>Enregistrer le paiement</Action>}</Step>
        <Step title="4. Protection solidaire" status={support?.status ?? fund?.status ?? "À créer"} value={`${snapshot.metrics.solidarityFundBalanceXof.toLocaleString("fr-FR")} FCFA disponibles`}>{!fund && <Action disabled={busy} onClick={() => execute({ type: "create_solidarity_fund", fund: { id: `fund-${crypto.randomUUID()}`, territoryId: "territory-dakar", mode: "cooperative_solidarity_fund", operatorOrganizationId: "coop-1", participantOrganizationIds: ["coop-1", "coop-2"], coveredSituations: ["engine_breakdown"], excludedSituations: ["intentional_damage"], contributionBalanceXof: 2_000_000, maximumSupportXof: 750_000, governanceDocumentIds: ["signed-fund-rules-01"], independentReviewDocumentIds: [], status: "draft" } }, "Fonds commun créé avec ses règles signées.")}>Créer le fonds commun</Action>}{fund?.status === "draft" && <Action disabled={busy} onClick={() => execute({ type: "activate_solidarity_fund", fundId: fund.id }, "Fonds commun activé.")}>Activer le fonds</Action>}</Step>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-4"><Metric label="Financements actifs" value={`${snapshot.metrics.activeFinancingAmountXof.toLocaleString("fr-FR")} FCFA`} /><Metric label="Fonds solidaire" value={`${snapshot.metrics.solidarityFundBalanceXof.toLocaleString("fr-FR")} FCFA`} /><Metric label="Aides versées" value={`${snapshot.metrics.solidaritySupportPaidXof.toLocaleString("fr-FR")} FCFA`} /><Metric label="Revenu Mbàmbulaan" value={`${snapshot.metrics.mbambulaanServiceRevenueXof.toLocaleString("fr-FR")} FCFA`} /></section>
    </div>
  </main>;
}

function Step({ title, status, value, children }: { title: string; status: string; value: string; children?: React.ReactNode }) { return <article className="rounded-xl border border-[var(--mb-neutral-200)] bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2><span className="rounded border px-2 py-1 font-mono text-[8px] uppercase">{status}</span></div><p className="mt-4 text-sm text-[var(--mb-neutral-500)]">{value}</p><div className="mt-5 space-y-2">{children}</div></article>; }
function Action({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void | Promise<void> }) { return <button type="button" disabled={disabled} onClick={() => void onClick()} className="min-h-11 w-full rounded-lg bg-[var(--mb-navy-800)] px-4 text-sm font-bold text-white disabled:opacity-40">{children}</button>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-[var(--mb-neutral-200)] bg-white p-4"><p className="text-[10px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>; }
