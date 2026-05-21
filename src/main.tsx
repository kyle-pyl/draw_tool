import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if (__BUNDLE_TYPE__ === 'lite') {
  document.title = 'Draw Tool (Lite)';
} else {
  document.title = 'Draw Tool (Full)';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { type: 'module' }).catch((err) => {
    console.warn('Service Worker registration failed:', err);
  });
}
