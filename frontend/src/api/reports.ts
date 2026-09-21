import { apiClient } from './client';
import { ReportItem } from '../types';
import { downloadFile, generatePdfDossier } from '../services/forensicsEngine';
import { analysisApi } from './analysis';

const getStoredReports = (): ReportItem[] => {
  const raw = localStorage.getItem('verifyx_reports_list');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  const initial: ReportItem[] = [
    {
      id: 'rep-001',
      title: 'US_Passport_BioPage_Scan.pdf',
      documentName: 'US_Passport_BioPage_Scan.jpg',
      analysisDate: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      riskCategory: 'HIGH',
      riskScore: 78,
      reportType: 'Full Forensic Dossier',
      format: 'PDF',
      fileSize: '1.4 MB',
    },
    {
      id: 'rep-002',
      title: 'State_Driver_License_Telemetry.json',
      documentName: 'State_Driver_License_Front.png',
      analysisDate: new Date(Date.now() - 3600000 * 24).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      riskCategory: 'MEDIUM',
      riskScore: 49,
      reportType: 'Executive Risk Summary',
      format: 'JSON',
      fileSize: '420 KB',
    },
    {
      id: 'rep-003',
      title: 'Audit_Case_Log_Q2_2026.csv',
      documentName: 'All_Verified_Documents',
      analysisDate: new Date(Date.now() - 3600000 * 72).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      riskCategory: 'LOW',
      riskScore: 18,
      reportType: 'Compliance Audit',
      format: 'CSV',
      fileSize: '88 KB',
    },
  ];
  localStorage.setItem('verifyx_reports_list', JSON.stringify(initial));
  return initial;
};

export const reportsApi = {
  getReportsList: async (): Promise<{ reports: ReportItem[]; total: number }> => {
    try {
      const res = await apiClient<{ reports: ReportItem[]; total: number }>('/reports', {
        method: 'GET',
      });
      if (res?.reports) return res;
    } catch {
      // client-side fallback
    }

    const reports = getStoredReports();
    return {
      reports,
      total: reports.length,
    };
  },

  getReports: async (): Promise<ReportItem[]> => {
    const res = await reportsApi.getReportsList();
    return res.reports || [];
  },

  getReport: async (reportId: string): Promise<ReportItem> => {
    try {
      return await apiClient<ReportItem>(`/reports/${reportId}`, {
        method: 'GET',
      });
    } catch {
      const reports = getStoredReports();
      return (
        reports.find((r) => r.id === reportId) || {
          id: reportId,
          documentName: 'Document_Dossier.pdf',
          title: 'Document_Dossier.pdf',
          analysisDate: new Date().toISOString(),
          riskCategory: 'HIGH',
          riskScore: 78,
          reportType: 'Full Forensic Dossier',
          format: 'PDF',
          fileSize: '1.2 MB',
        }
      );
    }
  },

  generateReport: async (
    optionsOrAnalysisId:
      | string
      | {
          format?: string;
          includeHeatmaps?: boolean;
          includeOcr?: boolean;
          includeAuditSignature?: boolean;
        },
    type?: 'Full Forensic Dossier' | 'Executive Risk Summary' | 'Compliance Audit'
  ): Promise<{ reportId: string; downloadUrl?: string }> => {
    try {
      const payload =
        typeof optionsOrAnalysisId === 'string'
          ? { analysisId: optionsOrAnalysisId, type: type || 'Full Forensic Dossier' }
          : optionsOrAnalysisId;

      const res = await apiClient<{ reportId: string; downloadUrl?: string }>('/reports/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res?.reportId) return res;
    } catch {
      // client-side fallback
    }

    const newId = `rep-${Date.now()}`;
    const format =
      typeof optionsOrAnalysisId === 'object' && optionsOrAnalysisId.format
        ? optionsOrAnalysisId.format.toUpperCase()
        : 'PDF';

    const newReport: ReportItem = {
      id: newId,
      title: `Forensic_Dossier_${Date.now()}.${format.toLowerCase()}`,
      documentName: 'Inspected_Document.pdf',
      analysisDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      riskCategory: 'HIGH',
      riskScore: 78,
      reportType: type || 'Full Forensic Dossier',
      format: format as any,
      fileSize: '1.5 MB',
    };

    const current = getStoredReports();
    localStorage.setItem('verifyx_reports_list', JSON.stringify([newReport, ...current]));

    return {
      reportId: newId,
      downloadUrl: `#download-${newId}`,
    };
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    try {
      const res = await fetch(`/api/reports/${reportId}/download`);
      if (res.ok) return res.blob();
    } catch {
      // fallback
    }

    const reports = getStoredReports();
    const rep = reports.find((r) => r.id === reportId);
    const format = (rep?.format || 'PDF').toLowerCase();

    if (format === 'json') {
      const analysis = await analysisApi.getAnalysisResult('sample-1');
      downloadFile(JSON.stringify(analysis, null, 2), rep?.title || 'Report.json', 'application/json');
      return new Blob([JSON.stringify(analysis)], { type: 'application/json' });
    } else if (format === 'csv') {
      const csvData = 'Case ID,Document,Risk Score,Category,Timestamp\nVX-101,Passport_BioPage_Scan.jpg,78,HIGH,2026-09-21\n';
      downloadFile(csvData, rep?.title || 'Report.csv', 'text/csv');
      return new Blob([csvData], { type: 'text/csv' });
    } else {
      const analysis = await analysisApi.getAnalysisResult('sample-1');
      generatePdfDossier(analysis);
      return new Blob(['PDF Document'], { type: 'application/pdf' });
    }
  },

  generatePdfReport: async (analysisId: string): Promise<Blob> => {
    const analysis = await analysisApi.getAnalysisResult(analysisId);
    generatePdfDossier(analysis);
    return new Blob(['PDF Document'], { type: 'application/pdf' });
  },
};

