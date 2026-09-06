import type { ReactNode } from "react";

// XXL-R1, primitive 2/9 (§18.2) — grande section narrative : statement +
// contenu + média/donnée secondaire optionnelle. Remplace le réflexe
// "une carte par sous-partie" (cardification identifiée par l'audit sur
// le dossier Territoire et Initiatives) par un texte, comme le fait déjà
// « Le pouls de la filière » du Brief national.
export function EditorialSection({
  eyebrow,
  title,
  children,
  aside,
  className
}: {
  eyebrow?: string;
  title?: ReactNode;
  /** Optionnel : un titre de groupe seul (ex. tiers de registre, XXL-R2) reste une EditorialSection valide sans corps de texte. */
  children?: ReactNode;
  /** Donnée ou média secondaire, en colonne à droite sur desktop. */
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {eyebrow && <p className="mb-eyebrow">{eyebrow}</p>}
      {title && <h2 className="mb-section-title mt-2">{title}</h2>}
      {(children || aside) && (
        <div className={aside ? "mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(220px,.32fr)]" : "mt-3"}>
          {children && <div className="mb-body min-w-0 max-w-2xl [&_p]:mb-3 [&_p:last-child]:mb-0">{children}</div>}
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
      )}
    </section>
  );
}
