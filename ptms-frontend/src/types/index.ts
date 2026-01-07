// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'coordinator' | 'supervisor' | 'admin';
}

export interface Student extends User {
  matricNo: string;
  program: string;
  creditsEarned: number;
  cgpa: number;
  isEligible: boolean;
}

export interface Coordinator extends User {
  department: string;
}

// Application Types
export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'SLI_03_ISSUED'
  | 'REPORTED'
  | 'COMPLETED'
  | 'OFFER_REJECTED'
  | 'REJECTED';

export interface Application {
  id: string;
  studentId: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  totalSteps: number;
  company: string;
  startDate?: string;
  endDate?: string;
  agreedBeyond14Weeks: boolean;
  hasChangesRequested: boolean;
  changesComments: string;
  isOfferRejected: boolean;
  sli03Issued: boolean;
  bli04Submitted: boolean;
  documents?: Document[];
  reviews?: Review[];
}

// Company Information
export interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  supervisorName: string;
  supervisorPosition: string;
  supervisorEmail: string;
  supervisorPhone: string;
}

// BLI-01 Form Data
export interface BLI01FormData {
  // Student Information
  studentName: string;
  matricNo: string;
  icNo: string;
  program: string;
  faculty: string;
  semester: string;
  cgpa: string;
  creditsEarned: number;
  phoneNo: string;
  email: string;
  address: string;

  // Academic Information
  academicYear: string;
  expectedGraduation: string;
  internshipDuration: string;
  internshipStartDate: string;
  internshipEndDate: string;

  // Company Information
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  supervisorName: string;
  supervisorPosition: string;
  supervisorEmail: string;
  supervisorPhone: string;

  // Declarations
  declaration1: boolean;
  declaration2: boolean;
  declaration3: boolean;
  declaration4: boolean;
  declaration5: boolean;
  signature: string;
  dateSigned: string;
}

// SLI-04 Form Data
export interface SLI04FormData {
  // Application Selection
  applicationId: string;

  // Rejection Details
  rejectionReason: "company_cancelled" | "position_no_longer_available" | "student_declined" | "other";
  otherReason?: string;

  // Re-application Intent
  intendsToReapply: boolean;
  reapplyCompany?: string;
  reapplyTimeline?: "immediate" | "next_semester" | "next_academic_year" | "not_sure";

  // Additional Information
  comments?: string;

  // Declarations
  declaration1: boolean;
  declaration2: boolean;
  studentSignature: string;
  dateSigned: string;
}

// Document Types
export type DocumentType = 'SLI_01' | 'BLI_02' | 'OFFER_LETTER' | 'BLI_03' | 'SLI_03' | 'DLI_01' | 'BLI_04';

export interface Document {
  id: string;
  type: DocumentType;
  name: string;
  status: 'UPLOADED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  url?: string;
}

// Session Configuration
export interface Session {
  id: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  minCredits: number;
  minCGPA: number;
}

// Eligibility Record
export interface EligibilityRecord {
  studentId: string;
  sessionId: string;
  isEligible: boolean;
  creditsEarned: number;
  cgpa: number;
  checkedAt: string;
}

// Review Types
export interface Review {
  id: string;
  applicationId: string;
  reviewerId: string;
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
  comments: string;
  reviewedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'APPLICATION_STATUS' | 'DOCUMENT_REQUEST' | 'DEADLINE_REMINDER';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  underReview: number;
  approved: number;
  sli03Issued: number;
  completed: number;
  overdue: number;
}

// Form Validation Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}
