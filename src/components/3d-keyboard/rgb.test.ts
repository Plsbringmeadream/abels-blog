import { describe, expect, it } from 'vitest';

import type { RgbMode } from './keyboard-state';
import { rgbForKey } from './rgb';

const options = (
  mode: RgbMode,
  overrides: Partial<Parameters<typeof rgbForKey>[1]> = {},
): Parameters<typeof rgbForKey>[1] => ({
  enabled: true,
  mode,
  brightness: 1,
  time: 0,
  pulse: null,
  ...overrides,
});

describe('rgbForKey', () => {
  it('returns black when RGB is disabled', () => {
    expect(rgbForKey({ x: 3, z: -2 }, options('rainbow', { enabled: false }))).toBe('#000000');
  });

  it.each(['static', 'rainbow'] as const)('%s returns deterministic six-digit hex colors', (mode) => {
    const input = options(mode, { time: 1.25 });
    const first = rgbForKey({ x: 4, z: 2 }, input);

    expect(first).toMatch(/^#[0-9a-f]{6}$/);
    expect(rgbForKey({ x: 4, z: 2 }, input)).toBe(first);
  });

  it('gives ripple keys near and far from the pulse different colors', () => {
    const input = options('ripple', { time: 0, pulse: { x: 0, z: 0, startedAt: 0 } });

    expect(rgbForKey({ x: 0, z: 0 }, input)).not.toBe(rgbForKey({ x: 10, z: 10 }, input));
  });

  it('applies brightness to the resulting color', () => {
    const key = { x: 2, z: 1 };

    expect(rgbForKey(key, options('static', { brightness: 0.25 }))).not.toBe(
      rgbForKey(key, options('static', { brightness: 1 })),
    );
  });

  it('clamps brightness below zero to black', () => {
    expect(rgbForKey({ x: 0, z: 0 }, options('static', { brightness: -1 }))).toBe('#000000');
  });

  it('clamps brightness above one to full brightness', () => {
    const key = { x: 1, z: 1 };

    expect(rgbForKey(key, options('rainbow', { brightness: 2 }))).toBe(
      rgbForKey(key, options('rainbow', { brightness: 1 })),
    );
  });

  it('treats non-finite brightness as zero', () => {
    expect(rgbForKey({ x: 0, z: 0 }, options('static', { brightness: Number.NaN }))).toBe('#000000');
  });

  it('returns valid hex for non-finite coordinates and time', () => {
    expect(
      rgbForKey({ x: Number.NaN, z: Number.POSITIVE_INFINITY }, options('rainbow', { time: Number.NEGATIVE_INFINITY })),
    ).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('reproduces breathing colors at a fixed timestamp', () => {
    const input = options('breathing', { time: 0.625 });

    expect(rgbForKey({ x: -3, z: 2 }, input)).toBe(rgbForKey({ x: -3, z: 2 }, input));
  });

  it('changes breathing colors as time advances', () => {
    const key = { x: -3, z: 2 };

    expect(rgbForKey(key, options('breathing', { time: 0 }))).not.toBe(
      rgbForKey(key, options('breathing', { time: Math.PI / 4 })),
    );
  });

  it('removes the ripple ring after about 1.2 seconds', () => {
    const key = { x: 0, z: 0 };
    const expired = options('ripple', { time: 1.21, pulse: { x: 0, z: 0, startedAt: 0 } });

    expect(rgbForKey(key, expired)).toBe(rgbForKey(key, options('ripple', { time: 1.21 })));
  });

  it('uses startedAt to determine ripple elapsed time', () => {
    const key = { x: 0, z: 0 };

    expect(
      rgbForKey(key, options('ripple', { time: 2, pulse: { x: 0, z: 0, startedAt: 2 } })),
    ).not.toBe(
      rgbForKey(key, options('ripple', { time: 2, pulse: { x: 0, z: 0, startedAt: 0 } })),
    );
  });

  it('treats a pulse with non-finite fields as absent', () => {
    const key = { x: 0, z: 0 };
    const invalid = options('ripple', {
      time: 0,
      pulse: { x: Number.NaN, z: 0, startedAt: 0 },
    });

    expect(rgbForKey(key, invalid)).toBe(rgbForKey(key, options('ripple')));
  });
});
