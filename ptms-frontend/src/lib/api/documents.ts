import { api } from '../api';

export interface UploadDocumentResponse {
  message: string;
  document: {
    id: string;
    type: string;
    fileUrl: string;
    status: string;
    createdAt: string;
    application: {
      id: string;
      user: {
        name: string;
        email: string;
        matricNo: string;
        program: string;
      };
      session: {
        id: string;
        name: string;
        year: number;
        semester: number;
      };
    };
  };
}

export interface DocumentReview {
  decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';
  comments?: string;
}

export interface PendingDocument {
  id: string;
  type: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  application: {
    id: string;
    user: {
      name: string;
      email: string;
      matricNo: string;
      program: string;
    };
    session: {
      id: string;
      name: string;
      year: number;
      semester: number;
    };
    company?: {
      id: string;
      name: string;
    };
  };
}

export const documentsApi = {
  uploadDocument: async (
    applicationId: string,
    file: File,
    documentType: string
  ): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', applicationId);
    formData.append('documentType', documentType);

    return api.uploadFile<UploadDocumentResponse>(
      `/applications/${applicationId}/documents/upload`,
      formData
    );
  },

  getPendingDocuments: async (filters?: {
    sessionId?: string;
    status?: string;
    program?: string;
  }): Promise<{ documents: PendingDocument[] }> => {
    const params = new URLSearchParams();
    if (filters?.sessionId) params.append('sessionId', filters.sessionId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.program) params.append('program', filters.program);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/applications/documents/pending-review?${queryString}`
      : '/applications/documents/pending-review';

    return api.get<{ documents: PendingDocument[] }>(endpoint);
  },

  getDocument: async (documentId: string): Promise<{ document: PendingDocument }> => {
    return api.get<{ document: PendingDocument }>(
      `/applications/documents/${documentId}`
    );
  },

  reviewDocument: async (
    documentId: string,
    review: DocumentReview
  ): Promise<{ message: string; review: any }> => {
    return api.patch<{ message: string; review: any }>(
      `/applications/documents/${documentId}/review`,
      review
    );
  },
};
