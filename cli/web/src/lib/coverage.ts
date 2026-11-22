export interface Counts {
  lf: number;
  lh: number;
  ff: number;
  fh: number;
  bf: number;
  bh: number;
  mf: number;
  mh: number;
}

export interface TreeNode {
  name: string;
  path: string;
  dir: boolean;
  counts: Counts;
  children: TreeNode[];
  parent?: TreeNode;
}

export interface SourceEntry {
  text?: string;
  lines: [number, number][];
}

export interface Report {
  title: string;
  input: string;
  generatedMs: number;
  root: TreeNode;
  sources: Record<string, SourceEntry>;
}

/** Link every node to its parent and index the tree by path. */
export function indexTree(root: TreeNode): Map<string, TreeNode> {
  const byPath = new Map<string, TreeNode>();
  const walk = (node: TreeNode, parent?: TreeNode) => {
    node.parent = parent;

    byPath.set(node.path, node);

    for (const child of node.children ?? []) {
      walk(child, node);
    }
  };

  walk(root, undefined);

  return byPath;
}

export function hasMcdc(root: TreeNode): boolean {
  return (root.counts.mf || 0) > 0;
}

export function fileCount(node: TreeNode): number {
  if (!node.dir) {
    return 1;
  }

  return node.children.reduce((total, child) => total + fileCount(child), 0);
}
