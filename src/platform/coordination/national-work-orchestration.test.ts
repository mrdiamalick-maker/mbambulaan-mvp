import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryWorkRepository,
  NationalWorkOrchestrator,
  NotificationDispatcher,
  type NotificationGateway,
} from "./national-work-orchestration";

class FixedClock {
  constructor(public value = "2026-07-27T10:00:00Z") {}
  now() { return this.value; }
}
class Ids { private n = 0; next(prefix: string) { this.n += 1; return `${prefix}-${this.n}`; } }

function setup() {
  const repository = new InMemoryWorkRepository();
  repository.policies.set("critical", {
    code: "critical",
    acknowledgementMinutes: 10,
    resolutionMinutes: 60,
    maximumLevel: 2,
    levels: [
      { level: 1, afterMinutes: 10, targetRoleCodes: ["territorial_coordinator"], targetScope: "territory", channels: ["sms"] },
      { level: 2, afterMinutes: 30, targetRoleCodes: ["national_supervisor"], targetScope: "national", channels: ["sms", "email"] },
    ],
  });
  repository.preferences.set("actor-1", {
    identityId: "actor-1",
    enabledChannels: ["in_app"],
    criticalOverride: true,
    locale: "fr",
  });
  const clock = new FixedClock();
  const ids = new Ids();
  const orchestrator = new NationalWorkOrchestrator(
    repository,
    { async resolve() { return [{ identityId: "supervisor-1" }]; } },
    clock,
    ids,
  );
  return { repository, clock, ids, orchestrator };
}

test("crée une tâche critique et notifie l'acteur sur plusieurs canaux", async () => {
  const { repository, orchestrator } = setup();
  const item = await orchestrator.createWork({
    workType: "cold_chain_incident",
    title: "Rétablir la chaîne du froid",
    description: "Température hors seuil",
    priority: "critical",
    territoryIds: ["territory-joal"],
    assignedIdentityId: "actor-1",
    sourceEntityType: "incident",
    sourceEntityId: "incident-1",
    dueAt: "2026-07-27T11:00:00Z",
    escalationPolicyCode: "critical",
  });
  assert.equal(item.status, "assigned");
  const channels = [...repository.notifications.values()].map((n) => n.channel);
  assert.ok(channels.includes("in_app"));
  assert.ok(channels.includes("sms"));
  assert.ok(channels.includes("whatsapp"));
  assert.ok(channels.includes("push"));
});

test("escalade une tâche lorsque le SLA d'acquittement est dépassé", async () => {
  const { repository, orchestrator, clock } = setup();
  const item = await orchestrator.createWork({
    workType: "payment_blocked",
    title: "Débloquer le règlement",
    description: "Paiement non confirmé",
    priority: "urgent",
    territoryIds: ["territory-joal"],
    sourceEntityType: "payment",
    sourceEntityId: "payment-1",
    dueAt: "2026-07-27T12:00:00Z",
    escalationPolicyCode: "critical",
  });
  clock.value = "2026-07-27T10:15:00Z";
  const escalated = await orchestrator.processEscalations();
  assert.equal(escalated[0]?.id, item.id);
  assert.equal(repository.workItems.get(item.id)?.escalationLevel, 1);
  assert.ok([...repository.notifications.values()].some((n) => n.templateCode === "work_escalated"));
});

test("rejoue une notification en erreur puis la livre", async () => {
  const { repository, orchestrator, clock, ids } = setup();
  await orchestrator.createWork({
    workType: "landing_alert",
    title: "Confirmer le débarquement",
    description: "Retour annoncé",
    priority: "normal",
    territoryIds: ["territory-joal"],
    assignedIdentityId: "actor-1",
    sourceEntityType: "landing",
    sourceEntityId: "landing-1",
    dueAt: "2026-07-27T11:00:00Z",
    escalationPolicyCode: "critical",
  });
  let calls = 0;
  const gateway: NotificationGateway = { async send() { calls += 1; if (calls === 1) throw new Error("provider unavailable"); return { providerMessageId: "msg-1" }; } };
  const dispatcher = new NotificationDispatcher(repository, { in_app: gateway, sms: gateway, whatsapp: gateway, push: gateway }, clock, ids);
  await dispatcher.dispatch();
  const failed = [...repository.notifications.values()].find((n) => n.status === "failed");
  assert.ok(failed);
  clock.value = failed!.nextAttemptAt;
  await dispatcher.dispatch();
  assert.ok([...repository.notifications.values()].some((n) => n.status === "delivered"));
});

test("place une notification en dead letter après le nombre maximal d'essais", async () => {
  const { repository, orchestrator, clock, ids } = setup();
  await orchestrator.createWork({
    workType: "incident",
    title: "Traiter l'incident",
    description: "Incident critique",
    priority: "normal",
    territoryIds: ["territory-joal"],
    assignedIdentityId: "actor-1",
    sourceEntityType: "incident",
    sourceEntityId: "incident-2",
    dueAt: "2026-07-27T11:00:00Z",
    escalationPolicyCode: "critical",
  });
  const gateway: NotificationGateway = { async send() { throw new Error("down"); } };
  const dispatcher = new NotificationDispatcher(repository, { in_app: gateway, sms: gateway, whatsapp: gateway, push: gateway }, clock, ids, 2);
  await dispatcher.dispatch();
  const failed = [...repository.notifications.values()].find((n) => n.status === "failed")!;
  clock.value = failed.nextAttemptAt;
  await dispatcher.dispatch();
  assert.ok([...repository.notifications.values()].some((n) => n.status === "dead_lettered"));
});
