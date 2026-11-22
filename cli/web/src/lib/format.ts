export type Bucket = "good" | "warn" | "serious" | "critical" | "none";

/** Coverage percentage, floored to one decimal and never rounded up to 100. */
export function pct(hit: number, found: number): number | null {
  if (!found) {
    return null;
  }

  if (hit >= found) {
    return 100;
  }

  return Math.min(Math.floor((hit / found) * 1000) / 10, 99.9);
}

export function bucket(p: number | null): Bucket {
  if (p === null) {
    return "none";
  }

  if (p >= 90) {
    return "good";
  }

  if (p >= 75) {
    return "warn";
  }

  if (p >= 50) {
    return "serious";
  }

  return "critical";
}

export const fmt = (n: number): string => n.toLocaleString("en-US");

export const fmtPct = (p: number | null): string => (p === null ? "–" : p.toFixed(1) + "%");

export function fmtHits(n: number): string {
  if (n >= 1e6) {
    return (n / 1e6).toFixed(1) + "M";
  }

  if (n >= 1e4) {
    return Math.round(n / 1e3) + "K";
  }

  return String(n);
}

export function href(path: string): string {
  return "#/" + path.split("/").map(encodeURIComponent).join("/");
}

export function pathFromHash(hash: string): string {
  const stripped = hash.replace(/^#\/?/, "");

  if (!stripped) {
    return "";
  }

  return stripped.split("/").map(decodeURIComponent).join("/");
}
