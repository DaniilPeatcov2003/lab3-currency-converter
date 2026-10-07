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

**Decision**: When a rate source fails, the app shows a clear error message instead of returning misleading values.

**Rationale**:
- Financial results must not silently fail.
- The specification explicitly requires visibility of rate-source issues.

**Consequences**:
- The app is more trustworthy and user-friendly.
- The UI includes a failure state as a standard user flow.

## Decision 4: Use a small local rate dataset as the default source

**Decision**: For the initial implementation, maintain a local JSON rate map and allow later replacement with a public API or backend service.

**Rationale**:
- This keeps the app working without network setup during local development.
- It preserves a clear path for later integration with a live provider.

**Consequences**:
- Development is easier and deterministic.
- Live-rate integration can be introduced later without redesigning the core modules.
