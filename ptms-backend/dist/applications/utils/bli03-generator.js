"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBLI03 = generateBLI03;
exports.validateBLI03Data = validateBLI03Data;
const pdfkit_1 = __importDefault(require("pdfkit"));
const sharp_1 = __importDefault(require("sharp"));
async function generateBLI03(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 60,
                    right: 60
                },
                info: {
                    Title: `BLI-03 ${data.student.matricNo}`,
                    Author: 'UiTM Practical Training Management System',
                    Subject: 'Borang Pengesahan Penempatan Latihan Industri',
                    Keywords: 'BLI-03, Industrial Training, Placement Form',
                    Creator: 'PTMS',
                    Producer: 'PTMS v1.0'
                }
            });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);
            addHeader(doc);
            addFormContent(doc, data);
            addDeclarationSection(doc);
            await addSignatureSection(doc, data.signatures);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
function addHeader(doc) {
    const leftMargin = 60;
    const pageWidth = doc.page.width;
    doc.fontSize(8)
        .font('Helvetica')
        .text('UNIVERSITI', leftMargin, 55);
    doc.text('TEKNOLOGI', leftMargin, 65);
    doc.text('MARA', leftMargin, 75);
    doc.fontSize(9)
        .font('Helvetica-Bold')
        .text('Kolej', leftMargin + 80, 55);
    doc.fontSize(8)
        .font('Helvetica')
        .text('Pengajian Pengkomputeran,', leftMargin + 80, 67);
    doc.text('Informatik dan Matematik', leftMargin + 80, 77);
    const boxX = pageWidth - 110;
    const boxY = 55;
    doc.rect(boxX, boxY, 50, 20).stroke();
    doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('BLI-03', boxX + 8, boxY + 5);
}
function addFormContent(doc, data) {
    const leftMargin = 60;
    const pageWidth = doc.page.width - 120;
    let currentY = 110;
    doc.fontSize(11)
        .font('Helvetica-Bold')
        .text('FAKULTI SAINS KOMPUTER DAN MATEMATIK', leftMargin, currentY, {
        align: 'center',
        width: pageWidth
    });
    currentY += 15;
    doc.text('BORANG PENGESAHAN PENEMPATAN LATIHAN INDUSTRI', leftMargin, currentY, {
        align: 'center',
        width: pageWidth
    });
    currentY += 12;
    doc.fontSize(9)
        .font('Helvetica-Oblique')
        .text('(untuk diisi oleh pelajar)', leftMargin, currentY, {
        align: 'center',
        width: pageWidth
    });
    currentY += 25;
    doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('A.  BUTIRAN PELAJAR', leftMargin, currentY);
    currentY += 15;
    const tableX = leftMargin;
    const tableWidth = pageWidth;
    const rowHeight = 20;
    const col1Width = 150;
    drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'Nama', data.student.name, col1Width);
    currentY += rowHeight;
    drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'No. Pelajar', data.student.matricNo, col1Width);
    currentY += rowHeight;
    drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'Program', data.student.program, col1Width);
    currentY += rowHeight;
    drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'No. Telefon', data.student.phone, col1Width);
    currentY += rowHeight;
    drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'E-mel', data.student.email, col1Width);
    currentY += rowHeight;
    drawTableRowSplit(doc, tableX, currentY, tableWidth, rowHeight, 'Tarikh LI:', 'Mula:', data.student.startDate, 'Tamat:', data.student.endDate, col1Width);
    currentY += rowHeight;
    currentY += 15;
    doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('B.  PEMILIHAN TEMPAT ORGANISASI', leftMargin, currentY);
    currentY += 15;
    drawLargeTableRow(doc, tableX, currentY, tableWidth, 40, 'Nama Organisasi:', data.organization.name);
    currentY += 40;
    drawLargeTableRow(doc, tableX, currentY, tableWidth, 50, 'Alamat Organisasi:', data.organization.address);
    currentY += 50;
    drawTableRowSplit(doc, tableX, currentY, tableWidth, rowHeight, 'No. Telefon/Faks:', 'TEL:', data.organization.phone, 'FAX:', data.organization.fax || '', col1Width);
    currentY += rowHeight;
    drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'E-mel:', data.organization.email, col1Width);
    currentY += rowHeight;
    drawTableRow(doc, tableX, currentY, tableWidth, 25, 'Nama Pegawai\nBertanggungjawab:', data.organization.contactPersonName, col1Width);
    currentY += 25;
    drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'No. Telefon Pegawai:', data.organization.contactPersonPhone, col1Width);
    currentY += rowHeight;
    return currentY;
}
function addDeclarationSection(doc) {
    const leftMargin = 60;
    const pageWidth = doc.page.width - 120;
    let currentY = doc.y + 15;
    doc.fontSize(9)
        .font('Helvetica')
        .text('Dengan ini, saya bersetuju untuk memilih menjalani latihan industri di syarikat/organisasi seperti di atas. Saya memahami bahawa saya tidak boleh membuat penukaran penempatan latihan industri di syarikat/organisasi lain selain organisasi di atas kecuali atas sebab-sebab yang tidak dapat dielakkan dengan kebenaran pihak kolej.', leftMargin, currentY, {
        align: 'justify',
        width: pageWidth,
        lineGap: 3
    });
    currentY = doc.y + 20;
    const col1X = leftMargin;
    const col2X = leftMargin + (pageWidth / 2) + 20;
    doc.fontSize(9)
        .font('Helvetica')
        .text('Yang Benar,', col1X, currentY);
    doc.text('Pengesahan Penyelaras Latihan Industri', col2X, currentY);
}
async function addSignatureSection(doc, signatures) {
    const leftMargin = 60;
    const pageWidth = doc.page.width - 120;
    let currentY = doc.y + 30;
    const col1X = leftMargin;
    const col2X = leftMargin + (pageWidth / 2) + 20;
    const signatureAreaY = currentY;
    doc.fontSize(8)
        .font('Helvetica')
        .text('Tandatangan Pelajar', col1X, currentY);
    currentY += 15;
    const studentSigStartY = currentY;
    if (signatures === null || signatures === void 0 ? void 0 : signatures.studentSignature) {
        if (signatures.studentSignatureType === 'typed') {
            doc.fontSize(16)
                .font('Times-Italic')
                .text(signatures.studentSignature, col1X, currentY);
            currentY += 25;
        }
        else if (signatures.studentSignatureType === 'image' || signatures.studentSignatureType === 'drawn') {
            try {
                let base64Data = signatures.studentSignature;
                if (base64Data.includes('base64,')) {
                    base64Data = base64Data.split('base64,')[1];
                }
                const signatureBuffer = Buffer.from(base64Data, 'base64');
                const processedSignature = await (0, sharp_1.default)(signatureBuffer)
                    .trim({ background: { r: 255, g: 255, b: 255 }, threshold: 10 })
                    .png()
                    .toBuffer();
                const signatureWidth = signatures.studentSignatureType === 'drawn' ? 100 : 90;
                const signatureHeight = signatures.studentSignatureType === 'drawn' ? 40 : 35;
                doc.image(processedSignature, col1X + 10, currentY, {
                    width: signatureWidth,
                    fit: [signatureWidth, signatureHeight],
                });
                currentY += signatureHeight + 5;
            }
            catch (error) {
                console.error('Error adding student signature image:', error);
                doc.fontSize(9)
                    .font('Helvetica-Oblique')
                    .text('[Signature Image]', col1X, currentY);
                currentY += 20;
            }
        }
        else {
            doc.fontSize(9)
                .font('Helvetica-Oblique')
                .text('[Digital Signature]', col1X, currentY);
            currentY += 20;
        }
    }
    else {
        doc.moveTo(col1X, currentY + 10)
            .lineTo(col1X + 150, currentY + 10)
            .stroke();
        currentY += 25;
    }
    doc.fontSize(8)
        .font('Helvetica')
        .text('Tarikh: ' + ((signatures === null || signatures === void 0 ? void 0 : signatures.studentSignedAt) ? new Date(signatures.studentSignedAt).toLocaleDateString('en-MY') : '_______________'), col1X, currentY);
    currentY = signatureAreaY;
    doc.fontSize(8)
        .font('Helvetica')
        .text('Tandatangan Penyelaras Latihan Industri', col2X, currentY);
    currentY += 15;
    if (signatures === null || signatures === void 0 ? void 0 : signatures.coordinatorSignature) {
        if (signatures.coordinatorSignatureType === 'typed') {
            doc.fontSize(16)
                .font('Times-Italic')
                .text(signatures.coordinatorSignature, col2X, currentY);
            currentY += 25;
        }
        else if (signatures.coordinatorSignatureType === 'image' || signatures.coordinatorSignatureType === 'drawn') {
            try {
                let base64Data = signatures.coordinatorSignature;
                if (base64Data.includes('base64,')) {
                    base64Data = base64Data.split('base64,')[1];
                }
                const signatureBuffer = Buffer.from(base64Data, 'base64');
                const processedSignature = await (0, sharp_1.default)(signatureBuffer)
                    .trim({ background: { r: 255, g: 255, b: 255 }, threshold: 10 })
                    .png()
                    .toBuffer();
                const signatureWidth = signatures.coordinatorSignatureType === 'drawn' ? 150 : 120;
                const signatureHeight = signatures.coordinatorSignatureType === 'drawn' ? 60 : 45;
                doc.image(processedSignature, col2X, currentY, {
                    width: signatureWidth,
                    fit: [signatureWidth, signatureHeight],
                });
                currentY += signatureHeight + 5;
            }
            catch (error) {
                console.error('Error adding coordinator signature image:', error);
                doc.fontSize(9)
                    .font('Helvetica-Oblique')
                    .text('[Signature Image]', col2X, currentY);
                currentY += 20;
            }
        }
        else {
            doc.fontSize(9)
                .font('Helvetica-Oblique')
                .text('[Digital Signature]', col2X, currentY);
            currentY += 20;
        }
    }
    else {
        doc.moveTo(col2X, currentY + 10)
            .lineTo(col2X + 150, currentY + 10)
            .stroke();
        currentY += 25;
    }
    doc.fontSize(8)
        .font('Helvetica')
        .text('Tarikh: ' + ((signatures === null || signatures === void 0 ? void 0 : signatures.coordinatorSignedAt) ? new Date(signatures.coordinatorSignedAt).toLocaleDateString('en-MY') : '_______________'), col2X, currentY);
}
function drawTableRow(doc, x, y, width, height, label, value, labelWidth) {
    doc.rect(x, y, width, height).stroke();
    doc.moveTo(x + labelWidth, y)
        .lineTo(x + labelWidth, y + height)
        .stroke();
    doc.fontSize(9)
        .font('Helvetica')
        .text(label, x + 5, y + 5, { width: labelWidth - 10 });
    doc.text(value, x + labelWidth + 5, y + 5, { width: width - labelWidth - 10 });
}
function drawTableRowSplit(doc, x, y, width, height, label, label1, value1, label2, value2, labelWidth) {
    doc.rect(x, y, width, height).stroke();
    doc.moveTo(x + labelWidth, y)
        .lineTo(x + labelWidth, y + height)
        .stroke();
    const midPoint = x + labelWidth + ((width - labelWidth) / 2);
    doc.moveTo(midPoint, y)
        .lineTo(midPoint, y + height)
        .stroke();
    doc.fontSize(9)
        .font('Helvetica')
        .text(label, x + 5, y + 5, { width: labelWidth - 10 });
    const val1X = x + labelWidth + 5;
    doc.text(label1, val1X, y + 5, { continued: true })
        .text(' ' + value1);
    const val2X = midPoint + 5;
    doc.text(label2, val2X, y + 5, { continued: true })
        .text(' ' + value2);
}
function drawLargeTableRow(doc, x, y, width, height, label, value) {
    doc.rect(x, y, width, height).stroke();
    doc.fontSize(9)
        .font('Helvetica')
        .text(label, x + 5, y + 5);
    doc.text(value, x + 5, y + 20, {
        width: width - 10,
        lineGap: 2
    });
}
function validateBLI03Data(data) {
    const required = [
        data.student.name,
        data.student.matricNo,
        data.student.program,
        data.organization.name,
        data.organization.address
    ];
    const missing = required.filter(field => !field);
    if (missing.length > 0) {
        throw new Error('Missing required fields for BLI-03 generation');
    }
    return true;
}
//# sourceMappingURL=bli03-generator.js.map