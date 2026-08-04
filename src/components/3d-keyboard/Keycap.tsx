import { Text, useGLTF, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import type { RgbMode } from './keyboard-state';
import { keySpringIsMoving, stepKeySpringInPlace, type KeySpringState } from './keyboard-spring';
import { keyboardAnimationTime } from './keyboard-render-policy';
import { PRODUCT_SHOT } from './keyboard-product-shot';
import { keycapFootprint, type KeyVariant } from './keyboard-layout';
import SpecialKeycapDetails, {
  keycapArtworkCell,
  specialKeycapColor,
} from './SpecialKeycapDetails';

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
  variant?: KeyVariant;
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
const keycapGeometries = new Map<string, THREE.BufferGeometry>();
const underlightGeometries = new Map<string, THREE.BoxGeometry>();
const keycapMaterials = new Map<string, THREE.MeshPhysicalMaterial>();
const STEM_GEOMETRY = new THREE.BoxGeometry(0.2, 0.15, 0.2);
const STEM_MATERIAL = new THREE.MeshStandardMaterial({
  color: PRODUCT_SHOT.palette.darkPlate, metalness: 0.04, roughness: 0.68,
});
const ENGRAVED_METAL_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: '#858b91',
  metalness: 0.96,
  roughness: 0.27,
  clearcoat: 0.12,
  clearcoatRoughness: 0.24,
  envMapIntensity: 1.15,
});
const SCULPT_HIT_MATERIAL = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
  colorWrite: false,
});
const STATIC_LEFT = new THREE.Color('#b80020');
const STATIC_RIGHT = new THREE.Color('#ff3150');
const RIPPLE_BASE = new THREE.Color('#230006');
const RIPPLE_RING = new THREE.Color('#ff3454');

export const CHERRY_PROFILES = Object.freeze({
  1: Object.freeze({ height: 9.818 / 19, angle: 0.095, dish: 0.038 }),
  2: Object.freeze({ height: 9.818 / 19, angle: 0.065, dish: 0.036 }),
  3: Object.freeze({ height: 7.874 / 19, angle: 0.015, dish: 0.034 }),
  4: Object.freeze({ height: 7.341 / 19, angle: -0.04, dish: 0.032 }),
  5: Object.freeze({ height: 8.584 / 19, angle: -0.075, dish: 0.032 }),
});

function cherryProfile(row: number) {
  return CHERRY_PROFILES[Math.min(5, Math.max(1, row)) as keyof typeof CHERRY_PROFILES];
}

export function keycapLegendColor(capColor: string): string {
  const darkCaps = [
    PRODUCT_SHOT.palette.blackCap,
    PRODUCT_SHOT.palette.graphiteCap,
    PRODUCT_SHOT.palette.magentaAccent,
  ].map((color) => color.toLowerCase());
  return darkCaps.includes(capColor.toLowerCase()) ? '#f1f0ec' : '#25272c';
}

export const KEYCAP_TOP_INSET = 0.15;

export function isFullSculptKeycapVariant(variant: KeyVariant): boolean {
  return variant === 'creature' || variant === 'gamepad';
}

export function cherryCadMeshName(row: number, width: number): string {
  const normalizedRow = Math.min(5, Math.max(1, row));
  const supportedWidths: Readonly<Record<number, readonly number[]>> = {
    1: [1],
    2: [1, 2],
    3: [1, 1.5],
    4: [1, 1.75, 2.25],
    5: [1, 1.25, 1.75, 2.25, 2.75, 6.25],
  };
  const resolvedWidth = supportedWidths[normalizedRow]?.includes(width) ? width : 1;
  return `r${normalizedRow}_${String(resolvedWidth).replace('.', '_')}u`;
}

export function keycapLegendFontSize(label: string, width: number): number {
  if (label.includes('\n')) return 0.145;
  if (label.length <= 2) return 0.19;
  if (label.length <= 4) return 0.155;
  if (width >= 1.5) return 0.135;
  return 0.12;
}

function keycapGeometry(
  width: number,
  depth: number,
  height: number,
  dish: number,
  angle: number,
): THREE.BufferGeometry {
  const cacheKey = `${width}/${depth}/${height}/${dish}/${angle}`;
  const cached = keycapGeometries.get(cacheKey);
  if (cached) return cached;

  const w = keycapFootprint(width);
  const d = keycapFootprint(depth);
  const geometry = new RoundedBoxGeometry(w, height, d, 8, Math.min(0.055, w * 0.06, d * 0.06));
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  for (let index = 0; index < positions.count; index += 1) {
    vertex.fromBufferAttribute(positions, index);
    const vertical = THREE.MathUtils.clamp((vertex.y + height / 2) / height, 0, 1);
    // A Cherry cap has a near-vertical lower skirt, then a more pronounced
    // shoulder taper toward the smaller sculpted top surface.
    const shoulder = THREE.MathUtils.smoothstep(vertical, 0.12, 0.92);
    // The shoulder inset is a fixed physical amount. Percentage tapering
    // incorrectly shortens wide keys such as Space, Shift and Enter.
    const taperX = 1 - (shoulder * KEYCAP_TOP_INSET) / w;
    const taperZ = 1 - (shoulder * KEYCAP_TOP_INSET) / d;
    vertex.x *= taperX;
    vertex.z *= taperZ;
    vertex.y += Math.tan(angle) * vertex.z * shoulder;

    if (vertex.y > height * 0.34) {
      const nx = THREE.MathUtils.clamp(vertex.x / (w * 0.43), -1, 1);
      const nz = THREE.MathUtils.clamp(vertex.z / (d * 0.43), -1, 1);
      // Cherry uses a cylindrical front-to-back dish with only a trace of
      // side-to-side curvature.
      vertex.y -= dish * (1 - nz * nz) + dish * 0.16 * (1 - nx * nx);
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
    roughness: 0.72,
    clearcoat: 0.012,
    clearcoatRoughness: 0.9,
    envMapIntensity: 0.28,
  });
  keycapMaterials.set(color, material);
  return material;
}

function artworkGeometry(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geometry = source.clone();
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const positions = geometry.attributes.position;
  if (!bounds || !positions) return geometry;

  const uvs = new Float32Array(positions.count * 2);
  const width = Math.max(0.001, bounds.max.x - bounds.min.x);
  const depth = Math.max(0.001, bounds.max.z - bounds.min.z);

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    const u = (x - bounds.min.x) / width;
    // Image top points toward the keyboard's rear (-Z).
    const v = (bounds.max.z - z) / depth;
    uvs[index * 2] = u;
    uvs[index * 2 + 1] = v;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

function artworkTexture(
  source: THREE.Texture,
  cell: readonly [number, number],
  integrated = false,
): THREE.Texture {
  const [column, row] = cell;
  const texture = source.clone();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  if (!integrated) {
    const columnOffsets = [0.013, 0.34, 0.669] as const;
    texture.repeat.set(0.315, 0.475);
    texture.offset.set(columnOffsets[column], row === 1 ? 0.51 : 0.015);
  }
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function artworkMaterial(texture: THREE.Texture): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    map: texture,
    metalness: 0,
    roughness: 0.66,
    clearcoat: 0.015,
    clearcoatRoughness: 0.9,
    envMapIntensity: 0.25,
  });
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

  const normalizedX = Math.min(1, Math.max(0, (x + 9.5) / 19));
  target.copy(STATIC_LEFT).lerp(STATIC_RIGHT, normalizedX);
  if (runtime.mode === 'breathing') {
    target.multiplyScalar(Math.max(0, 0.55 + 0.45 * Math.sin(time * 2)));
  }
  target.multiplyScalar(runtime.brightness);
}

export default function Keycap({
  position,
  label,
  color = PRODUCT_SHOT.palette.graphiteCap,
  width = 1,
  depth = 1,
  row = 3,
  code,
  variant = 'standard',
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
  const profile = cherryProfile(row);
  const rowHeight = profile.height;
  const atlas = useTexture('/keycap-art/custom-keycap-atlas.png');
  const spaceArtwork = useTexture('/keycap-art/space-art-integrated.webp');
  const cadModel = useGLTF('/models/cherry-profile-pbt.glb') as unknown as {
    nodes: Readonly<Record<string, THREE.Mesh>>;
  };
  const fallbackGeometry = useMemo(
    () => keycapGeometry(width, depth, rowHeight, profile.dish, profile.angle),
    [width, depth, rowHeight, profile.dish, profile.angle],
  );
  const baseGeometry = cadModel.nodes[cherryCadMeshName(row, width)]?.geometry ?? fallbackGeometry;
  const glowGeometry = useMemo(() => underlightGeometry(width, depth), [width, depth]);
  const renderedColor = specialKeycapColor(variant, color);
  const isFullSculpt = isFullSculptKeycapVariant(variant);
  const artworkCell = keycapArtworkCell(variant);
  const geometry = useMemo(
    () => artworkCell ? artworkGeometry(baseGeometry) : baseGeometry,
    [artworkCell, baseGeometry],
  );
  const mappedTexture = useMemo(
    () => artworkCell
      ? artworkTexture(
          variant === 'space-art' ? spaceArtwork : atlas,
          artworkCell,
          variant === 'space-art',
        )
      : undefined,
    [artworkCell, atlas, spaceArtwork, variant],
  );
  const capMaterial = useMemo(
    () => {
      if (mappedTexture) return artworkMaterial(mappedTexture);
      if (variant === 'etched-enter') return ENGRAVED_METAL_MATERIAL;
      return keycapMaterial(renderedColor);
    },
    [mappedTexture, renderedColor, variant],
  );

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
    <group position={position}>
      <mesh geometry={glowGeometry} position={[0, -rowHeight * 0.5 - 0.01, 0]}>
        <meshBasicMaterial ref={glowMaterial} color="#000000" toneMapped={false} transparent opacity={0.82} />
      </mesh>

      <group ref={movingGroup}>
        <mesh geometry={STEM_GEOMETRY} material={STEM_MATERIAL} position={[0, -rowHeight * 0.5 - 0.02, 0]} />
        <mesh
          geometry={geometry}
          material={isFullSculpt ? SCULPT_HIT_MATERIAL : capMaterial}
          castShadow={!isFullSculpt}
          receiveShadow={!isFullSculpt}
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

        {label && !isFullSculpt && (
          <Text
            position={[0, rowHeight * 0.5 + 0.018, 0]}
            rotation={[-Math.PI / 2 + profile.angle, 0, 0]}
            fontSize={keycapLegendFontSize(label, width)}
            lineHeight={0.8}
            letterSpacing={-0.025}
            color={keycapLegendColor(renderedColor)}
            anchorX="center"
            anchorY="middle"
            characters={label}
          >
            {label}
          </Text>
        )}
        <group rotation={[profile.angle, 0, 0]}>
          <SpecialKeycapDetails variant={variant} width={width} height={rowHeight} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload('/models/cherry-profile-pbt.glb');
