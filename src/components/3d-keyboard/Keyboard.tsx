import { useMemo } from 'react';

import Keycap, { type KeyboardRgbRuntime } from './Keycap';
import KeyboardBase from './KeyboardBase';
import { ALL_KEYS, KEY_BY_CODE } from './keyboard-layout';
import { useKeyboardExperience } from './KeyboardExperience';
import { PRODUCT_SHOT } from './keyboard-product-shot';

// Physical Cherry sculpt: tall rear rows, neutral home row, kicked-up bottom row.
const ROW_Y = [0, 0.43, 0.38, 0.33, 0.3, 0.3] as const;

export default function Keyboard({ reducedMotion = false, active = true }: { reducedMotion?: boolean; active?: boolean }) {
  const defaultColor = PRODUCT_SHOT.palette.graphiteCap;
  const { state, press, release } = useKeyboardExperience();
  const pulseKey = state.pulse ? KEY_BY_CODE.get(state.pulse.code) : undefined;
  const rgbRuntime = useMemo<KeyboardRgbRuntime>(() => ({
    enabled: state.enabled,
    mode: state.mode,
    brightness: state.brightness,
    pulseX: pulseKey?.x ?? 0,
    pulseZ: pulseKey?.z ?? 0,
    pulseSequence: state.pulse?.sequence ?? 0,
  }), [state.enabled, state.mode, state.brightness, state.pulse?.sequence, pulseKey?.x, pulseKey?.z]);

  const renderKey = (key: (typeof ALL_KEYS)[number]) => (
    <Keycap
      key={key.code}
      code={key.code}
      position={[key.x, ROW_Y[key.row ?? 3], key.z]}
      label={key.label}
      color={'color' in key ? key.color : defaultColor}
      width={'w' in key ? key.w : 1}
      depth={'d' in key ? key.d : 1}
      row={key.row ?? 3}
      variant={'variant' in key ? key.variant : 'standard'}
      pressed={state.pressed.has(key.code)}
      onPress={press}
      onRelease={release}
      rgbColor={rgbRuntime}
      reducedMotion={reducedMotion}
      active={active}
    />
  );

  return (
    <group dispose={null} rotation={[PRODUCT_SHOT.keyboard.tiltX, 0, 0]}>
      <KeyboardBase />

      {ALL_KEYS.map(renderKey)}
    </group>
  );
}
