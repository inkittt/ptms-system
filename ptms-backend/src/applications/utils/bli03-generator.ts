/**
 * BLI-03 PDF Generator
 * Generates Industrial Training Placement Form (BLI-03)
 * Based on official template format from UiTM FSKM
 */

import PDFDocument from 'pdfkit';

interface BLI03Data {
  student: {
    name: string;
    matricNo: string;
    program: string;
    phone: string;
    email: string;
    startDate: string;
    endDate: string;
  };
  organization: {
    name: string;
    address: string;
    phone: string;
    fax?: string;
    email: string;
    contactPersonName: string;
    contactPersonPhone: string;
  };
  application: {
    id: string;
    createdAt: Date;
  };
}

/**
 * Generate BLI-03 PDF document
 * @param data - Application and organization data
 * @returns Promise<Buffer> - PDF buffer
 */
export async function generateBLI03(data: BLI03Data): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
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

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Generate document content
      addHeader(doc);
      addFormContent(doc, data);
      addDeclarationSection(doc);
      addSignatureSection(doc);

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add UiTM header with logo placeholder and BLI-03 box
 */
function addHeader(doc: PDFKit.PDFDocument) {
  const leftMargin = 60;
  const pageWidth = doc.page.width;
  
  // Logo placeholder (left side)
  doc.fontSize(8)
     .font('Helvetica')
     .text('UNIVERSITI', leftMargin, 55);
  doc.text('TEKNOLOGI', leftMargin, 65);
  doc.text('MARA', leftMargin, 75);

  // University details (center-left)
  doc.fontSize(9)
     .font('Helvetica-Bold')
     .text('Kolej', leftMargin + 80, 55);
  
  doc.fontSize(8)
     .font('Helvetica')
     .text('Pengajian Pengkomputeran,', leftMargin + 80, 67);
  doc.text('Informatik dan Matematik', leftMargin + 80, 77);

  // BLI-03 box (right side)
  const boxX = pageWidth - 110;
  const boxY = 55;
  doc.rect(boxX, boxY, 50, 20).stroke();
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('BLI-03', boxX + 8, boxY + 5);
}

/**
 * Add main form content
 */
function addFormContent(doc: PDFKit.PDFDocument, data: BLI03Data) {
  const leftMargin = 60;
  const pageWidth = doc.page.width - 120;
  let currentY = 110;

  // Title
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

  // Section A: BUTIRAN PELAJAR
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('A.  BUTIRAN PELAJAR', leftMargin, currentY);

  currentY += 15;

  // Student details table
  const tableX = leftMargin;
  const tableWidth = pageWidth;
  const rowHeight = 20;
  const col1Width = 150;

  // Draw table borders and content
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

  // Tarikh LI row with two columns
  drawTableRowSplit(doc, tableX, currentY, tableWidth, rowHeight, 'Tarikh LI:', 
    'Mula:', data.student.startDate, 'Tamat:', data.student.endDate, col1Width);
  currentY += rowHeight;

  currentY += 15;

  // Section B: PEMILIHAN TEMPAT ORGANISASI
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('B.  PEMILIHAN TEMPAT ORGANISASI', leftMargin, currentY);

  currentY += 15;

  // Organization name (large box)
  drawLargeTableRow(doc, tableX, currentY, tableWidth, 40, 'Nama Organisasi:', data.organization.name);
  currentY += 40;

  // Organization address (large box)
  drawLargeTableRow(doc, tableX, currentY, tableWidth, 50, 'Alamat Organisasi:', data.organization.address);
  currentY += 50;

  // Phone/Fax row
  drawTableRowSplit(doc, tableX, currentY, tableWidth, rowHeight, 'No. Telefon/Faks:', 
    'TEL:', data.organization.phone, 'FAX:', data.organization.fax || '', col1Width);
  currentY += rowHeight;

  // Email
  drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'E-mel:', data.organization.email, col1Width);
  currentY += rowHeight;

  // Contact person
  drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'Nama Pegawai Bertanggungjawab:', data.organization.contactPersonName, col1Width);
  currentY += rowHeight;

  // Contact person phone
  drawTableRow(doc, tableX, currentY, tableWidth, rowHeight, 'No. Telefon Pegawai:', data.organization.contactPersonPhone, col1Width);
  currentY += rowHeight;

  return currentY;
}

/**
 * Add declaration section
 */
function addDeclarationSection(doc: PDFKit.PDFDocument) {
  const leftMargin = 60;
  const pageWidth = doc.page.width - 120;
  let currentY = doc.y + 15;

  doc.fontSize(9)
     .font('Helvetica')
     .text(
       'Dengan ini, saya bersetuju untuk memilih menjalani latihan industri di syarikat/organisasi seperti di atas. Saya memahami bahawa saya tidak boleh membuat penukaran penempatan latihan industri di syarikat/organisasi lain selain organisasi di atas kecuali atas sebab-sebab yang tidak dapat dielakkan dengan kebenaran pihak kolej.',
       leftMargin, currentY, {
         align: 'justify',
         width: pageWidth,
         lineGap: 3
       }
     );

  currentY = doc.y + 20;

  // Two column layout for signatures
  const col1X = leftMargin;
  const col2X = leftMargin + (pageWidth / 2) + 20;

  doc.fontSize(9)
     .font('Helvetica')
     .text('Yang Benar,', col1X, currentY);

  doc.text('Pengesahan Penyelaras Latihan Industri', col2X, currentY);
}

/**
 * Add signature section
 */
function addSignatureSection(doc: PDFKit.PDFDocument) {
  const leftMargin = 60;
  const pageWidth = doc.page.width - 120;
  let currentY = doc.y + 50;

  const col1X = leftMargin;
  const col2X = leftMargin + (pageWidth / 2) + 20;

  // Student signature line
  doc.moveTo(col1X, currentY)
     .lineTo(col1X + 150, currentY)
     .stroke();

  // Coordinator signature line
  doc.moveTo(col2X, currentY)
     .lineTo(col2X + 150, currentY)
     .stroke();

  currentY += 5;

  doc.fontSize(8)
     .font('Helvetica')
     .text('Tandatangan Pelajar', col1X, currentY);
  
  doc.text('Tandatangan Penyelaras Latihan Industri', col2X, currentY);

  currentY += 12;

  doc.text('Tarikh:', col1X, currentY);
  doc.text('Tarikh:', col2X, currentY);
}

/**
 * Draw a single row table with label and value
 */
function drawTableRow(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  labelWidth: number
) {
  // Draw borders
  doc.rect(x, y, width, height).stroke();
  doc.moveTo(x + labelWidth, y)
     .lineTo(x + labelWidth, y + height)
     .stroke();

  // Add text
  doc.fontSize(9)
     .font('Helvetica')
     .text(label, x + 5, y + 5, { width: labelWidth - 10 });

  doc.text(value, x + labelWidth + 5, y + 5, { width: width - labelWidth - 10 });
}

/**
 * Draw a table row split into two value columns (for dates, phone/fax)
 */
function drawTableRowSplit(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  label1: string,
  value1: string,
  label2: string,
  value2: string,
  labelWidth: number
) {
  // Draw outer border
  doc.rect(x, y, width, height).stroke();
  
  // Draw vertical dividers
  doc.moveTo(x + labelWidth, y)
     .lineTo(x + labelWidth, y + height)
     .stroke();

  const midPoint = x + labelWidth + ((width - labelWidth) / 2);
  doc.moveTo(midPoint, y)
     .lineTo(midPoint, y + height)
     .stroke();

  // Add text
  doc.fontSize(9)
     .font('Helvetica')
     .text(label, x + 5, y + 5, { width: labelWidth - 10 });

  // First value column
  const val1X = x + labelWidth + 5;
  doc.text(label1, val1X, y + 5, { continued: true })
     .text(' ' + value1);

  // Second value column
  const val2X = midPoint + 5;
  doc.text(label2, val2X, y + 5, { continued: true })
     .text(' ' + value2);
}

/**
 * Draw a large table row for multi-line content
 */
function drawLargeTableRow(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string
) {
  // Draw border
  doc.rect(x, y, width, height).stroke();

  // Add label
  doc.fontSize(9)
     .font('Helvetica')
     .text(label, x + 5, y + 5);

  // Add value (multi-line if needed)
  doc.text(value, x + 5, y + 20, { 
    width: width - 10,
    lineGap: 2
  });
}

/**
 * Validate BLI-03 data before generation
 */
export function validateBLI03Data(data: BLI03Data): boolean {
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
