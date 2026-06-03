const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BOOKINGS_JSON = path.join(DATA_DIR, 'bookings.json');
const BOOKINGS_XLSX = path.join(DATA_DIR, 'bookings.xlsx');
const PORT = Number(process.env.PORT) || 3000;

const EXCEL_HEADERS = [
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

const MIME_TYPES = {
    '.avif': 'image/avif',
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
};

function cleanText(value) {
    return String(value ?? '').trim();
}

function normalizeEmail(value) {
    return cleanText(value).toLowerCase();
}

function normalizeBooking(rawBooking) {
    const createdAt = cleanText(rawBooking.date || rawBooking.createdAt) || new Date().toISOString();

    return {
        id: cleanText(rawBooking.id) || `BK${Date.now()}`,
        date: createdAt,
        createdAt,
        service: cleanText(rawBooking.service || rawBooking.productName || 'Booking'),
        type: cleanText(rawBooking.type || rawBooking.serviceType || 'vehicle'),
        variant: cleanText(rawBooking.variant),
        color: cleanText(rawBooking.color),
        amount: Number(rawBooking.amount) || 0,
        status: cleanText(rawBooking.status || 'Confirmed'),
        transactionId: cleanText(rawBooking.transactionId || 'NO_PAYMENT'),
        userId: cleanText(rawBooking.userId),
        userEmail: normalizeEmail(rawBooking.userEmail),
        clientName: cleanText(rawBooking.clientName || rawBooking.customerName),
        clientMobile: cleanText(rawBooking.clientMobile || rawBooking.customerPhone),
        clientEmail: normalizeEmail(rawBooking.clientEmail || rawBooking.customerEmail),
        clientAddress: cleanText(rawBooking.clientAddress || rawBooking.customerAddress),
        clientCity: cleanText(rawBooking.clientCity || rawBooking.customerCity),
        clientPinCode: cleanText(rawBooking.clientPinCode || rawBooking.customerPincode),
        bookingDate: cleanText(rawBooking.bookingDate || rawBooking.preferredDate),
        bookingSlot: cleanText(rawBooking.bookingSlot || rawBooking.preferredSlot),
        vehiclePrice: Number(rawBooking.vehiclePrice) || 0,
        basePrice: Number(rawBooking.basePrice) || 0,
        handlingFee: Number(rawBooking.handlingFee) || 0,
        tax: Number(rawBooking.tax) || 0,
        updatedAt: new Date().toISOString()
    };
}

function bookingToExcelRow(booking) {
    return [
        booking.id,
        formatDateTime(booking.createdAt || booking.date),
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
    ];
}

function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return cleanText(value);
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

function filterBookings(bookings, searchParams) {
    const userId = cleanText(searchParams.get('userId'));
    const email = normalizeEmail(searchParams.get('email'));

    if (!userId && !email) return bookings;

    return bookings.filter((booking) => {
        return (userId && booking.userId === userId) ||
            (email && normalizeEmail(booking.userEmail) === email) ||
            (email && normalizeEmail(booking.clientEmail) === email);
    });
}

async function loadBookings() {
    try {
        const content = await fs.readFile(BOOKINGS_JSON, 'utf8');
        const bookings = JSON.parse(content);
        return Array.isArray(bookings) ? bookings : [];
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

async function saveBookings(bookings) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(BOOKINGS_JSON, JSON.stringify(bookings, null, 2), 'utf8');
    await fs.writeFile(BOOKINGS_XLSX, createWorkbookBuffer(bookings));
}

function upsertBooking(bookings, booking) {
    const filteredBookings = bookings.filter((item) => item.id !== booking.id);
    filteredBookings.unshift(booking);
    return filteredBookings.sort((first, second) => {
        const firstDate = new Date(first.date || first.createdAt || 0).getTime();
        const secondDate = new Date(second.date || second.createdAt || 0).getTime();
        return secondDate - firstDate;
    });
}

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
    response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(message);
}

function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';

        request.on('data', (chunk) => {
            body += chunk;
            if (body.length > 1024 * 1024) {
                request.destroy();
                reject(new Error('Request body is too large'));
            }
        });

        request.on('end', () => resolve(body));
        request.on('error', reject);
    });
}

async function handleCreateBooking(request, response) {
    try {
        const body = await readRequestBody(request);
        const rawBooking = JSON.parse(body || '{}');
        const booking = normalizeBooking(rawBooking);

        if (!booking.clientName || (!booking.clientMobile && !booking.clientEmail)) {
            sendJson(response, 400, {
                ok: false,
                message: 'Customer name and mobile or email are required.'
            });
            return;
        }

        const bookings = upsertBooking(await loadBookings(), booking);
        await saveBookings(bookings);

        sendJson(response, 201, {
            ok: true,
            booking,
            excelFile: 'data/bookings.xlsx'
        });
    } catch (error) {
        console.error('Unable to save booking:', error);
        sendJson(response, 500, {
            ok: false,
            message: 'Unable to save booking details.'
        });
    }
}

async function handleListBookings(requestUrl, response) {
    try {
        const bookings = filterBookings(await loadBookings(), requestUrl.searchParams);
        sendJson(response, 200, { ok: true, bookings });
    } catch (error) {
        console.error('Unable to load bookings:', error);
        sendJson(response, 500, { ok: false, message: 'Unable to load bookings.' });
    }
}

async function handleExportBookings(requestUrl, response) {
    try {
        const bookings = filterBookings(await loadBookings(), requestUrl.searchParams);
        const workbook = createWorkbookBuffer(bookings);

        response.writeHead(200, {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="bookings.xlsx"'
        });
        response.end(workbook);
    } catch (error) {
        console.error('Unable to export bookings:', error);
        sendJson(response, 500, { ok: false, message: 'Unable to export bookings.' });
    }
}

async function serveStaticFile(requestUrl, response) {
    let pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname === '/') pathname = '/index.html';

    const filePath = path.resolve(ROOT_DIR, `.${pathname}`);
    const relativePath = path.relative(ROOT_DIR, filePath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || relativePath.split(path.sep)[0] === 'data') {
        sendText(response, 404, 'Not found');
        return;
    }

    try {
        const file = await fs.readFile(filePath);
        const extension = path.extname(filePath).toLowerCase();
        response.writeHead(200, {
            'Content-Type': MIME_TYPES[extension] || 'application/octet-stream'
        });
        response.end(file);
    } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'EISDIR') {
            sendText(response, 404, 'Not found');
            return;
        }

        console.error('Unable to serve file:', error);
        sendText(response, 500, 'Server error');
    }
}

async function handleRequest(request, response) {
    const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (request.method === 'POST' && requestUrl.pathname === '/api/bookings') {
        await handleCreateBooking(request, response);
        return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/bookings') {
        await handleListBookings(requestUrl, response);
        return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/bookings/export') {
        await handleExportBookings(requestUrl, response);
        return;
    }

    if (requestUrl.pathname.startsWith('/api/')) {
        sendJson(response, 404, { ok: false, message: 'API route not found.' });
        return;
    }

    await serveStaticFile(requestUrl, response);
}

function createWorkbookBuffer(bookings) {
    const files = [
        { name: '[Content_Types].xml', data: contentTypesXml() },
        { name: '_rels/.rels', data: rootRelsXml() },
        { name: 'docProps/app.xml', data: appXml() },
        { name: 'docProps/core.xml', data: coreXml() },
        { name: 'xl/workbook.xml', data: workbookXml() },
        { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsXml() },
        { name: 'xl/styles.xml', data: stylesXml() },
        { name: 'xl/worksheets/sheet1.xml', data: worksheetXml(bookings) }
    ];

    return createZip(files);
}

function contentTypesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;
}

function rootRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function appXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
<Application>Nehan Hero Booking Server</Application>
</Properties>`;
}

function coreXml() {
    const now = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>Bookings</dc:title>
<dc:creator>Nehan Hero Booking Server</dc:creator>
<cp:lastModifiedBy>Nehan Hero Booking Server</cp:lastModifiedBy>
<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
}

function workbookXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
<sheet name="Bookings" sheetId="1" r:id="rId1"/>
</sheets>
</workbook>`;
}

function workbookRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function stylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2">
<font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
</fonts>
<fills count="3">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF1F4E79"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function worksheetXml(bookings) {
    const rows = [EXCEL_HEADERS, ...bookings.map(bookingToExcelRow)];
    const rowXml = rows.map((row, rowIndex) => {
        const rowNumber = rowIndex + 1;
        const cells = row.map((value, columnIndex) => {
            const reference = `${columnName(columnIndex)}${rowNumber}`;
            const style = rowIndex === 0 ? ' s="1"' : '';
            return `<c r="${reference}" t="inlineStr"${style}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
        }).join('');

        return `<row r="${rowNumber}">${cells}</row>`;
    }).join('');
    const lastColumn = columnName(EXCEL_HEADERS.length - 1);
    const lastRow = Math.max(rows.length, 1);

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<dimension ref="A1:${lastColumn}${lastRow}"/>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${columnWidthsXml()}</cols>
<sheetData>${rowXml}</sheetData>
<autoFilter ref="A1:${lastColumn}${lastRow}"/>
</worksheet>`;
}

function columnWidthsXml() {
    const widths = [18, 24, 28, 16, 18, 16, 24, 18, 28, 36, 18, 12, 16, 18, 14, 12, 28, 20];
    return widths.map((width, index) => {
        const columnNumber = index + 1;
        return `<col min="${columnNumber}" max="${columnNumber}" width="${width}" customWidth="1"/>`;
    }).join('');
}

function columnName(columnIndex) {
    let dividend = columnIndex + 1;
    let name = '';

    while (dividend > 0) {
        const modulo = (dividend - 1) % 26;
        name = String.fromCharCode(65 + modulo) + name;
        dividend = Math.floor((dividend - modulo) / 26);
    }

    return name;
}

function escapeXml(value) {
    return cleanText(value)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

const CRC_TABLE = createCrcTable();

function createCrcTable() {
    const table = new Uint32Array(256);

    for (let byteValue = 0; byteValue < 256; byteValue += 1) {
        let checksum = byteValue;

        for (let bit = 0; bit < 8; bit += 1) {
            checksum = checksum & 1 ? 0xEDB88320 ^ (checksum >>> 1) : checksum >>> 1;
        }

        table[byteValue] = checksum >>> 0;
    }

    return table;
}

function crc32(buffer) {
    let checksum = 0xFFFFFFFF;

    for (const byte of buffer) {
        checksum = CRC_TABLE[(checksum ^ byte) & 0xFF] ^ (checksum >>> 8);
    }

    return (checksum ^ 0xFFFFFFFF) >>> 0;
}

function dosDateTime(date = new Date()) {
    const year = Math.max(date.getFullYear(), 1980);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = Math.floor(date.getSeconds() / 2);

    return {
        date: ((year - 1980) << 9) | (month << 5) | day,
        time: (hours << 11) | (minutes << 5) | seconds
    };
}

function createZip(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const timestamp = dosDateTime();

    files.forEach((file) => {
        const nameBuffer = Buffer.from(file.name, 'utf8');
        const dataBuffer = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, 'utf8');
        const checksum = crc32(dataBuffer);
        const localHeader = Buffer.alloc(30);

        localHeader.writeUInt32LE(0x04034B50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0, 6);
        localHeader.writeUInt16LE(0, 8);
        localHeader.writeUInt16LE(timestamp.time, 10);
        localHeader.writeUInt16LE(timestamp.date, 12);
        localHeader.writeUInt32LE(checksum, 14);
        localHeader.writeUInt32LE(dataBuffer.length, 18);
        localHeader.writeUInt32LE(dataBuffer.length, 22);
        localHeader.writeUInt16LE(nameBuffer.length, 26);
        localHeader.writeUInt16LE(0, 28);

        localParts.push(localHeader, nameBuffer, dataBuffer);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014B50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt16LE(0, 8);
        centralHeader.writeUInt16LE(0, 10);
        centralHeader.writeUInt16LE(timestamp.time, 12);
        centralHeader.writeUInt16LE(timestamp.date, 14);
        centralHeader.writeUInt32LE(checksum, 16);
        centralHeader.writeUInt32LE(dataBuffer.length, 20);
        centralHeader.writeUInt32LE(dataBuffer.length, 24);
        centralHeader.writeUInt16LE(nameBuffer.length, 28);
        centralHeader.writeUInt16LE(0, 30);
        centralHeader.writeUInt16LE(0, 32);
        centralHeader.writeUInt16LE(0, 34);
        centralHeader.writeUInt16LE(0, 36);
        centralHeader.writeUInt32LE(0, 38);
        centralHeader.writeUInt32LE(offset, 42);

        centralParts.push(centralHeader, nameBuffer);
        offset += localHeader.length + nameBuffer.length + dataBuffer.length;
    });

    const centralDirectory = Buffer.concat(centralParts);
    const endRecord = Buffer.alloc(22);

    endRecord.writeUInt32LE(0x06054B50, 0);
    endRecord.writeUInt16LE(0, 4);
    endRecord.writeUInt16LE(0, 6);
    endRecord.writeUInt16LE(files.length, 8);
    endRecord.writeUInt16LE(files.length, 10);
    endRecord.writeUInt32LE(centralDirectory.length, 12);
    endRecord.writeUInt32LE(offset, 16);
    endRecord.writeUInt16LE(0, 20);

    return Buffer.concat([...localParts, centralDirectory, endRecord]);
}

http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
        console.error('Unhandled server error:', error);
        sendText(response, 500, 'Server error');
    });
}).listen(PORT, () => {
    console.log(`Booking server running at http://localhost:${PORT}`);
    console.log(`Excel bookings will be saved to ${BOOKINGS_XLSX}`);
});
