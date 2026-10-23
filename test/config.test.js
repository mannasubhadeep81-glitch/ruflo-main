import test from "node:test";
import assert from "node:assert/strict";
import { getAllowedOrigins, getModel, isAllowedOrigin } from "../config.js";

test("uses the configured model when provided", () => {
  assert.equal(getModel({ OPENAI_MODEL: "example-model" }), "example-model");
});

test("uses a consistent default model when no environment value exists", () => {
  assert.equal(getModel({}), "gpt-5.6-mini");
});

test("parses comma-separated CORS origins", () => {
  assert.deepEqual(
    getAllowedOrigins({ CORS_ORIGINS: "https://one.example, https://two.example " }),
    ["https://one.example", "https://two.example"]
  );
});

test("allows non-browser requests and only configured browser origins", () => {
  const allowed = ["https://one.example"];
  assert.equal(isAllowedOrigin(undefined, allowed), true);
  assert.equal(isAllowedOrigin("https://one.example", allowed), true);
  assert.equal(isAllowedOrigin("https://untrusted.example", allowed), false);
});
