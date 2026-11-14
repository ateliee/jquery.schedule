import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: '.',
  server: {
    host: true,
    open: '/demo/index.html',
    port: 3000
  }
});
