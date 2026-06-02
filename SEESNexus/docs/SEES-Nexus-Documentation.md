# Sees Nexus Documentation Suite

> **Implementation note:** This documentation reflects the repository as currently built: a **FastAPI/Python backend** with a **React/Vite/Tailwind/Framer Motion frontend**. The user prompt referenced Spring Boot and related Java concepts; those are not the technologies used in this codebase, so this document describes the actual implementation while preserving the same architectural intent.

## Section 1: Non-Technical Documentation

### Executive Summary & Vision

**Sees Nexus** is the digital operating system for the Society of Electrical, Electronics and Computer Engineering Students (SEES) at the University of Lagos. It centralizes the community’s projects, hardware inventory, events, and member workflows into one modern platform.

The vision is simple: make SEES feel like a high-performance engineering organization rather than a collection of disconnected forms, chat threads, spreadsheets, and manual records. The platform turns student innovation into a visible, searchable, and professional experience that supports the next semester’s growth with a clear message: **New Semester, New Heights**.

For SEES executives and stakeholders, Sees Nexus is not just a website. It is an institutional layer that improves continuity, visibility, accountability, and reputation.

### Core Pillars & Problems Solved

| Pillar | Problem Today | Sees Nexus Solution | Outcome |
|---|---|---|---|
| Innovation Gallery | Project links are scattered across WhatsApp, drive folders, and personal pages. | A cinematic, high-visibility showcase for student work with filters, visual cards, and project detail views. | Projects become discoverable, memorable, and shareable. |
| Hardware Lab | Equipment lending is often tracked with manual paper logs or informal spreadsheets. | A structured hardware inventory and lending workflow with item status, loans, approvals, and returns. | Less loss, fewer disputes, faster checkout, and better accountability. |
| Community & Events | Registrations for hackathons, congresses, and community events are fragmented. | A unified events module for discovery, registration, attendance workflows, and participant tracking. | Higher participation and a simpler logistics process. |

#### Innovation Gallery

The Innovation Gallery replaces scattered project references with a premium showcase that makes student engineering feel visible and credible. Instead of treating projects as hidden artifacts, it presents them as institutional proof of competence.

Examples of the type of work this unlocks include projects such as **Verifact**, **BAER system**, and **FloodGuard**. A recruiter, alumni partner, or sponsor can immediately understand what the organization builds and why it matters.

#### Hardware Lab

The Hardware Lab digitizes the equipment lending process for items such as multimeters, oscilloscopes, breadboards, cables, and development kits. This removes the dependence on handwritten logs and informal reminders.

The practical benefit is straightforward: the organization can see what exists, who borrowed it, when it is due, and whether it was returned. This reduces equipment loss and administrative friction.

#### Community & Events

The Community & Events module creates a single place for event discovery and registration. Whether the activity is a hackathon, conference, workshop, orientation, or external technical event such as the **IEEE IES SYP Congress**, the workflow becomes easier to manage.

That means less manual coordination for organizers and a more professional sign-up experience for members.

### Impact Metrics

Sees Nexus improves the organization’s operational credibility and external visibility.

| Metric | What Improves | Why It Matters |
|---|---|---|
| Project discoverability | Student projects are easier to view, filter, and share. | Recruiters and sponsors can assess quality faster. |
| Operational efficiency | Hardware and event workflows become trackable. | Administrative overhead drops significantly. |
| Brand perception | The organization presents as modern and well-run. | Strengthens trust with partners and alumni. |
| Recruiter readiness | Student work is packaged in a professional format. | Helps students stand out to employers such as MTN Nigeria, Enyata, and similar technology partners. |

In practical terms, the platform increases the probability that good work gets noticed. It gives SEES a stronger public surface for partnerships, sponsorships, recruitment visibility, and internal continuity.

## Section 2: High-Level Technical Architecture Documentation

### System Architecture Overview

Sees Nexus follows a **stateless client-server architecture**.

- The **frontend** is a browser-based single-page application built with React and Vite.
- The **backend** is a FastAPI service that exposes versioned REST endpoints under `/api/v1`.
- The **database** is PostgreSQL.
- Authentication uses short-lived access tokens and refresh flows built around JWT.
- Static and dynamic concerns are separated: the client renders the UI, while the API owns business rules, authorization, and persistence.

This separation is intentional. It allows the frontend to evolve independently from the backend, and it makes deployment on platforms such as Vercel and Render straightforward.

### Tech Stack Matrix

| Layer | Technology | Purpose | Why It Was Chosen |
|---|---|---|---|
| Frontend runtime | React | UI composition and stateful rendering | Component-driven design scales well for a multi-module product. |
| Frontend build tool | Vite | Fast development and optimized production builds | Excellent build speed and modern bundling. |
| Styling | Tailwind CSS | Utility-first styling system | Enables rapid design iteration and consistent visual language. |
| Motion | Framer Motion | Animations and transitions | Supports polished interaction design without fragile custom animation code. |
| 3D rendering | React Three Fiber / Drei / Three.js | WebGL scene composition | Powers the cinematic gallery and hero experiences. |
| API client | Axios | HTTP transport and interceptors | Simplifies auth header injection and response handling. |
| Backend runtime | FastAPI | REST API service | High performance, clean typing model, strong OpenAPI support. |
| ORM / persistence | SQLAlchemy Async | Relational data access | Suits structured workflows like users, projects, events, and loans. |
| Database | PostgreSQL | Primary relational datastore | Reliable consistency and strong support for production workloads. |
| Authentication | JWT | Stateless auth | Works well for browser clients and horizontally scalable services. |
| File and media support | Cloudinary | Asset storage and delivery | Good fit for project media and uploaded content. |
| Email delivery | Brevo SDK | Transactional email | Suitable for verification and notification workflows. |

> **Note:** Redis is not currently part of the implemented backend in this repository. If future rate limiting, caching, or distributed queues are introduced, Redis would be the natural choice for those concerns.

### Security Architecture

The platform uses **stateless JWT authentication**.

#### Request Lifecycle

1. The client submits credentials to `/api/v1/auth/login`.
2. The backend validates the user and returns an access token and refresh token.
3. The frontend stores the tokens locally and attaches the access token to subsequent requests.
4. The backend checks the `Authorization: Bearer <token>` header for protected endpoints.
5. Custom authorization logic determines whether the current user may access the requested resource.

#### Token Flow

| Step | Client Action | Backend Action |
|---|---|---|
| Login | Sends email and password to `/api/v1/auth/login` | Verifies credentials and returns JWTs | 
| Authenticated request | Reads access token from storage and injects it into request headers | Parses and validates token, then resolves the current user |
| Role-protected request | Calls protected routes like `/api/v1/admin/**` | Enforces role-based checks such as ADMIN, CONTRIBUTOR, or STUDENT |
| Token expiration | Uses refresh token flow if access token expires | Reissues access token after validating refresh token |

#### Role Model

| Role | Primary Access Pattern |
|---|---|
| ADMIN | Full administrative access, including system management and sensitive CRUD operations. |
| CONTRIBUTOR | Can manage or submit projects and other community content depending on the endpoint rules. |
| STUDENT | Standard member experience: profile, projects, events, and permitted hardware workflows. |

#### Security Properties

- **Statelessness:** No server-side session storage is required for each browser user.
- **Least privilege:** Sensitive routes are gated by explicit authorization rules.
- **CORS enforcement:** The API only accepts browser calls from configured frontends.
- **Token isolation:** Access tokens are used for routine requests; refresh tokens are only used to mint new access tokens.

## Section 3: Frontend Developer Documentation

### Design System & Branding

The frontend design language is built around SEES identity and a futuristic engineering aesthetic.

| Token | Value | Usage |
|---|---|---|
| Base Dark | `#000F0D` | Primary background and system depth color |
| Sees-Mint | `#A7FFEB` | Core accent, glows, focus states, highlights |
| Mustard Yellow | `#E4A11B` | Secondary accent, alerts, emphasis, contrast |

The visual system combines:

- **Glassmorphism 2.0** for layered cards, translucent surfaces, and modern depth.
- **Framer Motion micro-interactions** for entrances, hover states, modal transitions, and state changes.
- **3D composition** for key moments such as the landing page hero and the project showcase.

#### Design Rules for New UI Work

- Preserve the dark, technical, cinematic brand tone.
- Use glass surfaces only where they improve hierarchy, not everywhere.
- Keep motion purposeful. Animations should reinforce spatial understanding or interaction feedback.
- Prefer readable contrast over decorative complexity.

### State & Authentication Handling

The frontend uses a shared Axios client to centralize API communication.

#### Axios Interceptor Pattern

| Concern | Implementation Guidance |
|---|---|
| Base URL | Resolve the API host from `VITE_API_URL` in production, with a local development fallback. |
| Authorization header | Inject `Authorization: Bearer <token>` for every outbound request when a token exists. |
| Refresh handling | On `401`, attempt refresh once, then replay queued requests with the new access token. |
| Recovery behavior | If refresh fails, clear local auth state and redirect to login. |

The production API should point at the Render backend, while local development should continue to use the local backend service.

A practical environment setup looks like this:

| Environment | API Host |
|---|---|
| Local dev | `http://localhost:8000` |
| Production | `https://seesnexus.onrender.com` |

### UI Layout Architecture

#### 1. Netflix-Style Horizontal Project Rail

The project experience is built to feel like a premium content browser.

- Project cards are arranged as a horizontally navigable rail.
- Hover interactions scale cards slightly and elevate them in the stack.
- Infinite scroll or lazy loading can be used to keep the rail responsive.
- Project detail views should open in overlays or modals to preserve the browsing context.

This pattern is ideal for showing off student work because it gives each project equal visual weight while still allowing fast scanning.

#### 2. High-Precision Hardware Canvas

The hardware experience should behave more like an engineering control surface than a standard list.

- Use a structured grid or canvas-style layout for hardware inventory.
- Show current availability, loan status, and item metadata prominently.
- Add a contextual inspector panel that slides in from the side when a user selects an item.
- Keep key actions such as borrow, return, or inspect close to the selected hardware object.

This makes the hardware module feel operational rather than administrative.

#### 3. Role-Based View Rendering

Render-only gating must be handled on the frontend for usability, but enforced on the backend for security.

| UI Behavior | Client Responsibility | Backend Responsibility |
|---|---|---|
| Hide admin controls | Decode JWT claims and suppress admin-only UI elements | Reject unauthorized access on admin routes |
| Show contributor actions | Render only when the role permits content management | Validate permissions on write operations |
| Student view | Show member-facing modules only | Limit access to protected endpoints based on roles |

The frontend should never assume that hiding a button is a security boundary. It is only a usability layer.

## Section 4: Backend Developer Documentation

### Project Layout & Controllers

The backend is organized as a modular FastAPI service.

| Area | Path | Responsibility |
|---|---|---|
| App entry point | `backend/app/main.py` | FastAPI app setup, middleware, routers, and exception handling |
| Configuration | `backend/app/config.py` | Environment-driven settings and CORS origin management |
| Database | `backend/app/database.py` | Async SQLAlchemy engine and session creation |
| Models | `backend/app/models/` | ORM entities and enumerations |
| Schemas | `backend/app/schemas/` | Pydantic request/response contracts |
| Routers | `backend/app/routers/` | REST endpoint groups by domain |
| Middleware | `backend/app/middleware/` | Authentication and authorization helpers |
| Utilities | `backend/app/utils/` | Hashing, JWT, email, and cloud helpers |

#### Main Endpoint Groups

| Router | Prefix | Purpose |
|---|---|---|
| `auth` | `/api/v1/auth` | Login, registration, token refresh, profile retrieval |
| `projects` | `/api/v1/projects` | Project listing, creation, update, deletion |
| `hardware` | `/api/v1/hardware` | Equipment inventory, loans, returns, admin operations |
| `events` | `/api/v1/events` | Event discovery, registration, participant management |
| `articles` | `/api/v1/articles` | Editorial or news content |
| `upload` | `/api/v1/upload` | Media and asset upload support |
| `notify` | `/api/v1/notify` | Verification-code email workflow |
| `admin` | `/api/v1/admin` | Higher-privilege administration workflows |

### Database Schema & Entity Relations

The data model centers around a small number of core business objects.

| Entity | Role in the System | Key Relationships |
|---|---|---|
| Users | Identity, authentication, and role control | Own projects, borrow hardware, register for events |
| Projects | Student work showcase | Belong to a creator and may include collaborators |
| Hardware items | Inventory and lending | Can have many loan records over time |
| Event registrations | Attendance and participation tracking | Join users to events with status metadata |
| Loans | Equipment checkout history | Link users to hardware items and record borrow/return status |

#### Relationship Guidance

- A **User** can create multiple **Projects**.
- A **User** can borrow multiple **Hardware** items over time.
- A **Hardware** item can appear in many **Loans**.
- A **User** can register for many **Events** through registration records.
- Cascading deletes should be used carefully; preserve historical loan and registration data unless there is a strong administrative reason to remove it.

### Controller Design Notes

#### Admin Operations

Administrative endpoints should remain isolated behind explicit role checks.

- Prefer class- or router-level authorization for perimeter control.
- Keep sensitive operations such as hardware CRUD and role updates out of general-purpose controllers.
- Return consistent response envelopes for both success and failure states.

#### Project Operations

Project endpoints should be optimized for browsing and authoring.

- Support pagination for large project collections.
- Parse and normalize technology stack fields consistently.
- Use the authenticated user context to determine ownership and edit permissions.

#### Events and Articles

Events and articles should support both public discovery and controlled publishing.

- Public listing endpoints should be optimized for filtering and paging.
- Management actions should require appropriate privileges.
- Webhook or initializer endpoints should remain idempotent where possible.

### Pre-Deployment Checklists

Before moving from local development to production deployment, verify the following.

#### Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Production PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `ALGORITHM` | JWT algorithm, typically `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime |
| `FRONTEND_URL` | Production browser origin for CORS |
| `CORS_ORIGINS` | Optional comma-separated explicit allowlist |
| `BREVO_API_KEY` | Transactional email delivery |
| `CLOUDINARY_*` | Asset upload and media handling |

#### Deployment Readiness

- Confirm the production backend can reach the managed PostgreSQL host.
- Confirm CORS allows the deployed frontend domain.
- Verify JWT secrets are unique and not reused from development.
- Ensure the app is started with the correct production server command.
- Confirm any file uploads or email providers have production credentials configured.

#### Connection Pooling and Reliability

- Use async database sessions appropriately under concurrent load.
- Tune pool size and timeout values if traffic grows.
- Keep requests stateless so instances can scale horizontally.
- Validate that exception handlers still emit CORS headers even when responses fail.

### Production Deployment Notes

For production on platforms such as Render:

- Set `DATABASE_URL` to the managed PostgreSQL instance.
- Set `FRONTEND_URL` to `https://sees-nexus.vercel.app`.
- Redeploy after any environment change.
- Verify that `/api/v1/notify/send-code` responds with the expected CORS headers when called from the deployed frontend origin.

## Closing Note

Sees Nexus is designed to do more than host content. It creates a structured digital backbone for SEES UNILAG: a place where projects are showcased, hardware is tracked, events are organized, and the student community becomes visible as a serious engineering organization.
