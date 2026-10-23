# Ruflo repository audit

## Scope
Read-only review of the existing GitHub source and Render service metadata. Fixes are prepared on `fix/ruflo-audit`; production branch and Render services are not changed by this audit.

## Findings addressed
- The backend previously defaulted to an unverified model name and used a fallback model name that was also unverified. The selected model is now configurable through `OPENAI_MODEL`, defaulting to the model already referenced by the legacy client (`gpt-5.6-mini`). Verify that this model is enabled for the OpenAI API project before relying on it.
- CORS previously reflected every origin. It now allows the GitHub Pages origin by default and supports a comma-separated `CORS_ORIGINS` override.
- Chat input is now validated and capped at 20,000 characters.
- The active backend returns `responseId`; the legacy client now reads that field instead of `data.id`.
- JavaScript syntax checks and unit tests have been added, along with a CI workflow.
- No API key or other secret was read, changed, or added.

## Render configuration observed
Two Render services point to this repository:
- `ruflo-backend` at `https://ruflo-backend.onrender.com`, configured with `npm install` / `npm start`.
- `ruflo-backend-ir2k` at `https://ruflo-backend-ir2k.onrender.com`, configured with `npm install` / `yarn start`.

The current `app.js` references the second service. Both services have automatic deploy-on-commit enabled for `main`; this branch is not `main`, so these commits should not trigger those production services. Verify this behavior in Render before merging.

## Render variables to verify manually
- `OPENAI_API_KEY`: must already be configured in the intended service. Do not paste it into GitHub or source files.
- `OPENAI_MODEL`: optional; set to a model actually enabled for the API project.
- `CORS_ORIGINS`: optional comma-separated list of exact browser origins. The default is `https://mannasubhadeep81-glitch.github.io`; add a custom domain if the UI is served elsewhere.

## Remaining verification
- Confirm the model is enabled for the OpenAI API project.
- Run the new CI checks and review their logs.
- Test `/health` and a safe `/api/chat` request against the intended Render service.
- Confirm the actual production UI origin and configure `CORS_ORIGINS` if needed.
- Review the PR before merging; do not merge or deploy automatically.
