import { describe, expect, it } from 'vitest';

import {
  KEYBOARD_BASE_GROUP_Y,
  KEYBOARD_CASE_BOUNDS,
  KEYBOARD_CASE_DEPTH,
  KEYBOARD_CASE_WIDTH,
  KEYBOARD_FRONT_LIP,
} from './keyboard-geometry';

describe('shared keyboard geometry', () => {
  it('derives the case bounds from the rendered body and front lip', () => {
    const lipMaxZ = KEYBOARD_FRONT_LIP.centerZ + KEYBOARD_FRONT_LIP.depth / 2;

    expect(KEYBOARD_CASE_WIDTH).toBe(21.6);
    expect(KEYBOARD_CASE_DEPTH).toBe(8.25);
    expect(KEYBOARD_CASE_BOUNDS.minX).toBe(-KEYBOARD_CASE_WIDTH / 2);
    expect(KEYBOARD_CASE_BOUNDS.maxX).toBe(KEYBOARD_CASE_WIDTH / 2);
    expect(KEYBOARD_CASE_BOUNDS.minY).toBe(KEYBOARD_BASE_GROUP_Y - 0.64);
    expect(KEYBOARD_CASE_BOUNDS.maxZ).toBeGreaterThanOrEqual(lipMaxZ);
  });
});
