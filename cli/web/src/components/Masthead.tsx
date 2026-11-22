import { fileCount, type Report } from "../lib/coverage";
import { fmt } from "../lib/format";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Masthead.module.css";

export function Masthead({ data }: { data: Report }) {
  return (
    <header class={styles.masthead}>
      <div>
        <a
          class={styles.brand}
          href="https://github.com/aesy/coviz"
          target="_blank"
          rel="noopener noreferrer"
        >
          co<b>viz</b>
        </a>
        <h1 class={styles.title}>{data.title}</h1>
        <div class={styles.meta}>
          <span>{data.input}</span>
          <span>{fmt(fileCount(data.root))} files</span>
          <span>{new Date(data.generatedMs).toLocaleString()}</span>
        </div>
      </div>
      <div class="controls">
        <ThemeToggle />
      </div>
    </header>
  );
}
