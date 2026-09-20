import { readdirSync } from "node:fs";
import path from "node:path";
import { imageSize } from "./image-size";
import type { Tile } from "@/data/site";

/**
 * Reads a gallery straight off disk.
 *
 * Drop a file into `public/<folder>/` and it shows up — there is no list to
 * keep in sync, which is the whole point: the folders are the source of truth.
 * Files sort by name, so a `01-`/`02-` prefix is how you order the wall.
 *
 * Server-only. This runs when the page renders, which for a static route means
 * build time — a file added afterwards needs a rebuild to appear.
 */

const IMAGE = /\.(png|jpe?g|webp|gif)$/i;
const VIDEO = /\.mp4$/i;

/**
 * `01-student-database-search.webp` → `Student database search`.
 *
 * The filename is the only metadata a dropped file carries, so it doubles as
 * alt text — which is why the README asks for words rather than `vis1`. The
 * ordering prefix (number plus optional row letter, `02a-`) is stripped; a
 * file with no real name yields "" and stays decorative, which is the correct
 * fallback rather than reading out a slug.
 */
function altFromName(file: string): string {
  const words = file
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[a-z]?[-_\s]*/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!words || /^\W*$/.test(words)) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * `02a-…` / `02b-…` → row 2. Files sharing a number sit side by side in one
 * row; the letter orders them within it. A file with no number stands alone.
 */
function rowFromName(file: string): number | undefined {
  const m = file.match(/^(\d+)/);
  return m ? Number(m[1]) : undefined;
}

export function readGallery(folder: string): Tile[] {
  const dir = path.join(process.cwd(), "public", folder);

  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    // Folder missing entirely — the caller falls back to placeholders.
    return [];
  }

  return files
    .filter((f) => IMAGE.test(f) || VIDEO.test(f))
    .sort()
    .map((file) => {
      const size = imageSize(path.join(dir, file));
      return {
        filler: file,
        src: `/${folder}/${file}`,
        alt: altFromName(file),
        row: rowFromName(file),
        video: VIDEO.test(file) || undefined,
        width: size?.width,
        height: size?.height,
        /* Unreadable header: fall back to a square box and crop into it rather
           than dropping the image or guessing a shape the file may not have. */
        ratio: size ? `${size.width} / ${size.height}` : "1 / 1",
      };
    });
}
