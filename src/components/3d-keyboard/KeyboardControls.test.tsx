// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import KeyboardControls from './KeyboardControls';
import { KeyboardExperienceProvider, useKeyboardExperience } from './KeyboardExperience';

afterEach(cleanup);

function StateProbe() {
  const { state } = useKeyboardExperience();
  return <output data-testid="state">{`${state.enabled}|${state.mode}|${state.brightness}`}</output>;
}

function renderControls() {
  return render(
    <KeyboardExperienceProvider>
      <KeyboardControls />
      <StateProbe />
    </KeyboardExperienceProvider>,
  );
}

describe('KeyboardControls', () => {
  it('exposes RGB power and the four selectable modes', () => {
    renderControls();
    expect(screen.getByRole('group', { name: 'RGB mode' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'RGB power' }).getAttribute('aria-pressed')).toBe('true');
    for (const mode of ['static', 'breathing', 'rainbow', 'ripple']) {
      expect(screen.getByRole('button', { name: mode }).getAttribute('aria-pressed')).toBe(
        mode === 'static' ? 'true' : 'false',
      );
    }
  });

  it('dispatches power and mode changes', () => {
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: 'RGB power' }));
    fireEvent.click(screen.getByRole('button', { name: 'rainbow' }));
    expect(screen.getByTestId('state').textContent).toBe('false|rainbow|1');
  });

  it('exposes a bounded brightness slider and dispatches its change', () => {
    renderControls();
    const slider = screen.getByRole('slider', { name: 'RGB brightness' });
    expect(slider.getAttribute('min')).toBe('10');
    expect(slider.getAttribute('max')).toBe('100');
    fireEvent.change(slider, { target: { value: '40' } });
    expect(screen.getByTestId('state').textContent).toBe('true|static|0.4');
  });

  it('keeps keyboard shortcut help in an accessible disclosure', () => {
    renderControls();
    const help = screen.getByText('Shortcuts').closest('details');
    expect(help).toBeTruthy();
    expect(help?.hasAttribute('open')).toBe(false);
    expect(help?.textContent).toMatch(/Caps \+ arrows/i);
    expect(help?.textContent).toMatch(/Space/i);
    fireEvent.click(screen.getByText('Shortcuts'));
    expect(help?.hasAttribute('open')).toBe(true);
  });

  it('uses the compact floating toolbar structure instead of a card', () => {
    const { container } = renderControls();
    const toolbar = screen.getByRole('group', { name: 'Keyboard lighting controls' });

    expect(toolbar.classList.contains('keyboard-controls--toolbar')).toBe(true);
    expect(container.querySelector('.keyboard-controls__hint')).toBeNull();
    expect(container.querySelector('.keyboard-controls__main')).toBeTruthy();
  });
});
