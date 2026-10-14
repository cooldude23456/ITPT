import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { app } from './server/index.js';

function apiPlugin() {
  return {
    name: 'itpt-backend-api-plugin',
    configureServer(server) {
      server.middlewares.use(app);
    },
    configurePreviewServer(server) {
      server.middlewares.use(app);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    port: 5173,
    open: false
  }
});
