import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors({
  origin: true,
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
    model: "gpt-6-luna"
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

    const { input, model = "gpt-6-luna" } = req.body || {};
    if (!input || typeof input !== "string") {
      return res.status(400).json({ ok: false, error: "input is required" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let response;
    try {
      response = await client.responses.create({
        model,
        input
      });
    } catch (firstError) {
      console.error("Primary OpenAI request failed:", firstError);

      // Compatibility fallback for accounts that have not yet received GPT-6 Luna.
      if (model === "gpt-6-luna" && [400, 404].includes(firstError?.status)) {
        response = await client.responses.create({
          model: "gpt-5.6-luna",
          input
        });
      } else {
        throw firstError;
      }
    }

    res.json({
      ok: true,
      model: response.model,
      output: response.output_text ?? "",
      responseId: response.id
    });
  } catch (error) {
    console.error("OpenAI request failed:", error);
    res.status(error?.status && Number.isInteger(error.status) ? error.status : 502).json({
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
