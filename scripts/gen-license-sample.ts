/**
 * Utility: genera un PDF di esempio del certificato licenza.
 * Uso: npx --yes tsx scripts/gen-license-sample.ts
 */
import { writeFileSync } from "node:fs";
import { buildLicensePdf } from "../lib/licensePdf";

async function main() {
  const pdf = await buildLicensePdf({
    email: "cliente@example.com",
    orderId: "cs_live_ESEMPIO123",
    date: new Date(),
    items: [
      { title: "Give a Start (prod. D.B Young)", code: "DBY-ABCD-2345" },
      { title: "Bundle completo Sample Packs", code: "DBY-WXYZ-6789" },
    ],
  });
  const out = `${process.env.TEMP ?? "."}/DBYoung-licenza-sample.pdf`;
  writeFileSync(out, pdf);
  console.log(`PDF ${pdf.byteLength} bytes → ${out}`);
}

void main();

