export const KEYBOARD_CASE_WIDTH = 20.5;
export const KEYBOARD_CASE_DEPTH = 7.2;
export const KEYBOARD_PLATE_WIDTH = 20.1;
export const KEYBOARD_BASE_GROUP_Y = -0.18;

export const KEYBOARD_FRONT_LIP = Object.freeze({
  widthInset: 0.5,
  height: 0.2,
  depth: 0.24,
  centerY: -0.24,
  centerZ: KEYBOARD_CASE_DEPTH * 0.5 - 0.08,
});

export const KEYBOARD_CASE_BOUNDS = Object.freeze({
  minX: -(KEYBOARD_CASE_WIDTH + 0.3) / 2,
  maxX: (KEYBOARD_CASE_WIDTH + 0.3) / 2,
  minY: KEYBOARD_BASE_GROUP_Y + KEYBOARD_FRONT_LIP.centerY - KEYBOARD_FRONT_LIP.height / 2,
  maxY: KEYBOARD_BASE_GROUP_Y + 0.17 + 0.14 / 2,
  minZ: -(KEYBOARD_CASE_DEPTH / 2 + 0.15),
  maxZ: KEYBOARD_CASE_DEPTH / 2 + 0.15,
});
