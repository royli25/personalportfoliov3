/* Vector data exported 1:1 from the Figma source (components / 555:1410).
   The check keeps its own circle because fill and ring are part of the glyph;
   the pencil and cross are bare glyphs in the design's 44-box — the circular
   button behind them is chrome, so it is CSS on the <button>, not path data. */

type Props = { className?: string };

export function CheckCircle({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle
        cx="14"
        cy="14"
        r="13.25"
        fill="#E7F2E9"
        stroke="#8CC2A0"
        strokeWidth="1.5"
      />
      <path
        d="M8.5 14.3 L12.2 17.8 L19.5 9.8"
        stroke="#1E7A47"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Chevron({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5.5 8 L10 12.5 L14.5 8"
        stroke="#8A887E"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Pencil({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M26.3 15.6 L28.4 17.7 C28.9 18.2 28.9 19 28.4 19.5 L20 27.9 L16.6 28.8 L17.5 25.4 L25.9 17 C26.4 16.5 27.2 16.5 27.7 17 Z M24.8 18.1 L27.3 20.6"
        stroke="#4A4841"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Cross({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M17.5 17.5 L26.5 26.5 M26.5 17.5 L17.5 26.5"
        stroke="#4A4841"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
