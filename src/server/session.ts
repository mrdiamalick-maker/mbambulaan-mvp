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

export async function currentSession(): Promise<Session> {
  const store = await cookies();
  return (
    decodeSession(store.get(COOKIE)?.value) ?? {
      actorId: "act-coordinateur",
      role: "coordinateur",
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      demo: true
    }
  );
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
