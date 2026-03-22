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

  const allAllowed = vercel ? [...allowed, vercel] : allowed;
  const ok =
    !origin ||
    allAllowed.includes(origin);

  if (ok && origin) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }

  return {
    "Access-Control-Allow-Origin": allAllowed[0] || "",
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

  const vercelIp = req.headers["x-vercel-forwarded-for"];
  const ip = typeof vercelIp === "string" && vercelIp.length
    ? vercelIp.split(",")[0].trim()
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
    const status = typeof e?.status === "number" ? e.status : 500;
    console.error("[api/translate]", status);
    const safe =
      status === 400
        ? e.message || "Invalid request"
        : status === 403
          ? "Forbidden"
          : status === 405
            ? "Method not allowed"
            : status === 429
              ? "Too many requests. Try again later."
              : "Something went wrong";
    return res.status(status).json({ error: safe });
  }
}
