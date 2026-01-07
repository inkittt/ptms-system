// Simple export utilities without external dependencies

// Export data to CSV (Excel-compatible)
export const exportReportToCSV = (reportData: any) => {
  let csvContent = "";

  // Title and metadata
  csvContent += "PTMS Coordinator Report\n";
  csvContent += `Generated: ${new Date().toLocaleDateString("en-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}\n\n`;

  // Overview Statistics
  csvContent += "OVERVIEW STATISTICS\n";
  csvContent += "Metric,Value\n";
  csvContent += `Total Students,${reportData.totalStudents || "N/A"}\n`;
  csvContent += `Eligible Students,${reportData.eligibleStudents || "N/A"}\n`;
  csvContent += `Total Applications,${reportData.totalApplications || "N/A"}\n`;
  csvContent += `Approved Applications,${reportData.approvedApplications || "N/A"}\n`;
  csvContent += `Pending Review,${reportData.pendingReview || "N/A"}\n`;
  csvContent += `Changes Requested,${reportData.changesRequested || "N/A"}\n`;
  csvContent += `Rejected Applications,${reportData.rejectedApplications || "N/A"}\n`;
  csvContent += `SLI-03 Issued,${reportData.sli03Issued || "N/A"}\n`;
  csvContent += `Ongoing Internships,${reportData.ongoingInternships || "N/A"}\n`;
  csvContent += `Completed Internships,${reportData.completedInternships || "N/A"}\n`;
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

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `PTMS_Report_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export data to JSON
export const exportReportToJSON = (reportData: any) => {
  const jsonData = {
    title: "PTMS Coordinator Report",
    generatedDate: new Date().toISOString(),
    overviewStatistics: {
      totalStudents: reportData.totalStudents,
      eligibleStudents: reportData.eligibleStudents,
      totalApplications: reportData.totalApplications,
      approvedApplications: reportData.approvedApplications,
      pendingReview: reportData.pendingReview,
      changesRequested: reportData.changesRequested,
      rejectedApplications: reportData.rejectedApplications,
      sli03Issued: reportData.sli03Issued,
      ongoingInternships: reportData.ongoingInternships,
      completedInternships: reportData.completedInternships,
      avgReviewTime: reportData.avgReviewTime,
      avgApprovalRate: reportData.avgApprovalRate,
    },
    programDistribution: reportData.programDistribution,
    topCompanies: reportData.topCompanies,
    documentStatistics: reportData.documentStats,
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `PTMS_Report_${new Date().toISOString().split("T")[0]}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Print report (opens browser print dialog)
export const printReport = () => {
  window.print();
};

// Prepare report data for export
export const prepareReportData = (mockData: any) => {
  return {
    totalStudents: mockData.totalStudents,
    eligibleStudents: mockData.eligibleStudents,
    totalApplications: mockData.totalApplications,
    approvedApplications: mockData.approvedApplications,
    pendingReview: mockData.pendingReview,
    changesRequested: mockData.changesRequested,
    rejectedApplications: mockData.rejectedApplications,
    sli03Issued: mockData.sli03Issued,
    ongoingInternships: mockData.ongoingInternships,
    completedInternships: mockData.completedInternships,
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
      {
        type: "Acceptance Letter",
        total: 78,
        approved: 75,
        revisions: 2,
        rejected: 1,
        avgReviewTime: 1.5,
      },
    ],
  };
};
