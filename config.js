const DEFAULT_MODEL = "gpt-5.6-mini";
const DEFAULT_ALLOWED_ORIGINS = ["https://mannasubhadeep81-glitch.github.io"];

export function getModel(env = process.env) {
  return (env.OPENAI_MODEL || DEFAULT_MODEL).trim();
}

export function getAllowedOrigins(env = process.env) {
  const configured = env.CORS_ORIGINS;
  if (!configured || !configured.trim()) return DEFAULT_ALLOWED_ORIGINS;
  return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
}

export function isAllowedOrigin(origin, allowedOrigins) {
  return !origin || allowedOrigins.includes(origin);
}
