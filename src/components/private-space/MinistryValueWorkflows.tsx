"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { GeneratedArtifact, WorkflowKind } from "@/data/ministryValueJourneyData";
import { primaryButton, secondaryButton, StatusBadge } from "./MinistryControlTowerParts";

export type WorkflowContext = {
  title: string;
  scope: string;
  sourceId?: string;
  description?: string;
  amount?: string;
  beneficiaries?: string;
  partner?: string;
  quayId?: string;
};

type FieldDefinition = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  defaultValue?: string;
  options?: string[];
};

type ProcessDrawerProps = {
  kind: WorkflowKind;
  title: string;
  purpose: string;
  context: WorkflowContext;
  fields: FieldDefinition[];
  artifactLabel: string;
  filename: string;
  onClose: () => void;
  onComplete: (artifact: GeneratedArtifact, values: Record<string, string>) => void;
};

export function ProcessDrawer({ kind, title, purpose, context, fields, artifactLabel, filename, onClose, onComplete }: ProcessDrawerProps) {
  const [phase, setPhase] = useState<"form" | "review" | "done">("form");
  const [values, setValues] = useState<Record<string, string>>({});
  const [artifact, setArtifact] = useState<GeneratedArtifact | null>(null);
  const steps = ["Instruction", "Contrôle", "Validation", "Preuve"];

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setValues(Object.fromEntries(Array.from(form.entries()).map(([key, value]) => [key, String(value)])));
    setPhase("review");
  }

  function validate() {
    const createdAt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date());
    const validator = values.validator || values.owner || "Agent habilité · Démonstration";
    const lines = [
      "MBÀMBULAAN — CONSOLE DE COORDINATION MARITIME",
      artifactLabel.toUpperCase(),
      `Objet : ${context.title}`,
      `Périmètre : ${context.scope}`,
      `Généré le : ${createdAt}`,
      `Validation humaine : ${validator}`,
      "",
      ...Object.entries(values).map(([key, value]) => `${fieldLabel(fields, key)} : ${value}`),
      "",
      "Statut : preuve générée en simulation locale",
    ];
    const next: GeneratedArtifact = {
      id: `artifact-${kind}-${Date.now()}`,
      kind,
      title: `${artifactLabel} · ${context.title}`,
      createdAt,
      scope: context.scope,
      validator,
      summary: values.finding || values.justification || values.summary || values.description || purpose,
      filename,
      content: lines.join("\n"),
    };
    setArtifact(next);
    setPhase("done");
    onComplete(next, values);
  }

  return <div className="fixed inset-0 z-[100] flex justify-end bg-[var(--mb-navy-900)]/45" role="dialog" aria-modal="true" aria-label={title}>
    <div className="flex h-full w-full max-w-[520px] flex-col border-l border-white/10 bg-[var(--mb-offwhite)]">
      <header className="flex items-start justify-between gap-4 border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] px-4 py-3 text-white">
        <div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--mb-ocean-400)]">Parcours avec preuve</p><h2 className="mt-1 text-[17px] font-semibold">{title}</h2><p className="mt-1 text-[10px] leading-4 text-white/55">{purpose}</p></div>
        <button onClick={onClose} className="h-8 w-8 rounded-[3px] border border-white/15 text-[14px] text-white/70 hover:text-white" aria-label="Fermer">×</button>
      </header>

      <StepIndicator steps={steps} current={phase === "form" ? 0 : phase === "review" ? 2 : 3} />

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <ObjectSummary context={context} />
        {phase === "form" ? <form onSubmit={submitForm} className="mt-4 grid gap-4">
          <FormSection title="Instruction structurée">
            {fields.map((field) => <WorkflowField key={field.name} field={field} />)}
          </FormSection>
          <FormSection title="Validation humaine">
            <WorkflowField field={{ name: "validator", label: "Nom et rôle du validateur", required: true, defaultValue: "A. Diouf · Agent habilité" }} />
            <label className="flex items-start gap-2 text-[10px] leading-4 text-[var(--mb-neutral-600)]"><input required type="checkbox" className="mt-0.5 accent-[var(--mb-ocean-600)]" /><span>Je confirme avoir relu les informations et autorise la génération de la preuve simulée.</span></label>
          </FormSection>
          <button type="submit" className={primaryButton}>Examiner avant validation</button>
        </form> : null}

        {phase === "review" ? <div className="mt-4 grid gap-4">
          <ReviewBlock title="Contrôle avant validation" values={values} fields={fields} />
          <ValidationStamp validator={values.validator} />
          <div className="flex gap-2"><button onClick={() => setPhase("form")} className={secondaryButton}>Modifier</button><button onClick={validate} className={primaryButton}>Valider et générer la preuve</button></div>
        </div> : null}

        {phase === "done" && artifact ? <div className="mt-4 grid gap-4">
          <ProofReceipt artifact={artifact} />
          <GeneratedArtifactPreview artifact={artifact} />
          <div className="flex gap-2"><DownloadArtifactButton artifact={artifact} /><button onClick={onClose} className={secondaryButton}>Fermer</button></div>
        </div> : null}
      </div>
    </div>
  </div>;
}

export function VerificationDrawer(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="verification" title="Vérifier l’information" purpose="Recouper le signal, consigner le constat et produire une preuve de fiabilité." artifactLabel="Preuve de vérification" filename="preuve-verification-mbambulaan.txt" fields={[
    { name: "method", label: "Méthode de vérification", type: "select", required: true, options: ["Vérification terrain", "Déclaration d’acteur", "Recoupement de sources"] },
    { name: "finding", label: "Constat structuré", type: "textarea", required: true, defaultValue: props.context.description || "Information recoupée avec le relais local." },
    { name: "attachment", label: "Pièce jointe simulée", defaultValue: "photo-terrain-horodatee.jpg" },
  ]} />;
}

export function AlertCreationForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="alert" title="Créer une alerte" purpose="Qualifier le risque, assigner un responsable et inscrire l’alerte dans le suivi." artifactLabel="Fiche d’alerte" filename="alerte-operationnelle-mbambulaan.txt" fields={[
    { name: "alertType", label: "Type d’alerte", type: "select", required: true, options: ["Tension de zone", "Écart de déclaration", "Incident technique", "Risque de sécurité"] },
    { name: "severity", label: "Gravité", type: "select", required: true, options: ["Vigilance", "Critique"] },
    { name: "description", label: "Description", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "owner", label: "Responsable assigné", required: true, defaultValue: "Cellule territoriale" },
    { name: "dueDate", label: "Échéance", type: "date", required: true },
  ]} />;
}

export function QualificationForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="qualification" title="Qualifier un besoin" purpose="Transformer une remontée terrain en besoin chiffré, mature et documenté." artifactLabel="Fiche de besoin qualifié" filename="besoin-qualifie-mbambulaan.txt" fields={[
    { name: "category", label: "Catégorie", type: "select", required: true, options: ["Équipement", "Formation", "Infrastructure", "Financement direct"] },
    { name: "actorsAffected", label: "Acteurs concernés", type: "number", required: true, defaultValue: props.context.beneficiaries || "250" },
    { name: "estimatedAmount", label: "Montant estimé FCFA", type: "number", required: true, defaultValue: props.context.amount || "25000000" },
    { name: "maturityScore", label: "Score de maturité / 100", type: "number", required: true, defaultValue: "72" },
    { name: "community", label: "Communauté concernée", required: true, defaultValue: props.context.scope },
    { name: "requiredEvidence", label: "Preuves requises", type: "textarea", required: true, defaultValue: "Compte rendu terrain, estimation budgétaire, liste des bénéficiaires." },
  ]} />;
}

export function FundingRequestForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="funding" title="Créer une demande de financement" purpose="Structurer un besoin mature en dossier finançable, validé et transmissible." artifactLabel="Dossier de demande de financement" filename="dossier-financement-mbambulaan.txt" fields={[
    { name: "sourceNeed", label: "Besoin source", required: true, defaultValue: props.context.title },
    { name: "amountRequested", label: "Montant demandé FCFA", type: "number", required: true, defaultValue: props.context.amount || "50000000" },
    { name: "justification", label: "Justification", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "beneficiaryCount", label: "Nombre de bénéficiaires", type: "number", required: true, defaultValue: props.context.beneficiaries || "400" },
    { name: "beneficiaryType", label: "Type de bénéficiaires", required: true, defaultValue: "Pêcheurs, mareyeurs et transformatrices" },
    { name: "targetFunder", label: "Partenaire ou bailleur cible", required: true, defaultValue: props.context.partner || "Programme public froid" },
    { name: "expectedImpact", label: "Impact attendu", type: "textarea", required: true, defaultValue: "Réduire les pertes, sécuriser les revenus et fiabiliser la chaîne de valeur." },
    { name: "requiredDocuments", label: "Pièces requises", type: "textarea", required: true, defaultValue: "Fiche besoin, budget, preuve terrain, liste des bénéficiaires." },
    { name: "ministryUnit", label: "Unité ministérielle responsable", required: true, defaultValue: "Direction de la pêche artisanale" },
  ]} />;
}

export function ProgramAssociationForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="program" title="Associer un programme" purpose="Relier le besoin à une réponse existante et fixer le prochain jalon." artifactLabel="Décision d’association programme" filename="association-programme-mbambulaan.txt" fields={[
    { name: "program", label: "Programme sélectionné", type: "select", required: true, options: ["Programme public froid", "Sécurité pirogues", "Pesée et traçabilité", "Métiers bleus"] },
    { name: "matchReason", label: "Motif du rapprochement", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "expectedImpact", label: "Impact attendu", required: true, defaultValue: "Réponse coordonnée et suivi consolidé." },
    { name: "owner", label: "Responsable", required: true, defaultValue: "Service programmes" },
    { name: "nextMilestone", label: "Prochain jalon", type: "date", required: true },
  ]} />;
}

export function PartnerMobilizationForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="partner" title="Mobiliser un partenaire" purpose="Formaliser la contribution attendue et générer une note de sollicitation." artifactLabel="Note de sollicitation partenaire" filename="sollicitation-partenaire-mbambulaan.txt" fields={[
    { name: "partner", label: "Partenaire", required: true, defaultValue: props.context.partner || "Partenaire technique" },
    { name: "supportType", label: "Type d’appui", type: "select", required: true, options: ["Financement", "Appui technique", "Équipement", "Formation"] },
    { name: "requestedContribution", label: "Contribution demandée", required: true, defaultValue: props.context.amount || "Appui à définir" },
    { name: "responseDate", label: "Date de réponse attendue", type: "date", required: true },
    { name: "partnerNote", label: "Note au partenaire", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "owner", label: "Responsable du suivi", required: true, defaultValue: "Cellule partenariats" },
  ]} />;
}

export function InstitutionalNoteBuilder(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="note" title="Préparer une note institutionnelle" purpose="Transformer la situation, les alertes et les opportunités en recommandation écrite." artifactLabel="Note institutionnelle" filename="note-institutionnelle-mbambulaan.txt" fields={[
    { name: "period", label: "Période", type: "select", required: true, options: ["Situation du jour", "7 derniers jours", "30 derniers jours"] },
    { name: "metrics", label: "Indicateurs retenus", type: "textarea", required: true, defaultValue: "Quais actifs, volumes, alertes, vérifications, opportunités de financement." },
    { name: "recommendations", label: "Recommandations", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "summary", label: "Résumé pour décision", type: "textarea", required: true, defaultValue: "Prioriser les alertes critiques et instruire les opportunités de financement matures." },
  ]} />;
}

export function ZoneExportForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="export-zone" title="Exporter la zone" purpose="Composer un relevé lisible des couches et événements du périmètre sélectionné." artifactLabel="Relevé de zone" filename="export-zone-mbambulaan.txt" fields={[
    { name: "perimeter", label: "Périmètre", required: true, defaultValue: props.context.scope },
    { name: "period", label: "Période", type: "select", required: true, options: ["Aujourd’hui", "7 derniers jours", "30 derniers jours"] },
    { name: "layers", label: "Couches incluses", type: "textarea", required: true, defaultValue: "Quais, pirogues, débarquements, alertes, incidents." },
    { name: "description", label: "Objet de l’export", required: true, defaultValue: props.context.description || "Relevé opérationnel du périmètre actif." },
  ]} />;
}

export function FullRecordPanel(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="full-record" title="Ouvrir la fiche complète" purpose="Consulter l’identité, l’historique et les preuves liées à l’objet opérationnel." artifactLabel="Relevé de consultation" filename="fiche-complete-mbambulaan.txt" fields={[
    { name: "history", label: "Historique consolidé", type: "textarea", required: true, defaultValue: props.context.description || "Déclaration reçue, contrôle en cours, dernier signal consolidé." },
    { name: "linkedDocuments", label: "Documents liés", defaultValue: "Déclarations, preuves terrain, alertes et débarquements." },
    { name: "consultationReason", label: "Motif de consultation", required: true, defaultValue: "Instruction opérationnelle" },
  ]} />;
}

export function InstitutionalExportForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="institutional-export" title="Export institutionnel" purpose="Générer un livrable structuré pour transmission et archivage." artifactLabel="Export institutionnel" filename="export-institutionnel-mbambulaan.txt" fields={[
    { name: "format", label: "Livrable", type: "select", required: true, options: ["Rapport de synthèse", "Registre de preuve", "Registre des opportunités de financement", "Données brutes CSV"] },
    { name: "period", label: "Période", type: "select", required: true, options: ["Situation du jour", "7 derniers jours", "30 derniers jours"] },
    { name: "scope", label: "Portée", required: true, defaultValue: props.context.scope },
    { name: "summary", label: "Objet de transmission", type: "textarea", required: true, defaultValue: props.context.description },
  ]} />;
}

type WorkflowWrapperProps = {
  context: WorkflowContext;
  onClose: () => void;
  onComplete: (artifact: GeneratedArtifact, values: Record<string, string>) => void;
};

export function ArtifactRegister({ artifacts }: { artifacts: GeneratedArtifact[] }) {
  return <div className="divide-y divide-[var(--mb-neutral-100)]">{artifacts.map((artifact) => <div key={artifact.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2.5"><div><p className="text-[10px] font-semibold text-[var(--mb-neutral-900)]">{artifact.title}</p><p className="mt-1 font-mono text-[9px] text-[var(--mb-neutral-600)]">{artifact.createdAt} · {artifact.validator}</p></div><DownloadArtifactButton artifact={artifact} compact /></div>)}</div>;
}

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return <div className="grid grid-cols-4 border-b border-[var(--mb-neutral-200)] bg-white">{steps.map((step, index) => <div key={step} className={`border-r border-[var(--mb-neutral-100)] px-2 py-2 last:border-r-0 ${index <= current ? "border-b-2 border-b-[var(--mb-ocean-600)]" : "border-b-2 border-b-transparent"}`}><p className="font-mono text-[9px] text-[var(--mb-neutral-400)]">0{index + 1}</p><p className="mt-0.5 text-[9px] font-bold text-[var(--mb-neutral-600)]">{step}</p></div>)}</div>;
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border border-[var(--mb-neutral-200)] bg-white"><h3 className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold text-[var(--mb-navy-900)]">{title}</h3><div className="grid gap-3 p-3">{children}</div></section>;
}

function WorkflowField({ field }: { field: FieldDefinition }) {
  const className = "min-h-9 w-full rounded-[3px] border border-[var(--mb-neutral-200)] bg-white px-2.5 py-2 text-[11px] text-[var(--mb-neutral-900)] outline-none focus:border-[var(--mb-ocean-600)]";
  return <label className="grid gap-1 text-[9px] font-bold uppercase tracking-[0.07em] text-[var(--mb-neutral-600)]">{field.label}
    {field.type === "select" ? <select name={field.name} required={field.required} defaultValue={field.defaultValue} className={className}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : field.type === "textarea" ? <textarea name={field.name} required={field.required} defaultValue={field.defaultValue} rows={3} className={className} /> : <input name={field.name} required={field.required} defaultValue={field.defaultValue} type={field.type || "text"} className={className} />}
  </label>;
}

function ObjectSummary({ context }: { context: WorkflowContext }) {
  return <section className="border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] px-3 py-2.5"><p className="font-mono text-[9px] text-[var(--mb-ocean-600)]">OBJET DU PARCOURS</p><p className="mt-1 text-[12px] font-semibold text-[var(--mb-navy-900)]">{context.title}</p><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{context.scope}{context.sourceId ? ` · ${context.sourceId}` : ""}</p></section>;
}

function ReviewBlock({ title, values, fields }: { title: string; values: Record<string, string>; fields: FieldDefinition[] }) {
  return <section className="border border-[var(--mb-neutral-200)] bg-white"><h3 className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">{title}</h3><dl className="divide-y divide-[var(--mb-neutral-100)] px-3">{Object.entries(values).map(([key, value]) => <div key={key} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 py-2 text-[10px]"><dt className="text-[var(--mb-neutral-600)]">{fieldLabel(fields, key)}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl></section>;
}

function ValidationStamp({ validator }: { validator: string }) {
  return <div className="flex items-center justify-between border border-[var(--mb-green-600)]/25 bg-[var(--mb-green-600)]/5 px-3 py-2"><div><p className="font-mono text-[9px] font-bold text-[var(--mb-green-600)]">VALIDATION HUMAINE REQUISE</p><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{validator}</p></div><StatusBadge>Prêt à valider</StatusBadge></div>;
}

function ProofReceipt({ artifact }: { artifact: GeneratedArtifact }) {
  return <section className="border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] px-3 py-3"><p className="font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">PREUVE GÉNÉRÉE · {artifact.id}</p><h3 className="mt-1 text-[13px] font-semibold text-[var(--mb-navy-900)]">{artifact.title}</h3><p className="mt-1 text-[10px] leading-4 text-[var(--mb-neutral-600)]">{artifact.summary}</p><p className="mt-2 font-mono text-[9px] text-[var(--mb-neutral-400)]">{artifact.createdAt} · {artifact.validator}</p></section>;
}

function GeneratedArtifactPreview({ artifact }: { artifact: GeneratedArtifact }) {
  return <section className="border border-[var(--mb-neutral-200)] bg-white"><h3 className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Aperçu du document</h3><pre className="max-h-72 overflow-auto whitespace-pre-wrap p-3 font-mono text-[9px] leading-4 text-[var(--mb-neutral-600)]">{artifact.content}</pre></section>;
}

function DownloadArtifactButton({ artifact, compact = false }: { artifact: GeneratedArtifact; compact?: boolean }) {
  function download() {
    const blob = new Blob([artifact.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = artifact.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return <button onClick={download} className={compact ? "text-[9px] font-bold text-[var(--mb-ocean-600)] hover:underline" : primaryButton}>{compact ? "Télécharger" : "Télécharger le document"}</button>;
}

function fieldLabel(fields: FieldDefinition[], key: string) {
  if (key === "validator") return "Validation humaine";
  return fields.find((field) => field.name === key)?.label || key;
}
