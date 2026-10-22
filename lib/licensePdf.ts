import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Certificato di licenza PDF allegato all'email di acquisto.
 * SOLO server-side: contiene i dati d'ordine e il testo della licenza.
 */

export interface LicensePdfItem {
  title: string;
  code: string;
}

export interface LicensePdfInput {
  email: string;
  orderId: string;
  date: Date;
  items: LicensePdfItem[];
}

const AUTHOR = "Dimitri Boutourline (D.B Young)";
const BRAND = "DBYoung";

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

export async function buildLicensePdf(input: LicensePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`DBYoung — Licenza ${input.orderId}`);
  doc.setAuthor(AUTHOR);
  doc.setSubject("Licenza d'uso — certificato di acquisto");

  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const margin = 54;
  const fire = rgb(0.95, 0.36, 0.1);
  const dark = rgb(0.12, 0.12, 0.14);
  const muted = rgb(0.38, 0.38, 0.42);
  let y = height - margin;

  page.drawText(BRAND, { x: margin, y, font: bold, size: 22, color: fire });
  y -= 20;
  page.drawText("Certificato di licenza / License Certificate", { x: margin, y, font: bold, size: 12, color: dark });
  y -= 34;

  const rows: Array<[string, string]> = [
    ["Autore / Author", AUTHOR],
    ["Licenziatario / Licensee", input.email],
    ["Ordine / Order", input.orderId],
    ["Data / Date", input.date.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })],
  ];
  for (const [label, value] of rows) {
    page.drawText(label.toUpperCase(), { x: margin, y, font: bold, size: 8, color: muted });
    y -= 13;
    page.drawText(value, { x: margin, y, font, size: 10.5, color: dark });
    y -= 19;
  }

  y -= 8;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.7, color: rgb(0.85, 0.85, 0.88) });
  y -= 26;
  page.drawText("PRODOTTI LICENZIATI / LICENSED PRODUCTS", { x: margin, y, font: bold, size: 9, color: fire });
  y -= 18;
  for (const item of input.items) {
    page.drawText(`• ${item.title}`, { x: margin, y, font: bold, size: 10.5, color: dark });
    y -= 14;
    page.drawText(`  Codice licenza: ${item.code}`, { x: margin, y, font, size: 10, color: muted });
    y -= 20;
  }

  y -= 14;
  page.drawText("CONDIZIONI DI LICENZA / LICENSE TERMS", { x: margin, y, font: bold, size: 9, color: fire });
  y -= 18;

  const terms = [
    "1. Licenza non esclusiva, mondiale e perpetua per utilizzare i file acquistati in produzioni musicali e audiovisive, secondo il piano indicato sull'ordine.",
    "2. Credito obbligatorio: in crediti, descrizioni e metadati va menzionato l'autore \"Dimitri Boutourline (D.B Young)\".",
    "3. È vietata la rivendita, la ridistribuzione o la messa a disposizione dei file originali (beat, melodie, stem) come prodotto autonomo o sample pack.",
    "4. I diritti d'autore e di sfruttamento economico delle composizioni restano di Dimitri Boutourline. L'acquisto non trasferisce la titolarità del copyright.",
    "5. La licenza è valida solo per il codice sopra riportato e per l'ordine indicato; in caso di rimborso o chargeback la licenza si intende revocata.",
    "6. Per licenze esclusive, sync, broadcast o produzioni personalizzate contattare info@dbyoung.it.",
  ];
  for (const t of terms) {
    for (const line of wrap(t, 92)) {
      page.drawText(line, { x: margin, y, font, size: 9.2, color: dark });
      y -= 12.5;
    }
    y -= 5;
  }

  y -= 10;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.7, color: rgb(0.85, 0.85, 0.88) });
  y -= 16;
  page.drawText("Documento generato automaticamente alla conferma del pagamento (webhook Stripe firmato).", {
    x: margin,
    y,
    font,
    size: 8,
    color: muted,
  });
  y -= 11;
  page.drawText(`${BRAND} · dbyoung.it · info@dbyoung.it`, { x: margin, y, font, size: 8, color: muted });

  return doc.save();
}
