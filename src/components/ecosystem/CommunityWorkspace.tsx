"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, MessageCircle, Send, Sparkles } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CommunityPost } from "@/domain/types";

export function CommunityWorkspace() {
  const { state, run } = useProduct();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CommunityPost["category"] | "all">("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [territoryId, setTerritoryId] = useState("joal");
  const [sending, setSending] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);
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

  const convert = async (postId: string) => {
    setConverting(postId);
    try {
      await run({ type: "convert_post", postId });
    } finally {
      setConverting(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="border-b pb-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Réseau professionnel</p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight">Une remontée terrain devient une situation exploitable.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Community sert à capter, contextualiser et partager les faits utiles. Les programmes, financements et indicateurs restent pilotés dans leur dossier unique.</p>
            <Button variant="outline" className="mt-5" asChild><Link href="/app/initiatives">Ouvrir les programmes &amp; financements <ArrowRight size={16} /></Link></Button>
          </div>
          <div className="grid grid-cols-3 border-y lg:border-y-0 lg:border-l">
            {[
              [state.communityPosts.length, "contributions"],
              [transformed, "qualifiées en situation"],
              [state.territories.length, "territoires reliés"]
            ].map(([value, label], index) => <div key={String(label)} className={`py-4 ${index > 0 ? "border-l pl-4" : "lg:pl-4"}`}><p className="text-2xl font-bold text-[#1d4468]">{value}</p><p className="mt-2 text-[11px] font-bold leading-4 text-muted-foreground">{label}</p></div>)}
          </div>
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-[.7fr_1.3fr]">
        <Card className="h-fit border-[#1d4468]/15 bg-muted/20 shadow-none">
          <CardContent className="p-5 lg:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Faire remonter une information utile</p>
            <h2 className="mt-2 text-lg font-semibold">Un fait clair, une source, un territoire.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Décrivez ce qui a été observé. La qualification et la transformation en situation restent visibles et réversibles.</p>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block"><span className="text-xs font-semibold">Territoire</span><select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-2 w-full rounded-md border bg-background p-2.5 text-sm outline-none focus:border-primary">{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="block"><span className="text-xs font-semibold">Nature</span><select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="mt-2 w-full rounded-md border bg-background p-2.5 text-sm outline-none focus:border-primary"><option value="information">Information</option><option value="alerte">Alerte</option><option value="besoin">Besoin</option><option value="capacite">Capacité</option><option value="opportunite">Opportunité</option><option value="question">Question</option><option value="apprentissage">Apprentissage</option></select></label>
              <label className="block"><span className="text-xs font-semibold">Titre</span><input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-md border bg-background p-2.5 text-sm outline-none focus:border-primary" /></label>
              <label className="block"><span className="text-xs font-semibold">Contexte utile</span><textarea required value={body} onChange={(event) => setBody(event.target.value)} className="mt-2 min-h-28 w-full rounded-md border bg-background p-2.5 text-sm outline-none focus:border-primary" /></label>
              <Button type="submit" disabled={sending} className="w-full"><Send size={16} /> {sending ? "Publication…" : "Partager au réseau"}</Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <div className="grid gap-3 border-b pb-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un besoin, une capacité, un apprentissage…" className="rounded-md border bg-background p-2.5 text-sm outline-none focus:border-primary" />
            <div className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground"><Filter size={15} /> {posts.length} contribution(s)</div>
          </div>
          <div className="divide-y">
            {posts.map((post) => {
              const author = state.actors.find((item) => item.id === post.authorId);
              const territory = state.territories.find((item) => item.id === post.territoryId);
              return (
                <article key={post.id} className="py-6 first:pt-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs"><Badge variant="marine">{post.category}</Badge><span className="text-muted-foreground">{post.community} · {territory?.name}</span>{post.status === "transforme" && <Badge variant="success">Reliée à une situation</Badge>}</div>
                  <h2 className="mt-4 text-lg font-semibold">{post.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.body}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <div className="text-xs text-muted-foreground"><strong className="text-foreground">{author?.name}</strong> · {post.comments.length} réponse(s)</div>
                    {post.status !== "transforme" ? (
                      <Button size="sm" disabled={converting === post.id} onClick={() => void convert(post.id)}><Sparkles size={15} /> {converting === post.id ? "…" : "Qualifier en situation"}</Button>
                    ) : post.convertedObjectId ? (
                      <Button size="sm" asChild><Link href={`/app/situations/${post.convertedObjectId}`}>Ouvrir la situation <ArrowRight size={15} /></Link></Button>
                    ) : null}
                  </div>
                  {post.comments.length > 0 && <div className="mt-4 ml-2 space-y-3 border-l border-[#1d4468]/20 pl-4">{post.comments.map((comment) => <div key={comment.id} className="flex gap-2 text-xs leading-5 text-muted-foreground"><MessageCircle size={15} className="mt-0.5 shrink-0 text-[#1d4468]" /><span>{comment.body}</span></div>)}</div>}
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <p className="border-t pt-4 text-xs text-muted-foreground">Données de démonstration. Une contribution n’est diffusée au-delà de son périmètre qu’après qualification et selon les droits du mandat.</p>
    </div>
  );
}
