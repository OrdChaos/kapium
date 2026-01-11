import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// 在 React 挂载前恢复主题，避免闪烁：优先使用 localStorage，其次回退到 cookie，再使用系统偏好
;(function restoreThemeBeforeHydrate() {
  try {
    const ls = window.localStorage.getItem('theme');
    const cookieMatch = document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = ls || cookie || (prefersDark ? 'dark' : 'light');

    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {
    // ignore — 任何错误都不应阻止应用加载
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
