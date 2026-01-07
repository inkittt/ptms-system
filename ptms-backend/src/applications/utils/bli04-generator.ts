/**
 * BLI-04 PDF Generator
 * Generates Reporting for Duty Form
 * Based on official BLI-04 template format from UiTM
 */

import PDFDocument from 'pdfkit';

interface BLI04Data {
  student: {
    fullName: string;
    matricNumber: string;
    program: string;
  };
  company: {
    name: string;
    address: string;
    department?: string;
    supervisorName?: string;
    supervisorPhone?: string;
    supervisorFax?: string;
    supervisorEmail?: string;
  };
  training: {
    startDate: Date;
    organizationSector?: string[];
    industryCode?: string[];
  };
}

/**
 * Generate BLI-04 PDF document
 * @param data - Application and student data
 * @returns Promise<Buffer> - PDF buffer
 */
export async function generateBLI04(data: BLI04Data): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        },
        info: {
          Title: `BLI-04 ${data.student.matricNumber}`,
          Author: 'UiTM Practical Training Management System',
          Subject: 'Reporting for Duty Form',
          Keywords: 'BLI-04, Industrial Training, Reporting for Duty',
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

      addFormContent(doc, data);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addFormContent(doc: PDFKit.PDFDocument, data: BLI04Data) {
  const leftMargin = 50;
  const rightMargin = doc.page.width - 50;
  const pageWidth = doc.page.width - 100;
  let currentY = 50;

  // BLI-04 label at top right
  doc.fontSize(10)
     .font('Helvetica')
     .text('BLI-04', rightMargin - 50, currentY, { width: 50, align: 'center' });
  doc.rect(rightMargin - 55, currentY - 5, 60, 20).stroke();

  currentY += 30;

  // Title
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('REPORTING FOR DUTY FORM', leftMargin, currentY, { width: pageWidth, align: 'center' });
  
  currentY += 15;
  doc.fontSize(10)
     .font('Helvetica-Oblique')
     .text('(To be filled up by the Organisation)', leftMargin, currentY, { width: pageWidth, align: 'center' });

  currentY += 25;

  // Student's Information Section
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text("STUDENT'S INFORMATION", leftMargin, currentY, { width: pageWidth, align: 'center' });
  
  currentY += 5;
  doc.rect(leftMargin, currentY, pageWidth, 15).stroke();
  
  currentY += 3;

  // Student info table
  const tableData = [
    { label: 'Name', value: data.student.fullName },
    { label: 'Student ID', value: data.student.matricNumber },
    { label: 'Program', value: data.student.program }
  ];

  tableData.forEach((row, index) => {
    const rowY = currentY + (index * 20);
    
    // Label column
    doc.rect(leftMargin, rowY, 100, 20).stroke();
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text(row.label, leftMargin + 5, rowY + 6);
    
    // Value column
    doc.rect(leftMargin + 100, rowY, pageWidth - 100, 20).stroke();
    doc.font('Helvetica')
       .text(row.value, leftMargin + 105, rowY + 6);
  });

  currentY += 65;

  // Organisation Information Section
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('ORGANISATION INFORMATION', leftMargin, currentY, { width: pageWidth, align: 'center' });
  
  currentY += 5;
  doc.rect(leftMargin, currentY, pageWidth, 15).stroke();
  
  currentY += 3;

  // Organisation info table
  const orgData = [
    { label: 'Name', value: data.company.name || '' },
    { label: 'Address', value: data.company.address || '', height: 40 },
    { label: 'Department', value: data.company.department || '' },
    { label: 'Supervisor Name', value: data.company.supervisorName || '' },
    { label: 'Telephone No', value: data.company.supervisorPhone || '' },
    { label: 'Fax No', value: data.company.supervisorFax || '' },
    { label: 'Email', value: data.company.supervisorEmail || '' }
  ];

  orgData.forEach((row) => {
    const rowHeight = row.height || 20;
    
    // Label column
    doc.rect(leftMargin, currentY, 100, rowHeight).stroke();
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text(row.label, leftMargin + 5, currentY + 6);
    
    // Value column
    doc.rect(leftMargin + 100, currentY, pageWidth - 100, rowHeight).stroke();
    doc.font('Helvetica')
       .text(row.value, leftMargin + 105, currentY + 6, { width: pageWidth - 110 });
    
    currentY += rowHeight;
  });

  currentY += 5;

  // Organisation Sector checkboxes
  doc.rect(leftMargin, currentY, 100, 180).stroke();
  doc.fontSize(9)
     .font('Helvetica-Bold')
     .text('Organisation Sector', leftMargin + 5, currentY + 6);

  doc.rect(leftMargin + 100, currentY, pageWidth - 100, 180).stroke();
  
  const sectors = [
    'Tick (X) where applicable',
    '☐ Agriculture, Forestry and Fisheries',
    '☐ Mining and Quarrying',
    '☐ Manufacturing',
    '☐ Electricity, Gas, Steam & Air',
    '☐ Water Supply, Sewerage, Waste',
    '☐ Management & Remediation Activities',
    '☐ Construction',
    '☐ Wholesale Trade & Retail Selling,',
    '   Repair of M. Vehicles',
    '☐ Transportation & Storage',
    '☐ Accommodation & Food Services',
    '☐ Information & Communication',
    '☐ Finance and Insurance / Takaful',
    '   Activities',
    '☐ Property Activities'
  ];

  const sectors2 = [
    '☐ Professional, Scientific & Technical',
    '   Activities',
    '☐ Administration & Support Services',
    '☐ Public Administration & Defense; Social',
    '   Security',
    '☐ Education',
    '☐ Human Health & Social Work Activities',
    '☐ Arts, Entertainment & Recreation',
    '☐ Other Service Activities',
    '☐ Household activity as an employer for',
    '   domestic personnel; undifferentiated',
    '   goods-producing and services-',
    '   producing goods and services',
    '   undifferentiated for private households for',
    '   own use',
    '☐ Organisation & Agencies Outside the',
    '   Territory',
    '☐ Others: _______________'
  ];

  let sectorY = currentY + 6;
  doc.fontSize(8).font('Helvetica');
  
  // Left column sectors
  sectors.forEach((sector, index) => {
    if (index === 0) {
      doc.font('Helvetica-Oblique').text(sector, leftMargin + 105, sectorY);
    } else {
      doc.font('Helvetica').text(sector, leftMargin + 105, sectorY);
    }
    sectorY += 10;
  });

  // Right column sectors
  sectorY = currentY + 16;
  sectors2.forEach((sector) => {
    doc.font('Helvetica').text(sector, leftMargin + 300, sectorY);
    sectorY += 10;
  });

  currentY += 185;

  // Industry Code checkboxes
  doc.rect(leftMargin, currentY, 100, 60).stroke();
  doc.fontSize(9)
     .font('Helvetica-Bold')
     .text('Industry Code', leftMargin + 5, currentY + 6);

  doc.rect(leftMargin + 100, currentY, pageWidth - 100, 60).stroke();
  
  const industryCodes = [
    'Tick (X) where applicable',
    '☐ Government',
    '☐ Statutory Body',
    '☐ Private Multinational / Foreign',
    '   / Local Private Agency'
  ];

  const industryCodes2 = [
    '☐ Own Enterprise',
    '☐ NGO',
    '☐ GLC',
    '☐ Others'
  ];

  let codeY = currentY + 6;
  doc.fontSize(8);
  
  industryCodes.forEach((code, index) => {
    if (index === 0) {
      doc.font('Helvetica-Oblique').text(code, leftMargin + 105, codeY);
    } else {
      doc.font('Helvetica').text(code, leftMargin + 105, codeY);
    }
    codeY += 12;
  });

  codeY = currentY + 18;
  industryCodes2.forEach((code) => {
    doc.font('Helvetica').text(code, leftMargin + 300, codeY);
    codeY += 12;
  });

  currentY += 65;

  // Industrial Supervisor Confirmation Section
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('INDUSTRIAL SUPERVISOR CONFIRMATION', leftMargin, currentY, { width: pageWidth, align: 'center' });
  
  currentY += 5;
  doc.rect(leftMargin, currentY, pageWidth, 100).stroke();
  
  currentY += 10;

  doc.fontSize(9)
     .font('Helvetica')
     .text('It is hereby confirmed that the above student has reported him/herself to undergo industrial training in this', 
           leftMargin + 5, currentY, { width: pageWidth - 10 });
  
  currentY += 12;
  doc.text('organization starting from ……………………………………….', leftMargin + 5, currentY);

  currentY += 25;
  doc.text('Supervisor Signature & Official Stamp:', leftMargin + 5, currentY);
  doc.text('Date:', leftMargin + 350, currentY);

  currentY += 50;

  // Footer instructions
  doc.fontSize(8)
     .font('Helvetica-Oblique')
     .text('Please return this form within 7 working days from the date of reporting for duty to:', 
           leftMargin, currentY, { width: pageWidth });
  
  currentY += 10;
  doc.font('Helvetica-Bold')
     .text('INDUSTRIAL TRAINING COORDINATOR (CDCS251/CS251)', leftMargin, currentY);
  
  currentY += 10;
  doc.font('Helvetica')
     .text('Faculty of Computer and Mathematical Sciences', leftMargin, currentY);
  
  currentY += 10;
  doc.text('Universiti Teknologi Mara (UiTM) Cawangan Melaka, Kampus Jasin', leftMargin, currentY);
  
  currentY += 10;
  doc.text('Email: albin1841@uitm.edu.my (013-8218885)', leftMargin, currentY);
}

export function validateBLI04Data(data: any): boolean {
  return !!(
    data.student?.fullName &&
    data.student?.matricNumber &&
    data.student?.program &&
    data.company?.name &&
    data.company?.address
  );
}
