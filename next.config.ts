import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev badge sits bottom-left, exactly where the demo's own chrome is,
  // and lands in every Screen Studio take. Turning off the indicators keeps
  // the build-error overlay, which is the part worth having.
  devIndicators: { buildActivity: false, appIsrStatus: false },
};

export default nextConfig;
