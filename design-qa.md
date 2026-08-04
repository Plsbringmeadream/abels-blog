# Keyboard geometry design QA

## Visual target

- Physical reference set: user-supplied keyboard photographs.
- Cherry CAD reference: user-supplied Cherry-profile STEP model.
- Implementation reference: user-supplied render captures.
- Scope: Cherry-profile key shape, fixed inter-key spacing, and multi-unit key proportions.

## Render evidence

- Local homepage captured in Chrome at the default desktop viewport after hot reload.
- State: default product-shot camera, static RGB mode.
- Browser console: no errors.

## Comparison and corrections

- P1 fixed: multi-unit caps were incorrectly multiplied by the single-key
  footprint scale. Space measured 5.81U instead of the intended 6.20U outer
  footprint. All keys now subtract one fixed 0.05U gap from their nominal width.
- P1 fixed: percentage shoulder taper disproportionately shortened Space,
  Shift, Backspace and Enter. Every cap now uses the same fixed 0.15U total
  shoulder inset.
- P1 fixed: rotating the complete keycap tilted the lower skirt and created
  inconsistent visible gaps. Lower skirts now remain vertical and seated on
  one plate height; row angle is baked into the shoulder and top surface only.
- P2 fixed: the original R1-R5 heights were oversized. The Cherry sculpt now
  spans 0.42-0.50U with a shallow cylindrical dish.
- P2 fixed: standard typing rows use a 1U centre pitch, while the function row
  retains the photographed 1.2U separation.
- P1 fixed: the procedural rounded boxes have been replaced by 14 outer shells
  extracted from the supplied STEP file. The live model now preserves the CAD
  trapezoidal skirt, sculpted top, cylindrical dish, corner transitions and
  row-specific height.
- P1 fixed: the supplied CAD confirms 19 mm pitch with an 18.2 mm 1U shell.
  Wide shells use the same fixed 0.8 mm physical gap: 22.95 mm (1.25U),
  27.7 mm (1.5U), 32.45 mm (1.75U), 41.95 mm (2.25U), 51.45 mm (2.75U)
  and 117.8 mm (6.25U).
- P1 fixed: Right Shift is 2.75U and Right Control is 1.25U, matching the
  supplied keyset instead of the previous 2.5U/1.75U approximation.
- P1 fixed: regular legends now use a readable 3-4 mm visual scale and the
  number/punctuation rows include both shifted and unshifted symbols.
- P1 fixed: Q/W/E/R, Enter and Space no longer use abstract placeholder
  geometry. A perspective-corrected 3x2 texture atlas was reconstructed from
  the supplied top-down photograph and UV-mapped into the CAD keycap material.
  No floating decal planes remain; artwork follows the sculpted top and sides.
- P1 fixed: Space uses a dedicated 6.25U aspect-ratio texture so its white/red
  artwork stays confined to the photographed area instead of stretching across
  the whole bar or repeating an atlas edge.
- P2 fixed: the Escape creature is lower, purple and elongated like the
  photographed artisan; the F13 handheld now has the grey display, yellow
  D-pad and two colored controls visible in the reference.
- P1 fixed: Enter is treated as a machined metal artisan rather than printed
  resin. Its body and raised perimeter use reflective metal materials, while
  the recessed illustration uses a photo-derived grayscale bump map to create
  real lighting response from the engraved grooves.
- P1 fixed: Escape now uses a thick translucent resin body with physically
  based transmission, refraction, colored attenuation and clearcoat. Its
  sculpture was rebuilt from four reference angles with round ears, side arms,
  cream muzzle, lightning/star eyes, purple teeth and the orange crystal.
- P1 fixed: Escape and F13 now render as complete artisan keycaps rising
  directly from the switch/plate height. The standard Cherry shell remains
  only as an invisible interaction target, so neither sculpt has a visible
  trapezoid base underneath it.
- P1 fixed: the Escape face is mapped onto the horizontal top surface, matching
  the supplied overhead photograph. The ears, inner ears, arms, muzzle,
  lightning/star eyes, teeth and lower buckle now all read from above instead
  of wrapping onto the front sidewall.

## Verification

- 1U CAD outer footprint: 18.2 mm on 19 mm pitch
- R1/R2 CAD height: 9.818 mm
- R3 CAD height: 7.874 mm
- R4 CAD height: 7.341 mm
- R5 CAD height: 8.584 mm
- Exported runtime asset: 14 named meshes, 1.83 MB GLB
- Automated tests: 85 passed
- Production build: 38 pages built

final result: passed
