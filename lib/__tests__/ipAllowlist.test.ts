import { describe, expect, it } from "vitest";
import { ipv4ToInt, matchesEntry, parseAllowlist, isIpAllowed } from "../ipAllowlist";

describe("ipAllowlist", () => {
  it("converte IPv4 e rifiuta invalidi", () => {
    expect(ipv4ToInt("1.2.3.4")).toBe((1 * 256 + 2) * 256 * 256 + 3 * 256 + 4);
    expect(ipv4ToInt("999.1.1.1")).toBeNull();
    expect(ipv4ToInt("::1")).toBeNull();
    expect(ipv4ToInt("1.2.3")).toBeNull();
  });

  it("match singolo IP e CIDR", () => {
    expect(matchesEntry("203.0.113.8", "203.0.113.8")).toBe(true);
    expect(matchesEntry("203.0.113.9", "203.0.113.8")).toBe(false);
    expect(matchesEntry("93.184.216.34", "93.184.216.0/24")).toBe(true);
    expect(matchesEntry("93.184.217.1", "93.184.216.0/24")).toBe(false);
    expect(matchesEntry("10.0.0.1", "10.0.0.1/32")).toBe(true);
    expect(matchesEntry("1.2.3.4", "0.0.0.0/0")).toBe(true);
  });

  it("allowlist vuota = nessun filtro; voci malformate ignorate", () => {
    expect(isIpAllowed("1.2.3.4", [])).toBe(true);
    const list = parseAllowlist(" 203.0.113.8 ,, non-un-ip, 10.0.0.0/8 ");
    expect(isIpAllowed("203.0.113.8", list)).toBe(true);
    expect(isIpAllowed("10.5.6.7", list)).toBe(true);
    expect(isIpAllowed("11.0.0.1", list)).toBe(false);
  });
});
