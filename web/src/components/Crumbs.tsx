import { Fragment } from "preact";

import type { TreeNode } from "../lib/coverage";
import { href } from "../lib/format";
import styles from "./Crumbs.module.css";

export function Crumbs({ node, title }: { node: TreeNode; title: string }) {
  const chain: TreeNode[] = [];

  for (let n: TreeNode | undefined = node; n; n = n.parent) {
    chain.unshift(n);
  }

  return (
    <nav class={styles.crumbs} aria-label="Breadcrumb">
      {chain.map((n, i) => {
        const label = n.path === "" ? title : n.name;
        const last = i === chain.length - 1;

        return (
          <Fragment key={n.path}>
            {i > 0 && <span class={styles.sep}>/</span>}
            {last ? (
              <span class={styles.here}>{label}</span>
            ) : (
              <a href={href(n.path)}>{label}</a>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
