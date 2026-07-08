// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KeyboardExperienceProvider, useKeyboardExperience } from './KeyboardExperience';

const originalVisibilityStateDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');

function restoreVisibilityState() {
  if (originalVisibilityStateDescriptor) {
    Object.defineProperty(document, 'visibilityState', originalVisibilityStateDescriptor);
  } else {
    delete (document as Document & { visibilityState?: DocumentVisibilityState }).visibilityState;
  }
}

afterEach(() => {
  cleanup();
  restoreVisibilityState();
  vi.restoreAllMocks();
});

function StateProbe() {
  const { state, press, release } = useKeyboardExperience();
  return (
    <div>
      <output data-testid="pressed">{[...state.pressed].join(',')}</output>
      <output data-testid="pulse">{state.pulse ? `${state.pulse.code}:${state.pulse.sequence}` : ''}</output>
      <output data-testid="mode">{state.mode}</output>
      <output data-testid="brightness">{state.brightness}</output>
      <output data-testid="enabled">{String(state.enabled)}</output>
      <button onClick={() => press('NotAKey')}>bad press</button>
      <button onClick={() => release('NotAKey')}>bad release</button>
    </div>
  );
}

const renderProvider = () => render(<KeyboardExperienceProvider><StateProbe /></KeyboardExperienceProvider>);

describe('KeyboardExperienceProvider', () => {
  it('presses and releases a mapped key from window events', () => {
    renderProvider();
    fireEvent.keyDown(window, { code: 'KeyA' });
    expect(screen.getByTestId('pressed').textContent).toBe('KeyA');
    fireEvent.keyUp(window, { code: 'KeyA' });
    expect(screen.getByTestId('pressed').textContent).toBe('');
  });

  it('ignores unknown window and public method codes', () => {
    renderProvider();
    fireEvent.keyDown(window, { code: 'NotAKey' });
    fireEvent.click(screen.getByText('bad press'));
    fireEvent.click(screen.getByText('bad release'));
    expect(screen.getByTestId('pressed').textContent).toBe('');
    expect(screen.getByTestId('pulse').textContent).toBe('');
  });

  it('keeps repeated keydown idempotent without advancing the pulse', () => {
    renderProvider();
    fireEvent.keyDown(window, { code: 'KeyA' });
    fireEvent.keyDown(window, { code: 'KeyA', repeat: true });
    expect(screen.getByTestId('pressed').textContent).toBe('KeyA');
    expect(screen.getByTestId('pulse').textContent).toBe('KeyA:1');
    fireEvent.keyDown(window, { code: 'KeyB' });
    expect(screen.getByTestId('pulse').textContent).toBe('KeyB:2');
  });

  it('clears pressed keys on blur', () => {
    renderProvider();
    fireEvent.keyDown(window, { code: 'KeyA' });
    fireEvent.blur(window);
    expect(screen.getByTestId('pressed').textContent).toBe('');
  });

  it('clears pressed keys when the document becomes hidden', () => {
    renderProvider();
    fireEvent.keyDown(window, { code: 'KeyA' });
    try {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      fireEvent(document, new Event('visibilitychange'));
      expect(screen.getByTestId('pressed').textContent).toBe('');
    } finally {
      restoreVisibilityState();
    }
  });

  it('uses held CapsLock as an Fn surrogate for mode, brightness, and RGB shortcuts', () => {
    renderProvider();
    fireEvent.keyDown(window, { code: 'CapsLock' });
    expect(screen.getByTestId('pressed').textContent).toBe('CapsLock');

    const right = new KeyboardEvent('keydown', { code: 'ArrowRight', cancelable: true });
    fireEvent(window, right);
    expect(right.defaultPrevented).toBe(true);
    expect(screen.getByTestId('mode').textContent).toBe('breathing');
    expect(screen.getByTestId('pressed').textContent).toBe('CapsLock');

    fireEvent.keyDown(window, { code: 'ArrowLeft' });
    expect(screen.getByTestId('mode').textContent).toBe('static');
    const down = new KeyboardEvent('keydown', { code: 'ArrowDown', cancelable: true });
    fireEvent(window, down);
    expect(down.defaultPrevented).toBe(true);
    expect(screen.getByTestId('brightness').textContent).toBe('0.9');
    fireEvent.keyDown(window, { code: 'ArrowUp' });
    expect(screen.getByTestId('brightness').textContent).toBe('1');
    const space = new KeyboardEvent('keydown', { code: 'Space', cancelable: true });
    fireEvent(window, space);
    expect(space.defaultPrevented).toBe(true);
    expect(screen.getByTestId('enabled').textContent).toBe('false');

    fireEvent.keyUp(window, { code: 'CapsLock' });
    expect(screen.getByTestId('pressed').textContent).toBe('');
    fireEvent.keyDown(window, { code: 'ArrowRight' });
    expect(screen.getByTestId('mode').textContent).toBe('static');
    expect(screen.getByTestId('pressed').textContent).toBe('ArrowRight');
    fireEvent.keyUp(window, { code: 'ArrowRight' });
    expect(screen.getByTestId('pressed').textContent).toBe('');
  });

  it('installs one global adapter and removes every listener on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const documentRemove = vi.spyOn(document, 'removeEventListener');
    const view = renderProvider();

    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
    expect(add.mock.calls.filter(([type]) => type === 'keyup')).toHaveLength(1);
    view.unmount();

    expect(remove.mock.calls.some(([type]) => type === 'keydown')).toBe(true);
    expect(remove.mock.calls.some(([type]) => type === 'keyup')).toBe(true);
    expect(remove.mock.calls.some(([type]) => type === 'blur')).toBe(true);
    expect(documentRemove.mock.calls.some(([type]) => type === 'visibilitychange')).toBe(true);
    fireEvent.keyDown(window, { code: 'KeyA' });
    add.mockRestore();
    remove.mockRestore();
    documentRemove.mockRestore();
  });
});

describe('useKeyboardExperience', () => {
  it('throws a clear error outside its provider', () => {
    expect(() => renderHook(() => useKeyboardExperience())).toThrow(
      'useKeyboardExperience must be used within KeyboardExperienceProvider',
    );
  });

  it('exposes dispatch and validated press/release methods', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <KeyboardExperienceProvider>{children}</KeyboardExperienceProvider>
    );
    const { result } = renderHook(() => useKeyboardExperience(), { wrapper });
    act(() => result.current.press('KeyA'));
    expect([...result.current.state.pressed]).toEqual(['KeyA']);
    act(() => result.current.release('KeyA'));
    expect(result.current.state.pressed.size).toBe(0);
    act(() => result.current.dispatch({ type: 'next-mode' }));
    expect(result.current.state.mode).toBe('breathing');
  });
});
