import { defineConfig, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Custom plugin to enable JSX in .js files for Vite 8 (oxc parser)
function jsxInJsPlugin() {
  return {
    name: 'transform-jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.match(/src\/.*\.js$/)) {
        return null;
      }
      return await transformWithOxc(code, id, {
        lang: 'jsx',
      });
    },
  };
}

export default defineConfig({
  plugins: [jsxInJsPlugin(), react(), tailwindcss()],
  server: {
    proxy: {
      '/api/verify-company': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
