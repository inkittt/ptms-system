import { authService } from "../auth";

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_BASE_URL = RAW_API_BASE_URL.endsWith('/')
  ? RAW_API_BASE_URL.slice(0, -1)
  : RAW_API_BASE_URL;
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

export const reportsApi = {
  async getOverviewStats(sessionId?: string, program?: string) {
    const token = authService.getAccessToken();
    if (!token) throw new Error("No authentication token");

    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);
    if (program && program !== "all") params.append("program", program);

    const response = await fetch(
      `${API_URL}/reports/overview?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch overview stats: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  async getApplicationTrends(sessionId?: string, months: number = 6) {
    const token = authService.getAccessToken();
    if (!token) throw new Error("No authentication token");

    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);
    params.append("months", months.toString());

    const response = await fetch(
      `${API_URL}/reports/application-trends?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch application trends");
    }

    return response.json();
  },

  async getStatusDistribution(sessionId?: string, program?: string) {
    const token = authService.getAccessToken();
    if (!token) throw new Error("No authentication token");

    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);
    if (program && program !== "all") params.append("program", program);

    const response = await fetch(
      `${API_URL}/reports/status-distribution?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch status distribution");
    }

    return response.json();
  },

  async getProgramDistribution(sessionId?: string) {
    const token = authService.getAccessToken();
    if (!token) throw new Error("No authentication token");

    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);

    const response = await fetch(
      `${API_URL}/reports/program-distribution?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch program distribution");
    }

    return response.json();
  },

  async getTopCompanies(sessionId?: string, limit: number = 5) {
    const token = authService.getAccessToken();
    if (!token) throw new Error("No authentication token");

    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);
    params.append("limit", limit.toString());

    const response = await fetch(
      `${API_URL}/reports/top-companies?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch top companies");
    }

    return response.json();
  },

  async getIndustryDistribution(sessionId?: string) {
    const token = authService.getAccessToken();
    if (!token) throw new Error("No authentication token");

    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);

    const response = await fetch(
      `${API_URL}/reports/industry-distribution?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch industry distribution");
    }

    return response.json();
  },

  async getDocumentStats(sessionId?: string) {
    const token = authService.getAccessToken();
    if (!token) throw new Error("No authentication token");

    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);

    const response = await fetch(
      `${API_URL}/reports/document-stats?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch document stats");
    }

    return response.json();
  },

  async getReviewPerformance(sessionId?: string, weeks: number = 4) {
    const token = authService.getAccessToken();
    if (!token) throw new Error("No authentication token");

    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);
    params.append("weeks", weeks.toString());

    const response = await fetch(
      `${API_URL}/reports/review-performance?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch review performance");
    }

    return response.json();
  },

  async getStudentProgress(sessionId?: string) {
    const token = authService.getAccessToken();
    if (!token) throw new Error("No authentication token");

    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);

    const response = await fetch(
      `${API_URL}/reports/student-progress?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch student progress");
    }

    return response.json();
  },
};
