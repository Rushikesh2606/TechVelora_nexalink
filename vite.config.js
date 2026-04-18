import { defineConfig, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'

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
  plugins: [jsxInJsPlugin(), react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    esbuild: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
