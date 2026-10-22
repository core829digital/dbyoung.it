/**
 * Rigenera le anteprime public/audio/previews così che ogni click riproduca
 * subito audio udibile:
 *  - sample pack → decodifica i WAV sorgente reali (mix degli stems);
 *    se il mix è muto/es.Opera (stems in cancellazione di fase), usa lo stem
 *    con più energia;
 *  - beats/colonne sonore → decodifica l'anteprima MP3 esistente;
 *  - salta il silenzio iniziale (finestra RMS 0,5 s), parte ~1 s prima del
 *    momento più sonoro, durata 30 s;
 *  - normalizza a ~-20 dBFS RMS con cap peak a -1 dBFS;
 *  - fade in 0,5 s / fade out 3 s;
 *  - codifica MP3 stereo 96 kbps con @breezystack/lamejs (pure JS, niente ffmpeg).
 *
 * Sostituisce i file in place; salva un backup in scripts/_previews-backup
 * (gitignored). Uso: npx --yes tsx scripts/fix-previews.mts [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { MPEGDecoder } from "mpg123-decoder";
import { Mp3Encoder } from "@breezystack/lamejs";

const DRY = process.argv.includes("--dry");
const PREVIEW_DIR = path.join(process.cwd(), "public", "audio", "previews");
const AUDIO_ROOT = "AUDIO-UPLOADS-BEATS-SAMPLEPACKS-COLONNESONORE";
const PACKS_DIR = path.join(process.cwd(), "private_audio", AUDIO_ROOT, "SAMPLE PACKS");

const PACK_DIRS: Record<string, string> = {
  "pack-velvet-tape": "_Velvet & Tape Neo-Soul & Chillhop Melodies_ 110 BPM E minor",
  "pack-melancholic": "Melancholic Neo-Soul Piano with Ambient Soundscape_ 101 BPM Ab Major",
  "pack-opera": "Opera Cinematic_Orchestral Trap  G Minor 73 BPM",
  "pack-nostalgia": "Velvet Nostalgia \u2013 Cinematic_emotional 100 BPM Dminor",
};

const TARGET_P90 = 20 ** (-16 / 20); // p90 loudness target: -16 dBFS
const WIN_S = 0.5;

interface Audio { channels: Float32Array[]; sampleRate: number }

function rmsRange(ch: Float32Array, s: number, e: number): number {
  let sum = 0, n = 0;
  for (let i = s; i < e; i++) { sum += ch[i] * ch[i]; n++; }
  return n ? Math.sqrt(sum / n) : 0;
}

const dbfs = (v: number) => (v > 0 ? (20 * Math.log10(v)).toFixed(1) : "-Inf");

/** Mix mono (media dei canali) per l'analisi. */
function monoMix(a: Audio): Float32Array {
  const n = a.channels[0].length;
  if (a.channels.length === 1) return a.channels[0];
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (const c of a.channels) s += c[i];
    m[i] = s / a.channels.length;
  }
  return m;
}

/** Finestra più sonora che lascia spazio a `want` secondi dall'inizio scelto. */
function loudestWindowStart(mono: Float32Array, sr: number, want = 30): number {
  const win = Math.floor(sr * WIN_S);
  const maxStart = Math.max(0, mono.length - Math.floor(sr * want));
  let best = 0, bestRms = 0;
  for (let s = 0; s <= maxStart; s += win) {
    const r = rmsRange(mono, s, s + win);
    if (r > bestRms) { bestRms = r; best = s; }
  }
  return best;
}

/** Chunk più denso di contenuto: massimizza la media delle finestre RMS su `want` secondi. */
function densestChunkStart(mono: Float32Array, sr: number, wantSec = 30): number {
  const win = Math.floor(sr * WIN_S);
  const want = Math.floor(sr * Math.min(wantSec, mono.length / sr));
  const maxStart = Math.max(0, mono.length - want);
  let best = 0, bestMean = 0;
  for (let s = 0; s <= maxStart; s += win) {
    let sum = 0, cnt = 0;
    for (let w = s; w + win <= s + want; w += win) { sum += rmsRange(mono, w, w + win); cnt++; }
    const mean = cnt ? sum / cnt : 0;
    if (mean > bestMean) { bestMean = mean; best = s; }
  }
  return best;
}

/** Media delle finestre RMS su un intervallo (proxy di quanto audio si sente in media). */
function meanRmsSpan(mono: Float32Array, sr: number, s: number, e: number): number {
  const win = Math.floor(sr * WIN_S);
  let sum = 0, cnt = 0;
  for (let w = s; w + win <= e; w += win) { sum += rmsRange(mono, w, w + win); cnt++; }
  return cnt ? sum / cnt : 0;
}

/** Primo/ultimo punto udibile (soglia relativa al picco). */
function audibleBounds(mono: Float32Array, sr: number): { start: number; end: number } {
  const win = Math.floor(sr * WIN_S);
  const blocks: Array<{ s: number; r: number }> = [];
  for (let s = 0; s + win <= mono.length; s += win) blocks.push({ s, r: rmsRange(mono, s, s + win) });
  const peak = Math.max(...blocks.map((b) => b.r));
  const thr = Math.max(peak * 0.08, 1e-5);
  const first = blocks.find((b) => b.r >= thr) ?? blocks[0];
  const last = [...blocks].reverse().find((b) => b.r >= thr) ?? blocks[blocks.length - 1];
  return { start: first.s, end: Math.min(mono.length, last.s + win) };
}

function normalizeAndFade(a: Audio, from: number, to: number): Audio {
  const out: Float32Array[] = a.channels.map((c) => c.slice(from, to));
  const n = out[0].length;
  // Loudness: p90 delle finestre RMS 0,5 s (approssima la perceived loudness)
  const win = Math.floor(a.sampleRate * WIN_S);
  const winRms: number[] = [];
  for (let s = 0; s + win <= n; s += win) winRms.push(rmsRange(out[0], s, s + win));
  winRms.sort((x, y) => y - x);
  const p90 = winRms[Math.max(0, Math.floor(winRms.length * 0.1))] ?? 0; // ~90° percentile dal top
  let peak = 0;
  for (const ch of out) for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(ch[i]));
  let gain = p90 > 0 ? Math.min(TARGET_P90 / p90, 0.95 / Math.max(peak, 1e-9)) : 1;
  const sr = a.sampleRate;
  const fadeIn = Math.floor(sr * 0.5);
  const fadeOut = Math.min(Math.floor(sr * 3), Math.floor(n / 4));
  for (const ch of out) {
    for (let i = 0; i < n; i++) {
      let g = gain;
      if (i < fadeIn) g *= i / fadeIn;
      if (i > n - fadeOut) g *= Math.max(0, (n - i) / fadeOut);
      ch[i] = Math.max(-0.95, Math.min(0.95, ch[i] * g));
    }
  }
  return { channels: out, sampleRate: a.sampleRate };
}

/** Decodifica MP3 (WASM). */
async function decodeMp3(file: string): Promise<Audio> {
  const dec = new MPEGDecoder();
  await dec.ready;
  const { channelData, sampleRate } = dec.decode(new Uint8Array(readFileSync(file))) as unknown as {
    channelData: Float32Array[]; sampleRate: number;
  };
  dec.free();
  return { channels: channelData, sampleRate };
}

/** Lettura WAV PCM 16-bit (stereo/mono) con walker di chunk. */
function readWav(file: string): Audio {
  const buf = readFileSync(file);
  let pos = 12;
  let data!: Buffer;
  let bits = 16, ch = 2, sr = 44100, fmtCode = 1;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4);
    const size = buf.readUInt32LE(pos + 4);
    const body = pos + 8;
    if (id === "fmt ") {
      ch = buf.readUInt16LE(body + 2);
      sr = buf.readUInt32LE(body + 4);
      bits = buf.readUInt16LE(body + 14);
      fmtCode = buf.readUInt16LE(body); // 0xFFFE = EXTENSIBLE: leggi il SubFormat
      if (fmtCode === 0xfffe && size >= 40) fmtCode = buf.readUInt16LE(body + 24 + 4 + 2);
    }
    if (id === "data") { data = buf.subarray(body, Math.min(buf.length, body + size)); break; }
    pos = body + size + (size % 2);
  }
  if (!data) throw new Error(`dati WAV mancanti: ${file}`);
  const bytesPer = bits / 8;
  const frameBytes = ch * bytesPer;
  const frames = Math.floor(data.length / frameBytes) - 1; // margine per evitare overrun sull'ultimo frame
  const scale = bits === 16 ? 32768 : bits === 24 ? 8388608 : 2147483648;
  const isFloat = bits === 32 && fmtCode === 3;
  const channels: Float32Array[] = [];
  for (let c = 0; c < ch; c++) {
    const arr = new Float32Array(frames);
    for (let i = 0; i < frames; i++) {
      const off = (i * ch + c) * bytesPer;
      if (isFloat) arr[i] = data.readFloatLE(off);
      else if (bits === 16) arr[i] = data.readInt16LE(off) / scale;
      else if (bits === 24) arr[i] = data.readIntLE(off, 3) / scale;
      else arr[i] = data.readInt32LE(off) / scale;
    }
    channels.push(arr);
  }
  return { channels, sampleRate: sr };
}

/** Encode MP3 stereo 96 kbps. */
function encodeMp3(a: Audio, kbps = 96): Buffer {
  const chCount = a.channels.length;
  const enc = new Mp3Encoder(chCount, a.sampleRate, kbps);
  const left = a.channels[0];
  const right = chCount > 1 ? a.channels[1] : left;
  const BLOCK = 1152;
  const parts: Uint8Array[] = [];
  const l16 = new Int16Array(BLOCK);
  const r16 = new Int16Array(BLOCK);
  for (let s = 0; s < left.length; s += BLOCK) {
    const n = Math.min(BLOCK, left.length - s);
    for (let i = 0; i < n; i++) {
      l16[i] = Math.max(-32767, Math.min(32767, Math.round(left[s + i] * 32767))) | 0;
      r16[i] = Math.max(-32767, Math.min(32767, Math.round(right[s + i] * 32767))) | 0;
    }
    const out = enc.encodeBuffer(l16.subarray(0, n), r16.subarray(0, n));
    if (out.length) parts.push(new Uint8Array(out));
  }
  const flush = enc.flush();
  if (flush.length) parts.push(new Uint8Array(flush));
  return Buffer.concat(parts);
}

const BACKUP_DIR = path.join(process.cwd(), "scripts", "_previews-backup");
mkdirSync(BACKUP_DIR, { recursive: true });
const backupOnce = (name: string, content: Buffer) => {
  const dest = path.join(BACKUP_DIR, name);
  if (!existsSync(dest)) writeFileSync(dest, content); // solo al primo run: preserva gli originali
};

const results: string[] = [];

for (const [key, dirName] of Object.entries(PACK_DIRS)) {
  const outFile = path.join(PREVIEW_DIR, `${key}.mp3`);
  backupOnce(`${key}.mp3`, readFileSync(outFile));

  // Sorgenti WAV del pack (skip junk)
  const srcDir = path.join(PACKS_DIR, dirName);
  const wavs = readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith(".wav"));
  if (wavs.length === 0) throw new Error(`Nessun WAV sorgente per ${key}`);

  // Candidati per ogni pack: stems (chunk denso da 30 s) + anteprima originale (dal backup).
  interface Candidate { from: number; to: number; mean: number; label: string; audio: Audio }
  const candidates: Candidate[] = [];
  for (const f of wavs) {
    const wav = readWav(path.join(srcDir, f));
    const m = monoMix(wav);
    const s0 = densestChunkStart(m, wav.sampleRate, 30);
    const from = Math.max(0, s0 - Math.floor(wav.sampleRate * 1)); // 1 s di pre-roll
    const to = Math.min(wav.channels[0].length, from + Math.floor(wav.sampleRate * 30));
    const mean = meanRmsSpan(m, wav.sampleRate, from, to);
    candidates.push({ from, to, mean, label: `stem "${f}"`, audio: wav });
  }
  const origFile = existsSync(path.join(process.cwd(), "scripts", "_previews-orig", `${key}.mp3`))
    ? path.join(process.cwd(), "scripts", "_previews-orig", `${key}.mp3`) // originali veri ripristinati da git
    : path.join(BACKUP_DIR, `${key}.mp3`);
  if (existsSync(origFile)) {
    const a = await decodeMp3(origFile);
    const m = monoMix(a);
    const { start, end } = audibleBounds(m, a.sampleRate);
    const mean = meanRmsSpan(m, a.sampleRate, start, end);
    if (mean > 1e-3) candidates.push({ from: start, to: end, mean, label: "preview originale", audio: a });
  }
  candidates.sort((x, y) => y.mean - x.mean || y.to - y.from - (x.to - x.from));
  const best = candidates[0];
  if (!best || best.mean === 0) throw new Error(`Nessun contenuto udibile per ${key}`);

  // Rifinitura: dentro il span scelto taglia ai limiti udibili reali
  const bm = monoMix(best.audio);
  const bsr = best.audio.sampleRate;
  const bFrom = Math.max(0, best.from - Math.floor(bsr * 0.5));
  const bTo = Math.min(bm.length, best.to + Math.floor(bsr * 0.5));
  const inWin = bm.slice(bFrom, bTo);
  const b2 = audibleBounds(inWin, bsr);
  const from = bFrom + b2.start;
  const to = bFrom + Math.min(bm.length - bFrom, Math.max(b2.end, b2.start + Math.floor(bsr * 8))); // min 8 s udibili

  const seg = normalizeAndFade(best.audio, from, to);
  const encoded = DRY ? null : encodeMp3(seg);

  const newRms = monoMix(seg).length ? rmsRange(monoMix(seg), 0, monoMix(seg).length) : 0;
  if (encoded) writeFileSync(outFile, encoded);
  results.push(`${key}.mp3  ← ${best.label}  from ${(from / bsr).toFixed(1)}s dur ${((to - from) / bsr).toFixed(1)}s  RMS ${dbfs(best.mean)} → ${dbfs(newRms)}`);
}

// Beats e colonne sonore: parte dall'anteprima MP3 esistente (norm + trim silenzio iniziale).
for (const f of ["birds.mp3", "give-a-start.mp3", "sacred-voices.mp3", "tempo-fugit.mp3", "water.mp3"]) {
  const file = path.join(PREVIEW_DIR, f);
  backupOnce(f, readFileSync(file));
  const a = await decodeMp3(file);
  const m = monoMix(a);
  const { start: firstAud, end: lastAud } = audibleBounds(m, a.sampleRate);
  const start = firstAud > Math.floor(a.sampleRate * 1.2) ? firstAud - Math.floor(a.sampleRate * 0.8) : 0;
  const end = Math.min(a.channels[0].length, Math.max(lastAud + Math.floor(a.sampleRate * 1.5), Math.floor(a.sampleRate * 30)));
  const seg = normalizeAndFade(a, start, end);
  const encoded = DRY ? null : encodeMp3(seg, 96);
  const newRms = rmsRange(monoMix(seg), 0, monoMix(seg).length);
  if (encoded) writeFileSync(file, encoded);
  results.push(`${f.padEnd(18)} trim start ${(start / a.sampleRate).toFixed(1)}s dur ${((end - start) / a.sampleRate).toFixed(1)}s  RMS → ${dbfs(newRms)}`);
}

console.log(results.join("\n"));
console.log(`\nBackup originali in scripts/_previews-backup (SOLO locale, non committare)`);
