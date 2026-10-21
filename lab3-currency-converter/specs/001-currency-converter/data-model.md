# Data Model: Currency Converter

## Core Entities

### 1. Currency

Represents a supported currency code and its display metadata.

**Fields**:
- `code`: string (e.g. `USD`, `EUR`, `GBP`, `JPY`, `CHF`, `CAD`, `AUD`)
- `name`: string (e.g. `US Dollar`, `Euro`)
- `symbol`: string, optional (e.g. `$`, `€`, `£`, `¥`)

**Relationships**:
- Selected as `fromCurrency` (source) and `toCurrency` (target) in a conversion request.

---

### 2. ExchangeRate

Represents a currency exchange rate quote for a specific direction.

**Fields**:
- `source`: string, 3-letter ISO code of the base currency
- `target`: string, 3-letter ISO code of the quote currency
- `value`: number, conversion multiplier strictly greater than zero (`> 0`)
- `date`: string, ISO-8601 calendar date (`YYYY-MM-DD`) published by the rate authority
- `savedAt`: number, Unix timestamp in milliseconds when stored in persistent cache
- `isCached`: boolean, `true` if quote was recovered from offline storage, `false` if freshly fetched
- `provider`: string, label of data source (*Frankfurter / European Central Bank* or *Local (1:1)*)

---

### 3. CachedRateRecord (Persistent Storage)

Serialized record stored in browser `localStorage`.

**Key**: `currency_rate_{source}_{target}` (e.g., `currency_rate_USD_EUR`)

**Fields**:
- `source`: string (e.g. `USD`)
- `target`: string (e.g. `EUR`)
- `rate`: number (e.g. `0.88865`)
- `date`: string (e.g. `2026-10-16`)
- `savedAt`: number (timestamp in ms)

**Storage Rules**:
- Persisted separately for each exact pair (`source` -> `target`).
- Exact matching only: `currency_rate_USD_EUR` cannot be used for converting `EUR` to `USD`.
- Persists across page reloads and browser restarts.

---

### 4. ConversionRequest

User input parameters for conversion.

**Fields**:
- `amount`: number
- `fromCurrency`: string
- `toCurrency`: string

**Validation Rules**:
- `amount` MUST be a finite number strictly greater than zero (`amount > 0`).
- Empty input, `0`, negative numbers, `NaN`, and `Infinity` are rejected.
- `fromCurrency` and `toCurrency` must be valid supported currency codes.

---

### 5. ConversionResult

The evaluated result presented in the UI.

**Fields**:
- `fromCurrency`: string
- `toCurrency`: string
- `amount`: number
- `convertedAmount`: number (`amount * rate`)
- `formattedResult`: string
- `rate`: number
- `date`: string (`YYYY-MM-DD` or "N/A" for 1:1)
- `provider`: string
- `isCached`: boolean
- `warningMessage`: string | null (present when `isCached == true`)

**Behavioral Rules**:
- When `fromCurrency == toCurrency`: `convertedAmount = amount`, `rate = 1.0`, `date = "N/A"`, `provider = "Local (1:1)"`, `isCached = false`.
- When live quote retrieved: `convertedAmount = amount * liveRate`, `isCached = false`, result is cached to `localStorage`.
- When offline with cached quote: `convertedAmount = amount * cachedRate`, `isCached = true`, `warningMessage` indicates rate is cached from `date`.
- When offline without cached quote: Result is not created; error state is raised.
