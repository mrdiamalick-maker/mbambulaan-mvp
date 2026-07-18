import type { PublicStory } from "@/data/publicEditorialContent";

const accentClass: Record<PublicStory["accent"], string> = {
  navy: "from-[#0b1f33] via-[#12314f] to-[#2a6f8e]",
  ocean: "from-[#12314f] via-[#2a6f8e] to-[#79b6c5]",
  sand: "from-[#6f5d3d] via-[#b8955b] to-[#e4d9c2]",
  green: "from-[#183e31] via-[#2f6e4e] to-[#82a995]",
  amber: "from-[#5a3916] via-[#c08a2e] to-[#e8c985]",
};

export function PublicStoryVisual({
  story,
  compact = false,
  priorityLabel,
}: {
  story: PublicStory;
  compact?: boolean;
  priorityLabel?: string;
}) {
  const className = [
    "relative overflow-hidden bg-gradient-to-br",
    accentClass[story.accent],
    compact ? "min-h-44" : "min-h-[22rem] lg:min-h-[30rem]",
  ].join(" ");

  return (
    <div className={className}>
      <svg className="absolute inset-0 h-full w-full opacity-75" viewBox="0 0 800 520" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 330 C120 280 220 385 355 326 C505 260 615 365 800 302 L800 520 L0 520 Z" fill="rgba(255,255,255,.09)" />
        <path d="M0 370 C130 322 250 420 390 360 C545 294 650 408 800 342" fill="none" stroke="rgba(255,255,255,.34)" strokeWidth="2" />
        <path d="M0 408 C145 362 255 450 410 396 C550 345 680 440 800 390" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
        <path d="M535 192 L620 192 L604 216 L551 216 Z" fill="rgba(255,255,255,.72)" />
        <path d="M576 192 L576 135" stroke="rgba(255,255,255,.72)" strokeWidth="4" />
        <path d="M580 142 L626 184 L580 184 Z" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.6)" strokeWidth="2" />
        <circle cx="146" cy="118" r="64" fill="rgba(255,255,255,.06)" />
        <circle cx="146" cy="118" r="39" fill="none" stroke="rgba(255,255,255,.15)" />
      </svg>
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 text-white sm:p-5">
        <span className="border border-white/25 bg-black/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] backdrop-blur-sm">
          {priorityLabel ?? story.category}
        </span>
        <span className="font-mono text-[9px] text-white/65">{story.location}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-4 pt-16 text-white sm:p-5 sm:pt-20">
        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/65">{story.kicker}</p>
        {!compact ? <p className="mt-2 max-w-lg text-[12px] leading-5 text-white/75">Une lecture Mbàmbulaan de la filière artisanale.</p> : null}
      </div>
    </div>
  );
}
