# ClientFlow BUILD_STEPS.md

## Build Step 1: Accept Assignment and Clone Repository

### Goal

Create the GitHub Classroom repository and clone it locally.

### Tasks

* Accept the GitHub Classroom assignment.
* Create or confirm GitHub account access.
* Set up SSH keys if needed.
* Clone the GitHub Classroom repository.
* Open the cloned repository in VS Code or Cursor.

### Verify Checkpoint

* The repository exists under the correct GitHub account.
* The repository is cloned locally.
* `git status` works inside the project folder.
* `git remote -v` shows the GitHub Classroom repository.

### Commit

No commit required unless changes were made.

---

## Build Step 2: Initialize React/Vite Project

### Goal

Create the React/Vite frontend inside the cloned repository.

### Tasks

* Run the Vite React setup command.
* Install dependencies.
* Run the app locally.
* Confirm the default Vite app loads in the browser.

### Verify Checkpoint

* `npm install` completes successfully.
* `npm run dev` starts the development server.
* The app loads locally in the browser.
* The project files are inside the GitHub Classroom repository.

### Commit

```bash
git add .
git commit -m "chore: initialize ClientFlow project"
git push
```

---

## Build Step 3: Add Planning Documents

### Goal

Create planning documentation before building features.

### Tasks

* Add `PLAN.md`.
* Add `BUILD_STEPS.md`.
* Document the project concept.
* Document the MVP scope.
* Add the data model and ERD.
* Add planned incremental build steps.

### Verify Checkpoint

* `PLAN.md` explains the concept, users, data model, ERD, CRUD mapping, and design decisions.
* `BUILD_STEPS.md` lists small steps with verify checkpoints.
* Both files are committed to the repository.

### Commit

```bash
git add .
git commit -m "docs: add project plan and build steps"
git push
```

---

## Build Step 4: Create GitHub Issues and Project Board

### Goal

Track project work using GitHub Issues and a project board.

### Tasks

* Create issues for setup, documentation, authentication, CRUD features, deployment, and final testing.
* Create a GitHub project board.
* Add columns for Backlog, To Do, In Progress, Verify, and Done.
* Move issues across the board as work progresses.
* Add optional enhancements to the backlog.

### Verify Checkpoint

* GitHub Issues exist for the main required features.
* A GitHub project board exists.
* Issues are organized on the board.
* Optional enhancements are listed in the backlog.

### Commit

No code commit required unless documentation was updated.

---

## Build Step 5: Configure Secrets Hygiene

### Goal

Set up environment variable files safely.

### Tasks

* Create `.env`.
* Create `.env.example`.
* Add Supabase environment variable names to `.env.example`.
* Add `.env`, `.env.local`, `.netlify`, `.vercel`, `dist`, and `node_modules` to `.gitignore`.
* Confirm real keys are not committed.

### Verify Checkpoint

* `.env` exists locally but is ignored by Git.
* `.env.example` is committed.
* `.gitignore` includes secret and build artifact files.
* No real API keys or Supabase keys appear in GitHub.

### Commit

```bash
git add .
git commit -m "chore: configure environment files"
git push
```

---

## Build Step 6: Set Up Supabase Project

### Goal

Create and connect the Supabase backend.

### Tasks

* Create a Supabase project.
* Copy the Supabase project URL and anon key into `.env`.
* Install Supabase client package.
* Create a Supabase client file in the React app.
* Test that the app imports the Supabase client without errors.

### Verify Checkpoint

* Supabase project exists.
* Environment variables load locally.
* Supabase client file exists.
* The app still runs with `npm run dev`.

### Commit

```bash
git add .
git commit -m "chore: configure Supabase client"
git push
```

---

## Build Step 7: Create Database Tables

### Goal

Create the database schema for ClientFlow.

### Tasks

* Create `profiles` table.
* Create `businesses` table.
* Create `services` table.
* Create `client_requests` table.
* Add relationships using foreign keys.
* Enable Row Level Security if using Supabase.
* Add basic security policies for authenticated users.

### Verify Checkpoint

* All tables exist in Supabase.
* Tables include the planned fields.
* Foreign key relationships are created.
* Database permissions protect user-owned data.

### Commit

```bash
git add .
git commit -m "docs: document database schema"
git push
```

---

## Build Step 8: Implement Authentication

### Goal

Allow users to register, log in, and log out.

### Tasks

* Create login page.
* Create signup page.
* Add account role selection for admin or client.
* Create a profile record after signup.
* Add logout functionality.
* Add authentication state management.

### Verify Checkpoint

* A new user can register.
* A user can select admin or client role.
* A user can log in.
* A user can log out.
* A profile record is created with the selected role.

### Commit

```bash
git add .
git commit -m "feat: add authentication and role-based signup"
git push
```

---

## Build Step 9: Add Protected Routes

### Goal

Prevent logged-out users from accessing protected app pages.

### Tasks

* Create protected route logic.
* Redirect logged-out users to login.
* Show admin dashboard to admin users.
* Show client dashboard to client users.
* Prompt anonymous users to log in before protected actions.

### Verify Checkpoint

* Logged-out users cannot access protected dashboards.
* Logged-in admins see the admin dashboard.
* Logged-in clients see the client dashboard.
* Protected actions are blocked for anonymous users.

### Commit

```bash
git add .
git commit -m "feat: add protected routes"
git push
```

---

## Build Step 10: Build Admin Business Profile CRUD

### Goal

Allow admins to create and manage their business profile.

### Tasks

* Create business profile form.
* Save business profile to Supabase.
* Display business profile on admin dashboard.
* Allow admins to edit business profile.
* Allow admins to delete business profile if needed.

### Verify Checkpoint

* Admin can create a business profile.
* Admin can view their business profile.
* Admin can update business details.
* Admin can delete their business profile if enabled.
* Clients cannot edit business profiles.

### Commit

```bash
git add .
git commit -m "feat: implement business profile CRUD"
git push
```

---

## Build Step 11: Build Service CRUD

### Goal

Allow admins to manage services for their business.

### Tasks

* Create service form.
* Save services connected to the admin business.
* Display services on admin dashboard.
* Allow admins to edit services.
* Allow admins to delete services.

### Verify Checkpoint

* Admin can create a service.
* Admin can view services connected to their business.
* Admin can edit a service.
* Admin can delete a service.
* Services are connected to the correct business.

### Commit

```bash
git add .
git commit -m "feat: implement service CRUD"
git push
```

---

## Build Step 12: Build Client Business Browsing

### Goal

Allow clients to browse businesses and view services.

### Tasks

* Create client dashboard.
* Display available businesses.
* Add business detail section or page.
* Show services for a selected business.

### Verify Checkpoint

* Client can view businesses.
* Client can view services for a selected business.
* Client cannot edit or delete business data.

### Commit

```bash
git add .
git commit -m "feat: display businesses and services to clients"
git push
```

---

## Build Step 13: Build Client Request CRUD

### Goal

Allow clients to submit and manage requests.

### Tasks

* Create client request form.
* Connect each request to a business.
* Connect each request to a selected service if provided.
* Display the client’s submitted requests.
* Allow clients to cancel or delete their own requests.

### Verify Checkpoint

* Client can submit a request.
* Client can view their own requests.
* Request is connected to the correct business.
* Request is connected to the logged-in client.
* Client cannot view or edit another client’s private request data.

### Commit

```bash
git add .
git commit -m "feat: implement client request CRUD"
git push
```

---

## Build Step 14: Allow Admins to Manage Request Status

### Goal

Allow business admins to view and update requests sent to their business.

### Tasks

* Display client requests on the admin dashboard.
* Add status dropdown or action buttons.
* Allow admin to update request status.
* Save status changes to Supabase.
* Display updated status to the client.

### Verify Checkpoint

* Admin can view requests for their business.
* Admin can update request status.
* Client can see the updated request status.
* Admin cannot manage requests for another business.

### Commit

```bash
git add .
git commit -m "feat: allow admins to update request status"
git push
```

---

## Build Step 15: Add Error Handling and Validation

### Goal

Make forms and database actions more reliable.

### Tasks

* Add required field validation.
* Add loading states.
* Add error messages.
* Add empty states for dashboards.
* Add success messages after actions.

### Verify Checkpoint

* Forms do not submit with missing required fields.
* Users see helpful error messages.
* Users see loading feedback during database actions.
* Empty dashboards display a friendly message.
* The app does not crash during failed database actions.

### Commit

```bash
git add .
git commit -m "fix: add validation and error handling"
git push
```

---

## Build Step 16: Finalize README

### Goal

Document the project clearly for submission.

### Tasks

* Add project overview.
* Add live demo section.
* Add features.
* Add tech stack.
* Add architecture overview.
* Add database schema.
* Add ERD.
* Add installation and setup instructions.
* Add usage guide.
* Add deployment notes.
* Add demo video link when available.
* Add future enhancements.

### Verify Checkpoint

* README explains what the app does.
* README explains how to run the app locally.
* README includes environment variable instructions.
* README includes usage steps for admin and client users.
* README includes deployment notes and live URL.

### Commit

```bash
git add .
git commit -m "docs: complete README documentation"
git push
```

---

## Build Step 17: Configure CI/CD Deployment

### Goal

Deploy the app and configure automatic deployments from the main branch.

### Tasks

* Connect the GitHub repository to Netlify or Vercel.
* Set the build command to `npm run build`.
* Set the publish directory to `dist`.
* Add environment variables in deployment settings.
* Confirm deployment on push to the main branch.

### Verify Checkpoint

* The deployed site loads successfully.
* A new push to the main branch triggers a deployment.
* Environment variables are configured in the deployment platform.
* Real secrets are not committed to GitHub.

### Commit

```bash
git add .
git commit -m "chore: configure deployment"
git push
```

---

## Build Step 18: Smoke Test and Demo Video

### Goal

Confirm the final app works locally and on the deployed URL.

### Tasks

* Test admin signup.
* Test admin login.
* Test business profile CRUD.
* Test service CRUD.
* Test client signup.
* Test client business browsing.
* Test client request creation.
* Test admin request status update.
* Test protected routes.
* Test the deployed live URL.
* Record a 2–3 minute demo video.

### Verify Checkpoint

* Admin flow works from signup to request management.
* Client flow works from signup to request tracking.
* Logged-out users are blocked from protected actions.
* App works locally and on the deployed URL.
* Demo video shows registration, login, and CRUD operations.


### Commit

```bash
git add .
git commit -m "docs: finalize demo and submission notes"
git push
```
