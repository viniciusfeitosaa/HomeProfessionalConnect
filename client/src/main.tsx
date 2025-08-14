import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { safeQueryClient as queryClient } from "@/lib/safe-query-client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/lib/error-boundary";
import App from "./App";
import "./index.css";

// Global error handlers to prevent unknown errors
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.warn('Uncaught error:', event.error);
});

// Remoção defensiva de elementos injetados por extensões (ex.: "torrent-scanner-popup")
(() => {
  const removeInjectedNodes = () => {
    try {
      const exact = document.getElementById('torrent-scanner-popup');
      if (exact && exact.parentNode) exact.parentNode.removeChild(exact);
      const partial = document.querySelectorAll('[id*="torrent-scanner-popup"], [class*="torrent-scanner-popup"]');
      partial.forEach((node) => node.parentNode && node.parentNode.removeChild(node));
    } catch {}
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeInjectedNodes, { once: true });
  } else {
    removeInjectedNodes();
  }
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        const id = n.id || '';
        const cls = n.className?.toString?.() || '';
        if (id.includes('torrent-scanner-popup') || cls.includes('torrent-scanner-popup')) {
          try { n.parentNode && n.parentNode.removeChild(n); } catch {}
        }
        // Verifica filhos também
        const suspects = n.querySelectorAll?.('[id*="torrent-scanner-popup"], [class*="torrent-scanner-popup"]');
        suspects?.forEach((node) => { try { node.parentNode && node.parentNode.removeChild(node); } catch {} });
      });
    }
  });
  try { observer.observe(document.documentElement, { childList: true, subtree: true }); } catch {}
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="lifebee-ui-theme">
          <App />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
