import type { ReactNode } from "react";

/**
 * A pane that isn't ready yet: its contents stay visible as a blurred hint of
 * what's coming, with a lock over them.
 *
 * The preview is `inert`, not merely blurred — blur is a paint effect, so
 * without it the links underneath stay clickable, tabbable and readable to a
 * screen reader while looking unavailable. It is also clipped to the pane's
 * visible height, because scrolling a blurred wall reads as a broken page
 * rather than a locked one.
 */
export function ComingSoon({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="max-h-[60svh] overflow-hidden lg:max-h-[calc(100svh-7rem)]">
        <div
          inert
          className="pointer-events-none select-none opacity-75 blur-[6px] saturate-50"
        >
          {children}
        </div>
      </div>

      {/* The clip has to end somewhere; a fade ends it instead of cutting it. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-shell" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Same pill vocabulary as the nav — a locked pane is still the shell
            talking, not a new kind of surface. */}
        <span className="inline-flex items-center gap-2 rounded-full border border-shell-line bg-shell-track px-4 py-2.5 text-[12.5px] text-shell-dim">
          <LockIcon className="h-[13px] w-[13px] text-shell-faint" />
          Coming soon
        </span>
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2.25" y="6" width="9.5" height="6.25" rx="1.75" />
      <path d="M4.6 6V4.4a2.4 2.4 0 0 1 4.8 0V6" />
    </svg>
  );
}
