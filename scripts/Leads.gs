// Set LEADS_WEBHOOK_SECRET and LEADS_SHEET_ID in Apps Script > Project settings.
function doPost(event) {
  const reply = data => ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  const properties = PropertiesService.getScriptProperties();
  const secret = properties.getProperty('LEADS_WEBHOOK_SECRET');
  const sheetId = properties.getProperty('LEADS_SHEET_ID');
  let value;
  try {
    value = JSON.parse(event.postData.contents);
  } catch (error) {
    return reply({ok: false});
  }
  if (!secret || !sheetId || value.secret !== secret || !/^[a-f0-9]{64}$/.test(value.id)) {
    return reply({ok: false});
  }

  const spreadsheetLock = LockService.getScriptLock();
  if (!spreadsheetLock.tryLock(4000)) return reply({ok: false});
  try {
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName('Tư vấn') || spreadsheet.insertSheet('Tư vấn');
    if (!sheet.getLastRow()) {
      sheet.appendRow(['ID', 'Ngày nhận (UTC)', 'Người học', 'Nhóm', 'Điện thoại/Zalo', 'Mục tiêu', 'Khóa quan tâm', 'Kết quả', 'Email đã gửi']);
    }
    const existing = sheet.getRange('A:A').createTextFinder(value.id).matchEntireCell(true).findNext();
    let row = existing ? existing.getRow() : sheet.getLastRow() + 1;
    const safeCell = input => {
      const cell = String(input == null ? '' : input);
      return /^[\s]*[=+\-@]|^0\d/.test(cell) ? "'" + cell : cell;
    };
    if (!existing) {
      sheet.getRange(row, 1, 1, 9).setValues([[
        value.id, safeCell(value.createdAt), safeCell(value.name), safeCell(value.group),
        safeCell(value.phone), safeCell(value.goal), safeCell(value.course),
        safeCell(value.result ? JSON.stringify(value.result) : ''), ''
      ]]);
      SpreadsheetApp.flush();
    }
    if (!sheet.getRange(row, 9).getValue()) {
      MailApp.sendEmail('lathuy32@gmail.com', 'SUNNY HOUSE có yêu cầu tư vấn mới',
        'Mở bảng quản lý SUNNY HOUSE hoặc trang Tư vấn trong bảng tính để xử lý.\nMã yêu cầu: ' + value.id);
      sheet.getRange(row, 9).setValue(new Date());
      SpreadsheetApp.flush();
    }
    return reply({ok: true});
  } catch (error) {
    return reply({ok: false});
  } finally {
    spreadsheetLock.releaseLock();
  }
}
