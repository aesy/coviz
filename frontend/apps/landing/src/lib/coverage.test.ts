import { bucket, fmtPct, pct } from '@/lib/coverage';

describe('pct', () => {
  it('floors to one decimal and never rounds up to 100', () => {
    expect(pct(2, 3)).toBe(66.6);
    expect(pct(9999, 10000)).toBe(99.9);
    expect(pct(5, 5)).toBe(100);
  });

  it('has no value when nothing was found', () => {
    expect(pct(0, 0)).toBeNull();
    expect(fmtPct(null)).toBe('–');
  });
});

describe('bucket', () => {
  it('uses the report thresholds', () => {
    expect(bucket(90)).toBe('good');
    expect(bucket(89.9)).toBe('warn');
    expect(bucket(75)).toBe('warn');
    expect(bucket(50)).toBe('serious');
    expect(bucket(49.9)).toBe('critical');
    expect(bucket(null)).toBe('none');
  });
});
