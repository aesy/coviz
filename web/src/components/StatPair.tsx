import { bucket, fmt, fmtPct, pct } from "../lib/format";

export function StatPair({ hit, found, label }: { hit: number; found: number; label?: string }) {
  const p = pct(hit, found);

  return (
    <div class="cell-stat" aria-label={label}>
      <span class={`dot b-${bucket(p)}`} />
      <span class={`pct${p === null ? " na" : ""}`}>{fmtPct(p)}</span>
      <span class={`counts-inline${found ? "" : " na"}`}>
        {fmt(hit)}/{fmt(found)}
      </span>
    </div>
  );
}
