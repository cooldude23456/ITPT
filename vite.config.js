import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import net from 'net';
import { app } from './server/index.js';

function apiPlugin() {
  return {
    name: 'itpt-backend-api-plugin',
    configureServer(server) {
      server.middlewares.use(app);

      // Windows dual-stack bridge: Forward IPv6 [::1]:5173 to IPv4 127.0.0.1:5173
      // so both http://localhost:5173 (IPv6) and http://127.0.0.1:5173 (IPv4) always connect reliably
      server.httpServer?.once('listening', () => {
        try {
          const bridge = net.createServer((socket) => {
            const target = net.connect(5173, '127.0.0.1');
            socket.pipe(target).pipe(socket);
            socket.on('error', () => target.destroy());
            target.on('error', () => socket.destroy());
          });
          bridge.on('error', () => {});
          bridge.listen(5173, '::1');
        } catch (err) {}
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(app);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), apiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
});
