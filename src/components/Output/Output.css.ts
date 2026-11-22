import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

export const layout = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 4fr) minmax(0, 7fr)',
  alignItems: 'start',
  gap: 48,
  '@media': { '(max-width: 1000px)': { gridTemplateColumns: 'minmax(0, 1fr)' } },
});

export const facts = style({ display: 'grid', gap: 28 });

export const flag = style({
  display: 'block',
  marginBottom: 8,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 13,
  color: colors.muted,
});

export const factTitle = style({
  marginBottom: 6,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 15,
  fontWeight: 650,
});

export const factBody = style({ fontSize: 15, color: colors.ink2 });
