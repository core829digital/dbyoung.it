/**
 * Allowlist IP da configurazione (ADMIN_IP_ALLOWLIST, voci separate da virgola).
 * Supporta IPv4 singoli e CIDR (es. "203.0.113.8, 93.184.216.0/24").
 * Pure functions: funzionano in Edge middleware, Node e test.
 */

/** Converte IPv4 in intero a 32 bit. Ritorna null se non è un IPv4 valido. */
export function ipv4ToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const b = Number(p);
    if (b < 0 || b > 255) return null;
    n = n * 256 + b;
  }
  return n;
}

/** Verifica se un IP rientra in una voce allowlist (IP singolo o CIDR). */
export function matchesEntry(ip: string, entry: string): boolean {
  const ipNum = ipv4ToInt(ip);
  if (ipNum === null) return false;
  const e = entry.trim();
  if (!e) return false;
  if (!e.includes("/")) return ipv4ToInt(e) === ipNum;
  const [base, bitsStr] = e.split("/");
  const baseNum = ipv4ToInt(base);
  const bits = Number(bitsStr);
  if (baseNum === null || !Number.isInteger(bits) || bits < 0 || bits > 32) return false;
  if (bits === 0) return true;
  const mask = (0xffffffff >>> (32 - bits)) * 2 ** (32 - bits) % 2 ** 32;
  // Confronto senza overflow a 32 bit:
  const shift = 32 - bits;
  return Math.floor(ipNum / 2 ** shift) === Math.floor(baseNum / 2 ** shift);
}

/** Parsa la env in voci valide (ignora voci malformate). */
export function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && (ipv4ToInt(s) !== null || /^.+\/\d{1,2}$/.test(s)));
}

/** true se l'IP è consentito. Allowlist vuota = nessun filtro (fail-open documentato). */
export function isIpAllowed(ip: string, allowlist: string[]): boolean {
  if (allowlist.length === 0) return true;
  return allowlist.some((entry) => matchesEntry(ip, entry));
}

/**
 * Estrae l'IP client dagli header.
 * NOTA: dietro proxy/CDN il primo elemento di x-forwarded-for è dichiarato dal
 * client a monte — fidarsi solo se la piattaforma lo garantisce (es. header
 * proprietari). Per questo l'allowlist è difesa-in-profondità, mai unico controllo.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() ?? "unknown";
}
