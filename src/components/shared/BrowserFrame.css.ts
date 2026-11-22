import { style } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

export const frame = style({
  margin: 0,
  minWidth: 0,
  overflow: 'hidden',
  background: colors.page,
  border: `1px solid ${colors.border}`,
  borderRadius: 14,
  boxShadow: '0 24px 60px -32px rgba(0, 0, 0, 0.35)',
});

export const chrome = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
  padding: '10px 14px',
  background: colors.surface,
  borderBottom: `1px solid ${colors.border}`,
  fontFamily: vars.fontFamilyMonospace,
  fontSize: 12,
  color: colors.muted,
});

export const light = style({
  flexShrink: 0,
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: colors.hairline,
});

export const address = style({
  marginLeft: 8,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const example = style({
  flexShrink: 0,
  marginLeft: 'auto',
  padding: '1px 8px',
  border: `1px solid ${colors.border}`,
  borderRadius: 999,
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
});
