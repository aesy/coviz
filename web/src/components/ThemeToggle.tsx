import { THEME_LABELS, useTheme } from "../lib/theme";

export function ThemeToggle() {
  const { theme, cycle } = useTheme();

  return (
    <button class="btn" title="Toggle color theme" onClick={cycle}>
      {THEME_LABELS[theme]}
    </button>
  );
}
