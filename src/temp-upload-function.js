// Функция для загрузки файла в Google Drive
async function uploadFileToDrive(fileObj, type, index, folderId) {
  try {
    console.log('Загрузка файла:', fileObj.name, 'тип:', type, 'индекс:', index);

    // Читаем файл как ArrayBuffer
    const fileBuffer = await fileObj.file.arrayBuffer();
    const fileArray = new Uint8Array(fileBuffer);
    
    // Размер чанка (300KB)
    const chunkSize = 300 * 1024; // Уменьшаем до 300KB для надежности с учетом base64
    const totalChunks = Math.ceil(fileArray.length / chunkSize);

    // Если файл больше 300KB, разбиваем на части
    let uploadedChunks = 0;
    let fileId = null;

    // Для маленьких файлов отправляем одним запросом
    if (totalChunks === 1) {
      const formData = new URLSearchParams();
      formData.append('type', type);
      formData.append('index', index);
      formData.append('folderId', folderId);
      formData.append('filename', fileObj.name);
      formData.append('contentType', fileObj.type);
      formData.append('form_type', 'file_upload');
      
      // Безопасное преобразование в base64
      const base64String = btoa(
        Array.from(fileArray)
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
      formData.append('file', base64String);

      try {
        const response = await fetch(import.meta.env.VITE_GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка загрузки файла ${fileObj.name}: ${errorText}`);
        }

        const result = await response.json();
        if (result.status === 'error') {
          throw new Error(result.message || `Ошибка загрузки файла ${fileObj.name}`);
        }

        console.log('Файл успешно загружен:', result);
        showNotification(`Файл ${fileObj.name} успешно загружен`, 'success');
        return result;
      } catch (error) {
        console.error(`Ошибка загрузки файла ${fileObj.name}:`, error);
        showNotification(`Ошибка загрузки файла ${fileObj.name}: ${error.message}`, 'error');
        throw error;
      }
    }

    // Для больших файлов загружаем по частям
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileArray.length);
      const chunk = fileArray.slice(start, end);

      const formData = new URLSearchParams();
      formData.append('type', type);
      formData.append('index', index);
      formData.append('folderId', folderId);
      formData.append('filename', fileObj.name);
      formData.append('contentType', fileObj.type);
      formData.append('form_type', 'file_upload');
      formData.append('chunk_index', i);
      formData.append('total_chunks', totalChunks);
      if (fileId) formData.append('file_id', fileId);
      
      // Безопасное преобразование чанка в base64
      const base64Chunk = btoa(
        Array.from(chunk)
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
      formData.append('file', base64Chunk);

      let retries = 3;
      let result;

      while (retries > 0) {
        try {
          const response = await fetch(import.meta.env.VITE_GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка загрузки части ${i + 1} файла ${fileObj.name}: ${errorText}`);
          }

          result = await response.json();
          if (result.status === 'error') {
            throw new Error(result.message || `Ошибка загрузки части ${i + 1} файла ${fileObj.name}`);
          }

          // Сохраняем fileId из первого чанка
          if (i === 0) {
            fileId = result.fileId;
          }

          uploadedChunks++;
          const progress = Math.round((uploadedChunks / totalChunks) * 100);
          console.log(`Загружено ${uploadedChunks} из ${totalChunks} частей файла ${fileObj.name} (${progress}%)`);
          showNotification(`Загрузка файла ${fileObj.name}: ${progress}%`, 'info');
          break; // Успешно загружено, выходим из цикла
        } catch (error) {
          retries--;
          if (retries > 0) {
            console.log(`Повторная попытка загрузки части ${i + 1} файла ${fileObj.name}. Осталось попыток: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем 1 секунду перед повторной попыткой
          } else {
            throw error; // Если попытки закончились, пробрасываем ошибку
          }
        }
      }
    }

    console.log('Файл успешно загружен полностью:', fileObj.name);
    showNotification(`Файл ${fileObj.name} успешно загружен`, 'success');
    return { status: 'success', fileId, fileName: fileObj.name };
  } catch (error) {
    console.error(`Ошибка загрузки файла ${fileObj.name}:`, error);
    showNotification(`Ошибка загрузки файла ${fileObj.name}: ${error.message}`, 'error');
    throw error;
  }
}
