# Quickstart

## Local development

1. Open a terminal in the project folder.
2. Start a simple local server: `python -m http.server 8000`
3. Open `http://localhost:8000/src/` in the browser.

The converter uses the latest published exchange rates from Frankfurter (European Central Bank).
Successfully fetched rates are cached locally by currency pair. If the provider cannot be reached,
the app offers the cached rate with its publication date; without a cached quote it shows an error.

## Main user flow

1. Enter an amount.
2. Select source and target currencies.
3. Click Convert.
4. Review the conversion result or the validation error if the input is invalid.

## Validation checklist

- Empty input is rejected.
- Negative values are rejected.
- Non-numeric input is rejected.
- Missing rate data shows a user-friendly error message.
- The result updates when the currency selections change.

## Run tests

With Node.js 20 or newer installed, run `npm test` from the application directory. This runs the
conversion, input-validation, provider-response, and offline-cache tests in one command.

To view the same test suite in a browser, start the local server and open
`http://localhost:8000/tests/test-runner.html`.
