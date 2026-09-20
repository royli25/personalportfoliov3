/**
 * Canvas size — in its own module with NO "use client" on purpose: Server
 * Components (the /demo page) read it, and importing a constant out of a
 * client module from the server hands you a client-reference proxy, not the
 * value (same trap as components/tokens.ts — see CLAUDE.md).
 */
export const FRAME = { width: 1440, height: 900 } as const;
