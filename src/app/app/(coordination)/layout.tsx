import { ProductShell } from "@/components/shell/ProductShell";
import { CoordinationUpdateStrip } from "@/components/work/CoordinationUpdateStrip";

// Coquille partagée (AppShell/AppSidebar) — légitime pour Coordinateur et
// Opérateur, outils de travail où une navigation latérale persistante a
// du sens (D9, PRODUCT_DECISION_LOG.md). Regroupement Next.js par route
// group : ne change aucune URL, seulement l'arborescence de layouts —
// l'Espace État (src/app/app/etat), lui, reste hors de ce groupe et n'en
// hérite pas.
export default function CoordinationLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductShell>
      <CoordinationUpdateStrip />
      {children}
    </ProductShell>
  );
}
