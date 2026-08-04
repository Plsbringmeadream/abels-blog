import { PRODUCT_SHOT } from './keyboard-product-shot';

export { KEYBOARD_CASE_WIDTH, KEYBOARD_PLATE_WIDTH } from './keyboard-geometry';

export type KeyVariant =
  | 'standard'
  | 'creature'
  | 'gamepad'
  | 'anime-red'
  | 'anime-blue'
  | 'anime-purple'
  | 'anime-mint'
  | 'etched-enter'
  | 'space-art';

export interface KeyDef {
  readonly code: string;
  readonly label: string;
  readonly x: number;
  readonly z: number;
  readonly w?: number;
  readonly d?: number;
  readonly color?: string;
  readonly row?: number;
  readonly variant?: KeyVariant;
}

const { blackCap, graphiteCap } = PRODUCT_SHOT.palette;
const alpha = graphiteCap;
const modifier = blackCap;

// The photographed Cherry caps leave a fixed gap between neighbouring skirts.
// Multi-unit keys subtract that same physical gap instead of scaling their
// whole nominal width (a 6.25U spacebar therefore stays almost 6.25U wide).
export const KEYCAP_FOOTPRINT_SCALE = 0.95;

export function keycapFootprint(units: number): number {
  return units - (1 - KEYCAP_FOOTPRINT_SCALE);
}

export const KEYBOARD_ROW_Z = Object.freeze({
  function: -2.8,
  number: -1.6,
  qwerty: -0.6,
  home: 0.4,
  shift: 1.4,
  bottom: 2.4,
});

const functionKeys = [
  { code: 'Escape', label: '', x: -9, z: KEYBOARD_ROW_Z.function, color: modifier, row: 1, variant: 'creature' },
  ...['F1', 'F2', 'F3', 'F4'].map((label, index) => ({
    code: label,
    label,
    x: -7.5 + index,
    z: KEYBOARD_ROW_Z.function,
    color: modifier,
    row: 1,
  })),
  ...['F5', 'F6', 'F7', 'F8'].map((label, index) => ({
    code: label,
    label,
    x: -3 + index,
    z: KEYBOARD_ROW_Z.function,
    color: modifier,
    row: 1,
  })),
  ...['F9', 'F10', 'F11', 'F12'].map((label, index) => ({
    code: label,
    label,
    x: 1.5 + index,
    z: KEYBOARD_ROW_Z.function,
    color: modifier,
    row: 1,
  })),
  { code: 'F13', label: '', x: 5.75, z: KEYBOARD_ROW_Z.function, color: modifier, row: 1, variant: 'gamepad' },
] as const satisfies readonly KeyDef[];

const numberRow = [
  { code: 'Backquote', label: '~\n`', x: -9, z: KEYBOARD_ROW_Z.number, color: modifier, row: 2 },
  ...'1234567890'.split('').map((label, index) => ({
    code: `Digit${label}`,
    label: `${'!@#$%^&*()'[index]}\n${label}`,
    x: -8 + index,
    z: KEYBOARD_ROW_Z.number,
    color: alpha,
    row: 2,
  })),
  { code: 'Minus', label: '_\n-', x: 2, z: KEYBOARD_ROW_Z.number, color: alpha, row: 2 },
  { code: 'Equal', label: '+\n=', x: 3, z: KEYBOARD_ROW_Z.number, color: alpha, row: 2 },
  { code: 'Backspace', label: '← Backspace', x: 4.5, z: KEYBOARD_ROW_Z.number, w: 2, color: modifier, row: 2 },
] as const satisfies readonly KeyDef[];

const qwertyRow = [
  { code: 'Tab', label: 'Tab', x: -8.75, z: KEYBOARD_ROW_Z.qwerty, w: 1.5, color: modifier, row: 3 },
  ...'QWERTYUIOP'.split('').map((label, index) => ({
    code: `Key${label}`,
    label: index < 4 ? '' : label,
    x: -7.5 + index,
    z: KEYBOARD_ROW_Z.qwerty,
    color: alpha,
    row: 3,
    variant: (['anime-red', 'anime-blue', 'anime-purple', 'anime-mint'][index] ??
      'standard') as KeyVariant,
  })),
  { code: 'BracketLeft', label: '{\n[', x: 2.5, z: KEYBOARD_ROW_Z.qwerty, color: alpha, row: 3 },
  { code: 'BracketRight', label: '}\n]', x: 3.5, z: KEYBOARD_ROW_Z.qwerty, color: alpha, row: 3 },
  { code: 'Backslash', label: '|\n\\', x: 4.75, z: KEYBOARD_ROW_Z.qwerty, w: 1.5, color: modifier, row: 3 },
] as const satisfies readonly KeyDef[];

const homeRow = [
  { code: 'CapsLock', label: 'Caps Lock', x: -8.625, z: KEYBOARD_ROW_Z.home, w: 1.75, color: modifier, row: 4 },
  ...'ASDFGHJKL'.split('').map((label, index) => ({
    code: `Key${label}`,
    label,
    x: -7.25 + index,
    z: KEYBOARD_ROW_Z.home,
    color: alpha,
    row: 4,
  })),
  { code: 'Semicolon', label: ':\n;', x: 1.75, z: KEYBOARD_ROW_Z.home, color: alpha, row: 4 },
  { code: 'Quote', label: '"\n\'', x: 2.75, z: KEYBOARD_ROW_Z.home, color: alpha, row: 4 },
  {
    code: 'Enter',
    label: '',
    x: 4.375,
    z: KEYBOARD_ROW_Z.home,
    w: 2.25,
    color: modifier,
    row: 4,
    variant: 'etched-enter',
  },
] as const satisfies readonly KeyDef[];

const shiftRow = [
  { code: 'ShiftLeft', label: '⇧ Shift', x: -8.375, z: KEYBOARD_ROW_Z.shift, w: 2.25, color: modifier, row: 5 },
  ...'ZXCVBNM'.split('').map((label, index) => ({
    code: `Key${label}`,
    label,
    x: -6.75 + index,
    z: KEYBOARD_ROW_Z.shift,
    color: alpha,
    row: 5,
  })),
  { code: 'Comma', label: '<\n,', x: 0.25, z: KEYBOARD_ROW_Z.shift, color: alpha, row: 5 },
  { code: 'Period', label: '>\n.', x: 1.25, z: KEYBOARD_ROW_Z.shift, color: alpha, row: 5 },
  { code: 'Slash', label: '?\n/', x: 2.25, z: KEYBOARD_ROW_Z.shift, color: alpha, row: 5 },
  { code: 'ShiftRight', label: '⇧ Shift', x: 4.125, z: KEYBOARD_ROW_Z.shift, w: 2.75, color: modifier, row: 5 },
] as const satisfies readonly KeyDef[];

const bottomRow = [
  { code: 'ControlLeft', label: 'Control', x: -8.875, z: KEYBOARD_ROW_Z.bottom, w: 1.25, color: modifier, row: 5 },
  { code: 'MetaLeft', label: 'Super', x: -7.625, z: KEYBOARD_ROW_Z.bottom, w: 1.25, color: modifier, row: 5 },
  { code: 'AltLeft', label: 'Alt', x: -6.375, z: KEYBOARD_ROW_Z.bottom, w: 1.25, color: modifier, row: 5 },
  {
    code: 'Space',
    label: '',
    x: -2.625,
    z: KEYBOARD_ROW_Z.bottom,
    w: 6.25,
    color: modifier,
    row: 5,
    variant: 'space-art',
  },
  { code: 'AltRight', label: 'Alt', x: 1.125, z: KEYBOARD_ROW_Z.bottom, w: 1.25, color: modifier, row: 5 },
  { code: 'Fn', label: 'Fn', x: 2.375, z: KEYBOARD_ROW_Z.bottom, w: 1.25, color: modifier, row: 5 },
  { code: 'ContextMenu', label: 'Menu', x: 3.625, z: KEYBOARD_ROW_Z.bottom, w: 1.25, color: modifier, row: 5 },
  { code: 'ControlRight', label: 'Control', x: 4.875, z: KEYBOARD_ROW_Z.bottom, w: 1.25, color: modifier, row: 5 },
] as const satisfies readonly KeyDef[];

export const KEYS = [
  ...functionKeys,
  ...numberRow,
  ...qwertyRow,
  ...homeRow,
  ...shiftRow,
  ...bottomRow,
] as const satisfies readonly KeyDef[];

export const NAVIGATION_KEYS = [
  { code: 'PrintScreen', label: 'Print', x: 7.25, z: KEYBOARD_ROW_Z.function, color: modifier, row: 1 },
  { code: 'ScrollLock', label: 'Scroll', x: 8.25, z: KEYBOARD_ROW_Z.function, color: modifier, row: 1 },
  { code: 'Pause', label: 'Pause', x: 9.25, z: KEYBOARD_ROW_Z.function, color: modifier, row: 1 },
  { code: 'Insert', label: 'Insert', x: 7.25, z: KEYBOARD_ROW_Z.number, color: modifier, row: 2 },
  { code: 'Home', label: 'Home', x: 8.25, z: KEYBOARD_ROW_Z.number, color: modifier, row: 2 },
  { code: 'PageUp', label: 'PgUp', x: 9.25, z: KEYBOARD_ROW_Z.number, color: modifier, row: 2 },
  { code: 'Delete', label: 'Delete', x: 7.25, z: KEYBOARD_ROW_Z.qwerty, color: modifier, row: 3 },
  { code: 'End', label: 'End', x: 8.25, z: KEYBOARD_ROW_Z.qwerty, color: modifier, row: 3 },
  { code: 'PageDown', label: 'PgDn', x: 9.25, z: KEYBOARD_ROW_Z.qwerty, color: modifier, row: 3 },
] as const satisfies readonly KeyDef[];

export const ARROWS = [
  { code: 'ArrowUp', label: '↑', x: 8.25, z: KEYBOARD_ROW_Z.shift, color: modifier, row: 5 },
  { code: 'ArrowLeft', label: '←', x: 7.25, z: KEYBOARD_ROW_Z.bottom, color: modifier, row: 5 },
  { code: 'ArrowDown', label: '↓', x: 8.25, z: KEYBOARD_ROW_Z.bottom, color: modifier, row: 5 },
  { code: 'ArrowRight', label: '→', x: 9.25, z: KEYBOARD_ROW_Z.bottom, color: modifier, row: 5 },
] as const satisfies readonly KeyDef[];

export const ALL_KEYS = [...KEYS, ...NAVIGATION_KEYS, ...ARROWS] as const;

export const KEY_BY_CODE: ReadonlyMap<string, Readonly<KeyDef>> = new Map(
  ALL_KEYS.map((key) => [key.code, key]),
);
