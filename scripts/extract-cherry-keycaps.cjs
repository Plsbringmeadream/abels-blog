const fs = require('node:fs');
const path = require('node:path');
const initOcct = require('occt-import-js');

const STEP_PATH = process.argv[2];
const OUTPUT_PATH =
  process.argv[3] ??
  path.resolve(__dirname, '../public/models/cherry-profile-pbt.glb');
const KEY_PITCH_MM = 19;

const SPECS = [
  { name: 'r1_1u', rowY: 91.484, width: 18.2 },
  { name: 'r2_1u', rowY: 67.484, width: 18.2 },
  { name: 'r2_2u', rowY: 67.484, width: 37.2 },
  { name: 'r3_1u', rowY: 48.484, width: 18.2 },
  { name: 'r3_1_5u', rowY: 48.484, width: 27.7 },
  { name: 'r4_1u', rowY: 29.484, width: 18.2 },
  { name: 'r4_1_75u', rowY: 29.484, width: 32.45 },
  { name: 'r4_2_25u', rowY: 29.484, width: 41.95 },
  { name: 'r5_1u', rowY: 10.484, width: 18.2 },
  { name: 'r5_1_25u', rowY: -8.516, width: 22.95 },
  { name: 'r5_1_75u', rowY: 10.484, width: 32.45 },
  { name: 'r5_2_25u', rowY: 10.484, width: 41.95 },
  { name: 'r5_2_75u', rowY: 10.484, width: 51.45 },
  { name: 'r5_6_25u', rowY: -8.516, width: 117.8 },
];

function meshBounds(mesh) {
  const positions = mesh.attributes.position.array;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let index = 0; index < positions.length; index += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = positions[index + axis];
      min[axis] = Math.min(min[axis], value);
      max[axis] = Math.max(max[axis], value);
    }
  }

  return {
    min,
    max,
    size: max.map((value, axis) => value - min[axis]),
    center: max.map((value, axis) => (value + min[axis]) / 2),
  };
}

function flattenIndices(indexArray) {
  return Array.isArray(indexArray[0]) ? indexArray.flat() : indexArray;
}

function pad4(value) {
  return (value + 3) & ~3;
}

function buildGlb(selectedMeshes) {
  const binaryParts = [];
  const bufferViews = [];
  const accessors = [];
  const meshes = [];
  const nodes = [];
  let byteOffset = 0;

  function appendBuffer(typedArray, target) {
    const alignedOffset = pad4(byteOffset);
    if (alignedOffset > byteOffset) {
      binaryParts.push(Buffer.alloc(alignedOffset - byteOffset));
      byteOffset = alignedOffset;
    }
    const buffer = Buffer.from(
      typedArray.buffer,
      typedArray.byteOffset,
      typedArray.byteLength,
    );
    const viewIndex = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset,
      byteLength: buffer.byteLength,
      target,
    });
    binaryParts.push(buffer);
    byteOffset += buffer.byteLength;
    return viewIndex;
  }

  function appendAccessor(typedArray, target, componentType, type, min, max) {
    const bufferView = appendBuffer(typedArray, target);
    const componentCount = type === 'VEC3' ? 3 : 1;
    const accessor = {
      bufferView,
      componentType,
      count: typedArray.length / componentCount,
      type,
    };
    if (min) accessor.min = min;
    if (max) accessor.max = max;
    const accessorIndex = accessors.length;
    accessors.push(accessor);
    return accessorIndex;
  }

  for (const { spec, mesh, bounds } of selectedMeshes) {
    const sourcePositions = mesh.attributes.position.array;
    const sourceNormals = mesh.attributes.normal.array;
    const positions = new Float32Array(sourcePositions.length);
    const normals = new Float32Array(sourceNormals.length);
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    const heightCenter = (bounds.min[2] + bounds.max[2]) / 2;

    for (let index = 0; index < sourcePositions.length; index += 3) {
      // STEP: X/Y are the keyboard plane and Z is height.
      // Three.js: X/Z are the keyboard plane and Y is height.
      const x = (sourcePositions[index] - bounds.center[0]) / KEY_PITCH_MM;
      const y = (sourcePositions[index + 2] - heightCenter) / KEY_PITCH_MM;
      // Keyboard layout uses +Z for the front/bottom row. The STEP keyset
      // uses +Y toward the rear, so this plane axis must be inverted.
      const z = (bounds.center[1] - sourcePositions[index + 1]) / KEY_PITCH_MM;
      positions.set([x, y, z], index);
      min[0] = Math.min(min[0], x);
      min[1] = Math.min(min[1], y);
      min[2] = Math.min(min[2], z);
      max[0] = Math.max(max[0], x);
      max[1] = Math.max(max[1], y);
      max[2] = Math.max(max[2], z);

      normals.set(
        [
          sourceNormals[index],
          sourceNormals[index + 2],
          -sourceNormals[index + 1],
        ],
        index,
      );
    }

    // X/Z/-Y is right-handed, so preserve the STEP triangle winding.
    const sourceIndices = flattenIndices(mesh.index.array);
    const indices = new Uint32Array(sourceIndices.length);
    for (let index = 0; index < sourceIndices.length; index += 3) {
      indices[index] = sourceIndices[index];
      indices[index + 1] = sourceIndices[index + 1];
      indices[index + 2] = sourceIndices[index + 2];
    }

    const positionAccessor = appendAccessor(
      positions,
      34962,
      5126,
      'VEC3',
      min,
      max,
    );
    const normalAccessor = appendAccessor(normals, 34962, 5126, 'VEC3');
    const indexAccessor = appendAccessor(indices, 34963, 5125, 'SCALAR');
    const meshIndex = meshes.length;
    meshes.push({
      name: spec.name,
      primitives: [
        {
          attributes: { POSITION: positionAccessor, NORMAL: normalAccessor },
          indices: indexAccessor,
        },
      ],
    });
    nodes.push({ name: spec.name, mesh: meshIndex });
  }

  const binary = Buffer.concat(binaryParts);
  const gltf = {
    asset: {
      version: '2.0',
      generator: 'abels-blog STEP keycap extractor',
      extras: {
        source: path.basename(STEP_PATH),
        keyPitchMillimeters: KEY_PITCH_MM,
      },
    },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, index) => index) }],
    nodes,
    meshes,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binary.length }],
  };

  const json = Buffer.from(JSON.stringify(gltf));
  const jsonLength = pad4(json.length);
  const binaryLength = pad4(binary.length);
  const totalLength = 12 + 8 + jsonLength + 8 + binaryLength;
  const glb = Buffer.alloc(totalLength);
  let offset = 0;

  glb.writeUInt32LE(0x46546c67, offset);
  offset += 4;
  glb.writeUInt32LE(2, offset);
  offset += 4;
  glb.writeUInt32LE(totalLength, offset);
  offset += 4;
  glb.writeUInt32LE(jsonLength, offset);
  offset += 4;
  glb.writeUInt32LE(0x4e4f534a, offset);
  offset += 4;
  json.copy(glb, offset);
  glb.fill(0x20, offset + json.length, offset + jsonLength);
  offset += jsonLength;
  glb.writeUInt32LE(binaryLength, offset);
  offset += 4;
  glb.writeUInt32LE(0x004e4942, offset);
  offset += 4;
  binary.copy(glb, offset);

  return glb;
}

async function main() {
  if (!STEP_PATH) {
    throw new Error(
      'Usage: node scripts/extract-cherry-keycaps.cjs <keycap-set.stp> [output.glb]',
    );
  }

  const occt = await initOcct();
  const result = occt.ReadStepFile(fs.readFileSync(STEP_PATH), {
    linearUnit: 'millimeter',
    linearDeflectionType: 'absolute_value',
    linearDeflection: 0.12,
    angularDeflection: 0.22,
  });
  if (!result.success) throw new Error('OpenCascade could not import the STEP file.');

  const candidates = result.meshes.map((mesh, index) => ({
    index,
    mesh,
    bounds: meshBounds(mesh),
  }));
  const selected = SPECS.map((spec) => {
    const match = candidates
      .filter(({ bounds }) => Math.abs(bounds.size[1] - 18.2) < 0.08)
      .map((candidate) => ({
        ...candidate,
        score:
          Math.abs(candidate.bounds.center[1] - spec.rowY) +
          Math.abs(candidate.bounds.size[0] - spec.width),
      }))
      .sort((left, right) => left.score - right.score)[0];
    if (!match || match.score > 0.2) {
      throw new Error(`No CAD body matched ${spec.name} (score ${match?.score}).`);
    }
    return { spec, mesh: match.mesh, bounds: match.bounds, sourceIndex: match.index };
  });

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, buildGlb(selected));
  console.log(
    JSON.stringify(
      {
        output: OUTPUT_PATH,
        bytes: fs.statSync(OUTPUT_PATH).size,
        sourceMeshes: result.meshes.length,
        exported: selected.map(({ spec, bounds, sourceIndex }) => ({
          name: spec.name,
          sourceIndex,
          millimeters: bounds.size.map((value) => Number(value.toFixed(3))),
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
