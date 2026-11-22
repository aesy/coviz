import { useEffect, useMemo, useState } from "preact/hooks";

import { hasMcdc as computeHasMcdc, indexTree, type Report, type TreeNode } from "../lib/coverage";
import { useHashPath } from "../lib/hooks";
import { BackButton } from "./BackButton";
import { Crumbs } from "./Crumbs";
import { DirView } from "./DirView";
import { FileView } from "./FileView";
import { Masthead } from "./Masthead";
import { Tiles } from "./Tiles";
import styles from "./App.module.css";

const LEGEND: [string, string][] = [
  ["good", "≥ 90%"],
  ["warn", "75–90"],
  ["serious", "50–75"],
  ["critical", "< 50"],
];

export function App({ data }: { data: Report }) {
  const byPath = useMemo(() => indexTree(data.root), [data]);
  const hasMcdc = useMemo(() => computeHasMcdc(data.root), [data]);
  const path = useHashPath();
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const node = byPath.get(path) ?? data.root;

  useEffect(() => {
    const suffix = node.path === "" ? data.title : `${node.name} · ${data.title}`;
    document.title = `${suffix} · coverage`;
  }, [node, data.title]);

  const toggle = (target: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);

      if (next.has(target)) {
        next.delete(target);
      } else {
        next.add(target);
      }

      return next;
    });

  const expandAll = () => setCollapsed(new Set());

  const collapseAll = () => {
    const next = new Set<string>();
    const walk = (parent: TreeNode) => {
      for (const child of parent.children) {
        if (child.dir) {
          next.add(child.path);

          walk(child);
        }
      }
    };

    walk(node);

    setCollapsed(next);
  };

  const showBack = node.parent != null;
  const showToolbar = node.dir || showBack;

  return (
    <div class={styles.shell}>
      <Masthead data={data} />
      <Crumbs node={node} title={data.title} />
      <Tiles counts={node.counts} hasMcdc={hasMcdc} />
      {showToolbar && (
        <div class={styles.toolbar}>
          <div class="controls">
            {showBack && <BackButton />}
            {node.dir && (
              <>
                <button class="btn" onClick={expandAll}>
                  Expand all
                </button>
                <button class="btn" onClick={collapseAll}>
                  Collapse all
                </button>
              </>
            )}
          </div>
          {node.dir && (
            <div class={styles.legend}>
              {LEGEND.map(([b, label]) => (
                <span key={b} class={styles.key}>
                  <span class={`dot b-${b}`} />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {node.dir ? (
        <DirView node={node} collapsed={collapsed} hasMcdc={hasMcdc} onToggle={toggle} />
      ) : (
        <FileView node={node} source={data.sources[node.path]} hasMcdc={hasMcdc} />
      )}
    </div>
  );
}
