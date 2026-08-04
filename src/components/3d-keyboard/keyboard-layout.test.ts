import { describe, expect, it } from 'vitest';

import {
  ALL_KEYS,
  ARROWS,
  KEYCAP_FOOTPRINT_SCALE,
  keycapFootprint,
  KEYBOARD_CASE_WIDTH,
  KEYBOARD_PLATE_WIDTH,
  KEYBOARD_ROW_Z,
  KEYS,
  KEY_BY_CODE,
  NAVIGATION_KEYS,
} from './keyboard-layout';
import { PRODUCT_SHOT } from './keyboard-product-shot';

describe('photo-matched TKL keyboard layout', () => {
  it('models the complete 87-key TKL plus the photographed F13 artisan', () => {
    expect(ALL_KEYS).toHaveLength(88);
    expect(KEYS).toHaveLength(75);
    expect(NAVIGATION_KEYS).toHaveLength(9);
    expect(ARROWS).toHaveLength(4);
    expect(KEY_BY_CODE.size).toBe(88);
  });

  it('assigns a unique event code and keeps the photographed clusters', () => {
    const codes = ALL_KEYS.map((key) => key.code);

    expect(new Set(codes).size).toBe(codes.length);
    [
      'Escape',
      'F1',
      'F12',
      'F13',
      'Backquote',
      'Backspace',
      'Enter',
      'Space',
      'PrintScreen',
      'PageDown',
      'ArrowUp',
      'ArrowRight',
    ].forEach((code) => expect(KEY_BY_CODE.has(code), code).toBe(true));
  });

  it('captures every identity-defining custom key from the reference photos', () => {
    expect(KEY_BY_CODE.get('Escape')?.variant).toBe('creature');
    expect(KEY_BY_CODE.get('F13')?.variant).toBe('gamepad');
    expect(['KeyQ', 'KeyW', 'KeyE', 'KeyR'].map((code) => KEY_BY_CODE.get(code)?.variant)).toEqual([
      'anime-red',
      'anime-blue',
      'anime-purple',
      'anime-mint',
    ]);
    expect(KEY_BY_CODE.get('Enter')?.variant).toBe('etched-enter');
    expect(KEY_BY_CODE.get('Space')?.variant).toBe('space-art');
  });

  it('uses the black and graphite cap palette from the photographed board', () => {
    const allowedColors = new Set([
      PRODUCT_SHOT.palette.blackCap,
      PRODUCT_SHOT.palette.graphiteCap,
    ]);

    expect(ALL_KEYS.every((key) => 'color' in key && allowedColors.has(key.color))).toBe(true);
  });

  it('keeps every key inside the wider TKL case and plate footprint', () => {
    expect(KEYBOARD_CASE_WIDTH).toBe(20.35);
    expect(KEYBOARD_PLATE_WIDTH).toBe(19.95);

    for (const key of ALL_KEYS) {
      const halfWidth = keycapFootprint('w' in key ? key.w : 1) / 2;
      expect(key.x - halfWidth, `${key.code} left edge`).toBeGreaterThan(-KEYBOARD_PLATE_WIDTH / 2);
      expect(key.x + halfWidth, `${key.code} right edge`).toBeLessThan(KEYBOARD_PLATE_WIDTH / 2);
    }
  });

  it('uses photographed Cherry spacing: full lower skirts on a 1U main-row pitch', () => {
    expect(KEYCAP_FOOTPRINT_SCALE).toBeCloseTo(0.95, 8);
    expect(keycapFootprint(1)).toBeCloseTo(0.95, 8);
    expect(keycapFootprint(1.25)).toBeCloseTo(1.2, 8);
    expect(keycapFootprint(2.25)).toBeCloseTo(2.2, 8);
    expect(keycapFootprint(6.25)).toBeCloseTo(6.2, 8);
    expect(KEYBOARD_ROW_Z.number - KEYBOARD_ROW_Z.function).toBeCloseTo(1.2, 8);
    expect(KEYBOARD_ROW_Z.qwerty - KEYBOARD_ROW_Z.number).toBeCloseTo(1, 8);
    expect(KEYBOARD_ROW_Z.home - KEYBOARD_ROW_Z.qwerty).toBeCloseTo(1, 8);
    expect(KEYBOARD_ROW_Z.shift - KEYBOARD_ROW_Z.home).toBeCloseTo(1, 8);
    expect(KEYBOARD_ROW_Z.bottom - KEYBOARD_ROW_Z.shift).toBeCloseTo(1, 8);
  });

  it('matches the CAD widths for the right-side bottom-row modifiers', () => {
    expect(KEY_BY_CODE.get('ShiftRight')).toMatchObject({ x: 4.125, w: 2.75 });
    expect(KEY_BY_CODE.get('ControlRight')).toMatchObject({ x: 4.875, w: 1.25 });
  });

  it('does not overlap keys sharing the same physical z lane', () => {
    const lanes = Map.groupBy(ALL_KEYS, (key) => key.z);

    for (const [z, lane] of lanes) {
      const sorted = lane.toSorted((a, b) => a.x - b.x);
      for (let index = 1; index < sorted.length; index += 1) {
        const left = sorted[index - 1];
        const right = sorted[index];
        const leftEdge = left.x + keycapFootprint('w' in left ? left.w : 1) / 2;
        const rightEdge = right.x - keycapFootprint('w' in right ? right.w : 1) / 2;
        expect(rightEdge + Number.EPSILON * 4, `${left.code}/${right.code} overlap at z=${z}`)
          .toBeGreaterThanOrEqual(leftEdge);
      }
    }
  });
});
