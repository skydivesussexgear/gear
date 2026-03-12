// ============================================================
//  SKYDIVE SUSSEX — Google Apps Script
//  Receives gear service form submissions → logs to Google Sheet
//
//  SETUP:
//  1. Open your Google Sheet
//  2. Go to Extensions → Apps Script
//  3. Paste this entire file, replacing everything
//  4. Update SHEET_ID below with your spreadsheet ID
//  5. Deploy → New Deployment → Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  6. Copy the Web App URL → paste into ssx_service.html (SCRIPT_URL)
// ============================================================

const CONFIG = {
  SHEET_ID:   '18xWrsryd3PUw_y02wrCJOPQ4ZBkFFPtZrCILRsrnSD8',  // ← Your Google Sheet ID
  SHEET_NAME: 'Service Log',   // Sheet tab name (will be created if missing)
};

// ── HEADERS ──────────────────────────────────────────────────
const HEADERS = [
  'Work Order',
  'Submitted At',
  'Rigger',
  'Gear Type',
  'Rig #',
  'Rig Make',
  'Rig S/N',
  'Reserve Repack Due',
  'Services',
  'Extra Notes',
];

// ── doGet — health check ──────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput('Skydive Sussex Apps Script is running OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── doPost — receive submission ───────────────────────────────
function doPost(e) {
  try {
    let data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    logToSheet(data);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', work_order: data.work_order }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── LOG TO SHEET ──────────────────────────────────────────────
function logToSheet(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  // Create sheet + headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#0e1117')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  // Append the new service record
  sheet.appendRow([
    data.work_order      || '',
    data.submitted_at    || new Date().toISOString(),
    data.rigger          || '',
    data.gear_type       || '',
    data.rig_num         || '',
    data.rig_make        || '',
    data.rig_sn          || '',
    data.res_repack_due  || '',
    data.services        || '',
    data.extra_notes     || '',
  ]);

  // Auto-resize columns for readability
  sheet.autoResizeColumns(1, HEADERS.length);
}
