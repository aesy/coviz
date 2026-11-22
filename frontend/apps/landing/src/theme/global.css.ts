import { globalStyle } from '@vanilla-extract/css';
import { colors } from '@/theme/colors.css';
import { vars } from '@/theme/theme-vars';

globalStyle('html', {
  scrollBehavior: 'smooth',
  '@media': {
    '(prefers-reduced-motion: reduce)': { scrollBehavior: 'auto' },
  },
});

globalStyle('body', {
  margin: 0,
  fontFamily: vars.fontFamily,
  fontSize: 16,
  lineHeight: 1.6,
  color: colors.ink,
  background: colors.page,
  WebkitFontSmoothing: 'antialiased',
});

globalStyle('h1, h2, h3, p', { margin: 0, padding: 0 });

globalStyle('a', { color: 'inherit' });

globalStyle('button', { fontFamily: 'inherit' });

globalStyle('a:focus-visible, button:focus-visible', {
  outline: `2px solid ${colors.accent}`,
  outlineOffset: 2,
});
