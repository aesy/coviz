import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@mantine/core';
import { factBody, facts, factTitle, flag, layout } from '@/components/Output/Output.css';
import { FilePreview } from '@/components/Report/FilePreview';
import { CONTAINER, eyebrow, heading, section, sub, wrap } from '@/components/shared/shared.css';

const FACTS = [
  { id: 'open', flag: '--open' },
  { id: 'artifact', flag: '--output report.html' },
  { id: 'link', flag: '#/src/input/format.rs' },
] as const;

export const Output: FC = () => {
  const { t } = useTranslation();

  return (
    <section id="output" className={section}>
      <Container size={CONTAINER} className={`${wrap} ${layout}`}>
        <div>
          <p className={eyebrow}>{t('output.eyebrow')}</p>
          <h2 className={heading}>{t('output.title')}</h2>
          <p className={sub}>{t('output.body')}</p>
          <div className={facts}>
            {FACTS.map(fact => (
              <div key={fact.id}>
                <code className={flag}>{fact.flag}</code>
                <h3 className={factTitle}>{t(`output.facts.${fact.id}.title`)}</h3>
                <p className={factBody}>{t(`output.facts.${fact.id}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
        <FilePreview />
      </Container>
    </section>
  );
};
