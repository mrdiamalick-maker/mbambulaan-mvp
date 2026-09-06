// Magic UI — Bento Grid (sourcé via github.com/magicuidesign/magicui, voir
// number-ticker.tsx). Validé par le CEO pour présenter des capacités
// produit de façon asymétrique — jamais une grille de cartes identiques.
// Icône ArrowRight reprise de lucide-react (déjà utilisé dans tout le
// Produit) plutôt que @radix-ui/react-icons, pour ne pas ajouter une
// deuxième bibliothèque d'icônes pour un seul glyphe.
import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className: string;
  background: ReactNode;
  Icon: React.ElementType;
  // ReactNode plutôt que string (original Magic UI) : nos tuiles portent
  // parfois un NumberTicker, pas seulement un texte de description.
  description: ReactNode;
  href: string;
  cta: string;
}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div className={cn("grid w-full auto-rows-[22rem] grid-cols-3 gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function BentoCard({ name, className, background, Icon, description, href, cta, ...props }: BentoCardProps) {
  return (
    <div
      key={name}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
        "bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "dark:bg-background transform-gpu dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:[border:1px_solid_rgba(255,255,255,.1)]",
        className
      )}
      {...props}
    >
      <div>{background}</div>
      <div className="p-4">
        <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-10">
          <Icon className="h-10 w-10 origin-left transform-gpu text-muted-foreground transition-all duration-300 ease-in-out group-hover:scale-75" />
          <h3 className="text-lg font-semibold text-foreground">{name}</h3>
          <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:hidden">
          <Button variant="link" asChild size="sm" className="pointer-events-auto p-0">
            <a href={href}>
              {cta}
              <ArrowRight className="ms-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 hidden w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
        <Button variant="link" asChild size="sm" className="pointer-events-auto p-0">
          <a href={href}>
            {cta}
            <ArrowRight className="ms-2 h-4 w-4" />
          </a>
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/3 group-hover:dark:bg-neutral-800/10" />
    </div>
  );
}
