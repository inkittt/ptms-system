"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBLI01 = generateBLI01;
exports.validateBLI01Data = validateBLI01Data;
const pdfkit_1 = __importDefault(require("pdfkit"));
const sharp_1 = __importDefault(require("sharp"));
async function generateBLI01(applicationData) {
    return new Promise(async (resolve, reject) => {
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
            await addFormContent(doc, applicationData);
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
    const { campus } = data;
    const facultyLines = campus.faculty.split('\n');
    doc.fontSize(10)
        .font('Helvetica-Bold');
    facultyLines.forEach((line, index) => {
        doc.text(line, leftMargin, 50 + (index * 13), { width: 180 });
    });
    const rightX = 220;
    doc.fontSize(9)
        .font('Helvetica')
        .text(campus.universityBranch, rightX, 50);
    doc.text(campus.campusName, rightX, 62);
    doc.text(campus.address, rightX, 74);
    doc.text(campus.city, rightX, 86);
    doc.text(`Tel: ${campus.phone}`, rightX, 98);
}
async function addFormContent(doc, data) {
    const { student, session } = data;
    const leftMargin = 72;
    const rightMargin = 520;
    const refY = 130;
    const referenceNumber = session.referenceNumber || '100 – KJM(FSKM 14/3/4/3)';
    doc.fontSize(9)
        .font('Helvetica')
        .text(`Reference : ${referenceNumber}`, leftMargin + 300, refY);
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
    doc.text('Sincerely,', leftMargin, doc.y + 20);
    doc.moveDown(1);
    const { coordinator } = data;
    const signatureStartY = doc.y;
    if (coordinator.signature && coordinator.signatureType) {
        try {
            let base64Data = coordinator.signature;
            if (base64Data.includes('base64,')) {
                base64Data = base64Data.split('base64,')[1];
            }
            const signatureBuffer = Buffer.from(base64Data, 'base64');
            const processedSignature = await (0, sharp_1.default)(signatureBuffer)
                .trim({
                background: { r: 255, g: 255, b: 255 },
                threshold: 10
            })
                .png()
                .toBuffer();
            let signatureWidth, signatureHeight, verticalSpacing;
            if (coordinator.signatureType === 'drawn') {
                signatureWidth = 200;
                signatureHeight = 80;
                verticalSpacing = 60;
            }
            else if (coordinator.signatureType === 'image') {
                signatureWidth = 110;
                signatureHeight = 45;
                verticalSpacing = 55;
            }
            else {
                signatureWidth = 180;
                signatureHeight = 70;
                verticalSpacing = 75;
            }
            doc.image(processedSignature, leftMargin, signatureStartY, {
                width: signatureWidth,
                fit: [signatureWidth, signatureHeight],
            });
            doc.y = signatureStartY + verticalSpacing;
        }
        catch (error) {
            console.error('Error adding signature image:', error);
        }
    }
    else {
        doc.moveDown(2);
    }
    const lineY = doc.y;
    doc.lineWidth(1.5)
        .moveTo(leftMargin, lineY)
        .lineTo(leftMargin + 150, lineY)
        .stroke()
        .lineWidth(1);
    doc.fontSize(9)
        .font('Helvetica-Bold')
        .text(coordinator.name, leftMargin, lineY + 5);
    const coordinatorTitle = coordinator.program
        ? `Industrial Training Coordinator (${coordinator.program})`
        : 'Industrial Training Coordinator';
    doc.font('Helvetica')
        .text(coordinatorTitle, leftMargin, lineY + 17);
    const { campus } = data;
    doc.text(`${campus.universityBranch} ${campus.campusName}`, leftMargin, lineY + 29);
    doc.text(campus.address, leftMargin, lineY + 41);
    if (coordinator.phone) {
        doc.text(`Phone no: ${coordinator.phone}`, leftMargin, lineY + 53);
    }
    doc.text(`E-mail: ${coordinator.email}`, leftMargin, lineY + (coordinator.phone ? 65 : 53));
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
function getDayOrdinal(day) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = day % 100;
    return day + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
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
    if (session.startDate && session.endDate) {
        const start = new Date(session.startDate);
        const end = new Date(session.endDate);
        const startMonth = months[start.getMonth()];
        const endMonth = months[end.getMonth()];
        const startYear = start.getFullYear();
        const endYear = end.getFullYear();
        if (startYear === endYear) {
            return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
        }
        else {
            return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
        }
    }
    const year = session.year || new Date().getFullYear();
    return `SEPTEMBER ${year} – DECEMBER ${year}`;
}
function formatTrainingDates(session) {
    if (session.startDate && session.endDate) {
        const start = new Date(session.startDate);
        const end = new Date(session.endDate);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const startDay = start.getDate();
        const endDay = end.getDate();
        const startMonth = months[start.getMonth()];
        const endMonth = months[end.getMonth()];
        const startYear = start.getFullYear();
        const endYear = end.getFullYear();
        const startDayOrdinal = getDayOrdinal(startDay);
        const endDayOrdinal = getDayOrdinal(endDay);
        if (startYear === endYear) {
            return `${startDayOrdinal} ${startMonth} ${startYear} until ${endDayOrdinal} ${endMonth} ${endYear}`;
        }
        else {
            return `${startDayOrdinal} ${startMonth} ${startYear} until ${endDayOrdinal} ${endMonth} ${endYear}`;
        }
    }
    const year = session.year || new Date().getFullYear();
    return `15th September ${year} until 19th December ${year}`;
}
function formatDeadline(session) {
    if (session.applicationDeadline) {
        const deadline = new Date(session.applicationDeadline);
        const day = deadline.getDate();
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        const month = months[deadline.getMonth()];
        const year = deadline.getFullYear();
        const dayOrdinal = getDayOrdinal(day);
        return `${dayOrdinal} ${month} ${year}`;
    }
    if (session.startDate) {
        const start = new Date(session.startDate);
        const deadline = new Date(start);
        deadline.setDate(deadline.getDate() - 10);
        const day = deadline.getDate();
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        const month = months[deadline.getMonth()];
        const year = deadline.getFullYear();
        const dayOrdinal = getDayOrdinal(day);
        return `${dayOrdinal} ${month} ${year}`;
    }
    const year = session.year || new Date().getFullYear();
    return `10th SEPTEMBER ${year}`;
}
function validateBLI01Data(data) {
    const required = [
        data.student.fullName,
        data.student.matricNumber,
        data.student.program,
        data.student.faculty,
        data.session.name,
        data.coordinator.name,
        data.coordinator.email
    ];
    const missing = required.filter(field => !field);
    if (missing.length > 0) {
        throw new Error('Missing required fields for BLI-01 generation');
    }
    return true;
}
//# sourceMappingURL=bli01-generator.js.map