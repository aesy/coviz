import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@mantine/core';
import { footer, link, links as linkList, row } from '@/components/Footer/Footer.css';
import { CONTAINER, wrap } from '@/components/shared/shared.css';
import { links, VERSION } from '@/lib/links';

const LINKS = [
  { href: links.repo, label: 'footer.github' },
  { href: links.releases, label: 'footer.releases' },
  { href: links.issues, label: 'footer.issues' },
] as const;

export const Footer: FC = () => {
  const { t } = useTranslation();

  return (
    <footer className={footer}>
      <Container size={CONTAINER} className={`${wrap} ${row}`}>
        <span>{t('footer.license', { version: VERSION })}</span>
        <span className={linkList}>
          {LINKS.map(item => (
            <a key={item.href} className={link} href={item.href}>
              {t(item.label)}
            </a>
          ))}
        </span>
      </Container>
    </footer>
  );
};
