import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const port = process.env.PORT || 3000;

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ruflo-backend",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "OPENAI_API_KEY is not configured on the backend." });
    }

    const { input, model = "gpt-5.6-mini" } = req.body || {};
    if (!input) return res.status(400).json({ error: "input is required" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model,
      input
    });

    res.json({
      ok: true,
      output: response.output_text ?? "",
      responseId: response.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI request failed." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Ruflo backend listening on port ${port}`);
});
