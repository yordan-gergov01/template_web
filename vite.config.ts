import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The backend's CORS allows http://localhost:3000, so the dev server must use
// exactly that origin and fail instead of moving to another port.
const devServer = { host: 'localhost', port: 3000, strictPort: true };

export default defineConfig({
  plugins: [react()],
  server: devServer,
  preview: devServer,
  build: {
    sourcemap: false,
  },
});
