// 435 – Register service worker + Add-to-Home Screen prompt
// Place this in a <Script> tag in the root layout or as a component

export function registerServiceWorker() {
  if (typeof window === "undefined") return;

  // 433 – SW registration
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[Yumna SW] Registered:", reg.scope))
        .catch((err) => console.warn("[Yumna SW] Registration failed:", err));
    });
  }
}

// 435 – Capture beforeinstallprompt for Add-to-Home
let deferredPrompt: any = null;

export function captureInstallPrompt() {
  if (typeof window === "undefined") return;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent("yumna:installready"));
  });
}

export function showInstallPrompt(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!deferredPrompt) { resolve(false); return; }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice: any) => {
      deferredPrompt = null;
      resolve(choice.outcome === "accepted");
    });
  });
}
