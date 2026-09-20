"use client";

import { usePathname } from "next/navigation";
import { Agentation } from "agentation";

/**
 * Dev-only floating chrome, mounted from the root layout.
 *
 * Suppressed on /demo/* — those routes are recording stages, and a feedback
 * bug floating over the product would end up in the footage (and in the
 * Electron shell there's no "site" to give feedback on).
 */
export function DevChrome() {
  const pathname = usePathname();
  if (pathname.startsWith("/demo")) return null;
  return <Agentation />;
}
