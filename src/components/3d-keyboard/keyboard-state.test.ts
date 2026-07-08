import { describe, expect, it } from 'vitest';

import { createKeyboardState, keyboardReducer } from './keyboard-state';

describe('keyboardReducer', () => {
  it('keeps repeated presses idempotent', () => {
    const once = keyboardReducer(createKeyboardState(), { type: 'press', code: 'KeyA' });
    const twice = keyboardReducer(once, { type: 'press', code: 'KeyA' });

    expect([...twice.pressed]).toEqual(['KeyA']);
    expect(twice.pulse).toEqual({ code: 'KeyA', sequence: 1 });
    expect(twice).toBe(once);
  });

  it('does not mutate the original pressed set', () => {
    const initial = createKeyboardState();
    const pressed = keyboardReducer(initial, { type: 'press', code: 'KeyA' });

    expect(initial.pressed.size).toBe(0);
    expect(pressed.pressed).not.toBe(initial.pressed);
  });

  it('only advances the pulse for a newly pressed key', () => {
    const first = keyboardReducer(createKeyboardState(), { type: 'press', code: 'KeyA' });
    const repeated = keyboardReducer(first, { type: 'press', code: 'KeyA' });
    const second = keyboardReducer(repeated, { type: 'press', code: 'KeyB' });

    expect(repeated.pulse?.sequence).toBe(1);
    expect(second.pulse).toEqual({ code: 'KeyB', sequence: 2 });
  });

  it('releases a pressed key', () => {
    const pressed = keyboardReducer(createKeyboardState(), { type: 'press', code: 'KeyA' });
    const released = keyboardReducer(pressed, { type: 'release', code: 'KeyA' });

    expect(released.pressed.size).toBe(0);
  });

  it('clears all pressed keys', () => {
    const pressed = keyboardReducer(createKeyboardState(), { type: 'press', code: 'KeyA' });
    const cleared = keyboardReducer(pressed, { type: 'clear' });

    expect(cleared.pressed.size).toBe(0);
  });

  it('advances from static to breathing', () => {
    const next = keyboardReducer(createKeyboardState(), { type: 'next-mode' });

    expect(next.mode).toBe('breathing');
  });

  it('cycles modes in both directions', () => {
    let state = createKeyboardState();
    for (let i = 0; i < 4; i += 1) state = keyboardReducer(state, { type: 'next-mode' });
    expect(state.mode).toBe('static');

    state = keyboardReducer(state, { type: 'previous-mode' });
    expect(state.mode).toBe('ripple');
  });

  it('sets a specific mode', () => {
    const state = keyboardReducer(createKeyboardState(), { type: 'set-mode', mode: 'rainbow' });

    expect(state.mode).toBe('rainbow');
  });

  it('clamps repeated brightness reductions at 0.1', () => {
    let state = createKeyboardState();
    for (let i = 0; i < 20; i += 1) {
      state = keyboardReducer(state, { type: 'brightness', delta: -0.1 });
    }

    expect(state.brightness).toBe(0.1);
  });

  it('clamps brightness increases at 1', () => {
    const state = keyboardReducer(createKeyboardState(), { type: 'brightness', delta: 0.5 });

    expect(state.brightness).toBe(1);
  });

  it('toggles RGB off', () => {
    const disabled = keyboardReducer(createKeyboardState(), { type: 'toggle-rgb' });

    expect(disabled.enabled).toBe(false);
  });
});
