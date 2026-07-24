import { describe, expect, it } from 'vitest';

import { CHERRY_PROFILES, keycapLegendColor } from './Keycap';
import { PRODUCT_SHOT } from './keyboard-product-shot';

describe('keycap material contrast', () => {
  it('uses light legends on the photographed dark caps', () => {
    expect(keycapLegendColor(PRODUCT_SHOT.palette.blackCap)).toBe('#f1f0ec');
    expect(keycapLegendColor(PRODUCT_SHOT.palette.graphiteCap)).toBe('#f1f0ec');
    expect(keycapLegendColor(PRODUCT_SHOT.palette.silverAccent)).toBe('#25272c');
  });
});

describe('Cherry sculpted profile', () => {
  it('uses tall rear rows, a neutral home row, and a kicked-up bottom row', () => {
    expect(CHERRY_PROFILES[1].height).toBeGreaterThan(CHERRY_PROFILES[4].height);
    expect(CHERRY_PROFILES[1].angle).toBeGreaterThan(0);
    expect(Math.abs(CHERRY_PROFILES[3].angle)).toBeLessThan(0.025);
    expect(CHERRY_PROFILES[5].angle).toBeLessThan(0);
  });
});
