import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The backend's CORS allows http://localhost:3000, so the dev server must use
// exactly that origin and fail instead of moving to another port.
const devServer = { host: 'localhost', port: 3000, strictPort: true };

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: devServer,
  preview: devServer,
  build: {
    sourcemap: false,
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    // Removed once the first tests exist.
    passWithNoTests: true,
  },
});
