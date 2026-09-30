/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const config = withPWA({
  images: {
    remotePatterns: [],
  },
  // Acknowledge use of Turbopack alongside a webpack-based plugin (next-pwa)
  // so Next.js 16 does not treat this as a misconfiguration.
  turbopack: {},
});

export default config;
