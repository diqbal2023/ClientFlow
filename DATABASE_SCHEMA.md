# ClientFlow Database Schema

This document describes the MVP database schema for **ClientFlow**, a client portal builder for small businesses.

Supabase Auth manages user accounts in `auth.users`. The `profiles` table stores app-specific user data and roles.

---

## Entity Relationship Diagram (Text)

```
Profile may own one Business.
Profile may submit many ClientRequests.

Business belongs to one Profile as owner.
Business has many Services.
Business has many ClientRequests.

Service belongs to one Business.

ClientRequest belongs to one Profile as client.
ClientRequest belongs to one Business.
ClientRequest optionally belongs to one Service.
```

---

## Tables Overview

| Table            | Purpose |
|------------------|---------|
| `profiles`       | App user profile linked to Supabase Auth, with role (`admin` or `client`) |
| `businesses`     | Branded business profile owned by an admin user |
| `services`       | Services offered by a business |
| `client_requests`| Requests submitted by clients to a business (optionally for a specific service) |

---

## `profiles`

Stores one row per authenticated user.

| Column       | Type        | Constraints | Description |
|--------------|-------------|-------------|-------------|
| `id`         | `uuid`      | **PK**, FK → `auth.users(id)` | Same ID as the Supabase Auth user |
| `full_name`  | `text`      | for `full_name` | User's display name |
| `role`       | `text`      | NOT NULL, default `'client'`, CHECK | User role: `admin` or `client` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | When the profile was created |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | When the profile was last updated |

**Primary key:** `id`

**Foreign keys:**
- `id` → `auth.users(id)` ON DELETE CASCADE

**Relationships:**
- One profile may own **one** business (as admin owner)
- One profile may submit **many** client requests (as client)

**Allowed `role` values:**
- `admin` — business owner who manages profile, services, and requests
- `client` — end user who browses businesses and submits requests

---

## `businesses`

Stores branded business information for admin users.

| Column        | Type        | Constraints | Description |
|---------------|-------------|-------------|-------------|
| `id`          | `uuid`      | **PK**, default `gen_random_uuid()` | Unique business ID |
| `owner_id`    | `uuid`      | NOT NULL, FK → `profiles(id)`, UNIQUE | Admin profile that owns this business |
| `name`        | `text`      | NOT NULL | Business name |
| `description` | `text`      | | Short business description |
| `logo_url`    | `text`      | | Optional logo image URL |
| `brand_color` | `text`      | | Optional brand color (for example `#2563eb`) |
| `created_at`  | `timestamptz` | NOT NULL, default `now()` | When the business was created |
| `updated_at`  | `timestamptz` | NOT NULL, default `now()` | When the business was last updated |

**Primary key:** `id`

**Foreign keys:**
- `owner_id` → `profiles(id)` ON DELETE CASCADE

**Relationships:**
- Belongs to **one** profile (owner)
- Has **many** services
- Has **many** client requests

**Notes:**
- `owner_id` is unique so each admin profile can own at most one business in the MVP.

---

## `services`

Services that a business offers to clients.

| Column        | Type        | Constraints | Description |
|---------------|-------------|-------------|-------------|
| `id`          | `uuid`      | **PK**, default `gen_random_uuid()` | Unique service ID |
| `business_id` | `uuid`      | NOT NULL, FK → `businesses(id)` | Business that offers this service |
| `name`        | `text`      | NOT NULL | Service name |
| `description` | `text`      | | Service description |
| `price`       | `numeric(10,2)` | | Optional price |
| `created_at`  | `timestamptz` | NOT NULL, default `now()` | When the service was created |
| `updated_at`  | `timestamptz` | NOT NULL, default `now()` | When the service was last updated |

**Primary key:** `id`

**Foreign keys:**
- `business_id` → `businesses(id)` ON DELETE CASCADE

**Relationships:**
- Belongs to **one** business
- May be linked from **many** client requests (optional)

---

## `client_requests`

Requests submitted by clients to a business.

| Column           | Type        | Constraints | Description |
|--------------------|-------------|-------------|-------------|
| `id`               | `uuid`      | **PK**, default `gen_random_uuid()` | Unique request ID |
| `client_id`        | `uuid`      | NOT NULL, FK → `profiles(id)` | Client who submitted the request |
| `business_id`      | `uuid`      | NOT NULL, FK → `businesses(id)` | Business receiving the request |
| `service_id`       | `uuid`      | FK → `services(id)`, nullable | Optional related service |
| `status`           | `text`      | NOT NULL, default `'pending'`, CHECK | Current request status |
| `client_message`   | `text`      | NOT NULL | Message or details from the client |
| `created_at`       | `timestamptz` | NOT NULL, default `now()` | When the request was created |
| `updated_at`       | `timestamptz` | NOT NULL, default `now()` | When the request was last updated |

**Primary key:** `id`

**Foreign keys:**
- `client_id` → `profiles(id)` ON DELETE CASCADE
- `business_id` → `businesses(id)` ON DELETE CASCADE
- `service_id` → `services(id)` ON DELETE SET NULL

**Relationships:**
- Belongs to **one** profile (client)
- Belongs to **one** business
- Optionally belongs to **one** service

**Allowed `status` values:**
- `pending` — newly submitted
- `reviewed` — seen by the business
- `in_progress` — being worked on
- `completed` — finished
- `canceled` — closed without completion

---

## Relationship Summary

```
auth.users (Supabase Auth)
    └── profiles (1:1)
            ├── businesses (0..1 as owner)
            │       ├── services (many)
            │       └── client_requests (many)
            └── client_requests (many as client)

services ──(optional)── client_requests
```

---

## SQL Source File

The executable schema lives at:

`docs/database/supabase_schema.sql`

Run that file in the Supabase SQL Editor to create tables and enable Row Level Security (RLS) with starter policies.
