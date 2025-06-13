import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  optimizeDeps: {
    include: ['lodash', 'lucide-react']
  },
  build: {
    // Cloudflare Pages 优化
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          i18n: ['i18next', 'react-i18next'],
          utils: ['lodash']
        }
      }
    },
    // 生产环境特定配置
    ...(mode === 'production' && {
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    })
  },
  server: {
    hmr: {
      overlay: false // Disable the error overlay
    }
  }
}));
