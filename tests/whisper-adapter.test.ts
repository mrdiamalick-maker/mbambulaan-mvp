import assert from "node:assert/strict";
import test from "node:test";
import { transcribeAudioWhisper, whisperConfigured } from "../src/intelligence/whisper-adapter";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
}

test("whisperConfigured — reflète uniquement la présence de OPENAI_API_KEY", () => {
  delete process.env.OPENAI_API_KEY;
  assert.equal(whisperConfigured(), false);
  process.env.OPENAI_API_KEY = "sk-test";
  assert.equal(whisperConfigured(), true);
  restoreEnv();
});

test("transcribeAudioWhisper — échoue explicitement si les octets sont absents, jamais une transcription fabriquée", async () => {
  process.env.OPENAI_API_KEY = "sk-test";
  await assert.rejects(() => transcribeAudioWhisper({ mediaId: "media-1" }), /Audio non téléchargé/);
  restoreEnv();
});

test("transcribeAudioWhisper — échoue explicitement si le fournisseur n'est pas configuré", async () => {
  delete process.env.OPENAI_API_KEY;
  await assert.rejects(
    () => transcribeAudioWhisper({ mediaId: "media-1", data: Buffer.from("fake-audio") }),
    /Fournisseur de transcription non configuré/
  );
  restoreEnv();
});

test("transcribeAudioWhisper — succès : texte + langue transmise telle quelle, confiance toujours « moyenne »", async () => {
  process.env.OPENAI_API_KEY = "sk-test";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    assert.ok(String(url).includes("audio/transcriptions"));
    return new Response(JSON.stringify({ text: "Besoin de glace à Mbour", language: "french" }), { status: 200 });
  }) as typeof fetch;

  try {
    const result = await transcribeAudioWhisper({ mediaId: "media-1", mimeType: "audio/ogg", data: Buffer.from("fake-audio") });
    assert.equal(result.text, "Besoin de glace à Mbour");
    assert.equal(result.language, "french");
    assert.equal(result.confidence, "moyenne");
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }
});

test("transcribeAudioWhisper — une langue inconnue/inattendue ne plante jamais, transmise telle quelle", async () => {
  process.env.OPENAI_API_KEY = "sk-test";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({ text: "...", language: "wolof-non-officiellement-supporte" }), { status: 200 })) as typeof fetch;

  try {
    const result = await transcribeAudioWhisper({ mediaId: "media-1", data: Buffer.from("fake-audio") });
    assert.equal(result.language, "wolof-non-officiellement-supporte");
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }
});

test("transcribeAudioWhisper — échoue explicitement sur une réponse HTTP non-OK, jamais un succès fabriqué", async () => {
  process.env.OPENAI_API_KEY = "sk-test";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response("", { status: 500 })) as typeof fetch;

  try {
    await assert.rejects(
      () => transcribeAudioWhisper({ mediaId: "media-1", data: Buffer.from("fake-audio") }),
      /refusé la requête \(HTTP 500\)/
    );
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }
});

test("transcribeAudioWhisper — échoue explicitement si la réponse n'a aucun texte exploitable", async () => {
  process.env.OPENAI_API_KEY = "sk-test";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({ text: "" }), { status: 200 })) as typeof fetch;

  try {
    await assert.rejects(() => transcribeAudioWhisper({ mediaId: "media-1", data: Buffer.from("fake-audio") }), /sans texte exploitable/);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }
});
