/**
 * DLI-01 PDF Generator
 * Generates Industrial Training Job Scope document
 * Based on official DLI-01 template format from UiTM
 */

import PDFDocument from 'pdfkit';

interface DLI01Data {
  student: {
    fullName: string;
    icNumber: string;
    matricNumber: string;
    program: string;
    faculty: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
  };
  training: {
    startDate: Date;
    endDate: Date;
    duration: number;
  };
  coordinator: {
    name: string;
    email: string;
    phone: string;
  };
  session: {
    name: string;
    year: number;
    semester: number;
  };
  application: {
    id: string;
  };
}

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

/**
 * Generate DLI-01 PDF document
 * @param data - Application and student data
 * @returns Promise<Buffer> - PDF buffer
 */
export async function generateDLI01(data: DLI01Data): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
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

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
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
    } catch (error) {
      reject(error);
    }
  });
}

function addHeader(doc: PDFKit.PDFDocument) {
  const pageWidth = doc.page.width;
  const leftMargin = 72;
  
  // DLI-01 label at top right
  doc.fontSize(11)
     .font('Helvetica-Oblique')
     .text('DLI-01', pageWidth - 120, 40, { align: 'right', width: 100 });
  
  // Main title
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('INDUSTRIAL TRAINING JOB SCOPE', leftMargin, 70, { 
       align: 'center', 
       width: pageWidth - 144,
       underline: true
     });
  
  doc.moveDown(1.5);
}

function addIntroduction(doc: PDFKit.PDFDocument) {
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

function addJobScope(doc: PDFKit.PDFDocument) {
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
  
  // Add numbered job scope items
  jobScopeItems.forEach((item, index) => {
    const itemNumber = `${index + 1}.`;
    const numberWidth = 25;
    
    // Check if we need a new page
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

function addProfessionalSkills(doc: PDFKit.PDFDocument) {
  const leftMargin = 72;
  const pageWidth = doc.page.width;
  const rightMargin = pageWidth - 72;
  const textWidth = rightMargin - leftMargin - 30;
  
  // Check if we need a new page
  if (doc.y > doc.page.height - 150) {
    doc.addPage();
  }
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('PROFESSIONAL DEVELOPMENT SKILLS REQUIREMENT', leftMargin, doc.y, { underline: true });
  
  doc.moveDown(1);
  
  // Add numbered professional skills
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

function addFooter(doc: PDFKit.PDFDocument) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  
  // Add PP_FSKM 2019 at bottom right
  doc.fontSize(10)
     .font('Helvetica-Oblique')
     .text('PP_FSKM 2019', pageWidth - 150, pageHeight - 50, { 
       align: 'right',
       width: 100
     });
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function validateDLI01Data(data: any): boolean {
  return !!(
    data.student?.fullName &&
    data.student?.matricNumber &&
    data.company?.name &&
    data.training?.startDate &&
    data.training?.endDate &&
    data.coordinator?.name
  );
}
