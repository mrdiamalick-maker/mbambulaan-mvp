import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

type ActorNodeProps = {
  role: string;
  need?: string;
  action: string;
  benefit?: string;
  tone?: StatusTone;
  active?: boolean;
};

export function ActorNode({ action, active = true, benefit, need, role, tone = "neutral" }: ActorNodeProps) {
  return (
    <article className={`rounded-2xl border p-4 ${active ? "border-[#14312d]/10 bg-white" : "border-[#14312d]/8 bg-[#f7f9f8] text-[#14312d]/60"}`}>
      <StatusBadge tone={active ? tone : "neutral"}>{role}</StatusBadge>
      {need ? <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{need}</p> : null}
      <p className="mt-2 text-sm font-black leading-5 text-[#14312d]">{active ? action : "Information non visible"}</p>
      {benefit ? <p className="mt-2 text-xs font-bold leading-5 text-[#14312d]/58">{benefit}</p> : null}
    </article>
  );
}
