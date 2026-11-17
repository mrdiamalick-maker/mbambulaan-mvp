import type { IntelligenceAdapter } from "./types";
import { anthropicConfigured, analyseImageAnthropic, interpretTerrainMessageAnthropic } from "./anthropic-adapter";
import { fixtureIntelligenceAdapter } from "./fixture-adapter";

// intelligenceAdapter — point d'entrée unique du pont de canal (mandat
// §3). Par capacité, pas par "un seul fournisseur global" : interpretation
// et vision basculent sur Anthropic dès qu'il est configuré, la
// transcription audio reste TOUJOURS la fixture déterministe, puisque ce
// fournisseur ne propose pas de transcription réelle (anthropic-adapter.ts).
export const intelligenceAdapter: IntelligenceAdapter = {
  transcribeAudio(media) {
    return fixtureIntelligenceAdapter.transcribeAudio(media);
  },
  analyseImage(media, caption) {
    return anthropicConfigured() ? analyseImageAnthropic(media, caption) : fixtureIntelligenceAdapter.analyseImage(media, caption);
  },
  interpretTerrainMessage(input) {
    return anthropicConfigured() ? interpretTerrainMessageAnthropic(input) : fixtureIntelligenceAdapter.interpretTerrainMessage(input);
  }
};
