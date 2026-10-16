import { describe, expect, it } from "vitest";
import {
  contactSchema,
  bookingSchema,
  newsletterSchema,
  licenseCodeSchema,
  checkoutSchema,
  registerSchema,
} from "../validation";

const captcha = "test-token";

describe("validation", () => {
  it("contact valido passa, XSS resta testo (sanitizzazione a parte)", () => {
    const r = contactSchema.safeParse({
      name: "Mario",
      email: "mario@esempio.it",
      subject: "Ciao",
      message: "<script>alert(1)</script> ciao",
      turnstile: captcha,
    });
    expect(r.success).toBe(true);
  });

  it("contact rifiuta email e messaggi corti", () => {
    expect(contactSchema.safeParse({ name: "M", email: "no", message: "x", turnstile: captcha }).success).toBe(false);
    expect(contactSchema.safeParse({ name: "Mario", email: "m@e.it", message: "ok", turnstile: "" }).success).toBe(false);
  });

  it("booking rifiuta date passate e formati errati", () => {
    const base = { name: "Mario", email: "m@e.it", city: "", message: "festa lunga", turnstile: captcha };
    expect(bookingSchema.safeParse({ ...base, date: "2000-01-01" }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, date: "32-13-99" }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, date: "2099-06-15" }).success).toBe(true);
  });

  it("newsletter accetta solo email vere", () => {
    expect(newsletterSchema.safeParse({ email: "a@b.cd", turnstile: captcha }).success).toBe(true);
    expect(newsletterSchema.safeParse({ email: "non-email", turnstile: captcha }).success).toBe(false);
  });

  it("codice licenza in formato strict", () => {
    expect(licenseCodeSchema.safeParse("dby-ab12-cd34").success).toBe(true);
    expect(licenseCodeSchema.safeParse("DBY-XXXX").success).toBe(false);
    expect(licenseCodeSchema.safeParse("../../x").success).toBe(false);
  });

  it("checkout richiede termini accettati e carrello non vuoto", () => {
    const item = { slug: "give-a-start", tier: "base" as const };
    expect(
      checkoutSchema.safeParse({ email: "a@b.cd", items: [item], acceptTerms: true, turnstile: captcha }).success
    ).toBe(true);
    expect(
      checkoutSchema.safeParse({ email: "a@b.cd", items: [], acceptTerms: true, turnstile: captcha }).success
    ).toBe(false);
    expect(
      checkoutSchema.safeParse({ email: "a@b.cd", items: [item], turnstile: captcha }).success
    ).toBe(false);
  });

  it("register richiede password di 12+ caratteri", () => {
    expect(registerSchema.safeParse({ email: "a@b.cd", password: "corta123", turnstile: captcha }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.cd", password: "corretta-lunga-123", turnstile: captcha }).success).toBe(true);
  });
});
