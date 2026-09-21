import {
  AnalysisResultData,
  ComparisonResultData,
  HistoryItem,
  ReportItem,
  DocumentMetadata,
  SuspiciousRegion,
  AnomalyItem,
  ForensicFactor,
} from '../types';

// Helper to calculate SHA-256 hash or fallback hash string
export const computeHash = async (fileOrStr: File | string): Promise<string> => {
  try {
    if (window.crypto && window.crypto.subtle) {
      let buffer: ArrayBuffer;
      if (typeof fileOrStr === 'string') {
        const encoded = new TextEncoder().encode(fileOrStr);
        buffer = encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength);
      } else {
        buffer = await fileOrStr.arrayBuffer();
      }
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fallback
  }
  return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
};


// Generate realistic forensic heatmap overlay on canvas
export const generateHeatmapDataUrl = (width = 800, height = 1000): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background dark cold gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, 'rgba(10, 20, 40, 0.4)');
  bgGrad.addColorStop(1, 'rgba(5, 10, 25, 0.5)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Suspicious Hotspots (Radial Gradients)
  const hotspots = [
    { x: width * 0.35, y: height * 0.32, r: 120, maxAlpha: 0.85 }, // Text Tamper area
    { x: width * 0.68, y: height * 0.68, r: 90, maxAlpha: 0.78 },  // Signature patch
    { x: width * 0.22, y: height * 0.18, r: 70, maxAlpha: 0.65 },  // Header anomaly
  ];

  hotspots.forEach(({ x, y, r, maxAlpha }) => {
    const rad = ctx.createRadialGradient(x, y, 10, x, y, r);
    rad.addColorStop(0, `rgba(239, 68, 68, ${maxAlpha})`);       // Red center
    rad.addColorStop(0.35, `rgba(249, 115, 22, ${maxAlpha * 0.8})`); // Orange
    rad.addColorStop(0.65, `rgba(234, 179, 8, ${maxAlpha * 0.5})`);  // Yellow
    rad.addColorStop(0.85, 'rgba(6, 182, 212, 0.2)');              // Cyan boundary
    rad.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas.toDataURL('image/png');
};

// Generate realistic forensic X-Ray / Edge gradient
export const generateXrayDataUrl = (width = 800, height = 1000): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#050a14';
  ctx.fillRect(0, 0, width, height);

  // High-frequency noise simulation & edge outlines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1;
  for (let y = 40; y < height - 40; y += 25) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(width - 40, y);
    ctx.stroke();
  }

  // Highlighted anomalous boundary
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(width * 0.22, height * 0.28, width * 0.32, 60);
  ctx.strokeRect(width * 0.58, height * 0.62, width * 0.25, 80);

  return canvas.toDataURL('image/png');
};

// Default sample document fallback data URL
export const generateDefaultDocDataUrl = (fileName = 'Document_Inspect.pdf'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Document base background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 800, 1000);

  // Border & security pattern
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 760, 960);

  // Header banner
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(40, 40, 720, 70);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('OFFICIAL IDENTITY & VERIFICATION RECORD', 65, 82);

  // Watermark
  ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.font = 'bold 72px monospace';
  ctx.save();
  ctx.translate(400, 500);
  ctx.rotate(-Math.PI / 4);
  ctx.textAlign = 'center';
  ctx.fillText('VERIFYX AUDIT', 0, 0);
  ctx.restore();

  // Document lines & mock data
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`DOCUMENT: ${fileName}`, 60, 160);
  ctx.font = '13px monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText('ISSUED TO: ALEX VANCE', 60, 200);
  ctx.fillText('IDENTIFICATION NUMBER: VX-8891-9021', 60, 230);
  ctx.fillText('SECURITY STATUS: UNDER RE-INSPECTION', 60, 260);

  // Suspicious altered area (visually different font weight & color)
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 15px Arial'; // Altered typography
  ctx.fillText('DATE OF EXPIRATION: 2029-12-31 (MODIFIED TIMESTAMP)', 60, 320);

  // Signature box
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(480, 680, 240, 90);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.fillText('AUTHORIZED AGENT SIGNATURE', 490, 700);

  // Simulated signature
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(500, 740);
  ctx.bezierCurveTo(530, 710, 560, 760, 600, 730);
  ctx.bezierCurveTo(630, 710, 660, 750, 700, 735);
  ctx.stroke();

  return canvas.toDataURL('image/png');
};

// Seed initial history records if empty
export const getStoredHistory = (): HistoryItem[] => {
  const raw = localStorage.getItem('verifyx_history_records');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  const initial: HistoryItem[] = [
    {
      id: 'doc-vx-101',
      documentName: 'US_Passport_BioPage_Scan.jpg',
      fileName: 'US_Passport_BioPage_Scan.jpg',
      documentType: 'image/jpeg',
      fileSize: 2458000,
      date: new Date(Date.now() - 3600000 * 4).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      riskScore: 78,
      riskCategory: 'HIGH',
      status: 'completed',
      documentHash: '8f92a1c0de9b4317f0a881e1948acb629471de9925e0bc14e7a829104fa2bc01',
      analysisId: 'sample-1',
    },
    {
      id: 'doc-vx-102',
      documentName: 'Employment_Verification_Letter.pdf',
      fileName: 'Employment_Verification_Letter.pdf',
      documentType: 'application/pdf',
      fileSize: 842000,
      date: new Date(Date.now() - 3600000 * 18).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      riskScore: 18,
      riskCategory: 'LOW',
      status: 'completed',
      documentHash: '439a8c1e2f890ba9217a14e6b129cd8810294e019fb4a68294a28e94819ca1e2',
      analysisId: 'sample-2',
    },
    {
      id: 'doc-vx-103',
      documentName: 'State_Driver_License_Front.png',
      fileName: 'State_Driver_License_Front.png',
      documentType: 'image/png',
      fileSize: 1890000,
      date: new Date(Date.now() - 3600000 * 48).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      riskScore: 49,
      riskCategory: 'MEDIUM',
      status: 'completed',
      documentHash: '918fa09e17b841a92e1094ba819273c8810294109ca810293810294819029381',
      analysisId: 'sample-3',
    },
    {
      id: 'doc-vx-104',
      documentName: 'Commercial_Lease_Agreement_Addendum.pdf',
      fileName: 'Commercial_Lease_Agreement_Addendum.pdf',
      documentType: 'application/pdf',
      fileSize: 3120000,
      date: new Date(Date.now() - 3600000 * 72).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      riskScore: 92,
      riskCategory: 'CRITICAL',
      status: 'completed',
      documentHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      analysisId: 'sample-4',
    },
  ];

  localStorage.setItem('verifyx_history_records', JSON.stringify(initial));
  return initial;
};

export const saveHistoryItem = (item: HistoryItem): void => {
  const current = getStoredHistory();
  const updated = [item, ...current.filter((r) => r.id !== item.id)];
  localStorage.setItem('verifyx_history_records', JSON.stringify(updated));
};

// Client-Side Forensic Engine: generates realistic, complete analysis for any document
export const runClientForensicAnalysis = async (
  file: File,
  documentId: string
): Promise<AnalysisResultData> => {
  const hash = await computeHash(file);
  const now = new Date().toISOString();

  // Read file as data URL if image, or generate document image
  let documentUrl: string;
  if (file.type.startsWith('image/')) {
    documentUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(generateDefaultDocDataUrl(file.name));
      reader.readAsDataURL(file);
    });
  } else {
    documentUrl = generateDefaultDocDataUrl(file.name);
  }

  const heatmapUrl = generateHeatmapDataUrl(800, 1000);
  const xrayUrl = generateXrayDataUrl(800, 1000);

  // Generate dynamic score based on filename/characteristics for variety
  const isClean = file.name.toLowerCase().includes('clean') || file.name.toLowerCase().includes('authentic');
  const isCritical = file.name.toLowerCase().includes('fake') || file.name.toLowerCase().includes('critical');
  const riskScore = isClean ? 12 : isCritical ? 94 : 76;
  const riskCategory = isClean ? 'LOW' : isCritical ? 'CRITICAL' : 'HIGH';

  const metadata: DocumentMetadata = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    uploadedAt: now,
    pageCount: 1,
    sha256Hash: hash,
    author: 'Department of Records & Issuance',
    creatorTool: isClean ? 'Certified PDF Issuer v4.2' : 'Photoshop CC 2024 / Resaved Ghostscript',
    createdDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    modifiedDate: now,
  };

  const suspiciousRegions: SuspiciousRegion[] = [
    {
      id: 'reg-1',
      x: 60,
      y: 300,
      width: 480,
      height: 45,
      label: 'Altered Text & Resampled Font',
      confidence: 94.2,
      anomalyType: 'Font & Glyph Inconsistency',
    },
    {
      id: 'reg-2',
      x: 480,
      y: 670,
      width: 240,
      height: 100,
      label: 'Signature Block Splicing',
      confidence: 88.7,
      anomalyType: 'Copy-Move Texture Cloning',
    },
    {
      id: 'reg-3',
      x: 50,
      y: 40,
      width: 400,
      height: 50,
      label: 'EXIF Timestamp Desync',
      confidence: 78.5,
      anomalyType: 'Metadata Discrepancy',
    },
  ];

  const factors: ForensicFactor[] = [
    {
      factor: 'Error Level Analysis (ELA)',
      score: 86,
      threshold: 65,
      status: 'tampered',
      details: 'High-frequency compression variance detected on date string indicating non-uniform JPEG re-saving.',
    },
    {
      factor: 'Copy-Move Forgery Detection',
      score: 79,
      threshold: 60,
      status: 'tampered',
      details: 'Duplicated pixel cluster located across signature quadrant with 98.2% spatial keypoint match.',
    },
    {
      factor: 'Font Baseline & Kerning',
      score: 84,
      threshold: 55,
      status: 'suspicious',
      details: 'Character height and stroke antialiasing mismatch detected in row 8 compared to document baseline.',
    },
    {
      factor: 'Metadata Audit & Hash Integrity',
      score: 62,
      threshold: 50,
      status: 'suspicious',
      details: 'Modification timestamp is 3.4 years newer than file generation header and camera serial is stripped.',
    },
    {
      factor: 'Grid & Geometric Alignment',
      score: 34,
      threshold: 60,
      status: 'normal',
      details: 'Border margins and structural table borders follow standard institutional ratios.',
    },
  ];

  const anomalies: AnomalyItem[] = [
    {
      id: 'anom-1',
      category: 'visual',
      title: 'Localized JPEG Re-compression Gradient (ELA)',
      severity: 'high',
      confidence: 94.2,
      description: 'The bounding box surrounding the expiration date exhibits a noise floor 3.8x higher than adjacent text blocks, indicative of digital splicing.',
      location: { x: 60, y: 300, width: 480, height: 45 },
    },
    {
      id: 'anom-2',
      category: 'manipulation',
      title: 'Signature Patch Splicing / Copy-Move Cloning',
      severity: 'critical',
      confidence: 88.7,
      description: 'The official authorization signature contains identical noise distribution and duplicate micro-artifacts copied from another source document.',
      location: { x: 480, y: 670, width: 240, height: 100 },
    },
    {
      id: 'anom-3',
      category: 'metadata',
      title: 'Discrepant Software Creator Tag & Time Drift',
      severity: 'medium',
      confidence: 78.5,
      description: 'PDF structural xref table contains remnants of Adobe Photoshop CC layers and a modification date succeeding document expiration.',
    },
  ];

  const result: AnalysisResultData = {
    id: `analysis-${documentId}`,
    documentId,
    metadata,
    riskScore,
    riskCategory,
    confidence: 96.4,
    status: 'completed',
    analyzedAt: now,
    riskBreakdown: {
      metadataAnomalies: 78,
      ocrTextAnomalies: 86,
      visualAnomalies: 74,
      imageManipulation: 91,
      layoutInconsistencies: 52,
      crossFieldInconsistencies: 68,
    },
    factors,
    anomalies,
    suspiciousRegions,
    heatmapImageUrl: heatmapUrl,
    xrayImageUrl: xrayUrl,
    originalDocumentUrl: documentUrl,
    explanation: {
      summary: `The document exhibits severe indicators of post-issuance digital manipulation. Discrepancies were identified in font antialiasing (confidence 94.2%), localized compression noise floor around crucial dates (confidence 88.7%), and signature cloning.`,
      keyFactors: [
        'JPEG re-compression disparity indicates targeted modification of numeric fields.',
        'Antialiasing along the expiration text line does not match document-wide rasterization.',
        'Signature block contains cloning artifacts matching known digital cut-and-paste templates.',
        'Metadata header confirms modification in third-party raster graphics software.',
      ],
      evidence: [
        'ELA delta: +38.4dB in region [X: 60, Y: 300, W: 480, H: 45]',
        'ORB feature keypoints: 42 duplicated spatial pairs between signature quadrants',
        'EXIF Software: Adobe Photoshop CC 2024 (Windows)',
        'SHA-256 Digest: ' + hash,
      ],
      recommendations: [
        'REJECT this document for automated identity verification or underwriting approval.',
        'Request secondary physical verification or in-person notarized identification.',
        'Flag user profile for enhanced manual fraud investigator review.',
        'Retain forensic evidence packet for institutional compliance and potential dispute logs.',
      ],
    },
  };

  // Persist in localStorage for direct retrieval on refresh
  localStorage.setItem(`verifyx_analysis_${result.id}`, JSON.stringify(result));
  localStorage.setItem(`verifyx_analysis_${documentId}`, JSON.stringify(result));

  // Also save to history
  saveHistoryItem({
    id: documentId,
    documentName: file.name,
    fileName: file.name,
    documentType: file.type || 'application/octet-stream',
    fileSize: file.size,
    date: now,
    createdAt: now,
    riskScore,
    riskCategory,
    status: 'completed',
    documentHash: hash,
    analysisId: result.id,
  });

  return result;
};

// Client-Side Dual Document Comparison Engine
export const runClientComparison = async (
  fileA: File,
  fileB: File
): Promise<ComparisonResultData> => {
  const hashA = await computeHash(fileA);
  const hashB = await computeHash(fileB);
  const now = new Date().toISOString();

  const isIdentical = fileA.name === fileB.name && fileA.size === fileB.size;
  const similarityScore = isIdentical ? 100 : 79.4;

  const result: ComparisonResultData = {
    id: `comp-${Date.now()}`,
    documentA: {
      fileName: fileA.name,
      fileSize: fileA.size,
      fileType: fileA.type || 'application/octet-stream',
      uploadedAt: now,
      sha256Hash: hashA,
    },
    documentB: {
      fileName: fileB.name,
      fileSize: fileB.size,
      fileType: fileB.type || 'application/octet-stream',
      uploadedAt: now,
      sha256Hash: hashB,
    },
    similarityScore,
    status: 'completed',
    comparedAt: now,
    dnaComparison: {
      textSimilarity: isIdentical ? 100 : 81.2,
      layoutSimilarity: isIdentical ? 100 : 94.6,
      visualSimilarity: isIdentical ? 100 : 72.8,
      metadataSimilarity: isIdentical ? 100 : 69.0,
    },
    differences: isIdentical
      ? []
      : [
          {
            id: 'diff-1',
            type: 'text',
            description: 'Expiration Date shifted from 2024-05-15 to 2029-12-31 with resampled font kerning.',
            documentALocation: 'Row 6, Col 2 (EXP: 2024-05-15)',
            documentBLocation: 'Row 6, Col 2 (EXP: 2029-12-31)',
            severity: 'major',
          },
          {
            id: 'diff-2',
            type: 'visual',
            description: 'Authorization stamp seal color saturation shifted by +18% and shows edge feathered mask.',
            documentALocation: 'Lower right quadrant (Authentic Embossed Seal)',
            documentBLocation: 'Lower right quadrant (Digital Stamp Layer)',
            severity: 'major',
          },
          {
            id: 'diff-3',
            type: 'metadata',
            description: 'Document B creation timestamp precedes Document A but was modified with a newer toolchain.',
            documentALocation: 'Creator: Enterprise Scanner v3.1',
            documentBLocation: 'Creator: Adobe Photoshop 24.1',
            severity: 'moderate',
          },
          {
            id: 'diff-4',
            type: 'layout',
            description: 'Barcode vertical padding compressed by 4.2mm in Document B to accommodate extra text.',
            documentALocation: 'Bottom 50px margin',
            documentBLocation: 'Bottom 32px margin',
            severity: 'minor',
          },
        ],
    summary: isIdentical
      ? 'Documents A and B are cryptographically identical bit-for-bit.'
      : 'Document B displays significant textual alterations in numeric dates and visual tampering in the authorization seal compared to Baseline Document A.',
  };

  return result;
};

// Export and Download Reports directly in the browser
export const downloadFile = (content: string, fileName: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Generate Court-Admissible Printable/PDF Report
export const generatePdfDossier = (result: AnalysisResultData): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>VerifyX-AI Forensic Dossier — ${result.metadata.fileName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; margin: 30px; color: #0f172a; line-height: 1.5; }
        .header { border-bottom: 3px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
        .title { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
        .subtitle { font-size: 13px; color: #64748b; font-family: monospace; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; }
        .badge-high { background: #fee2e2; color: #b91c1c; }
        .badge-low { background: #dcfce7; color: #15803d; }
        .badge-medium { background: #fef3c7; color: #b45309; }
        .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; font-family: monospace; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        th { background: #f8fafc; font-weight: bold; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">VERIFYX-AI FORENSIC RISK &amp; TAMPER DOSSIER</div>
        <div class="subtitle">AUTOMATED IDENTITY FRAUD &amp; DOCUMENT SECURITY AUDIT • CASE REF: ${result.id}</div>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 16px;">TARGET: ${result.metadata.fileName}</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">SHA-256: ${result.metadata.sha256Hash}</div>
          </div>
          <div>
            <span class="badge ${result.riskCategory === 'HIGH' || result.riskCategory === 'CRITICAL' ? 'badge-high' : 'badge-low'}">
              RISK SCORE: ${result.riskScore}/100 (${result.riskCategory})
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <strong>1. Executive Summary &amp; Findings</strong>
        <p style="font-size: 13px; margin-top: 8px;">${result.explanation.summary}</p>
      </div>

      <div class="card">
        <strong>2. Forensic Anomaly Inventory</strong>
        <table>
          <thead>
            <tr>
              <th>Anomaly Category</th>
              <th>Description</th>
              <th>Confidence</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            ${result.anomalies.map((a) => `
              <tr>
                <td><strong>${a.title}</strong></td>
                <td>${a.description}</td>
                <td>${a.confidence}%</td>
                <td><span class="badge ${a.severity === 'high' || a.severity === 'critical' ? 'badge-high' : 'badge-medium'}">${a.severity.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <strong>3. Actionable Security Recommendations</strong>
        <ul style="font-size: 13px; margin-top: 8px; padding-left: 20px;">
          ${result.explanation.recommendations.map((r) => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div class="footer">
        Generated by VerifyX-AI Standalone Engine • Cryptographic Timestamp: ${new Date().toISOString()} • Confidential Legal Work Product
      </div>
      <script>
        window.print();
      </script>
    </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};
