import { NextRequest, NextResponse } from "next/server";
import type { PublicContributionInput } from "@/domain/public/contribution";
import { createPublicContribution } from "@/server/public-repository";

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

  if (typeof body.website_url === "string" && body.website_url.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const actorType = typeof body.actorType === "string" ? body.actorType : "";
  const services = typeof body.services === "string" ? body.services.trim() : "";
  const territories = typeof body.territories === "string" ? body.territories.trim() : "";
  const contactName = typeof body.contactName === "string" ? body.contactName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!actorType) return badRequest("Le type d’acteur est requis.");
  if (!services || services.length < 5) return badRequest("Merci de décrire vos services ou capacités.");
  if (!territories) return badRequest("Merci d’indiquer les territoires couverts.");
  if (!contactName) return badRequest("Le nom est requis.");
  if (!phone || phone.replace(/[^0-9+]/g, "").length < 8) return badRequest("Un numéro de téléphone valide est requis.");

  const email = typeof body.email === "string" && body.email.trim() ? body.email.trim() : undefined;
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return badRequest("L’adresse e-mail n’est pas valide.");

  const input: PublicContributionInput = {
    actorType: actorType as PublicContributionInput["actorType"],
    services,
    territories,
    capacity: typeof body.capacity === "string" && body.capacity.trim() ? body.capacity.trim() : undefined,
    organization: typeof body.organization === "string" && body.organization.trim() ? body.organization.trim() : undefined,
    contactName,
    phone,
    email,
    website: typeof body.website === "string" && body.website.trim() ? body.website.trim() : undefined,
    notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : undefined
  };

  try {
    const created = await createPublicContribution(input);
    return NextResponse.json({ reference: created.reference, status: created.status, createdAt: created.createdAt });
  } catch (error) {
    console.error("public_contribution_create_failed", error);
    return NextResponse.json({ error: "Votre proposition n’a pas pu être enregistrée. Merci de réessayer ou de nous écrire directement." }, { status: 500 });
  }
}
