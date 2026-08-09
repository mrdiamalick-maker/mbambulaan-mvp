import { createHmac, timingSafeEqual } from "node:crypto";

export type ProviderDeliveryEvent = {
  providerCode: string;
  providerReference: string;
  status: "delivered" | "failed";
  occurredAt: string;
  failureReason?: string;
};

export class NotificationProviderWebhookVerifier {
  verify(input: { rawBody: string; signature: string; secret: string }) {
    const expected = createHmac("sha256", input.secret).update(input.rawBody).digest("hex");
    const provided = input.signature.replace(/^sha256=/, "");
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  }

  parse(rawBody: string): ProviderDeliveryEvent {
    const body = JSON.parse(rawBody) as Partial<ProviderDeliveryEvent>;
    if (!body.providerCode || !body.providerReference || !body.status || !body.occurredAt) {
      throw new Error("Le callback fournisseur est incomplet.");
    }
    if (!['delivered', 'failed'].includes(body.status)) throw new Error("Le statut fournisseur est invalide.");
    return body as ProviderDeliveryEvent;
  }
}
