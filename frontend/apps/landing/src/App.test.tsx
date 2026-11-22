import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import App from '@/App';
import { initI18n } from '@/i18n';
import { theme } from '@/theme/theme';

const renderApp = () =>
  render(
    <MantineProvider theme={theme} defaultColorScheme="light" env="test">
      <App />
    </MantineProvider>
  );

const tree = () => within(screen.getByRole('figure', { name: /directory view/ }));

beforeAll(() => initI18n());

describe('App', () => {
  it('collapses and expands a folder in the report preview', async () => {
    const user = userEvent.setup();
    renderApp();
    expect(tree().getByText('lcov.rs')).toBeInTheDocument();

    await user.click(tree().getByRole('button', { name: 'Toggle input' }));

    expect(tree().queryByText('lcov.rs')).not.toBeInTheDocument();
    expect(tree().getByRole('button', { name: 'Toggle input' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    await user.click(tree().getByRole('button', { name: 'Toggle input' }));

    expect(tree().getByText('lcov.rs')).toBeInTheDocument();
  });

  it('collapses and expands everything from the toolbar', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(tree().getByRole('button', { name: 'Collapse all' }));

    expect(tree().getByRole('button', { name: 'Toggle src' })).toBeInTheDocument();
    expect(tree().queryByRole('button', { name: 'Toggle input' })).not.toBeInTheDocument();
    expect(tree().queryByText('main.rs')).not.toBeInTheDocument();

    await user.click(tree().getByRole('button', { name: 'Expand all' }));

    expect(tree().getByText('llvm_json.rs')).toBeInTheDocument();
    expect(tree().getByText('main.rs')).toBeInTheDocument();
  });

  it('cycles the color scheme like the report does', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(tree().getByRole('button', { name: /light/ }));

    expect(tree().getByRole('button', { name: /dark/ })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark');
  });
});
