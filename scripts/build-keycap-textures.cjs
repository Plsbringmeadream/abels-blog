const path = require('node:path');
const sharp = require('sharp');

const projectRoot = path.resolve(__dirname, '..');
const atlasPath = path.join(
  projectRoot,
  'public/keycap-art/custom-keycap-atlas.png',
);
const outputPath = path.join(
  projectRoot,
  'public/keycap-art/space-art-integrated.webp',
);

async function main() {
  const artwork = await sharp(atlasPath)
    .extract({ left: 1040, top: 535, width: 450, height: 455 })
    .resize(500, 240, { fit: 'fill' })
    .webp({ quality: 92 })
    .toBuffer();

  await sharp({
    create: {
      width: 1600,
      height: 256,
      channels: 3,
      background: '#25282e',
    },
  })
    .composite([{ input: artwork, left: 900, top: 8 }])
    .webp({ quality: 92 })
    .toFile(outputPath);

  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
