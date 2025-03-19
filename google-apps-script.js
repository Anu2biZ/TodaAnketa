// Глобальные настройки
const SPREADSHEET_ID = ''; // ID таблицы Google Sheets
const ONBOARDING_FOLDER_ID = ''; // ID корневой папки для файлов Onboarding в Google Drive
const RECIPIENT_EMAIL = ''; // Email для получения уведомлений

// Обработчик POST-запросов
function doPost(e) {
  let lock = null;
  try {
    lock = LockService.getScriptLock();
    lock.waitLock(30000); // Ждем до 30 секунд для получения блокировки
    
    const params = e.parameter;
    const formType = params.form_type;
    
    if (formType === 'onboarding') {
      return handleOnboardingForm(params);
    } else {
      throw new Error('Unsupported form type: ' + formType);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (lock && lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

// Обработчик данных формы Onboarding
function handleOnboardingForm(params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Onboarding');
  
  // Создаем папку для файлов пользователя
  const userFolder = createUserFolder(params.project_name);
  
  // Подготавливаем данные для записи
  const rowData = [
    params.sale_name,
    params.project_name,
    params.telegram_group,
    // Данные департаментов
    params.compliance_full_name,
    params.compliance_position,
    params.compliance_telegram,
    params.compliance_email,
    params.legal_full_name,
    params.legal_position,
    params.legal_telegram,
    params.legal_email,
    params.chargeback_full_name,
    params.chargeback_position,
    params.chargeback_telegram,
    params.chargeback_email,
    params.finance_full_name,
    params.finance_position,
    params.finance_telegram,
    params.finance_email,
    params.technical_full_name,
    params.technical_position,
    params.technical_telegram,
    params.technical_email,
    // Остальные данные
    params.comments,
    params.company_name,
    params.legal_address,
    params.registration_date,
    params.registration_number,
    params.license_jurisdiction,
    params.license_number,
    params.project_nature,
    params.industries,
    params.not_belongs_to_psp,
    params.website,
    params.ubo_country_citizenship,
    params.ubo_country_residence,
    params.director_country_citizenship,
    params.director_country_residence,
    params.shareholder_country_citizenship,
    params.shareholder_country_residence,
    params.urls,
    // Статусы файлов
    params.processing_history,
    params.chargeback_statistics,
    params.incorporation,
    params.incumbency,
    params.articles,
    params.ownershipChart,
    params.boardOfDirectors,
    params.shareholderRegister,
    params.operatingLicense,
    params.amlPolicy,
    params.mlroInformation,
    params.kycDocuments,
    params.legalEntityDocuments,
    new Date() // Дата создания записи
  ];
  
  // Добавляем данные в таблицу
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);
  
  // Форматируем ячейки
  formatNewRow(sheet, lastRow + 1);
  
  // Отправляем уведомление
  sendNotification(params);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    folderId: userFolder.getId()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Создание папки для файлов пользователя
function createUserFolder(projectName) {
  const rootFolder = DriveApp.getFolderById(ONBOARDING_FOLDER_ID);
  const folderName = `${projectName}_${new Date().toISOString().split('T')[0]}`;
  return rootFolder.createFolder(folderName);
}

// Форматирование новой строки
function formatNewRow(sheet, row) {
  // Форматирование даты
  const dateCell = sheet.getRange(row, sheet.getLastColumn());
  dateCell.setNumberFormat('dd.MM.yyyy HH:mm:ss');
  
  // Выравнивание текста
  sheet.getRange(row, 1, 1, sheet.getLastColumn()).setHorizontalAlignment('center');
  
  // Границы ячеек
  sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBorder(true, true, true, true, true, true);
}

// Отправка уведомления
function sendNotification(params) {
  const emailSubject = `Новая заявка Onboarding: ${params.project_name}`;
  const emailBody = `
    Получена новая заявка Onboarding:
    
    Проект: ${params.project_name}
    Компания: ${params.company_name}
    Менеджер: ${params.sale_name}
    
    Для просмотра полной информации перейдите в Google Sheets.
  `;
  
  if (RECIPIENT_EMAIL) {
    MailApp.sendEmail(RECIPIENT_EMAIL, emailSubject, emailBody);
  }
}

// Обработка загрузки файлов
function handleFileUpload(params) {
  try {
    const folder = DriveApp.getFolderById(params.folderId);
    const fileBlob = params.file;
    const fileName = `${params.type}_${params.index}${getFileExtension(fileBlob.getName())}`;
    
    const file = folder.createFile(fileBlob);
    file.setName(fileName);
    
    // Создаем публичную ссылку на файл
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      fileId: file.getId(),
      fileUrl: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Получение расширения файла
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 1);
}

// Функция для проверки наличия разрешений
function checkAuthorization() {
  console.log('Проверка текущих разрешений...');
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const userProperties = PropertiesService.getUserProperties();
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  
  console.log('Статус авторизации:', authInfo.getAuthorizationStatus());
  console.log('Требуемые разрешения:', authInfo.getAuthorizationUrl());
  
  return 'Проверка разрешений завершена. Проверьте логи для подробной информации.';
}

// Функция для запроса разрешений
function requestAuthorization() {
  console.log('Запрос разрешений...');

  try {
    // Проверяем наличие ID
    if (!SPREADSHEET_ID || !ONBOARDING_FOLDER_ID) {
      throw new Error('Пожалуйста, укажите SPREADSHEET_ID и ONBOARDING_FOLDER_ID перед запросом разрешений');
    }

    console.log('Запрос разрешений для Google Sheets...');
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('Доступ к таблице получен:', ss.getName());

    console.log('Запрос разрешений для Google Drive...');
    const folder = DriveApp.getFolderById(ONBOARDING_FOLDER_ID);
    console.log('Доступ к папке получен:', folder.getName());

    console.log('Запрос разрешений для Gmail...');
    const quota = MailApp.getRemainingDailyQuota();
    console.log('Доступ к почте получен. Доступная квота:', quota);

    console.log('Все разрешения успешно получены!');
    return 'Разрешения успешно получены. Теперь можно запустить функцию setup.';
  } catch (error) {
    const errorMessage = 'Ошибка при запросе разрешений: ' + error.message;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// Функция для первоначальной настройки и проверки разрешений
function setup() {
  console.log('Starting setup and permissions check...');

  try {
    // Проверяем ID таблицы
    console.log('Проверяем SPREADSHEET_ID...');
    if (!SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID не указан');
    }
    console.log('SPREADSHEET_ID: ' + SPREADSHEET_ID);

    // Проверяем ID папки
    console.log('Проверяем ONBOARDING_FOLDER_ID...');
    if (!ONBOARDING_FOLDER_ID) {
      throw new Error('ONBOARDING_FOLDER_ID не указан');
    }
    console.log('ONBOARDING_FOLDER_ID: ' + ONBOARDING_FOLDER_ID);

    // Пробуем получить доступ к таблице
    console.log('Проверяем доступ к таблице...');
    let ss;
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      console.log('Таблица найдена: ' + ss.getName());
    } catch (e) {
      throw new Error('Не удалось получить доступ к таблице: ' + e.message);
    }

    console.log('Проверяем наличие листа Onboarding...');
    const sheet = ss.getSheetByName('Onboarding');
    if (!sheet) {
      throw new Error('Лист "Onboarding" не найден в таблице');
    }
    console.log('Лист Onboarding найден');

    // Пробуем получить доступ к папке
    console.log('Проверяем доступ к папке...');
    let folder;
    try {
      folder = DriveApp.getFolderById(ONBOARDING_FOLDER_ID);
      console.log('Папка найдена: ' + folder.getName());
    } catch (e) {
      throw new Error('Не удалось получить доступ к папке: ' + e.message);
    }

    // Проверяем возможность создания тестовой папки
    console.log('Проверяем возможность создания папки...');
    let testFolder;
    try {
      testFolder = folder.createFolder('test_' + new Date().getTime());
      testFolder.setDescription('Тестовая папка для проверки разрешений');
      console.log('Тестовая папка успешно создана');
    } catch (e) {
      throw new Error('Не удалось создать тестовую папку: ' + e.message);
    }

    // Удаляем тестовую папку
    try {
      testFolder.setTrashed(true);
      console.log('Тестовая папка удалена');
    } catch (e) {
      console.log('Предупреждение: не удалось удалить тестовую папку: ' + e.message);
    }

    // Проверяем возможность отправки email
    console.log('Проверяем настройки email...');
    if (!RECIPIENT_EMAIL) {
      console.log('ВНИМАНИЕ: RECIPIENT_EMAIL не указан. Уведомления по email работать не будут.');
    } else {
      console.log('Email получателя указан: ' + RECIPIENT_EMAIL);
    }

    console.log('Настройка завершена успешно!');
    return 'Настройка завершена успешно! Проверьте логи для подробной информации.';
  } catch (error) {
    const errorMessage = 'Ошибка при настройке: ' + error.message;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// Функция для тестирования
function testScript() {
  // Тестовые данные
  const testParams = {
    form_type: 'onboarding',
    project_name: 'Test Project',
    telegram_group: 'test_group',
    sale_name: 'Test Manager',
    company_name: 'Test Company',
    comments: 'Test Comment',
    // Добавляем минимальный набор обязательных параметров
    compliance_full_name: 'NO',
    compliance_position: 'NO',
    compliance_telegram: 'NO',
    compliance_email: 'NO',
    legal_full_name: 'NO',
    legal_position: 'NO',
    legal_telegram: 'NO',
    legal_email: 'NO',
    chargeback_full_name: 'NO',
    chargeback_position: 'NO',
    chargeback_telegram: 'NO',
    chargeback_email: 'NO',
    finance_full_name: 'NO',
    finance_position: 'NO',
    finance_telegram: 'NO',
    finance_email: 'NO',
    technical_full_name: 'NO',
    technical_position: 'NO',
    technical_telegram: 'NO',
    technical_email: 'NO',
    legal_address: 'Test Address',
    registration_date: '01.01.2023',
    registration_number: '12345',
    license_jurisdiction: 'NO',
    license_number: 'NO',
    project_nature: 'Test Nature',
    industries: 'NO',
    not_belongs_to_psp: false,
    website: 'NO',
    ubo_country_citizenship: 'Test Country',
    ubo_country_residence: 'Test Country',
    director_country_citizenship: 'Test Country',
    director_country_residence: 'Test Country',
    shareholder_country_citizenship: 'Test Country',
    shareholder_country_residence: 'Test Country',
    urls: 'test.com',
    processing_history: 'NO',
    chargeback_statistics: 'NO',
    incorporation: 'NO',
    incumbency: 'NO',
    articles: 'NO',
    ownershipChart: 'NO',
    boardOfDirectors: 'NO',
    shareholderRegister: 'NO',
    operatingLicense: 'NO',
    amlPolicy: 'NO',
    mlroInformation: 'NO',
    kycDocuments: 'NO',
    legalEntityDocuments: 'NO'
  };

  // Имитируем POST-запрос
  const testEvent = { parameter: testParams };
  
  try {
    console.log('Запуск тестового скрипта...');
    
    // Сначала проверяем настройки
    console.log('Запуск проверки настроек...');
    setup();
    console.log('Настройки проверены успешно');
    
    // Затем пробуем отправить тестовые данные
    console.log('Отправка тестовых данных...');
    const result = doPost(testEvent);
    console.log('Тест выполнен успешно');
    console.log('Результат:', result.getContent());
    return 'Тест выполнен успешно! Проверьте логи для подробной информации.';
  } catch (error) {
    const errorMessage = 'Ошибка при тестировании: ' + error.message;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
