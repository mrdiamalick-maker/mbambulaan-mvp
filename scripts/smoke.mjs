import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 3419;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_ENV: "production" }
});

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error("Le serveur de smoke test ne répond pas.");
}

async function expectOk(path, options) {
  const response = await fetch(`${base}${path}`, options);
  if (!response.ok) throw new Error(`${path} a répondu ${response.status}`);
  return response;
}

async function action(type, extra = {}) {
  return expectOk("/api/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": `smoke-${type}-${crypto.randomUUID()}` },
    body: JSON.stringify({ type, situationId: "sit-glace", ...extra })
  });
}

try {
  await waitForServer();
  for (const path of [
    "/",
    "/atlas",
    "/offres",
    "/community",
    "/durabilite",
    "/contact",
    "/demo",
    "/connexion",
    "/app/travail",
    "/app/atlas",
    "/app/operations",
    "/app/situations",
    "/app/situations/sit-glace",
    "/app/coordination",
    "/app/marches",
    "/app/community",
    "/app/durabilite",
    "/app/pilotage",
    "/app/organisation",
    "/app/initiatives",
    "/app/administration",
    "/manifest.webmanifest",
    "/sw.js"
  ]) {
    await expectOk(path);
  }
  await expectOk("/api/demo/reset", { method: "POST" });
  await action("qualify");
  await action("prioritize");
  await action("coordinate");
  await action("start_intervention");
  await action("wait", { reason: "Pièce en acheminement" });
  await action("resume");
  await action("record_result", { result: "Machine remise en service", confirmation: "Constat signé du poste de quai" });
  await action("close");
  const stateResponse = await expectOk("/api/state");
  const payload = await stateResponse.json();
  const situation = payload.state.situations.find((item) => item.id === "sit-glace");
  if (situation?.status !== "reglee") throw new Error("Le scénario E2E n'atteint pas l'état réglé.");
  await expectOk("/api/demo/reset", { method: "POST" });
  await action("announce_return", { tripId: "trip-joal" });
  await action("confirm_arrival", { tripId: "trip-joal" });
  await action("record_landing", { tripId: "trip-joal" });
  await action("confirm_weighing", { landingId: "landing-joal" });
  await action("create_lots", { landingId: "landing-joal" });
  const operationsState = await (await expectOk("/api/state")).json();
  const opportunity = operationsState.state.opportunities.find((item) => item.id.includes("landing-joal"));
  if (!opportunity) throw new Error("Le parcours E2E ne détecte pas d'opportunité.");
  await action("accept_opportunity", { opportunityId: opportunity.id });
  await action("complete_logistics", { opportunityId: opportunity.id });
  const finalState = await (await expectOk("/api/state")).json();
  if (finalState.state.opportunities.find((item) => item.id === opportunity.id)?.status !== "executee") {
    throw new Error("Le parcours E2E n'enregistre pas le résultat logistique.");
  }
  await expectOk("/api/demo/reset", { method: "POST" });
  console.log("Smoke E2E: 23 routes, coordination et parcours pirogue complet validés.");
} finally {
  server.kill("SIGTERM");
}
