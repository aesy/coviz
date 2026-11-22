import type { TreeNode } from "../lib/coverage";
import { fmt, fmtPct, href, pct } from "../lib/format";
import { Meter } from "./Meter";
import { StatPair } from "./StatPair";
import styles from "./Tree.module.css";

interface Props {
  node: TreeNode;
  depth: number;
  collapsed: Set<string>;
  hasMcdc: boolean;
  onToggle: (path: string) => void;
}

export function Row({ node, depth, collapsed, hasMcdc, onToggle }: Props) {
  const c = node.counts;
  const p = pct(c.lh, c.lf);
  const expanded = !collapsed.has(node.path);

  return (
    <div class={styles.gridRow}>
      <div class={styles.cellName} style={{ paddingLeft: 16 + depth * 20 + "px" }}>
        {node.dir ? (
          <>
            <button
              class={styles.twisty}
              aria-expanded={expanded}
              aria-label={`Toggle ${node.name}`}
              onClick={() => onToggle(node.path)}
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path
                  d="M3 1l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <a class={styles.nameDir} href={href(node.path)}>
              {node.name}
              <span class={styles.dirSlash}>/</span>
            </a>
          </>
        ) : (
          <>
            <span class={styles.twistyPad} />
            <a class={styles.nameFile} href={href(node.path)}>
              {node.name}
            </a>
          </>
        )}
      </div>
      <div class={styles.cellLines}>
        <Meter p={p} />
        <span class={`pct${p === null ? " na" : ""}`}>{fmtPct(p)}</span>
        <span class={`counts-inline${c.lf ? "" : " na"}`}>
          {fmt(c.lh)}/{fmt(c.lf)}
        </span>
      </div>
      <div>
        <StatPair hit={c.fh} found={c.ff} label="functions" />
      </div>
      <div>
        <StatPair hit={c.bh} found={c.bf} label="branches" />
      </div>
      {hasMcdc && (
        <div>
          <StatPair hit={c.mh} found={c.mf} label="MC/DC" />
        </div>
      )}
    </div>
  );
}
