import { describe, expect, it } from "vitest";
import { buildLicensePdf } from "../licensePdf";

describe("buildLicensePdf", () => {
  it("genera un PDF valido con i dati d'ordine", async () => {
    const pdf = await buildLicensePdf({
      email: "cliente@example.com",
      orderId: "cs_live_TEST123",
      date: new Date("2026-10-20T12:00:00Z"),
      items: [{ title: "Give a Start (prod. D.B Young)", code: "DBY-ABCD-2345" }],
    });
    expect(pdf.byteLength).toBeGreaterThan(1000);
    // Header PDF
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
  });
});
