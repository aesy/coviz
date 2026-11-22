import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useMantineColorScheme, type MantineColorScheme } from '@mantine/core';
import { Dot, Meter, StatPair } from '@/components/Report/Atoms';
import * as css from '@/components/Report/Report.css';
import { BrowserFrame } from '@/components/shared/BrowserFrame';
import { fmt, fmtPct, pct, type Counts } from '@/lib/coverage';
import {
  SAMPLE_FILE_COUNT,
  SAMPLE_ROWS,
  SAMPLE_TITLE,
  SAMPLE_TOTALS,
  type TreeRow,
} from '@/lib/sample';

// The report UI is English only, so its labels are kept as they appear in the product.
const LEGEND = [
  { p: 90, label: '≥ 90%' },
  { p: 75, label: '75–90' },
  { p: 50, label: '50–75' },
  { p: 0, label: '< 50' },
];

const THEME_LABELS: Record<MantineColorScheme, string> = {
  auto: '◐ auto',
  light: '☀ light',
  dark: '☾ dark',
};

const NEXT_THEME: Record<MantineColorScheme, MantineColorScheme> = {
  auto: 'light',
  light: 'dark',
  dark: 'auto',
};

const DIRS = SAMPLE_ROWS.filter(row => row.dir).map(row => row.path);

export const DirPreview: FC = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = (path: string) =>
    setCollapsed(previous => {
      const next = new Set(previous);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });

  const visible = SAMPLE_ROWS.filter(row => !row.ancestors.some(path => collapsed.has(path)));

  return (
    <BrowserFrame url="file:///tmp/coviz-3f9a.html" label={t('preview.dirLabel')}>
      <div className={css.report}>
        <div className={css.shell}>
          <Masthead />
          <nav className={css.crumbs} aria-label="Breadcrumb">
            <span className={css.crumbHere}>{SAMPLE_TITLE}</span>
          </nav>
          <Tiles counts={SAMPLE_TOTALS} />
          <div className={css.toolbar}>
            <div className={css.controls}>
              <button type="button" className={css.button} onClick={() => setCollapsed(new Set())}>
                Expand all
              </button>
              <button
                type="button"
                className={css.button}
                onClick={() => setCollapsed(new Set(DIRS))}
              >
                Collapse all
              </button>
            </div>
            <div className={css.legend}>
              {LEGEND.map(({ p, label }) => (
                <span key={label} className={css.legendKey}>
                  <Dot p={p} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className={css.scroll}>
            <section className={`${css.panel} ${css.treePanel}`}>
              <div className={css.gridHead}>
                <div className={css.cell}>Name</div>
                <div className={css.cell}>Lines</div>
                <div className={css.cell}>Functions</div>
                <div className={css.cell}>Branches</div>
              </div>
              {visible.map(row => (
                <Row
                  key={row.path}
                  row={row}
                  expanded={!collapsed.has(row.path)}
                  onToggle={toggle}
                />
              ))}
            </section>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
};

const Masthead: FC = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <header className={css.masthead}>
      <div>
        <span className={css.brand}>
          co<b className={css.brandAccent}>viz</b>
        </span>
        <p className={css.title}>{SAMPLE_TITLE}</p>
        <div className={css.meta}>
          <span>lcov.info</span>
          <span className={css.metaSep}>{'·'}</span>
          <span>{SAMPLE_FILE_COUNT} files</span>
          <span className={css.metaSep}>{'·'}</span>
          <span>11/22/2026, 2:03:11 PM</span>
        </div>
      </div>
      <div className={css.controls}>
        <button
          type="button"
          className={css.button}
          title="Toggle color theme"
          onClick={() => setColorScheme(NEXT_THEME[colorScheme])}
        >
          {THEME_LABELS[colorScheme]}
        </button>
      </div>
    </header>
  );
};

const TILES = [
  { label: 'Line coverage', hit: 'lh', found: 'lf' },
  { label: 'Function coverage', hit: 'fh', found: 'ff' },
  { label: 'Branch coverage', hit: 'bh', found: 'bf' },
] as const;

const Tiles: FC<{ counts: Counts }> = ({ counts }) => (
  <section className={css.tiles}>
    {TILES.map(({ label, hit, found }) => {
      const p = pct(counts[hit], counts[found]);

      return (
        <div key={label} className={css.tile}>
          <div className={css.tileLabel}>{label}</div>
          <div className={css.tileValue}>
            {p?.toFixed(1)}
            <small className={css.tileUnit}> %</small>
          </div>
          <div className={css.tileCounts}>
            {fmt(counts[hit])} / {fmt(counts[found])} covered
          </div>
          <Meter p={p} />
        </div>
      );
    })}
  </section>
);

type RowProps = { row: TreeRow; expanded: boolean; onToggle: (path: string) => void };

const Row: FC<RowProps> = ({ row, expanded, onToggle }) => {
  const { lh, lf, fh, ff, bh, bf } = row.counts;
  const p = pct(lh, lf);

  return (
    <div className={css.gridRow}>
      <div className={css.cellName} style={{ paddingLeft: 16 + row.depth * 20 }}>
        {row.dir ? (
          <>
            <button
              type="button"
              className={css.twisty}
              aria-expanded={expanded}
              aria-label={`Toggle ${row.name}`}
              onClick={() => onToggle(row.path)}
            >
              <svg className={css.twistyIcon} width="10" height="10" viewBox="0 0 10 10">
                <path
                  d="M3 1l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className={css.nameDir}>
              {row.name}
              <span className={css.dirSlash}>/</span>
            </span>
          </>
        ) : (
          <>
            <span className={css.twistyPad} />
            <span className={css.nameFile}>{row.name}</span>
          </>
        )}
      </div>
      <div className={css.cellLines}>
        <Meter p={p} className={css.linesMeter} />
        <span className={css.pct}>{fmtPct(p)}</span>
        <span className={css.countsInline}>
          {fmt(lh)}/{fmt(lf)}
        </span>
      </div>
      <div className={css.cell}>
        <StatPair hit={fh} found={ff} />
      </div>
      <div className={css.cell}>
        <StatPair hit={bh} found={bf} />
      </div>
    </div>
  );
};
