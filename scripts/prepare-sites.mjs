import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

const source = ".open-next";
const target = "dist";

if (!existsSync(`${source}/worker.js`)) {
  throw new Error("OpenNext build is missing .open-next/worker.js");
}

rmSync(target, { force: true, recursive: true });
cpSync(source, target, { recursive: true });
mkdirSync(`${target}/server`, { recursive: true });
writeFileSync(
  `${target}/server/index.js`,
  'export { default } from "../worker.js";\n'
);

console.log("Sites artifact prepared in dist/");
