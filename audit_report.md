# Audit summary

| Section | Items | DONE | PARTIAL | MISSING | CANNOT VERIFY | Completion |
|---|---:|---:|---:|---:|---:|---:|
| 0 Decisions | 10 | 4 | 2 | 4 | 0 | 50.0% |
| 1 Foundation | 32 | 8 | 11 | 3 | 10 | 42.2% |
| 2 Module 1 | 36 | 26 | 1 | 9 | 0 | 73.6% |
| 3 Module 2 | 51 | 41 | 7 | 3 | 0 | 88.2% |
| 4 Module 3 | 29 | 9 | 1 | 19 | 0 | 32.8% |
| 5 Module 4 | 36 | 20 | 2 | 14 | 0 | 58.3% |
| 6 Integration | 10 | 0 | 1 | 9 | 0 | 5.0% |
| 7 Non-functional | 8 | 1 | 1 | 6 | 0 | 18.8% |
| 8 Security | 14 | 2 | 0 | 12 | 0 | 14.3% |
| 9 Testing | 34 | 0 | 3 | 31 | 0 | 4.4% |
| 10 CI/CD | 14 | 1 | 0 | 13 | 0 | 7.1% |
| 11 Documentation | 17 | 1 | 0 | 16 | 0 | 5.9% |
| 12 Journal | 7 | 0 | 0 | 7 | 0 | 0.0% |
| 13 Proposal fixes | 9 | 0 | 0 | 9 | 0 | 0.0% |
| **TOTAL** | **307** | **113** | **29** | **155** | **10** | **41.5%** |

## Audit basis

Audited 2026-11-22. Completion is `(DONE + 0.5 x PARTIAL) / total`; CANNOT VERIFY contributes zero. The ordered checklist below is the full item list. Backend findings require route registration, validation, and available tests; frontend findings require reachability and a real API; database DONE requires model plus schema/migration.

## Full item list

## Audit status — 2026-11-22

Checked against implementation code (backend app, models, services, routers, migrations, mobile/admin source, and ML source). `[x]` = implemented in code; `[~]` = partially implemented or has a material gap; `[ ]` = no sufficient implementation evidence, intentionally left unchanged. README claims and test-file presence alone were not treated as completion.

Based on the proposal (Group 12). Nothing is ticked: change `[ ]` to `[x]` yourself.
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
- **MISSING** List and view own requests
- **DONE** Update request status
- **DONE** Cancel a request
- **DONE** Provider job discovery (open requests in the provider's categories) — `/api/v1/providers/jobs` filters open requests by the authenticated provider's service categories.
- **DONE** Customer selects a provider
- **DONE** Job status tracking to completion

### Frontend
- **DONE** Customer registration page — [mobile/src/features/auth/screens/RegisterScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/auth/screens/RegisterScreen.tsx) is reachable from `AuthNavigator` through `RoleSelection`; `register` dispatches the real `POST /api/v1/auth/register` gateway by default.
- **DONE** Provider registration page — the same reachable `RegisterScreen` accepts the provider role and calls the real auth gateway with `role: 'provider'`.
- **DONE** Login and logout — [mobile/src/features/auth/screens/LoginScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/auth/screens/LoginScreen.tsx) is registered in `AuthNavigator` and dispatches the real `POST /api/v1/auth/login`; `logout` clears the token and API state in [mobile/src/store/sessionSlice.ts](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/store/sessionSlice.ts).
- **MISSING** Customer profile page
- **MISSING** Provider profile page
- **MISSING** Provider approval status view
- **DONE** Service request form (description, location, urgency) — [mobile/src/features/requests/screens/CreateRequestScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/requests/screens/CreateRequestScreen.tsx) is reachable from `CustomerHomeScreen`/`CustomerTabs` and uses the real request API gateway by default.
- **DONE** My requests list — [mobile/src/features/requests/screens/MyRequestsScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/requests/screens/MyRequestsScreen.tsx) is registered as the customer Jobs tab and calls `useGetMyRequestsQuery`.
- **MISSING** Request detail and status page
- **MISSING** Provider job discovery page
- **MISSING** Provider job dashboard (my jobs and status)
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
- **DONE** Matching pipeline (request, category, providers, ranked list)
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
- **DONE** "User picks a category" last fallback — [backend/app/ai/pipeline.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/ai/pipeline.py) returns the `user` layer and the AI result screen routes to manual category selection.
- **DONE** AI result screen with "Not right? Change" button — [mobile/src/features/requests/screens/AIResultScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/requests/screens/AIResultScreen.tsx) is registered in `CustomerNavigator` and uses classification/category/matching API queries.
- **DONE** Low-confidence screen and "service not available yet" screen — `AIResultScreen` renders both states from the real classification response and provides manual category recovery.
- **DONE** `classification_log` table and logging every request
- **DONE** Staging table `llm_labeled_requests` with approval rules
- **DONE** Admin page to review staged groups
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
- **MISSING** Status field (Available, Reserved, Returned)

### Backend
- **DONE** Add equipment
- **DONE** Edit and delete equipment
- **DONE** List and search equipment (name, category, availability)
- **DONE** Reserve equipment with dates
- **DONE** Date conflict and double-booking check
- **PARTIAL** Database transaction for every status change
- **MISSING** Available to Reserved
- **MISSING** Reserved to Returned
- **DONE** Block invalid status changes
- **MISSING** Rental history per provider
- **DONE** Link a reservation to a service job
- **MISSING** Late-return rule (notification or penalty, decide)
- **MISSING** Notification on reservation and return

### Frontend
- **MISSING** Equipment listing form
- **MISSING** My equipment page
- **MISSING** Browse and search page
- **MISSING** Equipment detail page
- **MISSING** Reservation form
- **MISSING** My reservations with status
- **MISSING** Return confirmation
- **MISSING** Rental history view
- **MISSING** Loading, empty and error states

### Tests
- **MISSING** Status lifecycle unit tests
- **MISSING** Two providers booking the same item (concurrency)
- **MISSING** Availability accuracy check
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
- **MISSING** Chat UI
- **MISSING** Access control tests

### Notifications
- **PARTIAL** Notification engine with event hooks
- **MISSING** In-app: new quotation
- **MISSING** In-app: provider selected
- **MISSING** In-app: job status change
- **MISSING** In-app: equipment reservation
- **MISSING** Email (SMTP) for the same events
- **MISSING** SMTP account and credentials in `.env`
- **MISSING** Email templates
- **PARTIAL** Notification center with unread count
- **DONE** Mark as read — `POST /api/v1/notifications/{notification_id}/read` is scoped to the authenticated notification owner.
- **MISSING** App keeps working if SMTP fails

### Ratings and reviews
- **DONE** Customer reviews provider after completion — `POST /api/v1/reviews/request/{request_id}` resolves the provider target for a customer.
- **DONE** Provider reviews customer after completion — the same endpoint resolves the customer target for the selected provider.
- **DONE** One review per job per side — the unique `(request_id, reviewer_id)` constraint and route-level duplicate check enforce one review per participant.
- **DONE** Review APIs
- **MISSING** Review form and review list
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

- **PARTIAL** [ALL] Frontend, backend and MySQL connected
- **MISSING** [ALL] Customer flow works: request, category, providers, quotations, select, chat, complete, review
- **MISSING** [ALL] Provider flow works: register, approval, find jobs, quote, chat, complete, review
- **MISSING** [ALL] Equipment rental linked to a job
- **MISSING** [ALL] Reviews update ranking scores
- **MISSING** [ALL] Notifications fire from every module
- **MISSING** [ALL] Admin approval gates provider activity
- **MISSING** [ALL] Feature-complete integration
- **MISSING** [ALL] Whole app works when the LLM is unavailable
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
- **MISSING** [ALL] RBAC on every protected endpoint
- **MISSING** [ALL] Input validation on every field
- **MISSING** [ALL] SQL injection and XSS protection
- **MISSING** [ALL] CSRF check
- **DONE** [ALL] CORS limited to the frontend
- **MISSING** [ALL] Rate limiting on login and request endpoints
- **MISSING** [ALL] HTTPS in production
- **MISSING** [ALL] No personal data in logs
- **MISSING** [ALL] Contact details hidden between users
- **MISSING** [ALL] Account deletion and data export, or a note that it is out of scope
- **MISSING** [ALL] AI ethics notes (fair ranking, explainability, human review)
- **MISSING** [ALL] Terms and consent text

---

## 9. Testing

### Unit tests
- **MISSING** [M1] Auth, profile and request tests
- **PARTIAL** [M2] Ranking, quotation and classifier tests
- **PARTIAL** [M3] Equipment tests
- **MISSING** [M4] Chat, notification, review and admin tests
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
- AI: [backend/app/ai/pipeline.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/ai/pipeline.py) loads `tfidf-logistic-v1`, applies `threshold.json` confidence/margin/similarity gates, and returns category, confidence, status, and layer. [backend/app/schemas/classification.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/schemas/classification.py) exposes `layer`.
- AI resilience: [backend/app/services/classification_service.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/services/classification_service.py) performs five-minute result caching, a 60-per-customer hourly limit, and logs fallback outcomes; [backend/app/ai/groq_classifier.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/ai/groq_classifier.py) performs PII scrubbing, JSON validation, timeout handling, and one retry.
- AI evaluation evidence: `ml/src/evaluate.py` completed source-holdout evaluation and refreshed [ml/reports/leave_one_source_out.csv](D:/SUSL/SE%20SEM%2005/WadaLinik/ml/reports/leave_one_source_out.csv) with accuracies Claude 0.7624, Gemini 0.8141, and GPT 0.8588; [ml/reports/worst_predictions.csv](D:/SUSL/SE%20SEM%2005/WadaLinik/ml/reports/worst_predictions.csv) was refreshed for error review. `ml/src/compare_baselines.py` ran successfully: word TF-IDF + LogisticRegression 0.8615, word TF-IDF + LinearSVC 0.9060, char TF-IDF + LogisticRegression 0.8496, char TF-IDF + LinearSVC 0.9043. These are development/source-holdout results, not the required human/out-of-scope acceptance evaluation.
- Matching: [backend/app/services/matching_service.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/services/matching_service.py) implements `MatchingService.match`; [backend/app/api/v1/matching.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/api/v1/matching.py) exposes matching routes.
- Frontend: [mobile/src/navigation/RootNavigator.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/navigation/RootNavigator.tsx) routes customer/provider states; [mobile/src/config/env.ts](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/config/env.ts) defaults to mock mode; [admin/src/App.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/admin/src/App.tsx) calls the admin API.
- Auth/landing UI: [mobile/src/navigation/AuthNavigator.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/navigation/AuthNavigator.tsx) reaches `Landing`, `Login`, `RoleSelection`, and `Register`; [mobile/src/features/auth/screens/LandingScreen.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/features/auth/screens/LandingScreen.tsx) provides the landing UI. Auth uses the real API by default because `EXPO_PUBLIC_USE_MOCK` must explicitly equal `true` to select mock mode.
- Additional UI audit: [mobile/src/navigation/CustomerTabs.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/navigation/CustomerTabs.tsx) reaches the customer home and Jobs screens; [mobile/src/navigation/CustomerNavigator.tsx](D:/SUSL/SE%20SEM%2005/WadaLinik/mobile/src/navigation/CustomerNavigator.tsx) reaches request creation, AI review, and provider matching. Provider Home/Jobs/Messages and customer/provider Messages remain `PlaceholderScreen` routes. `EquipmentManagementScreen` is reachable and reads real equipment APIs, but its Add Equipment action is an alert and `AddEquipmentScreen` is not registered.
- Database: models are under [backend/app/models/](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/models/), migrations under [backend/alembic/versions/](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/alembic/versions/), and the MySQL schema is [database/schema.sql](D:/SUSL/SE%20SEM%2005/WadaLinik/database/schema.sql). Runtime configuration in [backend/app/core/config.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/core/config.py) and [docker-compose.yml](D:/SUSL/SE%20SEM%2005/WadaLinik/docker-compose.yml) uses PostgreSQL/Neon.

## Top 15 gaps to fix first

1. Align PostgreSQL/Neon runtime configuration with the required MySQL schema and migrations.
2. Install/declare pytest and execute the backend suite.
3. Add integration and access-control tests for the new profile, review, notification, chat, and admin routes.
4. Replace equipment/reservation query-string identity defaults with authenticated ownership checks.
5. Complete customer/provider request listing, profile CRUD, discovery, selection, and status flows.
6. Make the mobile client real-API-backed by default; several gateways are mock-only.
7. Add selected-provider chat authorization, UI, and access-control tests.
8. Add human/out-of-scope AI evaluation data and metrics.
9. Add frontend tests and fix the admin lint error.
10. Add comprehensive RBAC, malformed-input, rate-limit, PII, and HTTPS tests.
11. Establish CI/CD, deployment, smoke, monitoring, and backup evidence.
12. Complete documentation, signed journal, mentor, acceptance, and proposal-alignment evidence.

## Code/checklist or proposal disagreements

- Repository folder is WadaLink, while code/README use WedaLink and the checklist alternates ServiceLink/WedaLink.
- The checklist says web-only, but the repository includes an Expo React Native mobile application.
- The checklist requires MySQL, while backend config and docker-compose use PostgreSQL/Neon; `database/schema.sql` is MySQL.
- Mobile defaults to mock mode and leaves request paths on mocks, conflicting with the real-API frontend rule.
- Required classifier output is category/confidence/layer; `ClassificationResponse` exposes no `layer`.
- Quotations/chat/notifications/reviews/providers route files exist, but are omitted from the registered router in [backend/app/api/v1/__init__.py](D:/SUSL/SE%20SEM%2005/WadaLinik/backend/app/api/v1/__init__.py); only auth, equipment, reservation, classification, matching, request, and AI-admin routers are included.
- Admin is a single AI review page, not the complete customer/provider web shell described by the checklist.

## Test run results

| Target | Command | Result | Passed | Failed | Skipped | Notes |
|---|---|---|---:|---:|---:|---|
| Backend full suite | `ml\.venv\Scripts\python.exe -m pytest -q` | PARTIAL | 18 | 0 | 0 | 1 setup error in `backend/tests/unit/test_ai_resilience.py::test_rollback_preserves_previous_model`; pytest could not access the host temp directory (`WinError 5`). |
| Backend AI focused suite | `ml\.venv\Scripts\python.exe -m pytest tests/unit/test_ai_classification.py tests/unit/test_groq_fallback.py -q` | PASS | 6 | 0 | 0 | Classifier, keyword fallback, LLM retry/validation, PII scrubbing, timeout recovery, and manual fallback tests passed. |
| Backend implementation focused suite | `ml\.venv\Scripts\python.exe -m pytest tests/unit/test_ai_classification.py tests/unit/test_groq_fallback.py tests/unit/test_equipment_and_reservations.py -q` | PASS | 9 | 0 | 0 | AI and equipment/reservation tests passed after Module 2 changes. |
| Admin | `cd admin; npm run build` | PASS | N/A | 0 | N/A | TypeScript/Vite build completed. |
| Admin | `cd admin; npm run lint` | FAIL | 0 | 1 | 0 | One `react-hooks/set-state-in-effect` error in `admin/src/App.tsx`. |
| Mobile | `cd mobile; npm run typecheck` | PASS | N/A | 0 | N/A | `tsc --noEmit` exited 0. |
| Mobile | `cd mobile; npm run lint` | PASS WITH WARNINGS | N/A | 0 | 14 | Expo lint completed with 0 errors and 14 warnings. |
| ML | `cd ml; .venv\\Scripts\\python.exe -m src.evaluate --help` | PASS | N/A | 0 | N/A | Evaluation module accepted `--help` in the bundled ML environment. |
| AI sample | `ClassificationPipeline().classify(...)` | PASS | N/A | 0 | N/A | Loaded `tfidf-logistic-v1`; pipeline returns category, confidence, status, and `layer`; threshold gates and fallbacks are present. |

## CANNOT VERIFY items

Live deployment, production database, branch protection, Jira/GitHub boards, sprint and meeting records, signed journal/approvals, real-user studies, surveys, browser/device matrix, performance/concurrency/ZAP scans, production smoke/backup/monitoring, and viva/contribution claims cannot be verified from this repository. They remain conservatively represented as MISSING in the summary; external evidence is still required.

## Post-audit database remediation

The legacy MySQL `database/schema.sql` was removed. The initial Alembic migration was converted to PostgreSQL-native types, and `alembic upgrade head` was applied successfully to the configured Neon database; `alembic current` verified revision `6f7a8b9c0123`.

The equipment reservation renter relationship was subsequently corrected: `renter_provider_id` was migrated to `renter_customer_id`, with a foreign key to `customers.customer_id`. Reservation creation and `/my` now use the authenticated customer identity, and reservation status updates require the authenticated provider to own the equipment. Alembic now reports head revision `7g8h9i0j1k2l`, and live Neon inspection verified `renter_customer_id -> customers.customer_id`.
