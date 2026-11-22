import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

export const footer = style({ borderTop: `1px solid ${colors.hairline}` });

export const row = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '12px 24px',
  paddingTop: 28,
  paddingBottom: 40,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 12,
  color: colors.muted,
});

export const links = style({ display: 'flex', gap: 16 });

export const link = style({
  textDecoration: 'none',
  color: colors.ink2,
  ':hover': { color: colors.ink },
});
