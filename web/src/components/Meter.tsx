import { bucket } from "../lib/format";

export function Meter({ p }: { p: number | null }) {
  const width = (p === null ? 0 : Math.max(p, 1.5)) + "%";

  return (
    <div class={`meter b-${bucket(p)}`}>
      <div class="fill" style={{ width }} />
    </div>
  );
}
