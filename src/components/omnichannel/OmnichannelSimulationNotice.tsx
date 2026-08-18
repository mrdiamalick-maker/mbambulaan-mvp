import { FlaskConical } from "lucide-react";

export function OmnichannelSimulationNotice() {
  return (
    <aside className="rounded-[var(--radius-md)] border border-[var(--sand-200)] bg-[var(--sand-100)] p-4 text-[var(--ink)]">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--white)] text-[var(--sand-500)]">
          <FlaskConical size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">Simulation de conception</p>
          <p className="mt-1 text-sm leading-6 text-[var(--legacy-muted)]">
            Cette interface sert uniquement à concevoir et tester les futurs parcours WhatsApp Business et téléphone de Mbàmbulaan. Dans le produit final, le client agira depuis son canal habituel ; ces écrans ne seront pas présentés comme des pages Mbàmbulaan.
          </p>
        </div>
      </div>
    </aside>
  );
}
