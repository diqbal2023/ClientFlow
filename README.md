# ClientFlow

A customizable client portal for small businesses, built with React, Vite, and Supabase.

---

## 1. Project Overview

**ClientFlow** is a full-stack web application that helps small businesses offer a branded online portal where clients can browse services and submit booking requests.

### Problem it solves

Many small businesses need a simple way to present their brand online, list what they offer, and collect client inquiries without building a custom backend from scratch. ClientFlow provides a lightweight portal where business owners manage their profile and requests, and clients can browse, book, and track those requests in one place.

### Roles

| Role | Description |
|------|-------------|
| **Admin** | Business owner who creates a branded business profile, manages services, and reviews or updates client booking requests |
| **Client** | Customer who registers, logs in, browses businesses, submits booking requests, and tracks request status |

### Business personalization

Admins can customize how their business appears to clients using:

- **Brand colors** — up to three colors shown as a gradient on business cards and detail pages
- **Logo URL** — link to a logo image
- **Cover image URL** — link to a header/cover image
- Business name, type, and description

---

## 2. Features

- **User registration** — Sign up with email and password
- **Login / logout** — Session-based authentication via Supabase Auth
- **Role-based signup** — Choose `admin` or `client` at registration
- **Protected routes** — Authenticated pages with role-based access for admin and client dashboards
- **Admin business profile CRUD** — Create, view, edit, and delete a branded business profile
- **Admin service CRUD** — Add, edit, activate/deactivate, and remove services
- **Client business browsing** — Browse businesses and open business detail pages
- **Client booking request CRUD** — Submit requests, view history, edit details, cancel, and delete requests
- **Admin booking status updates** — Review incoming requests and update status (for example pending, confirmed, completed, canceled)
- **Validation, loading states, error messages, and empty states** — Form validation, friendly error handling, loading indicators, and empty-state messaging across the app

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | [React](https://react.dev/) |
| Build tool | [Vite](https://vite.dev/) |
| Routing | [React Router](https://reactrouter.com/) |
| Authentication | [Supabase Auth](https://supabase.com/docs/guides/auth) |
| Database | [Supabase PostgreSQL](https://supabase.com/docs/guides/database) |
| Language | JavaScript |
| Styling | CSS (`src/App.css`, `src/index.css`) |
| Deployment | [Netlify](https://www.netlify.com/) |

---

## 4. Architecture Overview

ClientFlow is a React single-page application that talks directly to Supabase for authentication and data storage. There is no custom backend server.

**React / Vite frontend** — Handles pages, forms, and UI state. Key areas include `src/pages/` for views, `src/components/` for reusable UI, and `src/context/AuthContext.jsx` for session and profile state. `src/App.jsx` defines routes and wires protected pages.

**Supabase Auth** — Handles registration, login, logout, and session persistence. Each authenticated user is linked to a row in the `profiles` table for role information (`admin` or `client`).

**Supabase PostgreSQL** — Stores application data in `profiles`, `businesses`, `services`, and `client_requests`. Row Level Security (RLS) policies control who can read and write each table. The executable schema lives in [`docs/database/supabase_schema.sql`](docs/database/supabase_schema.sql).

**Protected routes and role-based dashboards** — `ProtectedRoute` requires a signed-in user. Admin routes (`/admin`) require `profile.role === 'admin'`. Client routes (`/client`, `/client/business/:businessId`) require `profile.role === 'client'`. The `/dashboard` route redirects users to the correct dashboard based on role. This keeps admin management workflows separate from the client booking experience.

---

## 5. Database Design

For full schema details, see [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) and [`docs/database/supabase_schema.sql`](docs/database/supabase_schema.sql).

### `profiles`

Stores app-specific user data linked to Supabase Auth (one row per user).

**Important fields:** `id`, `full_name`, `role` (`admin` or `client`), `created_at`, `updated_at`

### `businesses`

Stores each admin’s branded business profile. One admin profile may own one business in the MVP.

**Important fields:** `owner_id`, `name`, `business_type`, `description`, `logo_url`, `brand_color`, `brand_color_2`, `brand_color_3`, `cover_image_url`

### `services`

Stores services offered by a business.

**Important fields:** `business_id`, `name`, `description`, `price`, `price_range`, `duration_minutes`, `is_active`

### `client_requests`

Stores booking requests submitted by clients.

**Important fields:** `client_id`, `business_id`, `service_id` (optional), `status`, `request_title`, `request_details`, `preferred_date`, `client_message`

---

## 6. ERD

```
Profile
 ├── may own one Business
 └── may submit many ClientRequests

Business
 ├── belongs to one Profile as owner
 ├── has many Services
 └── has many ClientRequests

Service
 ├── belongs to one Business
 └── may be selected in many ClientRequests

ClientRequest
 ├── belongs to one client Profile
 ├── belongs to one Business
 └── optionally belongs to one Service
```

---

## 7. Key Design Decisions

- **Role-based design** — Admin and client workflows are separated so business owners manage their portal while clients browse and submit requests.
- **Image URLs instead of file uploads for MVP** — Logo and cover image fields store URLs rather than using upload storage, keeping the first version simple.
- **Booking request/confirmation workflow** — Bookings are submitted as requests with statuses updated by the admin, rather than instant confirmed appointments.
- **Supabase for auth and database** — Supabase provides authentication, PostgreSQL, and RLS without a custom backend server.
- **Environment variables for secrets hygiene** — Supabase keys are loaded from `.env` locally and from Netlify environment settings in production. They are not committed to GitHub (see `.env.example` and `.gitignore`).

---

## 8. Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (included with Node.js)
- [Git](https://git-scm.com/)
- A [GitHub](https://github.com/) account
- A [Supabase](https://supabase.com/) project

### Clone the repository

```bash
git clone <your-repository-url>
cd week2-diqbal2023
```

### Install dependencies

```bash
npm install
```

### Environment variables

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Add your Supabase values to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Find these in the Supabase dashboard under **Project Settings → API**.

### Database setup

Run the SQL in [`docs/database/supabase_schema.sql`](docs/database/supabase_schema.sql) in your Supabase **SQL Editor** to create tables and RLS policies.

### Run locally

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

---

## 9. Usage Guide

### Admin flow

1. Register as **admin**
2. Log in
3. Create a business profile (name, type, description, brand colors, logo URL, cover image URL)
4. Add services
5. View booking requests on the admin dashboard
6. Update booking request status (for example pending, confirmed, completed, canceled)

### Client flow

1. Register as **client**
2. Log in
3. Browse businesses on the client dashboard
4. View services on a business detail page
5. Submit a booking request
6. View request history and track status

---

## 10. Deployment Notes

| Item | Value |
|------|-------|
| **Deployment platform** | Netlify |
| **Netlify site name** | `lively-salmiakki-70faaf` |
| **Live URL** | [PASTE LIVE URL HERE] |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

Deployment settings are also defined in [`netlify.toml`](netlify.toml), including an SPA redirect so React Router routes work on refresh.

### Environment variables

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured in **Netlify site environment variables**, not committed to GitHub. Vite embeds `VITE_*` values at build time, so a new deploy is required after changing them.

For manual deploys without Git-linked builds, run `npm run build` locally (with `.env` present) and upload the `dist` folder or use:

```bash
netlify deploy --prod --dir=dist
```

### GitHub Classroom and CI/CD

The intended setup is **continuous deployment from the `main` branch**: pushes to `main` trigger a Netlify build using `npm run build` and publish the `dist` folder.

If CI/CD could not be fully linked because the **GitHub Classroom repository is private or classroom-owned**, the site may be deployed manually (folder upload or Netlify CLI) instead. In that case, link the repository in Netlify when access is available, confirm build settings match the table above, and add the required environment variables before enabling deploy-on-push from `main`.

---

## 11. AI Tool Usage

Cursor and VS Code AI tools were used to support project setup, documentation, debugging, and code organization. All AI-assisted output was manually reviewed and tested before commits.

---

## 12. Demo Video

**Demo Video:** Coming soon / [PASTE DEMO VIDEO LINK HERE]

---

## 13. Future Enhancements

- Google OAuth
- Image upload storage
- Appointment calendar
- Email notifications
- Business search and filters
- Multi-admin business teams

---

## Related Documentation

- [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) — Detailed table definitions and relationships
- [`docs/database/supabase_schema.sql`](docs/database/supabase_schema.sql) — Executable SQL schema and RLS policies
- [`netlify.toml`](netlify.toml) — Netlify build, publish, and SPA redirect settings
- [`.env.example`](.env.example) — Required environment variable template
