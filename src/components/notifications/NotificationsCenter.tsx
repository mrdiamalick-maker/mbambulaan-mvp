"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { IntelligentAlert } from "@/lib/alerts";
import { createAlertNotifications } from "@/lib/alerts";
import type { Opportunite, TransactionStatus } from "@/lib/coordination";
import { computeTransactions, reservationsStorageKey, transactionsStorageKey } from "@/lib/coordination";
import type { NotificationLevel, NotificationMetier } from "@/lib/notifications";
import { createReservationNotifications, createTransactionNotifications, notificationStorageKey } from "@/lib/notifications";
import { coordinationSimulationStorageKey, parseCoordinationSimulation } from "@/lib/simulation";

type NotificationFilter = "Toutes" | "Non lues";

export function NotificationsCenter({ alertes = [], notifications, opportunites }: { alertes?: IntelligentAlert[]; notifications: NotificationMetier[]; opportunites: Opportunite[] }) {
  const [filter, setFilter] = useState<NotificationFilter>("Toutes");
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [transactionStatusByOpportunityId, setTransactionStatusByOpportunityId] = useState<Record<string, TransactionStatus>>({});
  const [simulatedNotifications, setSimulatedNotifications] = useState<NotificationMetier[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => notifications.filter((notification) => notification.lu).map((notification) => notification.id));

  useEffect(() => {
    const stored = window.localStorage.getItem(reservationsStorageKey);
    if (!stored) return;

    try {
      const ids = JSON.parse(stored);
      if (Array.isArray(ids)) {
        setReservedIds(ids.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      setReservedIds([]);
    }
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(transactionsStorageKey);
    setTransactionStatusByOpportunityId(stored ? safeParseTransactions(stored) : {});
  }, []);

  useEffect(() => {
    const simulation = parseCoordinationSimulation(window.localStorage.getItem(coordinationSimulationStorageKey));
    setSimulatedNotifications(simulation?.notifications ?? []);
  }, []);

  const transactions = useMemo(() => computeTransactions(opportunites, transactionStatusByOpportunityId), [opportunites, transactionStatusByOpportunityId]);
  const localNotifications = useMemo(
    () => [...createAlertNotifications(alertes), ...simulatedNotifications, ...createTransactionNotifications(transactions), ...createReservationNotifications(opportunites, reservedIds), ...notifications],
    [alertes, notifications, opportunites, reservedIds, simulatedNotifications, transactions]
  );

  const enrichedNotifications = useMemo(
    () =>
      localNotifications.map((notification) => ({
        ...notification,
        lu: notification.lu || readIds.includes(notification.id)
      })),
    [localNotifications, readIds]
  );

  const unreadCount = enrichedNotifications.filter((notification) => !notification.lu).length;
  const displayedNotifications = filter === "Non lues" ? enrichedNotifications.filter((notification) => !notification.lu) : enrichedNotifications;

  function markAsRead(id: string) {
    setReadIds((current) => {
      const next = current.includes(id) ? current : [...current, id];
      window.localStorage.setItem(notificationStorageKey, JSON.stringify(next));
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                item.href === "/notifications" ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/15 text-[#14312d] hover:border-[#14312d]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Notifications métier</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Centre de coordination</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Alertes locales generees depuis les arrivages, besoins, opportunites et indicateurs du moteur Mbàmbulaan.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:min-w-96">
              <Metric label="Notifications" value={String(enrichedNotifications.length)} />
              <Metric label="Non lues" value={String(unreadCount)} />
            </div>
          </div>

          <div className="mt-8 inline-flex rounded-full bg-[#f7f4ec] p-1">
            {(["Toutes", "Non lues"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${filter === item ? "bg-[#14312d] text-white" : "text-[#14312d]/70 hover:text-[#14312d]"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4">
            {displayedNotifications.map((notification) => (
              <article key={notification.id} className="rounded-3xl border border-[#14312d]/10 bg-[#f7f4ec] p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <LevelBadge level={notification.niveau} />
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#14312d]/65">{notification.type}</span>
                      {!notification.lu ? <span className="rounded-full bg-[#14312d] px-3 py-1 text-xs font-black text-white">Non lue</span> : null}
                    </div>
                    <h2 className="mt-4 text-2xl font-black">{notification.titre}</h2>
                    <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#14312d]/70">{notification.description}</p>
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{formatDate(notification.date)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={notification.lien} className="rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-black transition hover:border-[#14312d]">
                      Ouvrir
                    </Link>
                    <button
                      type="button"
                      disabled={notification.lu}
                      onClick={() => markAsRead(notification.id)}
                      className="rounded-full bg-[#14312d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#1e4a43] disabled:cursor-not-allowed disabled:bg-[#14312d]/30"
                    >
                      Marquer comme lu
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {displayedNotifications.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-[#14312d]/20 p-8 text-center">
              <p className="text-lg font-black">Aucune notification dans ce filtre.</p>
              <p className="mt-2 text-sm text-[#14312d]/65">Les evenements métier mockes restent disponibles dans la vue Toutes.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

const navigationItems = [
  { href: "/", label: "Accueil" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunites" },
  { href: "/transactions", label: "Transactions" },
  { href: "/quais", label: "Quais" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notifications", label: "Notifications" }
];

function safeParseTransactions(value: string): Record<string, TransactionStatus> {
  try {
    const transactions = JSON.parse(value);

    if (!transactions || typeof transactions !== "object" || Array.isArray(transactions)) return {};

    return Object.fromEntries(
      Object.entries(transactions).filter((entry): entry is [string, TransactionStatus] => {
        const [, status] = entry;
        return status === "Réservée" || status === "En préparation" || status === "En cours de retrait" || status === "Terminée" || status === "Annulée";
      })
    );
  } catch {
    return {};
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{label}</p>
    </div>
  );
}

function LevelBadge({ level }: { level: NotificationLevel }) {
  const styles: Record<NotificationLevel, string> = {
    info: "bg-[#dbeafe] text-[#174ea6] ring-[#93c5fd]",
    succès: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
    attention: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]"
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[level]}`}>{level}</span>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(new Date(value));
}
