import path from "path";
import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react";

function downloadProxyPlugin(): Plugin {
  return {
    name: "download-proxy-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api/download-proxy")) {
          try {
            const urlObj = new URL(req.url, "http://localhost");
            const targetUrl = urlObj.searchParams.get("url");
            if (!targetUrl) {
              res.statusCode = 400;
              res.end("Missing url parameter");
              return;
            }
            const upstream = await fetch(targetUrl, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              redirect: "follow",
            });
            if (!upstream.ok) {
              res.statusCode = upstream.status;
              res.end(`Upstream returned ${upstream.status}`);
              return;
            }
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
            const arrayBuffer = await upstream.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(err?.message || "Proxy error");
          }
          return;
        }
        next();
      });
    },
  };
}

function curseforgeProxyPlugin(env: Record<string, string>): Plugin {
  return {
    name: "curseforge-proxy-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api/curseforge")) {
          try {
            const apiKey =
              env.CURSEFORGE_API_KEY ||
              env.VITE_CURSEFORGE_API_KEY ||
              process.env.CURSEFORGE_API_KEY ||
              process.env.VITE_CURSEFORGE_API_KEY;
            const urlObj = new URL(req.url, "http://localhost");
            let targetPath = urlObj.pathname.replace(/^\/api\/curseforge\/?/, "");
            if (!targetPath.startsWith("/")) targetPath = "/" + targetPath;

            const searchParamsString = urlObj.search;
            const upstreamUrl = `https://api.curseforge.com${targetPath}${searchParamsString}`;

            const headers: Record<string, string> = {
              "x-api-key": apiKey || "",
              Accept: "application/json",
              "User-Agent": "MODPKG-DevProxy/1.0",
            };

            const upstream = await fetch(upstreamUrl, {
              method: req.method,
              headers,
            });

            res.statusCode = upstream.status;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Content-Type", "application/json");
            const data = await upstream.text();
            res.end(data);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || "CurseForge proxy error" }));
          }
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), downloadProxyPlugin(), curseforgeProxyPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api-curseforge": {
          target: "https://api.curseforge.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-curseforge/, ""),
        },
        "/curseforge-cdn": {
          target: "https://edge.forgecdn.net",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/curseforge-cdn/, ""),
        },
        "/curseforge-media": {
          target: "https://media.forgecdn.net",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/curseforge-media/, ""),
        },
      },
    },
  };
});
