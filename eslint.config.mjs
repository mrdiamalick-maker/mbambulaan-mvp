import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off"
    }
  },
  {
    files: [
      "src/components/demo/DemoJourney.tsx",
      "src/components/private-space/MinistryCommunityProgramsView.tsx",
      "src/components/private-space/MinistryControlTower.tsx",
      "src/components/private-space/MinistryControlTowerParts.tsx",
      "src/components/private-space/MinistryDailyExperience.tsx",
      "src/components/private-space/QuayProfileSheet.tsx"
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
];

export default config;
