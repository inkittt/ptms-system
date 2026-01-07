"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSLI04 = generateSLI04;
exports.validateSLI04Data = validateSLI04Data;
const pdfkit_1 = __importDefault(require("pdfkit"));
async function generateSLI04(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: {
                    top: 72,
                    bottom: 72,
                    left: 72,
                    right: 72
                },
                info: {
                    Title: `SLI-04 ${data.student.matricNumber}`,
                    Author: 'UiTM Practical Training Management System',
                    Subject: 'Industrial Training Offer Rejection Letter',
                    Keywords: 'SLI-04, Industrial Training, Rejection Letter',
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
            addLetterContent(doc, data);
            addFooter(doc, data);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
function addLetterContent(doc, data) {
    const leftMargin = 72;
    let currentY = 50;
    doc.fontSize(11)
        .font('Helvetica-Bold')
        .text('Tarikh:', leftMargin, currentY);
    currentY += 20;
    doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('red')
        .text('<NAMA PEGAWAI>', leftMargin, currentY);
    currentY += 15;
    doc.text('<JAWATAN>', leftMargin, currentY);
    currentY += 15;
    doc.text('<ALAMAT SYARIKAT>', leftMargin, currentY);
    currentY += 30;
    doc.fillColor('black');
    doc.fontSize(11)
        .font('Helvetica')
        .text('Tuan / Puan,', leftMargin, currentY);
    currentY += 25;
    doc.font('Helvetica-Bold')
        .text('PENOLAKAN TAWARAN MENJALANI LATIHAN INDUSTRI', leftMargin, currentY);
    currentY += 25;
    doc.font('Helvetica')
        .text('NAMA PELAJAR', leftMargin, currentY);
    doc.text(`: `, leftMargin + 120, currentY);
    doc.font('Helvetica-Bold')
        .fillColor('red')
        .text('<NAMA PELAJAR>', leftMargin + 135, currentY);
    currentY += 15;
    doc.fillColor('black')
        .font('Helvetica')
        .text('NO. K/P PELAJAR', leftMargin, currentY);
    doc.text(`: `, leftMargin + 120, currentY);
    doc.font('Helvetica-Bold')
        .fillColor('red')
        .text('<NO. K/P PELAJAR>', leftMargin + 135, currentY);
    currentY += 15;
    doc.fillColor('black')
        .font('Helvetica')
        .text('INSTITUSI', leftMargin, currentY);
    doc.text(`: UNIVERSITI TEKNOLOGI MARA(UiTM), CAWANGAN MELAKA,`, leftMargin + 135, currentY);
    currentY += 15;
    doc.text('KAMPUS JASIN', leftMargin + 135, currentY);
    currentY += 25;
    const para1Start = `Dengan hormatnya perkara di atas dan surat tuan / puan `;
    const para1Ref = `<no rujukan surat tawaran>`;
    const para1End = ` bertarikh `;
    const para1Date = `<tarikh surat tawaran>`;
    const para1Final = ` adalah dirujuk.`;
    doc.font('Helvetica')
        .text(para1Start, leftMargin, currentY, { continued: true })
        .font('Helvetica-Bold')
        .fillColor('red')
        .text(para1Ref, { continued: true })
        .fillColor('black')
        .font('Helvetica')
        .text(para1End, { continued: true })
        .font('Helvetica-Bold')
        .fillColor('red')
        .text(para1Date, { continued: true })
        .fillColor('black')
        .font('Helvetica')
        .text(para1Final);
    currentY = doc.y + 20;
    const para2Part1 = `2.     Saya yang bernama di atas adalah penutut di Kolej Pengajian Pengkomputeran, Informatik dan Matematik, UiTM Cawangan Melaka, Kampus Jasin. Saya telah diterima sebagai pelatih industri di syarikat tuan / puan bermula dari `;
    const para2Date1 = `<tarikh mula>`;
    const para2Part2 = ` hingga `;
    const para2Date2 = `<tarikh tamat>`;
    const para2Part3 = `. Walau bagaimanapun, disebabkan oleh keadaan yang tidak dapat dielakkan, saya ingin memaklumkan bahawa saya tidak dapat melaporkan diri sebagai pelatih industri di organisasi tuan / puan seperti yang dijadualkan.`;
    doc.font('Helvetica')
        .text(para2Part1, leftMargin, currentY, {
        align: 'justify',
        continued: true
    })
        .font('Helvetica-Bold')
        .fillColor('red')
        .text(para2Date1, { continued: true })
        .fillColor('black')
        .font('Helvetica')
        .text(para2Part2, { continued: true })
        .font('Helvetica-Bold')
        .fillColor('red')
        .text(para2Date2, { continued: true })
        .fillColor('black')
        .font('Helvetica')
        .text(para2Part3, { align: 'justify' });
    currentY = doc.y + 20;
    const para3 = `3.     Saya ingin merakamkan ucapan terima kasih kepada tuan / puan kerana peluang yang diberikan kepada saya dan saya harap kegagalan saya untuk melapor diri tidak menghalang peluang untuk pelajar lain mendapat tempat sebagai pelatih industri di syarikat tuan / puan di masa akan datang.`;
    doc.font('Helvetica')
        .text(para3, leftMargin, currentY, { align: 'justify' });
    currentY = doc.y + 30;
    doc.text('Yang benar,', leftMargin, currentY);
    currentY += 60;
    doc.text('_______________________', leftMargin, currentY);
    currentY += 15;
    doc.font('Helvetica-Bold')
        .fillColor('red')
        .text('<NAMA PELAJAR>', leftMargin, currentY);
    currentY += 15;
    doc.fillColor('black')
        .font('Helvetica')
        .text('Tel:', leftMargin, currentY);
    currentY += 15;
    doc.text('Emel:', leftMargin, currentY);
}
function addFooter(doc, data) {
    const bottomMargin = 50;
    const pageHeight = doc.page.height;
    doc.fontSize(8)
        .font('Helvetica-Oblique')
        .fillColor('black')
        .text(`Dokumen ini dijana secara automatik oleh Sistem Pengurusan Latihan Praktikal pada ${formatDate(new Date())}`, 72, pageHeight - bottomMargin, { align: 'center', width: doc.page.width - 144 });
}
function formatDate(date) {
    const months = [
        'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
        'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
    ];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function validateSLI04Data(data) {
    var _a, _b, _c, _d;
    return !!(((_a = data.student) === null || _a === void 0 ? void 0 : _a.fullName) &&
        ((_b = data.student) === null || _b === void 0 ? void 0 : _b.matricNumber) &&
        ((_c = data.company) === null || _c === void 0 ? void 0 : _c.name) &&
        ((_d = data.company) === null || _d === void 0 ? void 0 : _d.position));
}
//# sourceMappingURL=sli04-generator.js.map