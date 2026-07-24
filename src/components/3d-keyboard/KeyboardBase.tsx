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
 * Photo-matched TKL chassis:
 * a thick anodized aluminium upper shell over a mirror-PVD lower weight,
 * with the USB-C socket inset into the rear PVD band.
 */
export default function KeyboardBase({
  width = KEYBOARD_CASE_WIDTH,
  depth = KEYBOARD_CASE_DEPTH,
}: KeyboardBaseProps) {
  const {
    blackCase,
    blackFrame,
    darkPlate,
    mirrorMetal,
    redLight,
    silverAccent,
  } = PRODUCT_SHOT.palette;

  return (
    <group position={[0, KEYBOARD_BASE_GROUP_Y, 0]}>
      <RoundedBox
        name="anodized-aluminium-upper-shell"
        args={[width, 0.72, depth, 0.105]}
        smoothness={6}
        position={[0, -0.08, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={blackCase}
          metalness={0.88}
          roughness={0.29}
          anisotropy={0.34}
          anisotropyRotation={Math.PI / 2}
          clearcoat={0.025}
          clearcoatRoughness={0.62}
          envMapIntensity={1.25}
        />
      </RoundedBox>

      {/* Thin chamfer around one continuous CNC-machined top frame. */}
      <RoundedBox
        name="machined-top-deck"
        args={[width - 0.16, 0.105, depth - 0.16, 0.06]}
        smoothness={5}
        position={[0, 0.315, 0]}
      >
        <meshPhysicalMaterial
          color={blackFrame}
          metalness={0.9}
          roughness={0.25}
          anisotropy={0.42}
          anisotropyRotation={Math.PI / 2}
          clearcoat={0.018}
          envMapIntensity={1.35}
        />
      </RoundedBox>

      <RoundedBox
        name="recessed-switch-plate"
        args={[KEYBOARD_PLATE_WIDTH - 0.28, 0.045, depth - 0.48, 0.045]}
        smoothness={4}
        position={[0, 0.376, 0]}
        receiveShadow
      >
        <meshPhysicalMaterial color={darkPlate} metalness={0.7} roughness={0.48} envMapIntensity={0.7} />
      </RoundedBox>

      {/* The real board has one broad separation channel before the TKL navigation block. */}
      <mesh position={[6.35, 0.405, 0.05]}>
        <boxGeometry args={[0.17, 0.035, depth - 0.7]} />
        <meshStandardMaterial color={blackCase} metalness={0.48} roughness={0.5} />
      </mesh>

      {/* WORK BLADE plaque occupying the empty TKL utility lane. */}
      <RoundedBox args={[2.86, 0.075, 0.38, 0.035]} smoothness={3} position={[8.24, 0.405, 0.25]}>
        <meshPhysicalMaterial color={silverAccent} metalness={1} roughness={0.08} envMapIntensity={2.2} />
      </RoundedBox>
      <mesh position={[8.65, 0.448, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.16, 0.075]} />
        <meshBasicMaterial color={redLight} toneMapped={false} />
      </mesh>

      {/* Slim continuous mirror-PVD lower chassis, visible only below the shell. */}
      <RoundedBox
        name="mirror-pvd-lower-frame"
        args={[width - 0.38, 0.26, depth - 0.22, 0.095]}
        smoothness={7}
        position={[0, -0.51, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color={mirrorMetal}
          metalness={1}
          roughness={0.035}
          clearcoat={1}
          clearcoatRoughness={0.025}
          envMapIntensity={3}
          ior={1.52}
        />
      </RoundedBox>

      {/* Tall black wall masks most of the PVD from the typing/front view. */}
      <RoundedBox
        name="black-front-wall"
        args={[
          width - KEYBOARD_FRONT_LIP.widthInset,
          KEYBOARD_FRONT_LIP.height,
          KEYBOARD_FRONT_LIP.depth,
          0.07,
        ]}
        smoothness={4}
        position={[0, KEYBOARD_FRONT_LIP.centerY, KEYBOARD_FRONT_LIP.centerZ]}
      >
        <meshPhysicalMaterial
          color={blackCase}
          metalness={0.9}
          roughness={0.28}
          anisotropy={0.32}
          anisotropyRotation={Math.PI / 2}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Rear reference: USB-C is centered in the exposed mirror-PVD strip. */}
      <RoundedBox
        name="rear-pvd-usb-c-trim"
        args={[0.69, 0.245, 0.105, 0.07]}
        smoothness={5}
        position={[0, -0.48, -depth / 2 - 0.055]}
      >
        <meshPhysicalMaterial color={mirrorMetal} metalness={1} roughness={0.035} envMapIntensity={3} />
      </RoundedBox>
      <RoundedBox
        name="rear-pvd-usb-c-opening"
        args={[0.48, 0.12, 0.12, 0.047]}
        smoothness={5}
        position={[0, -0.48, -depth / 2 - 0.12]}
      >
        <meshStandardMaterial color="#090a0c" metalness={0.2} roughness={0.45} />
      </RoundedBox>

      {/* Low rubber feet remain visible in orbit views. */}
      {[-7.9, 7.9].flatMap((x) =>
        [-2.95, 2.7].map((z) => (
          <RoundedBox key={`${x}/${z}`} args={[1.1, 0.09, 0.34, 0.08]} smoothness={3} position={[x, -0.52, z]}>
            <meshStandardMaterial color="#050506" roughness={0.92} />
          </RoundedBox>
        )),
      )}
    </group>
  );
}
