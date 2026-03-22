import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleTranslate } from "../api/lib/translateHandler.js";

const app = express();
const port = 8787;

app.use(
  cors({
    origin: true,
  }),
);
app.use(express.json({ limit: "512kb" }));

app.options("/api/translate", (_req, res) => res.sendStatus(204));

app.post("/api/translate", async (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || "0.0.0.0";
  try {
    const result = await handleTranslate({
      method: req.method,
      body: req.body,
      headers: req.headers,
      ip,
    });
    if (result.silent) {
      return res.status(200).json({ translation: "" });
    }
    return res.status(200).json({ translation: result.translation });
  } catch (e) {
    console.error("[translate]", e?.message || e);
    const status =
      typeof e?.status === "number" && e.status >= 400 && e.status < 600
        ? e.status
        : 500;
    const dev = process.env.NODE_ENV !== "production";
    const msg =
      status === 500 && !dev
        ? "Something went wrong"
        : e?.message || "Something went wrong";
    return res.status(status).json({ error: msg });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Dev API at http://127.0.0.1:${port}`);
});
