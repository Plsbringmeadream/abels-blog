import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const sceneSource = readFileSync(
  fileURLToPath(new URL('./KeyboardScene.tsx', import.meta.url)),
  'utf8',
);

describe('keyboard product-shot scene structure', () => {
  it('renders the configured matte desk and product lighting', () => {
    expect(sceneSource).toContain('name="product-shot-desk"');
    expect(sceneSource).toContain('PRODUCT_SHOT.desk');
    expect(sceneSource).toContain('PRODUCT_SHOT.lights.coolKey');
    expect(sceneSource).toContain('PRODUCT_SHOT.lights.purpleRim');
    expect(sceneSource).toContain('PRODUCT_SHOT.lights.warmFill');
    expect(sceneSource).toContain('name="product-shot-underpool"');
    expect(sceneSource).toMatch(/<ContactShadows\s/);
    expect(sceneSource).toMatch(/<Environment\s/);
  });

  it('uses the homepage product-shot camera and target', () => {
    expect(sceneSource).toContain('PRODUCT_SHOT.homepage.camera.position');
    expect(sceneSource).toContain('PRODUCT_SHOT.homepage.camera.target');
    expect(sceneSource).toContain('minDistance={PRODUCT_SHOT.homepage.camera.controls.minDistance}');
    expect(sceneSource).toContain('maxDistance={PRODUCT_SHOT.homepage.camera.controls.maxDistance}');
  });

  it('contains no grid or floating keycap decorations', () => {
    expect(sceneSource).not.toContain('gridHelper');
    expect(sceneSource).not.toContain('FloatingKeycap');
    expect(sceneSource).not.toContain('FLOATING_CAPS');
    expect(sceneSource).not.toContain('shadowMaterial');
  });

  it('keeps transparent rendering, bounded quality, and runtime policies', () => {
    expect(sceneSource).toMatch(/gl=\{\{[^}]*alpha:\s*true/);
    expect(sceneSource).toContain("background: 'transparent'");
    expect(sceneSource).toContain('dpr={[1, 1.35]}');
    expect(sceneSource).toMatch(/<Canvas[\s\S]*?\bshadows\b/);
    expect(sceneSource).toContain('keyboardFrameloop(state.enabled, state.mode, reducedMotion, active)');
    expect(sceneSource).toContain('keyboardShouldAutoRotate(state.enabled, state.mode, reducedMotion, active)');
    expect(sceneSource).toContain('useReducedMotion()');
    expect(sceneSource).toContain('useKeyboardSceneActivity()');
    expect(sceneSource).toContain('useWebGLContextLoss()');
    expect(sceneSource).toContain('onCreated={onCreated}');
    expect(sceneSource).toContain('PRODUCT_SHOT.shadows.directional');
    expect(sceneSource).toContain('PRODUCT_SHOT.shadows.contact');
    expect(sceneSource).toContain('frames={PRODUCT_SHOT.shadows.contact.frames}');
  });

  it('uses configured desk height and keyboard placement without transform magic numbers', () => {
    expect(sceneSource).toContain('PRODUCT_SHOT.desk.topY');
    expect(sceneSource).toContain('position={PRODUCT_SHOT.keyboard.position}');
    expect(sceneSource).toContain('rotation={[0, PRODUCT_SHOT.keyboard.rotationY, 0]}');
  });
});
