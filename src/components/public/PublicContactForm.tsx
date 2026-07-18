"use client";

import { FormEvent, useState } from "react";

type PreparedRequest = {
  subject: string;
  organization: string;
  contact: string;
  territory: string;
  context: string;
};

const subjectLabels: Record<string, string> = {
  ministere: "Atelier Ministère",
  partenariat: "Partenariat ou bailleur",
  financement: "Programme / financement",
  autre: "Collaboration générale",
};

export function PublicContactForm() {
  const [prepared, setPrepared] = useState<PreparedRequest | null>(null);

  function prepareRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPrepared({
      subject: subjectLabels[String(data.get("subject"))] ?? "Collaboration générale",
      organization: String(data.get("organization")),
      contact: String(data.get("contact")),
      territory: String(data.get("territory")),
      context: String(data.get("context")),
    });
  }

  if (prepared) return <section aria-live="polite" className="border border-[var(--mb-ocean-600)]/25 bg-white">
    <header className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-foam)] px-5 py-5"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Récapitulatif local</p><h2 className="mt-2 text-[22px] font-semibold text-[var(--mb-navy-900)]">Demande préparée localement</h2><p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]">Aucune information n’a été envoyée. Un canal officiel sera confirmé pendant le cadrage.</p></header>
    <dl className="divide-y divide-[var(--mb-neutral-100)] px-5"><SummaryRow label="Objet" value={prepared.subject} /><SummaryRow label="Organisation" value={prepared.organization} /><SummaryRow label="Contact" value={prepared.contact} /><SummaryRow label="Territoire" value={prepared.territory} /><SummaryRow label="Contexte" value={prepared.context} /></dl>
    <div className="flex flex-col gap-3 border-t border-[var(--mb-neutral-200)] p-5 sm:flex-row"><button type="button" onClick={() => setPrepared(null)} className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">Modifier les informations</button><p className="self-center text-[10px] leading-4 text-[var(--mb-neutral-400)]">Simulation locale · aucune transmission réseau</p></div>
  </section>;

  return <form onSubmit={prepareRequest} className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-7">
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Objet de la demande"><select name="subject" defaultValue="ministere" required className={inputClass}><option value="ministere">Atelier Ministère</option><option value="partenariat">Partenariat ou bailleur</option><option value="financement">Programme / financement</option><option value="autre">Collaboration générale</option></select></Field>
      <Field label="Organisation"><input name="organization" required placeholder="Nom de votre organisation" className={inputClass} /></Field>
      <Field label="Nom et fonction"><input name="contact" required placeholder="Votre nom et votre fonction" className={inputClass} /></Field>
      <Field label="Territoire concerné"><input name="territory" required placeholder="Région, département ou quai" className={inputClass} /></Field>
    </div>
    <div className="mt-5"><Field label="Contexte et résultat attendu"><textarea name="context" required rows={6} placeholder="Décrivez brièvement le besoin, les acteurs concernés et le résultat recherché." className={`${inputClass} min-h-36 py-3`} /></Field></div>
    <div className="mt-6 border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] px-4 py-3"><p className="text-[11px] font-semibold text-[var(--mb-navy-900)]">Aucune donnée ne sera envoyée.</p><p className="mt-1 text-[10px] leading-4 text-[var(--mb-neutral-600)]">Le bouton prépare uniquement un récapitulatif dans votre navigateur pour la démonstration.</p></div>
    <button type="submit" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white hover:bg-[var(--mb-navy-900)] sm:w-auto">Préparer le récapitulatif</button>
  </form>;
}

const inputClass = "min-h-11 w-full rounded-[3px] border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-3 text-[12px] text-[var(--mb-neutral-900)] outline-none focus:border-[var(--mb-ocean-600)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]">{label}{children}</label>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"><dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</dt><dd className="whitespace-pre-wrap text-[12px] leading-5 text-[var(--mb-neutral-900)]">{value}</dd></div>;
}
