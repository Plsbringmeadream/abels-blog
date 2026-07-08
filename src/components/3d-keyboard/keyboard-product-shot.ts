import { PerspectiveCamera, Vector3 as ThreeVector3 } from 'three';

import { KEYBOARD_CASE_BOUNDS } from './keyboard-geometry';

type Vector3 = readonly [number, number, number];

interface ProductLight {
  readonly color: string;
  readonly position: Vector3;
  readonly intensity: number;
}

interface KeyboardCaseBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly minZ: number;
  readonly maxZ: number;
}

interface CameraConfig {
  readonly position: Vector3;
  readonly target: Vector3;
  readonly fov: number;
  readonly referenceAspect: number;
  readonly keyboardCoverage: number;
  readonly controls: Readonly<{
    minDistance: number;
    maxDistance: number;
  }>;
}

const vector3 = (x: number, y: number, z: number): Vector3 => Object.freeze([x, y, z]);

const light = (color: string, position: Vector3, intensity: number): Readonly<ProductLight> =>
  Object.freeze({ color, position, intensity });

export function computeTiltedKeyboardMinY(
  positionY: number,
  tiltX: number,
  bounds: Readonly<KeyboardCaseBounds>,
): number {
  const cos = Math.cos(tiltX);
  const sin = Math.sin(tiltX);
  return Math.min(
    ...[bounds.minY, bounds.maxY].flatMap((y) =>
      [bounds.minZ, bounds.maxZ].map((z) => positionY + y * cos - z * sin),
    ),
  );
}

export function cameraPositionForAspect(camera: Readonly<CameraConfig>, aspect: number): Vector3 {
  const target = new ThreeVector3(...camera.target);
  const offset = new ThreeVector3(...camera.position).sub(target);
  offset.multiplyScalar(camera.referenceAspect / aspect);
  const position = target.add(offset);
  return [position.x, position.y, position.z];
}

export function projectKeyboardBounds(
  cameraConfig: Pick<CameraConfig, 'position' | 'target' | 'fov'>,
  keyboard: { readonly position: Vector3; readonly rotationY: number; readonly tiltX: number },
  bounds: Readonly<KeyboardCaseBounds>,
  aspect: number,
) {
  const camera = new PerspectiveCamera(cameraConfig.fov, aspect, 0.1, 100);
  camera.position.set(...cameraConfig.position);
  camera.lookAt(...cameraConfig.target);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  const projected = [bounds.minX, bounds.maxX].flatMap((x) =>
    [bounds.minY, bounds.maxY].flatMap((y) =>
      [bounds.minZ, bounds.maxZ].map((z) => {
        const point = new ThreeVector3(x, y, z)
          .applyAxisAngle(new ThreeVector3(1, 0, 0), keyboard.tiltX)
          .applyAxisAngle(new ThreeVector3(0, 1, 0), keyboard.rotationY)
          .add(new ThreeVector3(...keyboard.position))
          .project(camera);
        return point;
      }),
    ),
  );
  const xs = projected.map(({ x }) => x);
  const ys = projected.map(({ y }) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY, widthCoverage: (maxX - minX) / 2 };
}

const DESK_TOP_Y = -0.35;
const KEYBOARD_TILT_X = 0.04;
const KEYBOARD_CLEARANCE = 0.02;
const UNPLACED_KEYBOARD_MIN_Y = computeTiltedKeyboardMinY(0, KEYBOARD_TILT_X, KEYBOARD_CASE_BOUNDS);

export const PRODUCT_SHOT = Object.freeze({
  homepage: Object.freeze({
    camera: Object.freeze({
      position: vector3(23.04, 12.83, 24.88),
      target: vector3(0, 0.35, 0),
      fov: 30,
      referenceAspect: 1.5,
      keyboardCoverage: 0.7,
      controls: Object.freeze({ minDistance: 20, maxDistance: 60 }),
    }),
  }),
  desk: Object.freeze({
    width: 40,
    depth: 24,
    thickness: 0.3,
    color: '#17181c',
    roughness: 0.88,
    topY: DESK_TOP_Y,
  }),
  keyboard: Object.freeze({
    position: vector3(0, DESK_TOP_Y + KEYBOARD_CLEARANCE - UNPLACED_KEYBOARD_MIN_Y, 0.25),
    rotationY: -0.08,
    tiltX: KEYBOARD_TILT_X,
    clearance: KEYBOARD_CLEARANCE,
    caseBounds: KEYBOARD_CASE_BOUNDS,
  }),
  shadows: Object.freeze({
    directional: Object.freeze({ left: -12, right: 12, top: 10, bottom: -10, mapSize: 1024 }),
    contact: Object.freeze({ scale: 24, resolution: 512, frames: 1 }),
  }),
  palette: Object.freeze({
    silverCase: '#aeb4bd',
    silverFrame: '#d5d9df',
    darkPlate: '#24262b',
    whiteCap: '#f4f2ed',
    grayCap: '#a7a9ad',
    redAccent: '#d83b35',
    purpleLight: '#7c3aed',
  }),
  lights: Object.freeze({
    coolKey: light('#d8e8ff', vector3(5.5, 8.5, 6.5), 4.2),
    purpleRim: light('#7c3aed', vector3(-7, 4.5, -5.5), 3.4),
    warmFill: light('#ffd6ad', vector3(-4.5, 3.2, 7), 2.1),
  }),
});
