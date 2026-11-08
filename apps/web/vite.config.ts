import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const serverPort = Number(process.env.PARK_SERVER_PORT) || 8787;

/**
 * 兼容旧版 Android WebView（如 83）：语法降级到 Chrome 80，
 * 并按实际用到的 API 注入 core-js 补丁（Array.prototype.at 等）。
 * 不生成 legacy（nomodule）产物，Chrome 61+ 都支持 ES 模块。
 */
const modernTargets = ['chrome >= 80', 'safari >= 14', 'firefox >= 78', 'edge >= 80'];

/** 跨域隔离：棋类导师的多线程引擎需要（与生产服务器一致） */
const isolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  plugins: [
    react(),
    legacy({ renderLegacyChunks: false, modernTargets, modernPolyfills: true }),
  ],
  preview: { headers: isolation },
  worker: { format: 'es' },
  server: {
    headers: isolation,
    port: 5173,
    host: true,
    proxy: {
      '/ws': { target: `ws://localhost:${serverPort}`, ws: true },
    },
  },
  build: {
    cssTarget: ['chrome80', 'safari14'],
    chunkSizeWarningLimit: 800,
  },
});
