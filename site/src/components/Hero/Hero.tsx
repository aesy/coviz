import type { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Container } from '@mantine/core';
import * as css from '@/components/Hero/Hero.css';
import { DirPreview } from '@/components/Report/DirPreview';
import { CONTAINER, wrap } from '@/components/shared/shared.css';
import { Terminal } from '@/components/shared/Terminal';
import { file } from '@/components/shared/Terminal.css';
import { links, VERSION } from '@/lib/links';

// Hit counts for the headline lines; the third line is the one the reader skips.
const HITS = [12, 12, 0, 12];

export const Hero: FC = () => {
  const { t } = useTranslation();
  const lines = t('hero.titleLines', { returnObjects: true }) as string[];

  return (
    <Container size={CONTAINER} className={wrap}>
      <header className={css.hero}>
        <div className={css.fileTag}>
          <span>{t('hero.file')}</span>
          <span className={css.fileTagSep}>{'·'}</span>
          <span>{t('hero.lines')}</span>
          <span className={css.fileTagSep}>{'·'}</span>
          <span>{t('hero.covered')}</span>
        </div>
        <h1 className={css.headline} aria-label={t('hero.title')}>
          {lines.map((line, index) => {
            const hits = HITS[index] ?? 0;

            return (
              <span
                key={line}
                aria-hidden
                className={`${css.line} ${hits > 0 ? css.hit : css.miss}`}
              >
                <span className={css.gutter}>{index + 1}</span>
                <span className={css.hits}>{hits}</span>
                <span className={css.text}>
                  <Trans
                    i18nKey={`hero.titleLines.${index}`}
                    components={{ hl: <span className={css.highlight} /> }}
                  />
                </span>
              </span>
            );
          })}
        </h1>
        <p className={css.body}>{t('hero.body')}</p>
        <div className={css.actions}>
          <a className={css.primary} href="#install">
            {t('hero.download', { version: VERSION })}
          </a>
          <a className={css.secondary} href={links.repo}>
            {t('hero.source')}
          </a>
          <span className={css.platforms}>{t('hero.platforms')}</span>
        </div>
      </header>
      <div className={css.after}>
        <Terminal
          label={t('terminal.label')}
          lines={[
            {
              command: (
                <>
                  cargo llvm-cov --lcov --output-path <span className={file}>lcov.info</span>
                </>
              ),
            },
            {
              command: (
                <>
                  coviz --input <span className={file}>lcov.info</span> --open
                </>
              ),
            },
          ]}
        />
        <DirPreview />
      </div>
    </Container>
  );
};
