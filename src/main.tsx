/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/global.css';

// Standalone iOS can restore a previous page scroll position before React mounts.
// Keep the app at the top on fresh navigation and on a restored page session.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
const resetInitialScroll = () => {
  window.scrollTo(0, 0);
};
resetInitialScroll();
window.addEventListener('pageshow', resetInitialScroll);
requestAnimationFrame(resetInitialScroll);

// iOS standalone PWAs may report an outdated viewport height on first paint.
// Keep a pixel-based height synchronized when the app resumes or the viewport settles.
const syncViewportHeight = () => {
  const height = window.innerHeight;
  if (height > 0) {
    document.documentElement.style.setProperty('--enka-viewport-height', `${Math.round(height)}px`);
  }
};
syncViewportHeight();
window.addEventListener('resize', syncViewportHeight);
// Use layout viewport for the shell; visualViewport can exclude iOS safe areas.
window.addEventListener('pageshow', syncViewportHeight);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    syncViewportHeight();
    requestAnimationFrame(syncViewportHeight);
  }
});
requestAnimationFrame(syncViewportHeight);

// The plugin resolves the worker URL relative to Vite's /enka/ base.
// A root-relative /sw.js would point outside the GitHub Pages app.
if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new Event('enka:update-available'));
    },
  });
  window.addEventListener('enka:apply-update', () => {
    void updateSW(true);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
