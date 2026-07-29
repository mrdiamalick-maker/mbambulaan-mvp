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
    <div className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
      <aside className="surface h-fit p-5">
        <p className="label">Publier utilement</p>
        <h2 className="mt-2 text-lg font-bold">Une publication peut devenir une action</h2>
        <p className="mt-2 text-sm leading-6 text-[#60737a]">Community organise les échanges professionnels. Elle ne cherche pas l’engagement superficiel.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block"><span className="text-xs font-bold">Territoire</span><select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-2 w-full border border-[#c8d7da] p-2.5 text-sm">{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="block"><span className="text-xs font-bold">Catégorie</span><select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="mt-2 w-full border border-[#c8d7da] p-2.5 text-sm"><option value="information">Information</option><option value="alerte">Alerte</option><option value="besoin">Besoin</option><option value="capacite">Capacité</option><option value="opportunite">Opportunité</option><option value="question">Question</option><option value="apprentissage">Apprentissage</option></select></label>
          <label className="block"><span className="text-xs font-bold">Titre</span><input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full border border-[#c8d7da] p-2.5 text-sm" /></label>
          <label className="block"><span className="text-xs font-bold">Contexte utile</span><textarea required value={body} onChange={(event) => setBody(event.target.value)} className="mt-2 min-h-28 w-full border border-[#c8d7da] p-2.5 text-sm" /></label>
          <button disabled={sending} className="inline-flex w-full items-center justify-center gap-2 bg-[#075466] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Send size={16} /> {sending ? "Publication…" : "Publier dans Community"}</button>
        </form>
      </aside>
      <section className="space-y-4">
        <div className="surface grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher dans les échanges…" className="border border-[#c8d7da] p-2.5 text-sm" />
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#60737a]"><Filter size={15} /> {posts.length} publication(s)</div>
        </div>
        {posts.map((post) => {
          const author = state.actors.find((item) => item.id === post.authorId);
          const territory = state.territories.find((item) => item.id === post.territoryId);
          return (
            <article key={post.id} className="surface p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-[#eaf8fa] px-2.5 py-1 font-bold text-[#075466]">{post.category}</span><span className="text-[#60737a]">{post.community} · {territory?.name}</span>{post.status === "transforme" && <span className="rounded-full bg-[#e9f7f1] px-2.5 py-1 font-bold text-[#126b58]">Transformée en action</span>}</div>
              <h2 className="mt-4 text-lg font-bold">{post.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#60737a]">{post.body}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e8e8] pt-4">
                <div className="text-xs text-[#60737a]"><strong className="text-[#17313a]">{author?.name}</strong> · {post.comments.length} commentaire(s)</div>
                {post.status !== "transforme" ? (
                  <CommandButton tone="secondary" command={{ type: "convert_post", postId: post.id }}><Sparkles size={15} /> Transformer en signal</CommandButton>
                ) : post.convertedObjectId ? (
                  <Link href={`/app/situations/${post.convertedObjectId}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#075466]">Voir la situation <ArrowRight size={15} /></Link>
                ) : null}
              </div>
              {post.comments.map((comment) => <div key={comment.id} className="mt-3 flex gap-2 bg-[#f8fbfb] p-3 text-xs leading-5"><MessageCircle size={15} className="shrink-0 text-[#087287]" /><span>{comment.body}</span></div>)}
            </article>
          );
        })}
      </section>
    </div>
  );
}
