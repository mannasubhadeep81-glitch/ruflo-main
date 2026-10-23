import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { getAllowedOrigins, getModel, isAllowedOrigin } from "./config.js";

const app = express();
const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin, allowedOrigins));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));

const port = process.env.PORT || 3000;

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ruflo-backend",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    model: getModel()
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        ok: false,
        error: "OPENAI_API_KEY is not configured on the backend."
      });
    }

    const { input } = req.body || {};
    if (typeof input !== "string" || !input.trim()) {
      return res.status(400).json({ ok: false, error: "input is required" });
    }
    if (input.length > 20000) {
      return res.status(413).json({ ok: false, error: "input exceeds the 20000-character limit" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: getModel(),
      input: input.trim()
    });

    return res.json({
      ok: true,
      model: response.model,
      output: response.output_text ?? "",
      responseId: response.id
    });
  } catch (error) {
    console.error("OpenAI request failed:", error);
    return res.status(error?.status && Number.isInteger(error.status) ? error.status : 502).json({
      ok: false,
      error: "OpenAI request failed.",
      code: error?.code || null,
      type: error?.type || null
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Ruflo backend listening on port ${port}`);
});
