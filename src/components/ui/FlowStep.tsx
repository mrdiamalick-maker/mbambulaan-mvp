import Link from "next/link";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

type FlowStepProps = {
  index: number;
  title: string;
  detail: string;
  href?: string;
  status: string;
  tone?: StatusTone;
  active?: boolean;
};

export function FlowStep({ active = false, detail, href, index, status, title, tone = "neutral" }: FlowStepProps) {
  const content = (
    <div className={`min-h-28 rounded-2xl border p-4 transition ${active ? "border-[#1F6F8B]/24 bg-white shadow-sm" : "border-[#0F2D4A]/8 bg-[#F8FAFC]"}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-[#0F2D4A] ring-1 ring-[#1F6F8B]/24">{index}</span>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </div>
      <p className="mt-3 text-sm font-black text-[#14312d]">{title}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-[#14312d]/58">{detail}</p>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
