import assert from "node:assert/strict";
import { describe, it } from "node:test";

export { describe, it };

export function expect<T>(actual: T) {
  return {
    toBe(expected: unknown) {
      assert.equal(actual, expected);
    },
    toEqual(expected: unknown) {
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
      else assert.ok(Array.isArray(actual) && actual.includes(expected));
    },
    toHaveLength(expected: number) {
      assert.equal((actual as { length: number }).length, expected);
    },
    toThrow(expected?: RegExp | string) {
      assert.equal(typeof actual, "function");
      assert.throws(actual as () => unknown, expected instanceof RegExp ? expected : expected ? new RegExp(expected) : undefined);
    },
  };
}
