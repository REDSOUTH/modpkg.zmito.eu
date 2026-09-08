import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const apiKey = process.env.CURSEFORGE_API_KEY || process.env.VITE_CURSEFORGE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "CurseForge API key is not configured on the server. Please set CURSEFORGE_API_KEY in Vercel environment variables.",
    });
  }

  try {
    const parsedUrl = new URL(req.url || "", "http://localhost");

    // Extract endpoint: either from query param (?endpoint=v1/mods/search) or parsed from URL path
    let targetPath = parsedUrl.searchParams.get("endpoint") || "";
    parsedUrl.searchParams.delete("endpoint");

    if (!targetPath) {
      targetPath = parsedUrl.pathname.replace(/^\/api\/curseforge\/?/, "");
    }

    if (!targetPath) {
      return res.status(400).json({ error: "Missing CurseForge endpoint path" });
    }

    if (!targetPath.startsWith("/")) {
      targetPath = "/" + targetPath;
    }

    const searchParamsString = parsedUrl.searchParams.toString();
    const upstreamUrl = `https://api.curseforge.com${targetPath}${searchParamsString ? `?${searchParamsString}` : ""}`;

    const headers: Record<string, string> = {
      "x-api-key": apiKey,
      "Accept": "application/json",
      "User-Agent": "MODPKG-Proxy/1.0",
    };

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      headers["Content-Type"] = "application/json";
      fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const upstreamRes = await fetch(upstreamUrl, fetchOptions);
    const data = await upstreamRes.json().catch(() => null);

    res.status(upstreamRes.status);
    res.setHeader("Content-Type", "application/json");
    return res.send(data);
  } catch (err: any) {
    console.error("CurseForge proxy error:", err);
    return res.status(500).json({
      error: err?.message || "Internal server error in CurseForge proxy",
    });
  }
}
