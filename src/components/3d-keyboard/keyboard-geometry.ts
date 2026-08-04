export const KEYBOARD_CASE_WIDTH = 20.35;
export const KEYBOARD_CASE_DEPTH = 6.9;
export const KEYBOARD_PLATE_WIDTH = 19.95;
export const KEYBOARD_BASE_GROUP_Y = -0.22;

export const KEYBOARD_FRONT_LIP = Object.freeze({
  widthInset: 0.42,
  height: 0.34,
  depth: 0.38,
  centerY: -0.34,
  centerZ: KEYBOARD_CASE_DEPTH * 0.5 - 0.1,
});

export const KEYBOARD_CASE_BOUNDS = Object.freeze({
  minX: -KEYBOARD_CASE_WIDTH / 2,
  maxX: KEYBOARD_CASE_WIDTH / 2,
  minY: KEYBOARD_BASE_GROUP_Y - 0.64,
  maxY: KEYBOARD_BASE_GROUP_Y + 0.32,
  minZ: -KEYBOARD_CASE_DEPTH / 2 - 0.1,
  maxZ: KEYBOARD_CASE_DEPTH / 2 + 0.1,
});
