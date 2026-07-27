import assert from "node:assert/strict";
import { describe, it } from "node:test";

export { describe, it };

interface ArrayContainingMatcher {
  readonly __matcher: "arrayContaining";
  readonly expected: unknown[];
}

function expectValue<T>(actual: T) {
  return {
    toBe(expected: unknown) {
      assert.equal(actual, expected);
    },
    toEqual(expected: unknown) {
      if (isArrayContaining(expected)) {
        assert.ok(Array.isArray(actual), "La valeur reçue doit être un tableau.");
        for (const item of expected.expected) {
          assert.ok(actual.some((candidate) => isDeepEqual(candidate, item)), `Élément attendu absent : ${JSON.stringify(item)}`);
        }
        return;
      }
      assert.deepEqual(actual, expected);
    },
    toBeDefined() {
      assert.notEqual(actual, undefined);
    },
    toBeUndefined() {
      assert.equal(actual, undefined);
    },
    toBeTruthy() {
      assert.ok(actual);
    },
    toBeFalsy() {
      assert.ok(!actual);
    },
    toBeGreaterThan(expected: number) {
      assert.ok(Number(actual) > expected);
    },
    toBeGreaterThanOrEqual(expected: number) {
      assert.ok(Number(actual) >= expected);
    },
    toBeLessThan(expected: number) {
      assert.ok(Number(actual) < expected);
    },
    toContain(expected: unknown) {
      if (typeof actual === "string") assert.ok(actual.includes(String(expected)));
      else assert.ok(Array.isArray(actual) && actual.some((candidate) => isDeepEqual(candidate, expected)));
    },
    toHaveLength(expected: number) {
      assert.equal((actual as { length: number }).length, expected);
    },
    toThrow(expected?: RegExp | string) {
      assert.equal(typeof actual, "function");
      const block = actual as () => unknown;
      if (expected instanceof RegExp) assert.throws(block, expected);
      else if (typeof expected === "string") assert.throws(block, new RegExp(expected));
      else assert.throws(block);
    },
  };
}

export const expect = Object.assign(expectValue, {
  arrayContaining(expected: unknown[]): ArrayContainingMatcher {
    return { __matcher: "arrayContaining", expected };
  },
});

function isArrayContaining(value: unknown): value is ArrayContainingMatcher {
  return Boolean(value && typeof value === "object" && (value as ArrayContainingMatcher).__matcher === "arrayContaining");
}

function isDeepEqual(left: unknown, right: unknown) {
  try {
    assert.deepEqual(left, right);
    return true;
  } catch {
    return false;
  }
}
