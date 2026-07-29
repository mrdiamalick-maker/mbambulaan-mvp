import { CircleCheck } from "lucide-react";

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="surface flex min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
      <CircleCheck className="text-[#18a394]" size={28} />
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#60737a]">{detail}</p>
    </div>
  );
}
