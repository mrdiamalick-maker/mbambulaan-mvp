// Script UNIQUE, exécuté une fois par un développeur — extrait les
// fichiers de police (.woff2) OCTET POUR OCTET du standalone "Mbàmbulaan
// V3 (Claude Design)" fourni comme source de vérité pour le lot
// "Private V3 — clean template", et les écrit dans
// public/private-v3-fonts/.
//
// Pourquoi : le standalone charge Newsreader / IBM Plex Sans / IBM Plex
// Mono via un <link> fonts.googleapis.com ; next/font/google va chercher
// sa PROPRE copie de ces polices au build. Mesuré à l'écran lors de la
// vérification côte à côte (§7 du mandat de vérification), cette copie a
// des métriques suffisamment différentes pour changer un retour à la
// ligne (un titre d'arbitrage à 26px repassait sur une seule ligne au
// lieu de deux, largeur de boîte strictement identique par ailleurs).
// Utiliser les mêmes fichiers que la source élimine cette classe d'écart
// à la racine plutôt que de la corriger point par point.
//
// Le standalone est un "bundle" auto-suffisant : ses polices (et
// React/ReactDOM) sont embarquées en base64+gzip dans un manifeste
// interne (script type="__bundler/manifest"), chaque ressource étant
// référencée par un UUID injecté comme src="UUID" dans les @font-face du
// gabarit (script type="__bundler/template"). Ce script relit ces deux
// blocs, retrouve les @font-face Newsreader / IBM Plex Sans / IBM Plex
// Mono en sous-ensembles latin + latin-ext (ce que le français utilise —
// les autres écritures du bundle, cyrillique, vietnamien…, ne servent pas
// ici), et écrit chaque fichier une seule fois même quand plusieurs
// graisses partagent la même police variable.
//
// Usage : node scripts/extract-private-v3-fonts.mjs <chemin-du-standalone.html>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/extract-private-v3-fonts.mjs <chemin-du-standalone.html>");
  process.exit(1);
}

const lines = readFileSync(src, "utf-8").split("\n");
const manifestLine = lines.find((l) => l.includes('script type="__bundler/manifest"'));
const templateLine = lines.find((l) => l.includes('script type="__bundler/template"'));
const manifestIdx = lines.indexOf(manifestLine) + 1;
const templateIdx = lines.indexOf(templateLine) + 1;
const manifest = JSON.parse(lines[manifestIdx]);
const template = JSON.parse(lines[templateIdx]); // JSON-encoded HTML string

function getBlob(uuid) {
  const entry = manifest[uuid];
  let raw = Buffer.from(entry.data, "base64");
  if (entry.compressed) raw = gunzipSync(raw);
  return raw;
}

const faceRe = /@font-face\s*\{([^}]*)\}/g;
const faces = [];
let m;
while ((m = faceRe.exec(template))) {
  const b = m[1];
  const fam = /font-family:\s*'([^']+)'/.exec(b)?.[1];
  const style = /font-style:\s*(\w+)/.exec(b)?.[1] ?? "normal";
  const uuid = /src:\s*url\("([a-f0-9-]+)"\)/.exec(b)?.[1];
  const range = /unicode-range:\s*([^;]+);/.exec(b)?.[1]?.trim() ?? "";
  if (fam && uuid) faces.push({ family: fam, style, uuid, range });
}

const WANTED_FAMILIES = ["Newsreader", "IBM Plex Sans", "IBM Plex Mono"];
const wanted = faces.filter(
  (f) => WANTED_FAMILIES.includes(f.family) && f.style === "normal" &&
    (f.range.startsWith("U+0000-00FF") || f.range.startsWith("U+0100-02BA"))
);

const outDir = join(root, "public", "private-v3-fonts");
mkdirSync(outDir, { recursive: true });
const seen = new Map(); // content hash -> filename, to dedupe variable-font files shared across weights

for (const f of wanted) {
  const data = getBlob(f.uuid);
  const hash = createHash("md5").update(data).digest("hex").slice(0, 8);
  const subset = f.range.startsWith("U+0000-00FF") ? "latin" : "latin-ext";
  const slug = f.family.replace(/\s+/g, "").toLowerCase();
  let filename = seen.get(hash);
  if (!filename) {
    filename = `${slug}-${hash}-${subset}.woff2`;
    seen.set(hash, filename);
    writeFileSync(join(outDir, filename), data);
    console.log(`wrote ${filename} (${data.length} bytes)`);
  }
}

console.log("\nNote : renommer les fichiers écrits en <famille>-variable-<sous-ensemble>.woff2");
console.log("(ou <famille>-<graisse>-<sous-ensemble>.woff2 pour IBM Plex Mono, qui n'est pas");
console.log("variable dans ce bundle) et mettre à jour src/v3-template/fonts.css en conséquence —");
console.log("ce script écrit les octets, pas la feuille de style, pour qu'un renommage ne fasse");
console.log("jamais perdre le lien vers le fichier réellement chargé par la page.");
