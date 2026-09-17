/**
 * PRUDENT SPACES REAL ESTATE - GOOGLE APPS SCRIPT
 * 
 * Two-way live synchronization for Prudent Spaces Admin Studio:
 * 1. Captures new website inquiries (POST default)
 * 2. Fetches all inquiries for the Admin Studio (GET)
 * 3. Updates lead status and boss internal notes (POST action: "update")
 * 4. Deletes inquiries permanently (POST action: "delete")
 * 
 * INSTRUCTIONS TO DEPLOY IN GOOGLE SHEETS:
 * 1. Open your Google Sheet.
 * 2. Ensure row 1 has headers:
 *    [Timestamp, Name, Phone, Email, Country, Purpose, Budget, Message, Status, Notes]
 * 3. Go to Extensions -> Apps Script.
 * 4. Replace all code with this file.
 * 5. Click "Deploy" -> "Manage deployments" -> Click Edit (pencil icon).
 * 6. Under Version, select "New version".
 * 7. Ensure "Execute as: Me" and "Who has access: Anyone".
 * 8. Click "Deploy".
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var leads = [];
  
  // Starting from row 2 (index 1) to skip header
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    // If empty row, skip
    if (!row[0] && !row[1] && !row[2] && !row[3]) continue;
    
    leads.push({
      id: "sheet_row_" + (i + 1),
      receivedAt: row[0] ? String(row[0]) : new Date().toISOString(),
      name: String(row[1] || ''),
      phone: String(row[2] || ''),
      email: String(row[3] || ''),
      country: String(row[4] || ''),
      interest: String(row[5] || ''),
      budget: String(row[6] || ''),
      message: String(row[7] || ''),
      leadStatus: String(row[8] || 'new'),
      notes: String(row[9] || '')
    });
  }
  
  // Sort newest first
  leads.reverse();
  
  return ContentService.createTextOutput(JSON.stringify({ leads: leads }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // 1. ACTION: DELETE ROW
    if (data.action === "delete") {
      var rowId = String(data.rowId || data.id || '');
      var match = rowId.match(/\d+/);
      if (match) {
        var rowNum = parseInt(match[0], 10);
        if (rowNum >= 2 && rowNum <= sheet.getLastRow()) {
          sheet.deleteRow(rowNum);
          return ContentService.createTextOutput(JSON.stringify({ result: "success", action: "delete", row: rowNum }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ result: "error", message: "Row not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. ACTION: UPDATE STATUS & NOTES
    if (data.action === "update") {
      var rowId = String(data.rowId || data.id || '');
      var match = rowId.match(/\d+/);
      if (match) {
        var rowNum = parseInt(match[0], 10);
        if (rowNum >= 2 && rowNum <= sheet.getLastRow()) {
          // Column 9 (I) is Status, Column 10 (J) is Notes
          if (data.leadStatus !== undefined) {
            sheet.getRange(rowNum, 9).setValue(String(data.leadStatus));
          }
          if (data.notes !== undefined) {
            sheet.getRange(rowNum, 10).setValue(String(data.notes));
          }
          return ContentService.createTextOutput(JSON.stringify({ result: "success", action: "update", row: rowNum }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ result: "error", message: "Row not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. ACTION: NEW LEAD INQUIRY (DEFAULT)
    var timestamp = data.receivedAt || new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" });
    var name = data.name || "";
    // Prefix phone with apostrophe to prevent Google Sheets formula parsing error (#ERROR!) on '+'
    var rawPhone = String(data.phone || "");
    var phone = rawPhone.startsWith("'") ? rawPhone : "'" + rawPhone;
    var email = data.email || "";
    var country = data.country || "";
    var interest = data.interest || "";
    var budget = data.budget || "";
    var message = data.message || "";
    var status = data.leadStatus || "new";
    var notes = data.notes || "";

    sheet.appendRow([timestamp, name, phone, email, country, interest, budget, message, status, notes]);

    return ContentService.createTextOutput(JSON.stringify({ result: "success", action: "create" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
