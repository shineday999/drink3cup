import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "../rate-limit";

const MIN = 60_000;

function fakeKV(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: async (key: string) =>
      store.has(key) ? JSON.parse(store.get(key) as string) : null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
    delete: async (key: string) => {
      store.delete(key);
    },
  } as unknown as KVNamespace;
}

describe("createRateLimiter", () => {
  let now = 1_000_000;
  const limiter = () =>
    createRateLimiter({
      prefix: "t",
      maxAttempts: 5,
      windowMs: 15 * MIN,
      lockoutMs: 15 * MIN,
    });

  beforeEach(() => {
    now = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
  });
  afterEach(() => vi.restoreAllMocks());

  it("allows when there is no record", async () => {
    expect((await limiter().check(fakeKV(), "1.1.1.1")).allowed).toBe(true);
  });

  it("locks on the 5th failure with retryAfter 900s", async () => {
    const kv = fakeKV();
    const rl = limiter();
    for (let i = 0; i < 4; i++) await rl.recordFailure(kv, "1.1.1.1");
    expect((await rl.check(kv, "1.1.1.1")).allowed).toBe(true);
    await rl.recordFailure(kv, "1.1.1.1");
    const r = await rl.check(kv, "1.1.1.1");
    expect(r.allowed).toBe(false);
    expect(r.retryAfter).toBe(900);
  });

  it("does not affect other IPs or other prefixes", async () => {
    const kv = fakeKV();
    const rl = limiter();
    for (let i = 0; i < 5; i++) await rl.recordFailure(kv, "1.1.1.1");
    expect((await rl.check(kv, "2.2.2.2")).allowed).toBe(true);
    const other = createRateLimiter({
      prefix: "other",
      maxAttempts: 5,
      windowMs: 15 * MIN,
      lockoutMs: 15 * MIN,
    });
    expect((await other.check(kv, "1.1.1.1")).allowed).toBe(true);
  });

  it("unlocks after the lockout period", async () => {
    const kv = fakeKV();
    const rl = limiter();
    for (let i = 0; i < 5; i++) await rl.recordFailure(kv, "1.1.1.1");
    now += 15 * MIN + 1000;
    expect((await rl.check(kv, "1.1.1.1")).allowed).toBe(true);
  });

  it("restarts the count after the window expires", async () => {
    const kv = fakeKV();
    const rl = limiter();
    for (let i = 0; i < 4; i++) await rl.recordFailure(kv, "3.3.3.3");
    now += 16 * MIN;
    await rl.recordFailure(kv, "3.3.3.3");
    expect((await rl.check(kv, "3.3.3.3")).allowed).toBe(true);
  });

  it("clear() resets a locked IP", async () => {
    const kv = fakeKV();
    const rl = limiter();
    for (let i = 0; i < 5; i++) await rl.recordFailure(kv, "4.4.4.4");
    await rl.clear(kv, "4.4.4.4");
    expect((await rl.check(kv, "4.4.4.4")).allowed).toBe(true);
  });

  it("fails open without KV or when KV throws", async () => {
    const rl = limiter();
    expect((await rl.check(undefined, "x")).allowed).toBe(true);
    await rl.recordFailure(undefined, "x");
    await rl.clear(undefined, "x");
    const boom = async () => {
      throw new Error("boom");
    };
    const bad = {
      get: boom,
      put: boom,
      delete: boom,
    } as unknown as KVNamespace;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect((await rl.check(bad, "x")).allowed).toBe(true);
    await rl.recordFailure(bad, "x");
    await rl.clear(bad, "x");
  });
});
