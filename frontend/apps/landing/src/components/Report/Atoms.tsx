import type { FC } from 'react';
import * as css from '@/components/Report/Report.css';
import { bucket, fmt, fmtPct, pct } from '@/lib/coverage';

type MeterProps = { p: number | null; className?: string };

export const Meter: FC<MeterProps> = ({ p, className }) => (
  <div className={`${css.meter} ${css.buckets[bucket(p)]} ${className ?? ''}`}>
    <div className={css.fill} style={{ width: `${p === null ? 0 : Math.max(p, 1.5)}%` }} />
  </div>
);

export const Dot: FC<{ p: number | null }> = ({ p }) => (
  <span className={`${css.dot} ${css.buckets[bucket(p)]}`} />
);

export const StatPair: FC<{ hit: number; found: number }> = ({ hit, found }) => {
  const p = pct(hit, found);

  return (
    <div className={css.cellStat}>
      <Dot p={p} />
      <span className={css.pct}>{fmtPct(p)}</span>
      <span className={css.countsInline}>
        {fmt(hit)}/{fmt(found)}
      </span>
    </div>
  );
};
