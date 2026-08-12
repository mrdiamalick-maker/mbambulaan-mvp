"use client";

// Restylé en D9 (passe de cohérence pré-Lot 6, arbitrage CEO du
// 2026-08-11) : cette fiche de détail portait encore intégralement la
// palette sarcelle pré-D9 (.surface/.label, #075466/#d8e1e2) alors que
// le panneau Décision de la Situation Room (CoordinationProposal.tsx,
// Lot 4) montre déjà le même objet (CoordinationSpace, commitments,
// participants) en D9 — repris ici avec les mêmes jetons
// (commitmentStatusLabel/Variant, src/lib/status-tokens.ts) plutôt que
// de les dupliquer une 3e fois. PageHeader (palette sarcelle)
// abandonné pour un lien de retour minimal, comme /app/situations/[id]
// (Lot 4) l'a déjà fait pour la même raison.
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, CircleAlert, UserRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <Button variant="ghost" size="sm" asChild><Link href="/app/coordination"><ArrowLeft /> Coordination</Link></Button>

      <Card className="overflow-hidden">
        <div className="bg-sidebar p-6 text-sidebar-foreground">
          <p className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/60">Coordination active</p>
          <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight">{space.title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-sidebar-foreground/70">{space.objective}</p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)]">
        <Card className="overflow-hidden">
          <CardContent className="border-b p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Décision retenue</p>
            <p className="mt-2 text-lg font-semibold leading-7">{space.decision}</p>
          </CardContent>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Engagements</p>
            <div className="mt-4 space-y-3">
              {space.commitments.map((commitment) => {
                const owner = state.actors.find((item) => item.id === commitment.actorId);
                return (
                  <div key={commitment.id} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-semibold">{commitment.label}</p>
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><UserRound size={15} />{owner?.name}</p>
                    </div>
                    <div className="sm:text-right">
                      <Badge variant={commitmentStatusVariant[commitment.status]}>{commitmentStatusLabel[commitment.status]}</Badge>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground sm:justify-end"><Calendar size={13} />{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(commitment.dueAt))}</p>
                    </div>
                  </div>
                );
              })}
              {space.commitments.length === 0 && <p className="text-sm text-muted-foreground">Aucun engagement enregistré pour le moment.</p>}
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-5">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Participants</p>
              <ul className="mt-4 space-y-3">
                {space.participantIds.map((actorId) => {
                  const actor = state.actors.find((item) => item.id === actorId);
                  return (
                    <li key={actorId} className="border-b pb-3 last:border-0 last:pb-0">
                      <p className="font-semibold">{actor?.name}</p>
                      <p className="text-xs text-muted-foreground">{actor ? roleLabel(actor.role) : ""}</p>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
          {space.risks.length > 0 && (
            <Card className="border-[#e4c68a] bg-[#c68a2c]/8">
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8a5f1a]">Risques</p>
                <ul className="mt-3 space-y-3">
                  {space.risks.map((risk) => (
                    <li key={risk} className="flex gap-2 text-sm">
                      <CircleAlert size={16} className="mt-0.5 shrink-0 text-[#c68a2c]" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
