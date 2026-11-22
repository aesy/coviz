import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { address, chrome, example, frame, light } from '@/components/shared/BrowserFrame.css';

type Props = { url: string; label: string; children: ReactNode };

export const BrowserFrame: FC<Props> = ({ url, label, children }) => {
  const { t } = useTranslation();

  return (
    <figure className={frame} aria-label={label}>
      <div className={chrome}>
        <span className={light} />
        <span className={light} />
        <span className={light} />
        <span className={address}>{url}</span>
        <span className={example}>{t('preview.example')}</span>
      </div>
      {children}
    </figure>
  );
};
