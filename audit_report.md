# Audit summary

| Section | Items | DONE | PARTIAL | MISSING | CANNOT VERIFY | Completion |
|---|---:|---:|---:|---:|---:|---:|
| 0 Decisions | 10 | 4 | 2 | 4 | 0 | 50.0% |
| 1 Foundation | 32 | 10 | 9 | 3 | 10 | 45.3% |
| 2 Module 1 | 36 | 33 | 1 | 2 | 0 | 93.1% |
| 3 Module 2 | 51 | 41 | 7 | 3 | 0 | 87.3% |
| 4 Module 3 | 29 | 21 | 4 | 4 | 0 | 79.3% |
| 5 Module 4 | 36 | 26 | 2 | 8 | 0 | 75.0% |
| 6 Integration | 10 | 1 | 8 | 1 | 0 | 50.0% |
| 7 Non-functional | 8 | 1 | 1 | 6 | 0 | 18.8% |
| 8 Security | 14 | 2 | 4 | 8 | 0 | 28.6% |
| 9 Testing | 34 | 0 | 4 | 30 | 0 | 5.9% |
| 10 CI/CD | 14 | 1 | 0 | 13 | 0 | 7.1% |
| 11 Documentation | 17 | 1 | 0 | 16 | 0 | 5.9% |
| 12 Journal | 7 | 0 | 0 | 7 | 0 | 0.0% |
| 13 Proposal fixes | 9 | 0 | 0 | 9 | 0 | 0.0% |
| **TOTAL** | **307** | **141** | **42** | **114** | **10** | **52.8%** |

## Audit basis

Audited 2026-11-27 against the current worktree. Completion is `(DONE + 0.5 x PARTIAL) / total`; CANNOT VERIFY contributes zero. The ordered checklist below is the full item list. Backend findings require registered routes and implementation evidence; frontend findings require reachable screens and API wiring; database DONE requires model plus migration/schema evidence. Passing focused tests is recorded separately and is not treated as proof of end-to-end completion.

## Mobile UI usability audit — 2026-11-28

The requested mobile UI audit items were added and checked against the current implementation. `[x]` means the requested UI treatment is implemented; `[~]` means the production flow is improved but still depends on backend data or a future device-level validation pass.

- **[x]** Profile editing split into Account, Services, and More sections with shorter forms.
- **[x]** Job detail uses a visual status timeline, urgency badge, location card, and grouped actions.
- **[x]** Matching cards support provider photos with initials fallback and an expandable ranking explanation.
- **[x]** Quotation comparison supports provider names/photos with best-value and fastest comparison highlights.
- **[x]** Equipment listing is a three-step Basics, Pricing, and Handover flow with photo preview.
- **[x]** Equipment details use guided date choices instead of free-text date entry.
- **[x]** Loading screens use skeleton cards instead of a spinner-only state.
- **[x]** Landing screen has separate customer and provider entry actions.
- **[x]** Notifications, reservations, chat, provider jobs, and quotation submission received visual hierarchy and clearer empty/error states.
- **[x]** Repeated remote placeholder equipment imagery was replaced with the local generated visual fallback.
- **[~]** Provider photos and names display when the API supplies `photoUrl`, `providerName`, or `providerPhotoUrl`; existing records retain safe initials/ID fallbacks.
- **[~]** Legacy development-only equipment screens and registration helper copy still contain alert-based helper messages; production equipment browsing/listing routes use the new in-app flows.
- **[~]** Final accessibility and small-screen testing still requires emulator/device screenshots and touch-target verification.

## Full item list

## Audit status — 2026-11-27

Checked against implementation code (backend app, models, services, routers, migrations, mobile/admin source, and ML source). `[x]` = implemented in code; `[~]` = partially implemented or has a material gap; `[ ]` = no sufficient implementation evidence, intentionally left unchanged. README claims and test-file presence alone were not treated as completion.

Based on the proposal (Group 12). Statuses below describe evidence in the current repository, not completion claims from the proposal.
AI work is one sub-category (section 3D) inside Module 2, not the centre of the project.

Owners: **[M1]** Pushpakumara | **[M2]** Muthunayaka | **[M3]** Rideemahaliyadda | **[M4]** Alahakoon | **[ALL]** everyone

---

## 0. Decisions to lock

- **PARTIAL** [ALL] Final project name — source code uses WedaLink, but the repository folder is WadaLink and the checklist/proposal still use ServiceLink/WedaLink inconsistently.
- **PARTIAL** [ALL] Product architecture — implemented as a hybrid: customer/provider mobile app plus admin web app; the “web app only” wording is incorrect.
- **MISSING** [ALL] Confirm out of scope: payments, document verification, advanced analytics, push notifications
- **DONE** [ALL] Backend framework: FastAPI
- **MISSING** [ALL] Deployment target (AWS or Railway)
- **MISSING** [ALL] Real weekly timeline and final deadlines (proposal 12 weeks, journal 15 weeks)
- **DONE** [ALL] Job status list and the flow between statuses — request statuses are defined in `backend/app/models/service_request.py`; reservation transitions are defined in `mobile/src/utils/statusFlow.ts`.
- **DONE** [ALL] Final REST API contract — `docs/api-contract.md` and the registered FastAPI OpenAPI schema document the API surface.
- **MISSING** [ALL] Final MySQL schema
- **DONE** [ALL] Language of the platform (English only) — inspected mobile/admin user-facing copy is English.

---

## 1. Project foundation

### Repository
- **PARTIAL** [M2] Branches: `main` and `develop` exist; no `feature/*` or `bugfix/*` branch evidence was found.
- **CANNOT VERIFY** [M2] Protect `main` — requires GitHub repository settings.
- **DONE** [M2] `.gitignore` (env files, model files, node_modules, venv) — ignore rules cover these artifacts.
- **CANNOT VERIFY** [M2] No secrets in Git history — complete history scanning requires repository-wide verification.
- **DONE** [M2] `.env.example` for backend and frontend — examples exist for backend, mobile, and admin.
- **DONE** [M2] Root README (what it is, stack, how to run) — `README.md` documents the structure and stack.
- **MISSING** [M2] Contributing guide and PR template
- **CANNOT VERIFY** [ALL] Everyone can clone and run the project locally — requires independent team-member verification.

### Project management
- **CANNOT VERIFY** [ALL] Jira board matches the real work (epics, tasks, owners) — external project-management evidence required.
- **CANNOT VERIFY** [ALL] Sprint dates correct — external project-management evidence required.
- **CANNOT VERIFY** [ALL] GitHub Projects board added, or note that Jira replaces it — external project-management evidence required.
- **CANNOT VERIFY** [ALL] Daily merges into `develop` — remote history/process evidence required.
- **CANNOT VERIFY** [ALL] Sprint review and retrospective every sprint — meeting records required.
- **CANNOT VERIFY** [ALL] Weekly meeting notes saved — external records required.
- **CANNOT VERIFY** [ALL] Mentor and supervisor meetings recorded — external records required.

### Shared frontend shell
- **PARTIAL** [ALL] Frontend stack — admin uses Vite/React/Redux and mobile uses Expo/React Native/Redux; Tailwind and one shared web shell are not present.
- **PARTIAL** [ALL] Routing — mobile React Navigation exists and the admin app has its Vite entry shell, but there is no full admin route framework.
- **PARTIAL** [ALL] Layout (header, sidebar, footer) — admin has a shell and mobile has navigation/layout components, but there is no shared cross-client shell.
- **PARTIAL** [ALL] Auth guard for protected pages — mobile has session/access gating; the admin web panel lacks a complete login guard.
- **PARTIAL** [ALL] Role-based route guard (customer, provider, admin) — mobile gates customer/provider/admin states; admin authorization is mainly API-side.
- **DONE** [ALL] Shared components (button, input, modal, table, toast) — shared mobile UI components and admin styling/components exist.
- **DONE** [ALL] API client with token handling — mobile HTTP/RTK Query clients and admin API service attach bearer tokens.
- **PARTIAL** [ALL] 404 and error pages — mobile error states and admin request errors exist, but a dedicated admin 404 route/page is not evidenced.
- **PARTIAL** [ALL] Final UI follows the Google Stitch designs — mobile uses the design guide/theme and admin has a matching shell; full-screen parity is not verified.

### Shared backend base
- **DONE** [ALL] FastAPI project structure (routers, services, models, schemas)
- **PARTIAL** [ALL] SQLAlchemy/database connection — SQLAlchemy and migrations are implemented, but runtime configuration uses PostgreSQL/Neon while the original checklist says MySQL.
- **DONE** [ALL] Migrations
- **MISSING** [ALL] Standard error response format
- **DONE** [ALL] Request validation with schemas
- **MISSING** [ALL] Logging
- **DONE** [ALL] CORS settings
- **DONE** [ALL] Swagger/OpenAPI docs enabled

---

## 2. Module 1 - Users and service requests [M1]

### Database
- **DONE** `users`
- **DONE** `customers`
- **PARTIAL** `providers` (skills, categories, experience, location, approval status)
- **DONE** `service_requests` (description, location, urgency, category, status)
- **DONE** `service_categories`
- **MISSING** Seed the 24 categories and subcategories
- **DONE** Indexes on search columns

### Backend
- **DONE** Customer registration
- **DONE** Provider registration
- **DONE** Login with JWT
- **DONE** Password hashing
- **DONE** Role-based access control
- **DONE** Token expiry handling
- **DONE** Customer profile CRUD — `/api/v1/users/me` GET/PATCH uses the authenticated customer identity.
- **DONE** Provider profile CRUD — `/api/v1/users/me` and `/api/v1/users/me/provider` GET/PATCH update provider profile fields and preserve approval status.
- **DONE** Provider approval status in the profile
- **DONE** Create service request
- **DONE** List and view own requests — `/api/v1/requests` and `/api/v1/requests/{request_id}` are scoped to the authenticated customer.
- **DONE** Update request status
- **DONE** Cancel a request
- **DONE** Provider job discovery (open requests in the provider's categories) — `/api/v1/providers/jobs` filters open requests by the authenticated provider's service categories.
- **DONE** Customer selects a provider
- **DONE** Job status tracking to completion

### Frontend
- **DONE** Customer registration page — [mobile/src/features/auth/screens/RegisterScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/auth/screens/RegisterScreen.tsx) is reachable from `AuthNavigator` through `RoleSelection`; `register` dispatches the real `POST /api/v1/auth/register` gateway by default.
- **DONE** Provider registration page — the same reachable `RegisterScreen` accepts the provider role and calls the real auth gateway with `role: 'provider'`.
- **DONE** Login and logout — [mobile/src/features/auth/screens/LoginScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/auth/screens/LoginScreen.tsx) is registered in `AuthNavigator` and dispatches the real `POST /api/v1/auth/login`; `logout` clears the token and API state in [mobile/src/store/sessionSlice.ts](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/store/sessionSlice.ts).
- **DONE** Customer profile page — the Profile tab reads and updates `/api/v1/users/me`.
- **DONE** Provider profile page — the Profile tab reads and updates provider details and service categories.
- **DONE** Provider approval status view — Profile displays the approval status returned by the user API.
- **DONE** Service request form (description, location, urgency) — [mobile/src/features/requests/screens/CreateRequestScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/requests/screens/CreateRequestScreen.tsx) is reachable from `CustomerHomeScreen`/`CustomerTabs` and uses the real request API gateway by default.
- **DONE** My requests list — [mobile/src/features/requests/screens/MyRequestsScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/requests/screens/MyRequestsScreen.tsx) is registered as the customer Jobs tab and calls `useGetMyRequestsQuery`.
- **DONE** Request detail and status page — the customer Jobs screen opens the shared job-detail screen, where a customer can inspect and cancel an open request.
- **DONE** Provider job discovery page — provider Jobs switches between discovery and the provider's own jobs, using the authenticated provider APIs.
- **DONE** Provider job dashboard (my jobs and status) — provider Home/Jobs show current work and support start/complete actions.
- **DONE** Loading, empty and error states — `CustomerHomeScreen`, `MyRequestsScreen`, `CreateRequestScreen`, and matching screens contain explicit loading, empty, retry, and error UI components.
- **MISSING** Responsive layout

---

## 3. Module 2 - Quotations, ranking and AI [M2]

### 3A. Quotations
- **DONE** `quotations` table
- **DONE** Provider submits a quotation (price, availability, notes)
- **DONE** Block duplicate quotations from the same provider
- **DONE** Customer views quotations for a request
- **DONE** Customer compares quotations — the mobile comparison screen loads all quotations for the authenticated request and presents price, timing, and notes.
- **PARTIAL** Quotation submission form — [mobile/src/features/quotations/screens/QuotationSubmissionScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/quotations/screens/QuotationSubmissionScreen.tsx) calls the real quotation API, but provider navigation to the form still needs to be connected to a live job-discovery screen.
- **DONE** Quotation comparison view — [mobile/src/features/quotations/screens/QuotationComparisonScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/quotations/screens/QuotationComparisonScreen.tsx) is registered in `CustomerNavigator` and has loading, empty, error, and selection states.
- **DONE** Notification on a new quotation — the quotation service creates an in-app `quote_received` notification and the customer Updates tab displays it.

### 3B. Provider ranking engine
- **DONE** `provider_scores` table
- **DONE** Rating score
- **DONE** Price score
- **DONE** Experience / jobs completed score
- **DONE** Distance score
- **DONE** Response time score
- **DONE** Normalise all factors to one scale
- **DONE** Weights stored in config and visible — [backend/app/ranking/weights.json](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/ranking/weights.json) is validated by the matching service and shown in the ranking explanation UI.
- **DONE** Weighted total score
- **DONE** Handle missing data (no rating, no price, no location) — matching assigns neutral defaults for absent rating, distance, response time, and price values.
- **DONE** Only approved providers in the matching category — `MatchingService.match` filters approval status, active account, and the request category before scoring.
- **DONE** Matching pipeline (request, category, approved active providers, ranked list) — provider statistics are fetched in grouped queries so query count does not grow per candidate.
- **DONE** Ranking API returns score and per-factor breakdown
- **DONE** Price-only baseline for comparison — matching now returns `priceOnlyProviderIds` alongside the weighted ranking.
- **DONE** Track provider response time — response time is calculated from quotation/request timestamps and persisted on the provider record.
- **DONE** Update ratings and job counts after each job — matching recalculates review averages and completed-job counts from current database records for every match request.

### 3C. Ranking frontend
- **DONE** Ranked provider list — [mobile/src/features/matching/screens/MatchingProvidersScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/matching/screens/MatchingProvidersScreen.tsx) is reachable from the request flow and calls `useGetMatchesQuery` against the real matching API by default.
- **DONE** Expandable score breakdown — [mobile/src/features/matching/components/ProviderMatchCard.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/matching/components/ProviderMatchCard.tsx) expands factor score bars and weights.
- **DONE** "Why this provider?" explanation view — the same `ProviderMatchCard` exposes the reachable “Why this provider?” control and explanation.
- **DONE** Select provider button — quotation cards expose selection, and the backend marks the chosen quotation accepted, rejects alternatives, assigns the request, and notifies the provider.
- **PARTIAL** Mobile layout check — the ranking screen uses responsive flex/scroll/list layouts and 48px controls, but a device/emulator screenshot matrix has not been recorded.

### 3D. AI request classification (sub-category)
- **PARTIAL** Cleaned dataset final (`data_clean.csv`) exists, but duplicate/flagged-label resolution is not evidenced
- **MISSING** Human test set and out-of-scope test set final and untouched
- **PARTIAL** Final TF-IDF + Logistic Regression model trained and saved
- **DONE** Threshold, margin and similarity checks are configured and applied by the classifier
- **DONE** `other`/unsupported results fall back to User Picks or the service-not-available path
- **DONE** Classifier interface returns category, confidence, layer
- **DONE** Keyword matcher fallback
- **PARTIAL** LLM fallback (JSON prompt, category list from database, validation, timeout, one retry)
- **DONE** Cache and rate limit for LLM calls — [backend/app/services/classification_service.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/services/classification_service.py) caches classifications for five minutes and limits each customer to 60 classifications per hour.
- **DONE** Remove phone numbers and addresses before the LLM call
- **DONE** Manual category fallback and explicit unlisted-service path — customers may let AI choose, select an active category, or submit without one for review. Manual-review submissions bypass automatic category assignment and are saved as unmatched requests.
- **DONE** AI result screen with "Not right? Change" button — [mobile/src/features/requests/screens/AIResultScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/requests/screens/AIResultScreen.tsx) is registered in `CustomerNavigator` and uses classification/category/matching API queries.
- **DONE** Low-confidence screen and "service not available yet" screen — `AIResultScreen` renders both states from the real classification response and provides manual category recovery.
- **DONE** `classification_log` table and logging every request
- **DONE** Staging table `llm_labeled_requests` with approval rules
- **DONE** Admin review page — reviews uncertain model labels and unmatched customer requests; admins can assign an active category or close a request, and the customer is notified. Admin-assigned labels are exported for later manual retraining; registration/review does not retrain the live model.
- **DONE** `category_proposals` table and provider proposal form — [backend/app/models/ai_review.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/models/ai_review.py), the registered `/api/v1/admin/ai/category-proposals` routes, and the provider proposal UI in `ProfileScreen` provide the flow.
- **PARTIAL** Manual `retrain.py` with versioning and rollback
- **DONE** Unit tests for the classifier, LLM wrapper and fallbacks — [backend/tests/unit/test_ai_classification.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/tests/unit/test_ai_classification.py), [backend/tests/unit/test_groq_fallback.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/tests/unit/test_groq_fallback.py), and [backend/tests/unit/test_ai_resilience.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/tests/unit/test_ai_resilience.py) cover model, keyword, LLM validation/retry, PII scrubbing, fallback, and resilience behavior.
- **MISSING** Evaluation: accuracy, precision, recall, F1, confusion matrix on the human test set — the evaluator exists, but `ml/data/evaluation/human_test_template.csv` still has no labelled examples.
- **MISSING** Evaluation: model vs LLM vs keyword vs combined, layer percentages, out-of-scope accuracy
- **PARTIAL** Marketplace keeps working when the AI layer is down

---

## 4. Module 3 - Equipment rental [M3]

### Database
- **DONE** `equipment`
- **DONE** `equipment_reservations`
- **DONE** Status field — equipment and reservations have explicit lifecycle status enums, including available, reserved, in-rent, return-pending, returned, and cancelled.

### Backend
- **DONE** Add equipment — listing details (image, delivery fee/radius, tags, pickup and return locations) persist; public browsing hides listings until their provider is approved and active.
- **DONE** Edit and delete equipment
- **DONE** List and search equipment (name, description, category, tags, availability, and price; public results require an approved active provider)
- **DONE** Reserve equipment with dates
- **DONE** Date conflict and double-booking check
- **PARTIAL** Database transaction for every status change — writes are committed, but reservation overlap checks and status transitions are not protected by a concurrency-safe transaction/locking strategy.
- **DONE** Available to Reserved — reservation creation marks equipment reserved and creates the reservation.
- **PARTIAL** Reserved to Returned — pickup, return-pending, and returned states are implemented, but the service accepts any allowed status from any prior state rather than enforcing a transition graph.
- **PARTIAL** Block invalid status changes — unknown status values are rejected, but out-of-order transitions among valid statuses are not.
- **DONE** Rental history per provider — `/api/v1/reservations/fleet` returns reservations for the authenticated provider's equipment.
- **DONE** Link a reservation to a service job
- **MISSING** Late-return rule (notification or penalty, decide)
- **MISSING** Notification on reservation and return

### Frontend
- **DONE** Equipment listing form — provider fleet links to a create/edit form using the HTTP API and captures listing images, tags, delivery terms, and pickup/return locations.
- **DONE** My equipment page — the provider Equipment tab loads and searches the owner's fleet.
- **DONE** Browse and search page — the customer equipment catalog searches listing names, categories, descriptions, and tags, and displays delivery and pickup/return terms.
- **DONE** Equipment detail page — details and current status are displayed before booking.
- **DONE** Reservation form — customers select dates and submit a reservation through the API.
- **DONE** My reservations with status — customer reservations and provider fleet reservations show lifecycle states.
- **DONE** Return confirmation — providers explicitly confirm inspected returns before the equipment becomes available.
- **DONE** Rental history view — the reservations screen separates active reservations from returned/cancelled history.
- **DONE** Loading, empty and error states — these screens use shared remote loading/error/empty UI.

### Tests
- **DONE** Status lifecycle unit tests — tests cover reserved → in-rent → return-pending → returned and owner authorization.
- **MISSING** Two providers booking the same item (concurrency)
- **PARTIAL** Availability accuracy check — overlapping reservations are rejected in unit tests; boundary/concurrency accuracy is not established.
- **MISSING** End-to-end rental test

---

## 5. Module 4 - Chat, notifications, reviews and admin [M4]

### Database
- **DONE** `messages`
- **DONE** `notifications`
- **DONE** `reviews`
- **DONE** `admin_logs`

### Job-scoped chat
- **DONE** Chat opens only after a provider is selected — `/api/v1/chat/{request_id}` rejects unassigned jobs.
- **DONE** Only the customer and the selected provider can access it — chat routes enforce both participant identities.
- **DONE** Send and fetch message APIs
- **DONE** Real-time delivery (WebSocket or polling)
- **DONE** Hide personal contact details — chat responses expose message/request/user IDs and text only; phone/email fields are not serialized.
- **DONE** Chat UI — the registered job conversation screen fetches and sends messages and refreshes by polling.
- **MISSING** Access control tests

### Notifications
- **PARTIAL** Notification engine with event hooks
- **DONE** In-app: new quotation — quotation submission creates a customer notification.
- **DONE** In-app: provider selected — selecting a quotation notifies the selected provider.
- **PARTIAL** In-app: job status change — job start, completion, and request cancellation create notifications; event coverage is not complete for all status transitions.
- **MISSING** In-app: equipment reservation
- **MISSING** Email (SMTP) for the same events
- **MISSING** SMTP account and credentials in `.env`
- **MISSING** Email templates
- **DONE** Notification center with unread count — the registered screen lists notifications and computes unread count from loaded records.
- **DONE** Mark as read — `POST /api/v1/notifications/{notification_id}/read` is scoped to the authenticated notification owner.
- **MISSING** App keeps working if SMTP fails

### Ratings and reviews
- **DONE** Customer reviews provider after completion — `POST /api/v1/reviews/request/{request_id}` resolves the provider target for a customer.
- **DONE** Provider reviews customer after completion — the same endpoint resolves the customer target for the selected provider.
- **DONE** One review per job per side — the unique `(request_id, reviewer_id)` constraint and route-level duplicate check enforce one review per participant.
- **DONE** Review APIs
- **DONE** Review form and review list — the registered screen lists reviews and supports submitting one after job completion.
- **DONE** Average rating feeds into ranking

### Admin
- **DONE** Approve or reject provider registration
- **DONE** Moderate service and equipment listings — `GET /api/v1/admin/listings` exposes protected moderation data.
- **DONE** Activity stats (active jobs, pending approvals) — `GET /api/v1/admin/dashboard` returns protected dashboard metrics.
- **DONE** Admin dashboard — `/api/v1/admin/dashboard` is registered and admin-role protected.
- **DONE** Provider approval queue — `GET/POST /api/v1/admin/providers/pending` and `/api/v1/admin/providers/{id}/{decision}` are registered and admin-role protected.
- **MISSING** Listing moderation page
- **DONE** Log admin actions
- **MISSING** Seed the first admin account

---

## 6. Integration

- **PARTIAL** [ALL] Frontend, backend and database connected — mobile/admin clients call the FastAPI API; runtime uses PostgreSQL/Neon, not the proposal's MySQL.
- **PARTIAL** [ALL] Customer flow works: request, category, providers, quotations, select, chat, complete, review — the individual API/UI paths are present, but no end-to-end journey evidence was found and customer completion is provider-driven.
- **PARTIAL** [ALL] Provider flow works: register, approval, find jobs, quote, chat, complete, review — these paths are represented in code, but no end-to-end journey evidence was found.
- **PARTIAL** [ALL] Equipment rental linked to a job — the reservation model supports an optional related request, but the mobile reservation flow does not submit that link.
- **DONE** [ALL] Reviews update ranking scores — matching reads current review data when calculating provider ratings.
- **PARTIAL** [ALL] Notifications fire from every module — quotation, selection, start/completion, and cancellation events are wired; equipment reservation/return and email are not.
- **PARTIAL** [ALL] Admin approval gates provider activity — matching and quotation submission require approved providers; broader provider endpoints need a complete gate audit.
- **PARTIAL** [ALL] Feature-complete integration — substantial module paths are connected, but end-to-end tests, email/push, and other listed gaps remain.
- **PARTIAL** [ALL] Whole app works when the LLM is unavailable — classification has model/keyword/manual fallback and request creation survives classification failure; a whole-app outage test is absent.
- **MISSING** [ALL] Shared seed script with demo data

---

## 7. Non-functional requirements

- **MISSING** [ALL] Performance: classification under 3 s, ranking under 2 s, rental under 2 s
- **MISSING** [ALL] Usability: simple flows for non-technical users, services and rental clearly separate
- **MISSING** [ALL] Reliability: core features work without the AI layer
- **DONE** [ALL] Maintainability: AI layer separate from business logic
- **MISSING** [ALL] Scalability: schema and API support growth
- **MISSING** [ALL] Availability: no crash under normal use
- **MISSING** [ALL] Accessibility check (labels, contrast, keyboard)
- **PARTIAL** [ALL] Responsive on desktop and mobile browsers

---

## 8. Security and privacy

- **DONE** [ALL] Passwords hashed, never logged
- **MISSING** [ALL] Secrets only in environment variables
- **PARTIAL** [ALL] RBAC on every protected endpoint — authenticated role/ownership guards exist across the main routes; a complete endpoint-by-endpoint authorization test is absent.
- **PARTIAL** [ALL] Input validation on every field — Pydantic request schemas validate many API inputs, but universal validation coverage is not demonstrated.
- **PARTIAL** [ALL] SQL injection and XSS protection — ORM queries and React text rendering are used; no dedicated injection/XSS verification is recorded.
- **MISSING** [ALL] CSRF check
- **DONE** [ALL] CORS limited to the frontend
- **MISSING** [ALL] Rate limiting on login and request endpoints
- **MISSING** [ALL] HTTPS in production
- **MISSING** [ALL] No personal data in logs
- **PARTIAL** [ALL] Contact details hidden between users — chat responses do not serialize contact fields, but a full cross-feature exposure audit is not recorded.
- **MISSING** [ALL] Account deletion and data export, or a note that it is out of scope
- **MISSING** [ALL] AI ethics notes (fair ranking, explainability, human review)
- **MISSING** [ALL] Terms and consent text

---

## 9. Testing

### Unit tests
- **PARTIAL** [M1] Auth, profile and request tests — auth, request, provider job, and dashboard tests exist; profile CRUD coverage is incomplete.
- **PARTIAL** [M2] Ranking, quotation and classifier tests
- **PARTIAL** [M3] Equipment tests
- **MISSING** [M4] Chat, notification, review and admin tests — no focused tests for these new routes were found.
- **PARTIAL** [ALL] API tests (PyTest and Postman collection)
- **MISSING** [ALL] Frontend component tests

### Integration tests
- **MISSING** [ALL] Classification to ranking
- **MISSING** [ALL] Ranking to frontend
- **MISSING** [ALL] Rental module to provider profile
- **MISSING** [ALL] Database CRUD and transactions
- **MISSING** [ALL] Auth middleware

### System tests
- **MISSING** [ALL] Customer journey
- **MISSING** [ALL] Provider journey
- **MISSING** [ALL] Admin journey
- **MISSING** [ALL] Desktop, tablet and mobile
- **MISSING** [ALL] Browser check (Chrome, Firefox, Edge)
- **MISSING** [ALL] Final regression test

### Performance and security tests
- **MISSING** [ALL] Response time targets
- **MISSING** [ALL] 50 concurrent users (JMeter or k6)
- **MISSING** [ALL] Database queries under 500 ms
- **MISSING** [ALL] Seed large data and test (or state the tested size)
- **MISSING** [ALL] OWASP ZAP scan
- **MISSING** [ALL] Malformed input and access control tests
- **MISSING** [ALL] Rate-limit test

### Evaluation
- **MISSING** [M2] Classification evaluation (see 3D)
- **MISSING** [M2] Ranking evaluation: NDCG@5, NDCG@10, MRR, diversity
- **MISSING** [M2] Weighted ranking beats price-only sorting
- **MISSING** [M3] Rental evaluation: availability accuracy, checkout time, return handling
- **MISSING** [ALL] Save all evidence (logs, screenshots, reports)

### User acceptance
- **MISSING** [ALL] Alpha test by the team
- **MISSING** [ALL] Beta test with 10-15 users for 2 weeks
- **MISSING** [ALL] Survey with 30+ users
- **MISSING** [ALL] Satisfaction above 4.0 out of 5.0
- **MISSING** [ALL] Fix the issues found and record them

---

## 10. CI/CD and deployment

- **MISSING** [ALL] GitHub Actions: lint, tests, build
- **MISSING** [ALL] Tests must pass before merge
- **DONE** [ALL] Dockerfiles (optional)
- **MISSING** [ALL] Production database
- **MISSING** [ALL] Production environment variables and secrets
- **MISSING** [ALL] Deploy backend
- **MISSING** [ALL] Deploy frontend
- **MISSING** [ALL] Deploy model files (not in Git)
- **MISSING** [ALL] LLM key and SMTP configured in production
- **MISSING** [ALL] HTTPS
- **MISSING** [ALL] Production smoke test
- **MISSING** [ALL] Basic monitoring and error logs
- **MISSING** [ALL] Database backup before the demo
- **MISSING** [ALL] Backup demo plan (local copy and recorded video)

---

## 11. Documentation and final deliverables

- **MISSING** [ALL] Software Requirements Specification
- **MISSING** [ALL] System architecture diagram
- **MISSING** [ALL] ER diagram
- **MISSING** [ALL] Use case diagram
- **MISSING** [M2] Sequence diagrams (classification and ranking)
- **DONE** [ALL] API documentation (Swagger)
- **MISSING** [ALL] User manual and admin manual
- **MISSING** [ALL] Setup and run guide
- **MISSING** [ALL] Test report with evidence
- **MISSING** [ALL] Final report
- **MISSING** [ALL] Presentation slides
- **MISSING** [ALL] Demo script and scenarios
- **MISSING** [ALL] Viva preparation (each member explains their own module)
- **MISSING** [ALL] Individual contribution logs
- **MISSING** [ALL] Commit history shows each member's work
- **MISSING** [ALL] Generative AI use disclosure
- **MISSING** [ALL] References updated

---

## 12. Journal and approvals

- **MISSING** [M2] Journal Weeks 9 to 15 filled in weekly
- **MISSING** [M2] Earlier entries match final decisions
- **MISSING** [M2] Student and mentor signatures and dates every week
- **MISSING** [M2] Journal shown to mentor and supervisor every 3 weeks
- **MISSING** [M2] Mentor and supervisor approval sections completed
- **MISSING** [ALL] Milestones tracked: foundation, core marketplace, non-AI system, intelligent matching, feature complete, tested and deployed, final evaluation ready
- **MISSING** [ALL] Risks reviewed (scope creep, LLM downtime, free-tier limits, lost time)

---

## 13. Proposal fixes

- **MISSING** AI wording: change "Gemini Flash classifier" to "own model with LLM fallback" (sections 3, 4, 5, 7, 12)
- **MISSING** Remove "mobile app" wording (sections 5.7 and 6)
- **MISSING** Section 14: remove React Native app, push notifications, sandbox payments, maps matching and dispute management
- **MISSING** Section 10: remove payment, cart, checkout and penalty wording (or add them to scope)
- **MISSING** Section 10: replace PostgreSQL, Node/Mocha and Django test tools with MySQL, PyTest and FastAPI tools
- **MISSING** Section 10.2.1.1: fix the "500+ test requests" figure
- **MISSING** Make deployment consistent (AWS or Railway)
- **MISSING** Use one project name
- **MISSING** Update module owner responsibilities if they changed

## Evidence notes for DONE and PARTIAL items

- Backend base: [backend/app/main.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/main.py) registers `api_v1_router` and creates the FastAPI app; [backend/app/api/v1/__init__.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/api/v1/__init__.py) registers the implemented routers.
- Authentication: [backend/app/routes/auth_routes.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/routes/auth_routes.py) implements `register`, `login`, and `get_me`; [backend/app/core/dependencies.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/core/dependencies.py) implements `get_current_user` and `require_role`.
- Equipment/rental: [backend/app/api/v1/equipment.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/api/v1/equipment.py) and [backend/app/api/v1/reservations.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/api/v1/reservations.py) expose routes; [backend/app/services/reservation_service.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/services/reservation_service.py) contains conflict and lifecycle logic; unit tests are in [backend/tests/unit/test_equipment_and_reservations.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/tests/unit/test_equipment_and_reservations.py).
- AI: [backend/app/ai/pipeline.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/ai/pipeline.py) loads the model from the repository's `ml/models` directory, applies confidence/margin/similarity gates, and restricts LLM selections to active category names above the configured confidence. [backend/app/ai/scope.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/ai/scope.py) rejects several clear non-marketplace intents before model/LLM calls. [backend/app/schemas/classification.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/schemas/classification.py) exposes `layer`.
- AI resilience: [backend/app/services/classification_service.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/services/classification_service.py) performs five-minute result caching, a 60-per-customer hourly limit, and logs fallback outcomes; [backend/app/ai/groq_classifier.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/ai/groq_classifier.py) performs PII scrubbing, JSON validation, timeout handling, and one retry.
- AI evaluation evidence: `ml/src/evaluate.py` completed source-holdout evaluation and refreshed [ml/reports/leave_one_source_out.csv](D:/SUSL/SE%20SEM%2005/WadaLinik/ml/reports/leave_one_source_out.csv) with accuracies Claude 0.7624, Gemini 0.8141, and GPT 0.8588; [ml/reports/worst_predictions.csv](D:/SUSL/SE%20SEM%2005/WadaLinik/ml/reports/worst_predictions.csv) was refreshed for error review. `ml/src/compare_baselines.py` ran successfully: word TF-IDF + LogisticRegression 0.8615, word TF-IDF + LinearSVC 0.9060, char TF-IDF + LogisticRegression 0.8496, char TF-IDF + LinearSVC 0.9043. New authored synthetic regression fixtures are documented in [ml/data/evaluation/synthetic/manifest.json](D:/SUSL/SE%20SEM%2005/WadaLinik/ml/data/evaluation/synthetic/manifest.json); the combined fixture result was 1.0 in-scope accuracy and 0.0 out-of-scope false acceptance. These small fixtures are regression evidence only—not independent human evaluation or a production accuracy claim. The ranking smoke report also records that weighted and price-only ranking tied on its two synthetic scenarios.
- Matching: [backend/app/services/matching_service.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/services/matching_service.py) implements `MatchingService.match`; [backend/app/api/v1/matching.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/api/v1/matching.py) exposes matching routes.
- Frontend: [mobile/src/navigation/RootNavigator.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/navigation/RootNavigator.tsx) routes customer/provider states; [mobile/src/config/env.ts](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/config/env.ts) selects HTTP unless `EXPO_PUBLIC_USE_MOCK=true`; [admin/src/App.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/admin/src/App.tsx) calls the admin API. The mobile example env intentionally enables mock mode, so local setup must override it for backend integration.
- Auth/landing UI: [mobile/src/navigation/AuthNavigator.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/navigation/AuthNavigator.tsx) reaches `Landing`, `Login`, `RoleSelection`, and `Register`; [mobile/src/features/auth/screens/LandingScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/auth/screens/LandingScreen.tsx) provides the landing UI. Auth uses the real API by default because `EXPO_PUBLIC_USE_MOCK` must explicitly equal `true` to select mock mode.
- Additional UI audit: [mobile/src/navigation/CustomerTabs.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/navigation/CustomerTabs.tsx), [mobile/src/navigation/ProviderTabs.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/navigation/ProviderTabs.tsx), and [mobile/src/navigation/RootNavigator.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/navigation/RootNavigator.tsx) reach customer requests, provider jobs, equipment, chat, notifications, quotations, and reviews. The latest mobile TypeScript check passes. Reservation screens use direct HTTP calls; the older [mobile/src/services/api/reservations.ts](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/services/api/reservations.ts) still targets legacy `/equipment-reservations` endpoints and is not the path used by the current screen.
- Database: models are under [backend/app/models/](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/models/) and migrations under [backend/alembic/versions/](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/alembic/versions/). Runtime configuration in [backend/app/core/config.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/core/config.py) and [docker-compose.yml](D:/SUSL/SE%20SEM%2005/WadaLinik/docker-compose.yml) uses PostgreSQL/Neon, which differs from the original MySQL proposal.

## Highest-priority remaining gaps

1. Enforce an explicit reservation status-transition graph and protect overlapping bookings against concurrent requests.
2. Add authorization and integration tests for profile, chat, notification, review, and admin routes.
3. Add reservation/return notification events and exercise the notification flows.
4. Connect reservation creation to an optional service request in the mobile flow, if that remains in scope.
5. Add complete customer/provider/admin end-to-end tests; backend unit/API tests do not establish device journeys.
6. Collect independent human and out-of-scope AI evaluation data; synthetic fixtures are regression-only.
7. Complete the endpoint-by-endpoint RBAC, input validation, privacy, and rate-limit verification.
8. Resolve the project's PostgreSQL/Neon runtime versus MySQL proposal/schema decision.
9. Add frontend component tests and check the admin lint issue reported in the previous audit.
10. Establish CI/CD, deployment, smoke, monitoring, and backup evidence.
11. Complete documentation, signed journal, mentor, acceptance, and proposal-alignment evidence.

## Code/checklist or proposal disagreements

- Repository folder is WadaLink, while code/README use WedaLink and the checklist alternates ServiceLink/WedaLink.
- The checklist says web-only, but the repository includes an Expo React Native mobile application.
- The checklist requires MySQL, while backend config and docker-compose use PostgreSQL/Neon.
- Mobile supports mock and HTTP gateways. HTTP is selected unless `EXPO_PUBLIC_USE_MOCK=true`; the sample env file sets mock mode, so deployment/setup values matter.
- `ClassificationResponse` now exposes `layer`; the earlier finding that it did not is obsolete.
- Quotations, users, providers, chat, notifications, reviews, and admin routers are now included in [backend/app/api/v1/__init__.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/api/v1/__init__.py); the earlier route-registration finding is obsolete.
- Admin is a single AI review page, not the complete customer/provider web shell described by the checklist.

## Test run results

| Target | Command (run 2026-11-27) | Result | Passed | Failed | Skipped | Notes |
|---|---|---|---:|---:|---:|---|
| Backend full suite | `cd backend; ..\\ml\\.venv\\Scripts\\python.exe -m pytest -p no:cacheprovider -q` | PASS | 95 | 0 | 0 | All backend tests passed; one Starlette/httpx deprecation warning remains. |
| Mobile | `cd mobile; npm run typecheck` | PASS | N/A | 0 | N/A | `tsc --noEmit` exited 0. |

Admin build/lint, mobile lint, live LLM verification, and end-to-end device flows were not rerun as part of this refresh; results from the 2026-11-22 audit should not be read as current validation.

## CANNOT VERIFY items

Live deployment, production database, branch protection, Jira/GitHub boards, sprint and meeting records, signed journal/approvals, real-user studies, surveys, browser/device matrix, performance/concurrency/ZAP scans, production smoke/backup/monitoring, and viva/contribution claims cannot be verified from this repository. They are counted separately as CANNOT VERIFY and contribute zero to completion; external evidence is still required.

## Post-audit database remediation

Historical note from the 2026-11-22 audit: the legacy MySQL `database/schema.sql` was removed. The initial Alembic migration was converted to PostgreSQL-native types, and `alembic upgrade head` was applied successfully to the configured Neon database; `alembic current` verified revision `6f7a8b9c0123`. These remote database operations were not repeated during this refresh.

The equipment reservation renter relationship was subsequently corrected: `renter_provider_id` was migrated to `renter_customer_id`, with a foreign key to `customers.customer_id`. Reservation creation and `/my` now use the authenticated customer identity, and reservation status updates require the authenticated provider to own the equipment. Alembic now reports head revision `7g8h9i0j1k2l`, and live Neon inspection verified `renter_customer_id -> customers.customer_id`.
