import { CheckCircle2, CircleAlert, Clock3, Radio } from "lucide-react";
import type { SituationStatus, TrustLevel } from "@/domain/types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-[var(--ocean-800)] text-[var(--white)]",
  secondary: "border-transparent bg-[var(--lagoon-100)] text-[var(--lagoon-600)]",
  destructive: "border-transparent bg-[var(--coral-100)] text-[var(--coral-600)]",
  outline: "border-[var(--line-strong)] bg-transparent text-[var(--legacy-muted)]"
};

function Badge({ children, variant = "secondary", title }: { children: React.ReactNode; variant?: BadgeVariant; title?: string }) {
  return <span title={title} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeVariants[variant]}`}>{children}</span>;
}

const statusLabels: Record<SituationStatus, string> = {
  recue: "Reçue",
  qualification: "En qualification",
  priorisee: "Priorisée",
  coordination: "Coordination engagée",
  intervention: "Intervention en cours",
  attente: "En attente",
  resultat: "Résultat enregistré",
  reglee: "Réglée"
};

const statusVariant: Record<SituationStatus, BadgeVariant> = {
  recue: "outline",
  qualification: "secondary",
  priorisee: "secondary",
  coordination: "default",
  intervention: "default",
  attente: "destructive",
  resultat: "secondary",
  reglee: "secondary"
};

export function StatusBadge({ status }: { status: SituationStatus }) {
  const critical = status === "attente";
  const done = status === "reglee" || status === "resultat";
  const Icon = critical ? CircleAlert : done ? CheckCircle2 : Clock3;
  return <Badge variant={statusVariant[status]}><Icon size={13} aria-hidden="true" /> {statusLabels[status]}</Badge>;
}

const trustLabels: Record<TrustLevel, string> = {
  declaree: "Déclarée",
  observee: "Observée",
  verifiee: "Vérifiée",
  consolidee: "Consolidée",
  rapprochee: "Rapprochée",
  documentee: "Documentée",
  officielle: "Officielle",
  estimee: "Estimée",
  contestee: "Contestée",
  expiree: "Expirée"
};

export function TrustBadge({ trust, source }: { trust: TrustLevel; source?: string }) {
  return <Badge variant="outline" title={source ? `Source : ${source}` : "Niveau établi dans le tenant de démonstration"}><Radio size={12} aria-hidden="true" /> {trustLabels[trust]}</Badge>;
}

const priorityVariant = {
  faible: "outline",
  moyenne: "secondary",
  haute: "default",
  critique: "destructive"
} satisfies Record<"faible" | "moyenne" | "haute" | "critique", BadgeVariant>;

export function PriorityBadge({ priority }: { priority: "faible" | "moyenne" | "haute" | "critique" }) {
  return <Badge variant={priorityVariant[priority]}>{priority[0].toUpperCase() + priority.slice(1)}</Badge>;
}
