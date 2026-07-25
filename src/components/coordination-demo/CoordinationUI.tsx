import Link from "next/link";
import type { ReactNode } from "react";
import {
  formatDateTime,
  getStatusIndex,
  situationStatuses,
  type Situation,
  type SituationStatus,
  type Urgency
} from "@/lib/coordination-demo";

const statusStyles: Record<SituationStatus, string> = {
  Reçu: "border-[#77a9ba] bg-[#edf7fa] text-[#1c5669]",
  "En cours d’examen": "border-[#7298b7] bg-[#edf3f8] text-[#234d6d]",
  "Pris en charge": "border-[#5e9c93] bg-[#eaf6f3] text-[#1d5e55]",
  "Intervention prévue": "border-[#b69b4f] bg-[#fbf6e8] text-[#735d1e]",
  "Intervention en cours": "border-[#2f8b77] bg-[#e5f5ef] text-[#155b4b]",
  "En attente": "border-[#cc8d4c] bg-[#fff3e6] text-[#7a4617]",
  Réglé: "border-[#5d9674] bg-[#ebf6ee] text-[#285b38]"
};

export function StatusPill({ status }: { status: SituationStatus }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black ${statusStyles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

export function UrgencyPill({ urgency }: { urgency: Urgency }) {
  const style =
    urgency === "Élevée"
      ? "border-[#dc8e78] bg-[#fff0eb] text-[#8f3f2c]"
      : urgency === "Modérée"
        ? "border-[#d4ba72] bg-[#fff9e8] text-[#705a1a]"
        : "border-[#83ad9d] bg-[#edf7f2] text-[#285c4a]";
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${style}`}>Urgence {urgency.toLowerCase()}</span>;
}

export function Panel({ title, intro, action, children, className = "" }: { title: string; intro?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 w-full max-w-full overflow-hidden rounded-lg border border-[#173f3a]/12 bg-white ${className}`}>
      <header className="flex flex-col gap-3 border-b border-[#173f3a]/10 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-black text-[#153c37]">{title}</h2>
          {intro ? <p className="mt-1 text-xs font-medium leading-5 text-[#607571]">{intro}</p> : null}
        </div>
        {action}
      </header>
      <div className="min-w-0 p-5">{children}</div>
    </section>
  );
}

export function Metric({ label, value, detail, tone = "sea" }: { label: string; value: string | number; detail?: string; tone?: "sea" | "amber" | "coral" | "green" }) {
  const tones = {
    sea: "border-t-[#198f8b]",
    amber: "border-t-[#c99835]",
    coral: "border-t-[#c85e49]",
    green: "border-t-[#4d8d68]"
  };
  return (
    <article className={`min-w-0 rounded-md border border-[#173f3a]/12 border-t-4 bg-white p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#617773]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#123d38]">{value}</p>
      {detail ? <p className="mt-1 text-xs font-semibold text-[#748783]">{detail}</p> : null}
    </article>
  );
}

export function SituationCard({ situation, href, compact = false }: { situation: Situation; href: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      className="group block min-w-0 rounded-md border border-[#173f3a]/12 bg-white p-4 transition hover:border-[#3b958b] hover:bg-[#f9fdfc] focus:outline-none focus:ring-2 focus:ring-[#087c78]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#70817e]">{situation.id}</p>
          <h3 className="mt-1 text-sm font-black text-[#173d38] group-hover:text-[#087c78]">{situation.title}</h3>
          <p className="mt-1 text-xs font-semibold text-[#607571]">{situation.site}</p>
        </div>
        <StatusPill status={situation.status} />
      </div>
      {!compact ? (
        <>
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#5b706c]">{situation.description}</p>
          <div className="mt-4 border-l-2 border-[#64aaa0] pl-3">
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#087c78]">Prochaine étape</p>
            <p className="mt-1 text-xs font-bold leading-5 text-[#284a45]">{situation.nextStep}</p>
          </div>
        </>
      ) : null}
    </Link>
  );
}

export function NextStep({ situation }: { situation: Situation }) {
  return (
    <div className={`min-w-0 w-full max-w-full rounded-md border p-4 [overflow-wrap:anywhere] ${situation.status === "Réglé" ? "border-[#80ae8f] bg-[#eff8f1]" : "border-[#79aaa2] bg-[#edf8f5]"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#087c78]">
        {situation.status === "Réglé" ? "Résultat" : "Ce qui doit se passer ensuite"}
      </p>
      <p className="mt-2 break-words text-sm font-black leading-6 text-[#173d38]">{situation.nextStep}</p>
      <div className="mt-3 grid gap-2 text-xs font-semibold text-[#58706b] sm:grid-cols-2">
        <p><span className="font-black text-[#284c47]">Qui :</span> {situation.nextActor}</p>
        <p><span className="font-black text-[#284c47]">Quand :</span> {situation.nextDue}</p>
      </div>
    </div>
  );
}

export function Progress({ status }: { status: SituationStatus }) {
  const current = getStatusIndex(status);
  return (
    <ol className="grid grid-cols-7 gap-1" aria-label={`Progression : ${status}`}>
      {situationStatuses.map((item, index) => (
        <li key={item} className="min-w-0">
          <div className={`h-1.5 rounded-full ${index <= current ? "bg-[#198f8b]" : "bg-[#dce7e4]"}`} />
          <span className={`mt-2 hidden text-[9px] font-bold leading-3 xl:block ${index === current ? "text-[#087c78]" : "text-[#82918e]"}`}>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function Timeline({ situation, simplified = false }: { situation: Situation; simplified?: boolean }) {
  const entries = simplified ? situation.history.slice(-4) : situation.history;
  return (
    <ol className="space-y-0">
      {entries.map((entry, index) => (
        <li key={entry.id} className="grid grid-cols-[3.25rem_1rem_1fr] gap-2">
          <time className="pt-0.5 text-right font-mono text-[10px] font-bold text-[#758783]">{entry.at}</time>
          <div className="flex flex-col items-center">
            <span className="mt-1 h-2.5 w-2.5 rounded-full border-2 border-[#3a958b] bg-white" />
            {index < entries.length - 1 ? <span className="h-full min-h-12 w-px bg-[#c7dcd7]" /> : null}
          </div>
          <div className="pb-5">
            <p className="text-xs font-black text-[#244a45]">{entry.label}</p>
            <p className="mt-1 text-xs leading-5 text-[#647a76]">{entry.detail}</p>
            <p className="mt-1 text-[10px] font-bold text-[#879591]">{entry.author}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SituationFacts({ situation, terrain = false }: { situation: Situation; terrain?: boolean }) {
  const rows = [
    ["Site", situation.site],
    ["Remontée le", formatDateTime(situation.reportedAt)],
    ["Urgence", situation.urgency],
    ["Responsable", situation.responsible ?? "En cours de désignation"],
    ["Échéance", situation.dueAt ? formatDateTime(situation.dueAt) : "À définir"]
  ];
  if (!terrain) rows.push(["Coordinateur", situation.coordinator ?? "Non désigné"]);
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[10px] font-black uppercase tracking-[0.1em] text-[#758682]">{label}</dt>
          <dd className="mt-1 break-words text-xs font-bold leading-5 text-[#284a45]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#99b9b3] bg-[#f8fbfa] p-6 text-center">
      <p className="text-sm font-black text-[#214a44]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#657a76]">{detail}</p>
    </div>
  );
}
