# Research Notes

## Decision 1: Use a lightweight static web app for v1

**Decision**: Build the first version as a single-page browser application using HTML, CSS, and JavaScript without a server-side framework.

**Rationale**:
- The product requirement is a focused conversion experience rather than a large system.
- A simple browser app keeps the project easier to run and validate.
- The constitution prioritizes simplicity and maintainability.

**Consequences**:
- The app can be opened directly in a browser or served locally by a minimal HTTP server.
- Conversion logic remains easy to unit test.
- UI state and validation rules are isolated from the business logic.

## Decision 2: Keep conversion logic separate from UI state

**Decision**: Create isolated modules for rate loading, input validation, and conversion calculations.

**Rationale**:
- Validation and conversion rules are important for correctness.
- The product must behave predictably with invalid inputs and missing data.

**Consequences**:
- Unit tests can verify edge cases such as zero, negative values, and empty input.
- UI code becomes easier to maintain and less error-prone.

## Decision 3: Handle missing rate data gracefully

**Decision**: When a rate source fails, the app uses a previously saved quote for that exact currency pair when available and clearly labels it with its original date. Without a valid cache, the app shows a clear error.

**Rationale**:
- Cached quotes must never be presented as current.
- The specification explicitly requires visibility of rate-source issues.

**Consequences**:
- The app can still convert offline without hiding that its quote is older.
- The UI includes a failure state as a standard user flow.

## Decision 4: Fetch current rates from Frankfurter

**Decision**: Fetch the selected currency pair from the public Frankfurter API at conversion time
and persist the last successful quote per pair in browser local storage. On network or provider
failure, offer the saved quote and show its publication date. Never substitute hard-coded rates.

**Rationale**:
- The product requirement is to provide current exchange rates.
- Frankfurter provides public rates without requiring an API key.
- Showing a dated cached quote is more useful than refusing all offline conversions.
- The latest endpoint naturally returns the last published rate on weekends and holidays.

**Consequences**:
- First-time conversion requires internet access and the rate service to be available.
- The service boundary is isolated so it can be changed without modifying conversion logic.
- Tests use injected responses and do not depend on the live service.

## Decision 5: Use Node's built-in test runner with a browser-compatible suite

**Decision**: Keep tests dependency-free, run them with `npm test` on Node.js 20+, and retain a
browser page for the same test suite.

**Rationale**:
- Node's built-in JavaScript runtime does not require a third-party test dependency.
- Running the same suite in Node and a browser keeps one-command local testing while preserving
  browser verification.

**Consequences**:
- The command-line test run requires Node.js 20 or newer.
- Browser test outcomes are also reported on a dedicated test page.
