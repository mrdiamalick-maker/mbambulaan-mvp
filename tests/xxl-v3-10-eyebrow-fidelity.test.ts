import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

// LOT V3.10 ("Brief national — style seulement, structure conservée",
// mandat explicite de l'utilisateur : "style seulement, structure et
// blocs réels conservés", pas de reconstruction de la page) — l'écart de
// style le plus net entre le produit et la maquette Claude Design était
// la puce ronde systématique devant chaque eyebrow (.etat-eyebrow-dot),
// absente de tous les écrans de la maquette lus cette session
// (Arbitrages, Sources, Flux, Brief, Situations…). Balayage complet du
// produit plutôt qu'un correctif local à une seule page : la classe
// .etat-eyebrow (partagée par 12+ fichiers) restait sinon incohérente
// selon la page.
function projectRoot(): string {
  return fileURLToPath(new URL("..", import.meta.url));
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const full = `${dir}/${entry}`;
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) out.push(full);
  }
  return out;
}

test("TEST 1 — aucune trace de la puce d'eyebrow (etat-eyebrow-dot) ne subsiste dans le produit", () => {
  const root = projectRoot();
  const files = walk(`${root}/src`);
  const offenders = files.filter((file) => readFileSync(file, "utf-8").includes("etat-eyebrow-dot"));
  // La seule trace légitime restante est la définition CSS elle-même
  // (classe conservée, simplement plus consommée nulle part).
  assert.deepEqual(offenders, [], "etat-eyebrow-dot ne doit plus être utilisée dans aucun composant/page");
  const cssSource = readFileSync(`${root}/src/app/etat-design-system.css`, "utf-8");
  assert.ok(cssSource.includes(".etat-eyebrow-dot {"), "la classe reste définie (retrait de son usage, pas suppression de la classe elle-même)");
});

// TEST 2 — la lettre-espacement de l'eyebrow (.18em, valeur exacte de la
// maquette) reste appliquée sur la classe partagée.
test("TEST 2 — .etat-eyebrow reprend le letter-spacing exact de la maquette (.18em)", () => {
  const root = projectRoot();
  const cssSource = readFileSync(`${root}/src/app/etat-design-system.css`, "utf-8");
  assert.ok(cssSource.includes("letter-spacing: .18em;"));
});
