import Link from "next/link";
import { ArrowRight, CircleDollarSign, MessageSquareText, UsersRound } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { createDemoState } from "@/data/demo-state";

export default function PublicCommunityPage() {
  const state = createDemoState();
  const initiative = state.initiatives[0];
  const funded = initiative.funding.reduce((sum, item) => sum + item.amountFcfa, 0);
  return <main className="min-h-screen bg-[#f4f7f6]">
    <PublicHeader />
    <section className="overflow-hidden bg-[#062f38] px-5 py-16 text-white md:px-10"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#64decd]">Communautés & programmes</p><h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">Le terrain parle. La filière apprend. Les partenaires peuvent agir.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#c7dde1]">Besoins, capacités, bonnes pratiques et opportunités se rejoignent dans un espace public vivant, puis deviennent des actions suivies lorsqu’ils sont qualifiés.</p></div><div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/15">{[[state.communityPosts.length,"contributions"],[state.territories.length,"territoires"],[`${(funded/1_000_000).toFixed(0)} M`,"FCFA en instruction"]].map(([value,label])=><div key={String(label)} className="bg-white/[.06] p-4"><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs text-[#a9c9cd]">{label}</p></div>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div><div className="mb-5 flex items-end justify-between"><div><p className="label">Échos de la filière</p><h2 className="mt-2 text-3xl font-black text-[#07323c]">Ce qui se partage maintenant</h2></div><UsersRound className="text-[#18a394]" /></div><div className="space-y-3">{state.communityPosts.map((post)=>{const territory=state.territories.find((item)=>item.id===post.territoryId);return <article key={post.id} className="surface p-5"><div className="flex flex-wrap gap-2 text-xs"><span className="data-chip">{post.category}</span><span className="pt-1.5 font-bold text-[#718489]">{territory?.name} · {post.community}</span></div><h3 className="mt-4 text-xl font-black text-[#07323c]">{post.title}</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">{post.body}</p></article>})}</div></div>
        <aside className="surface h-fit overflow-hidden"><div className="bg-[#eaf7f4] p-5"><CircleDollarSign className="text-[#087287]" /><p className="label mt-4">Programme en construction</p><h2 className="mt-2 text-2xl font-black text-[#07323c]">{initiative.title}</h2></div><div className="p-5"><p className="text-sm leading-6 text-[#60737a]">{initiative.objective}</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#f4f8f7] p-4"><p className="label">Budget</p><p className="mt-2 text-xl font-black">{(initiative.budgetFcfa/1_000_000).toFixed(0)} M</p></div><div className="rounded-xl bg-[#f4f8f7] p-4"><p className="label">Instruction</p><p className="mt-2 text-xl font-black text-[#087287]">{(funded/1_000_000).toFixed(0)} M</p></div></div><Link href="/contact" className="btn-primary mt-6 w-full">Proposer un partenariat <ArrowRight size={16}/></Link></div></aside>
      </div>
      <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[20px] bg-[#fff4dd] p-6 md:flex-row md:items-center"><div className="flex gap-3"><MessageSquareText className="mt-1 shrink-0 text-[#b7780c]"/><div><h2 className="text-lg font-black text-[#603f08]">Vous portez un besoin, une expertise ou une initiative ?</h2><p className="mt-1 text-sm text-[#806b43]">Présentez le contexte. Mbàmbulaan organise ensuite la qualification et la mise en relation.</p></div></div><Link href="/contact" className="btn-secondary shrink-0">Partager une proposition</Link></div>
    </section>
  </main>;
}
