import { describe, expect, it } from "vitest";
import {
  sanitizeText,
  sanitizeMultiline,
  sanitizeEmail,
  sanitizeSlug,
  sanitizeHttpsUrl,
  sanitizeFilePath,
  STRIPE_LINK_HOSTS,
} from "../sanitize";

describe("sanitize", () => {
  it("rimuove null-byte e control-char e collassa spazi", () => {
    expect(sanitizeText("  Ciao   mondo  ", 100)).toBe("Ciao mondo");
    expect(sanitizeText("a\u0000\u0001b", 10)).toBe("ab");
  });

  it("tronca alla lunghezza massima", () => {
    expect(sanitizeText("abcdef", 3)).toBe("abc");
  });

  it("normalizza email", () => {
    expect(sanitizeEmail("  Mario@Esempio.IT  ")).toBe("mario@esempio.it");
  });

  it("preserva gli a-capo nel multilinea (max 2)", () => {
    expect(sanitizeMultiline("a\n\n\n\nb", 100)).toBe("a\n\nb");
  });

  it("accetta solo slug sicuri", () => {
    expect(sanitizeSlug("Give a Start!")).toBe("give-a-start");
  });

  it("accetta solo URL https con host in allowlist", () => {
    expect(sanitizeHttpsUrl("https://buy.stripe.com/test_123", STRIPE_LINK_HOSTS)).toContain("buy.stripe.com");
    expect(sanitizeHttpsUrl("http://buy.stripe.com/x", STRIPE_LINK_HOSTS)).toBe("");
    expect(sanitizeHttpsUrl("https://evil.com/x", STRIPE_LINK_HOSTS)).toBe("");
    expect(sanitizeHttpsUrl("javascript:alert(1)", STRIPE_LINK_HOSTS)).toBe("");
  });

  it("rifiuta path traversal e assoluti", () => {
    expect(sanitizeFilePath("../../etc/passwd")).toBe("");
    expect(sanitizeFilePath("/assoluto/x.wav")).toBe("");
    expect(sanitizeFilePath("BEATS/beat ok.wav")).toBe("BEATS/beat ok.wav");
  });
});
