# ClientFlow Testing Guide

## Overview

ClientFlow is tested primarily through **manual UI testing** in the browser, **Supabase dashboard** verification, and **Netlify Function** testing during local development. Automated test suites are not included in the MVP.

### Tools

| Tool | Use |
|------|-----|
| App UI | End-to-end flows for admin and client roles |
| Supabase dashboard | Verify table rows, RLS, and auth users |
| `npx netlify dev` | Test React app + `/.netlify/functions/ai` locally |
| Postman / Thunder Client | Optional direct POST to AI function |
| Browser DevTools | Network tab, console logs |

### Local setup

```bash
npm install
cp .env.example .env   # add Supabase + Trussed values
npx netlify dev        # recommended for AI features
```

---

## Auth test cases

| ID | Test | Steps | Expected |
|----|------|-------|------------|
| A1 | Valid signup (client) | Register as client | Redirect to client dashboard |
| A2 | Valid signup (admin) | Register as admin | Redirect to admin dashboard |
| A3 | Valid login | Login with correct credentials | Session active, correct dashboard |
| A4 | Logout | Click logout | Redirect to home, protected routes blocked |
| A5 | Invalid signup | Empty name or short password | Validation error shown |
| A6 | Wrong password | Login with bad password | Friendly error, no crash |
| A7 | Logged-out protected route | Visit `/admin` while logged out | Redirect to login |
| A8 | Client → admin route | Client visits `/admin` | Access denied / redirect |
| A9 | Admin → client route | Admin visits `/client` | Access denied / redirect |

---

## Admin business profile CRUD

| ID | Test | Expected |
|----|------|----------|
| B1 | Create business profile | Profile saved, view mode shown |
| B2 | Edit business profile | Changes persist after save |
| B3 | Delete business profile | Profile removed, create form shown |
| B4 | Missing business name | Validation error, no save |
| B5 | AI business description | Description filled; tagline/welcome preview shown |

---

## Admin service CRUD

| ID | Test | Expected |
|----|------|----------|
| S1 | Add service | Service appears in list |
| S2 | Edit service | Changes persist |
| S3 | Delete service | Service removed |
| S4 | Missing service name | Validation error |
| S5 | Invalid interval days | Error for zero/negative/non-integer |
| S6 | Empty interval | Service saves with null interval |
| S7 | AI service description | Description filled; short summary preview |

---

## Client booking request CRUD

| ID | Test | Expected |
|----|------|----------|
| C1 | Browse businesses | Business list loads |
| C2 | View business details | Services and request form shown |
| C3 | Submit booking request | Success message; appears in My booking requests |
| C4 | Edit pending request | Changes saved |
| C5 | Cancel pending request | Status becomes canceled |
| C6 | Delete request | Request removed |
| C7 | Missing title/details | Validation error |

---

## Admin booking request status

| ID | Test | Expected |
|----|------|----------|
| R1 | View incoming requests | Requests for own business only |
| R2 | Update to confirmed | Status updates in UI and Supabase |
| R3 | Update to completed | Status updates |
| R4 | Update to canceled | Status updates |
| R5 | Summarize request | Summary, key details, next step shown per card |

---

## AI feature test cases

| ID | Feature | Role | Expected |
|----|---------|------|----------|
| AI1 | Business description | Admin | Button disabled while loading; description filled |
| AI2 | Service description | Admin | Per-form loading; description filled |
| AI3 | Rebooking recommendation | Client | Empty state if no history; recommendation on success |
| AI4 | Booking request summary | Admin | Per-card loading; summary under that card only |

---

## Edge and error cases

| ID | Scenario | Expected |
|----|----------|----------|
| E1 | Invalid signup input | Friendly validation message |
| E2 | Wrong login password | "Incorrect email or password" style message |
| E3 | Logged-out user on `/client` | Redirect to login |
| E4 | Client on admin tools | Blocked by protected route |
| E5 | Admin on client-only tools | Blocked by protected route |
| E6 | Missing business/service/request fields | Validation before save or AI call |
| E7 | Negative interval days | Validation error on service form |
| E8 | AI API failure | Friendly error or fallback template; app does not crash |
| E9 | Missing AI env var | "AI is not configured on the server" message |
| E10 | Rate limit (429) | Friendly retry message; server may retry then fallback |

### Testing AI errors locally

Remove `TRUSSED_API_KEY` from `.env`, restart `netlify dev`, click an AI button → expect configuration error.

### Testing AI with curl

```bash
curl -X POST http://localhost:8888/.netlify/functions/ai \
  -H "Content-Type: application/json" \
  -d '{"action":"businessDescription","payload":{"business_name":"Test","business_type":"Salon"}}'
```

---

## Deployment smoke test checklist

After deploying to Netlify:

- [ ] Live site loads
- [ ] Signup works (client and admin)
- [ ] Login and logout work
- [ ] Admin: create/edit business profile
- [ ] Admin: create/edit services
- [ ] Admin: view and update booking request status
- [ ] Admin: AI business description, service description, request summary
- [ ] Client: browse businesses and submit booking request
- [ ] Client: view own booking requests
- [ ] Client: AI rebooking recommendation (with history)
- [ ] Protected routes block wrong roles
- [ ] No API keys visible in browser Network tab or built JS

---

## Supabase verification

After CRUD operations, confirm rows in:

- `profiles`
- `businesses`
- `services`
- `client_requests`

Use the Supabase **Table Editor** and filter by user/business id.
