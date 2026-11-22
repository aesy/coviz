import type { SourceEntry, TreeNode } from "../lib/coverage";
import { bucket, fmt, fmtHits, fmtPct, pct } from "../lib/format";
import styles from "./FileView.module.css";

export function FileView({
  node,
  source,
  hasMcdc,
}: {
  node: TreeNode;
  source: SourceEntry | undefined;
  hasMcdc: boolean;
}) {
  const c = node.counts;
  const chips: [string, number, number][] = [
    ["lines", c.lh, c.lf],
    ["functions", c.fh, c.ff],
    ["branches", c.bh, c.bf],
  ];

  if (hasMcdc) {
    chips.push(["MC/DC", c.mh, c.mf]);
  }

  return (
    <section class={`${styles.panel} rise`}>
      <div class={styles.fileHead}>
        <span class={styles.fname}>{node.name}</span>
        {chips.map(([label, hit, found]) => {
          const p = pct(hit, found);

          return (
            <span key={label} class={styles.chip}>
              <span class={`dot b-${bucket(p)}`} />
              {fmtPct(p)} {label} ({fmt(hit)}/{fmt(found)})
            </span>
          );
        })}
      </div>
      {source?.text ? (
        <Code source={source} />
      ) : (
        <div class={styles.nosource}>
          Source file could not be read at report generation time - only summary data is
          available.
        </div>
      )}
    </section>
  );
}

function Code({ source }: { source: SourceEntry }) {
  const hits = new Map(source.lines);
  const lines = (source.text ?? "").split("\n");

  if (lines.length && lines[lines.length - 1] === "") {
    lines.pop();
  }

  const gutter = Math.max(String(lines.length).length, 3) * 8 + 20;

  return (
    <div class={styles.codewrap}>
      <div class={styles.code} style={`--lnw:${gutter}px`}>
        {lines.map((text, i) => {
          const lineNo = i + 1;
          const count = hits.get(lineNo);
          const state = count === undefined ? "" : count > 0 ? ` ${styles.hit}` : ` ${styles.miss}`;

          return (
            <div key={lineNo} class={`${styles.crow}${state}`}>
              <div class={styles.ln}>{lineNo}</div>
              <div class={styles.hits}>{count === undefined ? "" : fmtHits(count)}</div>
              <pre>{text}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
