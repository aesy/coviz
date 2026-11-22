import { createVar, style, styleVariants } from '@vanilla-extract/css';
import type { Bucket } from '@/lib/coverage';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

// Styles copied from the report UI in cli/web, so the preview looks like the real thing.
const REPORT_SANS = "system-ui, 'Segoe UI', sans-serif";
const mono = vars.fontFamilyMonospace;
const hover = `color-mix(in oklab, ${colors.accent} 5%, transparent)`;
const tint = (color: string, amount: number, base: string = colors.surface) =>
  `color-mix(in oklab, ${color} ${amount}%, ${base})`;

const bucketColor = createVar();

export const buckets = styleVariants<Record<Bucket, object>>({
  good: { vars: { [bucketColor]: colors.good } },
  warn: { vars: { [bucketColor]: colors.warn } },
  serious: { vars: { [bucketColor]: colors.serious } },
  critical: { vars: { [bucketColor]: colors.critical } },
  none: { vars: { [bucketColor]: colors.muted } },
});

export const report = style({
  fontFamily: REPORT_SANS,
  fontSize: 14,
  lineHeight: 1.5,
  color: colors.ink,
});

export const shell = style({
  maxWidth: 1180,
  margin: '0 auto',
  padding: '28px 24px 32px',
  '@media': { '(max-width: 620px)': { padding: '20px 14px 24px' } },
});

export const controls = style({ display: 'flex', flexShrink: 0, gap: 8 });

export const button = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 10px',
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  fontFamily: mono,
  fontSize: 12,
  color: colors.ink2,
  cursor: 'pointer',
  transition: 'border-color 120ms, color 120ms',
  ':hover': { color: colors.ink, borderColor: colors.muted },
});

export const meter = style({
  height: 6,
  overflow: 'hidden',
  borderRadius: 999,
  background: tint(bucketColor, 18),
});

export const fill = style({ height: '100%', borderRadius: 'inherit', background: bucketColor });

export const dot = style({
  display: 'inline-block',
  flexShrink: 0,
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: bucketColor,
});

export const cellStat = style({ display: 'flex', alignItems: 'center', gap: 8 });

export const pct = style({
  flexShrink: 0,
  width: '4.2em',
  fontFamily: mono,
  fontSize: 13,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
});

export const countsInline = style({
  fontFamily: mono,
  fontSize: 11.5,
  color: colors.muted,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
  '@media': { '(max-width: 900px)': { display: 'none' } },
});

export const masthead = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
});

export const brand = style({
  display: 'inline-block',
  marginBottom: 10,
  padding: '3px 8px',
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  fontFamily: mono,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: colors.muted,
});

export const brandAccent = style({ color: colors.accent, fontWeight: 600 });

export const title = style({
  margin: '0 0 4px',
  fontFamily: mono,
  fontSize: 26,
  fontWeight: 650,
  lineHeight: 1.3,
  letterSpacing: '-0.01em',
  overflowWrap: 'anywhere',
});

export const meta = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  fontFamily: mono,
  fontSize: 12,
  color: colors.muted,
});

export const metaSep = style({ color: colors.hairline });

export const crumbs = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 2,
  margin: '22px 0 14px',
  fontFamily: mono,
  fontSize: 13,
  color: colors.muted,
});

export const crumbsFirst = style({ marginTop: 0 });

export const crumbLink = style({
  padding: '1px 4px',
  borderRadius: 5,
  color: colors.ink2,
  cursor: 'pointer',
  ':hover': { color: colors.accent, background: tint(colors.accent, 8, 'transparent') },
});

export const crumbSep = style({ margin: '0 2px', color: colors.hairline, userSelect: 'none' });

export const crumbHere = style({ padding: '1px 4px', fontWeight: 600, color: colors.ink });

export const tiles = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: 12,
  marginBottom: 20,
});

export const tile = style({
  padding: '16px 18px 18px',
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
});

export const tileLabel = style({
  marginBottom: 8,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: colors.muted,
});

export const tileValue = style({
  fontFamily: mono,
  fontSize: 32,
  fontWeight: 650,
  lineHeight: 1.1,
});

export const tileUnit = style({ fontSize: 18, fontWeight: 500, color: colors.ink2 });

export const tileCounts = style({
  margin: '2px 0 12px',
  fontFamily: mono,
  fontSize: 12,
  color: colors.muted,
  fontVariantNumeric: 'tabular-nums',
});

export const toolbar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 10,
});

export const legend = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 14,
  fontFamily: mono,
  fontSize: 11,
  color: colors.muted,
});

export const legendKey = style({ display: 'inline-flex', alignItems: 'center', gap: 5 });

export const scroll = style({ overflowX: 'auto' });

export const panel = style({
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
});

const columns = createVar();

export const treePanel = style({
  vars: { [columns]: 'minmax(220px, 1fr) 290px 150px 150px' },
  '@media': {
    '(max-width: 900px)': { vars: { [columns]: 'minmax(160px, 1fr) 200px 110px 110px' } },
    // The preview is narrower than the screen, so it scrolls sideways instead of squeezing names.
    '(max-width: 620px)': {
      minWidth: 560,
      vars: { [columns]: 'minmax(120px, 1fr) 130px 64px 64px' },
    },
  },
});

const grid = style({ display: 'grid', gridTemplateColumns: columns, alignItems: 'center' });

export const gridHead = style([
  grid,
  {
    padding: '10px 0',
    borderBottom: `1px solid ${colors.hairline}`,
    borderRadius: '12px 12px 0 0',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: colors.muted,
  },
]);

export const gridRow = style([
  grid,
  {
    padding: '7px 0',
    borderTop: `1px solid ${colors.hairline}`,
    transition: 'background 100ms',
    ':hover': { background: hover },
    selectors: {
      [`${gridHead} + &`]: { borderTop: 'none' },
      '&:last-child': { borderRadius: '0 0 12px 12px' },
    },
  },
]);

export const cell = style({ minWidth: 0, padding: '0 16px' });

export const cellName = style([
  cell,
  { display: 'flex', alignItems: 'center', gap: 4, fontFamily: mono, fontSize: 13 },
]);

export const twisty = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: 18,
  height: 18,
  padding: 0,
  background: 'none',
  border: 'none',
  borderRadius: 5,
  color: colors.muted,
  cursor: 'pointer',
  ':hover': { color: colors.ink, background: tint(colors.accent, 12, 'transparent') },
});

export const twistyIcon = style({
  transition: 'transform 140ms ease',
  selectors: { [`${twisty}[aria-expanded="true"] &`]: { transform: 'rotate(90deg)' } },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
});

export const twistyPad = style({ flexShrink: 0, width: 18 });

const name = style({
  padding: '1px 3px',
  borderRadius: 5,
  overflowWrap: 'anywhere',
  cursor: 'pointer',
  ':hover': { color: colors.accent },
});

export const nameDir = style([name, { fontWeight: 600, color: colors.ink }]);

export const nameFile = style([name, { color: colors.ink2 }]);

export const dirSlash = style({ fontWeight: 400, color: colors.muted });

export const cellLines = style([cell, { display: 'flex', alignItems: 'center', gap: 10 }]);

export const linesMeter = style({
  flexShrink: 0,
  width: 84,
  '@media': {
    '(max-width: 900px)': { width: 48 },
    '(max-width: 620px)': { display: 'none' },
  },
});

export const fileHead = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
  padding: '14px 16px',
  borderBottom: `1px solid ${colors.hairline}`,
});

export const fileName = style({ fontFamily: mono, fontSize: 14, fontWeight: 650 });

export const chip = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '3px 10px',
  border: `1px solid ${colors.border}`,
  borderRadius: 999,
  fontFamily: mono,
  fontSize: 11.5,
  color: colors.ink2,
  fontVariantNumeric: 'tabular-nums',
});

export const codeWrap = style({ overflowX: 'auto', borderRadius: '0 0 12px 12px' });

export const code = style({
  width: 'max-content',
  minWidth: '100%',
  padding: '8px 0 14px',
  fontFamily: mono,
  fontSize: 12.5,
  lineHeight: 1.65,
  fontVariantLigatures: 'none',
});

const GUTTER = 44;

export const codeRow = style({
  display: 'grid',
  gridTemplateColumns: `${GUTTER}px 68px minmax(0, 1fr)`,
  background: colors.surface,
});

export const codeHit = style({ background: tint(colors.good, 4) });

export const codeMiss = style({ background: tint(colors.critical, 9) });

const gutterCell = style({
  position: 'sticky',
  paddingRight: 12,
  background: 'inherit',
  color: colors.muted,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  userSelect: 'none',
});

export const lineNo = style([gutterCell, { left: 0 }]);

export const hits = style([
  gutterCell,
  {
    left: GUTTER,
    fontSize: 11,
    selectors: {
      [`${codeHit} &`]: { color: colors.goodText },
      [`${codeMiss} &`]: { color: colors.critical, fontWeight: 600 },
    },
  },
]);

export const codeText = style({
  margin: 0,
  padding: '0 24px 0 14px',
  font: 'inherit',
  whiteSpace: 'pre',
  tabSize: 4,
});
