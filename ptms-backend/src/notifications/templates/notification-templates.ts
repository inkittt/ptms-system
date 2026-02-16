export interface NotificationTemplate {
  subject: { en: string; bm: string };
  body: { en: string; bm: string };
}

export const NotificationTemplates = {
  SUBMISSION_RECEIVED: {
    subject: {
      en: 'CST688: Application Submission Received',
      bm: 'CST688: Permohonan Diterima',
    },
    body: {
      en: `
        <h2>Application Submission Received</h2>
        <p>Hi {name},</p>
        <p>Your practical training application has been successfully submitted.</p>
        <p><strong>Application ID:</strong> {applicationId}</p>
        <p><strong>Organization:</strong> {organizationName}</p>
        <p><strong>Training Period:</strong> {startDate} – {endDate}</p>
        <p>Your application is now under review by the coordinator. You will be notified once a decision is made.</p>
        <p>You can track your application status in the <a href="{dashboardLink}">student dashboard</a>.</p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>Permohonan Diterima</h2>
        <p>Salam {name},</p>
        <p>Permohonan latihan praktikal anda telah berjaya dihantar.</p>
        <p><strong>ID Permohonan:</strong> {applicationId}</p>
        <p><strong>Organisasi:</strong> {organizationName}</p>
        <p><strong>Tempoh Latihan:</strong> {startDate} – {endDate}</p>
        <p>Permohonan anda kini sedang disemak oleh penyelaras. Anda akan dimaklumkan setelah keputusan dibuat.</p>
        <p>Anda boleh menjejaki status permohonan anda di <a href="{dashboardLink}">papan pemuka pelajar</a>.</p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },

  CHANGES_REQUESTED: {
    subject: {
      en: 'CST688: Changes Requested for Your Application',
      bm: 'CST688: Perubahan Diperlukan untuk Permohonan Anda',
    },
    body: {
      en: `
        <h2>Changes Requested</h2>
        <p>Hi {name},</p>
        <p>The coordinator has reviewed your application and requested some changes.</p>
        <p><strong>Application ID:</strong> {applicationId}</p>
        <p><strong>Comments:</strong></p>
        <blockquote>{comments}</blockquote>
        <p>Please review the comments and resubmit your application with the necessary changes.</p>
        <p><a href="{applicationLink}">View Application</a></p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>Perubahan Diperlukan</h2>
        <p>Salam {name},</p>
        <p>Penyelaras telah menyemak permohonan anda dan memerlukan beberapa perubahan.</p>
        <p><strong>ID Permohonan:</strong> {applicationId}</p>
        <p><strong>Komen:</strong></p>
        <blockquote>{comments}</blockquote>
        <p>Sila semak komen dan hantar semula permohonan anda dengan perubahan yang diperlukan.</p>
        <p><a href="{applicationLink}">Lihat Permohonan</a></p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },

  APPLICATION_APPROVED: {
    subject: {
      en: 'CST688: Application Approved',
      bm: 'CST688: Permohonan Diluluskan',
    },
    body: {
      en: `
        <h2>Application Approved</h2>
        <p>Hi {name},</p>
        <p>Congratulations! Your practical training application has been approved.</p>
        <p><strong>Application ID:</strong> {applicationId}</p>
        <p><strong>Organization:</strong> {organizationName}</p>
        <p><strong>Official Training Period:</strong> {startDate} – {endDate}</p>
        <p>Next steps:</p>
        <ul>
          <li>Your SLI-03 document will be prepared shortly</li>
          <li>You will receive another notification when it's ready for download</li>
        </ul>
        <p><a href="{dashboardLink}">View Dashboard</a></p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>Permohonan Diluluskan</h2>
        <p>Salam {name},</p>
        <p>Tahniah! Permohonan latihan praktikal anda telah diluluskan.</p>
        <p><strong>ID Permohonan:</strong> {applicationId}</p>
        <p><strong>Organisasi:</strong> {organizationName}</p>
        <p><strong>Tempoh Latihan Rasmi:</strong> {startDate} – {endDate}</p>
        <p>Langkah seterusnya:</p>
        <ul>
          <li>Dokumen SLI-03 anda akan disediakan tidak lama lagi</li>
          <li>Anda akan menerima notifikasi lain apabila ia sedia untuk dimuat turun</li>
        </ul>
        <p><a href="{dashboardLink}">Lihat Papan Pemuka</a></p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },

  SLI03_READY: {
    subject: {
      en: 'CST688: Your SLI-03 is ready',
      bm: 'CST688: SLI-03 anda telah sedia',
    },
    body: {
      en: `
        <h2>SLI-03 Document Ready</h2>
        <p>Hi {name},</p>
        <p>Your SLI-03 has been issued. Download your package here: <a href="{link}">{link}</a></p>
        <p><strong>Official dates:</strong> {startDate} – {endDate}</p>
        <p>Please print and bring this document to your training organization.</p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>Dokumen SLI-03 Sedia</h2>
        <p>Salam {name},</p>
        <p>SLI-03 anda telah dikeluarkan. Muat turun di: <a href="{link}">{link}</a></p>
        <p><strong>Tarikh rasmi:</strong> {startDate} – {endDate}</p>
        <p>Sila cetak dan bawa dokumen ini ke organisasi latihan anda.</p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },

  BLI04_DUE_REMINDER: {
    subject: {
      en: 'CST688: BLI-04 Submission Reminder ({daysLeft} days left)',
      bm: 'CST688: Peringatan Penghantaran BLI-04 ({daysLeft} hari lagi)',
    },
    body: {
      en: `
        <h2>BLI-04 Submission Reminder</h2>
        <p>Hi {name},</p>
        <p>This is a reminder that your BLI-04 (Final Report) submission is due in <strong>{daysLeft} days</strong>.</p>
        <p><strong>Due Date:</strong> {dueDate}</p>
        <p><strong>Application ID:</strong> {applicationId}</p>
        <p>Please ensure you submit your report on time to avoid any delays in your assessment.</p>
        <p><a href="{submissionLink}">Submit BLI-04</a></p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>Peringatan Penghantaran BLI-04</h2>
        <p>Salam {name},</p>
        <p>Ini adalah peringatan bahawa penghantaran BLI-04 (Laporan Akhir) anda akan tamat dalam <strong>{daysLeft} hari</strong>.</p>
        <p><strong>Tarikh Akhir:</strong> {dueDate}</p>
        <p><strong>ID Permohonan:</strong> {applicationId}</p>
        <p>Sila pastikan anda menghantar laporan anda tepat pada masanya untuk mengelakkan sebarang kelewatan dalam penilaian anda.</p>
        <p><a href="{submissionLink}">Hantar BLI-04</a></p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },

  OVERDUE_REMINDER: {
    subject: {
      en: 'CST688: URGENT - Overdue Submission',
      bm: 'CST688: SEGERA - Penghantaran Tertunggak',
    },
    body: {
      en: `
        <h2>Overdue Submission</h2>
        <p>Hi {name},</p>
        <p><strong style="color: red;">URGENT:</strong> Your {documentType} submission is now overdue.</p>
        <p><strong>Original Due Date:</strong> {dueDate}</p>
        <p><strong>Days Overdue:</strong> {daysOverdue}</p>
        <p><strong>Application ID:</strong> {applicationId}</p>
        <p>Please submit immediately to avoid further complications with your practical training assessment.</p>
        <p><a href="{submissionLink}">Submit Now</a></p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>Penghantaran Tertunggak</h2>
        <p>Salam {name},</p>
        <p><strong style="color: red;">SEGERA:</strong> Penghantaran {documentType} anda kini tertunggak.</p>
        <p><strong>Tarikh Akhir Asal:</strong> {dueDate}</p>
        <p><strong>Hari Tertunggak:</strong> {daysOverdue}</p>
        <p><strong>ID Permohonan:</strong> {applicationId}</p>
        <p>Sila hantar dengan segera untuk mengelakkan komplikasi lanjut dengan penilaian latihan praktikal anda.</p>
        <p><a href="{submissionLink}">Hantar Sekarang</a></p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },

  COORDINATOR_ESCALATION: {
    subject: {
      en: 'CST688: Escalation - Pending Item Requires Attention',
      bm: 'CST688: Eskalasi - Item Tertunda Memerlukan Perhatian',
    },
    body: {
      en: `
        <h2>Escalation Notice</h2>
        <p>Dear Coordinator,</p>
        <p>The following item has been pending for more than {thresholdDays} days and requires your attention:</p>
        <p><strong>Student:</strong> {studentName} ({matricNo})</p>
        <p><strong>Application ID:</strong> {applicationId}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Pending Since:</strong> {pendingSince}</p>
        <p><strong>Days Pending:</strong> {daysPending}</p>
        <p>Please review and take appropriate action.</p>
        <p><a href="{reviewLink}">Review Application</a></p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>Notis Eskalasi</h2>
        <p>Penyelaras yang dihormati,</p>
        <p>Item berikut telah tertunda selama lebih daripada {thresholdDays} hari dan memerlukan perhatian anda:</p>
        <p><strong>Pelajar:</strong> {studentName} ({matricNo})</p>
        <p><strong>ID Permohonan:</strong> {applicationId}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Tertunda Sejak:</strong> {pendingSince}</p>
        <p><strong>Hari Tertunda:</strong> {daysPending}</p>
        <p>Sila semak dan ambil tindakan yang sesuai.</p>
        <p><a href="{reviewLink}">Semak Permohonan</a></p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },

  NEW_SUBMISSION: {
    subject: {
      en: 'CST688: New Application Submission',
      bm: 'CST688: Permohonan Baharu Diterima',
    },
    body: {
      en: `
        <h2>New Application Submission</h2>
        <p>Dear Coordinator,</p>
        <p>A new practical training application has been submitted and requires your review.</p>
        <p><strong>Student:</strong> {studentName} ({matricNo})</p>
        <p><strong>Application ID:</strong> {applicationId}</p>
        <p><strong>Organization:</strong> {organizationName}</p>
        <p><strong>Training Period:</strong> {startDate} – {endDate}</p>
        <p><strong>Submitted At:</strong> {submittedAt}</p>
        <p>Please review the application at your earliest convenience.</p>
        <p><a href="{reviewLink}">Review Application</a></p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>Permohonan Baharu Diterima</h2>
        <p>Penyelaras yang dihormati,</p>
        <p>Permohonan latihan praktikal baharu telah dihantar dan memerlukan semakan anda.</p>
        <p><strong>Pelajar:</strong> {studentName} ({matricNo})</p>
        <p><strong>ID Permohonan:</strong> {applicationId}</p>
        <p><strong>Organisasi:</strong> {organizationName}</p>
        <p><strong>Tempoh Latihan:</strong> {startDate} – {endDate}</p>
        <p><strong>Dihantar Pada:</strong> {submittedAt}</p>
        <p>Sila semak permohonan ini secepat mungkin.</p>
        <p><a href="{reviewLink}">Semak Permohonan</a></p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },

  BATCH_SUBMISSIONS: {
    subject: {
      en: 'CST688: {count} New Submissions Require Review',
      bm: 'CST688: {count} Permohonan Baharu Memerlukan Semakan',
    },
    body: {
      en: `
        <h2>{count} New Submissions</h2>
        <p>Dear Coordinator,</p>
        <p>You have <strong>{count} new application submissions</strong> that require your review:</p>
        <hr>
        {items}
        <hr>
        <p><a href="{reviewLink}">View All Applications</a></p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>{count} Permohonan Baharu</h2>
        <p>Penyelaras yang dihormati,</p>
        <p>Anda mempunyai <strong>{count} permohonan baharu</strong> yang memerlukan semakan anda:</p>
        <hr>
        {items}
        <hr>
        <p><a href="{reviewLink}">Lihat Semua Permohonan</a></p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },

  BATCH_ESCALATIONS: {
    subject: {
      en: 'CST688: {count} Items Need Urgent Attention',
      bm: 'CST688: {count} Item Memerlukan Perhatian Segera',
    },
    body: {
      en: `
        <h2>{count} Items Require Urgent Attention</h2>
        <p>Dear Coordinator,</p>
        <p>The following <strong>{count} items</strong> have been pending and require your immediate attention:</p>
        <hr>
        {items}
        <hr>
        <p><a href="{reviewLink}">Review Pending Applications</a></p>
        <br>
        <p>Best regards,<br>UiTM PTMS System</p>
      `,
      bm: `
        <h2>{count} Item Memerlukan Perhatian Segera</h2>
        <p>Penyelaras yang dihormati,</p>
        <p><strong>{count} item</strong> berikut telah tertunda dan memerlukan perhatian segera anda:</p>
        <hr>
        {items}
        <hr>
        <p><a href="{reviewLink}">Semak Permohonan Tertunda</a></p>
        <br>
        <p>Sekian, terima kasih,<br>Sistem PTMS UiTM</p>
      `,
    },
  },
};

export function renderTemplate(
  template: NotificationTemplate,
  language: 'en' | 'bm',
  variables: Record<string, string>,
): { subject: string; body: string } {
  let subject = template.subject[language];
  let body = template.body[language];

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    body = body.replace(new RegExp(placeholder, 'g'), value);
  });

  return { subject, body };
}
