import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

// The 1px gaps show the background through as dividers, so they stay right however the grid wraps.
// Column counts are 4, 2 or 1 so a row is never left half empty.
export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 1,
  overflow: 'hidden',
  background: colors.hairline,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  '@media': {
    '(max-width: 1100px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '(max-width: 620px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
});

export const format = style({ padding: 22, background: colors.surface });

export const name = style({
  marginBottom: 4,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 16,
  fontWeight: 650,
});

export const files = style({
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 12,
  color: colors.accent,
});

export const tools = style({ marginTop: 8, fontSize: 14, color: colors.ink2 });
