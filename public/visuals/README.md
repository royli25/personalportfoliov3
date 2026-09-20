# visuals

Drop image files here and they appear on the site's **visuals** tab — there is no
list to update. Files are picked up on build (`npm run dev` re-reads on each
request).

- **Formats:** .png, .jpg, .jpeg, .webp, .gif
- **Name them in words.** The filename becomes the image's alt text: an
  ordering prefix is stripped and dashes become spaces, so
  `01-student-database-search.webp` reads as "Student database search".
  `vis1.png` gives a screen reader nothing.
- **Order:** alphabetical. Prefix with `01-`, `02-` … to arrange the wall.
- **Side by side:** give two files the same number with a letter — `02a-foo.png`
  and `02b-bar.png` share one row, split evenly. No letter = full width.
- **Size:** read from the file header, so tiles keep their true aspect ratio in
  the masonry. No need to record dimensions anywhere.
- **Format tip:** for UI screenshots, lossless WebP is roughly half the bytes of
  PNG with no quality loss. Next optimizes delivery either way, so this is just
  about what you commit.
- **Empty folder:** the tab falls back to labelled placeholders, so the page
  never looks broken while you're still exporting.

Wired up in `src/lib/gallery.ts`.
