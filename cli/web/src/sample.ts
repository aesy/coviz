import type { Report } from "./lib/coverage";

const counts = (lf: number, lh: number, ff: number, fh: number, bf = 0, bh = 0, mf = 0, mh = 0) => ({
  lf,
  lh,
  ff,
  fh,
  bf,
  bh,
  mf,
  mh,
});

/** Fixture used only by `npm run dev`; never bundled into the built report. */
export const sample: Report = {
  title: "sample",
  input: "sample.lcov",
  generatedMs: 1_700_000_000_000,
  sources: {
    "src/lib.rs": {
      text: "fn add(a: u32, b: u32) -> u32 {\n    a + b\n}\n\nfn unused() {\n    todo!()\n}\n",
      lines: [
        [1, 3],
        [2, 3],
        [5, 0],
        [6, 0],
      ],
    },
  },
  root: {
    name: "",
    path: "",
    dir: true,
    counts: counts(12, 9, 4, 3, 6, 4, 4, 2),
    children: [
      {
        name: "src",
        path: "src",
        dir: true,
        counts: counts(8, 6, 3, 2, 4, 3, 4, 2),
        children: [
          {
            name: "lib.rs",
            path: "src/lib.rs",
            dir: false,
            counts: counts(4, 2, 2, 1, 2, 1, 2, 1),
            children: [],
          },
          {
            name: "parser.rs",
            path: "src/parser.rs",
            dir: false,
            counts: counts(4, 4, 1, 1, 2, 2, 2, 1),
            children: [],
          },
        ],
      },
      {
        name: "main.rs",
        path: "main.rs",
        dir: false,
        counts: counts(4, 3, 1, 1, 2, 1),
        children: [],
      },
    ],
  },
};
