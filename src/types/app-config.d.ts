// Runtime configuration written to /config.js when the container starts (and
// served by the Vite dev server locally). Loaded before the application bundle.
interface Window {
  __APP_CONFIG__?: {
    backendUrl?: unknown;
  };
}
