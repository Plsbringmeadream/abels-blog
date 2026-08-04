import { describe, expect, it } from 'vitest';

import {
  CHERRY_PROFILES,
  KEYCAP_TOP_INSET,
  cherryCadMeshName,
  isFullSculptKeycapVariant,
  keycapLegendFontSize,
  keycapLegendColor,
} from './Keycap';
import { PRODUCT_SHOT } from './keyboard-product-shot';

describe('keycap material contrast', () => {
  it('uses light legends on the photographed dark caps', () => {
    expect(keycapLegendColor(PRODUCT_SHOT.palette.blackCap)).toBe('#f1f0ec');
    expect(keycapLegendColor(PRODUCT_SHOT.palette.graphiteCap)).toBe('#f1f0ec');
    expect(keycapLegendColor(PRODUCT_SHOT.palette.silverAccent)).toBe('#25272c');
  });

  it('keeps legends readable at the physical keycap scale', () => {
    expect(keycapLegendFontSize('A', 1)).toBeCloseTo(0.19, 8);
    expect(keycapLegendFontSize('!\n1', 1)).toBeCloseTo(0.145, 8);
    expect(keycapLegendFontSize('Backspace', 2)).toBeCloseTo(0.135, 8);
  });
});

describe('Cherry sculpted profile', () => {
  it('uses tall rear rows, a neutral home row, and a kicked-up bottom row', () => {
    expect(CHERRY_PROFILES[1].height).toBeGreaterThan(CHERRY_PROFILES[4].height);
    expect(CHERRY_PROFILES[1].height).toBeCloseTo(9.818 / 19, 8);
    expect(CHERRY_PROFILES[4].height).toBeCloseTo(7.341 / 19, 8);
    expect(CHERRY_PROFILES[1].angle).toBeGreaterThan(0);
    expect(Math.abs(CHERRY_PROFILES[3].angle)).toBeLessThan(0.025);
    expect(CHERRY_PROFILES[5].angle).toBeLessThan(0);
  });

  it('uses a fixed shoulder inset so wide keys keep their physical length', () => {
    expect(KEYCAP_TOP_INSET).toBeCloseTo(0.15, 8);
    expect(6.2 - KEYCAP_TOP_INSET).toBeCloseTo(6.05, 8);
  });

  it('selects the exact CAD shell for each photographed wide key', () => {
    expect(cherryCadMeshName(5, 2.75)).toBe('r5_2_75u');
    expect(cherryCadMeshName(5, 6.25)).toBe('r5_6_25u');
    expect(cherryCadMeshName(4, 2.25)).toBe('r4_2_25u');
  });

  it('does not place a Cherry shell underneath the ESC and F13 artisan caps', () => {
    expect(isFullSculptKeycapVariant('creature')).toBe(true);
    expect(isFullSculptKeycapVariant('gamepad')).toBe(true);
    expect(isFullSculptKeycapVariant('standard')).toBe(false);
  });
});
