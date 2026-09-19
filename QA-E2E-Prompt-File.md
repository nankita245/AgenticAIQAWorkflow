# End-to-End Agentic AI QA Workflow with AI Agents, MCP & Playwright

## End-to-End QA Workflow with Natural Language

### Workflow Overview

The workflow demonstrates an end-to-end QA process using natural language, MCP, Playwright, and AI agents, generating tests in a **Page Object Model** architecture with reusable **fixtures**, **authentication handling**, and **centralized test data** — scaling cleanly as new user stories arrive over time.

The workflow consists of the following steps:

1. Read User Story
2. Create Test Plan
3. Perform Exploratory Testing
4. Generate Automation Scripts (Page Object + Fixture + Test Data + Spec File)
5. Execute and Heal Automation Tests
6. Create Test Report
7. Open Pull Request for Review (no direct push to default branch)

---

### ⚙️ RUN CONFIGURATION — set this once per story, at the very top of your prompt

```
TICKET-ID: <fill in, e.g. SCRUM014>
MODULE:    <fill in, must exactly match a Module Name from the registry below>
```

Everything below this point refers back to these two values automatically — `{TICKET-ID}` and `{Module}` are NOT re-typed anywhere else. When you start a new story, you only ever change this one block, then paste the "Single Combined Prompt" at the bottom as-is.

---

### 📋 Module Registry — fixed list, do not invent new module names

The agent must match `MODULE` against this table exactly (case-sensitive). If a story genuinely doesn't fit any existing module, STOP and ask before creating a new row/folder — do not silently create a new module name that's a slight variant of an existing one (e.g., "Leave" vs "LeaveManagement" vs "Leaves" must never coexist).

| Module Name | Folder (`tests/`) | Page Object (`pages/`) | Test Data (`test-data/`) |
|---|---|---|---|
| Authentication | `tests/auth/` | `pages/LoginPage.js`, `pages/DashboardPage.js` | `test-data/users.data.js` |
| PIM | `tests/pim/` | `pages/PIMPage.js` | `test-data/employee.data.js` |
| Leave | `tests/leave/` | `pages/LeavePage.js` | `test-data/leave.data.js` |
| Attendance | `tests/attendance/` | `pages/AttendancePage.js` | `test-data/attendance.data.js` |
| Admin | `tests/admin/` | `pages/AdminPage.js` | `test-data/admin.data.js` |
| Dashboard | `tests/dashboard/` | `pages/DashboardPage.js` | `test-data/dashboard.data.js` |
| Profile | `tests/profile/` | `pages/ProfilePage.js` | `test-data/profile.data.js` |

> Update this table (add a row) only when a genuinely new module is introduced — this is a one-time edit to the prompt file itself, not something you redo per story.

---

### 🛡️ Quality & Safety Rules — apply throughout every step, not just where mentioned

These rules exist to reduce hallucinated locators, flaky tests, and unreviewed commits reaching your repo. They are non-negotiable, not suggestions.

1. **Never report a test as passing without actually executing it.** Every PASS/FAIL claim in Step 5 or the Step 6 report must come from a real Playwright run via the MCP browser tools — not from reasoning about what "should" happen. If a tool call to run tests fails or is skipped, say so explicitly rather than reporting a result.

2. **Verify every locator against the live DOM before finalizing it in a Page Object.** During Step 3 (exploratory testing) and Step 4 (script generation), locators must be confirmed by actually interacting with the element via Playwright browser tools — not guessed from convention or prior training data. If a selector cannot be verified live, flag it explicitly as unverified rather than silently including it.

3. **Prefer API-based setup over UI-based setup for test data.** When OrangeHRM exposes a usable path (REST API, or a faster UI flow than the one under test), use it to create prerequisite data (e.g., an existing employee for a "delete employee" test). Reserve full UI-driven creation for the specific story that is testing that creation flow itself. This keeps tests faster and less flaky.

4. **Every test that creates data must clean it up.** Any spec file that creates disposable records (employees, leave requests, system users) must remove them in an `afterEach` or `afterAll` hook, so repeated runs don't accumulate stale data or collide with each other. Do not rely on the demo environment resetting itself.

5. **Distinguish a flaky test from a real bug.** If a test fails intermittently, do not just add a retry and move on. Investigate whether the failure indicates a real timing/race condition in the app or an unreliable wait in the Page Object, document the finding, and only use `test.retry()` / config-level retries as a last resort with a documented reason — never as the default fix.

6. **Do not merge/push directly without review.** See the updated Step 7 — generated code goes into a Pull Request for human review, not a direct push to the default branch.

7. **Never use `git stash`, checkout-from-a-specific-commit-hash, or any "extract files from commit X" trick when preparing the PR branch.** These operations can silently drop files that exist only in the working tree (i.e., files this workflow just created but hasn't committed yet) — which is exactly what causes test plans, spec files, or reports to go missing from a PR. The correct procedure is always: branch from the current tip of the default branch → the files are already sitting in the working tree from Steps 2–6 → stage and commit them directly, with no intermediate stash or historical-commit extraction step. If at any point a stash or reset would be needed, STOP and report the conflict to me instead of resolving it silently.

8. **Verify the commit actually contains every expected file before pushing.** After committing in Step 7, run a diff/status check listing exactly which files are in the commit and compare it against the expected file list for that story (user story, test plan, Page Object, fixtures, test data, spec file, test report). If any expected file is missing from the commit, STOP, do not push, and report which file is missing and why — do not silently open a PR with partial content.

9. **Every test case in the test plan must become an automated test — no silent subset.** Step 4 must generate one `test()` per test scenario listed in the Step 2 test plan, not just the "obvious" happy-path and one negative case. Before finishing Step 4, produce an explicit numbered mapping of test-plan scenario → spec `test()` title, and confirm the counts match exactly. If a specific scenario genuinely cannot be automated (e.g., requires manual visual judgment, or a capability the app/tooling doesn't support), it must be listed explicitly as "not automated" with a stated reason in both the mapping and the Step 6 report — never simply omitted without explanation.

---

### Project Structure Convention (read this before every run)

```
pages/          → One Page Object file per application module (e.g., LoginPage.js, PIMPage.js)
fixtures/       → auth.fixture.js (login/session handling) + test-fixtures.js (injects page objects)
test-data/      → One data file per module (e.g., users.data.js, employee.data.js)
tests/<module>/ → One spec file PER STORY inside the module's folder
user-Stories/   → One markdown file per story: {TICKET-ID}_{Module}.md
test-Plan/      → One test plan per story: {TICKET-ID}_{Module}-test-plan.md
test-results/   → One test report per story: {TICKET-ID}_{Module}-test-report.md
```

**Golden rule:** a module (Auth, PIM, Leave, Attendance, Admin, Dashboard, Profile, etc.) gets **one folder** in `tests/`, `pages/` gets **one page object file** per module, and every new story adds **one new spec file** to the existing module folder — reusing the existing page object, fixtures, and test data rather than duplicating them. Only create new `pages/`, `fixtures/`, or `test-data/` files when the story introduces a module that doesn't exist yet.

---

## STEP 1: Read User Story

### Prompt

I need to start a new end-to-end testing workflow using the RUN CONFIGURATION and MODULE REGISTRY defined at the top of this file.

First, read the user story from the file:

`user-Stories/{TICKET-ID}_{MODULE}.md`

Summarize the key requirements, acceptance criteria, and testing scope. Then:

- Confirm `MODULE` matches an exact row in the Module Registry. If it does not match any row exactly, STOP and ask me before proceeding — do not guess or create a variant module name.
- Using the matched registry row, confirm whether the module's folder in `tests/`, page object in `pages/`, and test data file in `test-data/` already exist — check before assuming anything needs to be created from scratch.

### Expected Output

- Summary of the user story
- List of acceptance criteria
- Application URL and test credentials
- Identified module name
- Confirmation of whether `pages/`, `fixtures/`, `test-data/`, and `tests/<module>/` already exist for this module, or need to be created

---

## STEP 2: Create Test Plan

### Prompt

Based on the user story we just reviewed (using the RUN CONFIGURATION values), use the `playwright-test-planner` agent to:

1. Read the application URL and test credentials from the user story.
2. Explore the application and understand all workflows mentioned in the acceptance criteria.
3. Create a comprehensive test plan that covers all acceptance criteria including:
   - Happy path scenarios
   - Negative scenarios (validation errors, empty fields, invalid data)
   - Edge cases and boundary conditions
   - Navigation flow tests
   - UI element validation
4. Save the test plan as:

`test-Plan/{TICKET-ID}_{MODULE}-test-plan.md`

Ensure each test scenario includes:

- Clear test case title
- Detailed step-by-step instructions
- Expected results for each step
- Test data requirements
- Whether the scenario requires an authenticated session, and which role (Admin/ESS/Manager)

### Expected Output

- Complete test plan Markdown file saved to `test-Plan/`
- Organized test scenarios with clear structure
- Browser exploration screenshots, if needed

---

## STEP 3: Perform Exploratory Testing

### Prompt

Now I need to perform manual exploratory testing using Playwright MCP browser tools.

Please read the test plan from:

`test-Plan/{TICKET-ID}_{MODULE}-test-plan.md`

(resolved automatically from the RUN CONFIGURATION at the top of this file)

Then execute the test scenarios defined in that plan.

1. Use Playwright browser tools to manually execute each test scenario from the plan.
2. Follow the step-by-step instructions in each test case.
3. Verify expected results match actual results.
4. Take screenshots at key steps and error states.
5. Record every stable element selector, locator strategy, and wait behavior discovered — these will be reused when building the Page Object in Step 4. Every locator recorded here must have been confirmed by actually interacting with the element live (click/fill/assert visible) — do not record a selector you inferred from reading the page source without interacting with it.
6. Document your findings:
   - Test execution results for each scenario
   - Any UI inconsistencies or unexpected behaviors
   - Missing validations or bugs discovered
   - Screenshots as evidence

### Expected Output

- Manual test execution results
- Screenshots of the application at various states
- List of observations and findings, including reusable locators
- Any issues discovered during exploration

---

## STEP 4: Generate Automation Scripts (Page Object + Fixture + Test Data + Spec File)

### Prompt

Now I need to create automated test scripts using the `playwright-test-generator` agent, following our Page Object Model architecture.

Please review:

1. Test plan from:

`test-Plan/{TICKET-ID}_{MODULE}-test-plan.md`

2. Exploratory testing results from Step 3, for actual element selectors and UI insights.

3. The Module Registry row matched in Step 1 for `MODULE` — use its exact file paths, do not invent new ones. Before generating anything, check whether the registry's files already exist and **reuse them instead of duplicating**:
   - Page Object path(s) from the registry's "Page Object" column
   - `fixtures/auth.fixture.js` and `fixtures/test-fixtures.js`
   - Test data path from the registry's "Test Data" column
   - Folder from the registry's "Folder" column

Generate or update the following artifacts:

**A. Page Object (registry "Page Object" path, e.g. `pages/{Module}Page.js`)**
- If it doesn't exist, create it extending a shared `pages/BasePage.js` (create `BasePage.js` once, on the first-ever module, with shared helpers like toast/spinner handling).
- If it already exists, add any new locators/methods this story requires — do not create a second page object for the same module.
- Use only stable selectors and wait strategies discovered during exploratory testing (Step 3).

**B. Authentication Fixture (`fixtures/auth.fixture.js`)**
- Create once per project (if it doesn't already exist): handles logging in via the UI for each role (Admin/ESS/Manager) and persists the session via `storageState`, so individual tests don't repeat the login flow.
- If this story needs a role not yet configured, add that role's login handling here rather than writing ad hoc login steps inside the spec file.

**C. Test Fixture (`fixtures/test-fixtures.js`)**
- Create once per project (if it doesn't already exist): extends the base Playwright `test` with one fixture per Page Object.
- If this story's page object is new, register it as a fixture here. If it already exists, leave it untouched.

**D. Test Data (registry "Test Data" path, e.g. `test-data/{module}.data.js`)**
- Create once per module (if it doesn't already exist): centralizes credentials, dynamic dates, and disposable-record factories relevant to this module.
- If this story needs new data (e.g., a new leave type, a new field), add it to the existing file rather than hardcoding values in the spec.
- Where OrangeHRM exposes a faster setup path (API call, or a lighter UI flow than the one under test) for prerequisite data, use it here instead of full UI-driven creation — reserve UI creation for the story that specifically tests that creation flow (see Quality & Safety Rule 3).

**E. Spec File (registry "Folder" path + `/{TICKET-ID}-{short-description}.spec.js`)**
- Always create exactly ONE new spec file per story, named with the ticket ID, inside the module's registry folder.
- The spec file must import from `fixtures/test-fixtures.js` (not raw `@playwright/test`), and pull data from the registry's test-data file, so it contains no hardcoded locators or credentials — only test steps and assertions.
- Each `test()` title must be prefixed with the ticket ID, e.g. `test('{TICKET-ID}: user can log in with valid credentials', ...)`.
- **Cover every test case from the test plan — no silent subset.** Go through `test-Plan/{TICKET-ID}_{MODULE}-test-plan.md` scenario by scenario and generate one `test()` for each one, not just the happy path and a single negative case. After writing the spec file, produce a numbered mapping table: test-plan scenario # → spec `test()` title, and confirm the total counts match (see Quality & Safety Rule 9). If a scenario truly cannot be automated, list it explicitly with a reason — do not just leave it out.
- If this test creates any disposable record (employee, leave request, system user, etc.), it must remove that record in an `afterEach`/`afterAll` hook (see Quality & Safety Rule 4) — do not leave test-created data behind.
- If this is a genuinely new module not yet in the registry: STOP after Step 1 already flagged this — do not reach Step 4 with an unregistered module.

## Requirements for All Generated Code

- Follow Playwright best practices (`expect()` assertions, no hardcoded waits, role-based/text-based locators preferred over brittle CSS where possible).
- Reuse existing fixtures, page objects, and test data before creating new ones.
- Add comments for complex steps.
- Configure for multiple browsers: Chrome, Firefox, and Safari (already handled centrally in `playwright.config.js` — do not duplicate browser config inside spec files).
- After generating/updating the files, run the new spec file to verify it passes.

### Expected Output

- Page Object created or updated (`pages/{Module}Page.js`)
- Authentication fixture created or confirmed existing (`fixtures/auth.fixture.js`)
- Test fixture created or updated (`fixtures/test-fixtures.js`)
- Test data file created or updated (`test-data/{module}.data.js`)
- One new spec file created (`tests/{module}/{TICKET-ID}-{short-description}.spec.js`)
- **A test-plan-to-spec coverage mapping table**, confirming the number of `test()` cases matches the number of test plan scenarios (or lists an explicit reason for each one that doesn't)
- Confirmation of which files were newly created vs. reused/extended
- All generated/updated code follows Playwright best practices

---

## STEP 5: Execute and Heal Automation Tests

### Prompt

Now I need to execute the generated automation scripts and heal any failures using the `playwright-test-healer` agent.

Run the automation scripts scoped to this story's module (not the entire suite, for fast feedback), using the folder from the Module Registry row matched in Step 1:

`tests/{MODULE-folder}/`

For each failing test, use the `playwright-test-healer` agent to:

1. Identify the root cause of the failure.
2. Analyze whether the failure is caused by:
   - Locator issues (in the Page Object, not the spec file)
   - Timing issues
   - Assertion failures
   - Application behavior
   - Test-data issues (in `test-data/`, not hardcoded in the spec)
   - Authentication/session issues (in `fixtures/auth.fixture.js`)
   - Other automation-related problems
3. Fix the issue **in the correct layer** — locator fixes belong in the Page Object, data fixes belong in `test-data/`, auth fixes belong in the auth fixture, and only test-flow/assertion fixes belong in the spec file itself. Do not patch symptoms inside the spec file if the root cause lives in a shared layer.
4. Re-run the affected test. If a test fails intermittently across re-runs (passes sometimes, fails others), do not simply add a retry — investigate whether it's a real timing/race condition in the app or an unreliable wait in the Page Object, and document the root cause found (see Quality & Safety Rule 5). Only apply `test.retry()` as a last resort, with the reason documented in the test report.
5. Repeat the healing process until all tests in this module's folder are stable and passing.
6. Once the module's tests pass, also run the full suite (`tests/`) to confirm no regressions were introduced in other modules that share the same Page Objects or fixtures.
7. Document:
   - Initial test execution results
   - Failures encountered
   - Which layer each fix was applied to (Page Object / fixture / test data / spec)
   - Final test execution results (module scope and full-suite regression check)
   - Any tests that could not be automatically healed

### Expected Output

- Stable and passing automation tests for this story's module
- Confirmation that the full suite still passes (no regressions)
- Initial test failure details
- Healing activities performed, organized by which layer was fixed
- Final test execution results
- Documentation of any tests that could not be automatically healed

---

## STEP 6: Create Test Report

### Prompt

Now I need to create a comprehensive test execution report based on manual testing, automation execution, and healing activities.

Please compile results from:

- Step 3: Manual exploratory testing results
- Step 4: Generated/updated automation artifacts
- Step 5: Automated test execution and healing results (module scope + full-suite regression check)

Structure the report as:

`test-results/{TICKET-ID}_{MODULE}-test-report.md`

(resolved automatically from the RUN CONFIGURATION at the top of this file)

### Include

**1. Executive Summary**
- Total test cases planned
- Test cases executed (manual + automated)
- Overall Pass/Fail/Blocked status

**2. Manual Test Results**
- Results from Step 3 exploratory testing
- Screenshots and observations
- Issues found during manual testing

**3. Automated Test Results**
- Initial automation results from Step 5
- Healing activities performed, and which layer (Page Object/fixture/test-data/spec) each fix touched
- Final module-scope test execution results after healing
- Full-suite regression check result
- Pass/Fail count for each test suite

**4. Artifacts Generated/Modified**
- New or updated Page Object file(s)
- New or updated fixture file(s)
- New or updated test data file(s)
- New spec file

**5. Defects Log**

For any failed tests, manual or automated, include:
- Bug ID
- Severity (Critical/High/Medium/Low)
- Title and Description
- Steps to Reproduce
- Expected vs Actual Behavior
- Screenshots / Evidence
- Environment Details

**6. Test Coverage Analysis**
- **Full test-plan-to-spec traceability table**: every scenario # from the test plan, its spec `test()` title, and PASS/FAIL/Not Automated status. This must account for 100% of the test plan's scenarios — every row present, none silently missing.
- Which acceptance criteria are covered
- Coverage from manual vs automated tests
- Any gaps in test coverage, and the stated reason for each scenario marked "Not Automated"
- Recommendations for additional testing

**7. Summary and Recommendations**
- Overall quality assessment
- Risk areas
- Next steps

### Expected Output

- Comprehensive test execution report covering manual and automated testing
- Clear PASS/FAIL status for all test scenarios
- Clear breakdown of which files were created vs. reused
- Detailed bug reports for failures
- Complete test coverage analysis
- Evidence and screenshots attached

---

## STEP 7: Open Pull Request for Review

### Git Repository URL

`<YOUR_REPO_URL_HERE>`

### Prompt

Now I need to open a Pull Request with all the test artifacts, using the GitHub MCP agent, for human review before anything reaches the default branch.

Git Repository URL:

`<YOUR_REPO_URL_HERE>`

Please perform the following Git operations, in this exact order, with no shortcuts, stashing, or historical-commit extraction:

1. Confirm the local repository is up to date with the remote default branch (fetch/pull latest — do not branch from a stale or arbitrary older commit).
2. Create a new branch from the current tip of the default branch, named `test/{TICKET-ID}-{short-description}`.
3. Confirm, by listing the working tree, that every expected file from Steps 2–6 is physically present on disk right now:
   - `user-Stories/{TICKET-ID}_{MODULE}.md`
   - `test-Plan/{TICKET-ID}_{MODULE}-test-plan.md`
   - The registry's Page Object file(s) (new or updated)
   - `fixtures/auth.fixture.js` and `fixtures/test-fixtures.js` (if new or updated)
   - The registry's test data file (new or updated)
   - `tests/{MODULE-folder}/{TICKET-ID}-{short-description}.spec.js`
   - `test-results/{TICKET-ID}_{MODULE}-test-report.md`

   If any file is missing from disk at this point, STOP and tell me which one — do not attempt to reconstruct it from an older commit or continue without it.
4. Stage exactly the files listed above (plus any other genuinely new/modified files from this story) directly from the working tree — no `git stash`, no `git checkout <commit> -- <path>`, no cherry-picking from prior commits.
5. Create a commit with the message:

`Feat(tests): Add automated test coverage for {TICKET-ID} - {short description}`

The commit should include, as applicable:

- Add user story documentation
- Add/update test plan with all scenarios
- Add/update Page Object for the module
- Add/update shared fixtures (authentication, test-fixtures)
- Add/update test data for the module
- Add new spec file covering `{TICKET-ID}`
- Add test execution report with results

6. **Verify the commit before pushing**: list the files actually included in the commit (e.g., via `git show --stat` or `git diff --name-only` against the branch point) and compare that list against the expected file list in step 3. If anything expected is missing from the commit, STOP — do not push — and tell me what's missing and why.
7. Push the branch to the Git repository.
8. Open a Pull Request against the default branch, titled `Test coverage: {TICKET-ID} - {short description}`, with a description that includes:
   - Summary of the story covered
   - Final test results (module scope + full-suite regression check) from Step 5
   - List of files newly created vs. updated, clearly separated
   - Any locators flagged as unverified (per Quality & Safety Rule 2) or flaky-test findings (per Rule 5), so the human reviewer can look at them specifically
   - Link to the test report at `test-results/{TICKET-ID}_{MODULE}-test-report.md`

Link the PR to:

`{TICKET-ID}`

9. Do NOT merge the Pull Request. Stop here and report the PR URL back to me for review, along with the file-verification result from step 6.

### Expected Output

- A new branch and Pull Request opened against the default branch — no direct commits to the default branch
- Explicit confirmation that every expected file was verified present both on disk (step 3) and in the final commit (step 6)
- Descriptive commit message following conventional commit format
- PR description summarizing results, changed files, and anything flagged for reviewer attention
- PR URL provided for human review and merge decision

---

## Complete Workflow Execution

### ✅ Single Combined Prompt — THIS is the only thing you paste per new story

Fill in the two lines under RUN CONFIGURATION at the top of this file, then paste the block below as-is. Nothing else in this file needs editing per story.

```
RUN CONFIGURATION:
TICKET-ID: <fill in>
MODULE:    <fill in — must match the Module Registry exactly>
```

---

I want to run the complete end-to-end QA workflow for the story identified in the RUN CONFIGURATION above, using natural language and MCP, following our Page Object Model architecture (Page Objects in `pages/`, fixtures in `fixtures/`, test data in `test-data/`, one spec file per story inside the module's existing folder under `tests/`), and applying the Quality & Safety Rules defined in this file throughout (real test execution only, verified locators, API-first data seeding, cleanup hooks, flakiness investigation, PR-based review — not direct push).

Resolve all file paths automatically from RUN CONFIGURATION + the Module Registry table in this file — do not ask me to restate the ticket ID, module name, or any file path again during this run.

Execute, in order, providing a status update after each step:

1. **Read User Story** — read `user-Stories/{TICKET-ID}_{MODULE}.md`, summarize scope/acceptance criteria, confirm `MODULE` matches the registry exactly (stop and ask if it doesn't), and check what already exists for this module.
2. **Create Test Plan** — use the `playwright-test-planner` agent to build a full test plan (happy path, negative, edge case, navigation, UI validation, required role per scenario) and save it to `test-Plan/{TICKET-ID}_{MODULE}-test-plan.md`.
3. **Exploratory Testing** — execute the test plan manually via Playwright browser tools, recording only live-verified selectors/behaviors and documenting findings with screenshots.
4. **Generate Automation Scripts (POM)** — using the `playwright-test-generator` agent: create or update the registry's Page Object, confirm/create `fixtures/auth.fixture.js` and `fixtures/test-fixtures.js`, create or update the registry's test data file (API-first seeding where possible), and create exactly one new spec file in the registry's module folder, named `{TICKET-ID}-{short-description}.spec.js`, with cleanup hooks for any disposable data it creates — importing only from fixtures/test-data, no hardcoded locators or credentials. **Cover every scenario in the test plan** — generate one `test()` per test-plan scenario, not just a subset, and produce a numbered coverage mapping table confirming the counts match (see Quality & Safety Rule 9).
5. **Execute and Heal Tests** — run the module's folder, use the `playwright-test-healer` agent to fix failures in the correct layer (Page Object / fixture / test data / spec), distinguishing real bugs from flaky tests, repeat until stable, then run the full suite to confirm no regressions.
6. **Create Test Report** — compile results into `test-results/{TICKET-ID}_{MODULE}-test-report.md`, including PASS/FAIL status, healing summary by layer, artifacts created vs. reused, defects, coverage analysis, and recommendations.
7. **Open Pull Request** — use the GitHub MCP agent to branch from the current default-branch tip (never from an older commit, never via stash or checkout-from-commit tricks), verify every expected file is present on disk AND in the final commit before pushing, then push and open a PR against the default branch for human review. If any expected file is missing at either checkpoint, stop and tell me instead of continuing. Do not merge — report the PR URL and the file-verification result back to me.