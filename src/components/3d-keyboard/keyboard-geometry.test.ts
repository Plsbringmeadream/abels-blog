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
    const lipMinY = KEYBOARD_BASE_GROUP_Y + KEYBOARD_FRONT_LIP.centerY - KEYBOARD_FRONT_LIP.height / 2;
    const lipMaxZ = KEYBOARD_FRONT_LIP.centerZ + KEYBOARD_FRONT_LIP.depth / 2;

    expect(KEYBOARD_CASE_WIDTH).toBe(20.5);
    expect(KEYBOARD_CASE_DEPTH).toBe(7.2);
    expect(KEYBOARD_CASE_BOUNDS.minX).toBe(-(KEYBOARD_CASE_WIDTH + 0.3) / 2);
    expect(KEYBOARD_CASE_BOUNDS.maxX).toBe((KEYBOARD_CASE_WIDTH + 0.3) / 2);
    expect(KEYBOARD_CASE_BOUNDS.minY).toBe(lipMinY);
    expect(KEYBOARD_CASE_BOUNDS.maxZ).toBeGreaterThanOrEqual(lipMaxZ);
  });
});
