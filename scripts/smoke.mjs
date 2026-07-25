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
    body: JSON.stringify({ type, actorId: "act-coordinateur", situationId: "sit-glace", ...extra })
  });
}

try {
  await waitForServer();
  for (const path of ["/", "/demo", "/connexion", "/app/travail", "/app/territoires", "/app/situations", "/app/situations/sit-glace", "/app/coordination", "/app/initiatives", "/app/resultats", "/manifest.webmanifest", "/sw.js"]) {
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
  console.log("Smoke E2E: 13 routes et cycle opérationnel complet validés.");
} finally {
  server.kill("SIGTERM");
}
