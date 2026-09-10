"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// LOT V3.1 (Scope D/F) — primitive de surface de détail RÉUTILISABLE,
// fondation demandée par le mandat pour tout panneau contextuel/latéral à
// venir dans l'espace privé unifié. Remplace, pour tout NOUVEAU point
// d'usage (jamais une migration rétroactive de l'existant — mandat
// explicite : "valider la primitive, pas migrer chaque écran de détail"),
// src/components/etat/Drawer.tsx : ce dernier est un <div> fixe fait main
// (gestion manuelle de la touche Échap, aucun focus-trap, aucun blocage de
// scroll, pas de sémantique ARIA dialog) — DetailSurface s'appuie sur
// Radix Dialog (via src/components/ui/sheet.tsx, déjà utilisé ailleurs
// dans le Produit) : focus-trap, blocage de scroll, `role="dialog"`,
// portail, tout obtenu gratuitement plutôt que ré-implémenté.
//
// `scope` (LOT V3.1) — quand ce panneau porte du contenu Espace État
// portalé (SheetContent sort du DOM via un Portal, donc hors de tout
// ancêtre .etat-scope), il faut réappliquer .etat-scope directement sur le
// panneau pour que les jetons --etat-* et le fond crème s'appliquent —
// jamais en dépendant d'un ancêtre qu'un portail contourne justement.
export function DetailSurface({
  open,
  onOpenChange,
  eyebrow,
  title,
  size = "md",
  scope,
  children
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  eyebrow?: string;
  size?: "md" | "lg";
  scope?: "etat";
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={`${scope === "etat" ? "etat-scope" : ""} flex w-full flex-col gap-0 p-0 ${size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md"}`}
        style={scope === "etat" ? { background: "var(--etat-warm-white)" } : undefined}
      >
        <SheetHeader className="shrink-0 border-b p-6 text-left">
          {eyebrow && (
            <p className={scope === "etat" ? "etat-eyebrow" : "text-xs font-semibold uppercase tracking-wide text-muted-foreground"}>
              {scope === "etat" && <span className="etat-eyebrow-dot" aria-hidden="true" />}
              {eyebrow}
            </p>
          )}
          <SheetTitle className={scope === "etat" ? "etat-display etat-h2 mt-1 text-xl" : "text-xl"}>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
