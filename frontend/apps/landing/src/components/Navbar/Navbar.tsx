import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@mantine/core';
import {
  brand,
  brandAccent,
  link,
  links as linkList,
  nav,
  sectionLink,
} from '@/components/Navbar/Navbar.css';
import { CONTAINER, wrap } from '@/components/shared/shared.css';
import { links } from '@/lib/links';

const SECTIONS = [
  { id: 'formats', label: 'nav.formats' },
  { id: 'output', label: 'nav.output' },
] as const;

export const Navbar: FC = () => {
  const { t } = useTranslation();

  return (
    <header>
      <Container size={CONTAINER} className={wrap}>
        <nav aria-label={t('nav.label')} className={nav}>
          <a className={brand} href="#top">
            co<b className={brandAccent}>viz</b>
          </a>
          <div className={linkList}>
            {SECTIONS.map(({ id, label }) => (
              <a key={id} className={`${link} ${sectionLink}`} href={`#${id}`}>
                {t(label)}
              </a>
            ))}
            <a className={link} href="#install">
              {t('nav.install')}
            </a>
            <a className={link} href={links.repo}>
              {t('nav.github')}
            </a>
          </div>
        </nav>
      </Container>
    </header>
  );
};
