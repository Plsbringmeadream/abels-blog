# Interactive R3F Keyboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing 65% React Three Fiber keyboard into a realistic, physically typeable, RGB-switchable experience shared by the homepage BUILD section and the Build page, with a non-WebGL mobile fallback.

**Architecture:** Keep layout data declarative, move input and lighting behavior into a small pure controller, and let each keycap animate from its own pressed state. Use shared emissive material inputs instead of per-key lights, render accessible controls as HTML, and keep mobile outside the R3F hydration path.

**Tech Stack:** Astro 6, React 19, TypeScript, React Three Fiber 9, Drei 10, Three.js 0.185, Vitest, Testing Library.

---

## File Structure

- Create `src/components/3d-keyboard/keyboard-layout.ts`: stable 65% key definitions and browser-code mapping.
- Create `src/components/3d-keyboard/keyboard-state.ts`: pure reducer, RGB modes, Fn commands, and brightness clamping.
- Create `src/components/3d-keyboard/rgb.ts`: deterministic per-key RGB color calculation.
- Create `src/components/3d-keyboard/KeyboardExperience.tsx`: shared React state, event adapters, visibility cleanup, and context API.
- Create `src/components/3d-keyboard/KeyboardControls.tsx`: accessible HTML control overlay.
- Create `src/components/3d-keyboard/KeyboardFallback.astro`: mobile and WebGL fallback presentation.
- Create `src/components/3d-keyboard/keyboard-state.test.ts`: reducer and shortcut tests.
- Create `src/components/3d-keyboard/rgb.test.ts`: deterministic lighting tests.
- Modify `src/components/3d-keyboard/Keyboard.tsx`: consume layout and experience state.
- Modify `src/components/3d-keyboard/Keycap.tsx`: spring key travel, pointer lifecycle, switch and underglow.
- Modify `src/components/3d-keyboard/KeyboardBase.tsx`: more realistic aluminum case/plate materials.
- Modify `src/components/3d-keyboard/KeyboardScene.tsx`: presentation props, performance policy, controls, fallback signal.
- Modify `src/pages/index.astro`: desktop scene plus mobile fallback integration.
- Modify `package.json`: test dependencies and scripts.

## Task 1: Establish Pure Keyboard State

**Files:**
- Create: `src/components/3d-keyboard/keyboard-layout.ts`
- Create: `src/components/3d-keyboard/keyboard-state.ts`
- Create: `src/components/3d-keyboard/keyboard-state.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Add the test runner**

Add these scripts and dev dependencies to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.0",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.4"
  }
}
```

Run: `npm install`
Expected: exit code 0 and a refreshed lockfile.

- [ ] **Step 2: Write failing reducer tests**

Create tests covering idempotent press/release, clear, Fn cycling, brightness clamping, and RGB toggle:

```ts
import { describe, expect, it } from 'vitest';
import { initialKeyboardState, keyboardReducer } from './keyboard-state';

describe('keyboardReducer', () => {
  it('keeps presses idempotent and clears them globally', () => {
    const once = keyboardReducer(initialKeyboardState, { type: 'press', code: 'KeyA' });
    const twice = keyboardReducer(once, { type: 'press', code: 'KeyA' });
    expect([...twice.pressed]).toEqual(['KeyA']);
    expect(keyboardReducer(twice, { type: 'clear' }).pressed.size).toBe(0);
  });

  it('cycles RGB modes and clamps brightness', () => {
    const next = keyboardReducer(initialKeyboardState, { type: 'next-mode' });
    expect(next.mode).toBe('breathing');
    const dim = Array.from({ length: 20 }).reduce(
      (state) => keyboardReducer(state, { type: 'brightness', delta: -0.1 }),
      next,
    );
    expect(dim.brightness).toBe(0.1);
  });

  it('toggles RGB power', () => {
    expect(keyboardReducer(initialKeyboardState, { type: 'toggle-rgb' }).enabled).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test and verify red**

Run: `npm test -- src/components/3d-keyboard/keyboard-state.test.ts`
Expected: FAIL because `keyboard-state.ts` does not exist.

- [ ] **Step 4: Implement the pure reducer**

Define:

```ts
export const RGB_MODES = ['static', 'breathing', 'rainbow', 'ripple'] as const;
export type RGBMode = (typeof RGB_MODES)[number];

export interface KeyboardState {
  pressed: ReadonlySet<string>;
  enabled: boolean;
  mode: RGBMode;
  brightness: number;
  pulse: { code: string; sequence: number } | null;
}

export type KeyboardAction =
  | { type: 'press'; code: string }
  | { type: 'release'; code: string }
  | { type: 'clear' }
  | { type: 'toggle-rgb' }
  | { type: 'next-mode' }
  | { type: 'previous-mode' }
  | { type: 'set-mode'; mode: RGBMode }
  | { type: 'brightness'; delta: number };

export const initialKeyboardState: KeyboardState = {
  pressed: new Set(), enabled: true, mode: 'static', brightness: 0.8, pulse: null,
};
```

Implement immutable `Set` updates, modulo mode cycling, and `Math.min(1, Math.max(0.1, value))` brightness clamping. Increment pulse sequence only on a newly pressed key.

- [ ] **Step 5: Extract the keyboard layout**

Move `KEYS`, `ARROWS`, and row metadata from `Keyboard.tsx` into `keyboard-layout.ts`. Add a stable browser `code` to every definition, including `Space`, `ArrowUp`, `ArrowLeft`, `ArrowDown`, and `ArrowRight`. Export `KEYS`, `KEY_BY_CODE`, and the `KeyDef` type.

- [ ] **Step 6: Run tests and build**

Run: `npm test -- src/components/3d-keyboard/keyboard-state.test.ts && npm run build`
Expected: reducer tests PASS and Astro build exits 0.

- [ ] **Step 7: Record checkpoint**

This workspace has no `.git`; do not initialize one. Record completion by checking Task 1 in this plan after the passing commands.

## Task 2: Add Deterministic RGB Computation

**Files:**
- Create: `src/components/3d-keyboard/rgb.ts`
- Create: `src/components/3d-keyboard/rgb.test.ts`

- [ ] **Step 1: Write failing color tests**

```ts
import { describe, expect, it } from 'vitest';
import { rgbForKey } from './rgb';

const key = { x: 0, z: 0 };

describe('rgbForKey', () => {
  it('returns black when RGB is disabled', () => {
    expect(rgbForKey(key, { enabled: false, mode: 'static', brightness: 1, time: 0, pulse: null })).toBe('#000000');
  });

  it('returns deterministic static and rainbow colors', () => {
    expect(rgbForKey(key, { enabled: true, mode: 'static', brightness: 1, time: 0, pulse: null })).toMatch(/^#[0-9a-f]{6}$/);
    expect(rgbForKey(key, { enabled: true, mode: 'rainbow', brightness: 1, time: 0, pulse: null }))
      .toBe(rgbForKey(key, { enabled: true, mode: 'rainbow', brightness: 1, time: 0, pulse: null }));
  });

  it('brightens keys near a ripple origin', () => {
    const near = rgbForKey(key, { enabled: true, mode: 'ripple', brightness: 1, time: 0.15, pulse: { x: 0, z: 0 } });
    const far = rgbForKey({ x: 12, z: 12 }, { enabled: true, mode: 'ripple', brightness: 1, time: 0.15, pulse: { x: 0, z: 0 } });
    expect(near).not.toBe(far);
  });
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- src/components/3d-keyboard/rgb.test.ts`
Expected: FAIL because `rgb.ts` does not exist.

- [ ] **Step 3: Implement RGB modes**

Implement `rgbForKey` as a pure function using `THREE.Color().setHSL()` and `multiplyScalar(brightness)`. Static blends `#8b5cf6` and `#ec4899` by normalized x-position; breathing multiplies static brightness by `0.55 + 0.45 * sin(time * 2)`; rainbow derives hue from `x * 0.035 + z * 0.025 - time * 0.08`; ripple derives a narrow ring from distance to the pulse origin and fades after 1.2 seconds.

- [ ] **Step 4: Verify green**

Run: `npm test -- src/components/3d-keyboard/rgb.test.ts`
Expected: all RGB tests PASS.

## Task 3: Build the Shared Experience And Input Adapter

**Files:**
- Create: `src/components/3d-keyboard/KeyboardExperience.tsx`
- Create: `src/components/3d-keyboard/KeyboardExperience.test.tsx`

- [ ] **Step 1: Write failing interaction tests**

Render a probe component inside the provider and assert that `keydown KeyA` presses A, `keyup KeyA` releases it, repeated keydown remains idempotent, blur clears held keys, and Fn shortcuts change mode and brightness. Use `fireEvent` from Testing Library.

- [ ] **Step 2: Verify red**

Run: `npm test -- src/components/3d-keyboard/KeyboardExperience.test.tsx`
Expected: FAIL because the provider does not exist.

- [ ] **Step 3: Implement the provider API**

Export this focused context shape:

```ts
interface KeyboardExperienceValue {
  state: KeyboardState;
  press(code: string): void;
  release(code: string): void;
  dispatch(action: KeyboardAction): void;
}
```

Register one window-level keydown and keyup pair. Map `CapsLock` as the physical Fn surrogate because browsers do not expose a universal Fn key. While CapsLock is held, intercept arrow keys and Space for lighting commands; otherwise dispatch normal key presses. Clear state on `window.blur`, `document.visibilitychange`, and cleanup.

- [ ] **Step 4: Verify green**

Run: `npm test -- src/components/3d-keyboard/KeyboardExperience.test.tsx`
Expected: all provider tests PASS.

## Task 4: Make Keycaps Feel Physical

**Files:**
- Modify: `src/components/3d-keyboard/Keycap.tsx`
- Modify: `src/components/3d-keyboard/Keyboard.tsx`
- Modify: `src/components/3d-keyboard/KeyboardBase.tsx`

- [ ] **Step 1: Connect stable layout state**

Replace local click toggles with `pressed={state.pressed.has(key.code)}` and pointer callbacks to `press(key.code)` / `release(key.code)`. Handle `pointerup`, `pointercancel`, `pointerleave` while captured, and `lostpointercapture`.

- [ ] **Step 2: Implement damped travel**

Give each keycap group a ref and animate in `useFrame`:

```ts
velocity.current += ((pressed ? -0.055 : 0) - travel.current) * 95 * delta;
velocity.current *= Math.exp(-18 * delta);
travel.current += velocity.current * delta;
group.current.position.y = position[1] + travel.current;
group.current.rotation.z = velocity.current * 0.018;
```

Clamp `delta` to `1 / 30` so tab restoration cannot launch a cap through the plate.

- [ ] **Step 3: Add believable switch and underglow**

Add a small shared stem mesh below the cap and a thin under-key plane using the computed RGB color as emissive input. Keep the keycap material PBT-like: `metalness={0}`, `roughness={0.62}`, `clearcoat={0.08}`. Remove hover lift and permanent click recoloring.

- [ ] **Step 4: Refine case materials**

Make the case opaque anodized aluminum (`metalness` around `0.72`, `roughness` around `0.28`), darken the plate, reduce the purple body saturation, and leave purple-pink identity to the badge and lighting.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Astro build exits 0 with no React or Three type errors.

## Task 5: Add Controls, Presentation Modes, And Mobile Fallback

**Files:**
- Create: `src/components/3d-keyboard/KeyboardControls.tsx`
- Create: `src/components/3d-keyboard/KeyboardFallback.astro`
- Modify: `src/components/3d-keyboard/KeyboardScene.tsx`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create accessible controls**

Render HTML buttons for RGB power and each named mode plus an `input type="range"` for brightness. Use `aria-pressed` for toggle/mode buttons, `aria-label="RGB brightness"`, and visible shortcut help: `Caps + arrows / Space`.

- [ ] **Step 2: Add scene presentation props**

Define:

```ts
interface KeyboardSceneProps {
  variant?: 'homepage' | 'build';
  controls?: 'compact' | 'full';
}
```

Homepage uses the current compact footprint, capped DPR `[1, 1.35]`, 512 shadow maps, no continuous auto-rotation under reduced motion, and `frameloop="demand"` when RGB animation is off. Build uses a wider camera but the same keyboard core.

- [ ] **Step 3: Add WebGL failure handling**

Wrap the Canvas in a React error boundary that switches to a fallback slot on renderer initialization failure. Do not retry in a loop.

- [ ] **Step 4: Create the mobile fallback**

Use `/assets/keyboard.png` with descriptive alt text, a short “Interactive keyboard available on desktop” label, and a link to the Build page. Ensure the fallback is visible below the desktop breakpoint and the `.build__keyboard` React island is `display:none` there.

- [ ] **Step 5: Prevent mobile hydration**

Replace unconditional `client:load` with a desktop media-aware hydration strategy supported by Astro, using `client:media="(min-width: 901px)"`. Keep the static fallback in Astro markup so mobile ships no active Canvas.

- [ ] **Step 6: Verify production output**

Run: `npm run build`
Expected: exit 0. Inspect generated homepage HTML and confirm the fallback markup exists and the keyboard island carries the desktop media hydration directive.

## Task 6: Full Verification And Cleanup

**Files:**
- Modify: files above only if verification exposes a defect.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`
Expected: all reducer, RGB, and provider tests PASS with zero failures.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: exit code 0 and no unresolved imports or TypeScript diagnostics.

- [ ] **Step 3: Check static accessibility and mobile output**

Search the built output for `aria-pressed`, `RGB brightness`, fallback alt text, and the Build link. Confirm interactive controls are buttons/inputs rather than clickable divs.

- [ ] **Step 4: Check lifecycle safeguards**

Review that all global listeners are installed once and removed on unmount, pointer cancellation releases keys, visibility loss clears held state, and reduced motion disables continuous camera/RGB movement.

- [ ] **Step 5: Document the browser verification boundary**

Do not use the crashing Codex in-app Browser. Report source/test/build evidence separately from visual runtime verification. If the user later chooses Chrome or another stable browser, verify the homepage desktop scene, Build-page scene, keyboard input, RGB controls, mobile fallback, and WebGL fallback there.

- [ ] **Step 6: Record final checkpoint**

Because the workspace has no Git repository, list changed files and verification commands in the handoff instead of claiming a commit.
