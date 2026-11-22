import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

const tint = (color: string, amount: number) =>
  `color-mix(in oklab, ${color} ${amount}%, transparent)`;

export const hero = style({ display: 'grid', gap: 32, paddingBlock: '40px 40px' });

export const fileTag = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 13,
  color: colors.muted,
});

export const fileTagSep = style({ color: colors.hairline });

export const headline = style({
  display: 'grid',
  fontFamily: vars.fontFamilyHeadings,
  fontSize: 'clamp(36px, 7vw, 104px)',
  fontWeight: 800,
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
});

export const line = style({
  display: 'grid',
  gridTemplateColumns: '2.6em 3.4em 1fr',
  alignItems: 'baseline',
  paddingLeft: '0.3em',
  borderLeft: '4px solid transparent',
  '@media': { '(max-width: 760px)': { gridTemplateColumns: '1.6em 2.6em 1fr' } },
});

export const hit = style({ borderLeftColor: colors.good, background: tint(colors.good, 7) });

export const miss = style({
  borderLeftColor: colors.critical,
  background: tint(colors.critical, 8),
});

export const gutter = style({
  alignSelf: 'center',
  paddingRight: '1.2em',
  fontFamily: vars.fontFamilyMonospace,
  fontSize: '0.2em',
  fontWeight: 500,
  letterSpacing: 0,
  color: colors.muted,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
});

export const hits = style([
  gutter,
  {
    selectors: {
      [`${hit} &`]: { color: colors.goodText },
      [`${miss} &`]: { color: colors.critical },
    },
  },
]);

export const text = style({
  selectors: {
    [`${miss} &`]: {
      color: colors.muted,
      textDecoration: 'line-through',
      textDecorationThickness: '0.06em',
      textDecorationColor: colors.critical,
    },
  },
});

export const highlight = style({ color: colors.accent });

export const body = style({ maxWidth: '62ch', fontSize: 20, color: colors.ink2 });

export const actions = style({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 });

const cta = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 16px',
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'border-color 120ms, transform 120ms',
});

export const primary = style([
  cta,
  {
    background: colors.accent,
    borderColor: colors.accent,
    color: '#ffffff',
    ':hover': { transform: 'translateY(-1px)' },
    '@media': { '(prefers-reduced-motion: reduce)': { ':hover': { transform: 'none' } } },
  },
]);

export const secondary = style([
  cta,
  { background: colors.surface, color: colors.ink, ':hover': { borderColor: colors.muted } },
]);

export const platforms = style({
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 12,
  color: colors.muted,
});

export const after = style({ display: 'grid', gap: 28 });
