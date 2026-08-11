import { ProductShell } from "@/components/shell/ProductShell";

// Coquille partagée (AppShell/AppSidebar) — légitime pour Coordinateur et
// Opérateur, outils de travail où une navigation latérale persistante a
// du sens (D9, PRODUCT_DECISION_LOG.md). Regroupement Next.js par route
// group : ne change aucune URL, seulement l'arborescence de layouts —
// l'Espace État (src/app/app/etat) et le Terrain mobile
// (src/app/app/terrain, D9, Lot 6), eux, restent hors de ce groupe.
//
// CoordinationUpdateStrip (bandeau alimenté par la simulation retirée,
// visible uniquement sur /app/travail) retiré ici avec elle — voir le
// commentaire de src/app/app/layout.tsx.
export default function CoordinationLayout({ children }: { children: React.ReactNode }) {
  return <ProductShell>{children}</ProductShell>;
}
