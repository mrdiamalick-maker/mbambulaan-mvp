import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 3419;
const remoteBase = process.env.SMOKE_BASE_URL?.replace(/\/$/, "");
const base = remoteBase ?? `http://127.0.0.1:${port}`;
const server = remoteBase
  ? undefined
  : spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(port)], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production", DEMO_MODE: "true" }
    });
let serverError = "";
let demoState;

server?.stderr.on("data", (chunk) => {
  serverError += chunk.toString();
});

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error(`Le serveur de smoke test ne répond pas.${serverError ? `\n${serverError}` : ""}`);
}

async function expectOk(path, options) {
  const response = await fetch(`${base}${path}`, options);
  if (!response.ok) throw new Error(`${path} a répondu ${response.status}`);
  return response;
}

async function action(type, extra = {}) {
  const response = await expectOk("/api/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": `smoke-${type}-${crypto.randomUUID()}` },
    body: JSON.stringify({ type, situationId: "sit-glace", ...extra, demoState })
  });
  const payload = await response.json();
  demoState = payload.state;
  return payload;
}

try {
  await waitForServer();
  for (const path of [
    "/",
    "/a-propos",
    "/actualites",
    "/actualites/actu-froid-petite-cote",
    "/atlas",
    "/filiere",
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
    "/app/coordination/coord-froid",
    "/app/marches",
    "/app/community",
    "/app/durabilite",
    "/app/pilotage",
    "/app/organisation",
    "/app/initiatives",
    "/app/administration",
    "/terrain",
    "/terrain/telephone",
    "/terrain/whatsapp",
    "/manifest.webmanifest",
    "/sw.js"
  ]) {
    await expectOk(path);
  }
  for (const role of [
    "administrateur",
    "operateur",
    "capitaine",
    "mareyeur",
    "transformateur",
    "prestataire",
    "gestionnaire_organisation",
    "coordinateur",
    "institution",
    "partenaire"
  ]) {
    await expectOk("/api/demo/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
  }
  const otpRequest = await expectOk("/api/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact: "demo@mbambulaan.sn" })
  });
  if ((await otpRequest.json()).demoCode !== "246810") throw new Error("Le code OTP de démonstration n'est pas disponible.");
  await expectOk("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "246810" })
  });
  demoState = (await (await expectOk("/api/demo/reset", { method: "POST" })).json()).state;
  await action("qualify");
  await action("prioritize");
  await action("coordinate");
  await action("start_intervention");
  await action("wait", { reason: "Pièce en acheminement" });
  await action("resume");
  await action("record_result", { result: "Machine remise en service", confirmation: "Constat signé du poste de quai" });
  await action("close");
  const situation = demoState.situations.find((item) => item.id === "sit-glace");
  if (situation?.status !== "reglee") throw new Error("Le scénario E2E n'atteint pas l'état réglé.");
  demoState = (await (await expectOk("/api/demo/reset", { method: "POST" })).json()).state;
  await action("announce_return", { tripId: "trip-joal" });
  await action("confirm_arrival", { tripId: "trip-joal" });
  await action("record_landing", { tripId: "trip-joal" });
  await action("confirm_weighing", { landingId: "landing-joal" });
  await action("create_lots", { landingId: "landing-joal" });
  const opportunity = demoState.opportunities.find((item) => item.id.includes("landing-joal"));
  if (!opportunity) throw new Error("Le parcours E2E ne détecte pas d'opportunité.");
  await action("accept_opportunity", { opportunityId: opportunity.id });
  await action("complete_logistics", { opportunityId: opportunity.id });
  if (demoState.opportunities.find((item) => item.id === opportunity.id)?.status !== "executee") {
    throw new Error("Le parcours E2E n'enregistre pas le résultat logistique.");
  }
  await action("create_community_post", {
    territoryId: "joal",
    category: "besoin",
    title: "Besoin de glace signalé par le quai",
    body: "Le besoin doit être qualifié avec le prestataire avant le prochain retour."
  });
  const createdPost = demoState.communityPosts.find((item) => item.title === "Besoin de glace signalé par le quai");
  if (!createdPost) throw new Error("Le parcours Community ne crée pas la publication.");
  await action("convert_post", { postId: createdPost.id });
  if (!demoState.communityPosts.find((item) => item.id === createdPost.id)?.convertedObjectId) {
    throw new Error("Le parcours Community ne produit pas de situation.");
  }
  await action("flag_price", { priceId: "price-thiof-kayar" });
  if (!demoState.priceObservations.find((item) => item.id === "price-thiof-kayar")?.flagged) {
    throw new Error("Le signalement de rareté n'alimente pas l'audit.");
  }
  demoState = (await (await expectOk("/api/demo/reset", { method: "POST" })).json()).state;
  console.log(`Smoke E2E: contenus publics, routes, infrastructure, pirogue, coordination, Community et rareté validés sur ${base}.`);
} finally {
  server?.kill("SIGTERM");
}
