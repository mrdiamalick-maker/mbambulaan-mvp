import type { ReactNode } from "react";

// XXL-R1, primitive 6/9 (§18.6) — une ligne claire pour source, date,
// provenance, type de preuve. Remplace le `text-sm text-muted-foreground`
// générique utilisé indifféremment pour légendes, descriptions et sources
// (audit, finding art direction §5.3) — l'Evidence a désormais son propre
// registre typographique (mono, cf. mb-foundations.css .mb-evidence).
export function EvidenceLine({
  source,
  date,
  detail,
  className
}: {
  source: ReactNode;
  date?: ReactNode;
  detail?: ReactNode;
  className?: string;
}) {
  return (
    <p className={`mb-evidence ${className ?? ""}`}>
      {source}
      {date && <> · {date}</>}
      {detail && <> — {detail}</>}
    </p>
  );
}
