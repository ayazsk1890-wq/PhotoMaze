/**
 * DPI Metadata Encoder and Parser for JPEG and PNG
 *
 * Official passport portals and photo printing kiosks strictly check embedded
 * DPI density metadata (JFIF for JPEG, pHYs chunk for PNG).
 * Canvas exports typically lack this metadata or default to 72/96 DPI.
 *
 * This module injects accurate 300 DPI / 600 DPI physical resolution tags
 * into binary image buffers with zero dependencies and sub-millisecond execution.
 */

// ─── CRC32 Table for PNG Chunk Validation ───────────────────────────────────

let crcTable: Uint32Array | null = null;

function getCrcTable(): Uint32Array {
  if (crcTable) return crcTable;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c >>> 0;
  }
  crcTable = table;
  return table;
}

function calculateCrc32(bytes: Uint8Array, offset: number, length: number): number {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (let i = offset; i < offset + length; i++) {
    crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ─── JPEG JFIF APP0 Marker Handling ─────────────────────────────────────────

export interface JpegDpiInfo {
  dpiX: number;
  dpiY: number;
  units: number; // 1 = dots per inch, 2 = dots per cm
}

/**
 * Reads embedded JFIF resolution metadata from a JPEG buffer.
 */
export function readJpegDpi(bytes: Uint8Array): JpegDpiInfo | null {
  if (bytes.length < 18 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null; // Not a valid JPEG (missing SOI)
  }

  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];

    // Standalone markers without payload
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }

    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (offset + 2 + length > bytes.length) break;

    // APP0 marker (0xFF, 0xE0)
    if (marker === 0xe0) {
      // Check for "JFIF\0" identifier
      if (
        bytes[offset + 4] === 0x4a && // J
        bytes[offset + 5] === 0x46 && // F
        bytes[offset + 6] === 0x49 && // I
        bytes[offset + 7] === 0x46 && // F
        bytes[offset + 8] === 0x00
      ) {
        const units = bytes[offset + 11];
        const dpiX = (bytes[offset + 12] << 8) | bytes[offset + 13];
        const dpiY = (bytes[offset + 14] << 8) | bytes[offset + 15];
        return { dpiX, dpiY, units };
      }
    }

    // Stop searching if we reach Start of Scan (SOS)
    if (marker === 0xda) break;

    offset += 2 + length;
  }

  return null;
}

/**
 * Injects or updates standard JFIF APP0 marker with the specified DPI (default 300).
 * Preserves all image pixel data and remaining EXIF markers.
 */
export function injectJpegDpi(bytes: Uint8Array, dpi: number = 300): Uint8Array {
  if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return bytes; // Not a valid JPEG
  }

  const roundedDpi = Math.max(72, Math.min(2400, Math.round(dpi)));
  const dpiHi = (roundedDpi >> 8) & 0xff;
  const dpiLo = roundedDpi & 0xff;

  // Check if an APP0 JFIF marker already exists
  if (
    bytes.length >= 18 &&
    bytes[2] === 0xff &&
    bytes[3] === 0xe0 &&
    bytes[6] === 0x4a && // J
    bytes[7] === 0x46 && // F
    bytes[8] === 0x49 && // I
    bytes[9] === 0x46 && // F
    bytes[10] === 0x00
  ) {
    // Clone and patch in place
    const modified = new Uint8Array(bytes);
    modified[13] = 1; // Units = 1 (dots per inch)
    modified[14] = dpiHi;
    modified[15] = dpiLo;
    modified[16] = dpiHi;
    modified[17] = dpiLo;
    return modified;
  }

  // Construct standard 18-byte JFIF APP0 segment
  const app0 = new Uint8Array([
    0xff,
    0xe0, // APP0 marker
    0x00,
    0x10, // Length = 16 (includes length bytes)
    0x4a,
    0x46,
    0x49,
    0x46,
    0x00, // "JFIF\0"
    0x01,
    0x02, // Version 1.02
    0x01, // Units: 1 = dots per inch
    dpiHi,
    dpiLo, // X density
    dpiHi,
    dpiLo, // Y density
    0x00, // X thumbnail
    0x00, // Y thumbnail
  ]);

  // Insert immediately after SOI (bytes 0 & 1)
  const result = new Uint8Array(bytes.length + app0.length);
  result[0] = 0xff;
  result[1] = 0xd8;
  result.set(app0, 2);
  result.set(bytes.subarray(2), 2 + app0.length);

  return result;
}

// ─── PNG pHYs Chunk Handling ────────────────────────────────────────────────

export interface PngDpiInfo {
  dpiX: number;
  dpiY: number;
  unit: number; // 1 = meter, 0 = unknown aspect ratio
  pixelsPerMeterX: number;
  pixelsPerMeterY: number;
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const INCH_PER_METER = 0.0254;

/**
 * Reads embedded pHYs chunk physical resolution metadata from a PNG buffer.
 */
export function readPngDpi(bytes: Uint8Array): PngDpiInfo | null {
  if (bytes.length < 8) return null;
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return null;
  }

  let offset = 8;
  while (offset + 8 < bytes.length) {
    const length =
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3];

    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );

    if (type === "pHYs" && length === 9 && offset + 8 + 9 <= bytes.length) {
      const dataOffset = offset + 8;
      const ppmX =
        ((bytes[dataOffset] << 24) |
          (bytes[dataOffset + 1] << 16) |
          (bytes[dataOffset + 2] << 8) |
          bytes[dataOffset + 3]) >>>
        0;

      const ppmY =
        ((bytes[dataOffset + 4] << 24) |
          (bytes[dataOffset + 5] << 16) |
          (bytes[dataOffset + 6] << 8) |
          bytes[dataOffset + 7]) >>>
        0;

      const unit = bytes[dataOffset + 8];
      const dpiX = unit === 1 ? Math.round(ppmX * INCH_PER_METER) : ppmX;
      const dpiY = unit === 1 ? Math.round(ppmY * INCH_PER_METER) : ppmY;

      return { dpiX, dpiY, unit, pixelsPerMeterX: ppmX, pixelsPerMeterY: ppmY };
    }

    if (type === "IEND") break;
    offset += 8 + length + 4; // Length (4) + Type (4) + Data (length) + CRC (4)
  }

  return null;
}

/**
 * Injects or updates the `pHYs` chunk in a PNG buffer with the specified DPI (default 300).
 * Inserts the chunk immediately after IHDR for maximum compatibility with all image parsers.
 */
export function injectPngDpi(bytes: Uint8Array, dpi: number = 300): Uint8Array {
  if (bytes.length < 8) return bytes;
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return bytes;
  }

  const roundedDpi = Math.max(72, Math.min(2400, Math.round(dpi)));
  // 1 inch = 0.0254 meters -> pixels per meter = DPI / 0.0254
  const ppm = Math.round(roundedDpi / INCH_PER_METER);

  // Construct pHYs chunk: Length (4) + "pHYs" (4) + Data (9) + CRC (4) = 21 bytes
  const chunk = new Uint8Array(21);
  // Length = 9
  chunk[0] = 0;
  chunk[1] = 0;
  chunk[2] = 0;
  chunk[3] = 9;

  // Type: "pHYs"
  chunk[4] = 0x70; // 'p'
  chunk[5] = 0x48; // 'H'
  chunk[6] = 0x59; // 'Y'
  chunk[7] = 0x73; // 's'

  // Pixels per meter X (4 bytes big-endian)
  chunk[8] = (ppm >>> 24) & 0xff;
  chunk[9] = (ppm >>> 16) & 0xff;
  chunk[10] = (ppm >>> 8) & 0xff;
  chunk[11] = ppm & 0xff;

  // Pixels per meter Y (4 bytes big-endian)
  chunk[12] = (ppm >>> 24) & 0xff;
  chunk[13] = (ppm >>> 16) & 0xff;
  chunk[14] = (ppm >>> 8) & 0xff;
  chunk[15] = ppm & 0xff;

  // Unit: 1 = meter
  chunk[16] = 1;

  // CRC32 calculated over Type (4 bytes) + Data (9 bytes) = 13 bytes from offset 4
  const crc = calculateCrc32(chunk, 4, 13);
  chunk[17] = (crc >>> 24) & 0xff;
  chunk[18] = (crc >>> 16) & 0xff;
  chunk[19] = (crc >>> 8) & 0xff;
  chunk[20] = crc & 0xff;

  // Locate existing pHYs chunk if present, or insertion point after IHDR
  let offset = 8;
  let ihdrEnd = -1;
  let existingPhysStart = -1;
  let existingPhysLen = 0;

  while (offset + 8 < bytes.length) {
    const len =
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3];

    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );

    if (type === "IHDR") {
      ihdrEnd = offset + 8 + len + 4;
    } else if (type === "pHYs") {
      existingPhysStart = offset;
      existingPhysLen = 8 + len + 4;
      break;
    } else if (type === "IDAT" || type === "IEND") {
      break;
    }

    offset += 8 + len + 4;
  }

  // If existing pHYs found, replace it
  if (existingPhysStart >= 0) {
    const result = new Uint8Array(bytes.length - existingPhysLen + chunk.length);
    result.set(bytes.subarray(0, existingPhysStart), 0);
    result.set(chunk, existingPhysStart);
    result.set(
      bytes.subarray(existingPhysStart + existingPhysLen),
      existingPhysStart + chunk.length
    );
    return result;
  }

  // Otherwise insert immediately after IHDR (or at offset 8 + 25 = 33 if standard IHDR)
  const insertPos = ihdrEnd > 0 ? ihdrEnd : 33;
  const result = new Uint8Array(bytes.length + chunk.length);
  result.set(bytes.subarray(0, insertPos), 0);
  result.set(chunk, insertPos);
  result.set(bytes.subarray(insertPos), insertPos + chunk.length);

  return result;
}
