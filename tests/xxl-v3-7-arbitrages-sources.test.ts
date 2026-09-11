import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";
import { dataSourceRegistry, dataSourceSummary } from "../src/domain/data-sources";

// LOT V3.7 ("Arbitrages / Sources") — les deux derniers écrans du plan V3
// jamais couverts par un lot dédié. Arbitrages (composant "use client")
// n'est pas montable via renderToStaticMarkup dans ce jeu de tests Node
// pur (même contrainte déjà documentée pour les LOTs V3.1-V3.6) — vérifié
// par lecture de source. Le Core (domain/data-sources.ts, pur) est testé
// en direct, ainsi que DataSourcesRegistry.tsx (composant serveur, pas de
// hook, mais tout de même vérifié par lecture de source pour rester
// cohérent avec la discipline des lots précédents).
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const state = createDemoState();

// TEST 1 — dataSourceRegistry reste une lecture directe et vérifiable :
// 6 cartes (même nombre que le prototype), chaque compteur affiché dans
// `effect` provient réellement de state, jamais d'un nombre fabriqué.
test("TEST 1 — dataSourceRegistry produit 6 cartes dont les chiffres proviennent réellement de ProductState", () => {
  const cards = dataSourceRegistry(state);
  assert.equal(cards.length, 6);

  const onSite = state.signals.filter((s) => ["terrain", "poste_quai", "whatsapp_structure"].includes(s.channel));
  const declarative = state.signals.filter((s) => ["telephone", "espace_public"].includes(s.channel));
  // Toute la partition des canaux doit être couverte, jamais un signal
  // orphelin qui n'apparaîtrait dans aucune des deux cartes "connectée".
  assert.equal(onSite.length + declarative.length, state.signals.length);

  const terrainCard = cards.find((c) => c.key === "terrain");
  const declaratifCard = cards.find((c) => c.key === "declaratif");
  assert.ok(terrainCard?.effect.includes(String(onSite.length)));
  assert.ok(declaratifCard?.effect.includes(String(declarative.length)));

  const vesselCard = cards.find((c) => c.key === "immatriculation");
  assert.ok(vesselCard?.effect.includes(String(state.vessels.length)));

  const refCard = cards.find((c) => c.key === "referentiels");
  assert.ok(refCard?.effect.includes(String(state.territories.length)));
  assert.ok(refCard?.effect.includes(String(state.organizations.length)));
});

// TEST 2 — jamais de compteur négatif ou incohérent (garde-fou "jamais
// fabriqué, jamais impossible").
test("TEST 2 — dataSourceSummary reste cohérent avec la donnée réelle", () => {
  const summary = dataSourceSummary(state);
  assert.ok(summary.connectedCount >= 0);
  assert.ok(summary.connectedCount <= summary.totalCount);
  assert.equal(summary.totalCount, 6);
  const totalFunding = state.initiatives.flatMap((i) => i.funding).reduce((sum, f) => sum + f.amountFcfa, 0);
  assert.equal(summary.fundingTotalFcfa, totalFunding);
});

// TEST 3 — la page Sources est réellement montée sous /app/etat/sources et
// consomme DataSourcesRegistry (aucune route équivalente n'existait avant
// ce lot).
test("TEST 3 — /app/etat/sources monte réellement DataSourcesRegistry", () => {
  const pageSource = readSource("../src/app/app/etat/sources/page.tsx");
  assert.ok(pageSource.includes('from "@/components/etat/DataSourcesRegistry"'));
  assert.ok(pageSource.includes("<DataSourcesRegistry state={state} />"));
  const navSource = readSource("../src/domain/platform/private-nav.ts");
  assert.ok(navSource.includes('href: "/app/etat/sources"'));
});

// TEST 4 — Arbitrages : le panneau "Décision attendue" continue de
// n'exposer que des actions réelles (jamais les options de texte libre
// pro/con du prototype, qui ne correspondent à aucune commande générique
// du domaine — décision déjà prise et documentée avant ce lot,
// reconfirmée ici plutôt que silencieusement défaite).
test("TEST 4 — ArbitragesPage n'expose toujours que des actions réelles, jamais les options fabriquées du prototype", () => {
  const source = readSource("../src/app/app/etat/arbitrages/page.tsx");
  assert.ok(source.includes("Planifier une visite terrain"));
  assert.ok(source.includes("Arbitrer cette situation"));
  assert.ok(!source.includes("arbOptions"), "aucune trace du mécanisme d'options fabriquées du prototype");
  // 3e colonne ("Si rien n'est décidé") : présente, mais dérivée de champs
  // réels (priorité/étape/ancienneté), jamais d'une conséquence narrative
  // inventée.
  assert.ok(source.includes("Si rien n’est décidé"));
  assert.ok(source.includes("lg:grid-cols-3"));
});
