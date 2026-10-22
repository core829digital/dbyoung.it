/**
 * Analisi anteprime public/audio/previews: decode MP3 (WASM), RMS per finestre,
 * durata silenzio iniziale/finale e livello medio. Nessuna modifica ai file.
 * Uso: npx --yes tsx scripts/analyze-previews.mts
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { MPEGDecoder } from "mpg123-decoder";

const dir = path.join(process.cwd(), "public", "audio", "previews");
const files = (await import("node:fs")).readdirSync(dir).filter(f => f.endsWith(".mp3"));
const coder = new MPEGDecoder();
await coder.ready;

function rmsMono(ch: Float32Array, start: number, end: number): number {
  let s = 0, n = 0;
  for (let i = start; i < end; i++) { s += ch[i] * ch[i]; n++; }
  return n ? Math.sqrt(s / n) : 0;
}
const db = (v: number) => (v > 0 ? (20 * Math.log10(v)).toFixed(1) + " dBFS" : "-Inf");

for (const file of files) {
  const { channelData, sampleRate, samplesDecoded } = coder.decode(new Uint8Array(readFileSync(path.join(dir, file)))) as unknown as {
    channelData: Float32Array[]; sampleRate: number; samplesDecoded: number;
  };
  if (!samplesDecoded) { console.log(`${file}: DECODE VUOTO`); continue; }
  const mono = channelData[0];
  const dur = samplesDecoded / sampleRate;
  const win = Math.round(sampleRate * 0.25);
  const blocks: number[] = [];
  for (let i = 0; i + win <= mono.length; i += win) blocks.push(rmsMono(mono, i, i + win));
  const max = Math.max(...blocks);
  const silent = (r: number) => r < Math.max(max * 0.06, 1e-5);
  let lead = 0;
  while (lead < blocks.length && silent(blocks[lead])) lead++;
  let tail = 0;
  while (tail < blocks.length && silent(blocks[blocks.length - 1 - tail])) tail++;
  const overall = rmsMono(mono, 0, mono.length);
  console.log(
    `${file.padEnd(24)} dur=${dur.toFixed(1)}s  startSil=${(lead * 0.25).toFixed(1)}s  tailSil=${(tail * 0.25).toFixed(1)}s  peakWin=${db(max)}  overallRMS=${db(overall)}`
  );
}
coder.free();
