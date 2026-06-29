import Link from "next/link";
import type { ReactNode } from "react";

const profiles = [
  ["etat", "État / institution", "Lire tensions, décisions et limites de preuve."],
  ["collectivite", "Collectivité", "Piloter un territoire sans exposer les modules."],
  ["ong", "ONG / programme", "Relier actions, preuves et impact estimé."],
  ["entreprise", "Entreprise privée", "Qualifier une opportunité sans marketplace publique."],
  ["exportateur", "Exportateur", "Évaluer qualité, trace et conditions d’un lot."],
  ["organisation", "Organisation professionnelle", "Coordonner membres, besoins et partenaires."],
  ["acteur-terrain", "Pêcheur / mareyeur", "Transformer un signal terrain en action suivie."],
  ["investisseur", "Investisseur", "Comprendre la valeur d’une infrastructure de coordination."]
] as const;

export const profileSlugs = profiles.map(([slug]) => ({ slug }));

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#102a37]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0d3b4c] text-sm font-black text-white">Mb</span>
          <span><strong className="block">Mbàmbulaan</strong><small className="text-xs font-bold text-[#64727a]">Operating System de coordination</small></span>
        </Link>
        <nav className="hidden gap-6 text-sm font-bold text-[#425662] md:flex">
          <Link href="/demo">Démo</Link><Link href="/demande-demo">Demander une démo</Link><Link href="/devis">Devis</Link>
        </nav>
      </header>
      {children}
      <footer className="mx-auto max-w-7xl px-5 py-10 text-sm font-semibold text-[#64727a] sm:px-8">Public → démo personnalisée → espace privé par rôle.</footer>
    </main>
  );
}

function CTA({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-black ${secondary ? "border border-[#d8e1e5] bg-white text-[#0d3b4c]" : "bg-[#0d6f8d] text-white"}`}>{children}</Link>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d6f8d]">{children}</p>;
}

export function Landing() {
  return <Shell><section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center"><div><Eyebrow>Pêche artisanale · Sénégal</Eyebrow><h1 className="mt-5 text-5xl font-black leading-[0.96] tracking-[-0.05em] text-[#0d3b4c] sm:text-7xl">L’infrastructure qui rend la filière coordonnable.</h1><p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#43545e]">Mbàmbulaan relie signaux terrain, acteurs, décisions et preuves. Le public découvre la promesse. La valeur se montre en démo.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><CTA href="/demande-demo">Demander une démo</CTA><CTA href="/devis" secondary>Demander un devis</CTA></div></div><div className="rounded-[2rem] border border-[#dce5e8] bg-white p-4 shadow-2xl"><div className="rounded-[1.5rem] bg-[#0d3b4c] p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">Aperçu contrôlé</p><h2 className="mt-4 text-3xl font-black">Un signal devient une décision.</h2>{["Signal terrain", "Qualification", "Action coordonnée", "Preuve disponible"].map((item, i) => <div key={item} className="mt-3 flex justify-between rounded-2xl bg-white/10 p-4"><strong>{item}</strong><span>0{i + 1}</span></div>)}<p className="mt-6 text-sm font-semibold text-white/65">Aucun module métier n’est ouvert au public.</p></div></div></section><section className="mx-auto grid max-w-7xl gap-5 px-5 py-10 sm:px-8 md:grid-cols-3">{[["Pourquoi maintenant","Les informations existent, mais elles restent dispersées."],["Pour qui","Institutions, collectivités, ONG, entreprises, organisations et acteurs terrain."],["Ce qui est vendu","Une capacité de coordination, de décision et de preuve selon le rôle."]].map(([t,x])=><article key={t} className="rounded-3xl border border-[#dce5e8] bg-white p-6"><h2 className="text-xl font-black text-[#0d3b4c]">{t}</h2><p className="mt-3 text-sm font-semibold leading-6 text-[#586973]">{x}</p></article>)}</section><section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8"><Eyebrow>Accès cadré</Eyebrow><h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#0d3b4c]">La landing capte. La démo personnalise. L’espace privé livre.</h2><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><CTA href="/demo">Choisir une démo</CTA><CTA href="/espace-prive" secondary>Logique privée</CTA></div></section></Shell>;
}

export function DemoHome() {
  return <Shell><section className="mx-auto max-w-5xl px-5 py-16 sm:px-8"><Eyebrow>Démo personnalisée</Eyebrow><h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">Choisissez le scénario adapté à votre rôle.</h1><p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">Cette page ne donne pas accès à toute l’application. Elle oriente un acteur qualifié vers une démonstration ciblée.</p></section><section className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">{profiles.map(([slug,label,text])=><Link key={slug} href={`/demo/${slug}`} className="rounded-3xl border border-[#dce5e8] bg-white p-5 hover:border-[#0d6f8d]"><span className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">Profil</span><h2 className="mt-3 text-xl font-black text-[#0d3b4c]">{label}</h2><p className="mt-3 text-sm font-semibold leading-6 text-[#586973]">{text}</p><strong className="mt-5 inline-flex text-sm font-black text-[#0d6f8d]">Voir cette démo →</strong></Link>)}</section></Shell>;
}

export function RoleDemo({ slug }: { slug: string }) {
  const profile = profiles.find(([s]) => s === slug) ?? profiles[0];
  return <Shell><section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2"><div><Eyebrow>Scénario qualifié</Eyebrow><h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">{profile[1]}</h1><p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">{profile[2]}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><CTA href="/demande-demo">Demander la démo complète</CTA><CTA href="/devis" secondary>Cadrer un pilote</CTA></div></div><div className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl"><h2 className="text-2xl font-black text-[#0d3b4c]">Ce que la démo simule</h2>{["Contexte", "Signal ou besoin", "Décision possible", "Preuves et limites"].map((x)=><div key={x} className="mt-3 rounded-2xl bg-[#f2f7f7] p-4 text-sm font-black text-[#0d3b4c]">{x}</div>)}<p className="mt-5 text-sm font-semibold leading-6 text-[#66757d]">Données simulées. Les accès réels dépendent d’une convention, d’un pilote ou d’un forfait.</p></div></section></Shell>;
}

export function PrivateSpaces() {
  return <Shell><section className="mx-auto max-w-5xl px-5 py-16 sm:px-8"><Eyebrow>Espaces privés</Eyebrow><h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">La solution visible dépend du rôle et de la valeur achetée.</h1><p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">Mbàmbulaan ne montre pas tout à tout le monde. Les fonctionnalités sont activées selon le rôle, le territoire, le pilote, la convention ou le forfait.</p></section><section className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2 lg:grid-cols-3">{["Collectivité","Institution","ONG","Entreprise","Acteur terrain","Organisation professionnelle"].map((x)=><article key={x} className="rounded-3xl border border-[#dce5e8] bg-white p-6"><h2 className="text-xl font-black text-[#0d3b4c]">Espace {x}</h2><p className="mt-3 text-sm font-semibold leading-6 text-[#586973]">Valeur livrée, modules visibles, données cachées et niveau d’accompagnement sont cadrés avant activation.</p><p className="mt-5 rounded-2xl bg-[#f2f7f7] p-3 text-xs font-black uppercase tracking-[0.14em] text-[#0d6f8d]">Accès privé</p></article>)}</section></Shell>;
}

export function LeadPage({ kind }: { kind: "demo" | "devis" }) {
  const isDemo = kind === "demo";
  const fields = isDemo ? ["Nom","Organisation","Rôle","Email","Téléphone","Type d’organisation","Objectif","Territoire"] : ["Organisation","Type d’acteur","Territoire","Besoin principal","Échéance","Niveau d’accompagnement","Contact","Email"];
  return <Shell><section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2"><div><Eyebrow>{isDemo ? "Demande de démo" : "Demande de devis"}</Eyebrow><h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">{isDemo ? "Recevoir une démo adaptée à votre rôle." : "Cadrer une proposition adaptée à votre territoire."}</h1><p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">Aucun accès immédiat n’est promis. La demande permet de cadrer le bon scénario.</p></div><form className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl"><div className="grid gap-4 sm:grid-cols-2">{fields.map((label)=><label key={label} className="grid gap-2 text-sm font-black text-[#0d3b4c]">{label}<input className="min-h-12 rounded-2xl border border-[#dce5e8] bg-[#f8fbfb] px-4" placeholder={label}/></label>)}</div><label className="mt-4 grid gap-2 text-sm font-black text-[#0d3b4c]">Message<textarea className="min-h-32 rounded-2xl border border-[#dce5e8] bg-[#f8fbfb] p-4" placeholder="Décrivez votre contexte."/></label><button className="mt-5 rounded-full bg-[#0d6f8d] px-6 py-4 text-sm font-black text-white" type="button">Préparer la demande</button><p className="mt-4 text-sm font-semibold text-[#66757d]">Version sans backend : aucune donnée n’est envoyée.</p></form></section></Shell>;
}

export function ModuleGate({ title }: { title: string }) {
  return <Shell><section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8"><Eyebrow>Module privé</Eyebrow><h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">{title} n’est pas un accès public.</h1><p className="mx-auto mt-5 max-w-2xl text-lg font-semibold leading-8 text-[#52656f]">Cette fonctionnalité appartient à un espace privé ou à une démo personnalisée.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><CTA href="/demo">Choisir une démo</CTA><CTA href="/espace-prive" secondary>Comprendre les espaces privés</CTA></div></section></Shell>;
}
