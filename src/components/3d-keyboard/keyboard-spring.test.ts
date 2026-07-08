import { describe, expect, it } from 'vitest';

import { keySpringIsMoving, stepKeySpring, stepKeySpringInPlace } from './keyboard-spring';

describe('stepKeySpring', () => {
  it('moves toward negative travel while pressed', () => {
    let state = { travel: 0, velocity: 0 };
    for (let i = 0; i < 12; i += 1) state = stepKeySpring(state, true, 1 / 60);
    expect(state.travel).toBeLessThan(-0.04);
  });

  it('returns toward zero after release', () => {
    let state = { travel: -0.055, velocity: 0 };
    for (let i = 0; i < 90; i += 1) state = stepKeySpring(state, false, 1 / 60);
    expect(Math.abs(state.travel)).toBeLessThan(0.001);
  });

  it('clamps large frame deltas to the same safe step', () => {
    const state = { travel: -0.02, velocity: -0.3 };
    expect(stepKeySpring(state, true, 10)).toEqual(stepKeySpring(state, true, 1 / 30));
  });

  it('always returns finite values for invalid input', () => {
    const next = stepKeySpring({ travel: Number.NaN, velocity: Number.POSITIVE_INFINITY }, true, Number.NaN);
    expect(Number.isFinite(next.travel)).toBe(true);
    expect(Number.isFinite(next.velocity)).toBe(true);
  });

  it('can integrate in place without replacing the state object', () => {
    const state = { travel: 0, velocity: 0 };
    const result = stepKeySpringInPlace(state, true, 10);
    expect(result).toBe(state);
    expect(state.travel).toBeLessThan(0);
    expect(Number.isFinite(state.velocity)).toBe(true);
  });

  it('reports whether another demand frame is needed', () => {
    expect(keySpringIsMoving({ travel: 0, velocity: 0 }, false)).toBe(false);
    expect(keySpringIsMoving({ travel: -0.055, velocity: 0 }, true)).toBe(false);
    expect(keySpringIsMoving({ travel: -0.02, velocity: 0 }, true)).toBe(true);
    expect(keySpringIsMoving({ travel: 0, velocity: 0.01 }, false)).toBe(true);
  });
});
