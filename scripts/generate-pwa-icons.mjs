import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crcBuf]);
}

function generateBingoPNG(size, isMaskable = false) {
  const width = size;
  const height = size;

  // Raw uncompressed RGBA rows: 1 filter byte + width * 4 bytes per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = width / 2;

  // Safe area for maskable icon is within central 80%
  const ballRadius = isMaskable ? maxRadius * 0.72 : maxRadius * 0.82;
  const whiteCircleRadius = ballRadius * 0.52;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: Deep dark blue-black #070a14
      let r = 7, g = 10, b = 20, a = 255;

      if (dist <= ballRadius) {
        // Golden Amber Ball body
        // Angle & distance for 3D sphere gradient
        const lightDx = x - (cx - ballRadius * 0.35);
        const lightDy = y - (cy - ballRadius * 0.35);
        const lightDist = Math.sqrt(lightDx * lightDx + lightDy * lightDy);
        const norm = Math.min(1, lightDist / (ballRadius * 1.6));

        // Amber Gold gradient (Light #fbbf24 to Deep Gold #b45309 to Dark #78350f)
        r = Math.round(251 * (1 - norm) + 120 * norm);
        g = Math.round(191 * (1 - norm) + 53 * norm);
        b = Math.round(36 * (1 - norm) + 15 * norm);

        // Center white circle
        if (dist <= whiteCircleRadius) {
          const innerDist = dist / whiteCircleRadius;
          const bgShade = Math.round(255 - innerDist * 15);
          r = bgShade;
          g = bgShade;
          b = bgShade;

          // Draw iconic bold 'B' letter
          const nx = (x - cx) / whiteCircleRadius; // -1 to 1
          const ny = (y - cy) / whiteCircleRadius; // -1 to 1

          // Vertical stem of B: nx between -0.42 and -0.18, ny between -0.55 and 0.55
          const inStem = nx >= -0.42 && nx <= -0.18 && ny >= -0.55 && ny <= 0.55;

          // Upper lobe of B
          const topDx = nx - -0.15;
          const topDy = ny - -0.26;
          const topDist = Math.sqrt(topDx * topDx * 1.4 + topDy * topDy * 2.2);
          const inTopLobe = topDist <= 0.42 && topDist >= 0.18 && nx >= -0.25;

          // Lower lobe of B
          const botDx = nx - -0.12;
          const botDy = ny - 0.26;
          const botDist = Math.sqrt(botDx * botDx * 1.3 + botDy * botDy * 2.0);
          const inBotLobe = botDist <= 0.46 && botDist >= 0.20 && nx >= -0.25;

          if (inStem || inTopLobe || inBotLobe) {
            // Dark Indigo / Slate Black text for 'B'
            r = 15;
            g = 23;
            b = 42;
          }
        } else if (dist >= whiteCircleRadius - 2 && dist <= whiteCircleRadius + 2) {
          // Gold border around center circle
          r = 180;
          g = 83;
          b = 9;
        }
      } else if (!isMaskable && dist > maxRadius - 10) {
        // Soft rounded corners for non-maskable standard icons
        const cornerMargin = 16 * (width / 192);
        const inCorner =
          (x < cornerMargin && y < cornerMargin) ||
          (x > width - cornerMargin && y < cornerMargin) ||
          (x < cornerMargin && y > height - cornerMargin) ||
          (x > width - cornerMargin && y > height - cornerMargin);
        if (inCorner) {
          // Antialias edge
          a = 240;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateBingoPNG(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateBingoPNG(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateBingoPNG(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateBingoPNG(180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generateBingoPNG(48, false));

console.log('Successfully generated all compliant PWA PNG icon assets in /public!');
