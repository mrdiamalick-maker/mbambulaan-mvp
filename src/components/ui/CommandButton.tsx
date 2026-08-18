"use client";

import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import type { CommandInput } from "@/domain/types";

export function CommandButton({
  command,
  children,
  tone = "primary",
  disabled = false
}: {
  command: CommandInput;
  children: React.ReactNode;
  tone?: "primary" | "secondary" | "warning";
  disabled?: boolean;
}) {
  const { run } = useProduct();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const styles = {
    primary: "border border-[#075568] bg-[#075568] text-white shadow-[0_8px_22px_rgba(7,85,104,.16)] hover:-translate-y-px hover:bg-[#064758]",
    secondary: "border border-[#bfd0d2] bg-white text-[#075568] hover:-translate-y-px hover:bg-[#eef9fa]",
    warning: "border border-[#e1c175] bg-[#fff8e8] text-[#76530d] hover:-translate-y-px hover:bg-[#fff1cc]"
  };
  const execute = async () => {
    setBusy(true);
    const ok = await run(command);
    setBusy(false);
    if (ok) {
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    }
  };
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={() => void execute()}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[tone]}`}
    >
      {busy ? <LoaderCircle size={16} className="animate-spin" /> : done ? <Check size={16} /> : null}
      {done ? "Action enregistrée" : children}
    </button>
  );
}
