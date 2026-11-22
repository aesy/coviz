import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
  gap: 14,
});

export const platform = style({ minWidth: 0 });

export const os = style({
  marginBottom: 8,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 12,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: colors.muted,
});
