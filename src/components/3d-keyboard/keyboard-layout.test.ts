import { describe, expect, it } from 'vitest';

import {
  ARROWS,
  KEYCAP_FOOTPRINT_SCALE,
  KEYBOARD_CASE_WIDTH,
  KEYBOARD_PLATE_WIDTH,
  KEYS,
  KEY_BY_CODE,
} from './keyboard-layout';
import { PRODUCT_SHOT } from './keyboard-product-shot';

const EXPECTED_LAYOUT = [
  ['Escape', 'Esc', -6.8, -2.4, 1.2, 1],
  ['Digit1', '1', -5.3, -2.4, 1, 1], ['Digit2', '2', -4.3, -2.4, 1, 1],
  ['Digit3', '3', -3.3, -2.4, 1, 1], ['Digit4', '4', -2.3, -2.4, 1, 1],
  ['Digit5', '5', -1.3, -2.4, 1, 1], ['Digit6', '6', -0.3, -2.4, 1, 1],
  ['Digit7', '7', 0.7, -2.4, 1, 1], ['Digit8', '8', 1.7, -2.4, 1, 1],
  ['Digit9', '9', 2.7, -2.4, 1, 1], ['Digit0', '0', 3.7, -2.4, 1, 1],
  ['Minus', '-', 4.7, -2.4, 1, 1], ['Equal', '=', 5.7, -2.4, 1, 1],
  ['Backspace', 'Bksp', 7, -2.4, 1.6, 1],
  ['Tab', 'Tab', -6.65, -1.2, 1.4, 2],
  ['KeyQ', 'Q', -4.95, -1.2, 1, 2], ['KeyW', 'W', -3.95, -1.2, 1, 2],
  ['KeyE', 'E', -2.95, -1.2, 1, 2], ['KeyR', 'R', -1.95, -1.2, 1, 2],
  ['KeyT', 'T', -0.95, -1.2, 1, 2], ['KeyY', 'Y', 0.05, -1.2, 1, 2],
  ['KeyU', 'U', 1.05, -1.2, 1, 2], ['KeyI', 'I', 2.05, -1.2, 1, 2],
  ['KeyO', 'O', 3.05, -1.2, 1, 2], ['KeyP', 'P', 4.05, -1.2, 1, 2],
  ['BracketLeft', '[', 5.05, -1.2, 1, 2], ['BracketRight', ']', 6.05, -1.2, 1, 2],
  ['Backslash', '\\', 7.15, -1.2, 1.3, 2],
  ['CapsLock', 'Caps', -6.75, 0, 1.6, 3],
  ['KeyA', 'A', -4.85, 0, 1, 3], ['KeyS', 'S', -3.85, 0, 1, 3],
  ['KeyD', 'D', -2.85, 0, 1, 3], ['KeyF', 'F', -1.85, 0, 1, 3],
  ['KeyG', 'G', -0.85, 0, 1, 3], ['KeyH', 'H', 0.15, 0, 1, 3],
  ['KeyJ', 'J', 1.15, 0, 1, 3], ['KeyK', 'K', 2.15, 0, 1, 3],
  ['KeyL', 'L', 3.15, 0, 1, 3], ['Semicolon', ';', 4.15, 0, 1, 3],
  ['Quote', "'", 5.15, 0, 1, 3], ['Enter', 'Enter', 6.6, 0, 2, 3],
  ['ShiftLeft', 'Shift', -7, 1.2, 2.2, 4],
  ['KeyZ', 'Z', -4.5, 1.2, 1, 4], ['KeyX', 'X', -3.5, 1.2, 1, 4],
  ['KeyC', 'C', -2.5, 1.2, 1, 4], ['KeyV', 'V', -1.5, 1.2, 1, 4],
  ['KeyB', 'B', -0.5, 1.2, 1, 4], ['KeyN', 'N', 0.5, 1.2, 1, 4],
  ['KeyM', 'M', 1.5, 1.2, 1, 4], ['Comma', ',', 2.5, 1.2, 1, 4],
  ['Period', '.', 3.5, 1.2, 1, 4], ['Slash', '/', 4.5, 1.2, 1, 4],
  ['ShiftRight', 'Shift', 6.1, 1.2, 2.4, 4],
  ['ControlLeft', 'Ctrl', -6.8, 2.4, 1.3, 5], ['MetaLeft', 'Win', -5.3, 2.4, 1.3, 5],
  ['AltLeft', 'Alt', -3.8, 2.4, 1.3, 5], ['Space', '', 0, 2.4, 5.6, 5],
  ['AltRight', 'Alt', 4.3, 2.4, 1.3, 5], ['MetaRight', 'Win', 5.8, 2.4, 1.3, 5],
  ['ControlRight', 'Ctrl', 7.3, 2.4, 1.3, 5],
  ['ArrowUp', '↑', 8.25, 0.2, 1, 3], ['ArrowLeft', '←', 7, 1.4, 1, 4],
  ['ArrowDown', '↓', 8.25, 1.4, 1, 4], ['ArrowRight', '→', 9.5, 1.4, 1, 4],
] as const;

describe('keyboard layout', () => {
  it('assigns a unique event code to every key', () => {
    const codes = [...KEYS, ...ARROWS].map((key) => key.code);

    expect(new Set(codes).size).toBe(codes.length);
    expect(KEY_BY_CODE.size).toBe(codes.length);
  });

  it('preserves the complete 64-key geometry and event mapping', () => {
    const layout = [...KEYS, ...ARROWS].map((key) => [
      key.code,
      key.label,
      Number(key.x.toFixed(2)),
      Number(key.z.toFixed(2)),
      'w' in key ? key.w : 1,
      key.row,
    ]);

    expect(layout).toHaveLength(64);
    expect(layout).toEqual(EXPECTED_LAYOUT);
  });

  it('uses only product-shot cap colors with red Escape and Enter accents', () => {
    const keys = [...KEYS, ...ARROWS];
    const allowedColors = new Set([
      PRODUCT_SHOT.palette.whiteCap,
      PRODUCT_SHOT.palette.grayCap,
      PRODUCT_SHOT.palette.redAccent,
    ]);

    expect(KEY_BY_CODE.get('Escape')?.color).toBe(PRODUCT_SHOT.palette.redAccent);
    expect(KEY_BY_CODE.get('Enter')?.color).toBe(PRODUCT_SHOT.palette.redAccent);
    expect(keys.every((key) => 'color' in key && allowedColors.has(key.color))).toBe(true);
    expect(keys.filter((key) => key.color === PRODUCT_SHOT.palette.redAccent).map((key) => key.code)).toEqual([
      'Escape',
      'Enter',
    ]);
    expect(keys.every((key) => key.row >= 1 && key.row <= 5)).toBe(true);
    expect(keys.every((key) => ('w' in key ? key.w : 1) > 0)).toBe(true);
  });

  it('keeps every key inside the case and plate footprint', () => {
    const keys = [...KEYS, ...ARROWS];

    expect(KEYBOARD_CASE_WIDTH).toBe(20.5);
    expect(KEYBOARD_PLATE_WIDTH).toBeGreaterThanOrEqual(20);
    for (const key of keys) {
      const halfWidth = (('w' in key ? key.w : 1) * KEYCAP_FOOTPRINT_SCALE) / 2;
      expect(key.x - halfWidth, `${key.code} left edge`).toBeGreaterThan(-KEYBOARD_PLATE_WIDTH / 2);
      expect(key.x + halfWidth, `${key.code} right edge`).toBeLessThan(KEYBOARD_PLATE_WIDTH / 2);
      expect(key.x - halfWidth, `${key.code} case left edge`).toBeGreaterThan(-KEYBOARD_CASE_WIDTH / 2);
      expect(key.x + halfWidth, `${key.code} case right edge`).toBeLessThan(KEYBOARD_CASE_WIDTH / 2);
    }
  });

  it('does not overlap keys sharing the same physical z lane', () => {
    const lanes = Map.groupBy([...KEYS, ...ARROWS], (key) => key.z);

    for (const [z, lane] of lanes) {
      const sorted = lane.toSorted((a, b) => a.x - b.x);
      for (let index = 1; index < sorted.length; index += 1) {
        const left = sorted[index - 1];
        const right = sorted[index];
        const leftEdge = left.x + (('w' in left ? left.w : 1) * KEYCAP_FOOTPRINT_SCALE) / 2;
        const rightEdge = right.x - (('w' in right ? right.w : 1) * KEYCAP_FOOTPRINT_SCALE) / 2;
        expect(rightEdge + Number.EPSILON * 4, `${left.code}/${right.code} overlap at z=${z}`).toBeGreaterThanOrEqual(leftEdge);
      }
    }
  });

  it.each(['Space', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'])(
    'contains %s',
    (code) => {
      expect(KEY_BY_CODE.has(code)).toBe(true);
    },
  );
});
