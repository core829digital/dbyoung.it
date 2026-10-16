import { describe, expect, it, beforeAll } from "vitest";
import {
  sha256Hex,
  randomHex,
  timingSafeEqualHex,
  canonicalJson,
  hashPassword,
  verifyPassword,
  totpVerify,
  base32Encode,
  base32Decode,
  requireServerAuth,
} from "../crypto";
import { canonicalJson as nodeCanonical, signServerAction, verifyServerActionLocal } from "../../lib/adminSign";

describe("convex/crypto", () => {
  beforeAll(() => {
    process.env.ADMIN_ACTION_SECRET = "test-secret-abcdefghijklmnopqrstuvwxyz-123456";
  });

  it("sha256 vettore noto", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("randomHex ha lunghezza corretta ed è unico", () => {
    const a = randomHex(32);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(randomHex(32)).not.toBe(a);
  });

  it("timingSafeEqualHex", () => {
    expect(timingSafeEqualHex("ab12", "ab12")).toBe(true);
    expect(timingSafeEqualHex("ab12", "ab13")).toBe(false);
    expect(timingSafeEqualHex("ab12", "ab123")).toBe(false);
  });

  it("base32 roundtrip", () => {
    const bytes = new Uint8Array([1, 2, 3, 250, 0, 255]);
    expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
  });

  it("TOTP vettore RFC 6238 (SHA-1, t=59 → 287082)", async () => {
    // segreto ASCII "12345678901234567890"
    const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    expect(await totpVerify(secret, "287082", 59_000)).toBe(true);
    expect(await totpVerify(secret, "000000", 59_000)).toBe(false);
  });

  it("password PBKDF2 roundtrip", async () => {
    const stored = await hashPassword("password-sicura-123");
    expect(await verifyPassword("password-sicura-123", stored)).toBe(true);
    expect(await verifyPassword("sbagliata", stored)).toBe(false);
  }, 15000);

  it("canonical JSON identico tra Node e Convex", () => {
    const v = { z: 1, a: { d: [3, 2], b: "x", c: null }, m: undefined as unknown };
    expect(canonicalJson(v)).toBe(nodeCanonical(v));
    expect(canonicalJson(v)).toBe('{"a":{"b":"x","c":null,"d":[3,2]},"z":1}');
  });

  it("firma HMAC valida incrociata, manomissioni rifiutate", async () => {
    const params = { email: "a@b.cd" };
    const auth = signServerAction("auth.login", params, Date.now() + 60_000);
    await requireServerAuth(params, auth, "auth.login");
    expect(verifyServerActionLocal("auth.login", params, auth)).toBe(true);
    // params alterati → rifiuto
    await expect(requireServerAuth({ email: "x@y.zz" }, auth, "auth.login")).rejects.toThrow();
    // action diversa → rifiuto
    await expect(requireServerAuth(params, auth, "auth.other")).rejects.toThrow();
    // scaduta → rifiuto
    const expired = signServerAction("auth.login", params, Date.now() - 1000);
    await expect(requireServerAuth(params, expired, "auth.login")).rejects.toThrow();
  });
});
