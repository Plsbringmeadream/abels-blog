import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  fileURLToPath(new URL('./KeyboardBase.tsx', import.meta.url)),
  'utf8',
);

describe('photo-matched keyboard case', () => {
  it('mounts USB-C in the rear mirror-PVD band instead of the front lip', () => {
    expect(source).toContain('name="rear-pvd-usb-c-trim"');
    expect(source).toContain('name="rear-pvd-usb-c-opening"');
    expect(source).toContain('-depth / 2');
    expect(source).not.toContain('front-usb-c');
  });

  it('uses an anodized upper shell over a continuous mirror-PVD lower frame', () => {
    expect(source).toContain('name="anodized-aluminium-upper-shell"');
    expect(source).toContain('name="machined-top-deck"');
    expect(source).toContain('name="recessed-switch-plate"');
    expect(source).toContain('name="mirror-pvd-lower-frame"');
    expect(source).not.toContain('side-rail-');
    expect(source).not.toContain('front-rail-');
  });
});
