# ClientFlow API Documentation

ClientFlow is a React + Vite frontend that uses **Supabase** as its backend-as-a-service (BaaS). Most data operations are performed through the Supabase JavaScript client (`src/lib/supabaseClient.js`) against PostgreSQL tables with Row Level Security (RLS).

AI features use a **Netlify Function** proxy at `POST /.netlify/functions/ai` so the Trussed API key stays server-side.

---

## Authentication (Supabase Auth)

| Operation | Method / Function | Auth | Input | Result | Common errors |
|-----------|-------------------|------|-------|--------|---------------|
| Signup | `supabase.auth.signUp()` | None | `email`, `password`, metadata: `full_name`, `role` | User created; profile row inserted | Email already registered, weak password |
| Login | `supabase.auth.signInWithPassword()` | None | `email`, `password` | Active session | Invalid credentials, unconfirmed email |
| Logout | `supabase.auth.signOut()` | Logged-in user | None | Session cleared | Network error |

**Roles:** `admin` (business owner) or `client` (end user). Role is stored in `profiles.role`.

---

## Profiles (`profiles` table)

| Operation | Method | Auth / Role | Input | Result | Common errors |
|-----------|--------|-------------|-------|--------|---------------|
| Read own profile | `select` | Logged-in user | `id = auth.uid()` | Profile row | RLS denial |
| Update own profile | `update` | Logged-in user | `full_name`, etc. | Updated row | RLS denial |

---

## Businesses (`businesses` table)

| Operation | Method | Auth / Role | Input | Result | Common errors |
|-----------|--------|-------------|-------|--------|---------------|
| Browse businesses | `select` | Any (public read) | None | List of businesses | — |
| Read own business | `select` | Admin | `owner_id = profile.id` | Single business | Not found |
| Create business | `insert` | Admin | `name`, `business_type`, `description`, brand fields | New business | Duplicate owner, validation |
| Update business | `update` | Admin (owner) | Profile fields | Updated business | RLS denial |
| Delete business | `delete` | Admin (owner) | `id` | Business removed | FK cascade to services/requests |

---

## Services (`services` table)

| Operation | Method | Auth / Role | Input | Result | Common errors |
|-----------|--------|-------------|-------|--------|---------------|
| Browse services | `select` | Any (public read) | `business_id` | Service list | — |
| Create service | `insert` | Admin (owner) | `name`, `description`, `price_range`, `duration_minutes`, `recommended_interval_days`, `is_active` | New service | RLS denial |
| Update service | `update` | Admin (owner) | Service fields | Updated service | Invalid interval days |
| Delete service | `delete` | Admin (owner) | `id` | Service removed | RLS denial |

---

## Client booking requests (`client_requests` table)

| Operation | Method | Auth / Role | Input | Result | Common errors |
|-----------|--------|-------------|-------|--------|---------------|
| Submit booking request | `insert` | Client | `request_title`, `request_details`, `preferred_date`, `service_id`, `business_id` | New request (`pending`) | Missing required fields |
| List own requests | `select` | Client | `client_id = profile.id` | Request list with joins | RLS denial |
| Update own pending request | `update` | Client | Request fields | Updated request | Not pending |
| Cancel own request | `update` | Client | `status: canceled` | Canceled request | Not pending |
| Delete own request | `delete` | Client | `id` | Request removed | RLS denial |
| List business requests | `select` | Admin (owner) | `business_id` | Request list | No business profile |
| Update request status | `update` | Admin (owner) | `status` | Updated status | RLS denial |

**Status values:** `pending`, `confirmed`, `completed`, `canceled` (legacy: `reviewed`, `in_progress`).

---

## AI endpoint

**URL:** `POST /.netlify/functions/ai`

**Auth:** None at the HTTP layer (app UI restricts who can trigger calls). The Trussed API key is read from server environment variables only.

**Request body:**

```json
{
  "action": "businessDescription | serviceDescription | rebookingRecommendation | bookingRequestSummary",
  "payload": { }
}
```

**Success response:**

```json
{
  "success": true,
  "action": "actionName",
  "result": { },
  "fallbackUsed": false
}
```

**Error response:**

```json
{
  "success": false,
  "error": "User-friendly error message"
}
```

---

### `businessDescription`

**Who uses it:** Admin (business profile form)

**Example request:**

```json
{
  "action": "businessDescription",
  "payload": {
    "business_name": "Sunrise Salon",
    "business_type": "Salon",
    "services_summary": "Haircut, Color, Blowout",
    "tone": "professional and friendly"
  }
}
```

**Example response:**

```json
{
  "success": true,
  "action": "businessDescription",
  "result": {
    "description": "Sunrise Salon is a welcoming salon offering haircuts, color, and blowouts.",
    "tagline": "Style that shines",
    "welcome_message": "Welcome to Sunrise Salon! We look forward to seeing you."
  },
  "fallbackUsed": false
}
```

**Common errors:** Missing `business_name`/`business_type`, AI not configured, rate limit, invalid model.

---

### `serviceDescription`

**Who uses it:** Admin (service form)

**Example request:**

```json
{
  "action": "serviceDescription",
  "payload": {
    "service_name": "Gel Manicure",
    "business_type": "Salon",
    "price_range": "$35-$50",
    "duration_minutes": "45",
    "tone": "professional and friendly"
  }
}
```

**Example response:**

```json
{
  "success": true,
  "action": "serviceDescription",
  "result": {
    "description": "Our gel manicure includes shaping, cuticle care, and long-lasting polish.",
    "short_summary": "Gel manicure — 45 minutes, $35-$50."
  },
  "fallbackUsed": false
}
```

---

### `rebookingRecommendation`

**Who uses it:** Client (dashboard)

**Example request:**

```json
{
  "action": "rebookingRecommendation",
  "payload": {
    "service_name": "Gel Manicure",
    "business_name": "Sunrise Salon",
    "last_request_date": "2026-06-20",
    "current_date": "2026-07-05",
    "recommended_interval_days": 14,
    "request_status": "completed",
    "days_since_last_booking": 15,
    "booking_history": [
      {
        "service_name": "Gel Manicure",
        "business_name": "Sunrise Salon",
        "status": "completed",
        "last_request_date": "2026-06-20",
        "days_since": 15
      }
    ]
  }
}
```

**Example response:**

```json
{
  "success": true,
  "action": "rebookingRecommendation",
  "result": {
    "recommendation": "You may want to request Gel Manicure again soon.",
    "reason": "Your last request was about 15 days ago, and this service is commonly rebooked around every 14 days.",
    "suggested_request_details": "Hi, I would like to book another gel manicure. I am available this week."
  },
  "fallbackUsed": false
}
```

---

### `bookingRequestSummary`

**Who uses it:** Admin (per booking request card)

**Example request:**

```json
{
  "action": "bookingRequestSummary",
  "payload": {
    "request_title": "Gel manicure appointment",
    "request_details": "I would like a similar style to last time.",
    "preferred_date": "2026-07-12",
    "status": "pending",
    "service_name": "Gel Manicure",
    "business_name": "Sunrise Salon",
    "client_name": "Jane Doe",
    "created_at": "2026-07-01T14:30:00.000Z"
  }
}
```

**Example response:**

```json
{
  "success": true,
  "action": "bookingRequestSummary",
  "result": {
    "summary": "Jane Doe requested a gel manicure for July 12 with a similar style to her last visit.",
    "key_details": [
      "Service: Gel Manicure",
      "Preferred date: 2026-07-12",
      "Status: pending"
    ],
    "suggested_next_step": "Review availability and confirm or cancel the request."
  },
  "fallbackUsed": false
}
```

---

## Environment variables (server-side AI)

| Variable | Purpose |
|----------|---------|
| `TRUSSED_API_KEY` | FAU Trussed.ai API key (secret) |
| `TRUSSED_BASE_URL` | `https://fauengtrussed.fau.edu/provider/generic` |
| `LLM_MODEL` | Model id, e.g. `cogito:14b` |

Never expose `TRUSSED_API_KEY` in frontend code or `VITE_` variables.
