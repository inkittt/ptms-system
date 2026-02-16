import axios from 'axios';

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_BASE_URL = RAW_API_BASE_URL.endsWith('/')
  ? RAW_API_BASE_URL.slice(0, -1)
  : RAW_API_BASE_URL;
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

export interface Session {
  id: string;
  name: string;
  year: number;
  semester: number;
  trainingStartDate?: string;
  trainingEndDate?: string;
  deadlinesJSON: {
    applicationDeadline?: string;
    bli03Deadline?: string;
    reportingDeadline?: string;
  };
  minCredits: number;
  minWeeks: number;
  maxWeeks: number;
  isActive: boolean;
  coordinator?: {
    id: string;
    name: string;
    email: string;
  };
  coordinatorSignature?: string;
  coordinatorSignatureType?: string;
  coordinatorSignedAt?: string;
  createdAt: string;
  updatedAt: string;
  totalApplications?: number;
  totalStudents?: number;
}

export interface StudentSession {
  id: string;
  sessionId: string;
  userId: string;
  creditsEarned: number;
  isEligible: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  session: Session;
}

export interface CreateSessionDto {
  name: string;
  year: number;
  semester: number;
  trainingStartDate?: string;
  trainingEndDate?: string;
  deadlinesJSON?: {
    applicationDeadline?: string;
    bli03Deadline?: string;
    reportingDeadline?: string;
  };
  minCredits?: number;
  minWeeks: number;
  maxWeeks: number;
  isActive?: boolean;
  coordinatorSignature?: string;
  coordinatorSignatureType?: string;
}

export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

export const sessionsApi = {
  async getAll(token: string): Promise<Session[]> {
    const response = await axios.get(`${API_URL}/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getOne(id: string, token: string): Promise<Session> {
    const response = await axios.get(`${API_URL}/sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async create(data: CreateSessionDto, token: string): Promise<Session> {
    const response = await axios.post(`${API_URL}/sessions`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async update(id: string, data: Partial<CreateSessionDto>, token: string): Promise<Session> {
    const response = await axios.patch(`${API_URL}/sessions/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async delete(id: string, token: string): Promise<void> {
    await axios.delete(`${API_URL}/sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async importStudents(sessionId: string, file: File, token: string): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${API_URL}/sessions/${sessionId}/import-students`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async getSessionStudents(sessionId: string, token: string) {
    const response = await axios.get(`${API_URL}/sessions/${sessionId}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async removeStudentFromSession(sessionId: string, userId: string, token: string): Promise<void> {
    await axios.delete(`${API_URL}/sessions/${sessionId}/students/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getMySession(token: string): Promise<StudentSession | null> {
    try {
      const response = await axios.get(`${API_URL}/sessions/my-session`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getMySessions(token: string): Promise<StudentSession[]> {
    const response = await axios.get(`${API_URL}/sessions/my-sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
