import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";

const source = ".open-next";
const target = "dist";

if (!existsSync(`${source}/worker.js`)) {
  throw new Error("OpenNext build is missing .open-next/worker.js");
}

rmSync(target, { force: true, recursive: true });
mkdirSync(`${target}/server`, { recursive: true });
cpSync(source, `${target}/server`, { recursive: true });
renameSync(`${target}/server/worker.js`, `${target}/server/index.js`);
cpSync(`${source}/assets`, `${target}/assets`, { recursive: true });

console.log("Sites artifact prepared in dist/");
