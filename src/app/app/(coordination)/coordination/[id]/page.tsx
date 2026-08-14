"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, CircleAlert, UserRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/components/shell/AppSidebar";
import { commitmentStatusLabel, commitmentStatusVariant } from "@/lib/status-tokens";

export default function CoordinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useProduct();
  if (!state) return null;
  const space = state.coordinationSpaces.find((item) => item.id === id);

  if (!space) {
    return (
      <div className="shadcn-scope space-y-4 bg-background p-5 pb-16 lg:p-8">
        <Button variant="ghost" size="sm" asChild><Link href="/app/coordination"><ArrowLeft /> Coordination</Link></Button>
        <p className="text-sm text-muted-foreground">Espace de coordination introuvable.</p>
      </div>
    );
  }

  return (
    <div className="shadcn-scope space-y-7 bg-background p-5 pb-16 lg:p-8">
      <Button variant="ghost" size="sm" asChild><Link href="/app/coordination"><ArrowLeft /> Coordination</Link></Button>

      <section className="overflow-hidden rounded-2xl bg-sidebar p-6 text-sidebar-foreground lg:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/60">Coordination active</p>
        <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight">{space.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-sidebar-foreground/70">{space.objective}</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]">
        <main className="space-y-8">
          <section className="rounded-xl border-l-4 border-primary bg-primary/5 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Décision retenue</p>
            <p className="mt-2 text-lg font-semibold leading-7">{space.decision}</p>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 border-b pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Engagements</p>
                <p className="mt-1 text-sm text-muted-foreground">Responsable, échéance et état d’exécution.</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{space.commitments.length} enregistré{space.commitments.length > 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y">
              {space.commitments.map((commitment) => {
                const owner = state.actors.find((item) => item.id === commitment.actorId);
                return (
                  <article key={commitment.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="font-semibold">{commitment.label}</p>
                      <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground"><UserRound size={15} />{owner?.name}</p>
                    </div>
                    <div className="sm:text-right">
                      <Badge variant={commitmentStatusVariant[commitment.status]}>{commitmentStatusLabel[commitment.status]}</Badge>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground sm:justify-end"><Calendar size={13} />{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(commitment.dueAt))}</p>
                    </div>
                  </article>
                );
              })}
              {space.commitments.length === 0 && <p className="py-5 text-sm text-muted-foreground">Aucun engagement enregistré pour le moment.</p>}
            </div>
          </section>
        </main>

        <aside className="space-y-7 lg:border-l lg:pl-7">
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Participants</p>
            <ul className="mt-4 space-y-4">
              {space.participantIds.map((actorId) => {
                const actor = state.actors.find((item) => item.id === actorId);
                return (
                  <li key={actorId}>
                    <p className="font-semibold">{actor?.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{actor ? roleLabel(actor.role) : ""}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          {space.risks.length > 0 && (
            <section className="rounded-xl border border-[#e4c68a] bg-[#c68a2c]/8 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8a5f1a]">Risques</p>
              <ul className="mt-3 space-y-3">
                {space.risks.map((risk) => (
                  <li key={risk} className="flex gap-2 text-sm leading-6">
                    <CircleAlert size={16} className="mt-1 shrink-0 text-[#c68a2c]" />
                    {risk}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
