const SPREADSHEET_ID = '10bYsTuZINTH92yzFqS046qGAscNFVp9EYFNDPWfF1yo';
const SHEET_NAME = 'Bookings';
const WEBHOOK_SECRET = 'change-this-secret';

const BOOKING_HEADERS = [
  'Booking ID',
  'Created At',
  'Product',
  'Booking Type',
  'Variant',
  'Color',
  'Customer Name',
  'Mobile',
  'Email',
  'Address',
  'City',
  'PIN Code',
  'Preferred Date',
  'Preferred Slot',
  'Status',
  'Amount',
  'User Email',
  'Transaction ID'
];

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || '{}');

    if (WEBHOOK_SECRET && payload.secret !== WEBHOOK_SECRET) {
      return jsonResponse({ ok: false, message: 'Unauthorized' }, 401);
    }

    const booking = payload.booking || {};
    const row = payload.row || bookingToRow(booking);

    if (!booking.id && !row[0]) {
      return jsonResponse({ ok: false, message: 'Booking ID is required' }, 400);
    }

    const sheet = getBookingSheet();
    ensureHeaders(sheet);
    upsertBookingRow(sheet, String(booking.id || row[0]), row);

    return jsonResponse({ ok: true, bookingId: booking.id || row[0] });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message }, 500);
  }
}

function getBookingSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders(sheet) {
  const range = sheet.getRange(1, 1, 1, BOOKING_HEADERS.length);
  const currentHeaders = range.getValues()[0];
  const needsHeaders = BOOKING_HEADERS.some((header, index) => currentHeaders[index] !== header);

  if (!needsHeaders) return;

  range.setValues([BOOKING_HEADERS]);
  range.setFontWeight('bold');
  range.setBackground('#1F4E79');
  range.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
}

function upsertBookingRow(sheet, bookingId, row) {
  const lastRow = sheet.getLastRow();
  const rowValues = normalizeRow(row);

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const existingIndex = ids.findIndex((id) => String(id) === bookingId);

    if (existingIndex >= 0) {
      sheet.getRange(existingIndex + 2, 1, 1, BOOKING_HEADERS.length).setValues([rowValues]);
      return;
    }
  }

  sheet.appendRow(rowValues);
}

function normalizeRow(row) {
  const output = row.slice(0, BOOKING_HEADERS.length);

  while (output.length < BOOKING_HEADERS.length) {
    output.push('');
  }

  return output;
}

function bookingToRow(booking) {
  return normalizeRow([
    booking.id,
    booking.createdAt || booking.date,
    booking.service,
    booking.type,
    booking.variant,
    booking.color,
    booking.clientName,
    booking.clientMobile,
    booking.clientEmail,
    booking.clientAddress,
    booking.clientCity,
    booking.clientPinCode,
    booking.bookingDate,
    booking.bookingSlot,
    booking.status,
    booking.amount,
    booking.userEmail,
    booking.transactionId
  ]);
}

function jsonResponse(payload, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify({ ...payload, statusCode: statusCode || 200 }))
    .setMimeType(ContentService.MimeType.JSON);
}
