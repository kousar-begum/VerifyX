export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNCERTAIN';

export interface AnomalyItem {
  id: string;
  category: 'metadata' | 'ocr' | 'visual' | 'manipulation' | 'layout' | 'cross_field';
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
    page?: number;
  };
}

export interface ForensicFactor {
  factor: string;
  score: number; // 0 to 100
  threshold: number;
  status: 'normal' | 'suspicious' | 'tampered';
  details: string;
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt?: string;
  pageCount?: number;
  author?: string;
  creatorTool?: string;
  createdDate?: string;
  modifiedDate?: string;
  sha256Hash?: string;
  compressionType?: string;
}

export interface SuspiciousRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  anomalyType: string;
}

export interface AnalysisResultData {
  id: string;
  documentId: string;
  metadata: DocumentMetadata;
  riskScore: number; // 0-100
  riskCategory: RiskCategory;
  confidence: number; // 0-100
  status: 'completed' | 'processing' | 'failed' | 'pending';
  analyzedAt: string;
  riskBreakdown: {
    metadataAnomalies: number;
    ocrTextAnomalies: number;
    visualAnomalies: number;
    imageManipulation: number;
    layoutInconsistencies: number;
    crossFieldInconsistencies: number;
  };
  factors: ForensicFactor[];
  anomalies: AnomalyItem[];
  suspiciousRegions: SuspiciousRegion[];
  heatmapImageUrl?: string;
  xrayImageUrl?: string;
  originalDocumentUrl?: string;
  explanation: {
    summary: string;
    keyFactors: string[];
    evidence: string[];
    recommendations: string[];
  };
}

export interface ComparisonDifference {
  id: string;
  type: 'text' | 'visual' | 'layout' | 'metadata';
  description: string;
  documentALocation?: string;
  documentBLocation?: string;
  severity: 'minor' | 'moderate' | 'major';
}

export interface ComparisonResultData {
  id: string;
  documentA: DocumentMetadata;
  documentB: DocumentMetadata;
  similarityScore: number; // 0 to 100%
  status: 'completed' | 'processing' | 'failed';
  comparedAt: string;
  differences: ComparisonDifference[];
  dnaComparison: {
    textSimilarity: number;
    layoutSimilarity: number;
    visualSimilarity: number;
    metadataSimilarity: number;
  };
  summary: string;
}

export interface HistoryItem {
  id: string;
  documentName: string;
  fileName?: string;
  documentType: string;
  fileSize: number;
  date: string;
  createdAt?: string;
  riskScore: number;
  riskCategory: RiskCategory;
  status: 'completed' | 'failed' | 'processing';
  documentHash: string;
  analysisId?: string;
}

export type HistoryRecord = HistoryItem;

export interface ReportItem {
  id: string;
  documentName: string;
  title?: string;
  analysisDate: string;
  createdAt?: string;
  riskCategory: RiskCategory;
  riskScore: number;
  reportType: 'Full Forensic Dossier' | 'Executive Risk Summary' | 'Compliance Audit';
  format: 'PDF' | 'JSON' | 'CSV' | 'pdf' | 'json' | 'csv';
  fileSize?: string;
  downloadUrl?: string;
}

export interface UserProfile {
  id?: string;
  email: string;
  fullName: string;
  organization?: string;
  role?: string;
  accountStatus: 'active' | 'pending_verification' | 'restricted';
  tier?: string;
  createdAt?: string;
}

export type SupportedLanguage = 'en' | 'te' | 'hi' | 'kn' | 'ml';
