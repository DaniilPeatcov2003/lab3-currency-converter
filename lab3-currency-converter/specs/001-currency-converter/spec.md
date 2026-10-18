# Feature Specification: Currency Converter

**Feature Branch**: `antigravity-build`

**Created**: 2026-10-07

**Updated**: 2026-10-18

**Status**: Ready

**Input**: User description: "Create a currency converter application for converting values between currencies with a simple, reliable user interface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Convert a value between currencies (Priority: P1)

A user opens the application, enters a positive amount, selects a source currency and a target currency, and sees the converted value along with the rate source and publication date.

**Why this priority**: This is the core value of the product. If conversion does not work reliably, the application fails its primary purpose.

**Independent Test**: A user can enter a valid amount such as `100`, select `USD` and `EUR`, and confirm the app displays a correctly converted amount, the rate source (*Frankfurter / European Central Bank*), and the date of the exchange rate.

**Acceptance Scenarios**:

1. **Given** the app is loaded and all inputs are available, **When** a user enters a valid positive amount and selects distinct currencies, **Then** the app calculates and displays the converted result, the rate source, and the official rate publication date.
2. **Given** the user changes either currency selection, **When** the conversion is recalculated, **Then** the result updates to reflect the selected pair.
3. **Given** the amount field is empty, **When** the app is loaded or the input is cleared, **Then** the conversion button remains disabled until an amount is entered.
4. **Given** the source and target currencies are identical, **When** the user converts an amount, **Then** the app performs a 1:1 conversion without sending a network request, displays the same amount as the result, identifies the source as "Local (1:1)", and displays "N/A" as the date.

---

### User Story 2 - Handle invalid user input clearly (Priority: P1)

A user enters an empty, non-numeric, zero, or negative value and receives a clear validation message instead of a misleading result.

**Why this priority**: Correct validation prevents incorrect conversions and builds trust in the tool.

**Independent Test**: A user submits or types an invalid value (e.g. `0`, `-50`, `abc`) and confirms the app blocks conversion and displays an explicit error message.

**Acceptance Scenarios**:

1. **Given** no amount is entered, **When** the user views the form, **Then** the convert button is disabled; if interacted with, the app indicates that an amount is required.
2. **Given** the entered amount is zero (`0`) or negative, **When** conversion is evaluated, **Then** the app blocks conversion and shows a clear validation message stating that the amount must be greater than zero.
3. **Given** non-numeric characters or malformed numbers are entered, **When** evaluated, **Then** the app blocks conversion and displays an invalid number error.

---

### User Story 3 - Show a reliable outcome when exchange data is unavailable (Priority: P2)

A user attempts to convert currency when the network or rate provider is unavailable. If an exact-pair cached rate exists from a previous session, the app performs the conversion with a prominent warning; otherwise, it displays an error without showing a false result.

**Why this priority**: Reliable offline behavior and clear error states prevent silent failures and ensure transparency.

**Independent Test**: With the network disconnected, convert a pair previously retrieved online to verify offline conversion with a dated warning banner. Convert an uncached pair to verify that conversion is blocked with an error.

**Acceptance Scenarios**:

1. **Given** the rate provider cannot be reached and an exact-pair cached rate exists in local storage, **When** the user requests conversion, **Then** the app calculates the result using the cached rate, displays a prominent warning banner that offline/cached data is being used, and shows the original publication date and cache time.
2. **Given** the rate provider cannot be reached and NO cached rate exists for the selected pair, **When** the user requests conversion, **Then** the app blocks conversion, hides any prior result, and displays a clear error message explaining that live data cannot be reached and no offline rate is available for this pair.
3. **Given** a non-business day (weekend or public holiday), **When** rates are fetched from the API, **Then** the app displays the latest published rate returned by the provider along with its actual publication date (last business day), without inventing rates or replacing the date with today's date.

---

### Edge Cases

- **Same source and target currency**: Handled instantly as 1:1 (`result = amount`). No network call is made. Source is displayed as "Local (1:1)" and date is shown as "N/A".
- **Weekends and holidays**: European Central Bank (ECB) publishes rates only on business days. The API returns the last published quote with its historical date (e.g., Friday's date over the weekend). The app displays this exact returned publication date and does not overwrite it with the current date.
- **Offline with exact cached pair**: Used for offline conversion; displayed with a visible warning banner indicating cached status and the original rate date.
- **Offline with reverse/different cached pair**: The cache must match the exact pair (`source` -> `target`). A cached `EUR -> USD` quote is not silently inverted for `USD -> EUR` unless explicitly fetched and stored for that pair. If no exact match exists, conversion is blocked with an explanatory error.
- **Zero or negative amounts**: Strictly rejected by validation. The amount must be a finite positive number (`amount > 0`).
- **Malformed / partial API response**: Treated as an API failure. Triggers the offline cache fallback if available, or displays an error. Synthetic or hard-coded fallback rates are strictly forbidden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to enter a numeric amount to convert.
- **FR-002**: The system MUST allow users to select a source currency and a target currency from supported currencies.
- **FR-003**: The system MUST calculate the converted result using the exchange rate for the selected currency pair.
- **FR-004**: The system MUST display the converted result in a readable format along with currency codes.
- **FR-005**: The system MUST validate that the entered amount is a finite positive number (`> 0`) before conversion.
- **FR-006**: The system MUST reject empty, non-numeric, zero, or negative values with explicit validation messages.
- **FR-007**: The system MUST disable the conversion action button whenever the amount input is empty.
- **FR-008**: The system MUST handle identical source and target currencies as a 1:1 conversion without issuing an external network request, displaying "Local (1:1)" as the source and "N/A" as the date.
- **FR-009**: The system MUST fetch live exchange rates from the Frankfurter API (European Central Bank reference rates).
- **FR-010**: The system MUST display the rate source (*Frankfurter / European Central Bank*) and the official publication date (`YYYY-MM-DD`) returned by the API for every live conversion.
- **FR-011**: On weekends and holidays, the system MUST display the actual publication date of the last published quote returned by the API and MUST NOT substitute the current date.
- **FR-012**: The system MUST persist each successfully retrieved exchange rate separately per currency pair (`source` and `target`) in persistent browser storage (`localStorage`), storing source currency, target currency, rate value, publication date, and timestamp of save.
- **FR-013**: When the network or rate provider is unavailable, the system MUST check for an exact-pair cached quote in storage. If found, it MUST perform the conversion and display a prominent warning banner indicating offline/cached data and its original publication date.
- **FR-014**: If the provider is unavailable and no exact-pair cached quote exists, the system MUST display an explanatory error and MUST NOT display a converted amount. Hard-coded or synthetic fallback rates MUST NOT be used.
- **FR-015**: The system MUST provide a control to swap source and target currencies quickly.

### Key Entities *(include if feature involves data)*

- **Currency**: An ISO-4217 currency code (e.g., USD, EUR, GBP, JPY), display name, and symbol.
- **Exchange Rate**: Represents the rate for a pair:
  - `source`: Source currency code (e.g. `USD`)
  - `target`: Target currency code (e.g. `EUR`)
  - `rate`: Numeric multiplier (> 0)
  - `date`: Official publication date from the provider (`YYYY-MM-DD`)
  - `timestamp`: Epoch/ISO timestamp when the rate was retrieved and stored
  - `isCached`: Boolean flag indicating whether the rate was loaded from offline storage
  - `sourceLabel`: Provider identification (*Frankfurter / European Central Bank* or *Local (1:1)*)
- **Conversion Request**: User-supplied `amount`, `fromCurrency`, and `toCurrency`.
- **Conversion Result**: `fromCurrency`, `toCurrency`, `amount`, `convertedAmount`, `rate`, `date`, `isCached`, and `warningMessage` (if offline).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete a conversion from input to visible result in under 3 seconds on a stable connection.
- **SC-002**: 100% of invalid inputs (empty, <= 0, non-numeric) are blocked with user-visible validation messages; the convert button is disabled when empty.
- **SC-003**: When offline, any previously fetched currency pair converts successfully and displays a clear warning banner with the original publication date.
- **SC-004**: When offline without a cached rate, the app displays a clear error explanation and does not display a misleading or synthetic number.
- **SC-005**: All unit and integration tests pass via a single command `npm test` without requiring external services or third-party dependencies.

## Assumptions

- Users access the application via a modern web browser supporting ES2022 and `localStorage`.
- Live rates are provided by the public Frankfurter API (`https://api.frankfurter.dev/v1/latest`), which provides ECB reference data with CORS enabled and no API key requirement.
- Outside ECB working hours (weekends and bank holidays), the API provides the latest published rate and date.
- The release prioritizes accuracy, offline transparency, and robust input validation.
