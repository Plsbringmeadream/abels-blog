# Keyboard Desk Product Shot Redesign

## Goal

Restyle only the homepage R3F keyboard as a realistic mechanical-keyboard product shot grounded on a desk, using the supplied purple-lit reference image as the visual target.

## Protected Existing Content

The 3D article cover flow, retro monitor scene, terminal card, page copy, routes, and surrounding sections must remain present and behaviorally unchanged. This redesign must not delete, replace, or hide them.

## Composition

- Show the complete keyboard at a low three-quarter product-photography angle.
- Place it physically on a broad matte desk plane with visible contact and cast shadows.
- Remove the purple grid, floating keycaps, shadow-catcher card treatment, and any appearance of a bounded preview frame.
- Let the scene bleed transparently into the page; the desk surface is the only grounding plane.
- Keep the keyboard inside the existing right-side BUILD placement without cropping its case.

## Materials And Lighting

- Silver-gray opaque anodized aluminum case with restrained reflections and rounded bevels.
- White and cool-gray matte PBT keycaps, with red Esc and Enter accents.
- Dark switch plate and visible gaps between caps.
- Soft cool key light, purple side/back light, subtle warm fill, contact shadow, and purple underglow reflected on the desk.
- RGB emits primarily through gaps and beneath keycaps; cap surfaces do not glow as solid blocks.

## Controls And Interaction

- Preserve physical-keyboard typing, pointer typing, spring return, RGB modes, brightness, reduced-motion behavior, context-loss fallback, and offscreen pausing.
- Replace the large white control card with a compact translucent corner toolbar that stays visually subordinate to the keyboard.
- Preserve accessible labels, buttons, range input, and keyboard shortcuts.

## Responsive Behavior

- Desktop at 901px and above loads the full scene.
- Mobile keeps the existing static fallback and does not hydrate R3F.
- No changes to the retro monitor breakpoint or article cover-flow breakpoint.

## Verification Boundary

- Unit tests and Astro production build must pass.
- Source/static checks must verify the protected modules remain referenced.
- Do not use the crashing Codex in-app Browser. Visual runtime verification remains a separate step in the user's external browser.
