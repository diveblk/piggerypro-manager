self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

// You can add caching later if you want
self.addEventListener("fetch", (event) => {});
