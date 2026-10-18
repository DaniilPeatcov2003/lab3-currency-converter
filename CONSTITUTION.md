# Constitution for lab3-currency-converter

## 1. Mission
The project exists to provide a clear, reliable, and user-friendly currency conversion tool. It should help users compare exchange rates, convert values quickly, and understand the result without confusion.

## 2. Core principles
1. User value first. Every feature must improve the usefulness or clarity of the currency conversion flow.
2. Correctness over speed. Currency conversion logic must be accurate, deterministic, and easy to validate.
3. Simplicity. The interface and user interactions should be lightweight, readable, and intuitive.
4. Accessibility. The experience must remain usable for keyboard navigation, readable text, and clear contrast.
5. Privacy and trust. The application must not collect or expose unnecessary personal or financial data.
6. Maintainability. Code must be understandable, modular, and easy to extend with more currencies or rates.

## 3. Scope
The product covers:
- input of a monetary amount;
- selection of source and target currencies;
- conversion based on the current exchange rate;
- clear display of converted results;
- validation of invalid inputs and unsupported states.

The product does not cover:
- banking transactions;
- financial advice or compliance guarantees;
- storing user personal financial data beyond what is strictly required for local functionality.

## 4. Quality standards
- Inputs must be validated before conversion.
- Errors must be visible and understandable to the user.
- The interface must remain stable across supported browsers and screen sizes.
- The codebase should prefer simple, testable logic.
- Any rate-fetching or API integration must fail gracefully and clearly.

## 5. Engineering expectations
- Prefer small, focused changes over broad refactors.
- Keep naming consistent and self-explanatory.
- Update documentation when behavior or workflows change.
- Add or update tests for logic that affects conversion accuracy or validation.
- Keep dependencies minimal and justified.

## 6. Decision framework
When a trade-off arises, the team should choose the option that maximizes:
1. correctness,
2. clarity,
3. maintainability,
4. user trust.

If a decision impacts product behavior, the change should be documented and reviewed before merging.

## 7. Release principles
A release is ready when:
- core conversion scenarios work reliably,
- validation and error states behave as expected,
- the interface is legible and accessible,
- the project documentation reflects the current state.

## 8. Long-term vision
This project should remain a small, dependable reference implementation of a currency converter: easy to run, easy to understand, and easy to extend with more features in the future.
