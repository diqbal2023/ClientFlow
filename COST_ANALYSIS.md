# ClientFlow AI Cost Analysis

## Provider and configuration

| Item | Value |
|------|-------|
| AI provider | [FAU Trussed.ai](https://trussed.hpc.fau.edu) |
| API base | `https://fauengtrussed.fau.edu/provider/generic` |
| Model | Controlled by `LLM_MODEL` (default: `cogito:14b`) |
| Integration | Server-side Netlify Function → OpenAI-compatible SDK |

Trussed bills per **token** (input + output), not per button click. Exact pricing depends on the model, your course project budget, and FAU Trussed account settings. This document uses **estimates** for classroom/demo planning—not guaranteed rates.

---

## AI features that call the model

1. **AI Business Description Generator** (admin)
2. **AI Service Description Generator** (admin)
3. **AI Client Rebooking Recommendation** (client)
4. **AI Booking Request Summary** (admin, per request card)

All four call `POST /.netlify/functions/ai` with JSON-mode completions and capped `max_tokens` (roughly 400–600 per request).

---

## Estimated demo usage

For a typical class demo or gate review:

- **Calls per demo session:** ~5–15 total across all features
- **Input tokens per call:** ~150–400 (prompt + payload)
- **Output tokens per call:** ~100–300 (JSON response)
- **Automatic page-load calls:** none (all AI is button-triggered)

Under FAU Hootcamp course-managed Trussed budgets, light demo usage is typically **low cost** compared to heavy daily development with IDE AI tools. Prior FAU class examples with many students showed very small monthly totals for app-level API use when calls are limited and prompts are concise.

---

## Feature cost estimate table

| Feature | Est. input tokens | Est. output tokens | Est. demo calls | Cost notes |
|---------|-------------------|--------------------|-----------------|------------|
| Business description | 250–400 | 150–250 | 1–3 | One call per button click |
| Service description | 200–350 | 100–200 | 1–3 | Smaller payload than business |
| Rebooking recommendation | 300–500 | 150–250 | 1–2 | Includes booking history snippet |
| Booking request summary | 250–400 | 150–250 | 2–5 | One call per request card |

**Demo session total (rough):** ~2,000–8,000 tokens combined—well within typical per-student Trussed budgets when demos are controlled.

---

## Cost-saving strategies (implemented or recommended)

| Strategy | Status in ClientFlow |
|----------|----------------------|
| Cap `max_tokens` per AI action | Implemented in Netlify handlers |
| Keep prompts concise | Implemented |
| Trim payloads (no full DB dumps) | Implemented |
| Button-triggered AI only | Implemented—no AI on page load |
| Template fallbacks on failure | Implemented—avoids retry loops |
| Do not auto-retry failed UI calls | User must click again |
| Avoid redundant calls | One button = one request |

---

## What affects cost

- **Model choice** — `cogito:14b` is the recommended allowlisted model for structured JSON on the engineering proxy.
- **Prompt size** — Longer booking histories or descriptions increase input tokens.
- **Demo frequency** — Repeated clicks during testing add up; use fallbacks and local `netlify dev` thoughtfully.
- **Failed retries** — Server retries 429/502/503 up to 3 times with backoff (may increase token use only on success).

---

## Monitoring usage

Students can check usage on [trussed.hpc.fau.edu](https://trussed.hpc.fau.edu) under **My Keys**. Contact course staff or FAU Engineering TSG if you hit budget or rate limits.

---

## Summary

ClientFlow is designed for **low-volume, button-triggered AI** suitable for classroom demos. Costs depend on Trussed model billing and total tokens consumed; with concise prompts, token caps, and manual triggers, demo usage should remain modest under typical FAU Hootcamp budgets.
