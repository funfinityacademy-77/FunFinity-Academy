import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist-widget',
    lib: {
      entry: 'src/components/support-chat/widget-entry.tsx',
      name: 'SupportChatWidget',
      fileName: (format) => `widget.${format}.js`,
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    minify: false,
    sourcemap: false
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
