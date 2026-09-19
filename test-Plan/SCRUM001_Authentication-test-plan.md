# SCRUM001 — Authentication Test Plan

Module: Authentication
Ticket: SCRUM001
Application: OrangeHRM demo — https://opensource-demo.orangehrmlive.com

Purpose
- Define manual and automated test cases for login, logout, session handling, and input validation for Admin, ESS and Manager personas.

Scope
- In-scope: Login happy path, invalid credentials, empty-field validation, logout behavior, direct-URL protection, session/back-button behavior, SQL-injection style negative tests.
- Out-of-scope: User provisioning flows (except test data setup), complex SSO, performance and accessibility testing (separate tracks).

Test Data
- Admin: username `Admin`, password `admin123` (demo site)
- ESS / Manager: create via Admin UI or an API fixture; tests should isolate and clean up test users when created.
- Edge inputs: very long strings (>1024 chars), common SQL-injection payloads (e.g., `' OR '1'='1`), special characters, whitespace-only values.

Test Environment
- Base URL: https://opensource-demo.orangehrmlive.com
- Browser: Chrome (Playwright project `chrome`) and a headless run for CI.
- Test accounts: use environment variables for credentials in `.env` or `test-data/users.data.js`.

Test Cases (Automatable)

SCRUM001-01 — Admin Login (Happy path)
- Preconditions: none
- Steps:
	1. Navigate to `/web/index.php/auth/login`
	2. Enter username `Admin` and password `admin123`
	3. Click Login
- Expected:
	- Redirect to `/web/index.php/dashboard/index`
	- Dashboard main widgets visible
	- Logged-in user's name shown in header
	- Authentication tokens/cookies or localStorage present

SCRUM001-02 — Invalid credentials (Negative)
- Preconditions: none
- Steps:
	1. Navigate to login
	2. Enter valid username and wrong password
	3. Click Login
- Expected:
	- Visible error alert `.oxd-alert-content-text` with `Invalid credentials`
	- No navigation to dashboard
	- No authenticated storage created

SCRUM001-03 — Empty-field validation (Negative)
- Steps:
	1. Submit login with empty username
	2. Submit login with empty password
	3. Submit login with both fields empty
- Expected:
	- Inline validation messages (e.g., `Required`) displayed near fields

SCRUM001-04 — Logout and session clearing
- Preconditions: user logged in
- Steps:
	1. Open user dropdown (`.oxd-userdropdown-tab`)
	2. Click Logout
	3. Attempt back navigation and direct dashboard access
- Expected:
	- Redirect to login
	- Local/session storage and auth cookies cleared
	- Direct access to `/web/index.php/dashboard/index` redirects to login

SCRUM001-05 — Session persistence across tabs and back-button behavior
- Preconditions: user logged in
- Steps:
	1. Open a second tab to the application while logged in
	2. Log out in the first tab
	3. Interact with the second tab (refresh / navigate)
- Expected:
	- Second tab sees session invalidated after refresh or protected navigation
	- Back-button after logout does not expose authenticated content

SCRUM001-06 — Unauthorized direct URL access (Negative)
- Steps:
	1. Open incognito/private window
	2. Navigate directly to protected route (e.g., `/web/index.php/pim/viewEmployeeList`)
- Expected:
	- Redirect to login page

SCRUM001-07 — SQL-injection-style input rejection (Negative)
- Steps:
	1. Enter payloads like `' OR '1'='1`, `--`, `; DROP TABLE users;` in username/password
	2. Submit login
- Expected:
	- Application returns a safe `Invalid credentials` response
	- No stack traces, DB errors, or sensitive info exposed in DOM

Edge Cases & Security Checks
- Very long inputs should be handled safely (truncated/validated) and not cause server errors.
- Special character inputs shouldn't cause script injection or XSS.
- Login rate-limit behavior: repeated failed attempts should not reveal internal error details.

Automation Notes
- Reuse Page Objects: `Pages/BasePage.js`, `Pages/LoginPage.js`.
- Fixtures: `fixtures/auth.fixture.js` to centralize login and optionally persist `storageState` for session reuse.
- Test data: centralize credentials in `test-data/users.data.js` and prefer env vars for secrets.
- Isolation: tests should run independently — use `beforeEach` and `afterEach` to prepare/cleanup state.
- SQL-injection tests should be negative-only and not attempt destructive actions.

Traceability
- Map each automated spec to the test IDs above (e.g., `tests/auth/SCRUM001_Authentication-login.spec.js` covers SCRUM001-01..07).

Cleanup & Data Handling
- Tests that create users or modify data must clean up in `afterAll` or via API teardown.
- Do not commit real secrets to the repo; use CI secrets or local `.env` excluded from git.

Acceptance Criteria for Automation
- All automatable tests pass locally in headed and headless runs.
- Tests included in PR with clear mapping to test plan IDs.
- No hardcoded secrets; credentials read from env or `test-data` with placeholders.

File: test-Plan/SCRUM001_Authentication-test-plan.md
