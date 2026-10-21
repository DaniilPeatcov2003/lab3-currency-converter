# Exchange Rates API & Persistence Contract

## Purpose

Defines the contract for the remote exchange rate service (**Frankfurter API** / European Central Bank), the browser persistence schema for offline caching, and the fallback validation rules.

---

## 1. Remote Provider Contract (Frankfurter API)

### Request

```http
GET https://api.frankfurter.dev/v1/latest?base={SOURCE}&symbols={TARGET}
```

- `SOURCE`: 3-letter ISO-4217 source currency code (e.g., `USD`).
- `TARGET`: 3-letter ISO-4217 target currency code (e.g., `EUR`).

### Successful Response (HTTP 200)

```json
{
  "amount": 1.0,
  "base": "USD",
  "date": "2026-10-16",
  "rates": {
    "EUR": 0.88865
  }
}
```

### Response Validation Rules

1. `base` MUST match the requested `SOURCE` currency code.
2. `date` MUST be an ISO-8601 calendar date (`YYYY-MM-DD`).
3. `rates` MUST be a non-null object containing a key exactly matching `TARGET`.
4. The rate value `rates[TARGET]` MUST be a finite number strictly greater than zero (`> 0`).
5. Any HTTP status other than 200, network error, empty body, or missing required fields MUST be treated as an API failure.

---

## 2. Weekend and Holiday Rules

1. The European Central Bank does not publish rates on weekends or official ECB holidays.
2. The `/latest` endpoint of Frankfurter returns the most recently published ECB working-day rate.
3. The returned `date` represents the actual working-day publication date (e.g., Friday's date when queried on Saturday or Sunday).
4. The application MUST display this date as returned and MUST NOT substitute today's date.

---

## 3. Identical Currency Rule (1:1)

1. When `SOURCE == TARGET` (e.g., `USD` to `USD`):
   - NO network request is dispatched.
   - The rate multiplier is exactly `1.0`.
   - The source label is identified as `Local (1:1)`.
   - The date is displayed as "N/A".

---

## 4. Local Persistence Contract (`localStorage`)

Each successfully retrieved quote from the remote provider is persisted individually per currency pair.

### Key Format
`currency_rate_{SOURCE}_{TARGET}` (e.g., `currency_rate_USD_EUR`)

### Stored Record Schema

```json
{
  "source": "USD",
  "target": "EUR",
  "rate": 0.88865,
  "date": "2026-10-16",
  "savedAt": 1792329000000
}
```

- `source` (string): ISO currency code of source.
- `target` (string): ISO currency code of target.
- `rate` (number): Numeric exchange rate multiplier (`> 0`).
- `date` (string): Official publication date reported by provider (`YYYY-MM-DD`).
- `savedAt` (number): Unix epoch millisecond timestamp of when quote was saved.

---

## 5. Offline Fallback & Error Handling Rules

1. **Exact Pair Matching**: A cached rate can ONLY be used for the exact `source` and `target` pair. Inverting a cached inverse rate (`1 / rate`) is not permitted unless an explicit quote for that pair was saved.
2. **Offline with Valid Cache**:
   - Conversion succeeds using the saved `rate`.
   - Result is flagged with `isCached = true`.
   - A visible, prominent warning banner is displayed: indicating that the rate is cached/offline, displaying the original publication `date`, and notifying the user that live rates could not be reached.
3. **Offline without Valid Cache**:
   - Conversion is blocked.
   - Converted result is hidden.
   - An explanatory error message is displayed informing the user of the network failure and that no cached quote exists for this specific pair.
4. **No Hard-coded Fallbacks**: The application MUST NOT use hard-coded, dummy, or synthetic exchange rates under any circumstances.
