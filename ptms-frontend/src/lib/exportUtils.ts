import jsPDF from "jspdf";
import "jspdf-autotable";

// Export report data to PDF
export const exportReportToPDF = (reportData: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PTMS Coordinator Report", pageWidth / 2, 20, { align: "center" });
  
  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const currentDate = new Date().toLocaleDateString("en-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${currentDate}`, pageWidth / 2, 28, { align: "center" });
  
  let yPosition = 40;

  // Overview Statistics
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Overview Statistics", 14, yPosition);
  yPosition += 10;

  const overviewData = [
    ["Total Students", reportData.totalStudents || "N/A"],
    ["Eligible Students", reportData.eligibleStudents || "N/A"],
    ["Total Applications", reportData.totalApplications || "N/A"],
    ["Approved Applications", reportData.approvedApplications || "N/A"],
    ["Pending Review", reportData.pendingReview || "N/A"],
    ["Average Review Time", `${reportData.avgReviewTime || "N/A"} days`],
    ["Approval Rate", `${reportData.avgApprovalRate || "N/A"}%`],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: overviewData,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Program Distribution
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Program Distribution", 14, yPosition);
  yPosition += 10;

  const programData = reportData.programDistribution?.map((p: any) => [
    p.program,
    p.students,
    p.approved,
    p.pending,
    p.rejected,
  ]) || [];

  (doc as any).autoTable({
    startY: yPosition,
    head: [["Program", "Students", "Approved", "Pending", "Rejected"]],
    body: programData,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Top Companies
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Top Companies", 14, yPosition);
  yPosition += 10;

  const companyData = reportData.topCompanies?.map((c: any, index: number) => [
    index + 1,
    c.company,
    c.industry,
    c.students,
  ]) || [];

  (doc as any).autoTable({
    startY: yPosition,
    head: [["#", "Company", "Industry", "Students"]],
    body: companyData,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = (doc as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  doc.save(`PTMS_Report_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Export data to Excel (CSV format)
export const exportReportToExcel = (reportData: any) => {
  let csvContent = "data:text/csv;charset=utf-8,";

  // Title and metadata
  csvContent += "PTMS Coordinator Report\n";
  csvContent += `Generated: ${new Date().toLocaleDateString("en-MY")}\n\n`;

  // Overview Statistics
  csvContent += "OVERVIEW STATISTICS\n";
  csvContent += "Metric,Value\n";
  csvContent += `Total Students,${reportData.totalStudents || "N/A"}\n`;
  csvContent += `Eligible Students,${reportData.eligibleStudents || "N/A"}\n`;
  csvContent += `Total Applications,${reportData.totalApplications || "N/A"}\n`;
  csvContent += `Approved Applications,${reportData.approvedApplications || "N/A"}\n`;
  csvContent += `Pending Review,${reportData.pendingReview || "N/A"}\n`;
  csvContent += `Average Review Time,${reportData.avgReviewTime || "N/A"} days\n`;
  csvContent += `Approval Rate,${reportData.avgApprovalRate || "N/A"}%\n\n`;

  // Program Distribution
  csvContent += "PROGRAM DISTRIBUTION\n";
  csvContent += "Program,Students,Approved,Pending,Rejected\n";
  reportData.programDistribution?.forEach((p: any) => {
    csvContent += `${p.program},${p.students},${p.approved},${p.pending},${p.rejected}\n`;
  });
  csvContent += "\n";

  // Top Companies
  csvContent += "TOP COMPANIES\n";
  csvContent += "Rank,Company,Industry,Students\n";
  reportData.topCompanies?.forEach((c: any, index: number) => {
    csvContent += `${index + 1},"${c.company}",${c.industry},${c.students}\n`;
  });
  csvContent += "\n";

  // Document Statistics
  csvContent += "DOCUMENT REVIEW STATISTICS\n";
  csvContent += "Document Type,Total,Approved,Revisions,Rejected,Avg Review Time,Approval Rate\n";
  reportData.documentStats?.forEach((d: any) => {
    const approvalRate = Math.round((d.approved / d.total) * 100);
    csvContent += `${d.type},${d.total},${d.approved},${d.revisions},${d.rejected},${d.avgReviewTime} days,${approvalRate}%\n`;
  });

  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `PTMS_Report_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Prepare report data for export
export const prepareReportData = (mockData: any) => {
  return {
    totalStudents: mockData.totalStudents,
    eligibleStudents: mockData.eligibleStudents,
    totalApplications: mockData.totalApplications,
    approvedApplications: mockData.approvedApplications,
    pendingReview: mockData.pendingReview,
    avgReviewTime: mockData.avgReviewTime,
    avgApprovalRate: mockData.avgApprovalRate,
    programDistribution: [
      { program: "CS251", students: 45, approved: 38, pending: 5, rejected: 2 },
      { program: "CS252", students: 30, approved: 25, pending: 4, rejected: 1 },
      { program: "CS253", students: 25, approved: 20, pending: 4, rejected: 1 },
      { program: "CS254", students: 20, approved: 15, pending: 3, rejected: 2 },
    ],
    topCompanies: [
      { company: "Tech Solutions Sdn Bhd", students: 8, industry: "IT Services" },
      { company: "Digital Innovations", students: 6, industry: "Software" },
      { company: "Malaysia Tech Corp", students: 5, industry: "Technology" },
      { company: "Smart Systems", students: 5, industry: "IT Consulting" },
      { company: "Cloud Services Malaysia", students: 4, industry: "Cloud Computing" },
    ],
    documentStats: [
      { type: "SLI-01", total: 78, approved: 70, revisions: 6, rejected: 2, avgReviewTime: 2.5 },
      { type: "SLI-02", total: 65, approved: 58, revisions: 5, rejected: 2, avgReviewTime: 3.2 },
      { type: "Resume", total: 78, approved: 72, revisions: 4, rejected: 2, avgReviewTime: 1.8 },
      { type: "Acceptance Letter", total: 78, approved: 75, revisions: 2, rejected: 1, avgReviewTime: 1.5 },
    ],
  };
};
