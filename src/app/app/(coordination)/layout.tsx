import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";
import { ProductShell } from "@/components/shell/ProductShell";

// Coquille partagée (AppShell/AppSidebar) — légitime pour Coordinateur et
// Opérateur, outils de travail où une navigation latérale persistante a
// du sens (D9, PRODUCT_DECISION_LOG.md). Regroupement Next.js par route
// group : ne change aucune URL, seulement l'arborescence de layouts —
// l'Espace État (src/app/app/etat) et le Terrain mobile
// (src/app/app/terrain, D9, Lot 6), eux, restent hors de ce groupe.
//
// Garde de rôle côté serveur — corrigée le 2026-08-12 : ce layout enveloppe
// TOUTES les routes du groupe (coordination), /app/travail compris, et n'en
// avait aucune jusqu'ici (contrairement à src/app/app/etat/layout.tsx et
// src/app/app/terrain/layout.tsx, qui en ont depuis leur création). Une
// session "institution" ou "capitaine" qui naviguait directement vers
// /app/travail (ou toute autre route de ce groupe) retombait sans garde sur
// CoordinatorHub — même faille de nature que celle que les gardes
// d'/app/etat et /app/terrain empêchent déjà, chacune dans son sens. Un seul
// point de garde ici plutôt que dupliqué route par route, à l'identique du
// principe déjà appliqué dans
// src/app/app/(coordination)/administration/layout.tsx (garde
// additionnelle, plus stricte, imbriquée pour ce sous-groupe précis).
//
// CoordinationUpdateStrip (bandeau alimenté par la simulation retirée,
// visible uniquement sur /app/travail) retiré ici avec elle — voir le
// commentaire de src/app/app/layout.tsx.
export default async function CoordinationLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/connexion");
  if (session.role === "institution") redirect("/app/etat");
  if (session.role === "capitaine") redirect("/app/terrain");
  return <ProductShell>{children}</ProductShell>;
}
