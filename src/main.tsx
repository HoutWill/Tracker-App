import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { ExpenseProvider } from './context/ExpenseContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ExpenseProvider>
        <App />
      </ExpenseProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// Completely Unregister & Purge PWA Service Worker to remove offline caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });

  if ('caches' in window) {
    caches.keys().then(keys => {
      for (let key of keys) {
        caches.delete(key);
      }
    });
  }
}
