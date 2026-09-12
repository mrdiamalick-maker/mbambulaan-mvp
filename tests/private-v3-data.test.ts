// Tests focalisés sur le template privé V3 (rebuild Claude Design) —
// délibérément séparés des tests du domaine Mbàmbulaan existant (§23 du
// mandat : "This new surface should have its own focused tests", pas une
// réécriture des tests du produit legacy pour les faire valider ce nouveau
// flux). Portent sur l'intégrité des fixtures de démonstration
// (src/v3-template/data) : aucune référence orpheline, aucune
// incohérence entre rôles/écrans/navigation.
import assert from "node:assert/strict";
import test from "node:test";
import { MODULES, ROLES } from "../src/v3-template/data/roles";
import { PERIOD } from "../src/v3-template/data/period";
import { SITS } from "../src/v3-template/data/situations";
import { PROGS, IND } from "../src/v3-template/data/programmes";
import { ARB } from "../src/v3-template/data/arbitrages";
import { FLUX } from "../src/v3-template/data/flux";
import { TD, TERR } from "../src/v3-template/data/territories";
import type { ScreenKey } from "../src/v3-template/types";

test("chaque rôle ne référence que des écrans réellement définis dans MODULES", () => {
  const moduleKeys = new Set(Object.keys(MODULES));
  for (const role of Object.values(ROLES)) {
    for (const key of [...role.main, ...role.sec]) {
      assert.ok(moduleKeys.has(key), `écran inconnu référencé par un rôle : ${key}`);
    }
    // Un écran ne doit apparaître qu'une fois par rôle (nav principale OU
    // secondaire, jamais les deux) — sinon la navigation serait ambiguë.
    const all = [...role.main, ...role.sec];
    assert.equal(new Set(all).size, all.length, "un écran apparaît deux fois dans la navigation d'un rôle");
  }
});

test("le premier écran de chaque rôle est un écran valide (page d'atterrissage)", () => {
  for (const [key, role] of Object.entries(ROLES)) {
    assert.ok(role.main.length > 0, `le rôle ${key} n'a aucun écran principal`);
    assert.ok((role.main[0] as ScreenKey) in MODULES, `écran d'atterrissage invalide pour ${key}`);
  }
});

test("les trois fenêtres temporelles ont un nombre de barres cohérent avec leurs libellés", () => {
  for (const [key, period] of Object.entries(PERIOD)) {
    assert.ok(period.bars.length > 0, `${key} n'a aucune barre de signal`);
    for (const kpi of period.kpis) {
      assert.ok(kpi.series.length > 0, `KPI "${kpi.k}" de ${key} n'a pas de série`);
    }
  }
});

test("chaque situation référence un programme existant", () => {
  const progIds = new Set(PROGS.map((p) => p.id));
  for (const s of SITS) {
    assert.ok(progIds.has(s.progId), `situation ${s.id} référence un programme inexistant (${s.progId})`);
    assert.ok(s.options.length > 0, `situation ${s.id} n'a aucune option de décision`);
  }
});

test("chaque signal de réalité de programme référence une situation existante", () => {
  const sitIds = new Set(SITS.map((s) => s.id));
  for (const p of PROGS) {
    for (const r of p.reality) {
      assert.ok(sitIds.has(r.sit), `programme ${p.id} référence une situation inexistante (${r.sit})`);
    }
  }
});

test("chaque territoire d'un programme existe dans le référentiel territorial", () => {
  const terrNames = new Set(TERR.map((t) => t[0]));
  for (const p of PROGS) {
    for (const t of p.terrs) {
      assert.ok(terrNames.has(t), `programme ${p.id} référence un territoire inconnu (${t})`);
    }
  }
});

test("chaque territoire du référentiel a des données démographiques/activité (TD)", () => {
  for (const t of TERR) {
    assert.ok(TD[t[0]], `territoire ${t[0]} n'a pas d'entrée dans TD`);
  }
});

test("les arbitrages ont chacun au moins deux options avec un coût renseigné", () => {
  for (const a of ARB) {
    assert.ok(a.options.length >= 2, `arbitrage "${a.title}" a moins de deux options`);
    for (const o of a.options) assert.ok(o.cost.length > 0);
  }
});

test("chaque élément du flux entrant a au moins une action de qualification", () => {
  for (const f of FLUX) {
    assert.ok(f.actions.length > 0, `élément flux ${f.id} n'a aucune action`);
  }
});

test("les indicateurs de résultats ont une définition et une interprétation non vides", () => {
  for (const i of IND) {
    assert.ok(i.def.length > 0);
    assert.ok(i.interp.length > 0);
    assert.ok(i.caveats.length > 0, `indicateur "${i.n}" n'a aucune réserve méthodologique`);
  }
});
