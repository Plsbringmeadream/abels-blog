import { PRODUCT_SHOT } from './keyboard-product-shot';
export { KEYBOARD_CASE_WIDTH, KEYBOARD_PLATE_WIDTH } from './keyboard-geometry';

export interface KeyDef {
  readonly code: string;
  readonly label: string;
  readonly x: number;
  readonly z: number;
  readonly w?: number;
  readonly d?: number;
  readonly color?: string;
  readonly row?: number;
}

const { whiteCap, grayCap, redAccent } = PRODUCT_SHOT.palette;

export const KEYCAP_FOOTPRINT_SCALE = 0.88;

export const KEYS = [
  { code: 'Escape', label: 'Esc', x: -6.8, z: -2.4, w: 1.2, color: redAccent, row: 1 },
  { code: 'Digit1', label: '1', x: -5.3, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Digit2', label: '2', x: -4.3, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Digit3', label: '3', x: -3.3, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Digit4', label: '4', x: -2.3, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Digit5', label: '5', x: -1.3, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Digit6', label: '6', x: -0.3, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Digit7', label: '7', x: 0.7, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Digit8', label: '8', x: 1.7, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Digit9', label: '9', x: 2.7, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Digit0', label: '0', x: 3.7, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Minus', label: '-', x: 4.7, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Equal', label: '=', x: 5.7, z: -2.4, color: whiteCap, row: 1 },
  { code: 'Backspace', label: 'Bksp', x: 7.0, z: -2.4, w: 1.6, color: grayCap, row: 1 },

  { code: 'Tab', label: 'Tab', x: -6.65, z: -1.2, w: 1.4, color: grayCap, row: 2 },
  ...'QWERTYUIOP'.split('').map((label, index) => ({ code: `Key${label}`, label, x: -4.95 + index, z: -1.2, color: whiteCap, row: 2 })),
  { code: 'BracketLeft', label: '[', x: 5.05, z: -1.2, color: whiteCap, row: 2 },
  { code: 'BracketRight', label: ']', x: 6.05, z: -1.2, color: whiteCap, row: 2 },
  { code: 'Backslash', label: '\\', x: 7.15, z: -1.2, w: 1.3, color: grayCap, row: 2 },

  { code: 'CapsLock', label: 'Caps', x: -6.75, z: 0, w: 1.6, color: grayCap, row: 3 },
  ...'ASDFGHJKL'.split('').map((label, index) => ({ code: `Key${label}`, label, x: -4.85 + index, z: 0, color: whiteCap, row: 3 })),
  { code: 'Semicolon', label: ';', x: 4.15, z: 0, color: whiteCap, row: 3 },
  { code: 'Quote', label: "'", x: 5.15, z: 0, color: whiteCap, row: 3 },
  { code: 'Enter', label: 'Enter', x: 6.6, z: 0, w: 2.0, color: redAccent, row: 3 },

  { code: 'ShiftLeft', label: 'Shift', x: -7.0, z: 1.2, w: 2.2, color: grayCap, row: 4 },
  ...'ZXCVBNM'.split('').map((label, index) => ({ code: `Key${label}`, label, x: -4.5 + index, z: 1.2, color: whiteCap, row: 4 })),
  { code: 'Comma', label: ',', x: 2.5, z: 1.2, color: whiteCap, row: 4 },
  { code: 'Period', label: '.', x: 3.5, z: 1.2, color: whiteCap, row: 4 },
  { code: 'Slash', label: '/', x: 4.5, z: 1.2, color: whiteCap, row: 4 },
  { code: 'ShiftRight', label: 'Shift', x: 6.1, z: 1.2, w: 2.4, color: grayCap, row: 4 },

  { code: 'ControlLeft', label: 'Ctrl', x: -6.8, z: 2.4, w: 1.3, color: grayCap, row: 5 },
  { code: 'MetaLeft', label: 'Win', x: -5.3, z: 2.4, w: 1.3, color: grayCap, row: 5 },
  { code: 'AltLeft', label: 'Alt', x: -3.8, z: 2.4, w: 1.3, color: grayCap, row: 5 },
  { code: 'Space', label: '', x: 0, z: 2.4, w: 5.6, color: whiteCap, row: 5 },
  { code: 'AltRight', label: 'Alt', x: 4.3, z: 2.4, w: 1.3, color: grayCap, row: 5 },
  { code: 'MetaRight', label: 'Win', x: 5.8, z: 2.4, w: 1.3, color: grayCap, row: 5 },
  { code: 'ControlRight', label: 'Ctrl', x: 7.3, z: 2.4, w: 1.3, color: grayCap, row: 5 },
] as const satisfies readonly KeyDef[];

export const ARROWS = [
  { code: 'ArrowUp', label: '↑', x: 8.25, z: 0.2, color: grayCap, row: 3 },
  { code: 'ArrowLeft', label: '←', x: 7.0, z: 1.4, color: grayCap, row: 4 },
  { code: 'ArrowDown', label: '↓', x: 8.25, z: 1.4, color: grayCap, row: 4 },
  { code: 'ArrowRight', label: '→', x: 9.5, z: 1.4, color: grayCap, row: 4 },
] as const satisfies readonly KeyDef[];

export const KEY_BY_CODE: ReadonlyMap<string, Readonly<KeyDef>> = new Map(
  [...KEYS, ...ARROWS].map((key) => [key.code, key]),
);
