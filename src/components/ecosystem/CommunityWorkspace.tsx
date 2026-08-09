"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, MessageCircle, Send, Sparkles } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { CommandButton } from "@/components/ui/CommandButton";
import type { CommunityPost } from "@/domain/types";

export function CommunityWorkspace() {
  const { state, run } = useProduct();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CommunityPost["category"] | "all">("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [territoryId, setTerritoryId] = useState("joal");
  const [sending, setSending] = useState(false);
  if (!state) return null;

  const posts = state.communityPosts.filter((item) =>
    (category === "all" || item.category === category) &&
    `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase())
  );
  const transformed = state.communityPosts.filter((item) => item.status === "transforme").length;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    const ok = await run({ type: "create_community_post", territoryId, category: category === "all" ? "information" : category, title, body });
    setSending(false);
    if (ok) {
      setTitle("");
      setBody("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[#cfe0e0] bg-white shadow-[0_18px_55px_rgba(9,63,73,.09)]">
        <div className="grid lg:grid-cols-[1.2fr_.8fr]">
          <div className="p-6 lg:p-8">
            <p className="label">Réseau professionnel</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[#07323c]">Une remontée terrain devient une situation exploitable.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#667b81]">Community sert à capter, contextualiser et partager les faits utiles. Les programmes, financements et indicateurs restent pilotés dans leur dossier unique.</p>
            <Link href="/app/initiatives" className="btn-secondary mt-6">Ouvrir les programmes & financements <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-3 border-t border-[#e0e8e8] bg-[#f4f9f8] lg:border-l lg:border-t-0">
            {[
              [state.communityPosts.length, "contributions"],
              [transformed, "qualifiées en situation"],
              [state.territories.length, "territoires reliés"]
            ].map(([value, label]) => <div key={String(label)} className="flex flex-col justify-center border-r border-[#dce8e7] p-4 last:border-r-0"><p className="text-2xl font-black text-[#07323c]">{value}</p><p className="mt-2 text-[11px] font-bold leading-4 text-[#667b81]">{label}</p></div>)}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
        <aside className="surface h-fit p-5">
          <p className="label">Faire remonter une information utile</p>
          <h2 className="mt-2 text-lg font-black">Un fait clair, une source, un territoire.</h2>
          <p className="mt-2 text-sm leading-6 text-[#60737a]">Décrivez ce qui a été observé. La qualification et la transformation en situation restent visibles et réversibles.</p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block"><span className="text-xs font-bold">Territoire</span><select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] p-2.5 text-sm">{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="block"><span className="text-xs font-bold">Nature</span><select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="mt-2 w-full rounded-xl border border-[#c8d7da] p-2.5 text-sm"><option value="information">Information</option><option value="alerte">Alerte</option><option value="besoin">Besoin</option><option value="capacite">Capacité</option><option value="opportunite">Opportunité</option><option value="question">Question</option><option value="apprentissage">Apprentissage</option></select></label>
            <label className="block"><span className="text-xs font-bold">Titre</span><input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] p-2.5 text-sm" /></label>
            <label className="block"><span className="text-xs font-bold">Contexte utile</span><textarea required value={body} onChange={(event) => setBody(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-[#c8d7da] p-2.5 text-sm" /></label>
            <button disabled={sending} className="btn-primary w-full disabled:opacity-50"><Send size={16} /> {sending ? "Publication…" : "Partager au réseau"}</button>
          </form>
        </aside>

        <div className="space-y-4">
          <div className="surface grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un besoin, une capacité, un apprentissage…" className="rounded-xl border border-[#c8d7da] p-2.5 text-sm" />
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#60737a]"><Filter size={15} /> {posts.length} contribution(s)</div>
          </div>
          {posts.map((post) => {
            const author = state.actors.find((item) => item.id === post.authorId);
            const territory = state.territories.find((item) => item.id === post.territoryId);
            return <article key={post.id} className="surface p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs"><span className="data-chip">{post.category}</span><span className="text-[#60737a]">{post.community} · {territory?.name}</span>{post.status === "transforme" && <span className="font-bold text-[#126b58]">Reliée à une situation</span>}</div>
              <h2 className="mt-4 text-lg font-black">{post.title}</h2><p className="mt-2 text-sm leading-6 text-[#60737a]">{post.body}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e8e8] pt-4"><div className="text-xs text-[#60737a]"><strong className="text-[#17313a]">{author?.name}</strong> · {post.comments.length} réponse(s)</div>{post.status !== "transforme" ? <CommandButton tone="secondary" command={{ type: "convert_post", postId: post.id }}><Sparkles size={15} /> Qualifier en situation</CommandButton> : post.convertedObjectId ? <Link href={`/app/situations/${post.convertedObjectId}`} className="link-action">Ouvrir la situation <ArrowRight size={15} /></Link> : null}</div>
              {post.comments.map((comment) => <div key={comment.id} className="mt-3 flex gap-2 rounded-xl bg-[#f4f8f7] p-3 text-xs leading-5"><MessageCircle size={15} className="shrink-0 text-[#087287]" /><span>{comment.body}</span></div>)}
            </article>;
          })}
        </div>
      </section>
      <p className="text-xs text-[#718489]">Données de démonstration. Une contribution n’est diffusée au-delà de son périmètre qu’après qualification et selon les droits du mandat.</p>
    </div>
  );
}
