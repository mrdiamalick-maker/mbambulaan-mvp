import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";
import { ProductShell } from "@/components/shell/ProductShell";

// LOT V3.1 (Scope A/G) — coquille partagée (ProductShell space=
// "coordination", ex-AppShell/AppSidebar) désormais commune avec
// l'Espace État (src/app/app/etat/layout.tsx), qui montait jusqu'ici une
// coquille séparée (D9, arbitrage rouvert par le mandat V3.1 : Claude
// Design V3 devient l'autorité visuelle pour tout l'environnement privé
// unifié). Regroupement Next.js par route group : ne change aucune URL,
// seulement l'arborescence de layouts — le Terrain mobile
// (src/app/app/terrain, D9, Lot 6) reste hors de ce groupe et hors de ce
// lot (mobile-first, jamais concerné par l'unification "outils de
// travail" Coordination + État).
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
  return <ProductShell space="coordination">{children}</ProductShell>;
}
