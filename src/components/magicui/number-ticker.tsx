"use client";

// Magic UI — Number Ticker (registry magicui.design, sourcé via
// github.com/magicuidesign/magicui — magicui.design est injoignable
// depuis cet environnement, même contrainte que shadcn/ui). Composant
// validé par le CEO pour les KPIs de l'Espace État (acteurs coordonnés,
// territoires actifs) — usage volontairement restreint au sous-ensemble
// autorisé, pas au catalogue Magic UI complet.
import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
}

// XXL-R0 (Demo Integrity, correctif n°1/n°2 — Brief national) : cause
// racine du "mur de 0" identifié par l'Audit Maritime Intelligence.
// Aucune donnée n'était fausse — les valeurs (totalSignalsCaptes,
// situationsQualifiees, etc.) sont correctement calculées et partagées
// mot pour mot entre la prose et les tuiles (cf. etat/page.tsx). Le bug
// était ici, dans l'affichage : deux défauts cumulés.
//
// 1) `useInView` (déclenchement au scroll, margin "0px") : sur une
//    capture plein-page ou un chargement rapide, un bloc de métriques
//    situé sous le premier écran (ex. "De la capture à la décision",
//    la bande de performance en bas de page) pouvait ne jamais être
//    détecté "à l'écran" avant la lecture — l'effet qui déclenche
//    l'animation ne se déclenchait alors jamais, et motionValue restait
//    figé à sa valeur initiale (startValue = 0) indéfiniment. Ce ne
//    sont pas des KPI décoratifs à révéler au défilement : ce sont des
//    chiffres institutionnels qui doivent être exacts dès l'affichage,
//    qu'ils soient ou non au-dessus du pli. Remplacé par un
//    déclenchement au montage (mount), inconditionnel.
// 2) Le rendu statique initial (avant l'exécution de l'effet React,
//    donc le tout premier pixel peint) affichait toujours
//    `startValue` (0 par défaut) plutôt que la vraie valeur — un
//    "0" institutionnel, même transitoire, contredisant la phrase
//    juste à côté. Corrigé : le rendu initial affiche désormais
//    directement `value`, jamais un zéro de convenance.
//
// Honore aussi prefers-reduced-motion (mandat §35, accessibilité) : si
// l'utilisateur ou l'environnement de capture le demande, le chiffre
// final s'affiche immédiatement, sans ressort animé — encore un moyen
// d'éviter qu'un outil de capture voie un état intermédiaire.
export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });

  useEffect(() => {
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      motionValue.jump(value);
      return;
    }
    const timer = setTimeout(() => {
      motionValue.set(direction === "down" ? startValue : value);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [motionValue, delay, value, direction, startValue]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = new Intl.NumberFormat("fr-FR", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
          }).format(Number(latest.toFixed(decimalPlaces)));
        }
      }),
    [springValue, decimalPlaces]
  );

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)} {...props}>
      {new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(value)}
    </span>
  );
}
