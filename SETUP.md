# Инструкция по настройке интеграции с Google Sheets и Google Drive

## 1. Создание Google Sheets

1. Создайте новую таблицу Google Sheets
2. Создайте лист с названием "Onboarding"
3. Добавьте следующие заголовки столбцов:
   - Date
   - Sale Manager Name
   - Project Name
   - Telegram Group
   - Compliance Full Name
   - Compliance Position
   - Compliance Telegram
   - Compliance Email
   - Legal Full Name
   - Legal Position
   - Legal Telegram
   - Legal Email
   - Chargeback Full Name
   - Chargeback Position
   - Chargeback Telegram
   - Chargeback Email
   - Finance Full Name
   - Finance Position
   - Finance Telegram
   - Finance Email
   - Technical Full Name
   - Technical Position
   - Technical Telegram
   - Technical Email
   - Comments
   - Company Name
   - Legal Address
   - Registration Date
   - Registration Number
   - License Jurisdiction
   - License Number
   - Project Nature
   - Industries
   - Not Belongs To PSP
   - Website
   - UBO Country Citizenship
   - UBO Country Residence
   - Director Country Citizenship
   - Director Country Residence
   - Shareholder Country Citizenship
   - Shareholder Country Residence
   - URL List
   - Processing History
   - Chargeback Statistics
   - Certificate of Incorporation
   - Certificate of Incumbency
   - Articles & Memorandum
   - Ownership Chart
   - Board of Directors
   - Shareholder Register
   - Operating License
   - AML Policy
   - MLRO Information
   - KYC Documents
   - Legal Entity Documents

4. Скопируйте ID таблицы из URL (часть между /d/ и /edit)

## 2. Создание структуры в Google Drive

1. Создайте корневую папку "Onboarding" в Google Drive
2. Скопируйте ID папки из URL
3. Настройте права доступа к папке для записи из Apps Script

## 3. Настройка Google Apps Script

1. Откройте [Google Apps Script](https://script.google.com)
2. Создайте новый проект
3. Настройка проекта:
   - Создайте файл Code.gs и скопируйте в него содержимое из google-apps-script.js
   - Откройте Project Settings (⚙️)
   - В разделе Script Properties добавьте:
     * SPREADSHEET_ID - ID таблицы из шага 1
     * ONBOARDING_FOLDER_ID - ID папки из шага 2
     * RECIPIENT_EMAIL - Email для получения уведомлений
   - В разделе OAuth Scopes проверьте список разрешений
   - Необходимые разрешения будут добавлены автоматически при использовании:
     * SpreadsheetApp - для работы с Google Sheets
     * DriveApp - для работы с Google Drive
     * MailApp - для отправки email

4. Настройка переменных окружения:
   - Создайте файл .env в корне проекта
   - Добавьте URL скрипта, полученный после публикации Apps Script:
     ```
     VITE_GOOGLE_SCRIPT_URL=ВАШ_URL_СКРИПТА
     ```
   - Перезапустите dev сервер, если он был запущен

5. В файле Code.gs замените получение констант на чтение из Script Properties:
   ```javascript
   // Глобальные настройки
   const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
   const ONBOARDING_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('ONBOARDING_FOLDER_ID');
   const RECIPIENT_EMAIL = PropertiesService.getScriptProperties().getProperty('RECIPIENT_EMAIL');
   ```
5. Настройка разрешений:
   - В редакторе Apps Script найдите функцию checkAuthorization
   - Нажмите кнопку "Run" (▶️) рядом с функцией checkAuthorization
   - В консоли (View > Execution log) проверьте статус текущих разрешений
   - Если разрешения отсутствуют, найдите функцию requestAuthorization
   - Нажмите кнопку "Run" (▶️) рядом с функцией requestAuthorization
   - В появившемся окне "Authorization required" нажмите "Review permissions"
   - Выберите свой Google аккаунт
   - В окне "Google hasn't verified this app" нажмите "Advanced"
   - Нажмите "Go to [Название проекта] (unsafe)"
   - Просмотрите запрашиваемые разрешения и нажмите "Allow"
   - Дождитесь сообщения об успешном запросе разрешений

6. Проверка настроек:
   - В редакторе Apps Script найдите функцию setup
   - Убедитесь, что вы заполнили все необходимые ID в начале файла:
     ```javascript
     const SPREADSHEET_ID = '1abc...xyz';     // Ваш ID таблицы
     const ONBOARDING_FOLDER_ID = '2def...uvw'; // Ваш ID папки
     const RECIPIENT_EMAIL = 'your@email.com';  // Ваш email
     ```
   - Нажмите кнопку "Run" (▶️) рядом с функцией setup
   - В консоли (View > Execution log) проверьте логи настройки
   - Убедитесь, что все проверки прошли успешно

7. Запуск тестового скрипта:
   - После успешной настройки найдите функцию testScript
   - Нажмите кнопку "Run" (▶️) рядом с функцией testScript
   - В консоли (View > Execution log) проверьте логи тестирования
   - Убедитесь, что в таблице появилась тестовая запись
   - Проверьте, что в Google Drive создалась тестовая папка

8. Публикация скрипта:
   - Нажмите "Deploy" > "New deployment"
   - Выберите "Web app"
   - Установите:
     - Execute as: Me
     - Who has access: Anyone
   - Нажмите "Deploy"
   - Скопируйте URL веб-приложения

## 4. Проверка настройки

1. Убедитесь, что все необходимые файлы созданы и настроены:
   - Code.gs в Google Apps Script
   - .env с URL скрипта в корне проекта
   - Все Script Properties установлены в Google Apps Script

2. Запустите приложение:
   ```bash
   npm run dev
   ```

3. Проверьте работу формы:
   - Заполните все поля
   - Загрузите тестовые файлы
   - Отправьте форму
   - Проверьте появление данных в Google Sheets
   - Проверьте создание папки и загрузку файлов в Google Drive

## 5. Финальное тестирование

1. Запустите приложение
2. Заполните форму Onboarding
3. Проверьте:
   - Данные в Google Sheets
   - Создание папки в Google Drive
   - Загрузку файлов
   - Получение email уведомлений

## Примечания

- При возникновении ошибок проверьте:
  - Правильность ID таблицы и папки
  - Права доступа к таблице и папке (должны быть доступны для редактирования)
  - URL скрипта в приложении
  - Статус авторизации в Apps Script
