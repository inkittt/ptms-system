"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBLI01 = generateBLI01;
exports.validateBLI01Data = validateBLI01Data;
const pdfkit_1 = __importDefault(require("pdfkit"));
async function generateBLI01(applicationData) {
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
                    Title: `SLI-01 ${applicationData.student.matricNumber}`,
                    Author: 'UiTM Practical Training Management System',
                    Subject: 'Application for Industrial Training Placement',
                    Keywords: 'SLI-01, Industrial Training, Application',
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
            addHeader(doc, applicationData);
            addFormContent(doc, applicationData);
            addFooter(doc, applicationData);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
function addHeader(doc, data) {
    const leftMargin = 72;
    const pageWidth = doc.page.width;
    doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('Fakulti Sains Komputer dan', leftMargin, 50, { width: 180 });
    doc.text('Matematik', leftMargin, 63, { width: 180 });
    const rightX = 220;
    doc.fontSize(9)
        .font('Helvetica')
        .text('Universiti Teknologi MARA(Melaka)', rightX, 50);
    doc.text('Kampus Jasin', rightX, 62);
    doc.text('77300 Merlimau, Jasin', rightX, 74);
    doc.text('Melaka Bandaraya Bersejarah', rightX, 86);
    doc.text('Tel: (+606) 2645000', rightX, 98);
}
function addFormContent(doc, data) {
    const { student, session } = data;
    const leftMargin = 72;
    const rightMargin = 520;
    const refY = 130;
    doc.fontSize(9)
        .font('Helvetica')
        .text('Reference : 100 – KJM(FSKM 14/3/4/3)', leftMargin + 300, refY);
    doc.text(`Date           : ${formatDateEnglish(new Date())}`, leftMargin + 300, refY + 12);
    doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('TO WHOM IT MAY CONCERN', leftMargin, 180);
    doc.fontSize(10)
        .font('Helvetica')
        .text('Dear Sir/Madam,', leftMargin, 210);
    doc.font('Helvetica-Bold')
        .text('APPLICATION FOR INDUSTRIAL TRAINING PLACEMENT', leftMargin, 235, {
        underline: true
    });
    const detailsY = 265;
    const labelX = leftMargin;
    const colonX = leftMargin + 130;
    const valueX = colonX + 15;
    const lineHeight = 13;
    doc.font('Helvetica-Bold').fontSize(9).text('NAME OF STUDENT', labelX, detailsY);
    doc.font('Helvetica').text(':', colonX, detailsY);
    doc.text(student.fullName.toUpperCase(), valueX, detailsY);
    doc.font('Helvetica-Bold').text('NRIC', labelX, detailsY + lineHeight);
    doc.font('Helvetica').text(':', colonX, detailsY + lineHeight);
    doc.text(student.icNumber || 'N/A', valueX, detailsY + lineHeight);
    doc.font('Helvetica-Bold').text('UITM STUDENT NO', labelX, detailsY + lineHeight * 2);
    doc.font('Helvetica').text(':', colonX, detailsY + lineHeight * 2);
    doc.text(student.matricNumber, valueX, detailsY + lineHeight * 2);
    doc.font('Helvetica-Bold').text('TRAINING SESSION', labelX, detailsY + lineHeight * 3);
    doc.font('Helvetica').text(':', colonX, detailsY + lineHeight * 3);
    doc.text(formatTrainingSession(session), valueX, detailsY + lineHeight * 3);
    const para1Y = detailsY + lineHeight * 4 + 20;
    doc.fontSize(10)
        .font('Helvetica')
        .text(`1.     We hereby certify that the candidate with the academic details above is a final year student of ${getProgramFullName(student.program)} from the Faculty of Computer and Mathematical Sciences, Universiti Teknologi MARA Cawangan Melaka Kampus Jasin.`, leftMargin, para1Y, { align: 'justify', width: rightMargin - leftMargin, lineGap: 2 });
    doc.text(`2.     In partial fulfillment of the requirements for the curriculum, the student must undergo Industrial training within 14 weeks. The training is expected to begin on ${formatTrainingDates(session)}.`, leftMargin, doc.y + 12, { align: 'justify', width: rightMargin - leftMargin, lineGap: 2 });
    doc.text(`3.     It would be a great honour if your esteemed organisation would accept the student's application for a placement at your company. During the industrial training period, it is hoped that the student may be employed full-time at your organisation, subject to your company's standard employment rules and regulations. The student will not be entitled to receive any holiday/leave without any formal consent from your organisation.`, leftMargin, doc.y + 12, { align: 'justify', width: rightMargin - leftMargin, lineGap: 2 });
    doc.text(`4.     The application acceptance will be informed, directly to the student by completing the industrial training acceptance form attached (BLI-02). Please send a copy of the industrial training offer letter/e-mail to UiTM before ${formatDeadline(session)}. Thank you.`, leftMargin, doc.y + 12, { align: 'justify', width: rightMargin - leftMargin, lineGap: 2 });
    doc.text('Sincerely,', leftMargin, doc.y + 25);
    doc.moveDown(3);
    const sigY = doc.y;
    doc.moveTo(leftMargin, sigY)
        .lineTo(leftMargin + 150, sigY)
        .stroke();
    doc.fontSize(9)
        .font('Helvetica-Bold')
        .text('Albin Lemuel Kushan', leftMargin, sigY + 5);
    doc.font('Helvetica')
        .text('Industrial Training Coordinator (CS251)', leftMargin, sigY + 17);
    doc.text('UiTM Cawangan Melaka Kampus Jasin', leftMargin, sigY + 29);
    doc.text('77300 Merlimau, Melaka', leftMargin, sigY + 41);
    doc.text('Phone no: 013-8218885', leftMargin, sigY + 53);
    doc.text('E-mail: albin1841@uitm.edu.my', leftMargin, sigY + 65);
}
function addFooter(doc, data) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 40;
    doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Dokumen ini dijana secara automatik oleh Sistem Pengurusan Latihan Industri (PTMS)', 72, footerY, { align: 'center', width: doc.page.width - 144 });
    doc.text(`Dijana pada: ${formatDateTime(new Date())} | Ref: ${data.application.id}`, 72, footerY + 12, { align: 'center', width: doc.page.width - 144 });
}
function formatDate(date) {
    if (!date)
        return 'N/A';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
function formatDateEnglish(date) {
    if (!date)
        return 'N/A';
    const d = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function formatDateTime(date) {
    if (!date)
        return 'N/A';
    const d = new Date(date);
    const dateStr = formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
}
function getProgramFullName(programCode) {
    const programs = {
        'CS251': 'Bachelor of Computer Science (Hons.) Netcentric Computing (CS251)',
        'CS252': 'Bachelor of Computer Science (Hons.) Software Engineering (CS252)',
        'CS253': 'Bachelor of Computer Science (Hons.) Data Communication and Networking (CS253)',
        'CS254': 'Bachelor of Computer Science (Hons.) Multimedia Computing (CS254)',
        'CS255': 'Bachelor of Computer Science (Hons.) Information Systems Engineering (CS255)',
        'SE243': 'Bachelor of Computer Science (Hons.) Software Engineering (SE243)'
    };
    if (programs[programCode]) {
        return programs[programCode];
    }
    if (programCode.includes('Bachelor')) {
        return programCode;
    }
    return `Bachelor of Computer Science (Hons.) Netcentric Computing (${programCode})`;
}
function formatTrainingSession(session) {
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const startMonth = 'SEPTEMBER';
    const endMonth = 'DECEMBER';
    const year = session.year || new Date().getFullYear();
    return `${startMonth} ${year} – ${endMonth} ${year}`;
}
function formatTrainingDates(session) {
    const year = session.year || new Date().getFullYear();
    return `15th September ${year} until 19th December ${year}`;
}
function formatDeadline(session) {
    const year = session.year || new Date().getFullYear();
    return `10th SEPTEMBER ${year}`;
}
function validateBLI01Data(data) {
    const required = [
        data.student.fullName,
        data.student.matricNumber,
        data.student.program,
        data.student.faculty,
        data.session.name
    ];
    const missing = required.filter(field => !field);
    if (missing.length > 0) {
        throw new Error('Missing required fields for BLI-01 generation');
    }
    return true;
}
//# sourceMappingURL=bli01-generator.js.map