# Implementation Plan: Currency Converter

**Branch**: `antigravity-build` | **Date**: 2026-10-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-currency-converter/spec.md`

## Summary

Build a lightweight, reliable browser-based currency converter powered by the public **Frankfurter API** (European Central Bank reference rates). The application provides robust input validation, same-currency (1:1) instant resolution, persistent rate caching in `localStorage` across restarts, and offline conversion with prominent warning banners. All test suites run with a single command `npm test` using Node.js built-in test tools with zero third-party dependencies.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2022 standard modules).

**Runtime Dependencies**: Zero external runtime dependencies. Live rate fetching uses browser `window.fetch` to contact `https://api.frankfurter.dev/v1/latest`.

**Storage**: Browser `localStorage` persisting currency pairs individually under `currency_rate_{SOURCE}_{TARGET}`, storing `source`, `target`, `rate`, `date`, and `savedAt`.

**Testing**: Node.js 20+ built-in test runner (`node:test`, `node:assert`), invoked with `npm test`. An optional browser runner (`tests/test-runner.html`) is also provided for visual testing.

**Target Platform**: Desktop and tablet browsers (Chrome, Firefox, Safari, Edge).

**Project Type**: Client-side web application.

**Constraints & Guarantees**:
- Convert button is disabled when amount is empty.
- Input must be strictly positive (`amount > 0`). Zero, negative, and non-numeric inputs are rejected by validation.
- Same currencies resolve to 1:1 without network calls; source is labeled as `Local (1:1)` and date is displayed as "N/A".
- Weekends and holidays display the latest published rate and its actual publication date returned by the API; dates are never falsified.
- Offline mode uses cached rates ONLY for exact currency pairs and displays a prominent warning banner with the original publication date.
- No synthetic or hard-coded fallback rates are permitted.

## Constitution Check

*GATE: Must pass before implementation.*

- **User value first**: Direct, responsive conversion with clear error states and offline resilience.
- **Correctness over speed**: Rigorous validation of inputs and API responses; exact-pair caching without inaccurate cross-pair inversions.
- **Simplicity**: Zero build step required to run the web application; plain HTML, CSS, and JS.
- **Accessibility**: Clear visual contrast, keyboard navigation, accessible labels, and screen-reader-friendly alert banners.
- **Privacy and trust**: No user tracking, no third-party telemetry, transparent source and date indicators.
- **Maintainability**: Modular decomposition (`converter.js`, `validation.js`, `rateService.js`, `ui.js`).

## Project Structure

### Documentation (this feature)

```text
specs/001-currency-converter/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── exchange-rates.md
├── spec.md
└── tasks.md
```

### Source Code & Tests (repository layout)

```text
lab3-currency-converter/
├── package.json
├── src/
│   ├── app.js
│   ├── converter.js
│   ├── currencies.js
│   ├── rateService.js
│   ├── validation.js
│   ├── ui.js
│   ├── styles.css
│   └── index.html
└── tests/
    ├── test-runner.html
    └── test-runner.js
```

**Architecture Decisions**:
1. `validation.js`: Pure functions validating numeric bounds (`amount > 0`, finite number, currency existence).
2. `converter.js`: Pure math functions performing conversions, rounding, formatting, and 1:1 logic.
3. `rateService.js`: Encapsulates Frankfurter API calls, response parsing, validation of received JSON, `localStorage` pair caching, and fallback resolution.
4. `ui.js`: DOM manipulation, form state (disabling/enabling Convert button), rendering conversion results, date/source metadata, and warning/error banners.
5. `tests/test-runner.js`: Complete test suite runnable in both Node.js (`npm test`) and the browser (`test-runner.html`).
