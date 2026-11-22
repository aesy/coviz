import type { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Container } from '@mantine/core';
import { files, format, grid, name, tools } from '@/components/Formats/Formats.css';
import {
  CONTAINER,
  eyebrow,
  heading,
  inlineCode,
  section,
  sub,
  wrap,
} from '@/components/shared/shared.css';

const FORMATS = [
  { id: 'lcov', name: 'LCOV', files: 'lcov.info, *.lcov' },
  { id: 'jacoco', name: 'JaCoCo XML', files: 'jacoco.xml' },
  { id: 'cobertura', name: 'Cobertura XML', files: 'coverage.xml' },
  { id: 'llvm', name: 'LLVM JSON', files: 'llvm-cov export' },
] as const;

export const Formats: FC = () => {
  const { t } = useTranslation();

  return (
    <section id="formats" className={section}>
      <Container size={CONTAINER} className={wrap}>
        <p className={eyebrow}>{t('formats.eyebrow')}</p>
        <h2 className={heading}>{t('formats.title')}</h2>
        <p className={sub}>
          <Trans i18nKey="formats.body" components={{ code: <code className={inlineCode} /> }} />
        </p>
        <div className={grid}>
          {FORMATS.map(item => (
            <div key={item.id} className={format}>
              <h3 className={name}>{item.name}</h3>
              <code className={files}>{item.files}</code>
              <p className={tools}>{t(`formats.tools.${item.id}`)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
