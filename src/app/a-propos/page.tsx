import Link from "next/link";
import { ArrowRight, BadgeCheck, DatabaseZap, Handshake, Landmark, Scale, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <section className="bg-[#031a22] px-5 pb-16 pt-14 text-white md:px-10 md:pb-20 md:pt-20"><div className="mx-auto max-w-[1500px]"><p className="label-inverse">Mbàmbulaan</p><h1 className="mt-4 max-w-5xl text-4xl font-[760] leading-[1.02] tracking-[-.05em] md:text-6xl">Une infrastructure de confiance au service des filières sénégalaises.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/66">Nous commençons par la pêche artisanale pour résoudre un problème précis : transformer une information dispersée en action coordonnée, traçable et économiquement utile.</p></div></section>
      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            [Landmark, "Mission", "Donner aux acteurs un langage opérationnel commun pour voir, décider, agir et apprendre."],
            [Handshake, "Méthode", "Cadrer un problème territorial, les mandats, les sources et la valeur avant de déployer la technologie."],
            [Scale, "Modèle", "Faire payer les organisations qui gagnent durablement en coordination, pilotage, preuve ou accès qualifié."]
          ].map(([Icon, title, text]) => { const ItemIcon = Icon as typeof Landmark; return <article key={String(title)} className="surface p-6"><ItemIcon size={22} className="text-[#08758a]"/><h2 className="mt-8 text-2xl font-bold">{String(title)}</h2><p className="mt-3 text-sm leading-6 text-[#667b81]">{String(text)}</p></article>; })}
        </div>
        <div className="mt-16 grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="label">Charte de confiance</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em]">Ce que le produit doit toujours garantir.</h2></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [ShieldCheck, "Une donnée contextualisée", "Source, date, territoire, statut et niveau de confiance visibles."],
              [BadgeCheck, "Une validation humaine", "L’IA prépare et explique ; un acteur mandaté décide."],
              [DatabaseZap, "Une seule réalité métier", "Le canal change, mais les objets et l’historique ne se dupliquent pas."],
              [Handshake, "Une responsabilité explicite", "Chaque coordination désigne les acteurs, les délais, les risques et le résultat attendu."]
            ].map(([Icon, title, text]) => { const ItemIcon = Icon as typeof ShieldCheck; return <article key={String(title)} className="rounded-2xl border border-[#d9e3e3] bg-white p-5"><ItemIcon size={19} className="text-[#08758a]"/><h3 className="mt-5 font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-[#667b81]">{String(text)}</p></article>; })}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-6 rounded-2xl bg-[#052630] p-7 text-white md:flex-row md:items-center md:justify-between"><div><p className="label-inverse">Partenariats et pilotes</p><h2 className="mt-2 text-2xl font-bold">Partir d’un problème réel, mesurer une valeur réelle.</h2></div><Link href="/contact" className="btn-accent shrink-0">Construire un pilote <ArrowRight size={16}/></Link></div>
      </section>
      <PublicFooter />
    </main>
  );
}

