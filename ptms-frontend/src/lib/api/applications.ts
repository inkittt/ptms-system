import { api } from '../api';

export interface CreateApplicationDto {
  studentName: string;
  icNo: string;
  matricNo: string;
  trainingSession: string;
  cgpa: string;
  program: string;
  faculty: string;
}

export interface Application {
  id: string;
  userId: string;
  sessionId: string;
  companyId?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  session?: {
    id: string;
    name: string;
    year: number;
    semester: number;
  };
  company?: {
    id: string;
    name: string;
  };
  documents?: any[];
  formResponses?: any[];
  reviews?: Array<{
    id: string;
    applicationId: string;
    reviewerId: string;
    status: string;
    comments: string;
    reviewedAt: string;
  }>;
}

export interface Session {
  id: string;
  name: string;
  year: number;
  semester: number;
  minCredits: number;
  minWeeks: number;
  maxWeeks: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  matricNo: string;
  program: string;
  phone: string;
  creditsEarned: number;
  assignedSession?: {
    id: string;
    name: string;
    year: number;
    semester: number;
  } | null;
}

export const applicationsApi = {
  createApplication: async (data: CreateApplicationDto) => {
    return api.post<{ message: string; application: Application }>('/applications', data);
  },

  getMyApplications: async () => {
    return api.get<{ applications: Application[] }>('/applications');
  },

  getApplicationById: async (id: string) => {
    return api.get<{ application: Application }>(`/applications/${id}`);
  },

  getActiveSessions: async () => {
    return api.get<{ sessions: Session[] }>('/applications/sessions/active');
  },

  getUserProfile: async () => {
    return api.get<{ profile: UserProfile }>('/applications/profile');
  },

  downloadBLI01PDF: async (applicationId: string) => {
    const blob = await api.getBlob(`/applications/${applicationId}/bli01/pdf`);
    return blob;
  },
};
