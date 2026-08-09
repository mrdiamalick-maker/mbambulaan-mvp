import assert from "node:assert/strict";
import test from "node:test";
import { getDemoAccessControl, resetDemoAccessControl } from "./demo-access-registry";
import { authorizeDemoRequest } from "./request-authorization";

test("refuse une requête sensible sans session", () => {
  resetDemoAccessControl();
  const request = new Request("http://localhost/api/v1/atlas/decisions");
  const result = authorizeDemoRequest({ request, permission: "atlas.approve", productCode: "atlas" });
  assert.equal(result.allowed, false);
  if (!result.allowed) assert.equal(result.status, 401);
});

test("refuse Atlas à un pêcheur même avec une session valide", () => {
  resetDemoAccessControl();
  const session = getDemoAccessControl().createSession({ identityId: "demo-fisher-joal", issuedAt: "2026-07-27T10:00:00Z" });
  const request = new Request("http://localhost/api/v1/atlas/decisions", {
    headers: { "x-mbambulaan-demo-session": session.id },
  });
  const result = authorizeDemoRequest({ request, permission: "atlas.approve", productCode: "atlas", territoryId: "territory-joal" });
  assert.equal(result.allowed, false);
  if (!result.allowed) assert.equal(result.status, 403);
});

test("autorise un superviseur national à approuver une décision Atlas", () => {
  resetDemoAccessControl();
  const session = getDemoAccessControl().createSession({ identityId: "demo-government-supervisor", issuedAt: "2026-07-27T10:00:00Z" });
  const request = new Request("http://localhost/api/v1/atlas/decisions", {
    headers: { "x-mbambulaan-demo-session": session.id },
  });
  const result = authorizeDemoRequest({ request, permission: "atlas.approve", productCode: "atlas", territoryId: "territory-dakar" });
  assert.equal(result.allowed, true);
  if (result.allowed) assert.equal(result.identity.id, "demo-government-supervisor");
});
