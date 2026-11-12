import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { parseWhatsappInboundMessages, verifyWhatsappSignature, verifyWhatsappWebhookChallenge } from "../src/channels/whatsapp";

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

test("parseWhatsappInboundMessages — ne retient que les messages texte, ignore les autres types (audio/image hors périmètre)", () => {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                { id: "wamid.1", from: "221771234567", timestamp: "1700000000", type: "text", text: { body: "Bonjour" } },
                { id: "wamid.2", from: "221771234567", timestamp: "1700000100", type: "audio" },
                { id: "wamid.3", from: "221779999999", timestamp: "1700000200", type: "text", text: { body: "Autre numéro" } }
              ]
            }
          }
        ]
      }
    ]
  };

  const messages = parseWhatsappInboundMessages(payload);
  assert.equal(messages.length, 2, "le message audio doit être ignoré, pas fabriqué en texte vide");
  assert.equal(messages[0].channel, "whatsapp");
  assert.equal(messages[0].channelAddress, "221771234567");
  assert.equal(messages[0].rawContent, "Bonjour");
  assert.equal(messages[0].externalMessageId, "wamid.1");
  assert.equal(messages[0].occurredAt, new Date(1700000000 * 1000).toISOString());
  assert.equal(messages[1].channelAddress, "221779999999");
});

test("parseWhatsappInboundMessages — payload vide ou sans messages ne produit aucun message fabriqué", () => {
  assert.deepEqual(parseWhatsappInboundMessages({}), []);
  assert.deepEqual(parseWhatsappInboundMessages({ entry: [{ changes: [{ value: {} }] }] }), []);
});
