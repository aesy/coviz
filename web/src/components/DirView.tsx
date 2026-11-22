import type { TreeNode } from "../lib/coverage";
import { Row } from "./Row";
import styles from "./Tree.module.css";

interface Props {
  node: TreeNode;
  collapsed: Set<string>;
  hasMcdc: boolean;
  onToggle: (path: string) => void;
}

export function DirView({ node, collapsed, hasMcdc, onToggle }: Props) {
  const rows: { node: TreeNode; depth: number }[] = [];
  const walk = (parent: TreeNode, depth: number) => {
    for (const child of parent.children) {
      rows.push({ node: child, depth });

      if (child.dir && !collapsed.has(child.path)) {
        walk(child, depth + 1);
      }
    }
  };

  walk(node, 0);

  const columns = ["Name", "Lines", "Functions", "Branches"];

  if (hasMcdc) {
    columns.push("MC/DC");
  }

  return (
    <section class={`${styles.panel}${hasMcdc ? " " + styles.hasMcdc : ""} rise`}>
      <div class={styles.gridHead}>
        {columns.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      {rows.map(({ node: child, depth }) => (
        <Row
          key={child.path}
          node={child}
          depth={depth}
          collapsed={collapsed}
          hasMcdc={hasMcdc}
          onToggle={onToggle}
        />
      ))}
    </section>
  );
}
