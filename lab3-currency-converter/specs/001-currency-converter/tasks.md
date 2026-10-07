# Tasks: Currency Converter

**Input**: Design documents from `/specs/001-currency-converter/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan in `src/` and `tests/`
- [ ] T002 Initialize a static web project with a simple browser entry point (`index.html`, `src/`, `tests/`)
- [ ] T003 [P] Configure a minimal local static server and test setup for JS-based validation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that must be complete before the user story implementation starts

- [ ] T004 Create the shared currency rate data model and base conversion utilities in `src/converter.js`
- [ ] T005 [P] Implement shared validation helpers in `src/validation.js`
- [ ] T006 [P] Create the rate-loading and fallback mechanism in `src/rateService.js`
- [ ] T007 Add the app shell and UI wiring in `src/app.js` and `src/ui.js`
- [ ] T008 Set error handling and user-facing feedback patterns for invalid or unavailable data

**Checkpoint**: Foundation ready - the conversion flow can now be built in a testable way.

---

## Phase 3: User Story 1 - Convert a value between currencies (Priority: P1) 🎯 MVP

**Goal**: Allow a user to enter an amount, choose currencies, and see the converted result.

**Independent Test**: A user can enter a valid amount and verify that the converted result updates for a selected currency pair.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add unit tests for conversion math in `tests/converter.test.js`
- [ ] T010 [P] [US1] Add unit tests for validation rules in `tests/validation.test.js`

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create the HTML form structure in `src/index.html`
- [ ] T012 [P] [US1] Add styling for layout, form controls, and result states in `src/styles.css`
- [ ] T013 [US1] Implement conversion logic in `src/converter.js` and wire it to the form
- [ ] T014 [US1] Implement validation and error rendering in `src/validation.js`
- [ ] T015 [US1] Add rate selection and result display behavior in `src/ui.js`
- [ ] T016 [US1] Connect the app entry point in `src/app.js`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Handle invalid user input clearly (Priority: P1)

**Goal**: Prevent false conversions and explain validation errors to the user.

**Independent Test**: A user entering empty or invalid values sees a clear error instead of a conversion result.

### Tests for User Story 2

- [ ] T017 [P] [US2] Add validation edge-case tests for blank, negative, and non-numeric inputs
- [ ] T018 [P] [US2] Add UI-level test coverage for visible error messages

### Implementation for User Story 2

- [ ] T019 [US2] Extend `src/validation.js` with explicit checks for empty, negative, and malformed amounts
- [ ] T020 [US2] Update the form behavior to display validation errors in the UI
- [ ] T021 [US2] Ensure conversion is blocked until input passes validation

**Checkpoint**: User Story 2 is independently testable and does not allow invalid conversions.

---

## Phase 5: User Story 3 - Show a reliable outcome when exchange data is unavailable (Priority: P2)

**Goal**: When rate data is missing or invalid, the app communicates the issue clearly.

**Independent Test**: A user can trigger a failed rate load and verify the app shows a clear error instead of a fake result.

### Tests for User Story 3

- [ ] T022 [P] [US3] Add tests for missing or invalid rate data in `tests/rateService.test.js`
- [ ] T023 [P] [US3] Add UI tests for unavailable-rate handling

### Implementation for User Story 3

- [ ] T024 [US3] Implement graceful failure handling in `src/rateService.js`
- [ ] T025 [US3] Surface a friendly error state in `src/ui.js`
- [ ] T026 [US3] Ensure the conversion result is hidden when rate data is unavailable

**Checkpoint**: All core stories are independent and the app degrades gracefully under rate failures.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality improvements

- [ ] T027 [P] Review and refine the app for accessibility and usability
- [ ] T028 [P] Run quickstart validation by starting a local static server and checking the main flow
- [ ] T029 [P] Confirm all tests pass and the documentation matches the current behavior
