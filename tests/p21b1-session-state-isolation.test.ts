import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { projectStateForSession } from "../src/server/access-projection";
import { canRole } from "../src/server/permissions";

// P2.1-B.1 — "Session-State Isolation". Root cause (mandat §3) : en
// persistance memoire_locale_demo, POST /api/actions ne mute jamais
// l'état global serveur — la seule persistance "entre deux chargements
// de page" pour ce mode vivait dans un localStorage sous une clé fixe,
// jamais rattachée à une identité (session A pouvait laisser un
// ProductState complet que session B réhydratait tel quel, avant même
// que le serveur n'ait eu l'occasion de le filtrer).
//
// TEST A/B/C/E/F (changement de session dans le MÊME navigateur, avec
// vraies cookies/localStorage) ne sont testables qu'en conditions
// réelles — couverts en live, même browser context, cf. rapport de lot
// §7/§12. Ce fichier couvre ce qui est unitairement testable sans DOM :
// la mécanique de namespace localStorage elle-même (D), le câblage
// serveur (G), et la non-régression des lots précédents (H/I/J).

// --- Fake localStorage — les 4 fonctions exportées par ProductProvider
// ne touchent `window.localStorage` qu'à l'appel (jamais au chargement
// du module), donc testables avec ce stub minimal plutôt qu'un DOM
// complet (jsdom), absent de ce projet par choix (node --test seul).
class FakeLocalStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

// localStorage sérialise toujours en JSON (writeDemoState fait un
// JSON.stringify) : une clé explicitement `undefined` dans le fixture
// (ex. Situation.responsibleId non assigné, demo-state.ts) disparaît au
// round-trip — comportement JSON standard, pas un bug de ce lot. Les
// assertions "lecture réussie" comparent donc contre l'état déjà
// round-trippé, exactement ce que readDemoState renvoie réellement en
// conditions réelles (jamais l'objet JS original en mémoire).
function jsonRoundTrip<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function withFakeWindow<T>(run: () => T): T {
  const previous = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = { localStorage: new FakeLocalStorage() };
  try {
    return run();
  } finally {
    (globalThis as { window?: unknown }).window = previous;
  }
}

// TEST D — localStorage hostile/stale ne contourne jamais la projection
// GET : sessionKey mismatch (résidu d'une autre session, OU injection
// hostile directe dans localStorage, mandat §7) → toujours `fallback`,
// jamais fusionné ni "réparé".
test("TEST D — readDemoState ignore tout blob dont le sessionKey ne correspond pas (résidu ou injection hostile)", async () => {
  const { sessionKeyFor, readDemoState, writeDemoState, DEMO_STORAGE_KEY } = await import("../src/components/providers/ProductProvider");
  const demoState = createDemoState();
  const fallback = { ...demoState, revision: 999999 }; // valeur serveur "fraîche" attendue en repli, distincte du fixture écrit.

  withFakeWindow(() => {
    // Rien en storage → fallback.
    assert.deepEqual(readDemoState(sessionKeyFor("act-coordinateur", "coordinateur"), fallback), fallback);

    // Storage écrit par une AUTRE identité (session A, transverse) —
    // lu par une session B (mareyeur) : jamais réutilisé.
    writeDemoState(sessionKeyFor("act-coordinateur", "coordinateur"), demoState);
    const forMareyeur = readDemoState(sessionKeyFor("act-mareyeur", "mareyeur"), fallback);
    assert.deepEqual(forMareyeur, fallback, "un blob écrit par une autre identité ne doit jamais être réutilisé");

    // Même identité exacte → le blob stocké est bien réutilisé (le cas
    // légitime : persister les mutations locales entre deux chargements
    // de la MÊME session).
    const sameSession = readDemoState(sessionKeyFor("act-coordinateur", "coordinateur"), fallback);
    assert.deepEqual(sameSession, jsonRoundTrip(demoState));

    // Injection hostile directe (mandat §7) : un blob sans sessionKey du
    // tout, ou malformé — jamais accepté tel quel.
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ situations: demoState.situations }));
    assert.deepEqual(readDemoState(sessionKeyFor("act-mareyeur", "mareyeur"), fallback), fallback);

    window.localStorage.setItem(DEMO_STORAGE_KEY, "{ceci n'est pas du JSON valide");
    assert.deepEqual(readDemoState(sessionKeyFor("act-mareyeur", "mareyeur"), fallback), fallback);
  });
});

test("TEST D (suite) — writeDemoState/clearDemoState : round-trip fidèle, purge totale à la déconnexion", async () => {
  const { sessionKeyFor, readDemoState, writeDemoState, clearDemoState, DEMO_STORAGE_KEY } = await import("../src/components/providers/ProductProvider");
  const demoState = createDemoState();

  withFakeWindow(() => {
    const key = sessionKeyFor("act-institution", "institution");
    writeDemoState(key, demoState);
    assert.deepEqual(readDemoState(key, {} as never), jsonRoundTrip(demoState));

    // clearDemoState (mandat §5 option B, appelée par logout) — purge
    // complète, aucun résidu exploitable par une inspection directe de
    // localStorage entre deux sessions.
    clearDemoState();
    assert.equal(window.localStorage.getItem(DEMO_STORAGE_KEY), null);
    assert.deepEqual(readDemoState(key, demoState), demoState, "après purge, readDemoState retombe honnêtement sur le fallback fourni");
  });
});

test("sessionKeyFor distingue actorId ET role — deux identités différentes ne partagent jamais la même clé", async () => {
  const { sessionKeyFor } = await import("../src/components/providers/ProductProvider");
  assert.notEqual(sessionKeyFor("act-coordinateur", "coordinateur"), sessionKeyFor("act-mareyeur", "mareyeur"));
  // Même actorId, rôle différent (cas rare mais réel : comptes de démo
  // partageant parfois un acteur) — doit aussi être distingué.
  assert.notEqual(sessionKeyFor("act-x", "coordinateur"), sessionKeyFor("act-x", "operateur"));
  assert.equal(sessionKeyFor("act-coordinateur", "coordinateur"), sessionKeyFor("act-coordinateur", "coordinateur"));
});

// TEST G — POST /api/actions et /api/demo/reset reprojettent désormais
// leur réponse avant de la renvoyer (mandat §8/§9 : "les données envoyées
// par le client ne sont jamais une preuve d'autorisation"). Ces deux
// routes importent "server-only" (via server/repository.ts) et ne sont
// donc pas exécutables via `node --test` (même contrainte que
// public-repository.ts, documentée dans tout cet engagement) — vérifié
// ici par lecture de source, comme pour les autres fichiers "server-only"
// de ce dépôt ; le comportement réel est vérifié en direct (§12).
test("TEST G — POST /api/actions et /api/demo/reset reprojettent leur réponse via projectStateForSession", () => {
  const actionsSource = readFileSync(fileURLToPath(new URL("../src/app/api/actions/route.ts", import.meta.url)), "utf8");
  assert.ok(actionsSource.includes('from "@/server/access-projection"'));
  assert.ok(actionsSource.includes("projectStateForSession(next, session)"));
  // Les deux branches (memoire_locale_demo ET postgresql) doivent
  // reprojeter — pas seulement celle qui accepte demoState.
  assert.equal((actionsSource.match(/projectStateForSession\(/g) ?? []).length, 2, "les deux branches de POST /api/actions doivent reprojeter leur réponse");

  const resetSource = readFileSync(fileURLToPath(new URL("../src/app/api/demo/reset/route.ts", import.meta.url)), "utf8");
  assert.ok(resetSource.includes('from "@/server/access-projection"'));
  assert.ok(resetSource.includes("projectStateForSession(next, session)"));
});

// TEST H — la projection P2.1-A/A.1 elle-même n'est pas régressée par ce
// lot (aucune modification d'access-projection.ts au-delà de son usage
// dans les routes) — smoke test direct plutôt qu'une simple lecture de
// source, sur les deux cas déjà établis (Demo World réel).
test("TEST H — projectStateForSession reste intacte (Situation + cascade P2.1-A/A.1)", () => {
  const state = createDemoState();
  const coordinateur = projectStateForSession(state, { actorId: "act-coordinateur", role: "coordinateur" });
  assert.equal(coordinateur, state, "rôle transverse + capability intake : toujours le même objet, comportement inchangé");

  const mareyeur = projectStateForSession(state, { actorId: "act-mareyeur", role: "mareyeur" });
  assert.equal(mareyeur.situations.length, 0);
  assert.equal(mareyeur.incomingMessages.length, 0);

  const institution = projectStateForSession(state, { actorId: "act-institution", role: "institution" });
  assert.equal(institution.situations.length, state.situations.length, "institution reste transverse pour Situation");
  assert.equal(institution.incomingMessages.length, 0, "institution reste gatée pour IncomingMessage (P2.1-B)");
});

// TEST I — Qualification Workspace (P2.1-B) non régressé par ce lot :
// vocabulaire, gating et parcours convert_message_to_signal seul
// toujours présents.
test("TEST I — CoordinationWorkspace.tsx : Qualification Workspace non régressé", () => {
  const source = readFileSync(fileURLToPath(new URL("../src/components/ecosystem/CoordinationWorkspace.tsx", import.meta.url)), "utf8");
  assert.ok(source.includes("canQualifyIntake"));
  assert.ok(source.includes("Qualifier comme signal"));
  assert.ok(source.includes("dismiss_incoming_message"));
  assert.equal(canRole("operateur", "convert_message_to_signal"), true);
  assert.equal(canRole("institution", "convert_message_to_signal"), false);
});

// TEST J — les ponts PublicRequest/PublicContribution (P2.1-A) non
// régressés : toujours aucun wrapper Signal+Situation, sourceRef intact.
test("TEST J — ponts PublicRequest/PublicContribution non régressés", () => {
  for (const path of ["../src/domain/public-request-signal-bridge.ts", "../src/domain/public-contribution-signal-bridge.ts"]) {
    const source = readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
    assert.ok(!source.includes("_and_situation"));
    assert.ok(source.includes("sourceRef:"));
  }
});

// Non-régression du câblage logout centralisé (mandat §6, défense en
// profondeur B) : les 3 shells appellent désormais useProduct().logout()
// plutôt que de dupliquer chacun leur propre fetch + redirection —
// vérifié par lecture de source (composants "use client" avec hooks,
// non montables hors navigateur réel, même contrainte que
// CoordinationWorkspace.tsx).
test("Les 3 shells (Produit, État, Terrain) utilisent le logout centralisé de ProductProvider", () => {
  for (const path of [
    "../src/components/shell/ProductShell.tsx",
    "../src/components/institution/InstitutionProductShell.tsx",
    "../src/components/terrain/TerrainProductShell.tsx"
  ]) {
    const source = readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
    assert.ok(source.includes("logout } = useProduct()") || source.includes(", logout"), `${path} doit consommer logout depuis useProduct()`);
    assert.ok(!source.includes('fetch("/api/auth/logout"'), `${path} ne doit plus dupliquer l'appel logout localement`);
  }
  const providerSource = readFileSync(fileURLToPath(new URL("../src/components/providers/ProductProvider.tsx", import.meta.url)), "utf8");
  assert.ok(providerSource.includes("clearDemoState()") && providerSource.includes('fetch("/api/auth/logout"'), "logout() doit purger localStorage ET appeler /api/auth/logout");
});
