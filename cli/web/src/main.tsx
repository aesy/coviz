import { render } from "preact";

import { App } from "./components/App";
import type { Report } from "./lib/coverage";
import { applyStoredTheme } from "./lib/theme";
import "./global.css";

async function boot() {
  applyStoredTheme();

  let data: Report;

  try {
    data = JSON.parse(document.getElementById("coviz-data")!.textContent!);
  } catch {
    // In the built report the data script holds a `{{ data }}` template token,
    // which only resolves once the Rust binary fills it in. The dev server has
    // no such data, so fall back to a bundled sample (dropped from prod builds).
    if (import.meta.env.DEV) {
      data = (await import("./sample")).sample;
    } else {
      throw new Error("coviz: coverage data missing from report");
    }
  }

  render(<App data={data} />, document.getElementById("app")!);
}

void boot();
