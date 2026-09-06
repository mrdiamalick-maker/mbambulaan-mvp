import { notFound } from "next/navigation";
import { currentSession } from "@/server/session";
import { DesignFoundationsContent } from "@/app/design-foundations/DesignFoundationsContent";

// XXL-R2 (§0, micro-correctif) — cette route vivait hors du garde
// middleware.ts (qui ne protège que /app/:path*), donc accessible
// anonymement en production. Toujours pas une fonctionnalité produit et
// toujours hors de /app (elle ne doit appartenir à aucun espace
// utilisateur, ni Pro ni État) : la garde ci-dessous est une protection
// serveur explicite, propre à cette page, plutôt qu'un déplacement sous
// /app/* qui la ferait passer pour une page produit.
//
// Règle : en développement, toujours accessible (outil d'équipe). En
// production, seule une session valide (même mécanisme HMAC que le
// Produit, currentSession()) l'ouvre — n'importe quel rôle authentifié,
// jamais un visiteur anonyme. notFound() plutôt qu'une redirection vers
// /connexion : ne pas laisser deviner que la route existe.
export default async function DesignFoundationsPage() {
  if (process.env.NODE_ENV === "production") {
    const session = await currentSession();
    if (!session) notFound();
  }
  return <DesignFoundationsContent />;
}
