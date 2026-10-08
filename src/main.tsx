/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/global.css';

// The plugin resolves the worker URL relative to Vite's /enka/ base.
// A root-relative /sw.js would point outside the GitHub Pages app.
if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new Event('enka:pwa-update-available'));
    },
    onOfflineReady() {
      window.dispatchEvent(new Event('enka:pwa-offline-ready'));
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
