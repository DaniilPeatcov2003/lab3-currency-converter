# Currency Converter

Браузерный конвертер валют на основе курсов Frankfurter / Европейского центрального банка.

## Запуск

Откройте каталог приложения и запустите локальный HTTP-сервер:

```powershell
cd lab3-currency-converter
python -m http.server 8000
```

Откройте `http://localhost:8000/src/`. Для запуска тестов из каталога приложения:

```powershell
npm test
```

Требуется Node.js 20 или новее. Подробности о сценариях и ручной проверке см. в [quickstart](./lab3-currency-converter/specs/001-currency-converter/quickstart.md); отчёт по реализации — в [REPORT.md](./REPORT.md).
