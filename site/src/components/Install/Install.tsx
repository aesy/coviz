import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@mantine/core';
import { grid, os, platform } from '@/components/Install/Install.css';
import { CONTAINER, eyebrow, heading, section, sub, wrap } from '@/components/shared/shared.css';
import { Terminal, type TerminalLine } from '@/components/shared/Terminal';
import { links } from '@/lib/links';

const PLATFORMS: { id: string; prompt: string; lines: TerminalLine[] }[] = [
  {
    id: 'linux',
    prompt: '$',
    lines: [
      { command: `curl -L ${links.linuxBinary} -o coviz` },
      { command: 'chmod +x coviz' },
      { command: 'sudo mv coviz /usr/local/bin' },
    ],
  },
  {
    id: 'windows',
    prompt: '>',
    lines: [{ command: `curl -L ${links.windowsBinary} -o coviz.exe` }],
  },
  {
    id: 'source',
    prompt: '$',
    lines: [{ command: 'cargo build --release' }, { comment: '# target/release/coviz' }],
  },
];

export const Install: FC = () => {
  const { t } = useTranslation();

  return (
    <section id="install" className={section}>
      <Container size={CONTAINER} className={wrap}>
        <p className={eyebrow}>{t('install.eyebrow')}</p>
        <h2 className={heading}>{t('install.title')}</h2>
        <p className={sub}>{t('install.body')}</p>
        <div className={grid}>
          {PLATFORMS.map(item => (
            <div key={item.id} className={platform}>
              <p className={os}>{t(`install.${item.id}`)}</p>
              <Terminal promptSign={item.prompt} lines={item.lines} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
