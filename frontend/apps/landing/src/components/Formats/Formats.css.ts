import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
  overflow: 'hidden',
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
});

export const format = style({
  margin: '-1px 0 0 -1px',
  padding: 22,
  borderTop: `1px solid ${colors.hairline}`,
  borderLeft: `1px solid ${colors.hairline}`,
});

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
