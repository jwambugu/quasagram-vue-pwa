/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

// Cache First (Cache Falling Back to Network)
registerRoute(
  ({ url }) => url.host.startsWith("fonts.g"),
  new CacheFirst({
    cacheName: "google-fonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Network First (Network Falling Back to Cache)
registerRoute(
  ({ url }) => url.pathname.startsWith("/posts"),
  new NetworkFirst()
);

// Stale-While-Revalidate strategy
registerRoute(
  ({ url }) => url.href.startsWith("http"),
  new StaleWhileRevalidate()
);
