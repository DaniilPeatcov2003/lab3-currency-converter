# Exchange Rates Contract

## Purpose

Defines the expected structure for rate data used by the currency converter.

## Data Shape

```json
{
  "USD": {
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 157.2
  },
  "EUR": {
    "USD": 1.09,
    "GBP": 0.86,
    "JPY": 171.1
  }
}
```

## Rules

- Keys are ISO-style currency codes.
- The top-level object represents the source currency.
- Each nested object maps target currencies to numeric conversion factors.
- Values must be finite numbers greater than zero.
- Missing or invalid mappings should be treated as an unavailable rate.

## Error Handling

If the data source is unavailable, incomplete, or malformed, the UI MUST show an explanatory error and MUST NOT display a misleading converted amount.
