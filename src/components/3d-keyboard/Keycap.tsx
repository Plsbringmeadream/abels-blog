import { Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { RgbMode } from './keyboard-state';
import { keySpringIsMoving, stepKeySpringInPlace, type KeySpringState } from './keyboard-spring';
import { keyboardAnimationTime } from './keyboard-render-policy';
import { PRODUCT_SHOT } from './keyboard-product-shot';
import { KEYCAP_FOOTPRINT_SCALE } from './keyboard-layout';

export interface KeyboardRgbRuntime {
  enabled: boolean;
  mode: RgbMode;
  brightness: number;
  pulseX: number;
  pulseZ: number;
  pulseSequence: number;
}

export interface KeycapProps {
  position: [number, number, number];
  label: string;
  color?: string;
  width?: number;
  depth?: number;
  row?: number;
  code: string;
  pressed: boolean;
  reducedMotion?: boolean;
  active?: boolean;
  rgbColor: KeyboardRgbRuntime;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
}

interface PointerCaptureTarget {
  hasPointerCapture(pointerId: number): boolean;
  releasePointerCapture(pointerId: number): void;
}

// These resources are immutable and intentionally live for the application lifetime.
const keycapGeometries = new Map<string, THREE.BoxGeometry>();
const underlightGeometries = new Map<string, THREE.BoxGeometry>();
const keycapMaterials = new Map<string, THREE.MeshPhysicalMaterial>();
const STEM_GEOMETRY = new THREE.BoxGeometry(0.2, 0.15, 0.2);
const STEM_MATERIAL = new THREE.MeshStandardMaterial({
  color: PRODUCT_SHOT.palette.darkPlate, metalness: 0.04, roughness: 0.68,
});
const STATIC_LEFT = new THREE.Color('#8b5cf6');
const STATIC_RIGHT = new THREE.Color('#ec4899');
const RIPPLE_BASE = new THREE.Color('#160b2d');
const RIPPLE_RING = new THREE.Color().setHSL(0.88, 0.9, 0.68);

export function keycapLegendColor(capColor: string): string {
  return capColor.toLowerCase() === PRODUCT_SHOT.palette.redAccent.toLowerCase()
    ? '#fff7f2'
    : '#292b30';
}

function keycapGeometry(width: number, depth: number, height: number): THREE.BoxGeometry {
  const cacheKey = `${width}/${depth}/${height}`;
  const cached = keycapGeometries.get(cacheKey);
  if (cached) return cached;

  const w = width * KEYCAP_FOOTPRINT_SCALE;
  const d = depth * KEYCAP_FOOTPRINT_SCALE;
  const geometry = new THREE.BoxGeometry(w, height, d, 10, 4, 10);
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  for (let index = 0; index < positions.count; index += 1) {
    vertex.fromBufferAttribute(positions, index);
    const nx = vertex.x / (w / 2);
    const nz = vertex.z / (d / 2);
    if (vertex.y > height * 0.2) {
      if (vertex.y > height * 0.35) {
        vertex.y -= Math.pow(Math.max(Math.abs(nx), Math.abs(nz)), 1.5) * 0.04;
      }
      vertex.x *= 1 - 0.06 * (vertex.y / height);
      vertex.z *= 1 - 0.06 * (vertex.y / height);
    }
    if (vertex.y < -height * 0.3) {
      const flare = 1 + 0.04 * Math.abs(vertex.y / height);
      vertex.x *= flare;
      vertex.z *= flare;
    }
    positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  keycapGeometries.set(cacheKey, geometry);
  return geometry;
}

function underlightGeometry(width: number, depth: number): THREE.BoxGeometry {
  const cacheKey = `${width}/${depth}`;
  const cached = underlightGeometries.get(cacheKey);
  if (cached) return cached;
  const geometry = new THREE.BoxGeometry(width * 0.72, 0.012, depth * 0.72);
  underlightGeometries.set(cacheKey, geometry);
  return geometry;
}

function keycapMaterial(color: string): THREE.MeshPhysicalMaterial {
  const cached = keycapMaterials.get(color);
  if (cached) return cached;
  const material = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness: 0.78,
    clearcoat: 0.015,
    clearcoatRoughness: 0.82,
    envMapIntensity: 0.22,
  });
  keycapMaterials.set(color, material);
  return material;
}

function updateRgbColor(
  target: THREE.Color,
  x: number,
  z: number,
  runtime: KeyboardRgbRuntime,
  time: number,
  pulseStartedAt: number,
) {
  if (!runtime.enabled) {
    target.setRGB(0, 0, 0);
    return;
  }

  if (runtime.mode === 'ripple') {
    const age = Math.max(0, time - pulseStartedAt);
    const fade = Math.min(1, Math.max(0, 1 - age / 1.2));
    const distance = Math.hypot(x - runtime.pulseX, z - runtime.pulseZ);
    const ring = Math.exp(-((distance - age * 6) ** 2) / (2 * 0.45 ** 2)) * fade;
    target.copy(RIPPLE_BASE).lerp(RIPPLE_RING, ring).multiplyScalar(runtime.brightness);
    return;
  }

  if (runtime.mode === 'rainbow') {
    const hue = ((x * 0.035 + z * 0.025 - time * 0.08) % 1 + 1) % 1;
    target.setHSL(hue, 0.85, 0.58).multiplyScalar(runtime.brightness);
    return;
  }

  const normalizedX = Math.min(1, Math.max(0, (x + 7) / 16.5));
  target.copy(STATIC_LEFT).lerp(STATIC_RIGHT, normalizedX);
  if (runtime.mode === 'breathing') {
    target.multiplyScalar(Math.max(0, 0.55 + 0.45 * Math.sin(time * 2)));
  }
  target.multiplyScalar(runtime.brightness);
}

export default function Keycap({
  position,
  label,
  color = PRODUCT_SHOT.palette.whiteCap,
  width = 1,
  depth = 1,
  row = 3,
  code,
  pressed,
  reducedMotion = false,
  active = true,
  rgbColor,
  onPress,
  onRelease,
}: KeycapProps) {
  const movingGroup = useRef<THREE.Group>(null);
  const glowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const spring = useRef<KeySpringState>({ travel: 0, velocity: 0 });
  const pointerActive = useRef(false);
  const captureTarget = useRef<PointerCaptureTarget | null>(null);
  const capturedPointerId = useRef<number | null>(null);
  const pulseSequence = useRef(rgbColor.pulseSequence);
  const pulseStartedAt = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  const rowHeight = [0.50, 0.47, 0.44, 0.40, 0.36][Math.min(row - 1, 4)] || 0.44;
  const geometry = useMemo(() => keycapGeometry(width, depth, rowHeight), [width, depth, rowHeight]);
  const glowGeometry = useMemo(() => underlightGeometry(width, depth), [width, depth]);
  const capMaterial = useMemo(() => keycapMaterial(color), [color]);

  const releasePointer = (releaseCapture: boolean) => {
    const target = captureTarget.current;
    const pointerId = capturedPointerId.current;
    captureTarget.current = null;
    capturedPointerId.current = null;
    if (releaseCapture && target && pointerId !== null && target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
    if (!pointerActive.current) return;
    pointerActive.current = false;
    onRelease(code);
  };

  useEffect(() => () => releasePointer(true), []);

  useEffect(() => {
    invalidate();
  }, [pressed, invalidate]);

  useEffect(() => {
    if (glowMaterial.current && rgbColor.mode === 'static') {
      updateRgbColor(glowMaterial.current.color, position[0], position[2], rgbColor, 0, 0);
    } else if (glowMaterial.current && !rgbColor.enabled) {
      glowMaterial.current.color.setRGB(0, 0, 0);
    }
  }, [position, rgbColor]);

  useFrame(({ clock }, delta) => {
    stepKeySpringInPlace(spring.current, pressed, delta);
    if (movingGroup.current) movingGroup.current.position.y = spring.current.travel;
    if (keySpringIsMoving(spring.current, pressed)) invalidate();
    if (!glowMaterial.current || !rgbColor.enabled || rgbColor.mode === 'static') return;
    const time = keyboardAnimationTime(clock.getElapsedTime(), reducedMotion, active);
    if (pulseSequence.current !== rgbColor.pulseSequence) {
      pulseSequence.current = rgbColor.pulseSequence;
      pulseStartedAt.current = time;
    }
    updateRgbColor(
      glowMaterial.current.color,
      position[0],
      position[2],
      rgbColor,
      time,
      pulseStartedAt.current,
    );
  });

  return (
    <group position={position} rotation={[row === 1 ? 0.015 : row === 5 ? -0.015 : 0, 0, 0]}>
      <mesh geometry={glowGeometry} position={[0, -rowHeight * 0.5 - 0.01, 0]}>
        <meshBasicMaterial ref={glowMaterial} color="#000000" toneMapped={false} transparent opacity={0.82} />
      </mesh>

      <group ref={movingGroup}>
        <mesh geometry={STEM_GEOMETRY} material={STEM_MATERIAL} position={[0, -rowHeight * 0.5 - 0.02, 0]} />
        <mesh
          geometry={geometry}
          material={capMaterial}
          castShadow
          receiveShadow
          onPointerDown={(event) => {
            event.stopPropagation();
            if (pointerActive.current) return;
            pointerActive.current = true;
            captureTarget.current = event.target;
            capturedPointerId.current = event.pointerId;
            event.target.setPointerCapture(event.pointerId);
            onPress(code);
          }}
          onPointerUp={(event) => { event.stopPropagation(); releasePointer(true); }}
          onPointerCancel={(event) => { event.stopPropagation(); releasePointer(true); }}
          onLostPointerCapture={(event) => { event.stopPropagation(); releasePointer(false); }}
          onPointerLeave={(event) => { event.stopPropagation(); releasePointer(true); }}
        />

        <Text
          position={[0, rowHeight * 0.5 + 0.012, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={width > 1.2 ? 0.11 : 0.10}
          color={keycapLegendColor(color)}
          anchorX="center"
          anchorY="middle"
          characters={label}
        >
          {label}
        </Text>
      </group>
    </group>
  );
}
