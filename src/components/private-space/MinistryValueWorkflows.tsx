"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { GeneratedArtifact, WorkflowKind } from "@/data/ministryValueJourneyData";
import { DataTrustBadge, primaryButton, secondaryButton, StatusBadge } from "./MinistryControlTowerParts";
import { artifactToDocument, DocumentPreview, PrintReadyDocumentButton } from "./InstitutionalDocuments";

export type WorkflowContext = {
  title: string;
  scope: string;
  sourceId?: string;
  description?: string;
  amount?: string;
  beneficiaries?: string;
  partner?: string;
  quayId?: string;
  needId?: string;
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
  const steps = workflowSteps(kind);

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
    const sections = buildDocumentSections(kind, context, values, fields);
    const next: GeneratedArtifact = {
      id: `artifact-${kind}-${Date.now()}`,
      kind,
      title: `${artifactLabel} · ${context.title}`,
      createdAt,
      scope: context.scope,
      validator,
      summary: values.finding || values.justification || values.summary || values.description || purpose,
      filename: institutionalFilename(kind, context.scope, filename),
      content: lines.join("\n"),
      documentType: artifactLabel,
      sections,
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
        <section className="border-l-2 border-[var(--mb-sand-300)] bg-white px-3 py-2.5"><p className="font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">Ce que cette action produira</p><p className="mt-1 text-[10px] font-semibold leading-4 text-[var(--mb-navy-900)]">{outputPromise(kind)}</p></section>
        <ObjectSummary context={context} />
        <OperationalChain kind={kind} />
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
          <DocumentPreview document={artifactToDocument(artifact)} />
          <div className="flex gap-2"><PrintReadyDocumentButton document={artifactToDocument(artifact)} /><button onClick={onClose} className={secondaryButton}>Fermer</button></div>
        </div> : null}
      </div>
    </div>
  </div>;
}

export function VerificationDrawer(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="verification" title="Demander une vérification terrain" purpose="La cellule régionale assigne un contrôle local. La confiance restera Déclarée jusqu’au dépôt d’un constat." artifactLabel="Demande de vérification" filename="DemandeVerification" fields={[
    { name: "recipient", label: "Destinataire mandaté", required: true, defaultValue: "Agent territorial du quai" },
    { name: "channel", label: "Canal pilote", type: "select", required: true, options: ["WhatsApp structuré", "Application terrain"] },
    { name: "dueDate", label: "Échéance", type: "date", required: true },
    { name: "requestMessage", label: "Message structuré", type: "textarea", required: true, defaultValue: `VÉRIFICATION DEMANDÉE · ${props.context.title} · Merci de confirmer sur place et répondre avec une photo.` },
  ]} />;
}

export function AlertCreationForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="alert" title="Signaler une situation" purpose="Enregistrer une observation, la faire qualifier par la cellule régionale puis l’escalader en alerte si nécessaire." artifactLabel="Fiche de signalement" filename="SignalementOperationnel" fields={[
    { name: "alertType", label: "Type d’alerte", type: "select", required: true, options: ["Tension de zone", "Écart de déclaration", "Incident technique", "Risque de sécurité"] },
    { name: "severity", label: "Criticité", type: "select", required: true, options: ["Normale", "Vigilance", "Critique"] },
    { name: "description", label: "Description", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "owner", label: "Responsable assigné", required: true, defaultValue: "Cellule territoriale" },
    { name: "dueDate", label: "Échéance", type: "date", required: true },
  ]} />;
}

export function QualificationForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="qualification" title="Qualifier un besoin" purpose="Transformer une remontée terrain en besoin chiffré, mature et documenté." artifactLabel="Fiche de besoin qualifié" filename="BesoinQualifie" fields={[
    { name: "category", label: "Catégorie", type: "select", required: true, options: ["Équipement", "Formation", "Infrastructure", "Financement direct"] },
    { name: "actorsAffected", label: "Acteurs concernés", type: "number", required: true, defaultValue: props.context.beneficiaries || "250" },
    { name: "estimatedAmount", label: "Montant estimé FCFA", type: "number", required: true, defaultValue: props.context.amount || "25000000" },
    { name: "maturityScore", label: "Score de maturité / 100", type: "number", required: true, defaultValue: "72" },
    { name: "community", label: "Communauté concernée", required: true, defaultValue: props.context.scope },
    { name: "requiredEvidence", label: "Preuves requises", type: "textarea", required: true, defaultValue: "Compte rendu terrain, estimation budgétaire, liste des bénéficiaires." },
  ]} />;
}

export function FundingRequestForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="funding" title="Constituer un dossier de financement" purpose="Transformer un besoin qualifié en livrable transmissible à un partenaire ou bailleur. La transmission restera à confirmer manuellement." artifactLabel="Dossier constitué — non encore transmis" filename="DossierFinancement" fields={[
    { name: "sourceNeed", label: "Besoin source", required: true, defaultValue: props.context.title },
    { name: "estimatedAmount", label: "Montant estimé FCFA", type: "number", required: true, defaultValue: props.context.amount || "50000000" },
    { name: "amountRequested", label: "Montant demandé FCFA", type: "number", required: true, defaultValue: props.context.amount || "50000000" },
    { name: "justification", label: "Justification", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "beneficiaryCount", label: "Nombre de bénéficiaires", type: "number", required: true, defaultValue: props.context.beneficiaries || "400" },
    { name: "beneficiaryType", label: "Type de bénéficiaires", required: true, defaultValue: "Pêcheurs, mareyeurs et transformatrices" },
    { name: "targetFunder", label: "Partenaire ou bailleur cible", required: true, defaultValue: props.context.partner || "Programme public froid" },
    { name: "expectedImpact", label: "Impact attendu", type: "textarea", required: true, defaultValue: "Réduire les pertes, sécuriser les revenus et fiabiliser la chaîne de valeur." },
    { name: "requiredDocuments", label: "Pièces requises", type: "textarea", required: true, defaultValue: "Fiche besoin, budget, preuve terrain, liste des bénéficiaires." },
    { name: "ministryUnit", label: "Unité ministérielle responsable", required: true, defaultValue: "Direction de la pêche artisanale" },
    { name: "maturityScore", label: "Score de maturité / 100", type: "number", required: true, defaultValue: "82" },
    { name: "eligibilityStatus", label: "Statut initial du dossier", type: "select", required: true, defaultValue: "Dossier constitué", options: ["Dossier constitué"] },
  ]} />;
}

export function ProgramAssociationForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="program" title="Associer un programme" purpose="Relier le besoin à une réponse existante et fixer le prochain jalon." artifactLabel="Décision d’association programme" filename="AssociationProgramme" fields={[
    { name: "program", label: "Programme sélectionné", type: "select", required: true, options: ["Programme public froid", "Sécurité pirogues", "Pesée et traçabilité", "Métiers bleus"] },
    { name: "matchReason", label: "Motif du rapprochement", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "expectedImpact", label: "Impact attendu", required: true, defaultValue: "Réponse coordonnée et suivi consolidé." },
    { name: "owner", label: "Responsable", required: true, defaultValue: "Service programmes" },
    { name: "nextMilestone", label: "Prochain jalon", type: "date", required: true },
  ]} />;
}

export function PartnerMobilizationForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="partner" title="Solliciter un partenaire" purpose="Formaliser la contribution attendue et générer une note de sollicitation." artifactLabel="Note de sollicitation partenaire" filename="SollicitationPartenaire" fields={[
    { name: "partnerCategory", label: "Catégorie de partenaire", type: "select", required: true, options: ["Programme public", "Bailleur", "Partenaire technique", "ONG", "Collectivité", "Recherche / biodiversité", "Chaîne du froid / équipement"] },
    { name: "partner", label: "Partenaire", required: true, defaultValue: props.context.partner || "Partenaire technique" },
    { name: "supportType", label: "Type d’appui", type: "select", required: true, options: ["Financement", "Appui technique", "Équipement", "Formation"] },
    { name: "requestedContribution", label: "Contribution demandée", required: true, defaultValue: props.context.amount || "Appui à définir" },
    { name: "responseDate", label: "Date de réponse attendue", type: "date", required: true },
    { name: "partnerNote", label: "Note au partenaire", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "owner", label: "Responsable du suivi", required: true, defaultValue: "Cellule partenariats" },
  ]} />;
}

export function InstitutionalNoteBuilder(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="note" title="Générer la note au Ministre" purpose="Produire une synthèse décisionnelle avec recommandations d’arbitrage et sources associées." artifactLabel="Note au Ministre" filename="NoteMinistre" fields={[
    { name: "period", label: "Période", type: "select", required: true, options: ["Situation du jour", "7 derniers jours", "30 derniers jours"] },
    { name: "metrics", label: "Indicateurs retenus", type: "textarea", required: true, defaultValue: "Quais actifs, volumes, alertes, vérifications, opportunités de financement." },
    { name: "recommendations", label: "Recommandations", type: "textarea", required: true, defaultValue: props.context.description },
    { name: "summary", label: "Résumé pour décision", type: "textarea", required: true, defaultValue: "Prioriser les alertes critiques et instruire les opportunités de financement matures." },
  ]} />;
}

export function ZoneExportForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="export-zone" title="Générer un rapport de zone" purpose="Produire un document daté sur une zone et une période pour transmission à une direction, un partenaire ou un programme." artifactLabel="Rapport de zone" filename="RapportZone" fields={[
    { name: "perimeter", label: "Périmètre", required: true, defaultValue: props.context.scope },
    { name: "period", label: "Période", type: "select", required: true, options: ["Aujourd’hui", "7 derniers jours", "30 derniers jours"] },
    { name: "layers", label: "Couches incluses", type: "textarea", required: true, defaultValue: "Quais, pirogues, débarquements, alertes, incidents." },
    { name: "description", label: "Objet de l’export", required: true, defaultValue: props.context.description || "Relevé opérationnel du périmètre actif." },
  ]} />;
}

export function FullRecordPanel(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="full-record" title="Voir le détail complet" purpose="Consulter l’historique, les preuves, les signalements, les vérifications et les documents liés." artifactLabel="Dossier opérationnel" filename="DossierOperationnel" fields={[
    { name: "history", label: "Historique consolidé", type: "textarea", required: true, defaultValue: props.context.description || "Déclaration reçue, contrôle en cours, dernier signal consolidé." },
    { name: "linkedDocuments", label: "Documents liés", defaultValue: "Déclarations, preuves terrain, alertes et débarquements." },
    { name: "consultationReason", label: "Motif de consultation", required: true, defaultValue: "Instruction opérationnelle" },
  ]} />;
}

export function InstitutionalExportForm(props: WorkflowWrapperProps) {
  return <ProcessDrawer {...props} kind="institutional-export" title="Exporter le dossier de synthèse" purpose="Générer un livrable structuré pour transmission et archivage." artifactLabel="Dossier de synthèse" filename="DossierSynthese" fields={[
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
  return <div className="divide-y divide-[var(--mb-neutral-100)]">{artifacts.map((artifact) => <div key={artifact.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2.5"><div><p className="text-[10px] font-semibold text-[var(--mb-neutral-900)]">{artifact.title}</p><p className="mt-1 font-mono text-[9px] text-[var(--mb-neutral-600)]">{artifact.createdAt} · {artifact.validator}</p><div className="mt-1.5"><DataTrustBadge level={artifactTrustLevel(artifact.kind)} compact source={`Document local ${artifact.id} · validateur : ${artifact.validator}.`} /></div></div><PrintReadyDocumentButton document={artifactToDocument(artifact)} compact /></div>)}</div>;
}

function artifactTrustLevel(kind: WorkflowKind) {
  if (["note", "institutional-export", "export-zone", "full-record"].includes(kind)) return "consolidated" as const;
  if (["verification", "alert", "partner"].includes(kind)) return "declared" as const;
  return "verified" as const;
}

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return <div className="grid grid-cols-4 border-b border-[var(--mb-neutral-200)] bg-white">{steps.map((step, index) => <div key={step} className={`border-r border-[var(--mb-neutral-100)] px-2 py-2 last:border-r-0 ${index <= current ? "border-b-2 border-b-[var(--mb-ocean-600)]" : "border-b-2 border-b-transparent"}`}><p className="font-mono text-[9px] text-[var(--mb-neutral-400)]">0{index + 1}</p><p className="mt-0.5 text-[9px] font-bold text-[var(--mb-neutral-600)]">{step}</p></div>)}</div>;
}

function OperationalChain({ kind }: { kind: WorkflowKind }) {
  const chains: Partial<Record<WorkflowKind, Array<[string, string]>>> = {
    verification: [["Lanceur", "Cellule régionale / direction technique"], ["Destinataire", "Agent territorial ou référent mandaté"], ["Canal pilote", "Application terrain ou WhatsApp structuré"], ["Retour attendu", "Constat, pièce, horodatage, vérificateur"], ["Clôture", "Cellule régionale après contrôle"], ["Historique", "Dossier complet + registre régional"]],
    alert: [["Émetteur", "Référent ou agent territorial"], ["Réception", "Cellule régionale"], ["Qualification", "Direction technique régionale"], ["Escalade", "Alerte si criticité confirmée"], ["Clôture", "Responsable assigné après traitement"], ["Historique", "Registre régional"]],
    funding: [["Prépare", "Service programmes / cellule régionale"], ["Valide", "Direction technique habilitée"], ["Reçoit", "Partenaire ou bailleur ciblé"], ["Clôture", "Service programmes après décision"], ["Historique", "Dossier + registre des financements"]],
    note: [["Prépare", "Direction technique"], ["Consolide", "Cellule de pilotage"], ["Valide", "Responsable habilité"], ["Reçoit", "Cabinet / Ministre"], ["Historique", "Registre institutionnel"]],
  };
  const chain = chains[kind];
  if (!chain) return null;
  return <section className="mt-3 border border-[var(--mb-neutral-200)] bg-white"><h3 className="border-b border-[var(--mb-neutral-200)] px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Chaîne opérationnelle</h3><dl className="grid sm:grid-cols-2">{chain.map(([label, value]) => <div key={label} className="border-b border-r border-[var(--mb-neutral-100)] px-3 py-2"><dt className="font-mono text-[8px] uppercase text-[var(--mb-neutral-400)]">{label}</dt><dd className="mt-1 text-[9px] font-semibold leading-4 text-[var(--mb-navy-900)]">{value}</dd></div>)}</dl></section>;
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
  return <section className="border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] px-3 py-2.5"><p className="font-mono text-[9px] text-[var(--mb-ocean-600)]">ÉLÉMENT CONCERNÉ</p><p className="mt-1 text-[12px] font-semibold text-[var(--mb-navy-900)]">{context.title}</p><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{context.scope}{context.sourceId ? ` · ${context.sourceId}` : ""}</p></section>;
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

function fieldLabel(fields: FieldDefinition[], key: string) {
  if (key === "validator") return "Validation humaine";
  return fields.find((field) => field.name === key)?.label || key;
}

function institutionalFilename(kind: WorkflowKind, scope: string, fallback: string) {
  const date = new Date().toISOString().slice(0, 10);
  const perimeter = scope.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-");
  const prefix = kind === "funding" ? "DossierFinancement" : kind === "note" ? "NoteMinistre" : kind === "export-zone" ? "RapportZone" : kind === "institutional-export" ? "DossierSynthese" : fallback;
  return `Mbambulaan_${prefix}_${perimeter}_${date}.html`;
}

function buildDocumentSections(kind: WorkflowKind, context: WorkflowContext, values: Record<string, string>, fields: FieldDefinition[]) {
  const entries = Object.entries(values).filter(([key]) => key !== "validator").map(([key, value]) => ({ label: fieldLabel(fields, key), value }));
  if (kind === "funding") return [
    { title: "Besoin et périmètre", items: [{ label: "Besoin source", value: values.sourceNeed }, { label: "Périmètre", value: context.scope }, { label: "Montant estimé", value: `${values.estimatedAmount} FCFA` }, { label: "Montant demandé", value: `${values.amountRequested} FCFA` }] },
    { title: "Bénéficiaires et partenaire", items: [{ label: "Bénéficiaires", value: `${values.beneficiaryCount} · ${values.beneficiaryType}` }, { label: "Partenaire cible", value: values.targetFunder }, { label: "Unité responsable", value: values.ministryUnit }] },
    { title: "Éligibilité et impact", items: [{ label: "Maturité", value: `${values.maturityScore}/100` }, { label: "Statut", value: values.eligibilityStatus }, { label: "Impact attendu", value: values.expectedImpact }, { label: "Preuves attachées", value: values.requiredDocuments }] },
  ];
  return [{ title: "Objet et décision", items: [{ label: "Objet", value: context.title }, { label: "Périmètre", value: context.scope }, ...entries] }];
}

function workflowSteps(kind: WorkflowKind) {
  if (kind === "verification") return ["Demande", "Assignation", "Validation", "Tâche"];
  if (kind === "alert") return ["Signalement", "Criticité", "Qualification", "Trace"];
  if (kind === "funding") return ["Montant", "Bénéficiaires", "Pièces", "Aperçu"];
  if (kind === "note") return ["Périmètre", "Éléments", "Synthèse", "Aperçu"];
  return ["Instruction", "Contrôle", "Validation", "Preuve"];
}

function outputPromise(kind: WorkflowKind) {
  const messages: Record<WorkflowKind, string> = {
    verification: "Une tâche de vérification assignée et traçable. Le niveau de confiance n’évoluera qu’après dépôt du constat terrain.",
    alert: "Un signalement daté reçu par la cellule régionale, qualifiable en incident ou escaladable en alerte.",
    "full-record": "Un dossier consolidé réunissant identité, historique, événements et preuves.",
    "export-zone": "Un rapport de zone prêt à imprimer avec carte, statuts et événements.",
    qualification: "Une fiche qualifiée permettant d’évaluer le besoin pour un financement.",
    funding: "Un dossier de financement structuré ajouté au registre avec le statut Transmission à confirmer.",
    program: "Une décision d’association au programme et un prochain jalon traçable.",
    partner: "Une note de sollicitation au partenaire, enregistrée dans le suivi.",
    note: "Une note au Ministre reprenant la situation et les décisions en attente.",
    "institutional-export": "Un dossier de synthèse prêt à transmettre à l’extérieur.",
  };
  return messages[kind];
}
