import { Fragment, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Dot } from '@/components/Report/Atoms';
import * as css from '@/components/Report/Report.css';
import { BrowserFrame } from '@/components/shared/BrowserFrame';
import { fmt, fmtPct, pct } from '@/lib/coverage';
import { SAMPLE_CODE, SAMPLE_FILE } from '@/lib/sample';

const { counts } = SAMPLE_FILE;

// The report UI is English only, so its labels are kept as they appear in the product.
const CHIPS = [
  { label: 'lines', hit: counts.lh, found: counts.lf },
  { label: 'functions', hit: counts.fh, found: counts.ff },
  { label: 'branches', hit: counts.bh, found: counts.bf },
];

const FILE_PATH = [...SAMPLE_FILE.crumbs.slice(1), SAMPLE_FILE.name].join('/');

export const FilePreview: FC = () => {
  const { t } = useTranslation();

  return (
    <BrowserFrame url={`file:///tmp/coviz-3f9a.html#/${FILE_PATH}`} label={t('preview.fileLabel')}>
      <div className={css.report}>
        <div className={css.shell}>
          <nav className={`${css.crumbs} ${css.crumbsFirst}`} aria-label="Breadcrumb">
            {SAMPLE_FILE.crumbs.map(crumb => (
              <Fragment key={crumb}>
                <span className={css.crumbLink}>{crumb}</span>
                <span className={css.crumbSep}>/</span>
              </Fragment>
            ))}
            <span className={css.crumbHere}>{SAMPLE_FILE.name}</span>
          </nav>
          <div className={css.toolbar}>
            <div className={css.controls}>
              <button type="button" className={css.button}>
                {'←'} Back
              </button>
            </div>
          </div>
          <section className={css.panel}>
            <div className={css.fileHead}>
              <span className={css.fileName}>{SAMPLE_FILE.name}</span>
              {CHIPS.map(({ label, hit, found }) => {
                const p = pct(hit, found);

                return (
                  <span key={label} className={css.chip}>
                    <Dot p={p} />
                    {fmtPct(p)} {label} ({fmt(hit)}/{fmt(found)})
                  </span>
                );
              })}
            </div>
            <div className={css.codeWrap}>
              <div className={css.code}>
                {SAMPLE_CODE.map(({ no, text, hits }) => {
                  const state = hits === null ? '' : hits > 0 ? css.codeHit : css.codeMiss;

                  return (
                    <div key={no} className={`${css.codeRow} ${state}`}>
                      <div className={css.lineNo}>{no}</div>
                      <div className={css.hits}>{hits ?? ''}</div>
                      <pre className={css.codeText}>{text}</pre>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </BrowserFrame>
  );
};
