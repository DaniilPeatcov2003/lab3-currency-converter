# Tasks: Currency Converter

**Input**: Design documents from `/specs/001-currency-converter/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story and requirement domain to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, and single-command test configuration

- [X] T001 Initialize project structure (`src/`, `tests/`) per implementation plan
- [X] T002 Create `package.json` with single test command `npm test` pointing to Node's test runner
- [X] T003 [P] Create static browser entry point (`src/index.html`) and HTML test runner (`tests/test-runner.html`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core modules that must exist before user story integration

- [X] T004 [P] Define supported currency list and metadata in `src/currencies.js`
- [X] T005 [P] Implement numeric input validation logic (`amount > 0`, finite number) in `src/validation.js`
- [X] T006 [P] Implement pure conversion math, rounding, and 1:1 same-currency resolution in `src/converter.js`
- [X] T007 Implement Frankfurter API client, response parser, and `localStorage` pair cache in `src/rateService.js`
- [X] T008 Implement UI rendering helpers (result display, warning banner, error banner, button state) in `src/ui.js`

**Checkpoint**: Foundation ready - conversion math, validation, rate service, and UI modules exist in isolation.

---

## Phase 3: User Story 1 - Convert a value between currencies (Priority: P1) 🎯 MVP

**Goal**: User enters an amount, selects currencies, and receives a converted result with rate source and publication date.

**Independent Test**: Enter `100 USD` -> `EUR`, click Convert, and verify the converted amount, rate, source (*Frankfurter / European Central Bank*), and rate publication date are displayed. Convert `USD` -> `USD` and verify 1:1 result without a network request.

### Tests for User Story 1
- [X] T009 [P] [US1] Add unit tests for conversion math and formatting in `tests/test-runner.js`
- [X] T010 [P] [US1] Add unit tests for 1:1 same-currency conversion in `tests/test-runner.js`
- [X] T011 [P] [US1] Add unit tests for bidirectional conversion (converting A -> B and B -> A) in `tests/test-runner.js`

### Implementation for User Story 1
- [X] T012 [P] [US1] Construct the converter form layout with inputs, currency dropdowns, swap button, and result section in `src/index.html`
- [X] T013 [P] [US1] Style the converter form, currency controls, and output typography in `src/styles.css`
- [X] T014 [US1] Implement dynamic disabled state for the Convert button when amount input is empty in `src/ui.js`
- [X] T015 [US1] Wire currency swap button action (reversing source and target) in `src/ui.js`
- [X] T016 [US1] Connect main application controller and event listeners in `src/app.js`

**Checkpoint**: User Story 1 is functional: valid positive conversions work live, same-currency works 1:1, and Convert button disables when empty.

---

## Phase 4: User Story 2 - Handle invalid user input clearly (Priority: P1)

**Goal**: Block invalid inputs (empty, zero, negative, non-numeric) and provide user-friendly error messages.

**Independent Test**: Type or submit `0`, `-15`, or `abc` and verify that conversion is blocked and a visible error message appears.

### Tests for User Story 2
- [X] T017 [P] [US2] Add unit tests in `tests/test-runner.js` for zero amount (`0`), negative numbers, empty strings, and non-numeric strings
- [X] T018 [P] [US2] Add tests in `tests/test-runner.js` verifying validation error message output

### Implementation for User Story 2
- [X] T019 [US2] Ensure `src/validation.js` strictly rejects `amount <= 0`, `NaN`, and `Infinity` with clear error codes
- [X] T020 [US2] Implement inline error message rendering and focus management in `src/ui.js`
- [X] T021 [US2] Block form submission and conversion calculation whenever validation fails in `src/app.js`

**Checkpoint**: User Story 2 complete: invalid inputs are completely prevented from triggering conversions or network requests.

---

## Phase 5: User Story 3 - Offline conversion & API error handling (Priority: P2)

**Goal**: Support offline conversion via persisted `localStorage` rates with prominent warning; handle weekends, holidays, and API errors transparently.

**Independent Test**: Disconnect network and convert a previously cached pair: verify conversion succeeds with a prominent warning banner displaying original rate date. Convert an uncached pair: verify conversion is blocked with an error.

### Tests for User Story 3
- [X] T022 [P] [US3] Add unit tests for parsing valid Frankfurter API JSON responses (`amount`, `base`, `date`, `rates`) in `tests/test-runner.js`
- [X] T023 [P] [US3] Add unit tests for handling malformed, incomplete, or empty API responses in `tests/test-runner.js`
- [X] T024 [P] [US3] Add unit tests for `localStorage` persistence per currency pair (`source`, `target`, `rate`, `date`, `savedAt`) in `tests/test-runner.js`
- [X] T025 [P] [US3] Add unit tests for offline cache lookup: verifying exact pair match succeeds and unmatched pair fails
- [X] T026 [P] [US3] Add unit tests verifying weekend/holiday rate dates are preserved without substituting the current date

### Implementation for User Story 3
- [X] T027 [US3] Implement `fetchLatestRate` with response validation in `src/rateService.js`
- [X] T028 [US3] Implement per-pair caching in `localStorage` upon every successful quote in `src/rateService.js`
- [X] T029 [US3] Implement offline fallback in `src/rateService.js` looking up exact pair `currency_rate_{source}_{target}`
- [X] T030 [US3] Implement prominent warning banner in `src/ui.js` showing offline status and original rate date
- [X] T031 [US3] Implement network failure error banner in `src/ui.js` when no cache is available, hiding false results
- [X] T032 [US3] Wire offline fallback and error handling into `src/app.js`

**Checkpoint**: User Story 3 complete: offline conversions work seamlessly for cached pairs with clear warnings; weekends show correct published dates; uncached pairs fail safely.

---

## Phase 6: Single-Command Test Suite & Polish

**Purpose**: Verification of all laboratory requirements and quality standards

- [X] T033 Configure and verify `npm test` runs all unit, validation, response-parsing, and offline-cache tests in a single command
- [X] T034 Verify browser-based test suite in `tests/test-runner.html` passes with 100% green status
- [X] T035 [P] Validate keyboard accessibility (Tab navigation, Enter key, ARIA alerts) in `src/index.html`
- [X] T036 [P] Verify documentation accuracy across `quickstart.md`, `spec.md`, `plan.md`, and `contracts/`
