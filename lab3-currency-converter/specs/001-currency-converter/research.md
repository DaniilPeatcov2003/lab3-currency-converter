# Research & Technical Decisions: Currency Converter

## Decision 1: Architecture - Modular Browser Application

**Decision**: Build the currency converter as a client-side single-page application using vanilla HTML5, CSS3, and standard ES2022 modules without bulky frameworks.

**Rationale**:
- Fits the project constitution: simplicity, zero overhead, accessibility, and high maintainability.
- No backend server required for production; runs on any static web host or browser environment.
- Native ES modules allow modular code (`converter.js`, `validation.js`, `rateService.js`, `ui.js`) that is easily imported and tested.

---

## Decision 2: Rate Source - Frankfurter API (European Central Bank)

**Decision**: Fetch live exchange rates from the open Frankfurter API (`https://api.frankfurter.dev/v1/latest?base={SOURCE}&symbols={TARGET}`).

**Rationale**:
- Provides official European Central Bank reference rates updated every working day around 16:00 CET.
- Completely free, requires no API key, and natively supports CORS for direct browser requests.
- Returns clean JSON with source currency, target rate, and explicit reference date.

**Trade-offs & Mitigations**:
- ECB does not publish rates on weekends or bank holidays.
- *Mitigation*: The `/latest` endpoint of Frankfurter naturally returns the last published working day quote with its true date. The app displays this date directly to keep users accurately informed without falsifying the date.

---

## Decision 3: Persistence & Offline Support - Individual Pair Caching in `localStorage`

**Decision**: Cache each successfully retrieved exchange rate in browser `localStorage` under a dedicated key (`currency_rate_{SOURCE}_{TARGET}`). When network/API requests fail, allow conversion ONLY if an exact-pair cached quote exists, accompanied by a prominent warning banner.

**Rationale**:
- Meets the lab requirement to support offline conversion using persisted rates across application restarts.
- Caching per pair prevents cross-pair contamination or invalid inverse rate approximations.
- Clearly flags cached results with their publication date and a visible warning to prevent user confusion.
- If no cache exists for the requested pair, the app cleanly halts conversion and displays an error rather than inventing synthetic or hard-coded rates.

---

## Decision 4: Strict Input Validation & UI Control State

**Decision**: The "Convert" button remains disabled whenever the amount input is empty. Typing or submitting `0`, negative numbers, or non-numeric characters triggers immediate, visible validation errors and blocks conversion.

**Rationale**:
- Amount must be strictly positive (`> 0`).
- Disabling the button on empty input prevents accidental empty submissions.
- Inline validation messages clarify why input is rejected before an unnecessary network call is made.

---

## Decision 5: Same-Currency (1:1) Handling

**Decision**: When the source and target currencies are identical (e.g., USD -> USD), bypass the network entirely, return the exact input amount with rate `1.0`, label the provider as `Local (1:1)`, and mark the date as `N/A (Identical currency)` (or today's date).

**Rationale**:
- Eliminates redundant API calls and potential offline errors when converting to the same currency.
- Provides immediate and intuitive feedback.

---

## Decision 6: Testing Strategy - Single Command `npm test` via Node.js Built-in Runner

**Decision**: Implement the test suite using Node.js built-in test runner (`node:test` and `node:assert`), executable via `npm test` without installing third-party npm packages. Additionally provide a standalone browser-based test runner (`tests/test-runner.html`) for UI-adjacent testing.

**Rationale**:
- Satisfies the requirement of running tests with a single command (`npm test`).
- Zero npm package dependencies means zero install friction, high security, and rapid test execution.
- Tests will cover:
  1. Successful response parsing from the Frankfurter API.
  2. Malformed, incomplete, and empty response handling.
  3. Reverse conversion (bidirectional pair checking).
  4. Validation edge cases (`0`, negative, empty, non-numeric).
  5. Local storage caching, persistence across restarts, and offline fallback warning logic.
