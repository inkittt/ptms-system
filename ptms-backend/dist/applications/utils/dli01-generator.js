"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDLI01 = generateDLI01;
exports.validateDLI01Data = validateDLI01Data;
const pdfkit_1 = __importDefault(require("pdfkit"));
const jobScopeItems = [
    'Learning and testing new technologies, frameworks and languages.',
    'Gathering requirements from clients and users.',
    'Breaking down program specification and translating into a programming language.',
    'Building and maintaining databases.',
    'Establishing a detailed program specification through discussion with clients.',
    'Conducting testing and installing the program into production.',
    'Writing detailed documentation for the operation of the program.',
    'Updating, repairing, modifying and developing existing software.',
    'Designing the architecture of the components of an application.',
    'Testing sites and applications in different browsers and environments.',
    'Documenting code for other developers understanding.',
    'Creating technical specifications.',
    'Conducting training and user manuals to users of a new system.',
    'Maintaining systems by monitoring and correcting software defects.',
    'Performing routine system backups and upgrades.',
    'Continually updating technical knowledge and skills by attending in-house and external courses, reading manuals and accessing new applications.',
    'Creating multimedia product designs using specialize software.',
    'Creating artwork to be used in video games.',
    'Transferring audio/video files to be edited and manipulated digitally.',
    'Creating digital images for the purpose of animation.',
    'Writing code to programme functions graphics, sounds and digital animation.',
    'Computer network setup, monitoring and maintenance.',
    'Computer, network and system security design, configuration, monitoring and maintenance.',
];
const professionalSkills = [
    'Project Management Skill',
    'Customer Service Skills',
    'Communication',
    'Teamwork',
    'Time Management',
    'Proactive Attitude',
];
async function generateDLI01(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: {
                    top: 60,
                    bottom: 60,
                    left: 72,
                    right: 72
                },
                info: {
                    Title: `DLI-01 ${data.student.matricNumber}`,
                    Author: 'UiTM Practical Training Management System',
                    Subject: 'Industrial Training Job Scope',
                    Keywords: 'DLI-01, Industrial Training, Job Scope',
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
            addIntroduction(doc);
            addJobScope(doc);
            addProfessionalSkills(doc);
            addFooter(doc);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
function addHeader(doc) {
    const pageWidth = doc.page.width;
    const leftMargin = 72;
    doc.fontSize(11)
        .font('Helvetica-Oblique')
        .text('DLI-01', pageWidth - 120, 40, { align: 'right', width: 100 });
    doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('INDUSTRIAL TRAINING JOB SCOPE', leftMargin, 70, {
        align: 'center',
        width: pageWidth - 144,
        underline: true
    });
    doc.moveDown(1.5);
}
function addIntroduction(doc) {
    const leftMargin = 72;
    const pageWidth = doc.page.width;
    const introText = 'The following are the training requirements and professional development skills to gain relevant skills and experience from industry.';
    doc.fontSize(10)
        .font('Helvetica')
        .text(introText, leftMargin, doc.y, {
        align: 'justify',
        width: pageWidth - 144
    });
    doc.moveDown(1.5);
}
function addJobScope(doc) {
    const leftMargin = 72;
    const pageWidth = doc.page.width;
    const rightMargin = pageWidth - 72;
    const textWidth = rightMargin - leftMargin - 30;
    doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('INDUSTRIAL TRAINING JOB SCOPE:', leftMargin, doc.y, { underline: true });
    doc.moveDown(0.3);
    doc.text('COMPUTER SCIENCE / MULTIMEDIA / INFORMATION SYSTEM ENGINEERING /', leftMargin, doc.y);
    doc.text('NETWORK AND NETCENTRIC COMPUTING', leftMargin, doc.y + 2);
    doc.moveDown(1);
    jobScopeItems.forEach((item, index) => {
        const itemNumber = `${index + 1}.`;
        const numberWidth = 25;
        if (doc.y > doc.page.height - 100) {
            doc.addPage();
        }
        doc.font('Helvetica')
            .text(itemNumber, leftMargin, doc.y, { width: numberWidth, continued: false });
        doc.text(item, leftMargin + numberWidth, doc.y - 12, {
            width: textWidth,
            align: 'justify'
        });
        doc.moveDown(0.5);
    });
    doc.moveDown(1);
}
function addProfessionalSkills(doc) {
    const leftMargin = 72;
    const pageWidth = doc.page.width;
    const rightMargin = pageWidth - 72;
    const textWidth = rightMargin - leftMargin - 30;
    if (doc.y > doc.page.height - 150) {
        doc.addPage();
    }
    doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('PROFESSIONAL DEVELOPMENT SKILLS REQUIREMENT', leftMargin, doc.y, { underline: true });
    doc.moveDown(1);
    professionalSkills.forEach((skill, index) => {
        const itemNumber = `${index + 1}.`;
        const numberWidth = 25;
        doc.font('Helvetica')
            .text(itemNumber, leftMargin, doc.y, { width: numberWidth, continued: false });
        doc.text(skill, leftMargin + numberWidth, doc.y - 12, {
            width: textWidth,
            align: 'left'
        });
        doc.moveDown(0.5);
    });
}
function addFooter(doc) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    doc.fontSize(10)
        .font('Helvetica-Oblique')
        .text('PP_FSKM 2019', pageWidth - 150, pageHeight - 50, {
        align: 'right',
        width: 100
    });
}
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
function validateDLI01Data(data) {
    var _a, _b, _c, _d, _e, _f;
    return !!(((_a = data.student) === null || _a === void 0 ? void 0 : _a.fullName) &&
        ((_b = data.student) === null || _b === void 0 ? void 0 : _b.matricNumber) &&
        ((_c = data.company) === null || _c === void 0 ? void 0 : _c.name) &&
        ((_d = data.training) === null || _d === void 0 ? void 0 : _d.startDate) &&
        ((_e = data.training) === null || _e === void 0 ? void 0 : _e.endDate) &&
        ((_f = data.coordinator) === null || _f === void 0 ? void 0 : _f.name));
}
//# sourceMappingURL=dli01-generator.js.map