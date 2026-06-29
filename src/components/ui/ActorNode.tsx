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
    <article className={`rounded-2xl border p-4 ${active ? "border-[#0F2D4A]/10 bg-white" : "border-[#0F2D4A]/8 bg-[#F8FAFC] text-[#0F2D4A]/60"}`}>
      <StatusBadge tone={active ? tone : "neutral"}>{role}</StatusBadge>
      {need ? <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#D85A34]">{need}</p> : null}
      <p className="mt-2 text-sm font-black leading-5 text-[#0F2D4A]">{active ? action : "Information non visible"}</p>
      {benefit ? <p className="mt-2 text-xs font-bold leading-5 text-[#0F2D4A]/58">{benefit}</p> : null}
    </article>
  );
}
