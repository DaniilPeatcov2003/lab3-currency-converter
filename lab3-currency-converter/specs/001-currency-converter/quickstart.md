# Quickstart Guide: Currency Converter

## 1. Running the Application Locally

1. Open a terminal in the application directory:
   ```powershell
   cd lab3-currency-converter
   ```
2. Start a simple static web server:
   - Using Python:
     ```powershell
     python -m http.server 8000
     ```
   - Using Node:
     ```powershell
     npx serve .
     ```
3. Open your browser and navigate to:
   ```text
   http://localhost:8000/src/
   ```

---

## 2. Main User Flow

1. **Enter Amount**: Notice the **Convert** button is disabled until a value is typed.
2. **Select Currencies**: Choose source (e.g., `USD`) and target (e.g., `EUR`).
   - If identical currencies are selected, a 1:1 conversion is computed immediately without network requests.
   - Click the **⇄** (Swap) button to quickly invert the currency pair.
3. **Submit**: Click **Convert** or press Enter.
4. **Inspect Output**:
   - Converted amount and currency symbols.
   - Source indicator: *Frankfurter / European Central Bank* (or *Local (1:1)*).
   - Rate publication date: Official ECB publication date (`YYYY-MM-DD`).

---

## 3. Verifying Key Requirements

### A. Input Validation
- Empty amount: Convert button is disabled.
- Enter `0` or negative values (e.g. `-10`): An explicit error message appears stating the amount must be greater than zero.
- Enter non-numeric text: An invalid number error is displayed.

### B. Weekend and Holiday Handling
- When querying rates on a weekend or public holiday, Frankfurter API returns the latest available rate from the last working day (e.g., Friday).
- The UI displays that Friday date directly. The application never replaces this date with the current calendar date.

### C. Offline Conversion with Local Storage Persistence
1. Perform a live conversion for `USD` -> `EUR`. The quote is saved to `localStorage`.
2. Disconnect your internet connection or switch to "Offline" mode in browser DevTools Network tab.
3. Convert `USD` -> `EUR` again:
   - The conversion succeeds using the cached rate.
   - A prominent warning banner appears: indicating that an offline/cached rate is being used and displaying the original publication date.
4. Attempt to convert an uncached pair (e.g., `CAD` -> `JPY`):
   - The conversion is blocked.
   - An explanatory error message indicates that the network is unavailable and no offline rate exists for that pair.

---

## 4. Running Tests (Single Command)

To run the complete automated test suite (response parsing, malformed responses, bidirectional conversion, validation, and offline cache) in one command:

```powershell
npm test
```

*Requirements: Node.js 20 or newer.*

### Browser-based Test Runner

You can also view the interactive test suite directly in a browser:
1. Start your local server (`python -m http.server 8000`).
2. Open:
   ```text
   http://localhost:8000/tests/test-runner.html
   ```
