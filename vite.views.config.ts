import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist/views',
    lib: {
      entry: resolve('GreetingView.ts'),
      name: 'GreetingView',
      formats: ['cjs'],
      fileName: (format) => `GreetingView.js`
    },
    rollupOptions: {
      external: ['asyar-api'],
      output: {
        globals: {
          'asyar-api': 'asyarApi'
        }
      }
    },
    emptyOutDir: false
  }
});
