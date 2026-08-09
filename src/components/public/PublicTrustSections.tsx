import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, Handshake, Quote, ShieldCheck, Sparkles } from "lucide-react";
import { createDemoState } from "@/data/demo-state";
import { partnerFamilies, publicFaq, publicStories, publicTestimonials } from "@/data/public-content";

export function PublicTrustSections() {
  const state = createDemoState();
  const verifiedVessels = state.vessels.filter((item) => item.trust === "verifiee" || item.trust === "consolidee").length;
  const funded = state.initiatives.flatMap((item) => item.funding).reduce((sum, item) => sum + item.amountFcfa, 0);

  return (
    <>
      <section className="border-y border-[#d9e3e3] bg-[#f3f7f6] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="label">Cas démonstrateurs</p><h2 className="section-title mt-4">Une preuve de valeur commence par une boucle complète.</h2></div>
            <p className="max-w-2xl text-base leading-7 text-[#667b81] lg:justify-self-end">Chaque histoire part d’un problème observable, relie les acteurs et se termine par un résultat, une confirmation et un apprentissage. Rien n’est présenté comme un succès terrain réel avant pilote.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {publicStories.map((story, index) => (
              <article key={story.id} className="surface flex min-h-[430px] flex-col overflow-hidden">
                <div className="bg-[#052630] p-6 text-white"><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#74e1d6]">{story.territory}</span><span className="text-xs font-black text-white/28">0{index + 1}</span></div><h3 className="mt-5 text-2xl font-[740] leading-tight tracking-[-.035em]">{story.title}</h3></div>
                <div className="flex flex-1 flex-col p-6"><div className="space-y-5 text-sm leading-6"><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#b16f13]">Rupture</p><p className="mt-1 text-[#536d73]">{story.challenge}</p></div><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#08758a]">Coordination</p><p className="mt-1 text-[#536d73]">{story.coordination}</p></div><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#138d7f]">Résultat</p><p className="mt-1 font-semibold text-[#294951]">{story.result}</p></div></div><p className="mt-auto flex items-center gap-2 border-t border-[#e0e8e8] pt-5 text-xs font-bold text-[#718489]"><BadgeCheck size={15} className="text-[#149a88]"/>{story.proof}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [state.territories.length, "territoires représentés", "Référentiel national de démonstration"],
              [state.sites.filter((item) => item.type === "quai").length, "quais reliés", "Points d’ancrage opérationnels"],
              [verifiedVessels, "pirogues qualifiées", "Immatriculation observée ou vérifiée"],
              [`${Math.round(funded / 1_000_000)} M`, "FCFA documentés", "Financements simulés, jamais engagés"]
            ].map(([value, label, detail]) => <div key={String(label)} className="border-l-2 border-[#5ccfbe] px-5 py-3"><p className="text-4xl font-[760] tracking-[-.05em] text-[#075568]">{value}</p><p className="mt-2 text-sm font-bold">{label}</p><p className="mt-1 text-xs leading-5 text-[#718489]">{detail}</p></div>)}
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
            <div><p className="label">Écosystème de partenaires</p><h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] md:text-4xl">La plateforme n’efface aucun métier. Elle rend les interventions compatibles.</h2><p className="mt-5 text-sm leading-7 text-[#667b81]">Les catégories ci-contre décrivent les partenariats recherchés. Elles ne constituent pas une liste de partenaires déjà engagés.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">{partnerFamilies.map((partner, index) => <article key={partner.title} className="rounded-2xl border border-[#d9e3e3] bg-[#f8fbfa] p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]">{index % 2 === 0 ? <Building2 size={19}/> : <Handshake size={19}/>}</span><h3 className="mt-6 font-bold">{partner.title}</h3><p className="mt-2 text-sm leading-6 text-[#667b81]">{partner.text}</p></article>)}</div>
          </div>

          <div className="mt-20 grid gap-4 lg:grid-cols-3">{publicTestimonials.map((testimonial) => <figure key={testimonial.quote} className="rounded-2xl bg-[#052630] p-6 text-white"><Quote size={21} className="text-[#74e1d6]"/><blockquote className="mt-6 text-lg font-semibold leading-8 tracking-[-.02em]">« {testimonial.quote} »</blockquote><figcaption className="mt-6 border-t border-white/10 pt-4 text-xs text-white/48"><strong className="block text-white/72">{testimonial.role}</strong>{testimonial.attribution}</figcaption></figure>)}</div>
        </div>
      </section>

      <section className="border-y border-[#d9e3e3] bg-[#f3f7f6] px-5 py-20 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[.72fr_1.28fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit"><p className="label">Questions fréquentes</p><h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] md:text-4xl">La confiance commence par des limites claires.</h2><div className="mt-6 rounded-2xl border border-[#cce2e1] bg-[#eaf7f4] p-5"><ShieldCheck size={21} className="text-[#08758a]"/><p className="mt-3 text-sm font-bold">Démonstration transparente</p><p className="mt-2 text-xs leading-5 text-[#536f74]">Les volumes, financements, témoignages et résultats visibles servent à démontrer le produit. Ils ne décrivent pas une activité officielle.</p></div></div>
          <div className="space-y-3">{publicFaq.map((item, index) => <details key={item.question} className="group rounded-2xl border border-[#d9e3e3] bg-white p-5 open:border-[#8fc3bd] open:shadow-[0_12px_34px_rgba(5,54,64,.07)]"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold [&::-webkit-details-marker]:hidden"><span><span className="mr-3 text-xs text-[#149a88]">0{index + 1}</span>{item.question}</span><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#edf5f4] text-[#075568] transition group-open:rotate-45"><Sparkles size={13}/></span></summary><p className="mt-4 pl-8 text-sm leading-7 text-[#667b81]">{item.answer}</p></details>)}</div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1500px] flex-col gap-5 rounded-2xl bg-[#031a22] p-7 text-white md:flex-row md:items-center md:justify-between"><div className="flex gap-3"><CheckCircle2 className="mt-1 shrink-0 text-[#74e1d6]"/><div><p className="text-xl font-bold">Un problème réel mérite un pilote mesurable.</p><p className="mt-2 text-sm text-white/56">Territoire, acteurs, sources, payeur, responsabilités et résultats sont cadrés avant le déploiement.</p></div></div><Link href="/contact" className="btn-accent shrink-0">Cadrer un pilote <ArrowRight size={16}/></Link></div>
      </section>
    </>
  );
}
