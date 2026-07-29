import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: '.',
  server: {
    open: '/demo/index.html',
    port: 3000
  }
});
