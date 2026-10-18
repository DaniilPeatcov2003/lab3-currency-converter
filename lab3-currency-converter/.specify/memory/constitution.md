<!--
Sync Impact Report
- Version change: 0.1.0 -> 1.0.0
- Modified principles: none (new constitution scaffold adopted for project)
- Added sections: Additional Constraints, Development Workflow
- Removed sections: none
- Follow-up TODOs: none
-->

# Currency Converter Constitution

## Core Principles

### I. User-Centered Conversion Value
Every feature must directly improve the clarity, trustworthiness, or usability of currency conversion. If a change does not help a user complete or verify a conversion, it does not belong in the core product.

### II. Correctness and Validation
All conversion logic MUST validate inputs and must reject invalid or ambiguous values before producing a result. Currency calculations MUST use finite numeric values and must never display a result when the rate source is unavailable or invalid.

### III. Simplicity and Maintainability
The application design MUST prioritize a single, understandable workflow over large abstractions. Logic for validation, conversion, and rate access MUST be isolated and easy to test.

### IV. Accessibility and Clarity
The interface MUST be keyboard-friendly, readable, and understandable to first-time users. Labels, errors, and result summaries MUST communicate state clearly without requiring additional training.

### V. Privacy and Trust
The product MUST avoid collecting or storing unnecessary personal or financial data. Any remote dependencies MUST fail gracefully and communicate errors without exposing misleading information.

## Additional Constraints
The application is a lightweight web app for converting amounts across a small set of common currencies. It does not provide banking, investment advice, or transaction execution. The initial scope is a single-page experience with local or fetched exchange data and no persistent user accounts.

## Development Workflow
All changes MUST be validated against the project specification and planned tasks before implementation. Testing is required for conversion logic, validation rules, and unavailable-rate scenarios. Documentation updates are required when the user flow or requirements change.

## Governance
This constitution governs the project design and behavior. Amendments require updating the constitution and documenting the rationale in the change history. All pull requests must verify compliance with the principles above, especially correctness, validation, and accessibility. Changes that broaden scope beyond a small currency converter must be justified and re-reviewed.

**Version**: 1.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-07
