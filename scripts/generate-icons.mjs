import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function buildPng(size, { bg, fg, square = false }) {
  const [br, bgc, bb] = hexToRgb(bg);
  const [fr, fgc, fb] = hexToRgb(fg);

  const pad = Math.round(size * 0.24);
  const barH = Math.round(size * 0.15);
  const vBarW = Math.round(size * 0.15);
  const top = pad;
  const vLeft = Math.round(size / 2 - vBarW / 2);
  const vRight = vLeft + vBarW;

  // 라운드 코너용 반경(둥근 사각형 배경)
  const radius = Math.round(size * 0.22);

  const rowBytes = size * 4 + 1;
  const raw = Buffer.alloc(rowBytes * size);

  const insideRoundedRect = (x, y) => {
    const rx = Math.min(x, size - 1 - x);
    const ry = Math.min(y, size - 1 - y);
    if (rx >= radius || ry >= radius) return true;
    const dx = radius - rx;
    const dy = radius - ry;
    return dx * dx + dy * dy <= radius * radius;
  };

  for (let y = 0; y < size; y++) {
    const rowStart = y * rowBytes;
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const isHorizontalBar = y >= top && y < top + barH && x >= pad && x < size - pad;
      const isVerticalBar = x >= vLeft && x < vRight && y >= top && y < size - pad;
      const isGlyph = isHorizontalBar || isVerticalBar;
      const rounded = square || insideRoundedRect(x, y);

      let r, g, b, a;
      if (!rounded) {
        r = 0;
        g = 0;
        b = 0;
        a = 0;
      } else if (isGlyph) {
        r = fr;
        g = fgc;
        b = fb;
        a = 255;
      } else {
        r = br;
        g = bgc;
        b = bb;
        a = 255;
      }

      const px = rowStart + 1 + x * 4;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const idat = deflateSync(raw, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    signature,
    chunk("IHDR", ihdrData),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return png;
}

const sizes = [192, 512];
for (const size of sizes) {
  const png = buildPng(size, { bg: "#E8A33D", fg: "#14161B" });
  const path = join(outDir, `icon-${size}.png`);
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.length} bytes)`);
}

// apple-touch-icon (180x180, no transparency — iOS가 자체적으로 모서리를 둥글게 처리함)
const appleIcon = buildPng(180, { bg: "#E8A33D", fg: "#14161B", square: true });
writeFileSync(join(outDir, "apple-touch-icon.png"), appleIcon);
console.log("wrote apple-touch-icon.png");
