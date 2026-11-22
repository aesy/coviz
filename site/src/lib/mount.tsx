import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/ibm-plex-sans';
import '@fontsource-variable/jetbrains-mono';
import '@mantine/core/styles/global.css';
import '@mantine/core/styles/baseline.css';
import '@mantine/core/styles/default-css-variables.css';
import '@mantine/core/styles/Container.css';
import '@/theme/colors.css';
import '@/theme/global.css';
import { initI18n } from '@/i18n';
import { theme } from '@/theme/theme';

export async function mount(page: ReactNode) {
  await initI18n();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        {page}
      </MantineProvider>
    </StrictMode>
  );
}
