// 433 – Service Worker for PWA offline support
// 436 – Offline mode caching strategy

const CACHE_NAME = "yumna-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install: pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: purge old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // API requests: network-first
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
    )
  );
});

// Background sync for offline transactions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncOfflineTransactions());
  }
});

async function syncOfflineTransactions() {
  const db = await openDB();
  const txs = await db.getAll("offline-transactions");
  for (const tx of txs) {
    try {
      await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });
      await db.delete("offline-transactions", tx.id);
    } catch {}
  }
}

// Minimal IndexedDB helper
function openDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open("yumna-offline", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("offline-transactions", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
  });
}
