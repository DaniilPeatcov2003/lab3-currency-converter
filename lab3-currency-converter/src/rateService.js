import { currencyCodes } from "./currencies.js";

const API_BASE_URL = "https://api.frankfurter.dev/v1/latest";
const CACHE_PREFIX = "currency-converter:rate:";

function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsedDate = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
}

export class RateServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = "RateServiceError";
  }
}

export function parseExchangeRateResponse(data, fromCurrency, toCurrency) {
  const rate = data?.rates?.[toCurrency];

  if (
    data?.base !== fromCurrency ||
    !isIsoDate(data?.date) ||
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    throw new RateServiceError("Сервис курсов вернул неполные или некорректные данные.");
  }

  return { base: fromCurrency, target: toCurrency, rate, date: data.date };
}

function getStorage(storage) {
  if (storage !== undefined) return storage;
  try {
    return globalThis.localStorage;
  } catch (error) {
    console.warn("Persistent rate cache is unavailable:", error);
    return null;
  }
}

function cacheKey(fromCurrency, toCurrency) {
  return `${CACHE_PREFIX}${fromCurrency}:${toCurrency}`;
}

function readCachedRate(storage, fromCurrency, toCurrency) {
  if (!storage) return null;

  try {
    const cachedValue = storage.getItem(cacheKey(fromCurrency, toCurrency));
    if (!cachedValue) return null;
    return parseExchangeRateResponse(JSON.parse(cachedValue), fromCurrency, toCurrency);
  } catch (error) {
    console.warn("Could not read a cached exchange rate:", error);
    return null;
  }
}

function writeCachedRate(storage, quote) {
  if (!storage) return;

  try {
    storage.setItem(
      cacheKey(quote.base, quote.target),
      JSON.stringify({
        base: quote.base,
        date: quote.date,
        rates: { [quote.target]: quote.rate },
      }),
    );
  } catch (error) {
    console.warn("Could not persist the exchange rate cache:", error);
  }
}

function getCachedOrThrow(storage, fromCurrency, toCurrency, error) {
  const cachedQuote = readCachedRate(storage, fromCurrency, toCurrency);
  if (cachedQuote) return { ...cachedQuote, cached: true };
  throw error;
}

export async function fetchExchangeRate(
  fromCurrency,
  toCurrency,
  fetchImpl = fetch,
  storage,
) {
  if (!currencyCodes.has(fromCurrency) || !currencyCodes.has(toCurrency)) {
    throw new RateServiceError("Выбрана неподдерживаемая валюта.");
  }

  if (fromCurrency === toCurrency) {
    return { base: fromCurrency, target: toCurrency, rate: 1, date: null, cached: false };
  }

  const persistentStorage = getStorage(storage);
  const url = new URL(API_BASE_URL);
  url.searchParams.set("base", fromCurrency);
  url.searchParams.set("symbols", toCurrency);

  let response;
  try {
    response = await fetchImpl(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "TimeoutError"
        ? "Сервис курсов не ответил вовремя. Попробуйте ещё раз."
        : "Не удалось подключиться к сервису курсов. Проверьте интернет.";
    return getCachedOrThrow(
      persistentStorage,
      fromCurrency,
      toCurrency,
      new RateServiceError(message),
    );
  }

  if (!response.ok) {
    return getCachedOrThrow(
      persistentStorage,
      fromCurrency,
      toCurrency,
      new RateServiceError("Сервис курсов временно недоступен. Попробуйте позже."),
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    return getCachedOrThrow(
      persistentStorage,
      fromCurrency,
      toCurrency,
      new RateServiceError("Сервис курсов вернул некорректные данные."),
    );
  }

  let quote;
  try {
    quote = parseExchangeRateResponse(data, fromCurrency, toCurrency);
  } catch (error) {
    if (!(error instanceof RateServiceError)) throw error;
    return getCachedOrThrow(persistentStorage, fromCurrency, toCurrency, error);
  }

  writeCachedRate(persistentStorage, quote);
  return { ...quote, cached: false };
}
