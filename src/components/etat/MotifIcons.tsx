// Famille de pictogrammes signature — référentiel visuel D9
// (docs/design-reference/README.md, section 1 "Système d'icônes / motif
// signature"). Neuf concepts, un seul vocabulaire graphique : trait fin,
// géométrique, cohérent avec TensionGlyph plutôt qu'un set d'icônes SaaS
// générique (lucide, Heroicons…) utilisé comme langage de marque.
//
// Chaque icône représente une étape de la boucle de coordination :
// Signal → Qualification → Situation → Décision → Engagement → Exécution
// → Preuve → Résultat → Apprentissage.

export interface MotifIconProps {
  size?: number;
  className?: string;
  color?: string;
}

const defaults = { size: 20, color: "currentColor" };

export function SignalIcon({ size = defaults.size, className, color = defaults.color }: MotifIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeOpacity="0.3" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill={color} />
    </svg>
  );
}

export function QualificationIcon({ size = defaults.size, className, color = defaults.color }: MotifIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 5h16l-6 7.5V19l-4 2v-8.5L4 5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function SituationIcon({ size = defaults.size, className, color = defaults.color }: MotifIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 9c1.6 1.6 3.2 1.6 4.8 0s3.2-1.6 4.8 0 3.2 1.6 4.8 0 3.2-1.6 4.6 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 14.5c1.6 1.6 3.2 1.6 4.8 0s3.2-1.6 4.8 0 3.2 1.6 4.8 0 3.2-1.6 4.6 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.55" />
    </svg>
  );
}

export function DecisionIcon({ size = defaults.size, className, color = defaults.color }: MotifIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3 20 12 12 21 4 12 12 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  );
}

export function EngagementIcon({ size = defaults.size, className, color = defaults.color }: MotifIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="9" r="2.6" stroke={color} strokeWidth="1.5" />
      <circle cx="16" cy="9" r="2.6" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="16" r="2.6" stroke={color} strokeWidth="1.5" />
      <path d="M9.9 10.7 10.6 14.2M14.1 10.7 13.4 14.2" stroke={color} strokeWidth="1.3" strokeOpacity="0.6" />
    </svg>
  );
}

export function ExecutionIcon({ size = defaults.size, className, color = defaults.color }: MotifIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 6 10 12 4 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6 18 12 12 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.55" />
    </svg>
  );
}

export function PreuveIcon({ size = defaults.size, className, color = defaults.color }: MotifIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="5.5" r="2" stroke={color} strokeWidth="1.5" />
      <path d="M12 7.5V19M6 13c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 9.5h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  );
}

export function ResultatIcon({ size = defaults.size, className, color = defaults.color }: MotifIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.5" />
      <path d="M8.3 12.3 10.8 14.8 15.8 9.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ApprentissageIcon({ size = defaults.size, className, color = defaults.color }: MotifIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M19 12a7 7 0 1 1-2.2-5.1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 4v4.5h-4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
