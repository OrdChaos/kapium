import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker is not supported in this browser');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      console.log('[PWA] Service Worker registered successfully:', registration);

      setInterval(() => {
        registration.update().catch((err) => {
          console.error('[PWA] Failed to check for Service Worker updates:', err);
        });
      }, 60000);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New Service Worker available. Page will be updated on next refresh.');
          }
        });
      });
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

registerServiceWorker();

(function restoreThemeBeforeHydrate() {
  try {
    const ls = window.localStorage.getItem('theme');
    const cookieMatch = document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = ls || cookie || (prefersDark ? 'dark' : 'light');

    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {
  }
})();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
