import { currencies } from "./currencies.js";
import { convertAmount } from "./converter.js";
import { fetchExchangeRate, RateServiceError } from "./rateService.js";
import { validateAmount } from "./validation.js";

export function initializeConverter(root = document, getRate = fetchExchangeRate) {
  const form = root.querySelector("#converter-form");
  const amountInput = root.querySelector("#amount");
  const fromSelect = root.querySelector("#from-currency");
  const toSelect = root.querySelector("#to-currency");
  const swapButton = root.querySelector("#swap-currencies");
  const submitButton = root.querySelector("#convert-button");
  const errorMessage = root.querySelector("#error-message");
  const resultPanel = root.querySelector("#result-panel");
  const resultAmount = root.querySelector("#result-amount");
  const resultCaption = root.querySelector("#result-caption");
  const resultCurrency = root.querySelector("#result-currency");
  const rateDetails = root.querySelector("#rate-details");
  const resultStatus = root.querySelector("#result-status");

  for (const { code, name } of currencies) {
    for (const select of [fromSelect, toSelect]) {
      const option = root.createElement("option");
      option.value = code;
      option.textContent = `${code} — ${name}`;
      select.append(option);
    }
  }

  fromSelect.value = "USD";
  toSelect.value = "EUR";
  submitButton.disabled = true;

  let currentRequest = 0;
  let hasRequestedConversion = false;

  function clearError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
  }

  function hideResult() {
    resultPanel.hidden = true;
    resultStatus.textContent = "";
  }

  async function convertCurrentAmount() {
    const validation = validateAmount(amountInput.value);
    clearError();
    hideResult();

    if (!validation.valid) {
      errorMessage.textContent = validation.message;
      errorMessage.hidden = false;
      amountInput.setAttribute("aria-invalid", "true");
      amountInput.focus();
      return;
    }

    amountInput.removeAttribute("aria-invalid");
    hasRequestedConversion = true;
    const requestId = ++currentRequest;
    submitButton.disabled = true;
    submitButton.textContent = "Получаем курс…";
    resultStatus.textContent = "Загружаем курс валют.";

    try {
      const quote = await getRate(fromSelect.value, toSelect.value);
      if (requestId !== currentRequest) return;

      const result = convertAmount({
        amount: validation.amount,
        fromCurrency: fromSelect.value,
        toCurrency: toSelect.value,
        rate: quote.rate,
        date: quote.date,
      });

      const formatter = new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });

      resultAmount.textContent = formatter.format(result.convertedAmount);
      resultCaption.textContent = `${formatter.format(result.amount)} ${result.fromCurrency} =`;
      resultCurrency.textContent = result.toCurrency;
      rateDetails.textContent =
        quote.date === null
          ? `1 ${result.fromCurrency} = 1 ${result.toCurrency}`
          : quote.cached
            ? `Сохранённый курс Frankfurter на ${quote.date}. Нет подключения — используется последнее сохранённое значение.`
            : `Последний опубликованный курс Frankfurter: 1 ${result.fromCurrency} = ${formatter.format(quote.rate)} ${result.toCurrency} · на ${quote.date}`;
      resultPanel.hidden = false;
    } catch (error) {
      if (requestId !== currentRequest) return;

      if (error instanceof RateServiceError) {
        errorMessage.textContent = error.message;
      } else {
        console.error("Unexpected conversion error:", error);
        errorMessage.textContent = "Не удалось выполнить конвертацию. Попробуйте ещё раз.";
      }
      errorMessage.hidden = false;
    } finally {
      if (requestId === currentRequest) {
        submitButton.disabled = false;
        submitButton.textContent = "Конвертировать";
        resultStatus.textContent = resultPanel.hidden
          ? "Конвертация не выполнена."
          : "Результат конвертации готов.";
      }
    }
  }

  function updateCurrencies() {
    const shouldRecalculate = hasRequestedConversion;
    currentRequest += 1;
    hideResult();
    clearError();
    if (shouldRecalculate) convertCurrentAmount();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    convertCurrentAmount();
  });

  amountInput.addEventListener("input", () => {
    currentRequest += 1;
    hideResult();
    clearError();
    amountInput.removeAttribute("aria-invalid");
    submitButton.disabled = amountInput.value.trim().length === 0;
    submitButton.textContent = "Конвертировать";
  });

  fromSelect.addEventListener("change", updateCurrencies);
  toSelect.addEventListener("change", updateCurrencies);

  swapButton.addEventListener("click", () => {
    const previousFrom = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = previousFrom;
    updateCurrencies();
    fromSelect.focus();
  });
}
