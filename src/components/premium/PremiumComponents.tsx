import Link from "next/link";
import type { Kpi, RoleProfile, Territory, Tone, WorkspaceModule } from "@/data/mockMbambulaan";
import { actions, reports, roleProfiles, signals, territories, workspaceModules } from "@/data/mockMbambulaan";

const toneClass: Record<Tone, string> = {
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-rose-200 bg-rose-50 text-rose-800",
  slate: "border-slate-200 bg-slate-50 text-slate-800"
};

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">Mb</span>
          <span>
            <span className="block text-base font-black text-slate-950">Mbàmbulaan</span>
            <span className="hidden text-xs font-bold text-slate-500 sm:block">Operating system de coordination</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
          <Link href="/">Accueil</Link>
          <Link href="/demo">Démo</Link>
          <Link href="/demande-demo">Demander une démo</Link>
          <Link href="/devis">Demander un devis</Link>
        </nav>
        <Link href="/demo" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">Explorer</Link>
      </div>
    </header>
  );
}

export function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-slate-600 sm:text-lg">{description}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className={`rounded-[1.25rem] border p-5 shadow-sm ${toneClass[kpi.tone ?? "slate"]}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{kpi.label}</p>
      <p className="mt-4 text-3xl font-black">{kpi.value}</p>
      <p className="mt-2 text-sm font-bold opacity-75">{kpi.detail}</p>
    </div>
  );
}

export function StatusBadge({ children, tone = "slate" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${toneClass[tone]}`}>{children}</span>;
}

export function SectionCard({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          {description ? <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function RoleSelector() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {roleProfiles.map((role) => (
        <Link key={role.key} href={role.href} className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg">
          <StatusBadge tone={role.accent}>{role.label}</StatusBadge>
          <h2 className="mt-5 text-xl font-black text-slate-950">{role.promise}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{role.value}</p>
          <span className="mt-5 inline-flex text-sm font-black text-sky-700 group-hover:text-slate-950">Voir cette démo</span>
        </Link>
      ))}
    </div>
  );
}

export function RoleWorkspace({ profile }: { profile: RoleProfile }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 pb-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
      <SectionCard title="Valeur métier" description={profile.audience}>
        <div className="space-y-4">
          <InfoBlock label="Problème" value={profile.problem} />
          <InfoBlock label="Pourquoi payer" value={profile.value} />
          <InfoBlock label="Preuve montrée" value={profile.proof} />
          <InfoBlock label="Limite assumée" value={profile.limit} />
        </div>
      </SectionCard>
      <SectionCard title="Décisions à prendre" description="La démo montre ce que ce rôle peut décider, pas une vitrine générique.">
        <div className="grid gap-3">
          {profile.decisions.map((decision, index) => (
            <div key={decision} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span>
              <p className="text-sm font-black text-slate-800">{decision}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
        {profile.kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>
      <SectionCard title="Modules visibles dans cette démo" description="Chaque module est contextualisé pour le rôle actif.">
        <div className="grid gap-3 sm:grid-cols-2">
          {profile.modules.map((module) => (
            <div key={module} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-black text-slate-950">{module}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">Donnée simulée, source visible, prochaine action explicite.</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Passer au cadrage" description="Le prospect peut demander une démo ou cadrer un pilote, puis voir l'espace premium simulé.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/demande-demo" className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-black text-white">{profile.primaryCta}</Link>
          <Link href="/espace-prive" className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-black text-slate-900">Entrer dans l'espace premium simulé</Link>
        </div>
      </SectionCard>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{value}</p>
    </div>
  );
}

export function LeadForm({ kind }: { kind: "demo" | "devis" }) {
  const title = kind === "demo" ? "Préparer une démo qualifiée" : "Cadrer une offre pilote";
  const fields = kind === "demo" ? ["Organisation", "Rôle principal", "Territoire concerné", "Objectif de la démo"] : ["Organisation", "Type de pilote", "Territoires à couvrir", "Modules prioritaires"];
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 pb-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
      <SectionCard title={title} description="Simulation locale : aucune donnée n'est envoyée à un serveur.">
        <form className="grid gap-4">
          {fields.map((field) => (
            <label key={field} className="grid gap-2 text-sm font-black text-slate-800">
              {field}
              <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 outline-none focus:border-sky-400" placeholder={field} />
            </label>
          ))}
          <button type="button" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Préparer la demande</button>
        </form>
      </SectionCard>
      <SectionCard title="Après le cadrage" description="Le formulaire n'est pas la destination finale : il ouvre la suite produit.">
        <div className="grid gap-4">
          <div className="rounded-[1.25rem] bg-emerald-50 p-5 text-emerald-900">
            <p className="text-lg font-black">Demande préparée.</p>
            <p className="mt-2 text-sm font-bold leading-6">Voici l'espace auquel votre organisation pourrait accéder après cadrage.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/espace-prive" className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-black text-white">Entrer dans l'espace premium simulé</Link>
            <Link href="/demo" className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-black text-slate-900">Revenir à la démo par rôle</Link>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export function TerritoryPanel({ items = territories }: { items?: Territory[] }) {
  return (
    <div className="grid gap-3">
      {items.map((territory) => (
        <div key={territory.name} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-slate-950">{territory.name}</p>
              <p className="text-sm font-semibold text-slate-500">{territory.region}</p>
            </div>
            <StatusBadge tone={territory.tension === "Critique" ? "red" : territory.tension === "Forte" ? "amber" : "green"}>{territory.tension}</StatusBadge>
          </div>
          <p className="mt-3 text-sm font-bold text-slate-700">{territory.signals} signaux · {territory.actor}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{territory.action}</p>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed() {
  return (
    <div className="grid gap-3">
      {signals.map((signal) => (
        <div key={signal.title} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge tone="blue">{signal.territory}</StatusBadge><StatusBadge tone="slate">{signal.proof}</StatusBadge></div>
          <p className="mt-3 font-black text-slate-950">{signal.title}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{signal.source} · {signal.status}</p>
        </div>
      ))}
    </div>
  );
}

export function ActionTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500"><tr><th className="p-4">Action</th><th className="p-4">Responsable</th><th className="p-4">Territoire</th><th className="p-4">Statut</th><th className="p-4">Prochaine étape</th></tr></thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {actions.map((row) => (
            <tr key={row.action}><td className="p-4 font-black text-slate-900">{row.action}</td><td className="p-4 font-semibold text-slate-600">{row.owner}</td><td className="p-4 font-semibold text-slate-600">{row.territory}</td><td className="p-4"><StatusBadge tone={row.status === "Pret" ? "green" : "amber"}>{row.status}</StatusBadge></td><td className="p-4 font-semibold text-slate-600">{row.next}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {reports.map((report) => (
        <div key={report.title} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3"><p className="font-black text-slate-950">{report.title}</p><StatusBadge tone={report.status === "Pret" ? "green" : "amber"}>{report.status}</StatusBadge></div>
          <p className="mt-3 text-sm font-semibold text-slate-500">{report.audience}</p>
          <p className="mt-1 text-sm font-bold text-slate-700">{report.proof}</p>
        </div>
      ))}
    </div>
  );
}

export function ModuleGate({ module }: { module: WorkspaceModule }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="font-black text-slate-950">{module.name}</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{module.description}</p></div><StatusBadge tone={module.status === "Actif" ? "green" : module.status === "Pret" ? "blue" : "amber"}>{module.status}</StatusBadge></div>
      <p className="mt-4 text-2xl font-black text-slate-900">{module.metric}</p>
    </div>
  );
}

export function PremiumShell({ activeRole, roleControls }: { activeRole: RoleProfile; roleControls?: React.ReactNode }) {
  const highlighted = workspaceModules.slice(0, 6);
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[18rem_1fr]">
        <aside className="hidden border-r border-slate-800 bg-slate-950 p-5 text-white lg:block">
          <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-sm font-black text-slate-950">Mb</span><span className="font-black">Mbàmbulaan</span></Link>
          <nav className="mt-8 grid gap-2">{workspaceModules.map((module) => <a key={module.name} href={`#${module.name.toLowerCase().replaceAll(" ", "-")}`} className="rounded-2xl px-3 py-2 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white">{module.name}</a>)}</nav>
        </aside>
        <main>
          <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">Simulation premium</p><h1 className="mt-1 text-2xl font-black text-slate-950">Bienvenue dans votre espace Mbàmbulaan</h1><p className="mt-1 text-sm font-semibold text-slate-500">Organisation simulée · {activeRole.label} · Territoire pilote Petite-Côte</p></div><Link href="/devis" className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-black text-white">Cadrer l'offre</Link></div></div>
          <div className="grid gap-6 px-5 py-6 sm:px-8">
            {roleControls ? <SectionCard title="Profil actif" description="La simulation adapte les indicateurs et priorités selon le rôle choisi.">{roleControls}</SectionCard> : null}
            <div className="grid gap-4 md:grid-cols-4">{[...activeRole.kpis, { label: "Niveau preuve", value: "78%", detail: "moyenne simulation", tone: "blue" as Tone }].map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}</div>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><SectionCard title="Carte opérationnelle" description="Territoires, tensions, acteurs et actions prioritaires."><TerritoryPanel /></SectionCard><SectionCard title="Signaux qualifiés" description="Données locales avec source, statut et niveau de preuve."><ActivityFeed /></SectionCard></div>
            <SectionCard title="Modules activés" description="L'espace premium regroupe les modules privés au lieu de les exposer publiquement."><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{highlighted.map((module) => <ModuleGate key={module.name} module={module} />)}</div></SectionCard>
            <SectionCard title="Vue coordination" description="Actions quotidiennes, responsables et prochaine étape."><ActionTable /></SectionCard>
            <SectionCard title="Rapports et preuves" description="Notes et dossiers prêts ou en cadrage pour les partenaires."><ReportCards /></SectionCard>
          </div>
        </main>
      </div>
    </div>
  );
}
