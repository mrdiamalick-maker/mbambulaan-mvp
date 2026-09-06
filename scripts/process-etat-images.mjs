import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "/tmp/claude-0/-home-user-mbambulaan-mvp/ef4389ee-14d5-5d56-afbf-534add3d21ca/scratchpad/images-extract";
const OUT = "/home/user/mbambulaan-mvp/public/images";
mkdirSync(OUT, { recursive: true });

// [sourceFile, outputName, maxWidth]
const jobs = [
  ["Image Codex 5 sept. 2026, 23_32_03.png", "etat-brief-hero.webp", 2200],
  ["Image Codex 6 sept. 2026, 00_21_50.png", "etat-brief-decision-quai.webp", 900],
  ["Image Codex 6 sept. 2026, 00_27_45.png", "etat-atlas-territory-context.webp", 900],
  ["Image Codex 6 sept. 2026, 00_39_54.png", "etat-territoire-dossier-context.webp", 900],
  ["Image Codex 6 sept. 2026, 00_41_22.png", "etat-situation-retour-pirogue.webp", 500],
  ["Image Codex 6 sept. 2026, 00_42_48.png", "etat-situation-pesee-mareyeurs.webp", 500],
  ["Image Codex 6 sept. 2026, 00_45_16.png", "etat-situation-glace-hors-service.webp", 500],
  ["Image Codex 6 sept. 2026, 00_47_32.png", "etat-situation-capacite-saturee.webp", 500],
  ["Image Codex 6 sept. 2026, 00_48_57.png", "etat-situation-transformation-traine.webp", 500],
  ["Image Codex 6 sept. 2026, 00_52_53.png", "etat-situation-erosion-quai.webp", 500],
  ["Image Codex 6 sept. 2026, 01_06_06.png", "etat-programmes-hero.webp", 1200],
  ["Image Codex 6 sept. 2026, 01_12_01.png", "etat-resultats-context.webp", 1000]
];

for (const [src, outName, maxWidth] of jobs) {
  const outPath = `${OUT}/${outName}`;
  await sharp(`${SRC}/${src}`)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outPath);
  const meta = await sharp(outPath).metadata();
  const { statSync } = await import("node:fs");
  const size = statSync(outPath).size;
  console.log(outName, meta.width + "x" + meta.height, (size / 1024).toFixed(0) + "KB");
}
