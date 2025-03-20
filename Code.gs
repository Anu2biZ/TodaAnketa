// Глобальные настройки
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
const ONBOARDING_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('ONBOARDING_FOLDER_ID');
const RECIPIENT_EMAIL = PropertiesService.getScriptProperties().getProperty('RECIPIENT_EMAIL');

// Функция для добавления лога в таблицу
function addLog(message, type = 'INFO') {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logsSheet = ss.getSheetByName('LOGS');
    
    // Создаем лист LOGS, если он не существует
    if (!logsSheet) {
      logsSheet = ss.insertSheet('LOGS');
      // Добавляем заголовки
      logsSheet.getRange('A1:D1').setValues([['Timestamp', 'Type', 'Message', 'Function']])
        .setFontWeight('bold')
        .setBackground('#f3f3f3');
      logsSheet.setFrozenRows(1);
      // Устанавливаем ширину столбцов
      logsSheet.setColumnWidth(1, 180); // Timestamp
      logsSheet.setColumnWidth(2, 80);  // Type
      logsSheet.setColumnWidth(3, 500); // Message
      logsSheet.setColumnWidth(4, 150); // Function
    }
    
    // Получаем имя функции из стека вызовов
    const functionName = (new Error()).stack.split('\n')[2].trim().split(' ')[1] || 'Unknown';
    
    // Добавляем новую строку с логом
    logsSheet.appendRow([
      new Date(),
      type,
      message,
      functionName
    ]);
    
    // Форматируем новую строку
    const lastRow = logsSheet.getLastRow();
    logsSheet.getRange(lastRow, 1).setNumberFormat('dd.MM.yyyy HH:mm:ss');
    
    // Устанавливаем цвет в зависимости от типа лога
    const typeCell = logsSheet.getRange(lastRow, 2);
    switch (type) {
      case 'ERROR':
        typeCell.setBackground('#ffcdd2'); // Светло-красный
        break;
      case 'WARNING':
        typeCell.setBackground('#fff9c4'); // Светло-желтый
        break;
      case 'SUCCESS':
        typeCell.setBackground('#c8e6c9'); // Светло-зеленый
        break;
      default:
        typeCell.setBackground('#ffffff'); // Белый для INFO
    }
    
    // Добавляем границы
    logsSheet.getRange(lastRow, 1, 1, 4).setBorder(true, true, true, true, true, true);
  } catch (error) {
    // В случае ошибки используем стандартный Logger
    Logger.log('Ошибка при записи в лог: ' + error.message);
    Logger.log(message);
  }
}

// Создание меню при открытии таблицы
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Управление')
    .addItem('📋 Показать логи', 'viewLogs')
    .addSeparator()
    .addItem('🧪 Тест загрузки файла', 'testFileUpload')
    .addItem('✅ Проверить настройки', 'setup')
    .addToUi();
}

// Функция для проверки наличия разрешений
function checkAuthorization() {
  addLog(' НАЧАЛО ПРОВЕРКИ РАЗРЕШЕНИЙ ');
  addLog('Время начала: ' + new Date().toISOString());
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const userProperties = PropertiesService.getUserProperties();
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  
  // Проверяем статус авторизации
  const authStatus = authInfo.getAuthorizationStatus();
  const statusText = authStatus === ScriptApp.AuthorizationStatus.REQUIRED ? 'Требуется авторизация' :
                    authStatus === ScriptApp.AuthorizationStatus.NOT_REQUIRED ? 'Авторизация не требуется' :
                    'Неизвестный статус';
  addLog('Статус авторизации: ' + statusText,
    authStatus === ScriptApp.AuthorizationStatus.NOT_REQUIRED ? 'SUCCESS' : 'WARNING');

  // Проверяем наличие необходимых свойств
  const properties = scriptProperties.getProperties();
  addLog('Текущие настройки:');
  addLog('- SPREADSHEET_ID: ' + (properties.SPREADSHEET_ID || 'не указан'),
    properties.SPREADSHEET_ID ? 'SUCCESS' : 'WARNING');
  addLog('- ONBOARDING_FOLDER_ID: ' + (properties.ONBOARDING_FOLDER_ID || 'не указан'),
    properties.ONBOARDING_FOLDER_ID ? 'SUCCESS' : 'WARNING');
  addLog('- RECIPIENT_EMAIL: ' + (properties.RECIPIENT_EMAIL || 'не указан'),
    properties.RECIPIENT_EMAIL ? 'SUCCESS' : 'WARNING');

  // Проверяем доступ к сервисам
  try {
    addLog('Проверка доступа к сервисам:');
    
    // Проверяем Google Sheets
    if (properties.SPREADSHEET_ID) {
      const ss = SpreadsheetApp.openById(properties.SPREADSHEET_ID);
      addLog('✓ Google Sheets: доступ получен, таблица: ' + ss.getName(), 'SUCCESS');
    } else {
      addLog('❌ Google Sheets: не проверено (ID не указан)', 'WARNING');
    }
    
    // Проверяем Google Drive
    if (properties.ONBOARDING_FOLDER_ID) {
      const folder = DriveApp.getFolderById(properties.ONBOARDING_FOLDER_ID);
      addLog('✓ Google Drive: доступ получен, папка: ' + folder.getName(), 'SUCCESS');
    } else {
      addLog('❌ Google Drive: не проверено (ID не указан)', 'WARNING');
    }
    
    // Проверяем Gmail
    const quota = MailApp.getRemainingDailyQuota();
    addLog('✓ Gmail: доступ получен, доступная квота: ' + quota, 'SUCCESS');
  } catch (e) {
    addLog('❌ Ошибка при проверке доступа: ' + e.message, 'ERROR');
  }
  
  addLog(' ПРОВЕРКА РАЗРЕШЕНИЙ ЗАВЕРШЕНА ', 'SUCCESS');
  return 'Проверка разрешений завершена. Проверьте таблицу LOGS для подробной информации.';
}

// Функция для запроса разрешений
function requestAuthorization() {
  addLog(' НАЧАЛО ЗАПРОСА РАЗРЕШЕНИЙ ');
  addLog('Время начала: ' + new Date().toISOString());

  try {
    // Проверяем наличие ID
    const scriptProperties = PropertiesService.getScriptProperties();
    const properties = scriptProperties.getProperties();
    
    if (!properties.SPREADSHEET_ID || !properties.ONBOARDING_FOLDER_ID) {
      throw new Error('Пожалуйста, укажите SPREADSHEET_ID и ONBOARDING_FOLDER_ID в Script Properties');
    }

    addLog('Запрос разрешений для Google Sheets...');
    const ss = SpreadsheetApp.openById(properties.SPREADSHEET_ID);
    addLog('Доступ к таблице получен: ' + ss.getName(), 'SUCCESS');

    addLog('Запрос разрешений для Google Drive...');
    const folder = DriveApp.getFolderById(properties.ONBOARDING_FOLDER_ID);
    addLog('Доступ к папке получен: ' + folder.getName(), 'SUCCESS');

    addLog('Запрос разрешений для Gmail...');
    const quota = MailApp.getRemainingDailyQuota();
    addLog('Доступ к почте получен. Доступная квота: ' + quota, 'SUCCESS');

    addLog(' РАЗРЕШЕНИЯ УСПЕШНО ПОЛУЧЕНЫ ', 'SUCCESS');
    return 'Разрешения успешно получены. Теперь можно запустить функцию setup.';
  } catch (error) {
    addLog('Ошибка при запросе разрешений: ' + error.message, 'ERROR');
    throw new Error(error.message);
  }
}

// Функция для первоначальной настройки и проверки разрешений
function setup() {
  addLog(' НАЧАЛО НАСТРОЙКИ ');
  addLog('Время начала: ' + new Date().toISOString());

  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const properties = scriptProperties.getProperties();

    // Проверяем ID таблицы
    addLog('Проверяем SPREADSHEET_ID...');
    if (!properties.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID не указан');
    }
    addLog('SPREADSHEET_ID: ' + properties.SPREADSHEET_ID, 'SUCCESS');

    // Проверяем ID папки
    addLog('Проверяем ONBOARDING_FOLDER_ID...');
    if (!properties.ONBOARDING_FOLDER_ID) {
      throw new Error('ONBOARDING_FOLDER_ID не указан');
    }
    addLog('ONBOARDING_FOLDER_ID: ' + properties.ONBOARDING_FOLDER_ID, 'SUCCESS');

    // Пробуем получить доступ к таблице
    addLog('Проверяем доступ к таблице...');
    let ss;
    try {
      ss = SpreadsheetApp.openById(properties.SPREADSHEET_ID);
      addLog('Таблица найдена: ' + ss.getName(), 'SUCCESS');
    } catch (e) {
      throw new Error('Не удалось получить доступ к таблице: ' + e.message);
    }

    addLog('Проверяем наличие листа Onboarding...');
    const sheet = ss.getSheetByName('Onboarding');
    if (!sheet) {
      throw new Error('Лист "Onboarding" не найден в таблице');
    }
    addLog('Лист Onboarding найден', 'SUCCESS');

    // Пробуем получить доступ к папке
    addLog('Проверяем доступ к папке...');
    let folder;
    try {
      folder = DriveApp.getFolderById(properties.ONBOARDING_FOLDER_ID);
      addLog('Папка найдена: ' + folder.getName(), 'SUCCESS');
    } catch (e) {
      throw new Error('Не удалось получить доступ к папке: ' + e.message);
    }

    // Проверяем возможность создания тестовой папки
    addLog('Проверяем возможность создания папки...');
    let testFolder;
    try {
      testFolder = folder.createFolder('test_' + new Date().getTime());
      testFolder.setDescription('Тестовая папка для проверки разрешений');
      addLog('Тестовая папка успешно создана', 'SUCCESS');
    } catch (e) {
      throw new Error('Не удалось создать тестовую папку: ' + e.message);
    }

    // Удаляем тестовую папку
    try {
      testFolder.setTrashed(true);
      addLog('Тестовая папка удалена', 'SUCCESS');
    } catch (e) {
      addLog('Предупреждение: не удалось удалить тестовую папку: ' + e.message, 'WARNING');
    }

    // Проверяем возможность отправки email
    addLog('Проверяем настройки email...');
    if (!properties.RECIPIENT_EMAIL) {
      addLog('ВНИМАНИЕ: RECIPIENT_EMAIL не указан. Уведомления по email работать не будут.', 'WARNING');
    } else {
      addLog('Email получателя указан: ' + properties.RECIPIENT_EMAIL, 'SUCCESS');
    }

    addLog(' НАСТРОЙКА ЗАВЕРШЕНА УСПЕШНО ', 'SUCCESS');
    return 'Настройка завершена успешно! Проверьте таблицу LOGS для подробной информации.';
  } catch (error) {
    addLog('Ошибка при настройке: ' + error.message, 'ERROR');
    throw new Error(error.message);
  }
}

// Обработчик GET-запросов
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Обработчик POST-запросов
function doPost(e) {
  addLog('=================== НАЧАЛО ОБРАБОТКИ POST ЗАПРОСА ===================');
  addLog('Время начала: ' + new Date().toISOString());
  
  let lock = null;
  const properties = PropertiesService.getScriptProperties().getProperties();
  
  // Функция для получения блокировки с повторными попытками
  const acquireLock = () => {
    const maxAttempts = 3;
    const waitTime = 10000; // 10 секунд между попытками
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        addLog(`Попытка получения блокировки ${attempt}/${maxAttempts}...`);
        lock = LockService.getScriptLock();
        lock.waitLock(60000); // Увеличиваем тайм-аут до 60 секунд
        addLog('Блокировка получена', 'SUCCESS');
        return true;
      } catch (error) {
        if (attempt === maxAttempts) {
          addLog(`Не удалось получить блокировку после ${maxAttempts} попыток`, 'ERROR');
          throw error;
        }
        addLog(`Не удалось получить блокировку, попытка ${attempt}. Ожидание ${waitTime/1000} секунд...`, 'WARNING');
        Utilities.sleep(waitTime);
      }
    }
    return false;
  };
  
  try {
    
    // Получаем параметры запроса
    addLog('Получаем параметры запроса...');
    addLog('Тип запроса: ' + (e.postData ? e.postData.type : 'обычный POST'));
    addLog('Параметры в URL: ' + JSON.stringify(e.parameter));
    addLog('Тело запроса: ' + (e.postData ? e.postData.contents : 'отсутствует'));
    
    let params = {};
    
    // Если это multipart/form-data запрос
    if (e.postData && e.postData.type === "multipart/form-data") {
      addLog('Обработка multipart/form-data запроса:');
      addLog('- Content-Type: ' + e.postData.type);
      addLog('- Content-Length: ' + e.postData.length);
      addLog('- Parameter count: ' + Object.keys(e.parameter || {}).length);
      addLog('- Параметры: ' + JSON.stringify(e.parameter));
      
      // Проверяем размер данных (максимум 5MB для чанка)
      const maxSize = 5 * 1024 * 1024;
      if (e.postData.length > maxSize) {
        addLog('Превышен максимальный размер данных: ' + e.postData.length + ' (максимум: ' + maxSize + ')', 'ERROR');
        throw new Error('Размер чанка превышает 5MB');
      }
      addLog('Размер данных в пределах нормы', 'SUCCESS');
      
      // Получаем параметры из FormData и тела запроса
      for (let key in e.parameter) {
        params[key] = e.parameter[key];
      }
      
      // Параметры из тела запроса
      if (e.postData.contents) {
        try {
          const postParams = JSON.parse(e.postData.contents);
          for (let key in postParams) {
            params[key] = postParams[key];
          }
          addLog('Параметры из тела запроса успешно обработаны', 'SUCCESS');
        } catch (err) {
          // Если не удалось распарсить как JSON, значит это обычные form-data параметры
          addLog('Не удалось распарсить тело запроса как JSON', 'WARNING');
        }
      }
    } else {
      // Обычный POST запрос
      params = e.parameter;
      
      // Пробуем получить параметры из тела запроса
      if (e.postData && e.postData.contents) {
        try {
          const postParams = JSON.parse(e.postData.contents);
          for (let key in postParams) {
            params[key] = postParams[key];
          }
          addLog('Параметры из тела запроса успешно обработаны', 'SUCCESS');
        } catch (err) {
          addLog('Не удалось распарсить тело запроса как JSON', 'WARNING');
        }
      }
    }
    
    // Проверяем наличие параметров
    if (!params || Object.keys(params).length === 0) {
      throw new Error('No parameters provided');
    }

    addLog('Тип формы: ' + params.form_type);
    
    // Обрабатываем запрос в зависимости от типа формы
    let result;
    switch (params.form_type) {
      case 'onboarding':
        // Для формы onboarding нужна блокировка, так как мы пишем в таблицу
        if (!acquireLock()) {
          throw new Error('Не удалось получить блокировку для записи в таблицу');
        }
        try {
          result = handleOnboardingForm(params);
          addLog('Форма Onboarding успешно обработана', 'SUCCESS');
        } finally {
          if (lock && lock.hasLock()) {
            lock.releaseLock();
            addLog('Блокировка освобождена', 'SUCCESS');
          }
        }
        break;
      case 'file_upload':
        // Для загрузки файла блокировка не нужна
        result = handleFileUpload(params);
        addLog('Загрузка файла успешно обработана', 'SUCCESS');
        break;
      default:
        throw new Error('Unsupported form type: ' + params.form_type);
    }
    
    return result;
  } catch (error) {
    addLog('Ошибка в doPost: ' + error.message, 'ERROR');
    addLog('Stack: ' + error.stack, 'ERROR');
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (lock && lock.hasLock()) {
      lock.releaseLock();
      addLog('Блокировка освобождена', 'SUCCESS');
    }
  }
}

// Обработчик данных формы Onboarding
function handleOnboardingForm(params) {
  addLog(' НАЧАЛО ОБРАБОТКИ ФОРМЫ ONBOARDING ');
  addLog('Время начала: ' + new Date().toISOString());
  
  try {
    addLog('Получаем доступ к таблице...');
    const properties = PropertiesService.getScriptProperties().getProperties();
    const ss = SpreadsheetApp.openById(properties.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Onboarding');
    addLog('Доступ к таблице получен', 'SUCCESS');
    
    // Создаем папку для файлов пользователя
    addLog('Создаем папку для проекта: ' + params.project_name);
    const userFolder = createUserFolder(params.project_name);
    addLog('Папка создана: ' + userFolder.getName(), 'SUCCESS');
    
    // Подготавливаем данные для записи
    addLog('Подготавливаем данные для записи...');
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
    addLog('Данные подготовлены', 'SUCCESS');
    
    // Добавляем данные в таблицу
    addLog('Добавляем данные в таблицу...');
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);
    addLog('Данные добавлены в строку ' + (lastRow + 1), 'SUCCESS');
    
    // Форматируем ячейки
    addLog('Форматируем ячейки...');
    formatNewRow(sheet, lastRow + 1);
    addLog('Форматирование завершено', 'SUCCESS');
    
    // Отправляем уведомление
    addLog('Отправляем уведомление...');
    sendNotification(params);
    addLog('Уведомление отправлено', 'SUCCESS');
    
    const response = {
      status: 'success',
      folderId: userFolder.getId()
    };
    
    addLog('Отправляем успешный ответ: ' + JSON.stringify(response), 'SUCCESS');
    addLog(' ОБРАБОТКА ФОРМЫ ЗАВЕРШЕНА УСПЕШНО ', 'SUCCESS');
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    addLog('Ошибка при обработке формы: ' + error.message, 'ERROR');
    throw error;
  }
}

// Создание папки для файлов пользователя
function createUserFolder(projectName) {
  addLog('Создание папки для проекта: ' + projectName);
  try {
    const properties = PropertiesService.getScriptProperties().getProperties();
    const rootFolder = DriveApp.getFolderById(properties.ONBOARDING_FOLDER_ID);
    const folderName = `${projectName}_${new Date().toISOString().split('T')[0]}`;
    const newFolder = rootFolder.createFolder(folderName);
    addLog('Папка создана успешно: ' + newFolder.getName(), 'SUCCESS');
    return newFolder;
  } catch (error) {
    addLog('Ошибка при создании папки: ' + error.message, 'ERROR');
    throw error;
  }
}

// Форматирование новой строки
function formatNewRow(sheet, row) {
  addLog('Форматирование строки ' + row);
  try {
    // Форматирование даты
    addLog('Форматирование даты...');
    const dateCell = sheet.getRange(row, sheet.getLastColumn());
    dateCell.setNumberFormat('dd.MM.yyyy HH:mm:ss');
    
    // Выравнивание текста
    addLog('Настройка выравнивания...');
    sheet.getRange(row, 1, 1, sheet.getLastColumn()).setHorizontalAlignment('center');
    
    // Границы ячеек
    addLog('Добавление границ...');
    sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBorder(true, true, true, true, true, true);
    
    addLog('Форматирование строки завершено', 'SUCCESS');
  } catch (error) {
    addLog('Ошибка при форматировании строки: ' + error.message, 'ERROR');
    throw error;
  }
}

// Отправка уведомления
function sendNotification(params) {
  addLog('Отправка уведомления о новой заявке...');
  try {
    const properties = PropertiesService.getScriptProperties().getProperties();
    if (!properties.RECIPIENT_EMAIL) {
      addLog('Email получателя не указан в настройках', 'WARNING');
      return;
    }
    
    const emailSubject = `Новая заявка Onboarding: ${params.project_name}`;
    const emailBody = `
      Получена новая заявка Onboarding:
      
      Проект: ${params.project_name}
      Компания: ${params.company_name}
      Менеджер: ${params.sale_name}
      
      Для просмотра полной информации перейдите в Google Sheets.
    `;
    
    MailApp.sendEmail(properties.RECIPIENT_EMAIL, emailSubject, emailBody);
    addLog('Уведомление успешно отправлено на ' + properties.RECIPIENT_EMAIL, 'SUCCESS');
  } catch (error) {
    addLog('Ошибка при отправке уведомления: ' + error.message, 'ERROR');
    throw error;
  }
}

// Кэш для хранения чанков файлов
const fileChunksCache = {};

// Обработка загрузки файлов
function handleFileUpload(params) {
  addLog(' НАЧАЛО ЗАГРУЗКИ ФАЙЛА ');
  addLog('Время начала: ' + new Date().toISOString());
  
  try {
    // Логируем все входящие параметры
    addLog('Входящие параметры:');
    addLog('form_type: ' + params.form_type);
    addLog('type: ' + params.type);
    addLog('index: ' + params.index);
    addLog('chunk_index: ' + params.chunk_index);
    addLog('total_chunks: ' + params.total_chunks);
    addLog('folderId: ' + params.folderId);
    addLog('filename: ' + params.filename);
    addLog('contentType: ' + params.contentType);
    addLog('file length: ' + (params.file ? params.file.length : 'no file'));

    // Проверяем наличие всех необходимых параметров
    if (!params.form_type || params.form_type !== 'file_upload') {
      throw new Error('Неверный тип формы: ' + params.form_type);
    }
    if (!params.file) {
      throw new Error('Файл не найден в параметрах');
    }
    if (!params.folderId) {
      throw new Error('ID папки не указан');
    }
    if (!params.type) {
      throw new Error('Тип документа не указан');
    }
    if (!params.filename) {
      throw new Error('Имя файла не указано');
    }
    if (!params.contentType) {
      throw new Error('Тип контента не указан');
    }
    if (params.chunk_index === undefined || params.total_chunks === undefined) {
      throw new Error('Не указана информация о чанках');
    }

    addLog('Все необходимые параметры присутствуют', 'SUCCESS');
    
    // Получаем доступ к папке
    addLog('Получаем доступ к папке: ' + params.folderId);
    let folder;
    try {
      folder = DriveApp.getFolderById(params.folderId);
      addLog('Папка найдена: ' + folder.getName(), 'SUCCESS');
    } catch (folderError) {
      addLog('Ошибка при получении папки: ' + folderError.message, 'ERROR');
      throw new Error('Не удалось получить доступ к папке: ' + folderError.message);
    }

    // Создаем уникальный ключ для файла
    const fileKey = `${params.folderId}_${params.type}_${params.index}_${params.filename}`;
    
    // Проверяем существование кэша для файла
    if (!fileChunksCache[fileKey]) {
      fileChunksCache[fileKey] = {
        chunks: new Array(parseInt(params.total_chunks)),
        receivedChunks: 0
      };
      addLog(`Инициализирован кэш для файла ${fileKey}`, 'SUCCESS');
    }

    // Сохраняем чанк
    addLog(`Сохранение чанка ${parseInt(params.chunk_index) + 1}/${params.total_chunks}`);
    const chunkIndex = parseInt(params.chunk_index);
    fileChunksCache[fileKey].chunks[chunkIndex] = params.file;
    fileChunksCache[fileKey].receivedChunks++;

    addLog(`Текущий статус: получено ${fileChunksCache[fileKey].receivedChunks} из ${params.total_chunks} чанков`);

    // Если это не последний чанк, возвращаем промежуточный результат
    if (fileChunksCache[fileKey].receivedChunks < params.total_chunks) {
      addLog(`Получено ${fileChunksCache[fileKey].receivedChunks} из ${params.total_chunks} чанков`, 'SUCCESS');
      return ContentService.createTextOutput(JSON.stringify({
        status: 'chunk_received',
        message: `Chunk ${params.chunk_index + 1}/${params.total_chunks} received`
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Если получены все чанки, собираем файл
    addLog('Получены все чанки, собираем файл...');
    const completeBase64 = fileChunksCache[fileKey].chunks.join('');
    delete fileChunksCache[fileKey]; // Очищаем кэш

    // Создаем файл
    const fileName = `${params.type}_${params.index || 1}${getFileExtension(params.filename)}`;
    addLog('Имя файла: ' + fileName);

    try {
      // Декодируем base64
      addLog('Декодируем base64...');
      const decodedData = Utilities.base64Decode(completeBase64);
      addLog('Данные декодированы, размер: ' + decodedData.length, 'SUCCESS');

      // Создаем blob
      addLog('Создаем blob...');
      const fileBlob = Utilities.newBlob(decodedData, params.contentType, fileName);
      addLog('Blob создан', 'SUCCESS');

      // Создаем файл
      addLog('Сохраняем файл в Drive...');
      const file = folder.createFile(fileBlob);
      addLog('Файл создан, ID: ' + file.getId(), 'SUCCESS');

      // Устанавливаем имя
      file.setName(fileName);
      addLog('Имя файла установлено: ' + file.getName(), 'SUCCESS');

      // Настраиваем доступ
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      addLog('Настроен доступ к файлу', 'SUCCESS');

      // Проверяем созданный файл
      addLog('Проверка созданного файла:');
      addLog('- ID: ' + file.getId());
      addLog('- Имя: ' + file.getName());
      addLog('- Размер: ' + file.getSize());
      addLog('- URL: ' + file.getUrl());

      const response = {
        status: 'success',
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        fileName: file.getName()
      };

      addLog('Отправляем успешный ответ: ' + JSON.stringify(response), 'SUCCESS');
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
      addLog('Ошибка при создании файла: ' + error.message, 'ERROR');
      throw error;
    }
  } catch (error) {
    addLog('Ошибка при загрузке файла: ' + error.message, 'ERROR');
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Получение расширения файла
function getFileExtension(filename) {
  addLog('Получаем расширение для файла: ' + filename);
  const lastDotIndex = filename.lastIndexOf('.');
  addLog('Индекс последней точки: ' + lastDotIndex);
  
  if (lastDotIndex === -1) {
    addLog('Расширение не найдено', 'WARNING');
    return '';
  }
  
  const extension = filename.slice(lastDotIndex);
  addLog('Найдено расширение: ' + extension, 'SUCCESS');
  return extension;
}

// Функция для просмотра логов
function viewLogs() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logsSheet = ss.getSheetByName('LOGS');
  
  if (!logsSheet) {
    ui.alert('Логи отсутствуют', 'Лист LOGS не найден в таблице.', ui.ButtonSet.OK);
    return;
  }
  
  const lastRow = logsSheet.getLastRow();
  if (lastRow <= 1) {
    ui.alert('Логи пусты', 'Нет доступных логов для просмотра.', ui.ButtonSet.OK);
    return;
  }
  
  // Получаем данные логов
  const range = logsSheet.getRange(1, 1, lastRow, 4);
  const values = range.getValues();
  
  // Форматируем логи в HTML
  let html = '<style>' +
    'table { border-collapse: collapse; width: 100%; }' +
    'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }' +
    'th { background-color: #f3f3f3; }' +
    '.ERROR { background-color: #ffcdd2; }' +
    '.WARNING { background-color: #fff9c4; }' +
    '.SUCCESS { background-color: #c8e6c9; }' +
    '</style>' +
    '<table><tr><th>Время</th><th>Тип</th><th>Сообщение</th><th>Функция</th></tr>';
  
  // Добавляем строки логов
  for (let i = 1; i < values.length; i++) {
    const [timestamp, type, message, func] = values[i];
    html += `<tr class="${type}">` +
      `<td>${Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm:ss')}</td>` +
      `<td>${type}</td>` +
      `<td>${message}</td>` +
      `<td>${func}</td>` +
      '</tr>';
  }
  html += '</table>';
  
  // Создаем и показываем HTML страницу
  const output = HtmlService
    .createHtmlOutput(html)
    .setTitle('Логи выполнения')
    .setWidth(900)
    .setHeight(600);
  
  ui.showModelessDialog(output, 'Логи выполнения');
}

// Функция для тестирования загрузки файла
function testFileUpload() {
  addLog(' НАЧАЛО ТЕСТИРОВАНИЯ ЗАГРУЗКИ ФАЙЛА ');
  addLog('Время начала: ' + new Date().toISOString());
  
  try {
    // Создаем тестовый файл
    addLog('Создаем тестовый файл...');
    const testContent = 'Test file content ' + new Date().toISOString();
    const testBlob = Utilities.newBlob(testContent, 'text/plain', 'test.txt');
    const base64Data = Utilities.base64Encode(testContent);
    addLog('Тестовый файл создан, размер: ' + testContent.length + ' байт', 'SUCCESS');
    
    // Получаем ID папки
    addLog('Получаем настройки...');
    const properties = PropertiesService.getScriptProperties().getProperties();
    if (!properties.ONBOARDING_FOLDER_ID) {
      throw new Error('ONBOARDING_FOLDER_ID не указан в настройках');
    }
    addLog('ONBOARDING_FOLDER_ID получен: ' + properties.ONBOARDING_FOLDER_ID, 'SUCCESS');
    
    // Проверяем доступ к папке
    addLog('Проверяем доступ к папке...');
    const folder = DriveApp.getFolderById(properties.ONBOARDING_FOLDER_ID);
    addLog('Папка найдена: ' + folder.getName(), 'SUCCESS');
    
    // Создаем тестовую подпапку
    addLog('Создаем тестовую подпапку...');
    const testFolder = folder.createFolder('test_upload_' + new Date().getTime());
    addLog('Тестовая подпапка создана: ' + testFolder.getName(), 'SUCCESS');
    
    // Имитируем разбиение файла на чанки
    const chunkSize = 256 * 1024; // 256KB
    const totalChunks = Math.ceil(base64Data.length / chunkSize);
    addLog(`Разбиваем файл на ${totalChunks} чанков по ${chunkSize} байт`);

    // Загружаем чанки последовательно
    let finalResult;
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, base64Data.length);
      const chunk = base64Data.substring(start, end);
      
      // Параметры для загрузки чанка
      const params = {
        form_type: 'file_upload',
        folderId: testFolder.getId(),
        type: 'TEST',
        filename: 'test.txt',
        contentType: 'text/plain',
        file: chunk,
        index: 1,
        chunk_index: i,
        total_chunks: totalChunks
      };
      
      addLog(`Загрузка чанка ${i + 1}/${totalChunks}...`);
      addLog('Параметры чанка: ' + JSON.stringify(params, null, 2));
      
      // Загружаем чанк
      const result = handleFileUpload(params);
      const response = JSON.parse(result.getContent());
      
      if (response.status === 'error') {
        throw new Error(`Ошибка загрузки чанка ${i + 1}: ${response.message}`);
      }
      
      addLog(`Чанк ${i + 1}/${totalChunks} загружен успешно`, 'SUCCESS');
      
      // Если это последний чанк, сохраняем результат
      if (i === totalChunks - 1) {
        finalResult = result;
      } else {
        // Делаем паузу между загрузками чанков
        Utilities.sleep(1000);
      }
    }

    // Проверяем результат загрузки всех чанков
    const response = JSON.parse(finalResult.getContent());
    addLog('Ответ от handleFileUpload: ' + JSON.stringify(response, null, 2), 
      response.status === 'success' ? 'SUCCESS' : 'ERROR');
    
    // Проверяем результат
    if (response.status === 'success') {
      addLog('Проверяем созданный файл...');
      const uploadedFile = DriveApp.getFileById(response.fileId);
      const fileInfo = {
        name: uploadedFile.getName(),
        size: uploadedFile.getSize(),
        url: uploadedFile.getUrl(),
        mimeType: uploadedFile.getMimeType(),
        dateCreated: uploadedFile.getDateCreated(),
        access: uploadedFile.getSharingAccess(),
        permission: uploadedFile.getSharingPermission()
      };
      addLog('Информация о файле: ' + JSON.stringify(fileInfo, null, 2), 'SUCCESS');
    }
    
    addLog(' ТЕСТИРОВАНИЕ ЗАВЕРШЕНО УСПЕШНО ', 'SUCCESS');
    return 'Тест загрузки файла выполнен успешно! Проверьте таблицу LOGS для подробной информации.';
  } catch (error) {
    const errorMessage = 'Ошибка при тестировании загрузки файла: ' + error.message;
    addLog(errorMessage, 'ERROR');
    throw new Error(errorMessage);
  }
}

// Функция для тестирования формы
function testScript() {
  addLog(' НАЧАЛО ТЕСТИРОВАНИЯ ФОРМЫ ');
  addLog('Время начала: ' + new Date().toISOString());

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
    addLog('Запуск тестового скрипта...');
    
    // Сначала проверяем настройки
    addLog('Запуск проверки настроек...');
    setup();
    addLog('Настройки проверены успешно', 'SUCCESS');
    
    // Затем пробуем отправить тестовые данные
    addLog('Отправка тестовых данных...');
    const result = doPost(testEvent);
    const response = JSON.parse(result.getContent());
    addLog('Ответ: ' + JSON.stringify(response, null, 2), 
      response.status === 'success' ? 'SUCCESS' : 'ERROR');
    
    addLog(' ТЕСТИРОВАНИЕ ЗАВЕРШЕНО УСПЕШНО ', 'SUCCESS');
    return 'Тест выполнен успешно! Проверьте таблицу LOGS для подробной информации.';
  } catch (error) {
    const errorMessage = 'Ошибка при тестировании: ' + error.message;
    addLog(errorMessage, 'ERROR');
    throw new Error(errorMessage);
  }
}
