import { RoundedBox } from '@react-three/drei';

import { PRODUCT_SHOT } from './keyboard-product-shot';
import {
  KEYBOARD_BASE_GROUP_Y,
  KEYBOARD_CASE_DEPTH,
  KEYBOARD_CASE_WIDTH,
  KEYBOARD_FRONT_LIP,
  KEYBOARD_PLATE_WIDTH,
} from './keyboard-geometry';

interface KeyboardBaseProps {
  width?: number;
  depth?: number;
}

/**
 * Realistic mechanical keyboard case:
 * - Outer shell with beveled edges
 * - Inner recess where the plate sits
 * - Slight angle ( typing angle )
 */
export default function KeyboardBase({ width = KEYBOARD_CASE_WIDTH, depth = KEYBOARD_CASE_DEPTH }: KeyboardBaseProps) {
  const { silverCase, silverFrame, darkPlate, purpleLight } = PRODUCT_SHOT.palette;

  return (
    <group position={[0, KEYBOARD_BASE_GROUP_Y, 0]}>
      {/* Bottom case — main body */}
      <RoundedBox args={[width, 0.36, depth, 0.15]} smoothness={6} position={[0, -0.08, 0]}>
        <meshPhysicalMaterial
          color={silverCase}
          metalness={0.68}
          roughness={0.34}
          clearcoat={0.04}
          envMapIntensity={0.72}
        />
      </RoundedBox>

      {/* Top bezel / frame — sits above the case */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={`frame-x-${side}`}
          args={[0.3, 0.14, depth - 0.3, 0.08]}
          smoothness={4}
          position={[side * width * 0.5, 0.17, 0]}
        >
          <meshPhysicalMaterial color={silverFrame} metalness={0.62} roughness={0.3} clearcoat={0.04} />
        </RoundedBox>
      ))}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={`frame-z-${side}`}
          args={[width + 0.3, 0.14, 0.3, 0.08]}
          smoothness={4}
          position={[0, 0.17, side * depth * 0.5]}
        >
          <meshPhysicalMaterial color={silverFrame} metalness={0.62} roughness={0.3} clearcoat={0.04} />
        </RoundedBox>
      ))}

      {/* Inner plate (metal) — visible between keycaps */}
      <RoundedBox args={[KEYBOARD_PLATE_WIDTH, 0.04, depth - 0.6, 0.04]} smoothness={4} position={[0, 0.14, 0]}>
        <meshPhysicalMaterial
          color={darkPlate}
          metalness={0.58}
          roughness={0.42}
        />
      </RoundedBox>

      {/* Narrow front lip gives the case a visibly machined, substantial edge. */}
      <RoundedBox
        args={[width - KEYBOARD_FRONT_LIP.widthInset, KEYBOARD_FRONT_LIP.height, KEYBOARD_FRONT_LIP.depth, 0.06]}
        smoothness={4}
        position={[0, KEYBOARD_FRONT_LIP.centerY, KEYBOARD_FRONT_LIP.centerZ]}
      >
        <meshPhysicalMaterial
          color={silverCase}
          metalness={0.66}
          roughness={0.38}
          clearcoat={0.03}
        />
      </RoundedBox>

      {/* Front badge accent line */}
      <mesh position={[0, -0.06, depth * 0.47]}>
        <boxGeometry args={[1.2, 0.02, 0.04]} />
        <meshPhysicalMaterial
          color={purpleLight}
          metalness={0.48}
          roughness={0.3}
          emissive={purpleLight}
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  );
}
