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
      position: vector3(24.4, 7.25, 30.2),
      target: vector3(0, -0.02, 0.3),
      fov: 31,
      referenceAspect: 1.5,
      keyboardCoverage: 0.7,
      controls: Object.freeze({ minDistance: 22, maxDistance: 68 }),
    }),
  }),
  desk: Object.freeze({
    width: 52,
    depth: 40,
    thickness: 0.3,
    color: '#15161a',
    roughness: 0.9,
    topY: DESK_TOP_Y,
  }),
  keyboard: Object.freeze({
    position: vector3(0, DESK_TOP_Y + KEYBOARD_CLEARANCE - UNPLACED_KEYBOARD_MIN_Y, 0.25),
    rotationY: -0.065,
    tiltX: KEYBOARD_TILT_X,
    clearance: KEYBOARD_CLEARANCE,
    caseBounds: KEYBOARD_CASE_BOUNDS,
  }),
  shadows: Object.freeze({
    directional: Object.freeze({ left: -13, right: 13, top: 10, bottom: -10, mapSize: 1024 }),
    contact: Object.freeze({ scale: 26, resolution: 512, frames: 1 }),
  }),
  palette: Object.freeze({
    blackCase: '#090a0c',
    blackFrame: '#17191c',
    darkPlate: '#07080a',
    blackCap: '#101114',
    graphiteCap: '#292b2e',
    mirrorMetal: '#e3e7eb',
    redLight: '#ff173f',
    creamAccent: '#e7e1d6',
    magentaAccent: '#d72f78',
    silverAccent: '#bfc5cc',
  }),
  lights: Object.freeze({
    coolKey: light('#eef5ff', vector3(5.5, 8.5, 6.5), 4.4),
    redRim: light('#ff173f', vector3(-7, 4.2, -5.5), 2.7),
    warmFill: light('#ffd5ae', vector3(-4.5, 3.2, 7), 1.7),
  }),
});
