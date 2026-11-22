# ServiceLink / WedaLink - Complete Project Checklist (whole scope)

## Audit status — 2026-11-22

Checked against implementation code (backend app, models, services, routers, migrations, mobile/admin source, and ML source). `[x]` = implemented in code; `[~]` = partially implemented or has a material gap; `[ ]` = no sufficient implementation evidence, intentionally left unchanged. README claims and test-file presence alone were not treated as completion.

Based on the proposal (Group 12). Nothing is ticked: change `[ ]` to `[x]` yourself.
AI work is one sub-category (section 3D) inside Module 2, not the centre of the project.

Owners: **[M1]** Pushpakumara | **[M2]** Muthunayaka | **[M3]** Rideemahaliyadda | **[M4]** Alahakoon | **[ALL]** everyone

---

## 0. Decisions to lock

- [ ] [ALL] Final project name (ServiceLink or WedaLink), used everywhere
- [ ] [ALL] Web app only (no mobile app)
- [ ] [ALL] Confirm out of scope: payments, document verification, advanced analytics, push notifications
- [x] [ALL] Backend framework: FastAPI
- [ ] [ALL] Deployment target (AWS or Railway)
- [ ] [ALL] Real weekly timeline and final deadlines (proposal 12 weeks, journal 15 weeks)
- [ ] [ALL] Job status list and the flow between statuses
- [ ] [ALL] Final REST API contract
- [ ] [ALL] Final MySQL schema
- [ ] [ALL] Language of the platform (English only)

---

## 1. Project foundation

### Repository
- [ ] [M2] Branches: main, develop, feature/*, bugfix/*
- [ ] [M2] Protect `main`
- [ ] [M2] `.gitignore` (env files, model files, node_modules, venv)
- [ ] [M2] No secrets in Git history
- [ ] [M2] `.env.example` for backend and frontend
- [ ] [M2] Root README (what it is, stack, how to run)
- [ ] [M2] Contributing guide and PR template
- [ ] [ALL] Everyone can clone and run the project locally

### Project management
- [ ] [ALL] Jira board matches the real work (epics, tasks, owners)
- [ ] [ALL] Sprint dates correct
- [ ] [ALL] GitHub Projects board added, or note that Jira replaces it
- [ ] [ALL] Daily merges into `develop`
- [ ] [ALL] Sprint review and retrospective every sprint
- [ ] [ALL] Weekly meeting notes saved
- [ ] [ALL] Mentor and supervisor meetings recorded

### Shared frontend shell
- [ ] [ALL] Vite + React + Redux + Tailwind set up
- [ ] [ALL] Routing
- [ ] [ALL] Layout (header, sidebar, footer)
- [ ] [ALL] Auth guard for protected pages
- [ ] [ALL] Role-based route guard (customer, provider, admin)
- [ ] [ALL] Shared components (button, input, modal, table, toast)
- [ ] [ALL] API client with token handling
- [ ] [ALL] 404 and error pages
- [ ] [ALL] Final UI follows the Google Stitch designs

### Shared backend base
- [x] [ALL] FastAPI project structure (routers, services, models, schemas)
- [x] [ALL] SQLAlchemy and MySQL connection
- [x] [ALL] Migrations
- [ ] [ALL] Standard error response format
- [x] [ALL] Request validation with schemas
- [ ] [ALL] Logging
- [x] [ALL] CORS settings
- [x] [ALL] Swagger/OpenAPI docs enabled

---

## 2. Module 1 - Users and service requests [M1]

### Database
- [x] `users`
- [x] `customers`
- [~] `providers` (skills, categories, experience, location, approval status)
- [x] `service_requests` (description, location, urgency, category, status)
- [x] `service_categories`
- [ ] Seed the 24 categories and subcategories
- [x] Indexes on search columns

### Backend
- [x] Customer registration
- [x] Provider registration
- [x] Login with JWT
- [x] Password hashing
- [x] Role-based access control
- [x] Token expiry handling
- [ ] Customer profile CRUD
- [ ] Provider profile CRUD
- [x] Provider approval status in the profile
- [x] Create service request
- [ ] List and view own requests
- [x] Update request status
- [x] Cancel a request
- [ ] Provider job discovery (open requests in the provider's categories)
- [x] Customer selects a provider
- [x] Job status tracking to completion

### Frontend
- [ ] Customer registration page
- [ ] Provider registration page
- [ ] Login and logout
- [ ] Customer profile page
- [ ] Provider profile page
- [ ] Provider approval status view
- [ ] Service request form (description, location, urgency)
- [ ] My requests list
- [ ] Request detail and status page
- [ ] Provider job discovery page
- [ ] Provider job dashboard (my jobs and status)
- [ ] Loading, empty and error states
- [ ] Responsive layout

---

## 3. Module 2 - Quotations, ranking and AI [M2]

### 3A. Quotations
- [x] `quotations` table
- [x] Provider submits a quotation (price, availability, notes)
- [x] Block duplicate quotations from the same provider
- [x] Customer views quotations for a request
- [ ] Customer compares quotations
- [ ] Quotation submission form
- [ ] Quotation comparison view
- [ ] Notification on a new quotation

### 3B. Provider ranking engine
- [x] `provider_scores` table
- [x] Rating score
- [x] Price score
- [x] Experience / jobs completed score
- [x] Distance score
- [x] Response time score
- [x] Normalise all factors to one scale
- [ ] Weights stored in config and visible
- [x] Weighted total score
- [ ] Handle missing data (no rating, no price, no location)
- [ ] Only approved providers in the matching category
- [x] Matching pipeline (request, category, providers, ranked list)
- [x] Ranking API returns score and per-factor breakdown
- [ ] Price-only baseline for comparison
- [ ] Track provider response time
- [ ] Update ratings and job counts after each job

### 3C. Ranking frontend
- [ ] Ranked provider list
- [ ] Expandable score breakdown
- [ ] "Why this provider?" explanation view
- [ ] Select provider button
- [ ] Mobile layout check

### 3D. AI request classification (sub-category)
- [ ] Cleaned dataset final (`data_clean.csv`), duplicates and flagged labels resolved
- [ ] Human test set and out-of-scope test set final and untouched
- [~] Final TF-IDF + Logistic Regression model trained and saved
- [ ] Threshold, margin and similarity check chosen
- [ ] `other` class handled
- [x] Classifier interface returns category, confidence, layer
- [x] Keyword matcher fallback
- [~] LLM fallback (JSON prompt, category list from database, validation, timeout, one retry)
- [ ] Cache and rate limit for LLM calls
- [x] Remove phone numbers and addresses before the LLM call
- [ ] "User picks a category" last fallback
- [ ] AI result screen with "Not right? Change" button
- [ ] Low-confidence screen and "service not available yet" screen
- [x] `classification_log` table and logging every request
- [x] Staging table `llm_labeled_requests` with approval rules
- [x] Admin page to review staged groups
- [ ] `category_proposals` table and provider proposal form
- [~] Manual `retrain.py` with versioning and rollback
- [ ] Unit tests for the classifier, LLM wrapper and fallbacks
- [ ] Evaluation: accuracy, precision, recall, F1, confusion matrix on the human test set
- [ ] Evaluation: model vs LLM vs keyword vs combined, layer percentages, out-of-scope accuracy
- [~] Marketplace keeps working when the AI layer is down

---

## 4. Module 3 - Equipment rental [M3]

### Database
- [x] `equipment`
- [x] `equipment_reservations`
- [ ] Status field (Available, Reserved, Returned)

### Backend
- [x] Add equipment
- [x] Edit and delete equipment
- [x] List and search equipment (name, category, availability)
- [x] Reserve equipment with dates
- [x] Date conflict and double-booking check
- [~] Database transaction for every status change
- [ ] Available to Reserved
- [ ] Reserved to Returned
- [x] Block invalid status changes
- [ ] Rental history per provider
- [x] Link a reservation to a service job
- [ ] Late-return rule (notification or penalty, decide)
- [ ] Notification on reservation and return

### Frontend
- [ ] Equipment listing form
- [ ] My equipment page
- [ ] Browse and search page
- [ ] Equipment detail page
- [ ] Reservation form
- [ ] My reservations with status
- [ ] Return confirmation
- [ ] Rental history view
- [ ] Loading, empty and error states

### Tests
- [ ] Status lifecycle unit tests
- [ ] Two providers booking the same item (concurrency)
- [ ] Availability accuracy check
- [ ] End-to-end rental test

---

## 5. Module 4 - Chat, notifications, reviews and admin [M4]

### Database
- [x] `messages`
- [x] `notifications`
- [x] `reviews`
- [x] `admin_logs`

### Job-scoped chat
- [ ] Chat opens only after a provider is selected
- [ ] Only the customer and the selected provider can access it
- [x] Send and fetch message APIs
- [x] Real-time delivery (WebSocket or polling)
- [ ] Hide personal contact details
- [ ] Chat UI
- [ ] Access control tests

### Notifications
- [~] Notification engine with event hooks
- [ ] In-app: new quotation
- [ ] In-app: provider selected
- [ ] In-app: job status change
- [ ] In-app: equipment reservation
- [ ] Email (SMTP) for the same events
- [ ] SMTP account and credentials in `.env`
- [ ] Email templates
- [~] Notification center with unread count
- [ ] Mark as read
- [ ] App keeps working if SMTP fails

### Ratings and reviews
- [ ] Customer reviews provider after completion
- [ ] Provider reviews customer after completion
- [ ] One review per job per side
- [x] Review APIs
- [ ] Review form and review list
- [x] Average rating feeds into ranking

### Admin
- [x] Approve or reject provider registration
- [ ] Moderate service and equipment listings
- [ ] Activity stats (active jobs, pending approvals)
- [ ] Admin dashboard
- [ ] Provider approval queue
- [ ] Listing moderation page
- [x] Log admin actions
- [ ] Seed the first admin account

---

## 6. Integration

- [~] [ALL] Frontend, backend and MySQL connected
- [ ] [ALL] Customer flow works: request, category, providers, quotations, select, chat, complete, review
- [ ] [ALL] Provider flow works: register, approval, find jobs, quote, chat, complete, review
- [ ] [ALL] Equipment rental linked to a job
- [ ] [ALL] Reviews update ranking scores
- [ ] [ALL] Notifications fire from every module
- [ ] [ALL] Admin approval gates provider activity
- [ ] [ALL] Feature-complete integration
- [ ] [ALL] Whole app works when the LLM is unavailable
- [ ] [ALL] Shared seed script with demo data

---

## 7. Non-functional requirements

- [ ] [ALL] Performance: classification under 3 s, ranking under 2 s, rental under 2 s
- [ ] [ALL] Usability: simple flows for non-technical users, services and rental clearly separate
- [ ] [ALL] Reliability: core features work without the AI layer
- [x] [ALL] Maintainability: AI layer separate from business logic
- [ ] [ALL] Scalability: schema and API support growth
- [ ] [ALL] Availability: no crash under normal use
- [ ] [ALL] Accessibility check (labels, contrast, keyboard)
- [~] [ALL] Responsive on desktop and mobile browsers

---

## 8. Security and privacy

- [x] [ALL] Passwords hashed, never logged
- [ ] [ALL] Secrets only in environment variables
- [ ] [ALL] RBAC on every protected endpoint
- [ ] [ALL] Input validation on every field
- [ ] [ALL] SQL injection and XSS protection
- [ ] [ALL] CSRF check
- [x] [ALL] CORS limited to the frontend
- [ ] [ALL] Rate limiting on login and request endpoints
- [ ] [ALL] HTTPS in production
- [ ] [ALL] No personal data in logs
- [ ] [ALL] Contact details hidden between users
- [ ] [ALL] Account deletion and data export, or a note that it is out of scope
- [ ] [ALL] AI ethics notes (fair ranking, explainability, human review)
- [ ] [ALL] Terms and consent text

---

## 9. Testing

### Unit tests
- [ ] [M1] Auth, profile and request tests
- [~] [M2] Ranking, quotation and classifier tests
- [~] [M3] Equipment tests
- [ ] [M4] Chat, notification, review and admin tests
- [~] [ALL] API tests (PyTest and Postman collection)
- [ ] [ALL] Frontend component tests

### Integration tests
- [ ] [ALL] Classification to ranking
- [ ] [ALL] Ranking to frontend
- [ ] [ALL] Rental module to provider profile
- [ ] [ALL] Database CRUD and transactions
- [ ] [ALL] Auth middleware

### System tests
- [ ] [ALL] Customer journey
- [ ] [ALL] Provider journey
- [ ] [ALL] Admin journey
- [ ] [ALL] Desktop, tablet and mobile
- [ ] [ALL] Browser check (Chrome, Firefox, Edge)
- [ ] [ALL] Final regression test

### Performance and security tests
- [ ] [ALL] Response time targets
- [ ] [ALL] 50 concurrent users (JMeter or k6)
- [ ] [ALL] Database queries under 500 ms
- [ ] [ALL] Seed large data and test (or state the tested size)
- [ ] [ALL] OWASP ZAP scan
- [ ] [ALL] Malformed input and access control tests
- [ ] [ALL] Rate-limit test

### Evaluation
- [ ] [M2] Classification evaluation (see 3D)
- [ ] [M2] Ranking evaluation: NDCG@5, NDCG@10, MRR, diversity
- [ ] [M2] Weighted ranking beats price-only sorting
- [ ] [M3] Rental evaluation: availability accuracy, checkout time, return handling
- [ ] [ALL] Save all evidence (logs, screenshots, reports)

### User acceptance
- [ ] [ALL] Alpha test by the team
- [ ] [ALL] Beta test with 10-15 users for 2 weeks
- [ ] [ALL] Survey with 30+ users
- [ ] [ALL] Satisfaction above 4.0 out of 5.0
- [ ] [ALL] Fix the issues found and record them

---

## 10. CI/CD and deployment

- [ ] [ALL] GitHub Actions: lint, tests, build
- [ ] [ALL] Tests must pass before merge
- [x] [ALL] Dockerfiles (optional)
- [ ] [ALL] Production database
- [ ] [ALL] Production environment variables and secrets
- [ ] [ALL] Deploy backend
- [ ] [ALL] Deploy frontend
- [ ] [ALL] Deploy model files (not in Git)
- [ ] [ALL] LLM key and SMTP configured in production
- [ ] [ALL] HTTPS
- [ ] [ALL] Production smoke test
- [ ] [ALL] Basic monitoring and error logs
- [ ] [ALL] Database backup before the demo
- [ ] [ALL] Backup demo plan (local copy and recorded video)

---

## 11. Documentation and final deliverables

- [ ] [ALL] Software Requirements Specification
- [ ] [ALL] System architecture diagram
- [ ] [ALL] ER diagram
- [ ] [ALL] Use case diagram
- [ ] [M2] Sequence diagrams (classification and ranking)
- [x] [ALL] API documentation (Swagger)
- [ ] [ALL] User manual and admin manual
- [ ] [ALL] Setup and run guide
- [ ] [ALL] Test report with evidence
- [ ] [ALL] Final report
- [ ] [ALL] Presentation slides
- [ ] [ALL] Demo script and scenarios
- [ ] [ALL] Viva preparation (each member explains their own module)
- [ ] [ALL] Individual contribution logs
- [ ] [ALL] Commit history shows each member's work
- [ ] [ALL] Generative AI use disclosure
- [ ] [ALL] References updated

---

## 12. Journal and approvals

- [ ] [M2] Journal Weeks 9 to 15 filled in weekly
- [ ] [M2] Earlier entries match final decisions
- [ ] [M2] Student and mentor signatures and dates every week
- [ ] [M2] Journal shown to mentor and supervisor every 3 weeks
- [ ] [M2] Mentor and supervisor approval sections completed
- [ ] [ALL] Milestones tracked: foundation, core marketplace, non-AI system, intelligent matching, feature complete, tested and deployed, final evaluation ready
- [ ] [ALL] Risks reviewed (scope creep, LLM downtime, free-tier limits, lost time)

---

## 13. Proposal fixes

- [ ] AI wording: change "Gemini Flash classifier" to "own model with LLM fallback" (sections 3, 4, 5, 7, 12)
- [ ] Remove "mobile app" wording (sections 5.7 and 6)
- [ ] Section 14: remove React Native app, push notifications, sandbox payments, maps matching and dispute management
- [ ] Section 10: remove payment, cart, checkout and penalty wording (or add them to scope)
- [ ] Section 10: replace PostgreSQL, Node/Mocha and Django test tools with MySQL, PyTest and FastAPI tools
- [ ] Section 10.2.1.1: fix the "500+ test requests" figure
- [ ] Make deployment consistent (AWS or Railway)
- [ ] Use one project name
- [ ] Update module owner responsibilities if they changed
