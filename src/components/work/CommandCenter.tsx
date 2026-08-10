"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  FileBarChart,
  Handshake,
  MapPinned,
  MessageCircleMore,
  Network,
  PhoneCall,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound
} from "lucide-react";
import type { ProductState } from "@/domain/types";
import { SituationDecisionCard } from "@/components/situations/SituationDecisionCard";
import { TerritoryDecisionPanel } from "@/components/territories/TerritoryDecisionPanel";
import { ActorNetworkPanel } from "@/components/actors/ActorNetworkPanel";

const priorityWeight = {
  critique: 4,
  haute: 3,
  moyenne: 2,
  faible: 1
} as const;

function formatDate(value?: string) {
  if (!value) return "À planifier";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function CommandCenter({
  state,
  actorId
}: {
  state: ProductState;
  actorId: string;
}) {
  const actor = state.actors.find((item) => item.id === actorId);
  const territoryIds = new Set(actor?.territoryIds ?? []);

  const territory =
    state.territories.find((item) => territoryIds.has(item.id)) ??
    state.territories[0];

  const situations = state.situations.filter(
    (item) => territoryIds.size === 0 || territoryIds.has(item.territoryId)
  );

  const openSituations = situations
    .filter((item) => item.status !== "reglee")
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  const critical = openSituations.filter((item) => item.priority === "critique");
  const primarySituation = openSituations[0];

  const missions = state.coordinationSpaces.filter(
    (item) =>
      item.commitments.some((commitment) => commitment.status !== "terminee") ||
      item.commitments.length === 0
  );

  const activeCommitments = missions
    .flatMap((mission) =>
      mission.commitments.map((commitment) => ({
        ...commitment,
        missionTitle: mission.title
      }))
    )
    .filter((commitment) => commitment.status !== "terminee")
    .slice(0, 6);

  const latestSignals = state.signals
    .filter((item) => territoryIds.size === 0 || territoryIds.has(item.territoryId))
    .slice(0, 6);

  const unreadNotifications = state.notifications.filter((item) => !item.read).slice(0, 5);
  const resolvedCount = situations.filter((item) => item.status === "reglee").length;
  const verifiedActors = state.actors.filter(
    (item) => item.verified && (territoryIds.size === 0 || item.territoryIds.some((id) => territoryIds.has(id)))
  ).length;

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <section className="relative overflow-hidden rounded-[24px] bg-[#031a22] text-white shadow-[0_22px_70px_rgba(3,26,34,.16)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(95,224,211,.18),transparent_30%),radial-gradient(circle_at_15%_85%,rgba(9,116,138,.22),transparent_34%)]" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
          <div>
            <div className="flex items-center gap-2 text-[#74e1d6]">
              <Radio size={16} />
              <p className="text-[10px] font-black uppercase tracking-[.16em]">Centre de commandement</p>
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-[-.045em] lg:text-5xl">
              {territory?.name ?? "Votre territoire"} · ce qui compte maintenant.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
              Les signaux terrain, responsabilités, engagements et décisions sont réunis dans une seule vue pour réduire le délai entre constat et action.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5fe0d3]/20 bg-[#5fe0d3]/10 px-3 py-2 text-xs font-bold text-[#b9f2eb]">
              <span className="size-2 rounded-full bg-[#5fe0d3]" /> Infrastructure active
            </span>
            <Link href="/app/atlas" className="btn-on-dark">
              <MapPinned size={16} /> Ouvrir le territoire
            </Link>
          </div>
        </div>

        <div className="relative grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          <CommandMetric label="Priorités critiques" value={String(critical.length)} detail="Action immédiate" icon={<AlertTriangle size={16} />} />
          <CommandMetric label="Situations ouvertes" value={String(openSituations.length)} detail="Boucles en cours" icon={<Target size={16} />} />
          <CommandMetric label="Engagements actifs" value={String(activeCommitments.length)} detail="Responsabilités suivies" icon={<Handshake size={16} />} />
          <CommandMetric label="Acteurs vérifiés" value={String(verifiedActors)} detail="Réseau mobilisable" icon={<UsersRound size={16} />} />
        </div>
      </section>

      {primarySituation && (
        <section className="overflow-hidden rounded-[22px] border border-[#e8c7c0] bg-white shadow-[0_14px_45px_rgba(28,66,74,.07)]">
          <div className="grid gap-6 bg-[linear-gradient(135deg,#fff7f4,#ffffff)] p-6 xl:grid-cols-[1.25fr_.75fr] xl:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0ec] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em] text-[#a34738]">
                  <AlertTriangle size={13} /> Priorité du moment
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#8a9a9e]">{primarySituation.reference}</span>
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-[-.035em] text-[#102e37] lg:text-3xl">{primarySituation.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#60737a]">{primarySituation.description}</p>
              <div className="mt-5 rounded-xl border border-[#ead9d5] bg-white/80 p-4">
                <p className="text-[9px] font-black uppercase tracking-[.12em] text-[#9a746c]">Décision attendue</p>
                <p className="mt-2 text-sm font-black text-[#173b43]">{primarySituation.nextStep}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-5 rounded-2xl bg-[#071f28] p-5 text-white">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.12em] text-[#74e1d6]">Responsabilité</p>
                <p className="mt-2 text-lg font-black">
                  {state.actors.find((item) => item.id === primarySituation.responsibleId)?.name ?? "À désigner"}
                </p>
                <p className="mt-2 text-xs text-white/45">Échéance · {formatDate(primarySituation.dueAt)}</p>
              </div>
              <Link href={`/app/situations/${primarySituation.id}`} className="btn-accent w-full">
                Entrer dans la Situation Room <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[.82fr_1.18fr_.72fr]">
        <div className="surface overflow-hidden">
          <PanelHeader icon={<CheckCircle2 size={17} />} eyebrow="À faire" title="Engagements actifs" />
          <div className="divide-y divide-[#e4ecec]">
            {activeCommitments.length > 0 ? activeCommitments.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#e8f7f4] text-[#08758a]"><Target size={14} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-5 text-[#173840]">{item.label}</p>
                    <p className="mt-1 truncate text-[10px] text-[#7a8e94]">{item.missionTitle}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-[#718489]">
                      <Clock3 size={12} /> {formatDate(item.dueAt)}
                    </div>
                  </div>
                </div>
              </div>
            )) : <EmptyMessage text="Aucun engagement actif sur ce périmètre." />}
          </div>
          <div className="border-t border-[#e4ecec] p-4"><Link href="/app/coordination" className="link-action">Voir les coordinations <ArrowRight size={13} /></Link></div>
        </div>

        <div className="surface overflow-hidden">
          <PanelHeader icon={<Activity size={17} />} eyebrow="Temps réel" title="Flux territorial" />
          <div className="p-5">
            <div className="relative space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-[#d7e6e5]">
              {latestSignals.length > 0 ? latestSignals.map((signal, index) => (
                <div key={signal.id} className="relative flex gap-4">
                  <span className={`relative z-10 mt-1 size-[31px] shrink-0 rounded-full border-4 border-white ${index === 0 ? "bg-[#1fb6a4]" : "bg-[#8fb3b6]"}`} />
                  <div className="min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-[#173840]">{signal.title}</p>
                      {index === 0 && <span className="rounded-full bg-[#e7f7f3] px-2 py-1 text-[9px] font-black uppercase tracking-[.08em] text-[#087568]">récent</span>}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#718489]">{signal.source} · {signal.trust}</p>
                  </div>
                </div>
              )) : <EmptyMessage text="Aucun signal récent." />}
            </div>
          </div>
        </div>

        <aside className="surface overflow-hidden">
          <PanelHeader icon={<BellRing size={17} />} eyebrow="Veille" title="Alertes & notifications" />
          <div className="divide-y divide-[#e4ecec]">
            {unreadNotifications.length > 0 ? unreadNotifications.map((item) => (
              <Link key={item.id} href={item.href} className="block p-4 transition hover:bg-[#f7fbfa]">
                <div className="flex items-start gap-3">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-[#d8951a]" />
                  <div><p className="text-xs font-bold leading-5 text-[#173840]">{item.title}</p><p className="mt-1 text-[10px] text-[#8a9a9e]">Non lue · action disponible</p></div>
                </div>
              </Link>
            )) : <EmptyMessage text="Aucune alerte non lue." />}
          </div>
        </aside>
      </section>

      {territory && (
        <section className="grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
          <TerritoryDecisionPanel state={state} territory={territory} />
          <ActorNetworkPanel state={state} territory={territory} />
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label">Décisions ouvertes</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.035em] text-[#102e37]">Boucles opérationnelles à faire avancer</h2>
          </div>
          <Link href="/app/situations" className="btn-secondary">Toutes les situations <ArrowRight size={14} /></Link>
        </div>
        <div className="space-y-4">
          {openSituations.slice(0, 4).map((item) => (
            <SituationDecisionCard key={item.id} situation={item} state={state} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_.85fr]">
        <div className="overflow-hidden rounded-[20px] border border-[#cfe0e0] bg-[#f8fbfa]">
          <div className="flex items-center justify-between gap-3 border-b border-[#dce7e7] p-5">
            <div>
              <div className="flex items-center gap-2 text-[#08758a]"><MessageCircleMore size={17} /><p className="label">Canaux de coordination</p></div>
              <h2 className="mt-2 text-lg font-black text-[#102e37]">Rester proche des usages terrain</h2>
            </div>
            <ShieldCheck size={20} className="text-[#118f83]" />
          </div>
          <div className="grid gap-px bg-[#dce7e7] sm:grid-cols-3">
            <ChannelCard icon={<MessageCircleMore size={18} />} title="WhatsApp Business" detail="Messages et confirmations rapides" />
            <ChannelCard icon={<PhoneCall size={18} />} title="Téléphone" detail="Qualification et escalade humaine" />
            <ChannelCard icon={<BellRing size={18} />} title="Notifications" detail="Alertes et rappels de responsabilité" />
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[20px] bg-[#052630] p-6 text-white shadow-[0_18px_55px_rgba(5,38,48,.14)]">
          <div className="absolute -right-16 -top-16 size-44 rounded-full bg-[#5fe0d3]/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[#74e1d6]"><Sparkles size={18} /><p className="text-[10px] font-black uppercase tracking-[.13em]">Assistance Mbàmbulaan</p></div>
            <h2 className="mt-4 text-xl font-black">Préparer la prochaine décision.</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Les signaux, situations et engagements du périmètre sont déjà reliés. L’assistance peut servir à produire une synthèse explicable sans remplacer la validation humaine.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-[10px] font-bold text-white/60">
              <span className="rounded-lg border border-white/10 bg-white/5 p-3">Résumer les risques</span>
              <span className="rounded-lg border border-white/10 bg-white/5 p-3">Préparer un rapport</span>
              <span className="rounded-lg border border-white/10 bg-white/5 p-3">Identifier les acteurs</span>
              <span className="rounded-lg border border-white/10 bg-white/5 p-3">Expliquer une tension</span>
            </div>
            <Link href="/app/pilotage" className="btn-on-dark mt-5 w-full">Ouvrir le pilotage <FileBarChart size={15} /></Link>
          </div>
        </aside>
      </section>

      <section className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-[#173840]">Résultats du périmètre</p>
          <p className="mt-1 text-xs text-[#718489]">{resolvedCount} situation(s) clôturée(s) · {missions.length} coordination(s) active(s)</p>
        </div>
        <Link href="/app/pilotage" className="btn-secondary">Consulter les résultats <ArrowRight size={14} /></Link>
      </section>
    </div>
  );
}

function CommandMetric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#082630] p-5">
      <div className="flex items-center gap-2 text-[#74e1d6]">{icon}<p className="text-[9px] font-black uppercase tracking-[.12em]">{label}</p></div>
      <p className="mt-3 text-3xl font-black tracking-[-.04em]">{value}</p>
      <p className="mt-1 text-[10px] text-white/35">{detail}</p>
    </div>
  );
}

function PanelHeader({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <div className="border-b border-[#dce7e7] bg-[#f8fbfa] p-4">
      <div className="flex items-center gap-2 text-[#08758a]">{icon}<p className="text-[9px] font-black uppercase tracking-[.12em]">{eyebrow}</p></div>
      <h2 className="mt-2 text-base font-black text-[#173840]">{title}</h2>
    </div>
  );
}

function ChannelCard({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="bg-white p-4">
      <div className="text-[#08758a]">{icon}</div>
      <p className="mt-3 text-sm font-black text-[#173840]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#718489]">{detail}</p>
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return <div className="p-5 text-sm text-[#718489]">{text}</div>;
}
