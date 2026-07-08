# Interactive R3F Keyboard Redesign

## Goal

Upgrade the existing React Three Fiber 65% keyboard into a convincing, reusable mechanical-keyboard experience for the homepage BUILD section and the Build page. Preserve the site's purple-pink identity while making the object feel materially realistic and physically responsive.

## Visual Direction

- Premium aluminum keyboard case with believable bevels, plate gaps, PBT-like keycaps, and controlled studio reflections.
- Existing purple and pink brand colors appear primarily through RGB lighting and small accents, not as uniformly saturated materials.
- Desktop presents the complete interactive 3D keyboard. Mobile skips the R3F bundle and displays a lightweight static keyboard preview linking to the Build page.
- The homepage uses a compact camera and controls treatment; the Build page can use a roomier camera and full controls while sharing the same keyboard core.

## Architecture

### `KeyboardScene`

Owns the Canvas, camera, environment, shadow quality, and performance tier. It accepts presentation props so the homepage and Build page can choose different camera framing and control density without duplicating the keyboard.

### `KeyboardExperience`

Owns shared interactive state:

- currently pressed key codes
- RGB enabled state
- RGB mode
- brightness
- interaction pulse events
- optional auto-rotation state

It exposes a narrow controller API to the input adapter, keycaps, lighting system, and HTML controls.

### `KeyboardInput`

Maps browser `KeyboardEvent.code` values to the 65% layout. Mouse/pointer presses and physical keyboard presses enter the same state flow. It clears held keys on `blur`, `visibilitychange`, and component unmount to prevent stuck keys.

Supported shortcuts:

- `Fn + Left/Right`: previous or next RGB mode
- `Fn + Up/Down`: brightness down or up
- `Fn + Space`: RGB on or off

### `Keyboard`

Remains a declarative layout renderer. Key definitions gain stable `code`, size, row, legend, and accent metadata. Layout data remains separate from animation and lighting behavior.

### `Keycap`

Each keycap receives only its own pressed state and computed RGB color. A frame-based damped spring animates approximately 2–3 mm of travel, a short bottom-out, and a subtle overshooting return. Pointer down/up/cancel mirrors physical typing. Hover remains restrained and does not lift the key above its resting position.

The visual assembly includes a cap, switch/stem glimpse, and under-key light surface. Shared geometries and materials are reused wherever possible.

### `RGBLighting`

Computes per-key colors without creating a point light for every key. Modes:

1. Off
2. Static purple-pink
3. Breathing
4. Rainbow wave
5. Reactive ripple from the most recent keypress

Color computation is based on key position, time, brightness, and recent interaction pulses. Emissive materials and a restrained shared fill light create the glow.

### `KeyboardControls`

A compact accessible HTML overlay provides RGB power, mode, and brightness controls. It exposes labels and pressed/value states to assistive technology and does not steal physical typing focus unnecessarily. Fn shortcuts remain a discoverable enhancement rather than the sole control path.

## Interaction Flow

1. A physical or pointer press resolves to a stable key code.
2. `KeyboardExperience` adds the code to the pressed set and records a light pulse.
3. The matching `Keycap` spring moves toward its pressed depth.
4. `RGBLighting` incorporates the pulse when reactive mode is active.
5. Release removes the key code and the spring returns the cap to rest.
6. Blur, hidden-page state, or unmount clears the complete pressed set.

## Performance And Fallbacks

- Cap device pixel ratio and shadow resolution.
- Reuse geometry and material resources; avoid one React event listener or Three.js light per key.
- Pause time-driven effects when the page is hidden or the section is off-screen.
- Respect `prefers-reduced-motion` by removing auto-rotation and continuous animated lighting while preserving direct key feedback.
- Render the mobile static preview before loading any R3F code.
- If WebGL initialization fails, retain the static preview and controls-free fallback instead of leaving an empty section.

## Error Handling

- Ignore unmapped physical key codes without mutating state.
- Treat repeated `keydown` events as a held key, not repeated animation initialization.
- Release pointer state on `pointercancel` and lost pointer capture.
- Clamp brightness and mode indices inside the controller rather than in individual controls.

## Testing

### Unit Tests

- Keyboard code-to-layout mapping, including modifiers, arrows, and space.
- Fn shortcut mode cycling, brightness clamping, and RGB power toggling.
- Press/release idempotence and global clear behavior.
- RGB color functions for each mode at deterministic timestamps.

### Component Tests

- Pointer and physical keyboard input produce the same controller state.
- Controls expose correct accessible labels and state.
- Reduced-motion mode disables continuous motion while direct presses remain visible.

### Verification

- Run the production Astro build.
- Verify desktop homepage and Build page framing without using the unstable Codex in-app Browser; use static/source-level checks unless the user selects another browser workflow.
- Verify the mobile breakpoint does not hydrate or display the WebGL scene.
- Check keyboard-only operation, focus behavior, stuck-key cleanup, and fallback rendering.

## Scope

Included: realistic keyboard materials, physical and pointer typing, spring key travel, RGB modes, control panel, Fn shortcuts, reusable homepage/Build-page presentation, mobile static fallback, accessibility, and performance safeguards.

Excluded: a physics-engine dependency, removable keycaps, switch customization, audio samples, keyboard remapping UI, persistence across visits, and new routes.
