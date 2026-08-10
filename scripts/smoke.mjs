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
let sessionCookie = "";

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

function withSession(options = {}) {
  if (!sessionCookie) return options;
  return { ...options, headers: { ...(options.headers ?? {}), Cookie: sessionCookie } };
}

async function expectOk(path, options) {
  const response = await fetch(`${base}${path}`, withSession(options));
  if (!response.ok) throw new Error(`${path} a répondu ${response.status}`);
  return response;
}

async function expectStatus(path, status, options) {
  const response = await fetch(`${base}${path}`, withSession(options));
  if (response.status !== status) throw new Error(`${path} devait répondre ${status} mais a répondu ${response.status}`);
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
    "/decouvrir",
    "/decouvrir/terrain-joal",
    "/atlas",
    "/atlas/joal-fadiouth",
    "/opportunites",
    "/opportunites/formation-qualite-conservation",
    "/solutions",
    "/mbambulaan",
    "/contact",
    "/mentions-legales",
    "/confidentialite",
    "/connexion",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.webmanifest",
    "/sw.js"
  ]) {
    await expectOk(path);
  }
  for (const path of ["/a-propos", "/actualites", "/filiere", "/offres", "/community", "/durabilite", "/demo", "/terrain"]) {
    const response = await fetch(`${base}${path}`);
    if (response.status !== 404) throw new Error(`${path} devrait être supprimé (404) mais a répondu ${response.status}`);
  }

  // Aucun accès Produit sans session : ni via la page (redirection vers
  // /connexion), ni via l'API (401 explicite).
  const unauthenticatedPage = await fetch(`${base}/app/travail`, { redirect: "manual" });
  if (unauthenticatedPage.status !== 307 && unauthenticatedPage.status !== 302) {
    throw new Error(`/app/travail sans session devrait rediriger, a répondu ${unauthenticatedPage.status}`);
  }
  await expectStatus("/api/state", 401);
  await expectStatus("/api/auth/login", 401, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@mbambulaan.sn", password: "mot-de-passe-invalide" })
  });

  const login = await expectOk("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@mbambulaan.sn", password: process.env.DEMO_ACCOUNT_PASSWORD ?? "demo-mbambulaan-2026" })
  });
  const setCookie = login.headers.get("set-cookie");
  if (!setCookie) throw new Error("La connexion n'établit pas de session.");
  sessionCookie = setCookie.split(";")[0];

  for (const path of [
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
    "/app/administration"
  ]) {
    await expectOk(path);
  }

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

  const publicRequest = await expectOk("/api/public/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "web",
      intent: "conservation",
      territory: "Joal",
      description: "Smoke test : besoin de glace pour 2 tonnes par semaine.",
      actorType: "entreprise",
      contactName: "Smoke Test",
      phone: "+221770000000",
      preferredChannel: "whatsapp",
      consent: true
    })
  });
  if (!(await publicRequest.json()).reference) throw new Error("La demande publique ne renvoie pas de référence.");

  const publicContribution = await expectOk("/api/public/contributions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actorType: "transporteur",
      services: "Transport réfrigéré",
      territories: "Dakar, Petite-Côte",
      contactName: "Smoke Test",
      phone: "+221770000001"
    })
  });
  if (!(await publicContribution.json()).reference) throw new Error("La contribution publique ne renvoie pas de référence.");

  await expectOk("/api/public/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "atlas_open", path: "/atlas" })
  });

  // Garde de rôle : un mandat coordinateur ne doit voir ni l'espace
  // Ministère ni l'espace Administration, page comme API. redirect() côté
  // Server Component ne renvoie pas un statut 3xx à une requête document
  // classique (à la différence du middleware) : Next sert directement le
  // contenu de la destination avec un 200 — on vérifie donc l'absence du
  // contenu protégé plutôt que le code de statut.
  const ministrySpaceAsCoordinateur = await expectOk("/app/ministere");
  if ((await ministrySpaceAsCoordinateur.text()).includes("Bienvenue,")) {
    throw new Error("/app/ministere reste visible pour un mandat coordinateur.");
  }
  await expectStatus("/api/ministry/field-visits", 403);

  await expectOk("/api/auth/logout", { method: "POST" });
  sessionCookie = "";
  await expectStatus("/api/state", 401);

  // Parcours ministère : connexion réelle, accès aux cinq écrans dédiés,
  // planification d'une rencontre terrain, signalement et transmission
  // d'un cas de vigilance.
  const ministryLogin = await expectOk("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ministere@mbambulaan.sn", password: process.env.DEMO_ACCOUNT_PASSWORD ?? "demo-mbambulaan-2026" })
  });
  const ministryCookie = ministryLogin.headers.get("set-cookie");
  if (!ministryCookie) throw new Error("La connexion ministère n'établit pas de session.");
  sessionCookie = ministryCookie.split(";")[0];

  for (const path of ["/app/ministere", "/app/ministere/revenus", "/app/ministere/terrain", "/app/ministere/vigilance", "/app/ministere/programmes"]) {
    await expectOk(path);
  }

  const administrationAsMinistry = await expectOk("/app/administration");
  if ((await administrationAsMinistry.text()).includes("Mandats actifs")) {
    throw new Error("/app/administration reste visible pour un mandat ministère.");
  }

  const territoriesResponse = await expectOk("/api/state");
  const ministryState = (await territoriesResponse.json()).state;
  const territoryId = ministryState.territories[0].id;

  const visitCreated = await expectOk("/api/ministry/field-visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Smoke test : rencontre capitaines", territoryId, objective: "rencontre_pecheurs", plannedAt: new Date(Date.now() + 86400000).toISOString() })
  });
  if (!(await visitCreated.json()).visit?.id) throw new Error("La planification d'une rencontre terrain ne renvoie pas d'identifiant.");

  const visitsList = await (await expectOk("/api/ministry/field-visits")).json();
  if (!visitsList.visits?.some((item) => item.title === "Smoke test : rencontre capitaines")) {
    throw new Error("La rencontre terrain planifiée n'apparaît pas dans la liste.");
  }

  const vigilanceCreated = await expectOk("/api/ministry/vigilance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "immigration_clandestine", territoryId, severity: "haute", description: "Smoke test : signalement de vigilance." })
  });
  const vigilanceCase = (await vigilanceCreated.json()).case;
  if (!vigilanceCase?.id) throw new Error("Le signalement de vigilance ne renvoie pas d'identifiant.");

  await expectOk("/api/ministry/vigilance", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: vigilanceCase.id, status: "transmis_autorites" })
  });
  const vigilanceList = await (await expectOk("/api/ministry/vigilance")).json();
  const updatedCase = vigilanceList.cases?.find((item) => item.id === vigilanceCase.id);
  if (updatedCase?.status !== "transmis_autorites") throw new Error("Le changement de statut du signalement de vigilance n'est pas pris en compte.");

  await expectOk("/api/auth/logout", { method: "POST" });
  sessionCookie = "";
  await expectStatus("/api/state", 401);

  console.log(`Smoke E2E: authentification réelle, espace Ministère (rencontres, vigilance, programmes), Public (contenus, Atlas, opportunités, demandes, contributions, analytics), infrastructure, pirogue, coordination, Community et rareté validés sur ${base}.`);
} finally {
  server?.kill("SIGTERM");
}
