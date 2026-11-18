import type { IntelligenceAdapter } from "./types";
import { anthropicConfigured, analyseImageAnthropic, interpretTerrainMessageAnthropic } from "./anthropic-adapter";
import { fixtureIntelligenceAdapter } from "./fixture-adapter";
import { transcribeAudioWhisper, whisperConfigured } from "./whisper-adapter";

// intelligenceAdapter — point d'entrée unique du pont de canal (mandat
// §3). Par capacité, pas par "un seul fournisseur global" : interpretation
// et vision basculent sur Anthropic dès qu'il est configuré ; la
// transcription audio bascule sur OpenAI Whisper dès qu'il est configuré
// (Sprint T04, mandat §4 — Anthropic ne propose pas de transcription
// réelle, voir anthropic-adapter.ts), sinon reste la fixture déterministe.
export const intelligenceAdapter: IntelligenceAdapter = {
  transcribeAudio(media) {
    return whisperConfigured() ? transcribeAudioWhisper(media) : fixtureIntelligenceAdapter.transcribeAudio(media);
  },
  analyseImage(media, caption) {
    return anthropicConfigured() ? analyseImageAnthropic(media, caption) : fixtureIntelligenceAdapter.analyseImage(media, caption);
  },
  interpretTerrainMessage(input) {
    return anthropicConfigured() ? interpretTerrainMessageAnthropic(input) : fixtureIntelligenceAdapter.interpretTerrainMessage(input);
  }
};
