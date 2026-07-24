import { describe, expect, it } from 'vitest';

import {
  cameraPositionForAspect,
  computeTiltedKeyboardMinY,
  PRODUCT_SHOT,
  projectKeyboardBounds,
} from './keyboard-product-shot';
import { KEYBOARD_CASE_BOUNDS } from './keyboard-geometry';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function expectFiniteVector3(value: readonly number[]) {
  expect(value).toHaveLength(3);
  value.forEach((component) => expect(Number.isFinite(component)).toBe(true));
}

function expectDeeplyFrozen(value: unknown): void {
  if (value === null || typeof value !== 'object') return;
  expect(Object.isFrozen(value)).toBe(true);
  Object.values(value).forEach(expectDeeplyFrozen);
}

describe('keyboard product-shot configuration', () => {
  it('defines an immutable homepage camera framing 70% of the keyboard', () => {
    const camera = PRODUCT_SHOT.homepage.camera;

    expectFiniteVector3(camera.position);
    expectFiniteVector3(camera.target);
    expect(camera.keyboardCoverage).toBe(0.7);
    expect(camera.keyboardCoverage).toBeGreaterThan(0);
    expect(camera.keyboardCoverage).toBeLessThanOrEqual(1);
    expectDeeplyFrozen(PRODUCT_SHOT);
  });

  it('defines a matte desk with physical dimensions and color', () => {
    const { desk } = PRODUCT_SHOT;

    expect(desk.width).toBeGreaterThan(0);
    expect(desk.width).toBeGreaterThanOrEqual(40);
    expect(desk.depth).toBeGreaterThanOrEqual(24);
    expect(desk.thickness).toBeGreaterThan(0);
    expect(desk.roughness).toBeGreaterThanOrEqual(0);
    expect(desk.roughness).toBeLessThanOrEqual(1);
    expect(desk.color).toMatch(HEX_COLOR);
    expect(desk.topY).toBe(-0.35);
  });

  it('places the tilted keyboard just above the desk surface', () => {
    const { keyboard, desk } = PRODUCT_SHOT;
    const minY = computeTiltedKeyboardMinY(
      keyboard.position[1],
      keyboard.tiltX,
      keyboard.caseBounds,
    );

    expectFiniteVector3(keyboard.position);
    expect(keyboard.rotationY).toBeCloseTo(-0.065, 8);
    expect(keyboard.clearance).toBeGreaterThanOrEqual(0.01);
    expect(keyboard.clearance).toBeLessThanOrEqual(0.03);
    expect(minY - desk.topY).toBeCloseTo(keyboard.clearance, 8);
    expect(keyboard.caseBounds).toBe(KEYBOARD_CASE_BOUNDS);
  });

  it.each([1.18, 1.5, 16 / 9])('frames every transformed case corner at aspect %s', (aspect) => {
    const camera = PRODUCT_SHOT.homepage.camera;
    const projection = projectKeyboardBounds(
      { ...camera, position: cameraPositionForAspect(camera, aspect) },
      PRODUCT_SHOT.keyboard,
      KEYBOARD_CASE_BOUNDS,
      aspect,
    );

    expect(projection.minX).toBeGreaterThanOrEqual(-0.9);
    expect(projection.maxX).toBeLessThanOrEqual(0.9);
    expect(projection.minY).toBeGreaterThanOrEqual(-0.9);
    expect(projection.maxY).toBeLessThanOrEqual(0.9);
    expect(projection.widthCoverage).toBeGreaterThanOrEqual(0.65);
    expect(projection.widthCoverage).toBeLessThanOrEqual(0.8);
    expect(projection.widthCoverage).toBeCloseTo(camera.keyboardCoverage, 1);
  });

  it.each([1.18, 1.5, 16 / 9])('keeps the aspect-aware camera inside control limits at aspect %s', (aspect) => {
    const camera = PRODUCT_SHOT.homepage.camera;
    const position = cameraPositionForAspect(camera, aspect);
    const distance = Math.hypot(...position.map((value, index) => value - camera.target[index]));

    expect(distance).toBeGreaterThanOrEqual(camera.controls.minDistance + 5);
    expect(distance).toBeLessThanOrEqual(camera.controls.maxDistance - 10);
  });

  it('configures a bounded shadow frustum and finite contact shadow work', () => {
    const { directional, contact } = PRODUCT_SHOT.shadows;

    expect(directional.left).toBeLessThanOrEqual(-12);
    expect(directional.right).toBeGreaterThanOrEqual(12);
    expect(directional.bottom).toBeLessThanOrEqual(-8);
    expect(directional.top).toBeGreaterThanOrEqual(8);
    expect([512, 1024]).toContain(directional.mapSize);
    expect(contact.scale).toBeGreaterThanOrEqual(24);
    expect(contact.resolution).toBeGreaterThanOrEqual(256);
    expect(contact.resolution).toBeLessThanOrEqual(1024);
    expect(contact.frames).toBeGreaterThan(0);
    expect(contact.frames).toBeLessThanOrEqual(2);
  });

  it('provides the complete product palette using valid hex colors', () => {
    expect(Object.keys(PRODUCT_SHOT.palette).sort()).toEqual([
      'blackCap',
      'blackCase',
      'blackFrame',
      'creamAccent',
      'darkPlate',
      'graphiteCap',
      'magentaAccent',
      'mirrorMetal',
      'redLight',
      'silverAccent',
    ]);

    Object.values(PRODUCT_SHOT.palette).forEach((color) => expect(color).toMatch(HEX_COLOR));
  });

  it('defines cool key, red rim, and warm fill lights with finite values', () => {
    expect(Object.keys(PRODUCT_SHOT.lights).sort()).toEqual(['coolKey', 'redRim', 'warmFill']);

    Object.values(PRODUCT_SHOT.lights).forEach((light) => {
      expectFiniteVector3(light.position);
      expect(Number.isFinite(light.intensity)).toBe(true);
      expect(light.intensity).toBeGreaterThan(0);
      expect(light.color).toMatch(HEX_COLOR);
    });
  });
});
