import type { Counts } from "../lib/coverage";
import { bucket, fmt, pct } from "../lib/format";
import { Meter } from "./Meter";
import styles from "./Tiles.module.css";

export function Tiles({ counts, hasMcdc }: { counts: Counts; hasMcdc: boolean }) {
  const specs: [string, number, number][] = [
    ["Line coverage", counts.lh, counts.lf],
    ["Function coverage", counts.fh, counts.ff],
    ["Branch coverage", counts.bh, counts.bf],
  ];

  if (hasMcdc) {
    specs.push(["MC/DC coverage", counts.mh, counts.mf]);
  }

  return (
    <section class={styles.tiles}>
      {specs.map(([label, hit, found]) => {
        const p = pct(hit, found);

        return (
          <div key={label} class={`${styles.tile} b-${bucket(p)} rise`}>
            <div class={styles.label}>{label}</div>
            <div class={styles.value}>
              {p === null ? "–" : p.toFixed(1)}
              {p !== null && <small> %</small>}
            </div>
            <div class={styles.counts}>
              {fmt(hit)} / {fmt(found)} covered
            </div>
            <Meter p={p} />
          </div>
        );
      })}
    </section>
  );
}
