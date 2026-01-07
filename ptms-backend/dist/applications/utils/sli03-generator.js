"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSLI03 = generateSLI03;
exports.validateSLI03Data = validateSLI03Data;
const pdfkit_1 = __importDefault(require("pdfkit"));
async function generateSLI03(data) {
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
                    Title: `SLI-03 ${data.student.matricNumber}`,
                    Author: 'UiTM Practical Training Management System',
                    Subject: 'Official Internship Letter',
                    Keywords: 'SLI-03, Industrial Training, Official Letter',
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
            addLetterContent(doc, data);
            addFooter(doc, data);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
function addHeader(doc) {
    const leftMargin = 72;
    const pageWidth = doc.page.width;
    const rightMargin = pageWidth - 72;
    doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('Fakulti Sains Komputer dan', leftMargin, 50);
    doc.text('Matematik', leftMargin, 63);
    doc.fontSize(9)
        .font('Helvetica-Bold')
        .text('Universiti Teknologi MARA(Melaka)', rightMargin - 150, 50, { width: 150, align: 'right' });
    doc.fontSize(8)
        .font('Helvetica')
        .text('Kampus Jasin', rightMargin - 150, 63, { width: 150, align: 'right' });
    doc.text('77300 Merlimau, Jasin', rightMargin - 150, 74, { width: 150, align: 'right' });
    doc.text('Melaka Bandaraya Bersejarah', rightMargin - 150, 85, { width: 150, align: 'right' });
    doc.text('Tel: (+606) 2643000', rightMargin - 150, 96, { width: 150, align: 'right' });
    doc.moveDown(3);
}
function addLetterContent(doc, data) {
    const leftMargin = 72;
    const currentY = 130;
    const semesterCode = data.session.semester === 1 ? '3/4' : '4/2';
    const refNo = `100 – KJM (FSKM 14/${semesterCode})`;
    const letterDate = formatDateMalay(data.application.approvedAt);
    doc.fontSize(9)
        .font('Helvetica')
        .text(`REF: ${refNo}`, leftMargin, currentY);
    doc.text(`TARIKH: ${letterDate}`, leftMargin, currentY + 12);
    doc.moveDown(2);
    doc.font('Helvetica-Bold')
        .text(data.company.name.toUpperCase(), leftMargin, doc.y);
    doc.font('Helvetica')
        .text(data.company.address.toUpperCase(), leftMargin, doc.y + 12);
    const fullAddress = `${data.company.postcode} ${data.company.city.toUpperCase()}`;
    doc.text(fullAddress, leftMargin, doc.y + 12);
    if (data.company.attentionTo) {
        doc.text(`u/p: ${data.company.attentionTo}`, leftMargin, doc.y + 12);
    }
    if (data.company.attentionTo) {
        doc.text(`ENCIK ${data.company.attentionTo}`, leftMargin, doc.y + 12);
    }
    doc.moveDown(1.5);
    doc.text('Tuan/Puan,', leftMargin, doc.y);
    doc.moveDown(1);
    doc.font('Helvetica-Bold')
        .text('PENERIMAAN TAWARAN MENJALANI LATIHAN INDUSTRI', leftMargin, doc.y, { underline: true });
    doc.moveDown(1);
    const detailsY = doc.y;
    const labelX = leftMargin;
    const colonX = leftMargin + 100;
    const valueX = colonX + 15;
    doc.font('Helvetica-Bold')
        .text('NAME PELAJAR', labelX, detailsY);
    doc.text(':', colonX, detailsY);
    doc.font('Helvetica')
        .text(data.student.fullName.toUpperCase(), valueX, detailsY);
    doc.font('Helvetica-Bold')
        .text('NO K/P', labelX, detailsY + 14);
    doc.text(':', colonX, detailsY + 14);
    doc.font('Helvetica')
        .text(data.student.icNumber, valueX, detailsY + 14);
    doc.font('Helvetica-Bold')
        .text('NO PELAJAR', labelX, detailsY + 28);
    doc.text(':', colonX, detailsY + 28);
    doc.font('Helvetica')
        .text(data.student.matricNumber, valueX, detailsY + 28);
    doc.font('Helvetica-Bold')
        .text('PROGRAM', labelX, detailsY + 42);
    doc.text(':', colonX, detailsY + 42);
    doc.font('Helvetica')
        .text(data.student.program.toUpperCase(), valueX, detailsY + 42, { width: 350 });
    doc.font('Helvetica-Bold')
        .text('INSTITUSI', labelX, detailsY + 70);
    doc.text(':', colonX, detailsY + 70);
    doc.font('Helvetica')
        .text('FAKULTI SAINS KOMPUTER DAN MATEMATIK (FSKM), UNIVERSITI', valueX, detailsY + 70, { width: 350 });
    doc.text('TEKNOLOGI MARA (UITM) CAWANGAN MELAKA KAMPUS JASIN', valueX, detailsY + 82, { width: 350 });
    doc.moveDown(7);
    doc.font('Helvetica')
        .text('Dengan hormatnya perkara di atas dirujuk.', leftMargin, doc.y, { align: 'justify' });
    doc.moveDown(1);
    const para2 = `2.     Sukacita dimaklumkan pelajar seperti di atas telah menerima tawaran sebagai pelatih industri ` +
        `dengan syarikat tuan/puan seperti berikut:`;
    doc.text(para2, leftMargin, doc.y, { align: 'justify', width: 470 });
    doc.moveDown(1);
    const trainingY = doc.y;
    doc.font('Helvetica-Bold')
        .text('TARIKH LATIHAN', leftMargin + 40, trainingY);
    doc.text(':', leftMargin + 140, trainingY);
    doc.font('Helvetica')
        .text(`${formatDateMalay(data.training.startDate)} hingga ${formatDateMalay(data.training.endDate)}`, leftMargin + 155, trainingY);
    doc.font('Helvetica-Bold')
        .text('TARIKH LAPOR DIRI', leftMargin + 40, trainingY + 14);
    doc.text(':', leftMargin + 140, trainingY + 14);
    doc.font('Helvetica')
        .text(formatDateMalay(data.training.startDate), leftMargin + 155, trainingY + 14);
    doc.font('Helvetica-Bold')
        .text('TEMPOH', leftMargin + 40, trainingY + 28);
    doc.text(':', leftMargin + 140, trainingY + 28);
    doc.font('Helvetica')
        .text(`${data.training.duration} MINGGU`, leftMargin + 155, trainingY + 28);
    doc.moveDown(4);
    const para3 = `3.     Pelajar adalah terikat sepenuh tempoh latihan. Setiap pelatih akan diselia oleh seorang Penyelia Industri yang dilantik sepanjang tempoh latihan. ` +
        `Setiap pelajar harus mematuhi peraturan syarikat dan mengikuti skop bidang kursus seperti di Lampiran DLI-01.`;
    doc.text(para3, leftMargin, doc.y, { align: 'justify', width: 470 });
    doc.moveDown(1);
    const para4 = `4.     Setiap pelatih industri dilindungi oleh Skim Tabung Kecemasan Pelajar UiTM mengikut tarikh latihan yang telah ditetapkan oleh pihak UiTM.`;
    doc.text(para4, leftMargin, doc.y, { align: 'justify', width: 470 });
    doc.moveDown(1);
    const para5 = `5.     Bersama-sama ini disertakan Borang Lapor Diri (BLI-04) untuk diisi dan dikembalikan kepada pihak UiTM selewat-lewatnya selepas dua minggu dari tarikh pelatih melapor diri.`;
    doc.text(para5, leftMargin, doc.y, { align: 'justify', width: 470 });
    doc.moveDown(1);
    doc.text('Kami amat menghargai segala tunjuk ajar dan pihak tuan/puan semasa beliau menjalani latihan ini.', leftMargin, doc.y, { align: 'justify', width: 470 });
    doc.text('Pihak kami juga berharap agar pelajar dapat menyumbang kepada pembangunan organisasi pihak tuan/puan.', leftMargin, doc.y + 12, { align: 'justify', width: 470 });
    doc.moveDown(2);
    doc.text('Sekian. Terima kasih.', leftMargin, doc.y);
    doc.moveDown(2);
    doc.font('Helvetica')
        .text('Yang benar,', leftMargin, doc.y);
    doc.moveDown(3);
    doc.text('_____________________', leftMargin, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica')
        .text(data.coordinator.name, leftMargin, doc.y);
    doc.text(data.coordinator.position, leftMargin, doc.y + 12);
    doc.text('Fakulti Sains Komputer dan Matematik (FSKM)', leftMargin, doc.y + 12);
    doc.text('UiTM Cawangan Melaka Kampus Jasin', leftMargin, doc.y + 12);
    doc.text(`Tel No: ${data.coordinator.phone}`, leftMargin, doc.y + 12);
    doc.text(`E-mel: ${data.coordinator.email}`, leftMargin, doc.y + 12);
}
function addFooter(doc, data) {
    const bottomMargin = 50;
    const pageHeight = doc.page.height;
    doc.fontSize(7)
        .font('Helvetica-Oblique')
        .text(`Dokumen ini dijana secara automatik oleh Sistem Pengurusan Latihan Praktikal pada ${formatDateMalay(new Date())}`, 72, pageHeight - bottomMargin, { align: 'center', width: doc.page.width - 144 });
}
function formatDateMalay(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
function validateSLI03Data(data) {
    var _a, _b, _c, _d, _e;
    return !!(((_a = data.student) === null || _a === void 0 ? void 0 : _a.fullName) &&
        ((_b = data.student) === null || _b === void 0 ? void 0 : _b.matricNumber) &&
        ((_c = data.company) === null || _c === void 0 ? void 0 : _c.name) &&
        ((_d = data.training) === null || _d === void 0 ? void 0 : _d.startDate) &&
        ((_e = data.training) === null || _e === void 0 ? void 0 : _e.endDate));
}
//# sourceMappingURL=sli03-generator.js.map