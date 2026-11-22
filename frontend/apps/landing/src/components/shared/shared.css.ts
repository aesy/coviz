import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

export const CONTAINER = 1400;

export const page = style({
  overflowX: 'clip',
  minHeight: '100vh',
  background: colors.page,
  color: colors.ink,
});

// Doubled so it beats Mantine's own Container padding.
export const wrap = style({
  width: '100%',
  boxSizing: 'border-box',
  selectors: { '&&': { paddingInline: 24 } },
  '@media': { '(max-width: 620px)': { selectors: { '&&': { paddingInline: 16 } } } },
});

export const section = style({
  paddingBlock: 72,
  borderTop: `1px solid ${colors.hairline}`,
});

export const eyebrow = style({
  marginBottom: 10,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: colors.muted,
});

export const heading = style({
  marginBottom: 14,
  fontFamily: vars.fontFamilyHeadings,
  fontSize: 'clamp(28px, 3.6vw, 48px)',
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  textWrap: 'balance',
});

export const sub = style({
  maxWidth: '62ch',
  marginBottom: 32,
  color: colors.ink2,
});

export const inlineCode = style({
  fontFamily: vars.fontFamilyMonospace,
  fontSize: '0.9em',
  fontVariantLigatures: 'none',
  whiteSpace: 'nowrap',
});
