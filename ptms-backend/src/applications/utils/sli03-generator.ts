/**
 * SLI-03 PDF Generator
 * Generates Official Internship Letter (Surat Latihan Industri)
 * Based on official SLI-03 template format from UiTM
 */

import PDFDocument from 'pdfkit';

interface SLI03Data {
  student: {
    fullName: string;
    matricNumber: string;
    icNumber: string;
    program: string;
    faculty: string;
    email?: string;
  };
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    attentionTo?: string;
  };
  training: {
    startDate: Date;
    endDate: Date;
    duration: number;
  };
  session: {
    name: string;
    year: number;
    semester: number;
  };
  application: {
    id: string;
    approvedAt: Date;
  };
  coordinator: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
}

/**
 * Generate SLI-03 PDF document
 * @param data - Application and student data
 * @returns Promise<Buffer> - PDF buffer
 */
export async function generateSLI03(data: SLI03Data): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
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

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      addHeader(doc);
      addLetterContent(doc, data);
      addFooter(doc, data);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addHeader(doc: PDFKit.PDFDocument) {
  const leftMargin = 72;
  const pageWidth = doc.page.width;
  const rightMargin = pageWidth - 72;
  
  // Left side header
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('Fakulti Sains Komputer dan', leftMargin, 50);
  doc.text('Matematik', leftMargin, 63);
  
  // Right side header
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

function addLetterContent(doc: PDFKit.PDFDocument, data: SLI03Data) {
  const leftMargin = 72;
  const currentY = 130;
  
  // Generate reference number based on semester
  const semesterCode = data.session.semester === 1 ? '3/4' : '4/2';
  const refNo = `100 – KJM (FSKM 14/${semesterCode})`;
  const letterDate = formatDateMalay(data.application.approvedAt);
  
  // Reference and Date
  doc.fontSize(9)
     .font('Helvetica')
     .text(`REF: ${refNo}`, leftMargin, currentY);
  doc.text(`TARIKH: ${letterDate}`, leftMargin, currentY + 12);
  
  doc.moveDown(2);
  
  // Company Address
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
  
  // Salutation
  doc.text('Tuan/Puan,', leftMargin, doc.y);
  
  doc.moveDown(1);
  
  // Subject
  doc.font('Helvetica-Bold')
     .text('PENERIMAAN TAWARAN MENJALANI LATIHAN INDUSTRI', leftMargin, doc.y, { underline: true });
  
  doc.moveDown(1);
  
  // Student Details
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
  
  // Paragraph 1
  doc.font('Helvetica')
     .text('Dengan hormatnya perkara di atas dirujuk.', leftMargin, doc.y, { align: 'justify' });
  
  doc.moveDown(1);
  
  // Paragraph 2
  const para2 = `2.     Sukacita dimaklumkan pelajar seperti di atas telah menerima tawaran sebagai pelatih industri ` +
    `dengan syarikat tuan/puan seperti berikut:`;
  doc.text(para2, leftMargin, doc.y, { align: 'justify', width: 470 });
  
  doc.moveDown(1);
  
  // Training Details
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
  
  // Paragraph 3
  const para3 = `3.     Pelajar adalah terikat sepenuh tempoh latihan. Setiap pelatih akan diselia oleh seorang Penyelia Industri yang dilantik sepanjang tempoh latihan. ` +
    `Setiap pelajar harus mematuhi peraturan syarikat dan mengikuti skop bidang kursus seperti di Lampiran DLI-01.`;
  doc.text(para3, leftMargin, doc.y, { align: 'justify', width: 470 });
  
  doc.moveDown(1);
  
  // Paragraph 4
  const para4 = `4.     Setiap pelatih industri dilindungi oleh Skim Tabung Kecemasan Pelajar UiTM mengikut tarikh latihan yang telah ditetapkan oleh pihak UiTM.`;
  doc.text(para4, leftMargin, doc.y, { align: 'justify', width: 470 });
  
  doc.moveDown(1);
  
  // Paragraph 5
  const para5 = `5.     Bersama-sama ini disertakan Borang Lapor Diri (BLI-04) untuk diisi dan dikembalikan kepada pihak UiTM selewat-lewatnya selepas dua minggu dari tarikh pelatih melapor diri.`;
  doc.text(para5, leftMargin, doc.y, { align: 'justify', width: 470 });
  
  doc.moveDown(1);
  
  // Closing
  doc.text('Kami amat menghargai segala tunjuk ajar dan pihak tuan/puan semasa beliau menjalani latihan ini.', leftMargin, doc.y, { align: 'justify', width: 470 });
  doc.text('Pihak kami juga berharap agar pelajar dapat menyumbang kepada pembangunan organisasi pihak tuan/puan.', leftMargin, doc.y + 12, { align: 'justify', width: 470 });
  
  doc.moveDown(2);
  
  doc.text('Sekian. Terima kasih.', leftMargin, doc.y);
  
  doc.moveDown(2);
  
  // Signature
  doc.font('Helvetica')
     .text('Yang benar,', leftMargin, doc.y);
  
  doc.moveDown(3);
  
  // Coordinator signature line
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

function addFooter(doc: PDFKit.PDFDocument, data: SLI03Data) {
  const bottomMargin = 50;
  const pageHeight = doc.page.height;
  
  doc.fontSize(7)
     .font('Helvetica-Oblique')
     .text(
       `Dokumen ini dijana secara automatik oleh Sistem Pengurusan Latihan Praktikal pada ${formatDateMalay(new Date())}`,
       72,
       pageHeight - bottomMargin,
       { align: 'center', width: doc.page.width - 144 }
     );
}

function formatDateMalay(date: Date): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function validateSLI03Data(data: any): boolean {
  return !!(
    data.student?.fullName &&
    data.student?.matricNumber &&
    data.company?.name &&
    data.training?.startDate &&
    data.training?.endDate
  );
}
