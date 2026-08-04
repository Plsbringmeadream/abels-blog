import { RoundedBox, useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import type { KeyVariant } from './keyboard-layout';
import { PRODUCT_SHOT } from './keyboard-product-shot';

interface SpecialKeycapDetailsProps {
  variant: KeyVariant;
  width: number;
  height: number;
}

const ANIME_COLORS: Readonly<Record<string, string>> = Object.freeze({
  'anime-red': '#b52c36',
  'anime-blue': '#3b79a6',
  'anime-purple': '#7b3e91',
  'anime-mint': '#58a88c',
});

const STAR_SHAPE = (() => {
  const shape = new THREE.Shape();
  for (let point = 0; point < 10; point += 1) {
    const radius = point % 2 === 0 ? 0.09 : 0.04;
    const angle = Math.PI / 2 + (point * Math.PI) / 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (point === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
})();

const LIGHTNING_SHAPE = (() => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.08, 0.07);
  shape.lineTo(0.015, 0.045);
  shape.lineTo(-0.025, -0.005);
  shape.lineTo(0.08, -0.035);
  shape.lineTo(-0.015, -0.055);
  shape.lineTo(0.02, -0.11);
  shape.lineTo(-0.095, -0.025);
  shape.closePath();
  return shape;
})();

function ResinSurface({ color = '#df58ca' }: { color?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      transmission={0.62}
      thickness={0.38}
      attenuationColor="#ff62dc"
      attenuationDistance={0.9}
      ior={1.47}
      roughness={0.31}
      clearcoat={0.34}
      clearcoatRoughness={0.24}
      envMapIntensity={0.85}
      transparent
      opacity={0.88}
    />
  );
}

export function specialKeycapColor(variant: KeyVariant | undefined, fallback: string): string {
  if (!variant || variant === 'standard' || variant === 'space-art') return fallback;
  if (variant === 'creature') return PRODUCT_SHOT.palette.magentaAccent;
  if (variant === 'gamepad') return PRODUCT_SHOT.palette.creamAccent;
  if (variant === 'etched-enter') return PRODUCT_SHOT.palette.silverAccent;
  return ANIME_COLORS[variant] ?? fallback;
}

export const KEYCAP_ARTWORK_CELLS = Object.freeze({
  'anime-red': [0, 1],
  'anime-blue': [1, 1],
  'anime-purple': [2, 1],
  'anime-mint': [0, 0],
  'space-art': [2, 0],
} satisfies Readonly<Record<string, readonly [number, number]>>);

export function keycapArtworkCell(
  variant: KeyVariant,
): readonly [number, number] | undefined {
  return KEYCAP_ARTWORK_CELLS[variant as keyof typeof KEYCAP_ARTWORK_CELLS];
}

function EngravedMetalTop({ width, height }: { width: number; height: number }) {
  const source = useTexture('/keycap-art/enter-engraving-v2.png');
  const engraving = useMemo(() => {
    const texture = source.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [source]);
  const rimWidth = width * 0.86;
  const rimDepth = 0.72;
  const rimThickness = 0.055;

  return (
    <group position={[0, height / 2 + 0.018, 0]}>
      {[-1, 1].map((direction) => (
        <RoundedBox
          key={`horizontal-${direction}`}
          args={[rimWidth, 0.04, rimThickness]}
          radius={0.018}
          smoothness={4}
          position={[0, 0.02, direction * (rimDepth / 2 - rimThickness / 2)]}
        >
          <meshPhysicalMaterial
            color="#c9cdd1"
            metalness={1}
            roughness={0.2}
            clearcoat={0.16}
            clearcoatRoughness={0.18}
            envMapIntensity={1.2}
          />
        </RoundedBox>
      ))}
      {[-1, 1].map((direction) => (
        <RoundedBox
          key={`vertical-${direction}`}
          args={[rimThickness, 0.04, rimDepth - rimThickness * 2]}
          radius={0.018}
          smoothness={4}
          position={[direction * (rimWidth / 2 - rimThickness / 2), 0.02, 0]}
        >
          <meshPhysicalMaterial
            color="#c9cdd1"
            metalness={1}
            roughness={0.2}
            clearcoat={0.16}
            clearcoatRoughness={0.18}
            envMapIntensity={1.2}
          />
        </RoundedBox>
      ))}
      <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 0.77, 0.56, 32, 12]} />
        <meshPhysicalMaterial
          color="#a7aaad"
          map={engraving}
          bumpMap={engraving}
          bumpScale={0.038}
          metalness={0.58}
          roughness={0.62}
          clearcoat={0}
          envMapIntensity={0.42}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
    </group>
  );
}

export default function SpecialKeycapDetails({
  variant,
  width,
  height,
}: SpecialKeycapDetailsProps) {
  const topY = height / 2;

  if (variant.startsWith('anime-')) {
    return null;
  }

  if (variant === 'creature') {
    return (
      <group position={[0, topY - 0.32, 0.015]}>
        <RoundedBox
          args={[0.72, 0.48, 0.62]}
          radius={0.095}
          smoothness={6}
          position={[0, 0, 0]}
        >
          <ResinSurface />
        </RoundedBox>

        {[-0.245, 0.245].map((x) => (
          <mesh key={`ear-${x}`} position={[x, 0.205, -0.06]}>
            <sphereGeometry args={[0.125, 22, 14]} />
            <ResinSurface color="#d854c5" />
          </mesh>
        ))}
        {[-0.245, 0.245].map((x) => (
          <mesh key={`inner-ear-${x}`} position={[x, 0.275, -0.06]} scale={[1, 0.28, 1]}>
            <sphereGeometry args={[0.054, 16, 10]} />
            <meshPhysicalMaterial color="#a63db2" roughness={0.42} />
          </mesh>
        ))}

        {[-0.285, 0.285].map((x) => (
          <mesh
            key={`arm-${x}`}
            position={[x, 0.235, 0.12]}
            rotation={[Math.PI / 2, 0, x > 0 ? -0.08 : 0.08]}
          >
            <capsuleGeometry args={[0.058, 0.21, 7, 14]} />
            <ResinSurface color="#cf4fc0" />
          </mesh>
        ))}

        <group position={[0, 0.25, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh position={[0, -0.105, 0]} scale={[1.35, 0.72, 0.22]}>
            <sphereGeometry args={[0.16, 24, 14]} />
            <meshPhysicalMaterial
              color="#94409d"
              transmission={0.18}
              thickness={0.12}
              roughness={0.48}
            />
          </mesh>

          <mesh position={[0, 0.005, 0.025]} scale={[1.3, 0.58, 0.25]}>
            <sphereGeometry args={[0.15, 22, 12]} />
            <meshPhysicalMaterial color="#e8e39a" roughness={0.52} />
          </mesh>
          <mesh position={[0, 0.03, 0.071]} scale={[1.25, 0.7, 0.5]}>
            <sphereGeometry args={[0.033, 14, 9]} />
            <meshStandardMaterial color="#a2399d" roughness={0.46} />
          </mesh>

          <mesh position={[-0.14, 0.07, 0.064]} rotation={[0, 0, -0.18]}>
            <shapeGeometry args={[LIGHTNING_SHAPE]} />
            <meshStandardMaterial color="#f3df35" roughness={0.45} />
          </mesh>
          <mesh position={[0.145, 0.07, 0.064]} rotation={[0, 0, -0.12]}>
            <shapeGeometry args={[STAR_SHAPE]} />
            <meshStandardMaterial color="#f3df35" roughness={0.45} />
          </mesh>

          {[-0.105, -0.035, 0.04, 0.11].map((x, index) => (
            <mesh
              key={`tooth-${x}`}
              position={[x, -0.11 + (index % 2) * 0.012, 0.075]}
              rotation={[0, 0, Math.PI]}
            >
              <coneGeometry args={[0.034, 0.09, 7]} />
              <meshStandardMaterial color="#9270d3" roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[-0.145, -0.15, 0.075]}>
            <octahedronGeometry args={[0.035, 0]} />
            <meshPhysicalMaterial
              color="#e9a126"
              emissive="#b65309"
              emissiveIntensity={0.28}
              roughness={0.28}
              clearcoat={0.35}
            />
          </mesh>
        </group>

        <group position={[0, 0.255, 0.255]}>
          <mesh scale={[1.4, 0.3, 0.62]}>
            <sphereGeometry args={[0.09, 18, 10]} />
            <meshStandardMaterial color="#8156bd" roughness={0.53} />
          </mesh>
          <mesh position={[0, 0.035, 0]} scale={[1.15, 0.35, 0.65]}>
            <sphereGeometry args={[0.042, 14, 8]} />
            <meshStandardMaterial color="#e6e4af" roughness={0.52} />
          </mesh>
        </group>
      </group>
    );
  }

  if (variant === 'gamepad') {
    return (
      <group position={[0, topY - 0.31, 0]}>
        <RoundedBox
          args={[0.72, 0.42, 0.64]}
          radius={0.045}
          smoothness={4}
          position={[0, 0.02, 0]}
        >
          <meshPhysicalMaterial color="#f2eee3" roughness={0.5} clearcoat={0.08} />
        </RoundedBox>
        <RoundedBox
          args={[0.62, 0.16, 0.52]}
          radius={0.04}
          smoothness={4}
          position={[0, 0.255, -0.02]}
        >
          <meshPhysicalMaterial color="#f6f2e8" roughness={0.47} clearcoat={0.08} />
        </RoundedBox>
        <mesh position={[0, 0.342, -0.095]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.42, 0.23]} />
          <meshBasicMaterial color="#a9aaa4" />
        </mesh>
        {[-0.1, 0.1].map((x) => (
          <mesh key={`screen-${x}`} position={[x, 0.347, -0.095]}>
            <sphereGeometry args={[0.025, 10, 7]} />
            <meshBasicMaterial color="#666862" />
          </mesh>
        ))}
        <mesh position={[-0.18, 0.347, 0.105]}>
          <boxGeometry args={[0.19, 0.025, 0.06]} />
          <meshBasicMaterial color="#e2b817" />
        </mesh>
        <mesh position={[-0.18, 0.347, 0.105]}>
          <boxGeometry args={[0.06, 0.027, 0.19]} />
          <meshBasicMaterial color="#e2b817" />
        </mesh>
        {[-0.045, 0.055].map((z, index) => (
          <mesh key={z} position={[0.2 + index * 0.1, 0.354, 0.095 + z]}>
            <sphereGeometry args={[0.038, 10, 8]} />
            <meshBasicMaterial color={index ? '#52a8b7' : '#d95a67'} />
          </mesh>
        ))}
        {[-0.14, 0.14].map((x) => (
          <mesh
            key={`front-notch-${x}`}
            position={[x, 0.045, 0.325]}
            rotation={[Math.PI / 2, 0, Math.PI]}
          >
            <coneGeometry args={[0.045, 0.012, 3]} />
            <meshStandardMaterial color="#d8d5cc" roughness={0.62} />
          </mesh>
        ))}
      </group>
    );
  }

  if (variant === 'etched-enter') {
    return <EngravedMetalTop width={width} height={height} />;
  }

  if (variant === 'space-art') {
    return null;
  }

  return null;
}
