import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Role } from "@/domain/types";

const COOKIE = "mbambulaan_session";
const fallbackSecret = "mbambulaan-demo-secret-change-in-production";

export interface Session {
  actorId: string;
  role: Role;
  expiresAt: number;
  demo: boolean;
}

function secret() {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    console.warn("SESSION_SECRET absent : session limitée au mode démonstration.");
  }
  return process.env.SESSION_SECRET ?? fallbackSecret;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(value?: string): Session | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
  return session.expiresAt > Date.now() ? session : null;
}

export async function currentSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE)?.value);
}

// À utiliser dans toute route API qui agit sur des données : lève une
// erreur claire (traduite en 401 par la route) plutôt que de retomber sur
// une identité par défaut. Aucune route Produit ne doit rester accessible
// sans session valide.
export async function requireSession(): Promise<Session> {
  const session = await currentSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Session absente ou expirée.");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Votre mandat ne donne pas accès à cet espace.");
    this.name = "ForbiddenError";
  }
}

// Garde de rôle réutilisable pour les espaces réservés (Ministère,
// Administration…) : à appeler côté serveur (layout ou route API), jamais
// seulement côté client — la visibilité dans le menu ne suffit pas.
export async function requireRole(...roles: Role[]): Promise<Session> {
  const session = await requireSession();
  if (!roles.includes(session.role)) throw new ForbiddenError();
  return session;
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60,
    path: "/"
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
