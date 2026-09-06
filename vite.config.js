import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function downloadProxyPlugin() {
  return {
    name: 'download-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/download-proxy')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const targetUrl = urlObj.searchParams.get('url');
            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url parameter');
              return;
            }
            const upstream = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              redirect: 'follow'
            });
            if (!upstream.ok) {
              res.statusCode = upstream.status;
              res.end(`Upstream returned ${upstream.status}`);
              return;
            }
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
            const arrayBuffer = await upstream.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          } catch (err) {
            res.statusCode = 500;
            res.end(err?.message || 'Proxy error');
          }
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), downloadProxyPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api-curseforge': {
        target: 'https://api.curseforge.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-curseforge/, ''),
      },
      '/curseforge-cdn': {
        target: 'https://edge.forgecdn.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/curseforge-cdn/, ''),
      },
      '/curseforge-media': {
        target: 'https://media.forgecdn.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/curseforge-media/, ''),
      },
    },
  },
})
