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
import { Queue } from "workbox-background-sync";

// Disable workbox logs
self.__WB_DISABLE_DEV_LOGS = true;

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

let supportsBackgroundSync = "sync" in self.registration;
let createPostQueue = null;

if (supportsBackgroundSync) {
  // Create a new queue
  createPostQueue = new Queue("create_post_queue");
}

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

if (supportsBackgroundSync) {
  // Fetch event listener
  self.addEventListener("fetch", (event) => {
    // Clone the request to ensure it's safe to read when
    // adding to the Queue.
    const { url } = event.request;

    if (url.endsWith("/create-post")) {
      const promiseChain = fetch(event.request.clone()).catch((err) => {
        return createPostQueue.pushRequest({ request: event.request });
      });

      event.waitUntil(promiseChain);
    }
  });
}
