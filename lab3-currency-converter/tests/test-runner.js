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

await test("Accepts a valid positive amount", () => {
  const result = validateAmount("125.50");
  assert(result.valid, "valid amount was rejected");
  assertEqual(result.amount, 125.5, "parsed amount");
});

await test("Accepts a decimal comma", () => {
  const result = validateAmount("125,50");
  assert(result.valid, "decimal comma was rejected");
  assertEqual(result.amount, 125.5, "parsed decimal comma");
});

for (const [value, message] of [
  ["", "empty amount"],
  ["   ", "whitespace amount"],
  ["0", "zero amount"],
  ["-4", "negative amount"],
  ["one hundred", "non-numeric amount"],
  ["0x10", "hexadecimal amount"],
  ["Infinity", "infinite amount"],
]) {
  await test(`Rejects ${message}`, () => {
    assert(!validateAmount(value).valid, `${message} was accepted`);
  });
}

await test("Calculates a currency conversion", () => {
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

await test("Calculates the reverse currency direction", () => {
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

await test("Rejects a non-finite converted result", () => {
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

await test("Parses a valid provider response", () => {
  const quote = parseExchangeRateResponse(
    { base: "USD", date: "2026-10-16", rates: { EUR: 0.9 } },
    "USD",
    "EUR",
  );
  assertEqual(quote.rate, 0.9, "parsed rate");
  assertEqual(quote.date, "2026-10-16", "parsed date");
});

for (const [name, data] of [
  ["an empty provider response", null],
  ["a provider response with no rate", { base: "USD", date: "2026-10-16", rates: {} }],
  ["a provider response with a non-number rate", { base: "USD", date: "2026-10-16", rates: { EUR: "0.9" } }],
  ["a provider response for a different base", { base: "GBP", date: "2026-10-16", rates: { EUR: 0.9 } }],
]) {
  await test(`Rejects ${name}`, () => {
    let rejected = false;
    try {
      parseExchangeRateResponse(data, "USD", "EUR");
    } catch (error) {
      rejected = error instanceof RateServiceError;
    }
    assert(rejected, `${name} was accepted`);
  });
}

await test("Requests and validates a rate for a currency pair", async () => {
  let requestedUrl;
  const quote = await fetchExchangeRate("USD", "EUR", async (url) => {
    requestedUrl = new URL(url);
    return {
      ok: true,
      json: async () => ({
        base: "USD",
        date: "2026-10-16",
        rates: { EUR: 0.9 },
      }),
    };
  }, null);

  assertEqual(requestedUrl.searchParams.get("base"), "USD", "requested base");
  assertEqual(requestedUrl.searchParams.get("symbols"), "EUR", "requested target");
  assertEqual(quote.rate, 0.9, "validated rate");
});

await test("Uses a unit rate without a request for the same currency", async () => {
  const quote = await fetchExchangeRate("USD", "USD", () => {
    throw new Error("same-currency conversion made a network request");
  });
  assertEqual(quote.rate, 1, "same-currency rate");
  assertEqual(quote.date, null, "same-currency date");
});

await test("Persists successful rates and uses them when the network is unavailable", async () => {
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
  const offlineQuote = await fetchExchangeRate(
    "USD",
    "EUR",
    async () => {
      throw new TypeError("network unavailable");
    },
    storage,
  );
  assert(!onlineQuote.cached, "online quote was marked cached");
  assert(offlineQuote.cached, "offline quote was not marked as cached");
  assertEqual(offlineQuote.rate, onlineQuote.rate, "cached rate");
});

for (const [name, response] of [
  ["unavailable rate", { ok: false, json: async () => ({}) }],
  ["incomplete rate", { ok: true, json: async () => ({ base: "USD", date: "2026-10-16", rates: {} }) }],
  ["invalid date", { ok: true, json: async () => ({ base: "USD", date: "yesterday", rates: { EUR: 0.9 } }) }],
  ["impossible date", { ok: true, json: async () => ({ base: "USD", date: "2026-02-30", rates: { EUR: 0.9 } }) }],
  ["invalid numeric rate", { ok: true, json: async () => ({ base: "USD", date: "2026-10-16", rates: { EUR: 0 } }) }],
  ["malformed JSON", { ok: true, json: async () => { throw new SyntaxError("invalid JSON"); } }],
]) {
  await test(`Reports ${name} as a service error`, async () => {
    let rejected = false;
    try {
      await fetchExchangeRate("USD", "EUR", async () => response, null);
    } catch (error) {
      rejected = error instanceof RateServiceError;
    }
    assert(rejected, `${name} was accepted`);
  });
}

await test("Reports network failure as a service error", async () => {
  let rejected = false;
  try {
    await fetchExchangeRate("USD", "EUR", async () => {
      throw new TypeError("network unavailable");
    }, null);
  } catch (error) {
    rejected = error instanceof RateServiceError;
  }
  assert(rejected, "network failure was not converted to a service error");
});

if (isBrowser) {
  summary.dataset.result = failed > 0 ? "fail" : "pass";
  summary.textContent = `${passed} проверок пройдено, ${failed} ошибок.`;
} else {
  console.log(`\n${passed} проверок пройдено, ${failed} ошибок.`);
  if (failed > 0) process.exitCode = 1;
}
