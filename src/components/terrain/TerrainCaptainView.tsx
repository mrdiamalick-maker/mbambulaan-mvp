"use client";

// Expérience mobile-first réelle pour le rôle capitaine (Lot 6, §11.1 du
// spec maître : prochaine action, appel/WhatsApp, confirmation en un
// geste, saisie minimale). Branchée sur le vrai state produit — remplace
// UnifiedWorkView/WorkFocus (simulation déconnectée, retirée à l'étape
// précédente), pas une redite avec un habillage différent.
import { useState } from "react";
import { AlertTriangle, Anchor, MessageCircleMore, PhoneCall, Radio, ShipWheel } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tripStatusLabel } from "@/lib/status-tokens";
import type { FishingTrip, ProductState } from "@/domain/types";

const tripNextStep: Record<FishingTrip["status"], string> = {
  en_mer: "Annoncez votre retour dès que vous approchez du quai.",
  retour_annonce: "En attente : le quai confirme votre arrivée.",
  arrivee_confirmee: "En attente : le quai enregistre le débarquement.",
  debarquee: "Débarquement terminé — rien à faire pour cette sortie."
};

function formatTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function TerrainCaptainView({ state, actorId }: { state: ProductState; actorId: string }) {
  const { run } = useProduct();
  const actor = state.actors.find((item) => item.id === actorId);
  const territory = state.territories.find((item) => actor?.territoryIds.includes(item.id));
  const myTrips = state.trips
    .filter((trip) => trip.captainId === actorId)
    .sort((a, b) => new Date(b.departureAt).getTime() - new Date(a.departureAt).getTime());
  const actionableTrip = myTrips.find((trip) => trip.status === "en_mer");
  const currentTrip = actionableTrip ?? myTrips[0];
  const vessel = currentTrip ? state.vessels.find((item) => item.id === currentTrip.vesselId) : undefined;

  const [confirming, setConfirming] = useState(false);
  const [callSent, setCallSent] = useState<"telephone" | "whatsapp" | null>(null);
  const [signalOpen, setSignalOpen] = useState(false);
  const [signalTitle, setSignalTitle] = useState("");
  const [signalDetail, setSignalDetail] = useState("");
  const [signalSent, setSignalSent] = useState(false);

  const confirmReturn = async () => {
    if (!actionableTrip) return;
    setConfirming(true);
    try {
      await run({ type: "announce_return", tripId: actionableTrip.id });
    } finally {
      setConfirming(false);
    }
  };

  const simulateContact = async (channel: "telephone" | "whatsapp") => {
    setCallSent(null);
    const ok = await run({
      type: "log_communication",
      channel,
      subject: channel === "telephone" ? "Appel au quai" : "Message WhatsApp au quai",
      body: vessel ? `Point rapide sur ${vessel.name} — ${territory?.name ?? "quai"}.` : "Point rapide au quai."
    });
    if (ok) setCallSent(channel);
  };

  const submitSignal = async () => {
    if (!territory || !signalTitle.trim() || !signalDetail.trim()) return;
    const ok = await run({
      type: "create_signal",
      territoryId: territory.id,
      title: signalTitle.trim(),
      description: signalDetail.trim(),
      channel: "terrain"
    });
    if (ok) {
      setSignalSent(true);
      setSignalTitle("");
      setSignalDetail("");
      setSignalOpen(false);
    }
  };

  const recentSignals = state.signals
    .filter((item) => item.actorId === actorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Aujourd’hui · {territory?.name ?? "Votre territoire"}</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Bonjour {actor?.name?.split(" ")[0] ?? "Capitaine"}.</h1>
      </div>

      {currentTrip ? (
        <Card className="overflow-hidden">
          <div className="bg-sidebar p-5 text-sidebar-foreground">
            <div className="flex items-center gap-2 text-sidebar-foreground/60"><ShipWheel size={16} /><p className="text-xs font-bold uppercase tracking-widest">{vessel?.name ?? "Votre pirogue"}</p></div>
            <p className="mt-2 text-lg font-semibold">{tripStatusLabel[currentTrip.status]}</p>
            <p className="mt-1 text-sm text-sidebar-foreground/70">{currentTrip.zone} · sortie du {formatTime(currentTrip.departureAt)}</p>
          </div>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{tripNextStep[currentTrip.status]}</p>
            {actionableTrip ? (
              <Button size="lg" className="mt-4 h-14 w-full text-base" disabled={confirming} onClick={() => void confirmReturn()}>
                {confirming ? "Confirmation…" : "Confirmer mon retour"}
              </Button>
            ) : (
              <Badge variant="marine" className="mt-4">{tripStatusLabel[currentTrip.status]}</Badge>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Aucune sortie enregistrée pour le moment.</p></CardContent></Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-14 flex-col gap-1" onClick={() => void simulateContact("telephone")}>
          <PhoneCall size={18} /> <span className="text-xs font-semibold">Appeler le quai</span>
        </Button>
        <Button variant="outline" className="h-14 flex-col gap-1" onClick={() => void simulateContact("whatsapp")}>
          <MessageCircleMore size={18} /> <span className="text-xs font-semibold">WhatsApp au quai</span>
        </Button>
      </div>
      {callSent && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Radio size={12} className="text-[#1d8a5f]" /> Action simulée · aucun appel ou message réel n’a été envoyé. L’échange est enregistré dans l’historique.</p>
      )}

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><AlertTriangle size={14} /> Signaler un problème</div>
          {!signalOpen ? (
            <Button variant="outline" className="mt-3 w-full" onClick={() => setSignalOpen(true)}>Signaler</Button>
          ) : (
            <div className="mt-3 space-y-2.5">
              <input value={signalTitle} onChange={(event) => setSignalTitle(event.target.value)} placeholder="Ex. Machine à glace en panne" className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <textarea value={signalDetail} onChange={(event) => setSignalDetail(event.target.value)} rows={2} placeholder="En quelques mots, ce qu’il faut savoir." className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => void submitSignal()}>Envoyer</Button>
                <Button variant="ghost" onClick={() => setSignalOpen(false)}>Annuler</Button>
              </div>
            </div>
          )}
          {signalSent && !signalOpen && <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Anchor size={12} className="text-[#1d8a5f]" /> Signal transmis à la coordination.</p>}
        </CardContent>
      </Card>

      {recentSignals.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mes derniers signalements</p>
          <div className="mt-2 space-y-2">
            {recentSignals.map((signal) => (
              <div key={signal.id} className="rounded-lg border bg-card p-3">
                <p className="text-sm font-semibold">{signal.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatTime(signal.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
