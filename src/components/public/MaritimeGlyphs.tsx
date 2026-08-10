// Pictogrammes maison pour la chaîne de valeur halieutique — traits simples,
// monoligne, cohérents avec l'identité Mbàmbulaan plutôt que la bibliothèque
// d'icônes générique utilisée ailleurs sur le site.

type GlyphProps = { className?: string; size?: number };

const base = { fill: "none", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function PirogueGlyph({ className, size = 32 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden {...base} stroke="currentColor">
      <path d="M4 20 Q16 26 28 20 L25 24 Q16 28 7 24 Z" />
      <path d="M16 20 V7" />
      <path d="M16 8 L23 12 L16 14 Z" fill="currentColor" stroke="none" />
      <path d="M2 22 Q9 25 16 22 T30 22" opacity=".55" />
    </svg>
  );
}

export function QuayGlyph({ className, size = 32 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden {...base} stroke="currentColor">
      <path d="M4 12 H28" />
      <path d="M8 12 V24" />
      <path d="M16 12 V24" />
      <path d="M24 12 V24" />
      <circle cx="16" cy="6" r="2.6" />
      <path d="M16 8.6 V15 M13.4 12 Q16 15 18.6 12" />
    </svg>
  );
}

export function IceCrystalGlyph({ className, size = 32 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden {...base} stroke="currentColor">
      <path d="M16 4 V28 M6 9 L26 23 M26 9 L6 23" />
      <path d="M16 4 L13 8 M16 4 L19 8 M16 28 L13 24 M16 28 L19 24" opacity=".7" />
      <path d="M6 9 L10.4 9 M6 9 L7.6 12.8 M26 23 L21.6 23 M26 23 L24.4 19.2" opacity=".7" />
      <path d="M26 9 L21.6 9 M26 9 L24.4 12.8 M6 23 L10.4 23 M6 23 L7.6 19.2" opacity=".7" />
    </svg>
  );
}

export function SmokehouseGlyph({ className, size = 32 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden {...base} stroke="currentColor">
      <path d="M4 10 L16 4 L28 10" />
      <path d="M6 10 V24 M26 10 V24" />
      <path d="M11 14 L14 18 L11 22" />
      <path d="M16 13 L19 17 L16 21" />
      <path d="M21 14 L24 18 L21 22" />
    </svg>
  );
}

export function RouteGlyph({ className, size = 32 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden {...base} stroke="currentColor">
      <path d="M4 24 Q10 24 12 18 Q14 12 20 12 Q26 12 26 6" strokeDasharray="3 3.4" />
      <circle cx="4" cy="24" r="2.2" fill="currentColor" stroke="none" />
      <path d="M22 3 L27 6 L22 9 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StallGlyph({ className, size = 32 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden {...base} stroke="currentColor">
      <path d="M4 11 L16 5 L28 11" />
      <path d="M4 11 L6 15 H26 L28 11" />
      <path d="M6 15 V25 H26 V15" />
      <circle cx="12" cy="20" r="1.8" />
      <circle cx="16.5" cy="20" r="1.8" />
      <circle cx="21" cy="20" r="1.8" />
    </svg>
  );
}
