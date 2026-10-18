import { convertAmount } from "../src/converter.js";
import {
  fetchExchangeRate,
  parseExchangeRateResponse,
  RateServiceError,
} from "../src/rateService.js";
import { validateAmount } from "../src/validation.js";

const isBrowser = typeof document !== "undefined";
const results = isBrowser ? document.querySelector("#results") : null;
const summary = isBrowser ? document.querySelector("#summary") : null;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  assert(Object.is(actual, expected), `${message}: expected ${expected}, got ${actual}`);
}

async function test(name, callback) {
  try {
    await callback();
    passed += 1;
    if (isBrowser) {
      const item = document.createElement("li");
      item.dataset.result = "pass";
      item.textContent = `${name} — passed`;
      results.append(item);
    } else {
      console.log(`PASS ${name}`);
    }
  } catch (error) {
    failed += 1;
    if (isBrowser) {
      const item = document.createElement("li");
      item.dataset.result = "fail";
      item.textContent = `${name} — failed: ${error.message}`;
      results.append(item);
    } else {
      console.error(`FAIL ${name}: ${error.message}`);
    }
  }
}

// ==========================================
// 1. Validation Tests
// ==========================================

await test("Validation: Accepts a valid positive amount", () => {
  const result = validateAmount("125.50");
  assert(result.valid, "valid amount was rejected");
  assertEqual(result.amount, 125.5, "parsed amount");
});

await test("Validation: Accepts a decimal comma", () => {
  const result = validateAmount("125,50");
  assert(result.valid, "decimal comma was rejected");
  assertEqual(result.amount, 125.5, "parsed decimal comma");
});

for (const [value, message] of [
  ["", "empty amount"],
  ["   ", "whitespace amount"],
  ["0", "zero amount"],
  ["0.00", "zero amount with decimals"],
  ["-4", "negative amount"],
  ["-0.5", "negative decimal amount"],
  ["one hundred", "non-numeric amount"],
  ["0x10", "hexadecimal amount"],
  ["Infinity", "infinite amount"],
  ["NaN", "NaN amount"],
]) {
  await test(`Validation: Rejects ${message}`, () => {
    assert(!validateAmount(value).valid, `${message} was accepted`);
  });
}

// ==========================================
// 2. Conversion & Math Tests (Forward & Reverse)
// ==========================================

await test("Conversion: Calculates direct currency conversion", () => {
  const result = convertAmount({
    amount: 100,
    fromCurrency: "USD",
    toCurrency: "EUR",
    rate: 0.9,
    date: "2026-10-16",
  });
  assertEqual(result.convertedAmount, 90, "converted amount");
  assertEqual(result.date, "2026-10-16", "rate date");
});

await test("Conversion: Calculates the reverse currency direction", () => {
  const forward = convertAmount({
    amount: 100,
    fromCurrency: "USD",
    toCurrency: "EUR",
    rate: 0.9,
  });
  const reverse = convertAmount({
    amount: forward.convertedAmount,
    fromCurrency: "EUR",
    toCurrency: "USD",
    rate: 1 / forward.rate,
  });
  assertEqual(reverse.convertedAmount, 100, "reverse converted amount");
});

await test("Conversion: Calculates both directions independently", () => {
  const usdToEur = convertAmount({
    amount: 50,
    fromCurrency: "USD",
    toCurrency: "EUR",
    rate: 0.85,
  });
  const eurToUsd = convertAmount({
    amount: 50,
    fromCurrency: "EUR",
    toCurrency: "USD",
    rate: 1.17647,
  });
  assertEqual(usdToEur.convertedAmount, 42.5, "USD -> EUR amount");
  assertEqual(Math.round(eurToUsd.convertedAmount * 100) / 100, 58.82, "EUR -> USD amount");
});

await test("Conversion: Rejects non-finite converted result", () => {
  let rejected = false;
  try {
    convertAmount({
      amount: Number.MAX_VALUE,
      fromCurrency: "USD",
      toCurrency: "EUR",
      rate: 2,
    });
  } catch (error) {
    rejected = error instanceof RangeError;
  }
  assert(rejected, "overflowing conversion was not rejected");
});

await test("Conversion: Same currency resolves 1:1 without network request with date 'N/A'", async () => {
  const quote = await fetchExchangeRate("USD", "USD", () => {
    throw new Error("same-currency conversion must not make a network request");
  });
  assertEqual(quote.rate, 1, "same-currency rate");
  assertEqual(quote.date, "N/A", "same-currency date");
  assertEqual(quote.provider, "Local (1:1)", "same-currency provider");
  assertEqual(quote.cached, false, "same-currency cached flag");
});

// ==========================================
// 3. API Response Parsing & Validation Tests
// ==========================================

await test("Parsing: Parses a valid Frankfurter API response", () => {
  const quote = parseExchangeRateResponse(
    { base: "USD", date: "2026-10-16", rates: { EUR: 0.9 } },
    "USD",
    "EUR",
  );
  assertEqual(quote.rate, 0.9, "parsed rate");
  assertEqual(quote.date, "2026-10-16", "parsed date");
  assertEqual(quote.base, "USD", "parsed base");
  assertEqual(quote.target, "EUR", "parsed target");
});

for (const [name, data] of [
  ["an empty provider response (null)", null],
  ["an empty object response", {}],
  ["a response with missing rates object", { base: "USD", date: "2026-10-16" }],
  ["a response with target currency absent from rates", { base: "USD", date: "2026-10-16", rates: {} }],
  ["a response with non-number rate", { base: "USD", date: "2026-10-16", rates: { EUR: "0.9" } }],
  ["a response with zero rate", { base: "USD", date: "2026-10-16", rates: { EUR: 0 } }],
  ["a response with negative rate", { base: "USD", date: "2026-10-16", rates: { EUR: -0.9 } }],
  ["a response for a mismatched base currency", { base: "GBP", date: "2026-10-16", rates: { EUR: 0.9 } }],
  ["a response with invalid date string", { base: "USD", date: "yesterday", rates: { EUR: 0.9 } }],
  ["a response with impossible calendar date", { base: "USD", date: "2026-02-30", rates: { EUR: 0.9 } }],
]) {
  await test(`Parsing: Rejects ${name}`, () => {
    let rejected = false;
    try {
      parseExchangeRateResponse(data, "USD", "EUR");
    } catch (error) {
      rejected = error instanceof RateServiceError;
    }
    assert(rejected, `${name} was accepted`);
  });
}

await test("Parsing: Preserves actual publication date from API on weekend/holiday without substituting today", () => {
  const quote = parseExchangeRateResponse(
    { base: "USD", date: "2026-10-16", rates: { EUR: 0.88865 } },
    "USD",
    "EUR",
  );
  assertEqual(quote.date, "2026-10-16", "preserved ECB publication date");
});

// ==========================================
// 4. Persistence & Offline Caching Tests
// ==========================================

await test("Cache: Persists successful rates per pair and uses them when network is unavailable", async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  const onlineQuote = await fetchExchangeRate(
    "USD",
    "EUR",
    async () => ({
      ok: true,
      json: async () => ({
        base: "USD",
        date: "2026-10-16",
        rates: { EUR: 0.9 },
      }),
    }),
    storage,
  );

  assert(!onlineQuote.cached, "online quote was marked cached");
  assertEqual(onlineQuote.rate, 0.9, "online rate");

  // Check stored record structure in storage
  const storedJson = storage.getItem("currency_rate_USD_EUR");
  assert(storedJson !== null, "record was not persisted to storage");
  const record = JSON.parse(storedJson);
  assertEqual(record.source, "USD", "stored source");
  assertEqual(record.target, "EUR", "stored target");
  assertEqual(record.rate, 0.9, "stored rate");
  assertEqual(record.date, "2026-10-16", "stored date");
  assert(Number.isFinite(record.savedAt), "stored savedAt timestamp");

  // Network failure -> should retrieve cached quote
  const offlineQuote = await fetchExchangeRate(
    "USD",
    "EUR",
    async () => {
      throw new TypeError("network unavailable");
    },
    storage,
  );

  assert(offlineQuote.cached, "offline quote was not marked as cached");
  assertEqual(offlineQuote.rate, 0.9, "cached rate");
  assertEqual(offlineQuote.date, "2026-10-16", "cached rate date");
});

await test("Cache: Rejects offline conversion for an uncached currency pair", async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  // Cache USD -> EUR only
  storage.setItem(
    "currency_rate_USD_EUR",
    JSON.stringify({
      source: "USD",
      target: "EUR",
      rate: 0.9,
      date: "2026-10-16",
      savedAt: Date.now(),
    }),
  );

  // Attempt to fetch GBP -> JPY offline (not in cache)
  let rejected = false;
  try {
    await fetchExchangeRate(
      "GBP",
      "JPY",
      async () => {
        throw new TypeError("network unavailable");
      },
      storage,
    );
  } catch (error) {
    rejected = error instanceof RateServiceError;
  }
  assert(rejected, "uncached pair was unexpectedly accepted offline");
});

await test("Cache: Exact pair matching - USD->EUR cached does not satisfy EUR->USD", async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  storage.setItem(
    "currency_rate_USD_EUR",
    JSON.stringify({
      source: "USD",
      target: "EUR",
      rate: 0.9,
      date: "2026-10-16",
      savedAt: Date.now(),
    }),
  );

  let rejected = false;
  try {
    await fetchExchangeRate(
      "EUR",
      "USD",
      async () => {
        throw new TypeError("network unavailable");
      },
      storage,
    );
  } catch (error) {
    rejected = error instanceof RateServiceError;
  }
  assert(rejected, "reverse pair was unexpectedly resolved from forward cache");
});

for (const [name, response] of [
  ["HTTP 500 server error", { ok: false, json: async () => ({}) }],
  ["missing rates object", { ok: true, json: async () => ({ base: "USD", date: "2026-10-16" }) }],
  ["empty rates object", { ok: true, json: async () => ({ base: "USD", date: "2026-10-16", rates: {} }) }],
  ["invalid date string", { ok: true, json: async () => ({ base: "USD", date: "yesterday", rates: { EUR: 0.9 } }) }],
  ["impossible calendar date", { ok: true, json: async () => ({ base: "USD", date: "2026-02-30", rates: { EUR: 0.9 } }) }],
  ["invalid numeric rate (zero)", { ok: true, json: async () => ({ base: "USD", date: "2026-10-16", rates: { EUR: 0 } }) }],
  ["malformed JSON syntax", { ok: true, json: async () => { throw new SyntaxError("invalid JSON"); } }],
]) {
  await test(`Service: Reports ${name} as a RateServiceError when no cache exists`, async () => {
    let rejected = false;
    try {
      await fetchExchangeRate("USD", "EUR", async () => response, null);
    } catch (error) {
      rejected = error instanceof RateServiceError;
    }
    assert(rejected, `${name} was accepted`);
  });
}

// ==========================================
// Summary Report
// ==========================================

if (isBrowser) {
  summary.dataset.result = failed > 0 ? "fail" : "pass";
  summary.textContent = `${passed} проверок пройдено, ${failed} ошибок.`;
} else {
  console.log(`\n========================================`);
  console.log(`ИТОГ: ${passed} проверок пройдено, ${failed} ошибок.`);
  console.log(`========================================`);
  if (failed > 0) process.exitCode = 1;
}
