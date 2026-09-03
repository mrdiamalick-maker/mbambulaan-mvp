import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { GlyphTag } from "@/lib/status-tokens";
import { glyphBorderColor } from "@/lib/status-tokens";

// XXL-R1, primitive 4/9 (§18.4) — une réalité qui demande attention :
// niveau, territoire, raison, prochain geste. Une ligne à filet, jamais
// une carte bordée-arrondie-ombrée (audit : Top 3 d'Aujourd'hui, cause
// principale de l'effet "SaaS générique" sur l'écran le plus utilisé).
export function AttentionItem({
  level,
  levelLabel,
  territory,
  reason,
  nextStep,
  ctaLabel,
  href,
  onAction
}: {
  level: GlyphTag;
  levelLabel: string;
  territory?: string;
  reason: ReactNode;
  nextStep?: ReactNode;
  ctaLabel?: string;
  href?: string;
  onAction?: () => void;
}) {
  const color = glyphBorderColor[level];
  const content = (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="mb-evidence" style={{ color }}>{levelLabel}</span>
          {territory && <span className="mb-evidence" style={{ color: "var(--mb-stone-400)" }}>· {territory}</span>}
        </div>
        <p className="mb-operational mt-0.5 font-semibold">{reason}</p>
        {nextStep && <p className="mb-body mt-0.5 text-[13px]" style={{ color: "var(--mb-stone-600)" }}>{nextStep}</p>}
      </div>
      {ctaLabel && (
        <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--mb-terracotta-600)" }}>
          {ctaLabel} <ArrowRight size={13} />
        </span>
      )}
    </div>
  );

  const rowClass = "block border-b transition hover:bg-black/[.015]";
  const rowStyle = { borderColor: "var(--mb-hairline-soft)" };

  if (href) return <Link href={href} className={rowClass} style={rowStyle}>{content}</Link>;
  if (onAction) return <button type="button" onClick={onAction} className={`${rowClass} w-full text-left`} style={rowStyle}>{content}</button>;
  return <div className={rowClass} style={rowStyle}>{content}</div>;
}
