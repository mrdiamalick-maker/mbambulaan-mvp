import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Radio, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between px-5 text-white md:px-10">
        <Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center border border-white/50 bg-white/10 text-sm font-black backdrop-blur">MB</span><span><strong className="block">Mbàmbulaan</strong><span className="text-xs text-white/75">Coordonner la filière, du terrain à la décision</span></span></Link>
        <nav className="flex items-center gap-2"><Link href="/connexion" className="hidden px-4 py-2 text-sm font-bold sm:block">Se connecter</Link><Link href="/demo" className="bg-white px-4 py-2.5 text-sm font-bold text-[#075466]">Voir la démonstration</Link></nav>
      </header>

      <section className="relative flex min-h-[82vh] items-end overflow-hidden bg-[#062d36] px-5 pb-14 pt-28 text-white md:px-10 md:pb-20">
        <div className="absolute inset-0 opacity-80">
          <div className="map-grid absolute inset-y-0 right-0 w-[58%] opacity-40" />
          <div className="absolute inset-y-0 right-0 w-[38%] bg-[#e8eadf] opacity-25 [clip-path:polygon(50%_0,100%_0,100%_100%,20%_100%,45%_76%,25%_60%,48%_42%,24%_24%)]" />
          {[
            [72, 24, "Saint-Louis"], [66, 43, "Kayar"], [68, 56, "Dakar"], [72, 67, "Mbour"], [73, 75, "Joal"]
          ].map(([left, top, label]) => <div key={String(label)} className="absolute" style={{ left: `${left}%`, top: `${top}%` }}><span className="block size-3 rounded-full border-2 border-white bg-[#36c6b1]" /><span className="mt-1 block text-xs font-bold">{label}</span></div>)}
        </div>
        <div className="relative z-10 max-w-4xl">
          <p className="mb-5 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[.08em] backdrop-blur"><Radio size={14} /> Infrastructure de coordination territoriale</p>
          <h1 className="title-balance text-5xl font-bold leading-[1.02] md:text-7xl">Mbàmbulaan</h1>
          <p className="title-balance mt-5 max-w-3xl text-xl leading-8 text-[#d7e8e9] md:text-2xl">Transformer les signaux du terrain en décisions suivies, financements reliés et résultats documentés pour la pêche artisanale sénégalaise.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/demo" className="inline-flex items-center gap-2 bg-[#36c6b1] px-6 py-3.5 font-bold text-[#062d36]">Parcourir le scénario complet <ArrowRight size={18} /></Link><Link href="/connexion" className="border border-white/45 px-6 py-3.5 font-bold">Accès institutionnel</Link></div>
        </div>
      </section>

      <section className="grid border-b border-[#d8e1e2] bg-[#f4f7f6] md:grid-cols-3">
        {[["Observer", "Un signal conserve sa source, son territoire et son niveau de confiance.", Radio], ["Coordonner", "Chaque décision devient une responsabilité, une échéance et une prochaine étape.", CheckCircle2], ["Rendre compte", "Résultats, confirmations et apprentissages restent reliés au même objet.", ShieldCheck]].map(([title, text, Icon]) => {
          const Component = Icon as typeof Radio;
          return <div key={String(title)} className="border-b border-[#d8e1e2] p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 lg:p-9"><Component className="text-[#087287]" /><h2 className="mt-4 text-xl font-bold text-[#062d36]">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-[#60737a]">{String(text)}</p></div>;
        })}
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[.85fr_1.15fr] md:px-10 md:py-24">
        <div><p className="label">Une même chaîne de valeur</p><h2 className="title-balance mt-3 text-3xl font-bold leading-tight text-[#062d36] md:text-4xl">Un produit commun, des responsabilités distinctes.</h2><p className="mt-5 text-base leading-7 text-[#60737a]">Agents terrain, coordinateurs, responsables d’initiative, décideurs et partenaires travaillent sur les mêmes territoires et les mêmes objets. Les droits changent, pas la vérité opérationnelle.</p></div>
        <div className="border border-[#c8d7da] bg-[#f4fbfc] p-5 md:p-8">
          <p className="label">Scénario démontrable</p>
          <h3 className="mt-2 text-2xl font-bold">Machine à glace en panne à Joal</h3>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Signal reçu au poste de quai", "Situation qualifiée et priorisée", "Acteurs mobilisés et engagements suivis", "Intervention, résultat et confirmation", "Initiative froide reliée au financement", "Apprentissage réutilisable à Mbour et Kayar"].map((item, index) => <li key={item} className="flex gap-3 bg-white p-4 text-sm font-semibold"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#075466] text-xs text-white">{index + 1}</span>{item}</li>)}
          </ol>
          <Link href="/demo" className="mt-6 inline-flex items-center gap-2 font-bold text-[#075466]"><MapPin size={17} /> Ouvrir le parcours guidé</Link>
        </div>
      </section>
      <footer className="border-t border-[#d8e1e2] bg-[#062d36] px-5 py-8 text-sm text-[#b9d1d5] md:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Mbàmbulaan. Démonstration sur données simulées.</p><p>Coordination · Traçabilité · Décision</p></div></footer>
    </main>
  );
}
