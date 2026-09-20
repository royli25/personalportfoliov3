import { closeSync, openSync, readSync } from "node:fs";

/**
 * Intrinsic dimensions straight from a file header.
 *
 * The galleries are built by scanning a folder, so there are no static imports
 * for Next to infer sizes from — and `next/image` needs real width/height to
 * reserve space. Parsing the header beats adding an image library for the four
 * formats a design export actually comes in.
 *
 * Only the first 64KB is read: every format below carries its dimensions in the
 * first few bytes, except JPEG, whose SOF marker sits comfortably inside that.
 */

const HEAD = 65536;

/** JPEG start-of-frame markers. Excludes DHT/DAC/RST, which share the C-range. */
function isSOF(marker: number) {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

export function imageSize(
  file: string,
): { width: number; height: number } | null {
  let fd: number | undefined;
  let buf: Buffer;

  try {
    fd = openSync(file, "r");
    buf = Buffer.alloc(HEAD);
    const read = readSync(fd, buf, 0, HEAD, 0);
    buf = buf.subarray(0, read);
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }

  if (buf.length < 24) return null;

  // PNG — IHDR is always the first chunk.
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // GIF
  if (buf.toString("ascii", 0, 3) === "GIF") {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // WebP — three sub-formats, each storing size differently.
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    const kind = buf.toString("ascii", 12, 16);
    if (kind === "VP8 " && buf.length >= 30) {
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      };
    }
    if (kind === "VP8L" && buf.length >= 25) {
      const bits = buf.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    if (kind === "VP8X" && buf.length >= 30) {
      return {
        width: buf.readUIntLE(24, 3) + 1,
        height: buf.readUIntLE(27, 3) + 1,
      };
    }
    return null;
  }

  // MP4 — find the video track's tkhd box. The gallery's encode step writes
  // +faststart, so moov (and tkhd inside it) sits within the first 64KB; a
  // moov-at-end file simply returns null and crops into a square, same as any
  // unreadable header. Width/height are 16.16 fixed-point at the end of the
  // box; version 1 uses 64-bit times, shifting them by 12 bytes.
  if (buf.length > 12 && buf.toString("ascii", 4, 8) === "ftyp") {
    let o = 0;
    while (o + 96 < buf.length) {
      if (buf.toString("ascii", o, o + 4) === "tkhd") {
        const version = buf[o + 4];
        const at = o + 4 + (version === 1 ? 88 : 76);
        const width = buf.readUInt32BE(at) >>> 16;
        const height = buf.readUInt32BE(at + 4) >>> 16;
        // Audio and hint tracks carry zero dimensions — keep scanning.
        if (width && height) return { width, height };
      }
      o++;
    }
    return null;
  }

  // JPEG — walk the marker chain to the first start-of-frame.
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let o = 2;
    while (o + 9 < buf.length) {
      if (buf[o] !== 0xff) {
        o++;
        continue;
      }
      const marker = buf[o + 1];
      // Standalone markers carry no length payload.
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        o += 2;
        continue;
      }
      if (isSOF(marker)) {
        return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
      }
      o += 2 + buf.readUInt16BE(o + 2);
    }
  }

  return null;
}
