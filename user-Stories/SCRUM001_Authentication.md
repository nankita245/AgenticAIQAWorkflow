# OrangeHRM User Stories — Authentication

**Application URL:** `https://opensource-demo.orangehrmlive.com`

**User Credentials:**

| Role | Username | Password |
|---|---|---|
| Admin | `Admin` | `admin123` |
| ESS Employee | (created via Admin > User Management) | (assigned at creation) |
| Manager/Supervisor | (created via Admin > User Management, linked to an employee with subordinates) | (assigned at creation) |

---

## US-AUTH-001: User Login and Authentication

**Title:** Secure User Login to OrangeHRM

**Description:**
As a registered user (Admin, ESS Employee, or Manager), I want to log into the OrangeHRM application using my username and password, so that I can securely access features and data relevant to my role.

**URL:** `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login`

**User Credentials:** Admin, ESS Employee, Manager (see table above)

**Acceptance Criteria:**
- Given a user is on the login page, when valid credentials are entered and the "Login" button is clicked, then the user is redirected to the Dashboard page.
- The page title and URL confirm successful navigation to `/web/index.php/dashboard/index`.
- The top-right user dropdown displays the logged-in user's name.
- Login session persists across page navigation until logout or timeout.
- Login form must reject empty username or password fields with inline validation messages ("Required").

**Business Rules:**
- Only registered, active users can log in.
- Each role (Admin, ESS User, Supervisor/Manager) is granted a different landing experience and menu set post-login.
- Session should expire after a defined period of inactivity (per system configuration).

**Technical Notes:**
- Locators: username field `input[name='username']`, password field `input[name='password']`, submit button `button[type='submit']`.
- Automation should wait for the dashboard's key widget (e.g., "Time at Work") to be visible as a confirmation of successful login rather than relying solely on URL change.
- Credentials should be externalized to a secure config/environment file, not hardcoded in test scripts.
- The agentic framework should support data-driven login tests across multiple role types.

**Definition of Done:**
- [ ] Automated test script validates successful login for Admin, ESS, and Manager roles.
- [ ] Dashboard landing verified post-login.
- [ ] Session token/cookie validated as active.
- [ ] Test passes in CI pipeline across supported browsers.
- [ ] Documentation of test steps and expected results reviewed.

---

## US-AUTH-002: Invalid Login Handling

**Title:** Reject Invalid Login Attempts

**Description:**
As a user, when I enter incorrect credentials, I want the system to reject my login attempt and display a clear error message, so that unauthorized access is prevented and I understand why I could not log in.

**URL:** `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login`

**User Credentials:** Any invalid combination (e.g., `Admin` / `wrongpassword`, blank fields, SQL-injection-style strings)

**Acceptance Criteria:**
- Given invalid credentials are submitted, then the system displays the message "Invalid credentials" without revealing which field (username or password) was incorrect.
- The user remains on the login page and is not granted access to any authenticated route.
- Repeated failed attempts do not crash the application or expose stack traces.
- Directly navigating to an authenticated URL (e.g., `/web/index.php/pim/viewEmployeeList`) without a valid session redirects the user back to the login page.

**Business Rules:**
- Error messages must not disclose whether the username or password specifically was wrong (security best practice).
- No account lockout is required for the demo instance, but the behavior should be documented if implemented in a production-like environment.

**Technical Notes:**
- Automation should verify the error message element (`.oxd-alert-content-text`) text content exactly matches expected copy.
- Include negative test cases: empty username, empty password, both empty, special characters/injection strings.
- Verify no sensitive information (stack traces, SQL errors) appears in the DOM or network response.

**Definition of Done:**
- [ ] Negative test cases scripted and passing for all invalid input combinations.
- [ ] Error message content and visibility verified.
- [ ] Unauthorized direct URL access redirect verified.
- [ ] Security review of error message wording completed.

---

## US-AUTH-003: User Logout

**Title:** Secure User Logout

**Description:**
As a logged-in user, I want to log out of the application, so that my session is terminated and unauthorized users cannot access my account on a shared device.

**URL:** `https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index` (logout action triggered from user dropdown menu)

**User Credentials:** Any authenticated user (Admin, ESS, Manager)

**Acceptance Criteria:**
- Given a user is logged in, when they click their profile icon and select "Logout," then they are redirected to the login page.
- After logout, attempting to navigate back using the browser back button does not restore the authenticated session.
- Directly accessing any protected URL post-logout redirects to the login screen.

**Business Rules:**
- Logout must fully invalidate the session on both client and server side.
- No cached authenticated pages should be viewable after logout.

**Technical Notes:**
- Locator path: user dropdown `.oxd-userdropdown-tab` → "Logout" menu item.
- Automation should assert session cookies/local storage tokens are cleared or invalidated post-logout.
- Test both explicit logout and session-timeout scenarios if feasible.

**Definition of Done:**
- [ ] Logout flow automated and verified across all role types.
- [ ] Session invalidation confirmed (cookie/storage check).
- [ ] Back-navigation and direct URL access post-logout verified as blocked.