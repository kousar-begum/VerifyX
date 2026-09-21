import { apiClient } from './client';

export interface VerificationResult {
  hash: string;
  matchedRecordId?: string;
  timestamp: string;
  isRegistered: boolean;
  tamperFlags: string[];
}

export const verificationApi = {
  verifyDocumentHash: async (sha256Hash: string): Promise<VerificationResult> => {
    return apiClient<VerificationResult>('/verification/verify-hash', {
      method: 'POST',
      body: JSON.stringify({ hash: sha256Hash }),
    });
  },

  getAuditLog: async (): Promise<{ auditEvents: any[] }> => {
    return apiClient<{ auditEvents: any[] }>('/verification/audit-log', {
      method: 'GET',
    });
  },
};
