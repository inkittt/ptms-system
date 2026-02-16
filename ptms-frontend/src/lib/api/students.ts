import axios from 'axios';
import { api } from '../api';

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_BASE_URL = RAW_API_BASE_URL.endsWith('/')
  ? RAW_API_BASE_URL.slice(0, -1)
  : RAW_API_BASE_URL;
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

export interface StudentDashboardData {
  student: {
    name: string;
    matricNo: string;
    program: string;
    creditsEarned: number;
    isEligible: boolean;
  };
  session: {
    id: string;
    name: string;
    year: number;
    semester: number;
    minCredits: number;
    isActive: boolean;
    creditsEarned: number;
    isEligible: boolean;
    status: string;
  } | null;
  application: {
    id: string;
    status: string;
    companyName?: string;
    createdAt: string;
    updatedAt: string;
    documents: Array<{
      id: string;
      type: string;
      status: string;
      createdAt: string;
    }>;
  } | null;
}

export interface CoordinatorStudent {
  id: string;
  name: string;
  matricNo: string;
  program: string;
  creditsEarned: number;
  cgpa: number;
  isEligible: boolean;
  email: string;
  phone: string;
  sessionId: string;
  sessionYear: string;
  sessionSemester: string;
  currentApplication: {
    status: string;
    company: string;
  } | null;
  totalApplications: number;
  completedInternships: number;
}

export interface DocumentSubmission {
  id: string;
  type: string;
  status: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formTypeEnum: string;
  payloadJSON: any;
  submittedAt: string;
  verifiedBy: string | null;
}

export interface Review {
  id: string;
  decision: string;
  comments: string | null;
  decidedAt: string;
  reviewer: {
    name: string;
    email: string;
  } | null;
}

export interface StudentApplication {
  id: string;
  status: string;
  organizationName: string;
  organizationAddress: string;
  organizationEmail: string;
  organizationPhone: string;
  contactPersonName: string;
  contactPersonPhone: string;
  startDate: string | null;
  endDate: string | null;
  roleTasksSummary: string;
  company: {
    id: string;
    name: string;
    address: string;
    industry: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  } | null;
  session: {
    id: string;
    name: string;
    year: number;
    semester: number;
  };
  documents: DocumentSubmission[];
  formResponses: FormResponse[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentDetails {
  student: {
    id: string;
    name: string;
    email: string;
    matricNo: string;
    program: string;
    phone: string;
    creditsEarned: number;
    cgpa: number;
    isEligible: boolean;
    sessionInfo: {
      id: string;
      name: string;
      year: number;
      semester: number;
      minCredits: number;
      isActive: boolean;
      creditsEarned: number;
      status: string;
    } | null;
  };
  applications: StudentApplication[];
  totalApplications: number;
  completedInternships: number;
}

export const studentsApi = {
  async getDashboardData(token: string): Promise<StudentDashboardData> {
    const response = await axios.get(`${API_URL}/students/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getCoordinatorStudents(
    token: string,
    filters?: {
      sessionId?: string;
      program?: string;
      eligibility?: string;
    }
  ): Promise<{ students: CoordinatorStudent[] }> {
    const params = new URLSearchParams();
    if (filters?.sessionId) params.append('sessionId', filters.sessionId);
    if (filters?.program) params.append('program', filters.program);
    if (filters?.eligibility) params.append('eligibility', filters.eligibility);

    const response = await axios.get(`${API_URL}/students/coordinator/students?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getPrograms(token: string): Promise<{ programs: string[] }> {
    const response = await axios.get(`${API_URL}/students/programs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getStudentDetails(token: string, studentId: string): Promise<StudentDetails> {
    const response = await axios.get(`${API_URL}/students/coordinator/students/${studentId}?id=${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async downloadAllStudentDocuments(token: string, studentId: string): Promise<Blob> {
    const response = await axios.get(`${API_URL}/applications/students/${studentId}/documents/download-all`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    return response.data;
  },
};

export const applicationsApi = {
  getMyApplications: async (): Promise<{ applications: any[] }> => {
    return api.get<{ applications: any[] }>('/applications');
  },

  getApplicationById: async (id: string): Promise<{ application: any }> => {
    return api.get<{ application: any }>(`/applications/${id}`);
  },

  createApplication: async (data: any): Promise<{ message: string; application: any }> => {
    return api.post<{ message: string; application: any }>('/applications', data);
  },
};
