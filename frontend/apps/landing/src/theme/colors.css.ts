import { createGlobalTheme, createThemeContract } from '@vanilla-extract/css';

export const colors = createThemeContract({
  page: null,
  surface: null,
  ink: null,
  ink2: null,
  muted: null,
  hairline: null,
  border: null,
  accent: null,
  good: null,
  goodText: null,
  warn: null,
  serious: null,
  critical: null,
  codeBg: null,
});

const light = {
  page: '#f9f9f7',
  surface: '#fcfcfb',
  ink: '#0b0b0b',
  ink2: '#52514e',
  muted: '#898781',
  hairline: '#e1e0d9',
  border: 'rgba(11, 11, 11, 0.10)',
  accent: '#2a78d6',
  good: '#0ca30c',
  goodText: '#006300',
  warn: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
  codeBg: '#f1f0ec',
};

createGlobalTheme(':root', colors, light);

createGlobalTheme(':root[data-mantine-color-scheme="dark"]', colors, {
  ...light,
  page: '#0d0d0d',
  surface: '#1a1a19',
  ink: '#ffffff',
  ink2: '#c3c2b7',
  hairline: '#2c2c2a',
  border: 'rgba(255, 255, 255, 0.10)',
  accent: '#3987e5',
  goodText: '#0ca30c',
  codeBg: '#141413',
});
