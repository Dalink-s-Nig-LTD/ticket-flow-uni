import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handlers to avoid unhandled promise rejections crashing the app
// and to avoid noisy errors when third-party telemetry (e.g. Sentry) is unreachable.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (ev) => {
    try {
      // Prefer logging locally; avoid throwing from the handler.
      console.warn("Unhandled promise rejection:", ev.reason);
    } catch (e) {
      // swallow
    }
  });

  window.addEventListener("error", (ev) => {
    try {
      console.warn("Uncaught error:", ev.error ?? ev.message);
    } catch (e) {
      // swallow
    }
  });
}

// Only initialize external telemetry (Sentry) in production when a DSN is provided.
// This avoids DNS/network failures in development causing unhandled rejections.
try {
  const SENTRY_DSN =
    import.meta.env.VITE_SENTRY_DSN || import.meta.env.SENTRY_DSN;
  const NODE_ENV = import.meta.env.MODE || process.env.NODE_ENV;
  if (SENTRY_DSN && NODE_ENV === "production") {
    // Dynamically import Sentry to avoid bundling it when unused.
    // If Sentry isn't installed, this will fail silently.
    // Use @vite-ignore so Vite doesn't try to resolve this optional dependency at build time
    import(/* @vite-ignore */ "@sentry/browser")
      .then((SentryModule: unknown) => {
        const maybeDefault = (SentryModule as { default?: unknown }).default;
        try {
          const maybeInit = (
            (maybeDefault ?? SentryModule) as unknown as {
              init?: (...args: unknown[]) => unknown;
            }
          ).init;
          if (typeof maybeInit === "function") {
            maybeInit({
              dsn: SENTRY_DSN,
              beforeSend(event: unknown) {
                if (typeof navigator !== "undefined" && !navigator.onLine) {
                  return null;
                }
                return event;
              },
              // keep transport timeout small so it fails fast if network is down
              transportOptions: { timeout: 2000 },
            });
          }
        } catch (e) {
          console.warn("Sentry init failed:", e);
        }
      })
      .catch(() => {
        // Sentry package not present or failed to load — ignore
      });
  }
} catch (e) {
  // ignore
}

createRoot(document.getElementById("root")!).render(<App />);
