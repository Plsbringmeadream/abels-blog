import { describe, expect, it } from 'vitest';

import { keycapLegendColor } from './Keycap';
import { PRODUCT_SHOT } from './keyboard-product-shot';

describe('keycap material contrast', () => {
  it('uses a light legend only on the red accent caps', () => {
    expect(keycapLegendColor(PRODUCT_SHOT.palette.redAccent)).toBe('#fff7f2');
    expect(keycapLegendColor(PRODUCT_SHOT.palette.whiteCap)).toBe('#292b30');
    expect(keycapLegendColor(PRODUCT_SHOT.palette.grayCap)).toBe('#292b30');
  });
});
