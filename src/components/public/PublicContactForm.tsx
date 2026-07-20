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
  initiative: "Faire connaître une initiative ou un besoin",
  contribution: "Contribuer à un projet",
  information: "Partager une information, un événement ou un témoignage",
  partenariat: "Proposer un partenariat ou un soutien",
  autre: "Autre prise de contact",
};

export function PublicContactForm() {
  const [prepared, setPrepared] = useState<PreparedRequest | null>(null);
  const [copied, setCopied] = useState(false);

  function prepareRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPrepared({
      subject: subjectLabels[String(data.get("subject"))] ?? "Autre prise de contact",
      organization: String(data.get("organization")),
      contact: String(data.get("contact")),
      territory: String(data.get("territory")),
      context: String(data.get("context")),
    });
  }

  async function copyRequest(request: PreparedRequest) {
    const summary = [
      "PRISE DE CONTACT MBÀMBULAAN",
      "",
      "Objet : " + request.subject,
      "Organisation ou profil : " + request.organization,
      "Contact : " + request.contact,
      "Territoire : " + request.territory,
      "",
      "Message :",
      request.context,
    ].join("\n");
    await navigator.clipboard?.writeText(summary);
    setCopied(true);
  }

  if (prepared) return <section aria-live="polite" className="border border-[var(--mb-ocean-600)]/25 bg-white">
    <header className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-foam)] px-5 py-5"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Prise de contact</p><h2 className="mt-2 text-[22px] font-semibold text-[var(--mb-navy-900)]">Votre message est prêt</h2><p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]">Relisez les éléments puis copiez le récapitulatif pour le partager par le canal convenu.</p></header>
    <dl className="divide-y divide-[var(--mb-neutral-100)] px-5"><SummaryRow label="Objet" value={prepared.subject} /><SummaryRow label="Profil" value={prepared.organization} /><SummaryRow label="Contact" value={prepared.contact} /><SummaryRow label="Territoire" value={prepared.territory} /><SummaryRow label="Message" value={prepared.context} /></dl>
    <div className="flex flex-col gap-3 border-t border-[var(--mb-neutral-200)] p-5 sm:flex-row"><button type="button" onClick={() => copyRequest(prepared)} className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">{copied ? "Récapitulatif copié" : "Copier le récapitulatif"}</button><button type="button" onClick={() => { setPrepared(null); setCopied(false); }} className="inline-flex h-11 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] px-5 text-[11px] font-bold text-[var(--mb-navy-900)]">Modifier</button></div>
    <p className="border-t border-[var(--mb-neutral-100)] px-5 py-3 text-[9px] text-[var(--mb-neutral-400)]">Cette version prépare la prise de contact sans effectuer d’envoi automatique.</p>
  </section>;

  return <form onSubmit={prepareRequest} className="border border-[var(--mb-neutral-200)] bg-white p-5 sm:p-7">
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Je souhaite"><select name="subject" defaultValue="initiative" required className={inputClass}><option value="initiative">Faire connaître une initiative ou un besoin</option><option value="contribution">Contribuer à un projet</option><option value="information">Partager une information, un événement ou un témoignage</option><option value="partenariat">Proposer un partenariat ou un soutien</option><option value="autre">Autre prise de contact</option></select></Field>
      <Field label="Organisation ou profil"><input name="organization" required placeholder="Pêcheur, groupement, ONG, particulier…" className={inputClass} /></Field>
      <Field label="Nom et contact"><input name="contact" required placeholder="Votre nom et un moyen de vous recontacter" className={inputClass} /></Field>
      <Field label="Territoire concerné"><input name="territory" required placeholder="Localité, région, quai ou national" className={inputClass} /></Field>
    </div>
    <div className="mt-5"><Field label="Votre message"><textarea name="context" required rows={6} placeholder="Expliquez simplement ce que vous souhaitez partager, proposer, rechercher ou rejoindre." className={`${inputClass} min-h-36 py-3`} /></Field></div>
    <button type="submit" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white hover:bg-[var(--mb-navy-900)] sm:w-auto">Préparer mon message</button>
    <p className="mt-3 text-[9px] leading-4 text-[var(--mb-neutral-400)]">Aucun envoi automatique dans cette version. Le récapitulatif reste dans votre navigateur.</p>
  </form>;
}

const inputClass = "min-h-11 w-full rounded-[3px] border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-3 text-[12px] text-[var(--mb-neutral-900)] outline-none focus:border-[var(--mb-ocean-600)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]">{label}{children}</label>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"><dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{label}</dt><dd className="whitespace-pre-wrap text-[12px] leading-5 text-[var(--mb-neutral-900)]">{value}</dd></div>;
}
