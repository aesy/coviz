import { useCallback, useEffect, useState } from "preact/hooks";

export type Theme = "auto" | "light" | "dark";

const ORDER: Theme[] = ["auto", "light", "dark"];
export const THEME_LABELS: Record<Theme, string> = {
  auto: "◐ auto",
  light: "☀ light",
  dark: "☾ dark",
};

function stored(): Theme {
  const value = localStorage.getItem("coviz-theme");

  return value === "light" || value === "dark" ? value : "auto";
}

/** Apply the persisted theme before first paint to avoid a flash. */
export function applyStoredTheme(): void {
  const theme = stored();

  if (theme === "auto") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
}

/** Theme state persisted to localStorage and reflected on the root element. */
export function useTheme(): { theme: Theme; cycle: () => void } {
  const [theme, setTheme] = useState<Theme>(stored);

  useEffect(() => {
    if (theme === "auto") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }

    localStorage.setItem("coviz-theme", theme);
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme((current) => ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
  }, []);

  return { theme, cycle };
}
