"use client";

import type { GeneratedArtifact } from "@/data/ministryValueJourneyData";
import { primaryButton } from "./MinistryControlTowerParts";

export type DocumentSectionData = {
  title: string;
  items: Array<{ label: string; value: string }>;
};

export type GeneratedDocument = {
  title: string;
  documentType: string;
  perimeter: string;
  createdAt: string;
  validator: string;
  sourceNote: string;
  sections: DocumentSectionData[];
  filename: string;
};

export function artifactToDocument(artifact: GeneratedArtifact): GeneratedDocument {
  return {
    title: artifact.title,
    documentType: artifact.documentType || "Document institutionnel",
    perimeter: artifact.scope,
    createdAt: artifact.createdAt,
    validator: artifact.validator,
    sourceNote: "Données simulées Mbàmbulaan, consolidées avec validation humaine.",
    sections: artifact.sections || [{ title: "Synthèse", items: [{ label: "Objet", value: artifact.summary }, { label: "Preuve", value: artifact.id }] }],
    filename: artifact.filename,
  };
}

export function DocumentPreview({ document, compact = false }: { document: GeneratedDocument; compact?: boolean }) {
  return <article className="overflow-hidden border border-[var(--mb-neutral-200)] bg-white">
    <DocumentHeader document={document} compact={compact} />
    <DocumentMetaGrid document={document} />
    <div className={compact ? "grid gap-2 p-3" : "grid gap-4 p-4"}>
      {document.sections.map((section, sectionIndex) => <DocumentSection key={`${section.title}-${sectionIndex}`} section={section} compact={compact} />)}
      <section className="border-l-2 border-[var(--mb-green-600)] bg-[var(--mb-green-600)]/[0.06] px-3 py-2">
        <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--mb-green-600)]">Validation</p>
        <p className="mt-1 text-[10px] font-semibold text-[var(--mb-navy-900)]">Document transmissible après validation humaine</p>
      </section>
    </div>
    <DocumentFooter />
  </article>;
}

export function PrintReadyDocumentButton({ document, compact = false }: { document: GeneratedDocument; compact?: boolean }) {
  function openPrintDocument() {
    const popup = window.open("", "_blank");
    if (!popup) return;
    popup.document.open();
    popup.document.write(renderPrintDocument(document));
    popup.document.close();
    popup.focus();
  }

  return <button onClick={openPrintDocument} className={compact ? "text-[9px] font-bold text-[var(--mb-ocean-600)] hover:underline" : primaryButton}>
    {compact ? "Ouvrir le document" : "Ouvrir et enregistrer en PDF"}
  </button>;
}

function DocumentHeader({ document, compact }: { document: GeneratedDocument; compact: boolean }) {
  return <header className={`bg-[linear-gradient(110deg,var(--mb-navy-900),var(--mb-ocean-600))] text-white ${compact ? "px-3 py-3" : "px-4 py-5"}`}>
    <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/60">Mbàmbulaan · Coordination maritime</p><h3 className={`mt-2 font-semibold ${compact ? "text-[13px]" : "text-[17px]"}`}>{document.title}</h3><p className="mt-1 text-[9px] text-white/60">{document.documentType}</p></div><span className="border border-white/20 px-2 py-1 font-mono text-[8px] text-white/70">DOCUMENT</span></div>
  </header>;
}

function DocumentMetaGrid({ document }: { document: GeneratedDocument }) {
  return <dl className="grid grid-cols-2 border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] sm:grid-cols-4">{[["Périmètre", document.perimeter], ["Date", document.createdAt], ["Validateur", document.validator], ["Source", "Mbàmbulaan · mock"]].map(([label, value], index) => <div key={`${label}-${index}`} className="min-w-0 border-r border-[var(--mb-neutral-200)] px-3 py-2 last:border-r-0"><dt className="font-mono text-[8px] uppercase text-[var(--mb-neutral-400)]">{label}</dt><dd className="mt-1 truncate text-[9px] font-semibold text-[var(--mb-neutral-900)]">{value}</dd></div>)}</dl>;
}

function DocumentSection({ section, compact }: { section: DocumentSectionData; compact: boolean }) {
  return <section><h4 className="border-b border-[var(--mb-ocean-600)]/25 pb-1.5 text-[10px] font-bold text-[var(--mb-navy-900)]">{section.title}</h4><dl className={compact ? "mt-1" : "mt-2"}>{section.items.map((item, itemIndex) => <div key={`${item.label}-${itemIndex}`} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2 border-b border-[var(--mb-neutral-100)] py-1.5 text-[9px]"><dt className="text-[var(--mb-neutral-600)]">{item.label}</dt><dd className="font-semibold leading-4 text-[var(--mb-neutral-900)]">{item.value}</dd></div>)}</dl></section>;
}

function DocumentFooter() {
  return <footer className="border-t border-[var(--mb-neutral-200)] px-3 py-2 text-center font-mono text-[7px] uppercase tracking-[0.05em] text-[var(--mb-neutral-400)]">Document généré par Mbàmbulaan · infrastructure de coordination de la filière pêche artisanale</footer>;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

function renderPrintDocument(document: GeneratedDocument) {
  const sections = document.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2>${section.items.map((item) => `<div class="row"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("")}</section>`).join("");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(document.filename)}</title><style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#102f4b;font-family:Arial,sans-serif;background:#edf4f5}.sheet{max-width:794px;margin:24px auto;background:#fff;border:1px solid #d8e1e5}.head{padding:34px 38px;background:linear-gradient(115deg,#0b1f33,#237894);color:white}.brand{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;opacity:.65}h1{margin:14px 0 5px;font-size:25px}.type{margin:0;font-size:12px;opacity:.7}.meta{display:grid;grid-template-columns:repeat(4,1fr);background:#f5f7f6;border-bottom:1px solid #d8e1e5}.meta div{padding:12px;border-right:1px solid #d8e1e5}.meta span,.row span{display:block;color:#687985;font-size:9px;text-transform:uppercase;letter-spacing:.5px}.meta strong{display:block;margin-top:5px;font-size:10px}.body{padding:26px 38px}section{margin-bottom:22px}h2{font-size:13px;border-bottom:2px solid #2a8099;padding-bottom:7px}.row{display:grid;grid-template-columns:150px 1fr;gap:18px;padding:9px 0;border-bottom:1px solid #e8edef}.row strong{font-size:11px;line-height:1.5}.valid{border-left:3px solid #268567;background:#eef8f4;padding:12px;font-size:11px;font-weight:bold}.foot{padding:14px 38px;border-top:1px solid #d8e1e5;text-align:center;color:#788892;font-size:8px;text-transform:uppercase;letter-spacing:.5px}.actions{max-width:794px;margin:16px auto;text-align:right}.actions button{border:0;background:#123f5f;color:white;padding:11px 18px;font-weight:bold;cursor:pointer}@media print{body{background:white}.sheet{margin:0;border:0}.actions{display:none}}</style></head><body><div class="actions"><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div><article class="sheet"><header class="head"><div class="brand">Mbàmbulaan · Coordination maritime</div><h1>${escapeHtml(document.title)}</h1><p class="type">${escapeHtml(document.documentType)}</p></header><div class="meta"><div><span>Périmètre</span><strong>${escapeHtml(document.perimeter)}</strong></div><div><span>Date</span><strong>${escapeHtml(document.createdAt)}</strong></div><div><span>Validateur</span><strong>${escapeHtml(document.validator)}</strong></div><div><span>Source</span><strong>Mbàmbulaan · simulation</strong></div></div><main class="body">${sections}<div class="valid">Dossier transmissible après validation humaine</div></main><footer class="foot">Document généré par Mbàmbulaan · infrastructure de coordination de la filière pêche artisanale</footer></article></body></html>`;
}
