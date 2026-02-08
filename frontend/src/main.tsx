import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

// Register Service Worker for PWA support
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

      // Check for updates periodically
      setInterval(() => {
        registration.update().catch((err) => {
          console.error('[PWA] Failed to check for Service Worker updates:', err);
        });
      }, 60000); // Check every minute

      // Listen for new service worker activation
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, notify user
            console.log('[PWA] New Service Worker available. Page will be updated on next refresh.');
            // You can add custom notification here
          }
        });
      });
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });

  // Handle service worker controller change
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

// Initialize PWA
registerServiceWorker();

// Restore theme before hydration
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

// Render app
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
// 确保只进行一次挂载，避免重复渲染/移除节点错误
