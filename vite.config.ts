// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
    plugins: [
      VitePWA({
        // Registration happens only in src/lib/pwa.ts (guarded against previews).
        injectRegister: null,
        registerType: "autoUpdate",
        devOptions: { enabled: false },
        filename: "sw.js",
        // TanStack Start/nitro serves static files from dist/client.
        outDir: "dist/client",
        manifest: false, // hand-written public/manifest.webmanifest
        workbox: {
          globDirectory: "dist/client",
          globPatterns: ["assets/**/*.{js,css,woff2}", "icons/*.png", "favicon.png"],
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              // Pages: always try the network first; fall back to the last saved copy offline.
              urlPattern: ({ request, url }) =>
                (request.mode === "navigate" || url.pathname === "/offline") &&
                !url.pathname.startsWith("/~oauth") &&
                !url.pathname.startsWith("/api") &&
                !url.pathname.startsWith("/_serverFn"),
              handler: "NetworkFirst",
              options: {
                cacheName: "ndh-pages",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 40 },
              },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith("/images/"),
              handler: "CacheFirst",
              options: {
                cacheName: "ndh-images",
                expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
