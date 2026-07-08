# Keyboard Desk Product Shot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing interactive R3F keyboard into a realistic silver-gray keyboard photographed on a purple-lit matte desk, without changing the 3D cover flow or retro monitor.

**Architecture:** Preserve the existing interaction state, spring, RGB, fallback, and lifecycle code. Limit changes to scene composition, keyboard materials, accent metadata, control presentation, and the keyboard's homepage placement; enforce protected-module checks after every task.

**Tech Stack:** Astro, React, TypeScript, React Three Fiber, Drei, Three.js, Vitest.

---

## Task 1: Lock The Product-Shot Visual Configuration

**Files:**
- Create: `src/components/3d-keyboard/keyboard-product-shot.ts`
- Create: `src/components/3d-keyboard/keyboard-product-shot.test.ts`

- [ ] Write a failing test that expects homepage camera position/target, desk dimensions, silver case colors, white/gray key palette, red accent color, and purple light color to be exported from one immutable configuration.
- [ ] Run `npm test -- src/components/3d-keyboard/keyboard-product-shot.test.ts` and verify failure because the module is absent.
- [ ] Implement frozen configuration objects with finite numeric vectors and CSS/hex colors. Keep camera framing wide enough for the full case.
- [ ] Run the focused test and verify it passes.
- [ ] Run `rg -n "posts3d|buildscene" src/pages/index.astro public/js` and confirm both protected modules remain referenced.

## Task 2: Rebuild Keyboard Materials And Key Palette

**Files:**
- Modify: `src/components/3d-keyboard/keyboard-layout.ts`
- Modify: `src/components/3d-keyboard/KeyboardBase.tsx`
- Modify: `src/components/3d-keyboard/Keycap.tsx`
- Modify: `src/components/3d-keyboard/Keyboard.tsx`

- [ ] Change default caps to white/cool gray and set Esc/Enter to the red accent. Preserve every key code, size, row, and label.
- [ ] Build a layered silver-gray case: opaque anodized shell, lighter top frame, dark plate, narrow lower lip, and restrained metal reflections.
- [ ] Keep PBT caps matte and stop RGB from tinting the cap body. Apply RGB only to the under-key emissive surface and switch gap.
- [ ] Preserve pointer capture, spring travel, physical-key mapping, shared geometry caches, and reduced-motion behavior.
- [ ] Run layout, spring, RGB, and full tests; then run `npm run build`.
- [ ] Confirm `public/js/posts3d.js` and `public/js/buildscene.js` still exist.

## Task 3: Replace The Editor-Like Scene With A Desk Product Shot

**Files:**
- Modify: `src/components/3d-keyboard/KeyboardScene.tsx`
- Modify: `src/components/3d-keyboard/Keyboard.tsx`

- [ ] Remove `gridHelper`, floating keycaps, and the transparent shadow-card look.
- [ ] Add a large matte desk plane below the keyboard with a dark neutral material; keep it visually unbounded inside the transparent page scene.
- [ ] Position the keyboard directly on the desk, rotate it slightly for a low three-quarter view, and frame the entire case using the product-shot camera config.
- [ ] Use a soft cool key light, purple side/back light, warm low-intensity fill, contact shadows, and a subtle purple pool beneath the board.
- [ ] Keep DPR cap, shadow resolution cap, context-loss fallback, IntersectionObserver pause, visibility pause, demand rendering, and reduced-motion freeze unchanged.
- [ ] Run full tests and build. Search the scene for `gridHelper` and `FloatingKeycap`; expected no runtime usage.

## Task 4: Turn The Control Card Into A Compact Floating Toolbar

**Files:**
- Modify: `src/components/3d-keyboard/KeyboardControls.tsx`
- Modify: `src/components/3d-keyboard/KeyboardControls.test.tsx`
- Modify: `src/pages/index.astro`

- [ ] Preserve all buttons, `aria-pressed`, range input, labels, and dispatch behavior.
- [ ] Replace the large white panel with a compact translucent dark toolbar anchored to the lower-right of the scene. Keep mode labels compact and place shortcut help in a tooltip/details disclosure instead of a full-width sentence.
- [ ] Remove any visible border/background on `.build__keyboard`; allow the transparent Canvas and desk to blend into the BUILD section.
- [ ] Adjust only keyboard width/height/right positioning so the full board fits. Do not change `.build__scene`, `.posts3d*`, terminal, copy, or section order.
- [ ] Update control tests only where accessible text structure changes; test behavior must remain equivalent.
- [ ] Run focused controls tests, full tests, and build.

## Task 5: Protected-Content And Static Verification

**Files:**
- No planned source modifications.

- [ ] Run `npm test`; expect zero failures.
- [ ] Run `npm run build`; expect successful static generation.
- [ ] Verify `dist/index.html` contains `data-posts3d`, `data-buildscene`, `posts3d.js`, `buildscene.js`, the keyboard island with `(min-width: 901px)`, and the mobile fallback.
- [ ] Verify the source still contains the 3D cover-flow canvas and retro-monitor canvas.
- [ ] Verify no routes were added or removed.
- [ ] Do not open the Codex in-app Browser. Report that product-shot appearance still needs the user's external-browser visual check.
- [ ] Because this workspace has no Git repository, provide a precise changed-file list instead of a commit SHA.
