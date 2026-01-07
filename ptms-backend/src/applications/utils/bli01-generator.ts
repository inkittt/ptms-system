/**
 * BLI-01 PDF Generator
 * Generates Application for Industrial Training Placement
 * Based on official SLI-01 template format from UiTM
 */

import PDFDocument from 'pdfkit';

interface BLI01Data {
  student: {
    fullName: string;
    icNumber: string;
    matricNumber: string;
    program: string;
    faculty: string;
    cgpa: string;
    phone?: string;
    email?: string;
  };
  session: {
    id: string;
    name: string;
    year: number;
    semester: number;
  };
  application: {
    id: string;
    createdAt: Date;
  };
}

/**
 * Generate BLI-01 PDF document
 * @param applicationData - Application and student data
 * @returns Promise<Buffer> - PDF buffer
 */
export async function generateBLI01(applicationData: BLI01Data): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
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

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Generate document content
      addHeader(doc, applicationData);
      addFormContent(doc, applicationData);
      addFooter(doc, applicationData);

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add UITM header (matching SLI-01 format exactly)
 */
function addHeader(doc: PDFKit.PDFDocument, data: BLI01Data) {
  const leftMargin = 72;
  const pageWidth = doc.page.width;
  
  // Left side - Faculty name
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('Fakulti Sains Komputer dan', leftMargin, 50, { width: 180 });
  
  doc.text('Matematik', leftMargin, 63, { width: 180 });

  // Right side - University details
  const rightX = 220;
  doc.fontSize(9)
     .font('Helvetica')
     .text('Universiti Teknologi MARA(Melaka)', rightX, 50);
  
  doc.text('Kampus Jasin', rightX, 62);
  doc.text('77300 Merlimau, Jasin', rightX, 74);
  doc.text('Melaka Bandaraya Bersejarah', rightX, 86);
  doc.text('Tel: (+606) 2645000', rightX, 98);
}

/**
 * Add main letter content (matching SLI-01 format exactly)
 */
function addFormContent(doc: PDFKit.PDFDocument, data: BLI01Data) {
  const { student, session } = data;
  const leftMargin = 72;
  const rightMargin = 520;
  
  // Reference number and date (right aligned)
  const refY = 130;
  doc.fontSize(9)
     .font('Helvetica')
     .text('Reference : 100 – KJM(FSKM 14/3/4/3)', leftMargin + 300, refY);

  doc.text(`Date           : ${formatDateEnglish(new Date())}`, leftMargin + 300, refY + 12);

  // TO WHOM IT MAY CONCERN
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('TO WHOM IT MAY CONCERN', leftMargin, 180);

  // Salutation
  doc.fontSize(10)
     .font('Helvetica')
     .text('Dear Sir/Madam,', leftMargin, 210);

  // Subject line (underlined and bold)
  doc.font('Helvetica-Bold')
     .text('APPLICATION FOR INDUSTRIAL TRAINING PLACEMENT', leftMargin, 235, { 
       underline: true
     });

  // Student details table
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

  // Paragraph 1 - Certification
  const para1Y = detailsY + lineHeight * 4 + 20;
  doc.fontSize(10)
     .font('Helvetica')
     .text(
       `1.     We hereby certify that the candidate with the academic details above is a final year student of ${getProgramFullName(student.program)} from the Faculty of Computer and Mathematical Sciences, Universiti Teknologi MARA Cawangan Melaka Kampus Jasin.`,
       leftMargin, para1Y, { align: 'justify', width: rightMargin - leftMargin, lineGap: 2 }
     );

  // Paragraph 2 - Training requirement
  doc.text(
    `2.     In partial fulfillment of the requirements for the curriculum, the student must undergo Industrial training within 14 weeks. The training is expected to begin on ${formatTrainingDates(session)}.`,
    leftMargin, doc.y + 12, { align: 'justify', width: rightMargin - leftMargin, lineGap: 2 }
  );

  // Paragraph 3 - Request for acceptance
  doc.text(
    `3.     It would be a great honour if your esteemed organisation would accept the student's application for a placement at your company. During the industrial training period, it is hoped that the student may be employed full-time at your organisation, subject to your company's standard employment rules and regulations. The student will not be entitled to receive any holiday/leave without any formal consent from your organisation.`,
    leftMargin, doc.y + 12, { align: 'justify', width: rightMargin - leftMargin, lineGap: 2 }
  );

  // Paragraph 4 - Form completion
  doc.text(
    `4.     The application acceptance will be informed, directly to the student by completing the industrial training acceptance form attached (BLI-02). Please send a copy of the industrial training offer letter/e-mail to UiTM before ${formatDeadline(session)}. Thank you.`,
    leftMargin, doc.y + 12, { align: 'justify', width: rightMargin - leftMargin, lineGap: 2 }
  );

  // Closing
  doc.text('Sincerely,', leftMargin, doc.y + 25);

  // Signature space
  doc.moveDown(3);

  // Signature line
  const sigY = doc.y;
  doc.moveTo(leftMargin, sigY)
     .lineTo(leftMargin + 150, sigY)
     .stroke();

  // Coordinator details
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

/**
 * Add footer with metadata
 */
function addFooter(doc: PDFKit.PDFDocument, data: BLI01Data) {
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 40;

  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#666666')
     .text(
       'Dokumen ini dijana secara automatik oleh Sistem Pengurusan Latihan Industri (PTMS)',
       72, footerY, { align: 'center', width: doc.page.width - 144 }
     );

  doc.text(
    `Dijana pada: ${formatDateTime(new Date())} | Ref: ${data.application.id}`,
    72, footerY + 12, { align: 'center', width: doc.page.width - 144 }
  );
}

/**
 * Format date to Malaysian format (DD/MM/YYYY)
 */
function formatDate(date: Date): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date in English format (e.g., "May 2, 2025")
 */
function formatDateEnglish(date: Date): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Format datetime with time
 */
function formatDateTime(date: Date): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Get program full name from code
 */
function getProgramFullName(programCode: string): string {
  const programs: { [key: string]: string } = {
    'CS251': 'Bachelor of Computer Science (Hons.) Netcentric Computing (CS251)',
    'CS252': 'Bachelor of Computer Science (Hons.) Software Engineering (CS252)',
    'CS253': 'Bachelor of Computer Science (Hons.) Data Communication and Networking (CS253)',
    'CS254': 'Bachelor of Computer Science (Hons.) Multimedia Computing (CS254)',
    'CS255': 'Bachelor of Computer Science (Hons.) Information Systems Engineering (CS255)',
    'SE243': 'Bachelor of Computer Science (Hons.) Software Engineering (SE243)'
  };
  
  // If program code is in the map, return it
  if (programs[programCode]) {
    return programs[programCode];
  }
  
  // If it's already a full program name, return as is
  if (programCode.includes('Bachelor')) {
    return programCode;
  }
  
  // Default fallback
  return `Bachelor of Computer Science (Hons.) Netcentric Computing (${programCode})`;
}

/**
 * Format training session with dates
 */
function formatTrainingSession(session: any): string {
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  
  // Default to September - December based on the image
  const startMonth = 'SEPTEMBER';
  const endMonth = 'DECEMBER';
  const year = session.year || new Date().getFullYear();
  
  return `${startMonth} ${year} – ${endMonth} ${year}`;
}

/**
 * Format training dates for paragraph 2
 */
function formatTrainingDates(session: any): string {
  const year = session.year || new Date().getFullYear();
  return `15th September ${year} until 19th December ${year}`;
}

/**
 * Format deadline for BLI-02 submission
 */
function formatDeadline(session: any): string {
  const year = session.year || new Date().getFullYear();
  return `10th SEPTEMBER ${year}`;
}

/**
 * Validate application data before generation
 */
export function validateBLI01Data(data: BLI01Data): boolean {
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
