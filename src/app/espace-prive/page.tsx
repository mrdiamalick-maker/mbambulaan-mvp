import Link from "next/link";
import { PublicNav, SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";

const spaces = [
  ["Cockpit Etat", "Espace emetteur : decider, envoyer une action et suivre le retour.", "/espace-prive/etat", true],
  ["Referent terrain", "Espace destinataire : recevoir une mission et joindre une preuve terrain.", "/espace-prive/referent", false],
  ["Mareyeur", "Espace destinataire : repondre sur flux, marche ou disponibilite.", "/espace-prive/mareyeur", false],
  ["ONG partenaire", "Espace destinataire : recevoir un point de coordination et rendre compte.", "/espace-prive/ong", false],
  ["Institution ou bailleur", "Espace destinataire : recevoir une note, un avis ou un jalon programme.", "/espace-prive/institution", false],
  ["Acteur prive", "Espace destinataire : devis, planning, maintenance ou preuve d'execution.", "/espace-prive/acteur-prive", false]
] as const;

export default function EspacePrivePortalPage() {
  return <main className="min-h-screen bg-[linear-gradient(180deg,#eefbf9_0%,#f8fcfb_52%,#fff8eb_100%)]">
    <PublicNav />
    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
      <div><StatusBadge tone="blue">Acces prive apres cadrage</StatusBadge><h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-slate-950">Un cockpit Etat, puis des espaces destinataires.</h1><p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-600">Le Ministere envoie des actions. Les partenaires concernes recoivent une demande, completent la piece attendue et renvoient le retour. Les anciens espaces generiques ne sont plus promus dans ce portail.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/espace-prive/etat" className="rounded-full bg-cyan-700 px-5 py-3 text-center text-sm font-black text-white">Ouvrir l'espace Ministere</Link><Link href="/demande-demo" className="rounded-full border border-cyan-200 bg-white px-5 py-3 text-center text-sm font-black text-cyan-950">Demander un essai</Link></div></div>
      <div className="rounded-[2rem] border border-cyan-100 bg-white/85 p-5 shadow-sm shadow-cyan-950/5"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Principe d'acces</p><div className="mt-4 grid gap-3">{["Etat = espace emetteur", "Partenaires = espaces destinataires", "Une action sortante a un destinataire", "Le retour est suivi cote Etat"].map((item, index) => <div key={item} className="grid grid-cols-[2rem_1fr] gap-3 rounded-2xl bg-gradient-to-br from-cyan-50 to-emerald-50 p-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-700 text-xs font-black text-white">{index + 1}</span><span className="self-center text-sm font-black text-slate-800">{item}</span></div>)}</div></div>
    </section>
    <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2 xl:grid-cols-3">{spaces.map(([title, description, href, primary]) => <SectionCard key={href} title={title} description={description}><Link href={href} className={`inline-flex rounded-full px-5 py-3 text-sm font-black ${primary ? "bg-gradient-to-r from-cyan-700 to-teal-600 text-white" : "bg-cyan-50 text-cyan-950 ring-1 ring-cyan-200"}`}>Ouvrir l'espace</Link></SectionCard>)}</section>
  </main>;
}
