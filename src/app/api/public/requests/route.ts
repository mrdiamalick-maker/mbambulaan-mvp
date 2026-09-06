import { NextRequest, NextResponse } from "next/server";
import type { PublicRequestInput } from "@/domain/public/request";
import { createPublicRequest } from "@/server/public-repository";

const VALID_SOURCES = new Set(["web", "whatsapp", "telephone", "terrain", "partenaire", "evenement"]);
const VALID_CHANNELS = new Set(["whatsapp", "telephone", "email"]);

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest("Corps de requête invalide.");
  }

  // Piège anti-spam : un champ masqué que seuls les robots remplissent.
  if (typeof body.website_url === "string" && body.website_url.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  const contactName = typeof body.contactName === "string" ? body.contactName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const intent = typeof body.intent === "string" ? body.intent : "";
  const actorType = typeof body.actorType === "string" ? body.actorType : "";
  const preferredChannel = typeof body.preferredChannel === "string" ? body.preferredChannel : "";
  const source = typeof body.source === "string" && VALID_SOURCES.has(body.source) ? body.source : "web";
  const consent = body.consent === true;

  if (!description || description.length < 8) return badRequest("Merci de décrire votre besoin (au moins quelques mots).");
  if (!contactName) return badRequest("Le nom est requis.");
  if (!phone || phone.replace(/[^0-9+]/g, "").length < 8) return badRequest("Un numéro de téléphone valide est requis.");
  if (!intent) return badRequest("L’intention est requise.");
  if (!actorType) return badRequest("Le type d’acteur est requis.");
  if (!VALID_CHANNELS.has(preferredChannel)) return badRequest("Le canal préféré est requis.");
  if (!consent) return badRequest("Le consentement est requis pour traiter la demande.");

  const email = typeof body.email === "string" && body.email.trim() ? body.email.trim() : undefined;
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return badRequest("L’adresse e-mail n’est pas valide.");

  const input: PublicRequestInput = {
    source: source as PublicRequestInput["source"],
    context: typeof body.context === "object" && body.context !== null ? (body.context as Record<string, string>) : undefined,
    intent: intent as PublicRequestInput["intent"],
    category: typeof body.category === "string" ? body.category : undefined,
    territory: typeof body.territory === "string" && body.territory.trim() ? body.territory.trim() : undefined,
    description,
    actorType: actorType as PublicRequestInput["actorType"],
    organization: typeof body.organization === "string" && body.organization.trim() ? body.organization.trim() : undefined,
    contactName,
    phone,
    email,
    preferredChannel: preferredChannel as PublicRequestInput["preferredChannel"],
    consent,
    attachmentNote: typeof body.attachmentNote === "string" && body.attachmentNote.trim() ? body.attachmentNote.trim() : undefined
  };

  try {
    const created = await createPublicRequest(input);
    return NextResponse.json({ reference: created.reference, status: created.status, createdAt: created.createdAt });
  } catch (error) {
    console.error("public_request_create_failed", error);
    return NextResponse.json({ error: "La demande n’a pas pu être enregistrée. Merci de réessayer ou de nous écrire directement." }, { status: 500 });
  }
}
