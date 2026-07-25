import { CheckCircle2, CircleAlert, Clock3, Radio } from "lucide-react";
import type { SituationStatus, TrustLevel } from "@/domain/types";

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

export function StatusBadge({ status }: { status: SituationStatus }) {
  const critical = status === "attente";
  const done = status === "reglee" || status === "resultat";
  const Icon = critical ? CircleAlert : done ? CheckCircle2 : Clock3;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
      critical ? "border-[#efc8c1] bg-[#fff1ee] text-[#9c392b]" : done ? "border-[#b9dfd2] bg-[#e9f7f1] text-[#126b58]" : "border-[#b9dfe4] bg-[#eaf8fa] text-[#08697b]"
    }`}>
      <Icon size={13} aria-hidden="true" /> {statusLabels[status]}
    </span>
  );
}

const trustLabels: Record<TrustLevel, string> = {
  declaree: "Déclarée",
  verifiee: "Vérifiée",
  consolidee: "Consolidée"
};

export function TrustBadge({ trust, source }: { trust: TrustLevel; source?: string }) {
  return (
    <span
      title={source ? `Source : ${source}` : "Niveau établi dans le tenant de démonstration"}
      className="inline-flex cursor-help items-center gap-1.5 rounded-full border border-[#c8d7da] bg-white px-2.5 py-1 text-xs font-semibold text-[#445b62]"
    >
      <Radio size={12} aria-hidden="true" /> {trustLabels[trust]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: "faible" | "moyenne" | "haute" | "critique" }) {
  const tone = priority === "critique" ? "border-[#efc8c1] bg-[#fff1ee] text-[#9c392b]" : priority === "haute" ? "border-[#ead7a8] bg-[#fff8e8] text-[#875d08]" : "border-[#d4dde0] bg-[#f5f7f7] text-[#52666d]";
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>{priority[0].toUpperCase() + priority.slice(1)}</span>;
}
