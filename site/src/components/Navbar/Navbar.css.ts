import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

export const nav = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  paddingBlock: 32,
});

export const brand = style({
  padding: '9px 18px',
  border: `1.5px solid ${colors.border}`,
  borderRadius: 11,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 26,
  fontWeight: 650,
  lineHeight: 1.2,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  color: colors.muted,
  transition: 'border-color 120ms, color 120ms',
  ':hover': { color: colors.ink, borderColor: colors.muted },
  '@media': { '(max-width: 760px)': { padding: '7px 13px', fontSize: 19 } },
});

export const brandAccent = style({ fontWeight: 650, color: colors.accent });

export const links = style({
  display: 'flex',
  alignItems: 'center',
  gap: 28,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 16,
  '@media': { '(max-width: 760px)': { gap: 18, fontSize: 15 } },
});

export const link = style({
  textDecoration: 'none',
  color: colors.ink2,
  ':hover': { color: colors.ink },
});

export const sectionLink = style({ '@media': { '(max-width: 760px)': { display: 'none' } } });
