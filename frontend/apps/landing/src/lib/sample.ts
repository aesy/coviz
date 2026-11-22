import type { Counts } from '@/lib/coverage';

type SampleNode = { name: string; counts: Counts; children?: SampleNode[] };

export type TreeRow = {
  name: string;
  path: string;
  depth: number;
  dir: boolean;
  ancestors: string[];
  counts: Counts;
};

export type CodeLine = { no: number; text: string; hits: number | null };

const c = (lh: number, lf: number, fh: number, ff: number, bh: number, bf: number): Counts => ({
  lh,
  lf,
  fh,
  ff,
  bh,
  bf,
});

const file = (name: string, counts: Counts): SampleNode => ({ name, counts });

/** Coviz's own source tree with made-up numbers, shown as an example report. */
const SAMPLE: SampleNode = {
  name: 'coviz',
  counts: c(1742, 1904, 188, 201, 402, 497),
  children: [
    {
      name: 'src',
      counts: c(1742, 1904, 188, 201, 402, 497),
      children: [
        {
          name: 'cli',
          counts: c(51, 58, 6, 7, 9, 14),
          children: [file('mod.rs', c(51, 58, 6, 7, 9, 14))],
        },
        {
          name: 'input',
          counts: c(1021, 1103, 112, 118, 268, 322),
          children: [
            file('cobertura.rs', c(214, 226, 21, 22, 48, 58)),
            file('format.rs', c(101, 112, 9, 9, 30, 36)),
            file('jacoco.rs', c(199, 239, 22, 25, 51, 72)),
            file('lcov.rs', c(412, 420, 41, 41, 112, 118)),
            file('llvm_json.rs', c(95, 106, 19, 21, 27, 38)),
          ],
        },
        {
          name: 'output',
          counts: c(292, 332, 34, 38, 50, 66),
          children: [
            file('html.rs', c(71, 88, 8, 10, 6, 12)),
            file('sources.rs', c(33, 48, 4, 6, 4, 10)),
            file('tree.rs', c(188, 196, 22, 22, 40, 44)),
          ],
        },
        file('main.rs', c(61, 88, 4, 6, 8, 14)),
        file('paths.rs', c(28, 61, 3, 7, 5, 16)),
      ],
    },
  ],
};

function flatten(node: SampleNode, depth: number, ancestors: string[], rows: TreeRow[]) {
  for (const child of node.children ?? []) {
    const path = [...ancestors.slice(-1), child.name].join('/');

    rows.push({
      name: child.name,
      path,
      depth,
      dir: child.children !== undefined,
      ancestors,
      counts: child.counts,
    });

    if (child.children) {
      flatten(child, depth + 1, [...ancestors, path], rows);
    }
  }

  return rows;
}

export const SAMPLE_TITLE = SAMPLE.name;
export const SAMPLE_TOTALS = SAMPLE.counts;
export const SAMPLE_ROWS = flatten(SAMPLE, 0, [], []);
export const SAMPLE_FILE_COUNT = SAMPLE_ROWS.filter(row => !row.dir).length;

export const SAMPLE_FILE = {
  crumbs: ['coviz', 'src', 'input'],
  name: 'format.rs',
  counts: c(101, 112, 9, 9, 30, 36),
};

/** Lines 14-34 of src/input/format.rs. */
export const SAMPLE_CODE: CodeLine[] = [
  { no: 14, text: 'impl Format {', hits: null },
  {
    no: 15,
    text: '    /// Resolve a format from the file name, falling back to inspecting the',
    hits: null,
  },
  {
    no: 16,
    text: '    /// content when the extension is ambiguous (e.g. JaCoCo vs Cobertura `.xml`).',
    hits: null,
  },
  { no: 17, text: '    pub fn detect(path: &Path, content: &str) -> Option<Format> {', hits: 24 },
  {
    no: 18,
    text: '        if let Some(name) = path.file_name().map(|n| n.to_string_lossy().to_lowercase()) {',
    hits: 24,
  },
  { no: 19, text: '            if name.ends_with(".lcov") || name.ends_with(".info") {', hits: 24 },
  { no: 20, text: '                return Some(Format::Lcov);', hits: 9 },
  { no: 21, text: '            }', hits: null },
  { no: 22, text: '            if name.ends_with(".json") {', hits: 15 },
  { no: 23, text: '                return Some(Format::LlvmJson);', hits: 4 },
  { no: 24, text: '            }', hits: null },
  { no: 25, text: '            if name.ends_with(".xml") {', hits: 11 },
  { no: 26, text: '                return sniff(content);', hits: 11 },
  { no: 27, text: '            }', hits: null },
  { no: 28, text: '            if name.contains("lcov") {', hits: 0 },
  { no: 29, text: '                return Some(Format::Lcov);', hits: 0 },
  { no: 30, text: '            }', hits: null },
  { no: 31, text: '        }', hits: null },
  { no: 32, text: '        sniff(content)', hits: 0 },
  { no: 33, text: '    }', hits: null },
  { no: 34, text: '}', hits: null },
];
