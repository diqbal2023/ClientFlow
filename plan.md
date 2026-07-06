# ClientFlow PLAN.md

## Project Concept

ClientFlow is a full-stack client portal builder for small businesses. Business admins can create a branded business profile, customize basic visual details, add services, and manage incoming client requests. Clients can create an account, browse multiple businesses, view services, submit requests, and track the status of their requests.

The project is designed to demonstrate database integration, role-based authentication, protected routes, CRUD operations, frontend-backend communication, and deployment through a professional business-style application.

## Problem It Solves

Many small businesses need a simple way to present their services and manage client inquiries without building a full custom website or using multiple separate tools. ClientFlow gives business owners a lightweight portal where they can manage their business information, services, and client requests in one place.

For example, a nail salon could create a business profile, add brand colors and images, list services such as gel manicures or acrylic sets, and manage incoming client requests. A client could browse that business, select a service, submit a request, and check the request status later.

## Target Users

### Business Admins

Business admins are small business owners or staff members who manage a company profile, list services, and respond to incoming client requests.

### Clients

Clients are users who browse businesses, view services, submit requests, and track request status updates.

## MVP Scope

The MVP focuses on the required full-stack features for Week 2:

* User registration
* User login
* User logout
* Role selection during signup
* Protected admin and client routes
* Business profile creation, viewing, editing, and deletion
* Service creation, viewing, editing, and deletion
* Client request creation and viewing
* Admin request status updates
* User-specific data display
* Deployment with environment variables configured securely

## Out of Scope for Week 2

The following features may be added later but are not required for the MVP:

* Google OAuth
* Real image upload storage
* Appointment calendar scheduling
* Email or SMS notifications
* Payment processing
* Admin analytics dashboard
* Multi-admin business teams
* Custom domain setup
* Advanced business search and filtering

## Tech Stack

* Frontend: React + Vite
* Styling: CSS or Tailwind CSS
* Backend/BaaS: Supabase
* Database: Supabase PostgreSQL
* Authentication: Supabase Auth
* Deployment: Netlify or Vercel
* Version Control: GitHub Classroom repository
* AI Tools: Cursor and VS Code AI tools for coding support, debugging, and documentation assistance

## Architecture Overview

ClientFlow uses a React/Vite frontend that communicates with Supabase for authentication and database operations. Supabase Auth manages user registration, login, logout, and session state. Supabase PostgreSQL stores profile data, business profiles, services, and client requests.

The frontend displays different pages based on authentication state and user role. Business admins see an admin dashboard where they can manage their business profile, services, and client requests. Clients see a client dashboard where they can browse businesses, view services, and submit requests.

## Data Model

### profiles

Stores user profile information and account role.

Fields:

* id
* user_id
* full_name
* role
* created_at

### businesses

Stores business profile and branding information.

Fields:

* id
* owner_id
* business_name
* business_type
* description
* brand_color
* logo_url
* cover_image_url
* created_at
* updated_at

### services

Stores services connected to a business.

Fields:

* id
* business_id
* service_name
* description
* price_range
* duration_minutes
* is_active
* created_at
* updated_at

### client_requests

Stores requests submitted by clients to a business.

Fields:

* id
* business_id
* client_id
* service_id
* request_title
* request_details
* preferred_date
* status
* created_at
* updated_at

## ERD

```text
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

## Relationship Explanation

A profile represents a registered user. Each profile has a role of either admin or client.

An admin profile may own one business. A business belongs to one admin profile and can have many services. A business can also receive many client requests.

A service belongs to one business. A client request belongs to one client profile and one business. A request may also be connected to a specific service.

## CRUD Mapping

### Create

* Admin creates a business profile.
* Admin creates services.
* Client submits a request.

### Read

* Admin views their business profile, services, and client requests.
* Client views businesses and services.
* Client views their own submitted requests.

### Update

* Admin edits business profile.
* Admin edits services.
* Admin updates request status.
* Client may cancel or update their own request if allowed.

### Delete

* Admin deletes services.
* Admin may delete their business profile.
* Client may delete or cancel their own request.

## Authentication and Authorization

Users must register and log in before accessing protected features. During signup, users choose either an admin or client role.

Admins can manage their own business profile, services, and requests for their business. Clients can browse businesses and submit requests, but they cannot edit business-owned data.

Write actions require authentication. Anonymous users may only see the landing page and login/signup pages. If an anonymous user attempts to perform a protected action, the app should prompt them to log in.

## Auth Protection Rules

### Logged-Out Users

Logged-out users can:

* View the landing page
* Access login and signup pages

Logged-out users cannot:

* Create business profiles
* Create services
* Submit client requests
* Edit or delete data

### Admin Users

Admin users can:

* Create and edit their business profile
* Add, edit, and delete services
* View requests submitted to their business
* Update request statuses

### Client Users

Client users can:

* Browse businesses
* View services
* Submit requests
* View their own requests
* Cancel or delete their own requests if allowed

## Design Decisions

ClientFlow uses role-based access to separate admin and client experiences. This makes the app more realistic and closer to a professional business workflow.

The database is split into profiles, businesses, services, and client requests so each part of the application has a clear purpose. This keeps the data model organized and easier to explain.

Image fields use image URLs for the MVP to keep the project manageable. Full image upload support can be added later as an enhancement.

Supabase is used because it provides authentication, database storage, and security rules in one platform, which allows the project to focus on building a complete full-stack workflow without requiring a custom backend.
