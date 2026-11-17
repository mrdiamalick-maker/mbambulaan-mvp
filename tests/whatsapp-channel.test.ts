import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { GRAPH_API_VERSION, parseWhatsappInboundMessages, verifyWhatsappSignature, verifyWhatsappWebhookChallenge, whatsappAdapter } from "../src/channels/whatsapp";

const ORIGINAL_APP_SECRET = process.env.WHATSAPP_APP_SECRET;
const ORIGINAL_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

test.after(() => {
  process.env.WHATSAPP_APP_SECRET = ORIGINAL_APP_SECRET;
  process.env.WHATSAPP_VERIFY_TOKEN = ORIGINAL_VERIFY_TOKEN;
});

test("verifyWhatsappSignature — accepte une signature HMAC valide, refuse tout le reste", () => {
  process.env.WHATSAPP_APP_SECRET = "secret-de-test";
  const body = JSON.stringify({ hello: "world" });
  const validSignature = "sha256=" + createHmac("sha256", "secret-de-test").update(body, "utf8").digest("hex");

  assert.equal(verifyWhatsappSignature(body, validSignature), true);
  assert.equal(verifyWhatsappSignature(body, "sha256=0000"), false, "une signature incorrecte doit être refusée");
  assert.equal(verifyWhatsappSignature(body, null), false, "aucune signature fournie doit être refusée");
  assert.equal(verifyWhatsappSignature(body + "falsifié", validSignature), false, "un corps modifié doit invalider la signature");

  delete process.env.WHATSAPP_APP_SECRET;
  assert.equal(verifyWhatsappSignature(body, validSignature), false, "sans secret configuré, jamais d'acceptation par défaut");
});

test("verifyWhatsappWebhookChallenge — n'accepte que mode=subscribe avec le bon verify_token", () => {
  process.env.WHATSAPP_VERIFY_TOKEN = "jeton-de-test";
  assert.equal(verifyWhatsappWebhookChallenge("subscribe", "jeton-de-test"), true);
  assert.equal(verifyWhatsappWebhookChallenge("subscribe", "mauvais-jeton"), false);
  assert.equal(verifyWhatsappWebhookChallenge("autre", "jeton-de-test"), false);
  assert.equal(verifyWhatsappWebhookChallenge(null, null), false);
});

test("parseWhatsappInboundMessages — messages texte avec contenu réel", () => {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                { id: "wamid.1", from: "221771234567", timestamp: "1700000000", type: "text", text: { body: "Bonjour" } },
                { id: "wamid.3", from: "221779999999", timestamp: "1700000200", type: "text", text: { body: "Autre numéro" } }
              ]
            }
          }
        ]
      }
    ]
  };

  const messages = parseWhatsappInboundMessages(payload);
  assert.equal(messages.length, 2);
  assert.equal(messages[0].channel, "whatsapp");
  assert.equal(messages[0].messageType, "texte");
  assert.equal(messages[0].channelAddress, "221771234567");
  assert.equal(messages[0].rawContent, "Bonjour");
  assert.equal(messages[0].externalMessageId, "wamid.1");
  assert.equal(messages[0].occurredAt, new Date(1700000000 * 1000).toISOString());
  assert.equal(messages[1].channelAddress, "221779999999");
});

test("parseWhatsappInboundMessages — audio/image/document/type inconnu : jamais de plantage, jamais de contenu transcrit fabriqué (mandat §10)", () => {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                { id: "wamid.audio", from: "221771234567", timestamp: "1700000100", type: "audio" },
                { id: "wamid.image", from: "221771234567", timestamp: "1700000150", type: "image" },
                { id: "wamid.doc", from: "221771234567", timestamp: "1700000160", type: "document" },
                { id: "wamid.sticker", from: "221771234567", timestamp: "1700000170", type: "sticker" }
              ]
            }
          }
        ]
      }
    ]
  };

  const messages = parseWhatsappInboundMessages(payload);
  assert.equal(messages.length, 4, "un type non supporté doit produire une interaction media-pending, jamais planter ni être silencieusement perdu");
  assert.equal(messages[0].messageType, "audio");
  assert.equal(messages[1].messageType, "image");
  assert.equal(messages[2].messageType, "document");
  assert.equal(messages[3].messageType, "autre", "un type WhatsApp non mappé retombe sur 'autre', jamais une erreur");
  for (const message of messages) {
    assert.ok(!message.rawContent.toLowerCase().includes("transcri"), "aucune transcription ne doit être fabriquée");
    assert.ok(message.rawContent.length > 0, "un repère factuel doit rester présent même sans contenu texte");
  }
});

test("parseWhatsappInboundMessages — message incomplet (id/from/timestamp/type manquant) ignoré sans planter, le reste du lot continue", () => {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                { id: "wamid.incomplet", from: "221771234567" },
                { id: "wamid.ok", from: "221771234567", timestamp: "1700000000", type: "text", text: { body: "Message valide" } }
              ]
            }
          }
        ]
      }
    ]
  };
  const messages = parseWhatsappInboundMessages(payload as never);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].externalMessageId, "wamid.ok");
});

test("parseWhatsappInboundMessages — payload vide ou sans messages ne produit aucun message fabriqué", () => {
  assert.deepEqual(parseWhatsappInboundMessages({}), []);
  assert.deepEqual(parseWhatsappInboundMessages({ entry: [{ changes: [{ value: {} }] }] }), []);
});

test("whatsappAdapter.sendText — contrat : échoue explicitement sans configuration, appelle Graph API correctement quand configurée", async () => {
  delete process.env.WHATSAPP_ACCESS_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  await assert.rejects(() => whatsappAdapter.sendText("221700000000", "test"), /non configurée/);

  process.env.WHATSAPP_ACCESS_TOKEN = "token-de-test";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "123456";
  const originalFetch = globalThis.fetch;
  let capturedUrl: string | undefined;
  let capturedInit: { headers?: Record<string, string>; body?: string } | undefined;
  globalThis.fetch = (async (url: string, init?: typeof capturedInit) => {
    capturedUrl = url;
    capturedInit = init;
    return new Response(null, { status: 200 });
  }) as typeof fetch;
  try {
    await whatsappAdapter.sendText("221700000000", "Bonjour");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  assert.equal(capturedUrl, `https://graph.facebook.com/${GRAPH_API_VERSION}/123456/messages`);
  const body = JSON.parse(capturedInit!.body as string);
  assert.equal(body.to, "221700000000");
  assert.equal(body.type, "text");
  assert.equal(body.text.body, "Bonjour");
  assert.equal((capturedInit!.headers as Record<string, string>).Authorization, "Bearer token-de-test");
});

test("whatsappAdapter.sendText — une réponse Graph API non ok se traduit par une erreur explicite", async () => {
  process.env.WHATSAPP_ACCESS_TOKEN = "token-de-test";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "123456";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(null, { status: 500 })) as typeof fetch;
  try {
    await assert.rejects(() => whatsappAdapter.sendText("221700000000", "Bonjour"), /refusé/);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  }
});
