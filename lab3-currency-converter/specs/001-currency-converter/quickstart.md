# Quickstart

## Local development

1. Open the project folder in a browser-friendly workspace.
2. Start a simple local server from the project root:
   - Python: `python -m http.server 8000`
   - Node: `npx serve .`
3. Open `http://localhost:8000` in the browser.

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
