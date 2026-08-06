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

// Register PWA Service Worker with Auto Update for installed mobile PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      registration => {
        console.log('PWA ServiceWorker registered successfully:', registration.scope);
        // Force check for ServiceWorker updates on PWA launch
        registration.update();
      },
      err => {
        console.log('PWA ServiceWorker registration failed:', err);
      }
    );
  });
}
