/* Vector data exported 1:1 from the Figma source assets — coordinates and
   stroke widths preserved at the design's native scale, only the rendered
   size is set by the consumer. Hand-redrawing these would drift. */

type Props = { className?: string };

export function SlashKey({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 28.3328 28.3328"
      fill="none"
      aria-hidden
    >
      <path
        d="M20.4651 1.08984H7.86793C4.1245 1.08984 1.08984 4.1245 1.08984 7.86793V20.4651C1.08984 24.2086 4.1245 27.2432 7.86793 27.2432H20.4651C24.2086 27.2432 27.2432 24.2086 27.2432 20.4651V7.86793C27.2432 4.1245 24.2086 1.08984 20.4651 1.08984Z"
        stroke="black"
        strokeWidth="2.3471"
      />
      <path
        d="M9.44531 22.0388L18.8889 6.29883"
        stroke="black"
        strokeWidth="2.3471"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDown({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 21.7945 21.7945"
      fill="none"
      aria-hidden
    >
      <path
        d="M4.35938 7.62891L10.8977 14.1673L17.4361 7.62891"
        stroke="#A3A19C"
        strokeWidth="2.61534"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Plus({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 32.6917 32.6917"
      fill="none"
      aria-hidden
    >
      <path
        d="M16.3516 6.07324V26.6223"
        stroke="#8B8984"
        strokeWidth="2.61534"
        strokeLinecap="round"
      />
      <path
        d="M6.07227 16.3506H26.6213"
        stroke="#8B8984"
        strokeWidth="2.61534"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Mic({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 32.6917 32.6917"
      fill="none"
      aria-hidden
    >
      <path
        d="M16.3494 4.20394C14.1544 4.20394 12.6132 5.83853 12.6132 7.94014V16.5801C12.6132 18.6817 14.1544 20.3163 16.3494 20.3163C18.5444 20.3163 20.0856 18.6817 20.0856 16.5801V7.94014C20.0856 5.83853 18.5444 4.20394 16.3494 4.20394Z"
        stroke="#8B8984"
        strokeWidth="2.50637"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.5216 15.4163V16.5838C24.5216 21.0205 20.8555 24.5232 16.3487 24.5232C11.8419 24.5232 8.17578 21.0205 8.17578 16.5838V15.4163"
        stroke="#8B8984"
        strokeWidth="2.50637"
        strokeLinecap="round"
      />
      <path
        d="M16.3516 24.7598V28.7295"
        stroke="#8B8984"
        strokeWidth="2.50637"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SendArrow({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 37.0506 37.0506"
      fill="none"
      aria-hidden
    >
      <path
        d="M18.5283 30.8772V6.17676M27.7909 15.4394L18.5283 6.17676L9.26562 15.4394"
        stroke="#8B8984"
        strokeWidth="2.61534"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Shell icons (section 230:1234) — same rule: exported vectors, inlined. ── */

export function RecentsClock({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M1.875 7.5C1.875 8.61252 2.2049 9.70006 2.82298 10.6251C3.44106 11.5501 4.31957 12.2711 5.3474 12.6969C6.37524 13.1225 7.50624 13.234 8.59738 13.0169C9.68852 12.7999 10.6908 12.2641 11.4775 11.4775C12.2641 10.6908 12.7999 9.68852 13.0169 8.59738C13.234 7.50624 13.1225 6.37524 12.6969 5.3474C12.2711 4.31957 11.5501 3.44106 10.6251 2.82298C9.70006 2.2049 8.61252 1.875 7.5 1.875C5.92747 1.88091 4.41811 2.49451 3.2875 3.5875L1.875 5"
        stroke="#A3A19C"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.875 1.875V5H5"
        stroke="#A3A19C"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 4.375V7.5L10 8.75"
        stroke="#A3A19C"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Summarize({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M12.25 3.5H1.75" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.75 7H1.75" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.91667 10.5H1.75" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Catchup({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1.75 7C1.75 8.03835 2.05791 9.05339 2.63478 9.91674C3.21166 10.7801 4.0316 11.453 4.99091 11.8504C5.95022 12.2477 7.00582 12.3517 8.02422 12.1491C9.04262 11.9466 9.97809 11.4465 10.7123 10.7123C11.4465 9.97809 11.9466 9.04262 12.1491 8.02422C12.3517 7.00582 12.2477 5.95022 11.8504 4.99091C11.453 4.0316 10.7801 3.21166 9.91674 2.63478C9.05339 2.05791 8.03835 1.75 7 1.75C5.53231 1.75552 4.12357 2.32821 3.06833 3.34833L1.75 4.66667"
        stroke="#84827C"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1.75 1.75V4.66667H4.66667" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 4.08333V7L9.33333 8.16667" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ActionItems({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1.75 9.91667L2.91667 11.0833L5.25 8.75" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.75 4.08333L2.91667 5.25L5.25 2.91667" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.58333 3.5H12.25" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.58333 7H12.25" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.58333 10.5H12.25" stroke="#84827C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Grid({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M5.1 1.9H3C2.39249 1.9 1.9 2.39249 1.9 3V5.1C1.9 5.70751 2.39249 6.2 3 6.2H5.1C5.70751 6.2 6.2 5.70751 6.2 5.1V3C6.2 2.39249 5.70751 1.9 5.1 1.9Z" stroke="#84827C" strokeWidth="1.15" />
      <path d="M11 1.9H8.9C8.29249 1.9 7.8 2.39249 7.8 3V5.1C7.8 5.70751 8.29249 6.2 8.9 6.2H11C11.6075 6.2 12.1 5.70751 12.1 5.1V3C12.1 2.39249 11.6075 1.9 11 1.9Z" stroke="#84827C" strokeWidth="1.15" />
      <path d="M5.1 7.8H3C2.39249 7.8 1.9 8.29249 1.9 8.9V11C1.9 11.6075 2.39249 12.1 3 12.1H5.1C5.70751 12.1 6.2 11.6075 6.2 11V8.9C6.2 8.29249 5.70751 7.8 5.1 7.8Z" stroke="#84827C" strokeWidth="1.15" />
      <path d="M11 7.8H8.9C8.29249 7.8 7.8 8.29249 7.8 8.9V11C7.8 11.6075 8.29249 12.1 8.9 12.1H11C11.6075 12.1 12.1 11.6075 12.1 11V8.9C12.1 8.29249 11.6075 7.8 11 7.8Z" stroke="#84827C" strokeWidth="1.15" />
    </svg>
  );
}
