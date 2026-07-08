import { describe, expect, it } from 'vitest';

import { keyboardAnimationTime, keyboardFrameloop, keyboardShouldAutoRotate } from './keyboard-render-policy';

describe('keyboard render policy', () => {
  it('renders continuously only for enabled animated RGB modes', () => {
    expect(keyboardFrameloop(true, 'breathing', false, true)).toBe('always');
    expect(keyboardFrameloop(true, 'rainbow', false, true)).toBe('always');
    expect(keyboardFrameloop(true, 'ripple', false, true)).toBe('always');
    expect(keyboardFrameloop(true, 'static', false, true)).toBe('demand');
    expect(keyboardFrameloop(false, 'rainbow', false, true)).toBe('demand');
    expect(keyboardFrameloop(true, 'rainbow', false, false)).toBe('demand');
    for (const mode of ['breathing', 'rainbow', 'ripple'] as const) {
      expect(keyboardFrameloop(true, mode, true, true)).toBe('demand');
    }
  });

  it('auto-rotates only while animated and motion is allowed', () => {
    expect(keyboardShouldAutoRotate(true, 'rainbow', false)).toBe(true);
    expect(keyboardShouldAutoRotate(true, 'static', false)).toBe(false);
    expect(keyboardShouldAutoRotate(false, 'rainbow', false)).toBe(false);
    expect(keyboardShouldAutoRotate(true, 'rainbow', true)).toBe(false);
    expect(keyboardShouldAutoRotate(true, 'rainbow', false, false)).toBe(false);
  });

  it('freezes animation time when reduced motion is requested', () => {
    expect(keyboardAnimationTime(12.5, true)).toBe(0);
    expect(keyboardAnimationTime(12.5, false)).toBe(12.5);
    expect(keyboardAnimationTime(12.5, false, false)).toBe(0);
  });
});
