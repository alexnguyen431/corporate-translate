import { handleTranslate } from "./lib/translateHandler.js";

function corsHeaders(req) {
  const origin = req.headers?.origin || req.headers?.Origin;
  const isProd =
    process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const vercel = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;

  if (!isProd) {
    return {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }

  const ok =
    !origin ||
    allowed.includes(origin) ||
    (vercel && origin === vercel);

  if (ok) {
    return {
      "Access-Control-Allow-Origin": origin || vercel || allowed[0] || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }

  return {
    "Access-Control-Allow-Origin": allowed[0] || "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default async function handler(req, res) {
  const h = corsHeaders(req);
  Object.entries(h).forEach(([k, v]) => {
    if (v) res.setHeader(k, v);
  });

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  let body = {};
  try {
    if (typeof req.body === "string") {
      body = JSON.parse(req.body || "{}");
    } else if (req.body && typeof req.body === "object") {
      body = req.body;
    }
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const xf = req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];
  const ip =
    typeof xf === "string"
      ? xf.split(",")[0].trim()
      : req.socket?.remoteAddress || "0.0.0.0";

  try {
    const result = await handleTranslate({
      method: req.method,
      body,
      headers: req.headers,
      ip,
    });
    if (result.silent) {
      return res.status(200).json({ translation: "" });
    }
    return res.status(200).json({ translation: result.translation });
  } catch (e) {
    const status = e.status || 500;
    const msg = status === 500 ? "Something went wrong" : e.message;
    return res.status(status).json({ error: msg });
  }
}
