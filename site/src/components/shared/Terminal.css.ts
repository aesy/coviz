import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

export const terminal = style({
  overflowX: 'auto',
  background: colors.codeBg,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 14,
  fontVariantLigatures: 'none',
});

export const lines = style({
  margin: 0,
  padding: '18px 20px',
  fontFamily: 'inherit',
  lineHeight: 1.7,
});

export const prompt = style({ color: colors.muted, userSelect: 'none' });

export const comment = style({ color: colors.muted });

export const file = style({ color: colors.accent });
