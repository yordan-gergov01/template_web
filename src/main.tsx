import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import { ConfigError, getRuntimeConfig } from '@/config/runtime-config';
import './assets/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}
const root = createRoot(rootElement);

try {
  getRuntimeConfig();
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  if (!(error instanceof ConfigError)) {
    throw error;
  }
  root.render(
    <main>
      <h1>Configuration error</h1>
      <p>{error.message}</p>
    </main>,
  );
}
