import { SupportedLanguage } from '../types';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tagline: string;
  nav: {
    dashboard: string;
    analyze: string;
    compare: string;
    history: string;
    reports: string;
    profile: string;
    settings: string;
    logout: string;
    askVerifyX: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    back: string;
    search: string;
    filter: string;
    sort: string;
    view: string;
    download: string;
    export: string;
    status: string;
    date: string;
    actions: string;
    refresh: string;
    close: string;
    backendStatus: string;
    backendConnected: string;
    backendDisconnected: string;
    backendRequired: string;
  };
  dashboard: {
    welcome: string;
    welcomeSub: string;
    quickAnalyze: string;
    quickAnalyzeDesc: string;
    compareDocs: string;
    compareDocsDesc: string;
    riskOverview: string;
    analysisStats: string;
    recentAnalyses: string;
    securityStatus: string;
    systemHealth: string;
    noRecentAnalyses: string;
    noStatsAvailable: string;
    emptySubtitle: string;
  };
  analyze: {
    title: string;
    subtitle: string;
    uploadAreaTitle: string;
    uploadAreaDrag: string;
    uploadAreaBrowse: string;
    supportedFormats: string;
    maxSize: string;
    previewTitle: string;
    analyzingDocument: string;
    scanningLayers: string;
    startAnalysis: string;
    replaceFile: string;
    removeFile: string;
    readyToAnalyze: string;
    noFileSelected: string;
  };
  analysisResult: {
    title: string;
    overallRisk: string;
    riskCategory: string;
    confidence: string;
    riskBreakdown: string;
    suspiciousAreas: string;
    explainRisk: string;
    forensicSummary: string;
    recommendations: string;
    originalView: string;
    heatmapView: string;
    xrayView: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    fullScreen: string;
    toggleRegions: string;
    noAnalysisFound: string;
    backendAnalysisRequired: string;
    downloadReport: string;
  };
  compare: {
    title: string;
    subtitle: string;
    docA: string;
    docB: string;
    startComparison: string;
    comparingNotice: string;
    similarityScore: string;
    dnaComparison: string;
    differencesDetected: string;
    noComparisonFound: string;
  };
  history: {
    title: string;
    subtitle: string;
    noHistoryTitle: string;
    noHistoryDesc: string;
    tableHeaders: {
      document: string;
      date: string;
      riskScore: string;
      status: string;
      hash: string;
      action: string;
    };
  };
  reports: {
    title: string;
    subtitle: string;
    noReportsTitle: string;
    noReportsDesc: string;
    generateReport: string;
  };
  settings: {
    title: string;
    appearance: string;
    darkMode: string;
    lightMode: string;
    language: string;
    preferences: string;
    reducedMotion: string;
    notifications: string;
    backendConfig: string;
    apiUrl: string;
    apiStatus: string;
  };
  auth: {
    loginTitle: string;
    loginSub: string;
    signupTitle: string;
    signupSub: string;
    forgotPasswordTitle: string;
    forgotPasswordSub: string;
    resetPasswordTitle: string;
    resetPasswordSub: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    rememberMe: string;
    loginButton: string;
    signupButton: string;
    sendResetLink: string;
    resetButton: string;
    noAccount: string;
    haveAccount: string;
    forgotPasswordLink: string;
    passwordStrength: string;
    strengthWeak: string;
    strengthMedium: string;
    strengthStrong: string;
    termsConsent: string;
  };
  voice: {
    title: string;
    listening: string;
    idle: string;
    promptPlaceholder: string;
    suggestedCommands: string;
    cmd1: string;
    cmd2: string;
    cmd3: string;
    backendNotice: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: "VerifyX-AI",
    appSubtitle: "AI Document Tampering & Identity Risk Analyzer",
    tagline: "Forensic document tamper detection and identity verification platform powered by next-generation neural analysis.",
    nav: {
      dashboard: "Dashboard",
      analyze: "Analyze",
      compare: "Compare",
      history: "History",
      reports: "Reports",
      profile: "Profile",
      settings: "Settings",
      logout: "Sign Out",
      askVerifyX: "Ask VerifyX AI",
    },
    common: {
      loading: "Processing Forensic Stream...",
      error: "Error encountered",
      success: "Action completed successfully",
      cancel: "Cancel",
      save: "Save Changes",
      back: "Back",
      search: "Search documents, hashes, or IDs...",
      filter: "Filter",
      sort: "Sort by",
      view: "Inspect",
      download: "Download",
      export: "Export Dossier",
      status: "Status",
      date: "Timestamp",
      actions: "Actions",
      refresh: "Refresh Data",
      close: "Close",
      backendStatus: "Backend Connection",
      backendConnected: "FastAPI Engine Connected",
      backendDisconnected: "FastAPI Engine Disconnected",
      backendRequired: "A live FastAPI backend is required to process document forensic pipelines.",
    },
    dashboard: {
      welcome: "Document Security Operations Center",
      welcomeSub: "Real-time forensic integrity inspection, tamper detection, and identity risk evaluation.",
      quickAnalyze: "Analyze Document",
      quickAnalyzeDesc: "Upload single document for deep multi-layer neural forensic inspection.",
      compareDocs: "Compare Documents",
      compareDocsDesc: "Side-by-side biometric, layout, text, and metadata delta verification.",
      riskOverview: "Risk Distribution Overview",
      analysisStats: "Forensic Telemetry",
      recentAnalyses: "Recent Inspections",
      securityStatus: "System Security Readiness",
      systemHealth: "Active Integrity Services",
      noRecentAnalyses: "No document analyzed yet",
      noStatsAvailable: "No analysis telemetry available",
      emptySubtitle: "Initiate your first document forensic analysis to populate operations telemetry.",
    },
    analyze: {
      title: "Document Tamper Inspection",
      subtitle: "Execute multi-spectral visual, metadata, and OCR anomaly detection on official credentials and records.",
      uploadAreaTitle: "Upload Document for Forensic Analysis",
      uploadAreaDrag: "Drag & drop credential or evidence file here, or",
      uploadAreaBrowse: "browse system files",
      supportedFormats: "Supported formats: PDF, PNG, JPG, JPEG, WEBP",
      maxSize: "Maximum file size: 25MB (Encrypted in transit)",
      previewTitle: "Selected Document Manifest",
      analyzingDocument: "Forensic Neural Scan in Progress...",
      scanningLayers: "Executing Error Level Analysis (ELA), OCR Cross-Check, and Metadata Extraction...",
      startAnalysis: "Execute Forensic Analysis",
      replaceFile: "Replace Document",
      removeFile: "Remove Document",
      readyToAnalyze: "Document loaded. Ready to dispatch to forensic pipeline.",
      noFileSelected: "No file selected. Please choose a document.",
    },
    analysisResult: {
      title: "Forensic Inspection Report",
      overallRisk: "Composite Tampering Risk Score",
      riskCategory: "Assigned Classification",
      confidence: "Neural Confidence Rating",
      riskBreakdown: "Multi-Vector Risk Breakdown",
      suspiciousAreas: "Suspicious Areas & Heatmap Inspection",
      explainRisk: "Explain My Risk",
      forensicSummary: "Forensic Dossier Summary",
      recommendations: "Actionable Operational Recommendations",
      originalView: "Original Layer",
      heatmapView: "Thermal Heatmap",
      xrayView: "AI Forensic X-Ray",
      zoomIn: "Zoom In (+)",
      zoomOut: "Zoom Out (-)",
      resetView: "Reset Pan/Zoom",
      fullScreen: "Toggle Fullscreen",
      toggleRegions: "Toggle Anomaly Bounding Boxes",
      noAnalysisFound: "No analysis available",
      backendAnalysisRequired: "Upload a document to trigger the forensic engine via your backend.",
      downloadReport: "Download Forensic Report (PDF)",
    },
    compare: {
      title: "Document Delta & DNA Comparison",
      subtitle: "Detect cloned credentials, modified text blocks, altered stamps, or swapped photo portraits.",
      docA: "Primary Document (Baseline / Authentic)",
      docB: "Secondary Document (Candidate / Target)",
      startComparison: "Execute Comparative Inspection",
      comparingNotice: "Comparing visual hashes, font glyph metrics, and EXIF metadata...",
      similarityScore: "Overall Document Similarity",
      dnaComparison: "Document DNA Alignment",
      differencesDetected: "Identified Variances & Anomalies",
      noComparisonFound: "No comparison available yet",
    },
    history: {
      title: "Inspection Audit History",
      subtitle: "Comprehensive forensic audit log of all scanned documents and tamper classifications.",
      noHistoryTitle: "No analysis history yet",
      noHistoryDesc: "Documents analyzed through your connected backend will be indexed here with tamper hashes.",
      tableHeaders: {
        document: "Document Name",
        date: "Analyzed Date",
        riskScore: "Risk Index",
        status: "Forensic Status",
        hash: "SHA-256 Checksum",
        action: "Action",
      },
    },
    reports: {
      title: "Forensic Dossiers & Compliance Reports",
      subtitle: "Exportable cryptographic proofs, tamper dossiers, and executive risk summaries.",
      noReportsTitle: "No reports available",
      noReportsDesc: "Formal compliance and audit reports generated by the backend pipeline will appear here.",
      generateReport: "Request New Forensic Dossier",
    },
    settings: {
      title: "Security Platform Settings",
      appearance: "Visual Appearance",
      darkMode: "Cyber Dark (Forensic Mode)",
      lightMode: "Tactical Light (High Contrast)",
      language: "System Interface Language",
      preferences: "Operational Preferences",
      reducedMotion: "Reduced Motion (Accessibility Mode)",
      notifications: "Real-time Tamper Alerts",
      backendConfig: "FastAPI Engine Gateway",
      apiUrl: "Backend API Base URL (VITE_API_BASE_URL)",
      apiStatus: "Engine Connection Diagnostic",
    },
    auth: {
      loginTitle: "Access VerifyX Terminal",
      loginSub: "Enter your authenticated credentials to access the forensics workbench.",
      signupTitle: "Provision VerifyX Credentials",
      signupSub: "Register for enterprise document integrity and fraud detection access.",
      forgotPasswordTitle: "Recover Access Key",
      forgotPasswordSub: "Provide your registered email to receive access recovery instructions.",
      resetPasswordTitle: "Set New Access Key",
      resetPasswordSub: "Define a secure, high-entropy password for your account.",
      email: "Corporate Email Address",
      password: "Password / Keyphrase",
      confirmPassword: "Confirm Password",
      fullName: "Full Legal Name",
      rememberMe: "Maintain Secure Terminal Session",
      loginButton: "Authenticate & Enter",
      signupButton: "Provision Account",
      sendResetLink: "Transmit Password Recovery Instructions",
      resetButton: "Apply New Access Key",
      noAccount: "Don't have an enterprise account?",
      haveAccount: "Already have an authenticated key?",
      forgotPasswordLink: "Forgot password?",
      passwordStrength: "Entropy / Security Grade",
      strengthWeak: "Weak (Vulnerable)",
      strengthMedium: "Moderate",
      strengthStrong: "Strong (Cryptographically Robust)",
      termsConsent: "I agree to the Terms of Forensic Service and Data Processing Compliance.",
    },
    voice: {
      title: "Ask VerifyX AI Security Assistant",
      listening: "Listening for security command...",
      idle: "Voice terminal standby",
      promptPlaceholder: "Ask about risk factors, anomalies, or commands...",
      suggestedCommands: "Suggested Security Inquiries",
      cmd1: "Analyze my document",
      cmd2: "Show my recent analyses",
      cmd3: "Explain my risk",
      backendNotice: "Voice assistant frontend interface is ready for backend AI streaming integration.",
    },
  },
  te: {
    appName: "VerifyX-AI",
    appSubtitle: "AI పత్రాల తారుమారు & గుర్తింపు ప్రమాద విశ్లేషణ",
    tagline: "అధునాతన న్యూరల్ టెక్నాలజీతో పత్రాల నకిలీ మరియు తారుమారు గుర్తింపు వేదిక.",
    nav: {
      dashboard: "డాష్‌బోర్డ్",
      analyze: "విశ్లేషించు",
      compare: "పోల్చు",
      history: "చరిత్ర",
      reports: "నివేదికలు",
      profile: "ప్రొఫైల్",
      settings: "సెట్టింగ్‌లు",
      logout: "లాగ్ అవుట్",
      askVerifyX: "వెరిఫైఎక్స్ AI ని అడగండి",
    },
    common: {
      loading: "ఫోరెన్సిక్ స్ట్రీమ్ ప్రాసెస్ అవుతోంది...",
      error: "లోపం సంభవించింది",
      success: "విజయవంతంగా పూర్తయింది",
      cancel: "రద్దు చేయి",
      save: "మార్పులను భద్రపరచు",
      back: "వెనుకకు",
      search: "పత్రాలు, హాష్‌లు లేదా ఐడీల ద్వారా శోధించండి...",
      filter: "ఫిల్టర్",
      sort: "క్రమబద్ధీకరించు",
      view: "తనిఖీ చేయి",
      download: "డౌన్‌లోడ్",
      export: "ఎగుమతి చేయి",
      status: "స్థితి",
      date: "తేదీ",
      actions: "చర్యలు",
      refresh: "రిఫ్రెష్ చేయి",
      close: "మూసివేయి",
      backendStatus: "బ్యాకెండ్ కనెక్షన్",
      backendConnected: "ఫాస్ట్‌ఏపీఐ ఇంజిన్ కనెక్ట్ చేయబడింది",
      backendDisconnected: "ఫాస్ట్‌ఏపీఐ ఇంజిన్ డిస్‌కనెక్ట్ అయింది",
      backendRequired: "పత్రాల ఫోరెన్సిక్ విశ్లేషణకు లైవ్ బ్యాకెండ్ అవసరం.",
    },
    dashboard: {
      welcome: "పత్రాల భద్రతా నిర్వహణ కేంద్రం",
      welcomeSub: "రియల్ టైమ్ సమగ్రత తనిఖీ మరియు నకిలీ పత్రాల గుర్తింపు.",
      quickAnalyze: "పత్రాన్ని విశ్లేషించండి",
      quickAnalyzeDesc: "న్యూరల్ ఫోరెన్సిక్ తనిఖీ కోసం ఒక పత్రాన్ని అప్‌లోడ్ చేయండి.",
      compareDocs: "పత్రాలను పోల్చండి",
      compareDocsDesc: "రెండు పత్రాల మధ్య మార్పులు మరియు తేడాలను తనిఖీ చేయండి.",
      riskOverview: "ప్రమాద సమీక్ష",
      analysisStats: "విశ్లేషణ గణాంకాలు",
      recentAnalyses: "ఇటీవలి తనిఖీలు",
      securityStatus: "సిస్టమ్ భద్రత",
      systemHealth: "యాక్టివ్ సేవలు",
      noRecentAnalyses: "ఇంతవరకు ఎటువంటి పత్రం విశ్లేషించబడలేదు",
      noStatsAvailable: "గణాంకాలు అందుబాటులో లేవు",
      emptySubtitle: "టెలిమెట్రీని పూరించడానికి మీ మొదటి పత్రాన్ని విశ్లేషించండి.",
    },
    analyze: {
      title: "పత్రాల తారుమారు తనిఖీ",
      subtitle: "అధికారిక పత్రాలపై మెటాడేటా, చిత్రాల మార్పులు మరియు OCR వ్యత్యాసాలను గుర్తించండి.",
      uploadAreaTitle: "ఫోరెన్సిక్ విశ్లేషణ కోసం పత్రాన్ని అప్‌లోడ్ చేయండి",
      uploadAreaDrag: "పత్రాన్ని ఇక్కడ డ్రాగ్ & డ్రాప్ చేయండి లేదా",
      uploadAreaBrowse: "ఫైల్‌లను బ్రౌజ్ చేయండి",
      supportedFormats: "మద్దతు గల ఫార్మాట్లు: PDF, PNG, JPG, JPEG, WEBP",
      maxSize: "గరిష్ట పరిమాణం: 25MB",
      previewTitle: "ఎంచుకున్న పత్రం",
      analyzingDocument: "ఫోరెన్సిక్ న్యూరల్ స్కాన్ జరుగుతోంది...",
      scanningLayers: "లేయర్లు, ELA మరియు మెటాడేటా తనిఖీ చేయబడుతున్నాయి...",
      startAnalysis: "విశ్లేషణను ప్రారంభించండి",
      replaceFile: "పత్రాన్ని మార్చండి",
      removeFile: "పత్రాన్ని తొలగించండి",
      readyToAnalyze: "పత్రం లోడ్ చేయబడింది. విశ్లేషణకు సిద్ధంగా ఉంది.",
      noFileSelected: "ఎటువంటి ఫైల్ ఎంచుకోబడలేదు.",
    },
    analysisResult: {
      title: "ఫోరెన్సిక్ నివేదిక",
      overallRisk: "మొత్తం తారుమారు ప్రమాద స్కోరు",
      riskCategory: "ప్రమాద వర్గం",
      confidence: "న్యూరల్ విశ్వసనీయత",
      riskBreakdown: "వివిధ ప్రమాద కారకాలు",
      suspiciousAreas: "అనుమానాస్పద ప్రాంతాలు & హీట్‌మ్యాప్",
      explainRisk: "నా ప్రమాదాన్ని వివరించండి",
      forensicSummary: "ఫోరెన్సిక్ సారాంశం",
      recommendations: "సిఫార్సులు",
      originalView: "అసలు దృశ్యం",
      heatmapView: "హీట్‌మ్యాప్ దృశ్యం",
      xrayView: "AI ఎక్స్‌రే దృశ్యం",
      zoomIn: "జూమ్ ఇన్ (+)",
      zoomOut: "జూమ్ అవుట్ (-)",
      resetView: "రీసెట్",
      fullScreen: "పూర్తి స్క్రీన్",
      toggleRegions: "హైలైట్ చేసిన ప్రాంతాలు",
      noAnalysisFound: "విశ్లేషణ అందుబాటులో లేదు",
      backendAnalysisRequired: "లైవ్ విశ్లేషణ కోసం మీ బ్యాకెండ్‌ను కనెక్ట్ చేసి పత్రాన్ని పంపండి.",
      downloadReport: "రిపోర్ట్ డౌన్‌లోడ్ (PDF)",
    },
    compare: {
      title: "పత్రాల DNA పోలిక",
      subtitle: "రెండు పత్రాల మధ్య వ్యత్యాసాలు మరియు మార్పులను గుర్తించండి.",
      docA: "మొదటి పత్రం (బేస్‌లైన్)",
      docB: "రెండవ పత్రం (లక్ష్యం)",
      startComparison: "పోలికను ప్రారంభించండి",
      comparingNotice: "హ్యాష్‌లు మరియు ఫాంట్ మెట్రిక్స్‌ను పోలుస్తోంది...",
      similarityScore: "మొత్తం పోలిక స్కోరు",
      dnaComparison: "పత్రాల DNA సరిపోలిక",
      differencesDetected: "గుర్తించిన తేడాలు",
      noComparisonFound: "ఇంతవరకు ఎటువంటి పోలిక అందుబాటులో లేదు",
    },
    history: {
      title: "తనిఖీ చరిత్ర",
      subtitle: "గతంలో స్కాన్ చేసిన అన్ని పత్రాల పూర్తి రికార్డు.",
      noHistoryTitle: "ఇంతవరకు విశ్లేషణ చరిత్ర లేదు",
      noHistoryDesc: "మీ బ్యాకెండ్ ద్వారా విశ్లేషించబడిన పత్రాలు ఇక్కడ నమోదు చేయబడతాయి.",
      tableHeaders: {
        document: "పత్రం పేరు",
        date: "విశ్లేషించిన తేదీ",
        riskScore: "ప్రమాద స్కోరు",
        status: "స్థితి",
        hash: "SHA-256 హాష్",
        action: "చర్య",
      },
    },
    reports: {
      title: "ఫోరెన్సిక్ నివేదికలు",
      subtitle: "ఎగుమతి చేయగల ఆడిట్ మరియు భద్రతా నివేదికలు.",
      noReportsTitle: "నివేదికలు అందుబాటులో లేవు",
      noReportsDesc: "బ్యాకెండ్ పైప్‌లైన్ ద్వారా రూపొందించబడిన నివేదికలు ఇక్కడ కనిపిస్తాయి.",
      generateReport: "కొత్త నివేదికను అభ్యర్థించండి",
    },
    settings: {
      title: "భద్రతా సెట్టింగ్‌లు",
      appearance: "రూపురేఖలు",
      darkMode: "డార్క్ మోడ్",
      lightMode: "లైట్ మోడ్",
      language: "భాష",
      preferences: "ప్రాధాన్యతలు",
      reducedMotion: "యానిమేషన్‌లను తగ్గించు",
      notifications: "నోటిఫికేషన్‌లు",
      backendConfig: "బ్యాకెండ్ కాన్ఫిగరేషన్",
      apiUrl: "బ్యాకెండ్ API URL (VITE_API_BASE_URL)",
      apiStatus: "కనెక్షన్ స్థితి",
    },
    auth: {
      loginTitle: "VerifyX లాగిన్",
      loginSub: "ఫోరెన్సిక్స్ టెర్మినల్‌ను యాక్సెస్ చేయడానికి లాగిన్ అవ్వండి.",
      signupTitle: "VerifyX ఖాతా తెరవండి",
      signupSub: "పత్రాల భద్రత మరియు నకిలీ నిరోధానికి నమోదు చేసుకోండి.",
      forgotPasswordTitle: "పాస్‌వర్డ్ రీసెట్",
      forgotPasswordSub: "మీ నమోదిత ఇమెయిల్ చిరునామాను నమోదు చేయండి.",
      resetPasswordTitle: "కొత్త పాస్‌వర్డ్ సెట్ చేయండి",
      resetPasswordSub: "మీ ఖాతా కోసం సురక్షితమైన పాస్‌వర్డ్‌ను ఎంచుకోండి.",
      email: "ఇమెయిల్ చిరునామా",
      password: "పాస్‌వర్డ్",
      confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
      fullName: "పూర్తి పేరు",
      rememberMe: "నన్ను గుర్తుంచుకోండి",
      loginButton: "లాగిన్ అవ్వండి",
      signupButton: "ఖాతాను సృష్టించండి",
      sendResetLink: "రీసెట్ లింక్‌ను పంపండి",
      resetButton: "పాస్‌వర్డ్‌ను మార్చండి",
      noAccount: "ఖాతా లేదా?",
      haveAccount: "ఇప్పటికే ఖాతా ఉందా?",
      forgotPasswordLink: "పాస్‌వర్డ్ మర్చిపోయారా?",
      passwordStrength: "పాస్‌వర్డ్ బలం",
      strengthWeak: "బలహీనమైనది",
      strengthMedium: "మధ్యస్థం",
      strengthStrong: "బలమైనది",
      termsConsent: "నేను నిబంధనలు మరియు గోప్యతా విధానానికి అంగీకరిస్తున్నాను.",
    },
    voice: {
      title: "VerifyX AI అసిస్టెంట్",
      listening: "వాయిస్ ఆదేశం వినబడుతోంది...",
      idle: "వాయిస్ టెర్మినల్ సిద్ధంగా ఉంది",
      promptPlaceholder: "ప్రమాద కారకాలు లేదా ఆదేశాల గురించి అడగండి...",
      suggestedCommands: "సూచించబడిన ఆదేశాలు",
      cmd1: "నా పత్రాన్ని విశ్లేషించు",
      cmd2: "ఇటీవలి విశ్లేషణలను చూపించు",
      cmd3: "ప్రమాద వివరాలను వివరించు",
      backendNotice: "వాయిస్ అసిస్టెంట్ ఇంటర్‌ఫేస్ లైవ్ బ్యాకెండ్ స్ట్రీమింగ్‌కు సిద్ధంగా ఉంది.",
    },
  },
  hi: {
    appName: "VerifyX-AI",
    appSubtitle: "एआई दस्तावेज़ छेड़छाड़ और पहचान जोखिम विश्लेषक",
    tagline: "अगली पीढ़ी के न्यूरल विश्लेषण द्वारा संचालित फोरेंसिक दस्तावेज़ छेड़छाड़ पहचान और सत्यापन मंच।",
    nav: {
      dashboard: "डैशबोर्ड",
      analyze: "विश्लेषण करें",
      compare: "तुलना करें",
      history: "इतिहास",
      reports: "रिपोर्ट्स",
      profile: "प्रोफ़ाइल",
      settings: "सेटिंग्स",
      logout: "लॉग आउट",
      askVerifyX: "Ask VerifyX AI",
    },
    common: {
      loading: "फोरेंसिक डेटा संसाधित हो रहा है...",
      error: "त्रुटि उत्पन्न हुई",
      success: "सफलतापूर्वक पूर्ण",
      cancel: "रद्द करें",
      save: "परिवर्तन सहेजें",
      back: "वापस",
      search: "दस्तावेज़, हैश या आईडी खोजें...",
      filter: "फ़िल्टर",
      sort: "क्रमबद्ध करें",
      view: "निरीक्षण करें",
      download: "डाउनलोड",
      export: "निर्यात करें",
      status: "स्थिति",
      date: "दिनांक",
      actions: "कार्रवाई",
      refresh: "ताज़ा करें",
      close: "बंद करें",
      backendStatus: "बैकएंड कनेक्शन",
      backendConnected: "FastAPI इंजन कनेक्टेड",
      backendDisconnected: "FastAPI इंजन डिस्कनेक्टेड",
      backendRequired: "दस्तावेज़ फोरेंसिक विश्लेषण के लिए लाइव FastAPI बैकएंड आवश्यक है।",
    },
    dashboard: {
      welcome: "दस्तावेज़ सुरक्षा संचालन केंद्र",
      welcomeSub: "रीयल-टाइम फोरेंसिक अखंडता निरीक्षण और छेड़छाड़ पहचान।",
      quickAnalyze: "दस्तावेज़ का विश्लेषण करें",
      quickAnalyzeDesc: "गहन न्यूरल फोरेंसिक निरीक्षण के लिए दस्तावेज़ अपलोड करें।",
      compareDocs: "दस्तावेज़ों की तुलना करें",
      compareDocsDesc: "दो दस्तावेज़ों के बीच अंतर और संशोधनों की जांच करें।",
      riskOverview: "जोखिम अवलोकन",
      analysisStats: "विश्लेषण सांख्यिकी",
      recentAnalyses: "हाल के निरीक्षण",
      securityStatus: "सिस्टम सुरक्षा स्थिति",
      systemHealth: "सक्रिय सेवाएं",
      noRecentAnalyses: "अभी तक कोई दस्तावेज़ विश्लेषित नहीं किया गया",
      noStatsAvailable: "कोई सांख्यिकी उपलब्ध नहीं",
      emptySubtitle: "डेटा देखने के लिए अपना पहला दस्तावेज़ विश्लेषण प्रारंभ करें।",
    },
    analyze: {
      title: "दस्तावेज़ छेड़छाड़ निरीक्षण",
      subtitle: "आधिकारिक दस्तावेजों पर दृश्य, मेटाडेटा और ओसीआर विसंगतियों की जांच करें।",
      uploadAreaTitle: "फोरेंसिक विश्लेषण के लिए दस्तावेज़ अपलोड करें",
      uploadAreaDrag: "फ़ाइल यहाँ खींचें और छोड़ें (Drag & Drop), या",
      uploadAreaBrowse: "सिस्टम फ़ाइलें ब्राउज़ करें",
      supportedFormats: "समर्थित प्रारूप: PDF, PNG, JPG, JPEG, WEBP",
      maxSize: "अधिकतम फ़ाइल आकार: 25MB",
      previewTitle: "चयनित दस्तावेज़ पूर्वावलोकन",
      analyzingDocument: "फोरेंसिक न्यूरल स्कैन प्रगति पर है...",
      scanningLayers: "लेयर्स, ELA और मेटाडेटा की जांच की जा रही है...",
      startAnalysis: "फोरेंसिक विश्लेषण निष्पादित करें",
      replaceFile: "फ़ाइल बदलें",
      removeFile: "फ़ाइल हटाएं",
      readyToAnalyze: "दस्तावेज़ लोड हो गया। विश्लेषण के लिए तैयार।",
      noFileSelected: "कोई फ़ाइल चयनित नहीं है।",
    },
    analysisResult: {
      title: "फोरेंसिक निरीक्षण रिपोर्ट",
      overallRisk: "समग्र छेड़छाड़ जोखिम स्कोर",
      riskCategory: "जोखिम श्रेणी",
      confidence: "न्यूरल विश्वसनीयता",
      riskBreakdown: "जोखिम कारक विश्लेषण",
      suspiciousAreas: "संदिग्ध क्षेत्र और हीटमैप",
      explainRisk: "जोखिम स्पष्टीकरण",
      forensicSummary: "फोरेंसिक सारांश",
      recommendations: "सिफ़ारिशें",
      originalView: "मूल दृश्य",
      heatmapView: "हीटमैप दृश्य",
      xrayView: "एआई एक्स-रे दृश्य",
      zoomIn: "ज़ूम इन (+)",
      zoomOut: "ज़ूम आउट (-)",
      resetView: "रीसेट",
      fullScreen: "पूर्ण स्क्रीन",
      toggleRegions: "संदिग्ध क्षेत्र बॉक्स",
      noAnalysisFound: "कोई विश्लेषण उपलब्ध नहीं",
      backendAnalysisRequired: "लाइव विश्लेषण परिणाम के लिए अपने बैकएंड को कनेक्ट करें।",
      downloadReport: "रिपोर्ट डाउनलोड करें (PDF)",
    },
    compare: {
      title: "दस्तावेज़ DNA तुलना",
      subtitle: "दो दस्तावेज़ों के मध्य परिवर्तन, अंतर और क्लोनिंग का पता लगाएं।",
      docA: "पहला दस्तावेज़ (आधार / मूल)",
      docB: "दूसरा दस्तावेज़ (लक्ष्य / उम्मीदवार)",
      startComparison: "तुलनात्मक निरीक्षण प्रारंभ करें",
      comparingNotice: "हैश, फ़ॉन्ट मेट्रिक्स और मेटाडेटा की तुलना की जा रही है...",
      similarityScore: "कुल समानता स्कोर",
      dnaComparison: "दस्तावेज़ DNA मिलान",
      differencesDetected: "पाए गए अंतर और विसंगतियां",
      noComparisonFound: "अभी तक कोई तुलना परिणाम उपलब्ध नहीं है",
    },
    history: {
      title: "निरीक्षण इतिहास",
      subtitle: "विश्लेषित किए गए सभी दस्तावेज़ों का संपूर्ण फोरेंसिक ऑडिट लॉग।",
      noHistoryTitle: "अभी कोई विश्लेषण इतिहास नहीं है",
      noHistoryDesc: "आपके बैकएंड के माध्यम से विश्लेषित दस्तावेज़ यहाँ सूचीबद्ध होंगे।",
      tableHeaders: {
        document: "दस्तावेज़ का नाम",
        date: "विश्लेषण दिनांक",
        riskScore: "जोखिम सूचकांक",
        status: "स्थिति",
        hash: "SHA-256 हैश",
        action: "कार्रवाई",
      },
    },
    reports: {
      title: "फोरेंसिक रिपोर्ट्स एवं ऑडिट",
      subtitle: "डाउनलोड करने योग्य फोरेंसिक डॉसियर और अनुपालन सारांश।",
      noReportsTitle: "कोई रिपोर्ट उपलब्ध नहीं है",
      noReportsDesc: "बैकएंड पाइपलाइन द्वारा तैयार की गई रिपोर्ट यहाँ दिखाई देंगी।",
      generateReport: "नई फोरेंसिक रिपोर्ट का अनुरोध करें",
    },
    settings: {
      title: "सुरक्षा सेटिंग्स",
      appearance: "दिखावट",
      darkMode: "डार्क मोड",
      lightMode: "लाइट मोड",
      language: "सिस्टम भाषा",
      preferences: "प्राथमिकताएं",
      reducedMotion: "कम गति (Reduced Motion)",
      notifications: "अलर्ट सूचनाएं",
      backendConfig: "फास्टएपीआई बैकएंड गेटवे",
      apiUrl: "बैकएंड API Base URL (VITE_API_BASE_URL)",
      apiStatus: "इंजन कनेक्शन स्थिति",
    },
    auth: {
      loginTitle: "VerifyX में लॉगिन करें",
      loginSub: "फोरेंसिक कार्यक्षेत्र में प्रवेश के लिए क्रेडेंशियल दर्ज करें।",
      signupTitle: "VerifyX खाता बनाएं",
      signupSub: "दस्तावेज़ सुरक्षा और सत्यापन पहुंच हेतु पंजीकरण करें।",
      forgotPasswordTitle: "पासवर्ड पुनर्प्राप्ति",
      forgotPasswordSub: "पासवर्ड रीसेट करने के लिए पंजीकृत ईमेल दर्ज करें।",
      resetPasswordTitle: "नया पासवर्ड सेट करें",
      resetPasswordSub: "अपने खाते के लिए एक सुरक्षित पासवर्ड दर्ज करें।",
      email: "कॉर्पोरेट ईमेल पता",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      fullName: "पूरा नाम",
      rememberMe: "लॉगिन सत्र याद रखें",
      loginButton: "प्रमाणीकृत करें और प्रवेश करें",
      signupButton: "खाता बनाएं",
      sendResetLink: "रीसेट निर्देश भेजें",
      resetButton: "नया पासवर्ड लागू करें",
      noAccount: "खाता नहीं है?",
      haveAccount: "पहले से खाता है?",
      forgotPasswordLink: "पासवर्ड भूल गए?",
      passwordStrength: "पासवर्ड सुरक्षा स्तर",
      strengthWeak: "कमजोर",
      strengthMedium: "मध्यम",
      strengthStrong: "मजबूत (सुरक्षित)",
      termsConsent: "मैं सेवा की शर्तों और डेटा प्रसंस्करण नीति से सहमत हूँ।",
    },
    voice: {
      title: "Ask VerifyX AI सहायक",
      listening: "सुरक्षा निर्देश सुन रहा है...",
      idle: "वॉयस टर्मिनल स्टैंडबाय",
      promptPlaceholder: "जोखिम या आदेश के बारे में पूछें...",
      suggestedCommands: "सुझाए गए सुरक्षा आदेश",
      cmd1: "मेरे दस्तावेज़ का विश्लेषण करें",
      cmd2: "हाल के विश्लेषण दिखाएं",
      cmd3: "जोखिम का कारण समझाएं",
      backendNotice: "वॉयस सहायक इंटरफ़ेस बैकएंड AI स्ट्रीमिंग के लिए तैयार है।",
    },
  },
  kn: {
    appName: "VerifyX-AI",
    appSubtitle: "AI ದಾಖಲೆ ತಿದ್ದುವಿಕೆ ಮತ್ತು ಗುರುತು ಅಪಾಯ ವಿಶ್ಲೇಷಕ",
    tagline: "ಮುಂದಿನ ಪೀಳಿಗೆಯ ನ್ಯೂರಲ್ ವಿಶ್ಲೇಷಣೆಯಿಂದ ಚಾಲಿತವಾದ ಫೋರೆನ್ಸಿಕ್ ದಾಖಲೆ ಭದ್ರತಾ ವೇದಿಕೆ.",
    nav: {
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      analyze: "ವಿಶ್ಲೇಷಿಸಿ",
      compare: "ಹೋಲಿಸಿ",
      history: "ಇತಿಹಾಸ",
      reports: "ವರದಿಗಳು",
      profile: "ಪ್ರೊಫೈಲ್",
      settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      logout: "ಲಾಗ್ ಔಟ್",
      askVerifyX: "Ask VerifyX AI",
    },
    common: {
      loading: "ಫೋರೆನ್ಸಿಕ್ ಸ್ಟ್ರೀಮ್ ಪ್ರಕ್ರಿಯೆಗೊಳ್ಳುತ್ತಿದೆ...",
      error: "ದೋಷ ಕಂಡುಬಂದಿದೆ",
      success: "ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ",
      cancel: "ರದ್ದುಮಾಡಿ",
      save: "ಉಳಿಸಿ",
      back: "ಹಿಂದಕ್ಕೆ",
      search: "ದಾಖಲೆಗಳು, ಹ್ಯಾಶ್‌ಗಳು ಹುಡುಕಿ...",
      filter: "ಫಿಲ್ಟರ್",
      sort: "ವಿಂಗಡಿಸಿ",
      view: "ಪರಿಶೀಲಿಸಿ",
      download: "ಡೌನ್‌ಲೋಡ್",
      export: "ರಫ್ತು ಮಾಡಿ",
      status: "ಸ್ಥಿತಿ",
      date: "ದಿನಾಂಕ",
      actions: "ಕ್ರಿಯೆಗಳು",
      refresh: "ಮರುಹೊಂದಿಸಿ",
      close: "ಮುಚ್ಚಿ",
      backendStatus: "ಬ್ಯಾಕೆಂಡ್ ಸಂಪರ್ಕ",
      backendConnected: "FastAPI ಇಂಜಿನ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ",
      backendDisconnected: "FastAPI ಇಂಜಿನ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ",
      backendRequired: "ಲೈವ್ ಫೋರೆನ್ಸಿಕ್ ವಿಶ್ಲೇಷಣೆಗೆ FastAPI ಬ್ಯಾಕೆಂಡ್ ಅಗತ್ಯವಿದೆ.",
    },
    dashboard: {
      welcome: "ದಾಖಲೆ ಭದ್ರತಾ ಕಾರ್ಯಾಚರಣೆ ಕೇಂದ್ರ",
      welcomeSub: "ನೈಜ ಸಮಯದ ಸಮಗ್ರತೆ ತಪಾಸಣೆ ಮತ್ತು ತಿದ್ದುಪಡಿ ಪತ್ತೆ.",
      quickAnalyze: "ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
      quickAnalyzeDesc: "ನ್ಯೂರಲ್ ಫೋರೆನ್ಸಿಕ್ ತಪಾಸಣೆಗಾಗಿ ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
      compareDocs: "ದಾಖಲೆಗಳನ್ನು ಹೋಲಿಸಿ",
      compareDocsDesc: "ಎರಡು ದಾಖಲೆಗಳ ನಡುವಿನ ವ್ಯತ್ಯಾಸಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      riskOverview: "ಅಪಾಯದ ಅವಲೋಕನ",
      analysisStats: "ವಿಶ್ಲೇಷಣಾ ಅಂಕಿಅಂಶಗಳು",
      recentAnalyses: "ಇತ್ತೀಚಿನ ತಪಾಸಣೆಗಳು",
      securityStatus: "ವ್ಯವಸ್ಥೆಯ ಭದ್ರತಾ ಸಿದ್ಧತೆ",
      systemHealth: "ಸಕ್ರಿಯ ಸೇವೆಗಳು",
      noRecentAnalyses: "ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿಲ್ಲ",
      noStatsAvailable: "ಅಂಕಿಅಂಶಗಳು ಲಭ್ಯವಿಲ್ಲ",
      emptySubtitle: "ಮೊದಲ ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಪ್ರಾರಂಭಿಸಿ.",
    },
    analyze: {
      title: "ದಾಖಲೆ ತಿದ್ದುವಿಕೆ ತಪಾಸಣೆ",
      subtitle: "ಅಧಿಕೃತ ದಾಖಲೆಗಳಲ್ಲಿ ಮೆಟಾಡೇಟಾ, ಚಿತ್ರ ಬದಲಾವಣೆ ಮತ್ತು OCR ವ್ಯತ್ಯಾಸಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ.",
      uploadAreaTitle: "ವಿಶ್ಲೇಷಣೆಗಾಗಿ ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      uploadAreaDrag: "ದಾಖಲೆಯನ್ನು ಇಲ್ಲಿ ಡ್ರ್ಯಾಗ್ ಮಾಡಿ ಅಥವಾ",
      uploadAreaBrowse: "ಫೈಲ್‌ಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ",
      supportedFormats: "ಬೆಂಬಲಿತ ಮಾದರಿಗಳು: PDF, PNG, JPG, JPEG, WEBP",
      maxSize: "ಗರಿಷ್ಠ ಗಾತ್ರ: 25MB",
      previewTitle: "ಆಯ್ಕೆಮಾಡಿದ ದಾಖಲೆ ಮುನ್ನೋಟ",
      analyzingDocument: "ಫೋರೆನ್ಸಿಕ್ ನ್ಯೂರಲ್ ಸ್ಕ್ಯಾನ್ ಪ್ರಗತಿಯಲ್ಲಿದೆ...",
      scanningLayers: "ಲೇಯರ್‌ಗಳು ಮತ್ತು ಮೆಟಾಡೇಟಾ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      startAnalysis: "ವಿಶ್ಲೇಷಣೆ ನಡೆಸಿ",
      replaceFile: "ದಾಖಲೆಯನ್ನು ಬದಲಾಯಿಸಿ",
      removeFile: "ದಾಖಲೆಯನ್ನು ತೆಗೆದುಹಾಕಿ",
      readyToAnalyze: "ದಾಖಲೆ ಲೋಡ್ ಆಗಿದೆ. ವಿಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧ.",
      noFileSelected: "ಯಾವುದೇ ಫೈಲ್ ಆಯ್ಕೆಯಾಗಿಲ್ಲ.",
    },
    analysisResult: {
      title: "ಫೋರೆನ್ಸಿಕ್ ತಪಾಸಣಾ ವರದಿ",
      overallRisk: "ಒಟ್ಟು ತಿದ್ದುಪಡಿ ಅಪಾಯ ಸ್ಕೋರ್",
      riskCategory: "ಅಪಾಯ ವರ್ಗ",
      confidence: "ನ್ಯೂರಲ್ ವಿಶ್ವಾಸಾರ್ಹತೆ",
      riskBreakdown: "ಅಪಾಯದ ಅಂಶಗಳ ವಿಶ್ಲೇಷಣೆ",
      suspiciousAreas: "ಅನುಮಾನಾಸ್ಪದ ಪ್ರದೇಶಗಳು ಮತ್ತು ಹೀಟ್‌ಮ್ಯಾಪ್",
      explainRisk: "ಅಪಾಯವನ್ನು ವಿವರಿಸಿ",
      forensicSummary: "ಫೋರೆನ್ಸಿಕ್ ಸಾರಾಂಶ",
      recommendations: "ಶಿಫಾರಸುಗಳು",
      originalView: "ಮೂಲ ನೋಟ",
      heatmapView: "ಹೀಟ್‌ಮ್ಯಾಪ್ ನೋಟ",
      xrayView: "AI ಎಕ್ಸ್-ರೇ ನೋಟ",
      zoomIn: "ಝೂಮ್ ಇನ್ (+)",
      zoomOut: "ಝೂಮ್ ಔಟ್ (-)",
      resetView: "ಮರುಹೊಂದಿಸಿ",
      fullScreen: "ಪೂರ್ಣ ಪರದೆ",
      toggleRegions: "ಪ್ರದೇಶಗಳನ್ನು ತೋರಿಸಿ/ಮರೆಮಾಡಿ",
      noAnalysisFound: "ಯಾವುದೇ ವಿಶ್ಲೇಷಣೆ ಲಭ್ಯವಿಲ್ಲ",
      backendAnalysisRequired: "ಲೈವ್ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಕೆಂಡ್‌ಗೆ ಸಂಪರ್ಕ ಕಲ್ಪಿಸಿ.",
      downloadReport: "ವರದಿ ಡೌನ್‌ಲೋಡ್ (PDF)",
    },
    compare: {
      title: "ದಾಖಲೆ DNA ಹೋಲಿಕೆ",
      subtitle: "ಎರಡು ದಾಖಲೆಗಳ ನಡುವಿನ ವ್ಯತ್ಯಾಸಗಳು ಮತ್ತು ಬದಲಾವಣೆಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ.",
      docA: "ಮೊದಲ ದಾಖಲೆ (ಮೂಲ)",
      docB: "ಎರಡನೇ ದಾಖಲೆ (ಗುರಿ)",
      startComparison: "ಹೋಲಿಕೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ",
      comparingNotice: "ಹ್ಯಾಶ್‌ಗಳು ಮತ್ತು ಮೆಟ್ರಿಕ್ಸ್‌ಗಳನ್ನು ಹೋಲಿಸಲಾಗುತ್ತಿದೆ...",
      similarityScore: "ಒಟ್ಟು ಹೋಲಿಕೆ ಸ್ಕೋರ್",
      dnaComparison: "ದಾಖಲೆ DNA ಹೊಂದಾಣಿಕೆ",
      differencesDetected: "ಕಂಡುಬಂದ ವ್ಯತ್ಯಾಸಗಳು",
      noComparisonFound: "ಇನ್ನೂ ಯಾವುದೇ ಹೋಲಿಕೆ ಲಭ್ಯವಿಲ್ಲ",
    },
    history: {
      title: "ತಪಾಸಣೆ ಇತಿಹಾಸ",
      subtitle: "ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಎಲ್ಲಾ ದಾಖಲೆಗಳ ಸಂಪೂರ್ಣ ಆಡಿಟ್ ಲಾಗ್.",
      noHistoryTitle: "ಇನ್ನೂ ಯಾವುದೇ ವಿಶ್ಲೇಷಣಾ ಇತಿಹಾಸವಿಲ್ಲ",
      noHistoryDesc: "ನಿಮ್ಮ ಬ್ಯಾಕೆಂಡ್ ಮೂಲಕ ವಿಶ್ಲೇಷಿಸಲಾದ ದಾಖಲೆಗಳು ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತವೆ.",
      tableHeaders: {
        document: "ದಾಖಲೆಯ ಹೆಸರು",
        date: "ವಿಶ್ಲೇಷಿಸಿದ ದಿನಾಂಕ",
        riskScore: "ಅಪಾಯದ ಸ್ಕೋರ್",
        status: "ಸ್ಥಿತಿ",
        hash: "SHA-256 ಹ್ಯಾಶ್",
        action: "ಕ್ರಿಯೆ",
      },
    },
    reports: {
      title: "ಫೋರೆನ್ಸಿಕ್ ವರದಿಗಳು",
      subtitle: "ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದಾದ ಭದ್ರತಾ ವರದಿಗಳು.",
      noReportsTitle: "ವರದಿಗಳು ಲಭ್ಯವಿಲ್ಲ",
      noReportsDesc: "ಬ್ಯಾಕೆಂಡ್ ಪೈಪ್‌ಲೈನ್ ಮೂಲಕ ರಚಿಸಲಾದ ವರದಿಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
      generateReport: "ಹೊಸ ವರದಿಯನ್ನು ಕೋರಿ",
    },
    settings: {
      title: "ಭದ್ರತಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      appearance: "ನೋಟ",
      darkMode: "ಡಾರ್ಕ್ ಮೋಡ್",
      lightMode: "ಲೈಟ್ ಮೋಡ್",
      language: "ಭಾಷೆ",
      preferences: "ಆದ್ಯತೆಗಳು",
      reducedMotion: "ಕಡಿಮೆ ಚಲನೆ",
      notifications: "ಅಧಿಸೂಚನೆಗಳು",
      backendConfig: "FastAPI ಗೇಟ್‌ವೇ",
      apiUrl: "ಬ್ಯಾಕೆಂಡ್ API URL (VITE_API_BASE_URL)",
      apiStatus: "ಸಂಪರ್ಕ ಸ್ಥಿತಿ",
    },
    auth: {
      loginTitle: "VerifyX ಲಾಗಿನ್",
      loginSub: "ಫೋರೆನ್ಸಿಕ್ ಟರ್ಮಿನಲ್ ಪ್ರವೇಶಿಸಲು ರುಜುವಾತುಗಳನ್ನು ನಮೂದಿಸಿ.",
      signupTitle: "ಖಾತೆಯನ್ನು ರಚಿಸಿ",
      signupSub: "ದಾಖಲೆ ಭದ್ರತೆ ಮತ್ತು ತಪಾಸಣೆಗಾಗಿ ನೋಂದಾಯಿಸಿ.",
      forgotPasswordTitle: "ಪಾಸ್‌ವರ್ಡ್ ಮರುಪಡೆಯುವಿಕೆ",
      forgotPasswordSub: "ನೋಂದಾಯಿತ ಇಮೇಲ್ ನಮೂದಿಸಿ.",
      resetPasswordTitle: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಿ",
      resetPasswordSub: "ಸುರಕ್ಷಿತ ಪಾಸ್‌ವರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ.",
      email: "ಇಮೇಲ್ ವಿಳಾಸ",
      password: "ಪಾಸ್‌ವರ್ಡ್",
      confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
      fullName: "ಪೂರ್ಣ ಹೆಸರು",
      rememberMe: "ನೆನಪಿಡಿ",
      loginButton: "ಲಾಗಿನ್ ಆಗಿ",
      signupButton: "ಖಾತೆ ತೆರೆಯಿರಿ",
      sendResetLink: "ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಿ",
      resetButton: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ವಯಿಸಿ",
      noAccount: "ಖಾತೆ ಇಲ್ಲವೇ?",
      haveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
      forgotPasswordLink: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?",
      passwordStrength: "ಪಾಸ್‌ವರ್ಡ್ ಶಕ್ತಿ",
      strengthWeak: "ದುರ್ಬಲ",
      strengthMedium: "ಮಧ್ಯಮ",
      strengthStrong: "ಬಲಿಷ್ಠ",
      termsConsent: "ನಾನು ಸೇವಾ ನಿಯಮಗಳಿಗೆ ಒಪ್ಪುತ್ತೇನೆ.",
    },
    voice: {
      title: "Ask VerifyX AI ಸಹಾಯಕ",
      listening: "ಆದೇಶವನ್ನು ಆಲಿಸುತ್ತಿದೆ...",
      idle: "ವಾಯ್ಸ್ ಟರ್ಮಿನಲ್ ಸಿದ್ಧವಾಗಿದೆ",
      promptPlaceholder: "ಅಪಾಯ ಅಥವಾ ಆಜ್ಞೆಯ ಬಗ್ಗೆ ಕೇಳಿ...",
      suggestedCommands: "ಸೂಚಿಸಲಾದ ಆದೇಶಗಳು",
      cmd1: "ನನ್ನ ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
      cmd2: "ಇತ್ತೀಚಿನ ವಿಶ್ಲೇಷಣೆಗಳನ್ನು ತೋರಿಸಿ",
      cmd3: "ಅಪಾಯದ ಕಾರಣವನ್ನು ವಿವರಿಸಿ",
      backendNotice: "ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್ ಇಂಟರ್‌ಫೇಸ್ ಲೈವ್ ಬ್ಯಾಕೆಂಡ್ ಸಂಪರ್ಕಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ.",
    },
  },
  ml: {
    appName: "VerifyX-AI",
    appSubtitle: "AI ഡോക്യുമെന്റ് കൃത്രിമത്വവും ഐഡന്റിറ്റി റിസ്ക് അനലൈസറും",
    tagline: "ന്യൂറൽ സാങ്കേതികവിദ്യയിലൂടെ ഡോക്യുമെന്റ് കൃത്രിമത്വവും ഫോർജറിയും കണ്ടെത്താനുള്ള ഫോറൻസിക് പ്ലാറ്റ്‌ഫോം.",
    nav: {
      dashboard: "ഡാഷ്‌ബോർഡ്",
      analyze: "പരിശോധിക്കുക",
      compare: "താരതമ്യം ചെയ്യുക",
      history: "ചരിത്രം",
      reports: "റിപ്പോർട്ടുകൾ",
      profile: "പ്രൊഫൈൽ",
      settings: "ക്രമീകരണങ്ങൾ",
      logout: "ലോഗ് ഔട്ട്",
      askVerifyX: "Ask VerifyX AI",
    },
    common: {
      loading: "ഫോറൻസിക് വിവരങ്ങൾ പ്രോസസ്സ് ചെയ്യുന്നു...",
      error: "പിശക് സംഭവിച്ചു",
      success: "വിജയകരമായി പൂർത്തിയായി",
      cancel: "റദ്ദാക്കുക",
      save: "മാറ്റങ്ങൾ സേവ് ചെയ്യുക",
      back: "പിന്നിലേക്ക്",
      search: "ഡോക്യുമെന്റുകൾ, ഹാഷുകൾ തിരയുക...",
      filter: "ഫിൽട്ടർ",
      sort: "ക്രമപ്പെടുത്തുക",
      view: "പരിശോധിക്കുക",
      download: "ഡൗൺലോഡ്",
      export: "എക്‌സ്‌പോർട്ട് ചെയ്യുക",
      status: "നില",
      date: "തീയതി",
      actions: "നടപടികൾ",
      refresh: "പുതുക്കുക",
      close: "അടയ്ക്കുക",
      backendStatus: "ബാക്കെൻഡ് കണക്ഷൻ",
      backendConnected: "FastAPI എഞ്ചിൻ കണക്റ്റഡ്",
      backendDisconnected: "FastAPI എഞ്ചിൻ വിച്ഛേദിക്കപ്പെട്ടു",
      backendRequired: "ഡോക്യുമെന്റ് ഫോറൻസിക് പരിശോധനയ്ക്ക് ലൈവ് ബാക്കെൻഡ് ആവശ്യമാണ്.",
    },
    dashboard: {
      welcome: "ഡോക്യുമെന്റ് സുരക്ഷാ പ്രവർത്തന കേന്ദ്രം",
      welcomeSub: "തത്സമയ സമഗ്രതാ പരിശോധനയും കൃത്രിമത്വ നിർണ്ണയവും.",
      quickAnalyze: "ഡോക്യുമെന്റ് പരിശോധിക്കുക",
      quickAnalyzeDesc: "ന്യൂറൽ ഫോറൻസിക് പരിശോധനയ്ക്കായി ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക.",
      compareDocs: "ഡോക്യുമെന്റുകൾ താരതമ്യം ചെയ്യുക",
      compareDocsDesc: "രണ്ട് ഡോക്യുമെന്റുകൾ തമ്മിലുള്ള വ്യത്യാസങ്ങൾ കണ്ടെത്തുക.",
      riskOverview: "റിസ്ക് അവലോകനം",
      analysisStats: "സ്ഥിതിവിവരക്കണക്കുകൾ",
      recentAnalyses: "സമീപകാല പരിശോധനകൾ",
      securityStatus: "സിസ്റ്റം സുരക്ഷ",
      systemHealth: "സജീവ സേവനങ്ങൾ",
      noRecentAnalyses: "ഇതുവരെ ഡോക്യുമെന്റുകൾ പരിശോധിച്ചിട്ടില്ല",
      noStatsAvailable: "വിവരങ്ങൾ ലഭ്യമല്ല",
      emptySubtitle: "ആദ്യത്തെ ഡോക്യുമെന്റ് പരിശോധിച്ച് ടെലിമെട്രി ആരംഭിക്കുക.",
    },
    analyze: {
      title: "ഡോക്യുമെന്റ് കൃത്രിമത്വ പരിശോധന",
      subtitle: "മെറ്റാഡാറ്റ, ഇമേജ് കൃത്രിമത്വം, OCR പൊരുത്തക്കേടുകൾ എന്നിവ കണ്ടെത്തുക.",
      uploadAreaTitle: "ഫോറൻസിക് പരിശോധനയ്ക്കായി ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക",
      uploadAreaDrag: "ഫയൽ ഇവിടെ ഡ്രാഗ് & ഡ്രോപ്പ് ചെയ്യുക, അല്ലെങ്കിൽ",
      uploadAreaBrowse: "ഫയലുകൾ ബ്രൗസ് ചെയ്യുക",
      supportedFormats: "പിന്തുണയ്ക്കുന്ന ഫോർമാറ്റുകൾ: PDF, PNG, JPG, JPEG, WEBP",
      maxSize: "പരമാവധി ഫയൽ വലിപ്പം: 25MB",
      previewTitle: "തിരഞ്ഞെടുത്ത ഡോക്യുമെന്റ് പ്രിവ്യൂ",
      analyzingDocument: "ഫോറൻസിക് സ്കാനിംഗ് പുരോഗമിക്കുന്നു...",
      scanningLayers: "ലെയറുകൾ, ELA, മെറ്റാഡാറ്റ എന്നിവ വിശകലനം ചെയ്യുന്നു...",
      startAnalysis: "പരിശോധന ആരംഭിക്കുക",
      replaceFile: "ഫയൽ മാറ്റുക",
      removeFile: "ഫയൽ നീക്കം ചെയ്യുക",
      readyToAnalyze: "ഡോക്യുമെന്റ് ലോഡ് ചെയ്തു. പരിശോധനയ്ക്ക് തയ്യാറാണ്.",
      noFileSelected: "ഫയലുകൾ തിരഞ്ഞെടുത്തിട്ടില്ല.",
    },
    analysisResult: {
      title: "ഫോറൻസിക് റിപ്പോർട്ട്",
      overallRisk: "ആകെ കൃത്രിമത്വ റിസ്ക് സ്കോർ",
      riskCategory: "റിസ്ക് വിഭാഗം",
      confidence: "വിശ്വാസ്യത",
      riskBreakdown: "റിസ്ക് ഘടകങ്ങൾ",
      suspiciousAreas: "സംശയാസ്പദ മേഖലകളും ഹീറ്റ്‌മാപ്പും",
      explainRisk: "റിസ്ക് വിശദീകരിക്കുക",
      forensicSummary: "ഫോറൻസിക് സംഗ്രഹം",
      recommendations: "ശുപാർശകൾ",
      originalView: "യഥാർത്ഥ രൂപം",
      heatmapView: "ഹീറ്റ്‌മാപ്പ് കാഴ്ച",
      xrayView: "AI എക്സ്-റേ കാഴ്ച",
      zoomIn: "സൂം ഇൻ (+)",
      zoomOut: "സൂം ഔട്ട് (-)",
      resetView: "റീസെറ്റ്",
      fullScreen: "പൂർണ്ണ സ്‌ക്രീൻ",
      toggleRegions: "മേഖലകൾ കാണിക്കുക/മറയ്ക്കുക",
      noAnalysisFound: "പരിശോധനാ ഫലം ലഭ്യമല്ല",
      backendAnalysisRequired: "ലൈവ് പരിശോധനയ്ക്കായി നിങ്ങളുടെ ബാക്കെൻഡിലേക്ക് ബന്ധിപ്പിക്കുക.",
      downloadReport: "റിപ്പോർട്ട് ഡൗൺലോഡ് (PDF)",
    },
    compare: {
      title: "ഡോക്യുമെന്റ് DNA താരതമ്യം",
      subtitle: "രണ്ട് ഡോക്യുമെന്റുകൾ തമ്മിലുള്ള വ്യത്യാസങ്ങളും മാറ്റങ്ങളും കണ്ടെത്തുക.",
      docA: "പ്രാഥമിക ഡോക്യുമെന്റ് (യഥാർത്ഥം)",
      docB: "രണ്ടാമത്തെ ഡോക്യുമെന്റ് (ലക്ഷ്യം)",
      startComparison: "താരതമ്യം ആരംഭിക്കുക",
      comparingNotice: "ഹാഷുകളും മെട്രിക്സുകളും താരതമ്യം ചെയ്യുന്നു...",
      similarityScore: "ആകെ സമാനതാ സ്കോർ",
      dnaComparison: "ഡോക്യുമെന്റ് DNA സാമ്യം",
      differencesDetected: "കണ്ടെത്തിയ വ്യത്യാസങ്ങൾ",
      noComparisonFound: "ഇതുവരെ താരതമ്യ വിവരങ്ങൾ ലഭ്യമല്ല",
    },
    history: {
      title: "പരിശോധനാ ചരിത്രം",
      subtitle: "പരിശോധിച്ച എല്ലാ ഡോക്യുമെന്റുകളുടെയും സമ്പൂർണ്ണ ഓഡിറ്റ് ലോഗ്.",
      noHistoryTitle: "ഇതുവരെ ചരിത്രമില്ല",
      noHistoryDesc: "ബാക്കെൻഡ് വഴി വിശകലനം ചെയ്ത ഡോക്യുമെന്റുകൾ ഇവിടെ കാണാം.",
      tableHeaders: {
        document: "ഡോക്യുമെന്റ് പേര്",
        date: "തീയതി",
        riskScore: "റിസ്ക് സ്കോർ",
        status: "നില",
        hash: "SHA-256 ചെക്ക്സം",
        action: "നടപടി",
      },
    },
    reports: {
      title: "ഫോറൻസിക് റിപ്പോർട്ടുകൾ",
      subtitle: "ഡൗൺലോഡ് ചെയ്യാവുന്ന ഓഡിറ്റ് റിപ്പോർട്ടുകൾ.",
      noReportsTitle: "റിപ്പോർട്ടുകൾ ലഭ്യമല്ല",
      noReportsDesc: "ബാക്കെൻഡ് വഴി തയ്യാറാക്കിയ റിപ്പോർട്ടുകൾ ഇവിടെ ദൃശ്യമാകും.",
      generateReport: "പുതിയ റിപ്പോർട്ട് ആവശ്യപ്പെടുക",
    },
    settings: {
      title: "സുരക്ഷാ ക്രമീകരണങ്ങൾ",
      appearance: "രൂപഭാവം",
      darkMode: "ഡാർക്ക് മോഡ്",
      lightMode: "ലൈറ്റ് മോഡ്",
      language: "സിസ്റ്റം ഭാഷ",
      preferences: "മുൻഗണനകൾ",
      reducedMotion: "കുറഞ്ഞ ചലനം",
      notifications: "അറിയിപ്പുകൾ",
      backendConfig: "FastAPI ഗേറ്റ്‌വേ",
      apiUrl: "ബാക്കെൻഡ് API URL (VITE_API_BASE_URL)",
      apiStatus: "കണക്ഷൻ സ്ഥിതി",
    },
    auth: {
      loginTitle: "VerifyX ലോഗിൻ",
      loginSub: "ഫോറൻസിക്സ് ടെർമിനൽ ആക്സസ് ചെയ്യാൻ ലോഗിൻ ചെയ്യുക.",
      signupTitle: "VerifyX അക്കൗണ്ട് സൃഷ്ടിക്കുക",
      signupSub: "ഡോക്യുമെന്റ് സുരക്ഷാ പ്ലാറ്റ്‌ഫോമിൽ രജിസ്റ്റർ ചെയ്യുക.",
      forgotPasswordTitle: "പാസ്‌വേഡ് വീണ്ടെടുക്കൽ",
      forgotPasswordSub: "രജിസ്റ്റർ ചെയ്ത ഇമെയിൽ വിലാസം നൽകുക.",
      resetPasswordTitle: "പുതിയ പാസ്‌വേഡ് നൽകുക",
      resetPasswordSub: "നിങ്ങളുടെ അക്കൗണ്ടിനായി സുരക്ഷിതമായ പാസ്‌വേഡ് തിരഞ്ഞെടുക്കുക.",
      email: "ഇമെയിൽ വിലാസം",
      password: "പാസ്‌വേഡ്",
      confirmPassword: "പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക",
      fullName: "പൂർണ്ണമായ പേര്",
      rememberMe: "ഓർമ്മിക്കുക",
      loginButton: "ലോഗിൻ ചെയ്യുക",
      signupButton: "രജിസ്റ്റർ ചെയ്യുക",
      sendResetLink: "റീസെറ്റ് ലിങ്ക് അയയ്ക്കുക",
      resetButton: "പാസ്‌വേഡ് അപ്‌ഡേറ്റ് ചെയ്യുക",
      noAccount: "അക്കൗണ്ട് ഇല്ലേ?",
      haveAccount: "ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?",
      forgotPasswordLink: "പാസ്‌വേഡ് മറന്നോ?",
      passwordStrength: "പാസ്‌വേഡ് സുരക്ഷാ നിലവാരം",
      strengthWeak: "ദുർബലം",
      strengthMedium: "ഇടത്തരം",
      strengthStrong: "ശക്തം",
      termsConsent: "ഞാൻ സേവന നിബന്ധനകൾ അംഗീകരിക്കുന്നു.",
    },
    voice: {
      title: "Ask VerifyX AI അസിസ്റ്റന്റ്",
      listening: "ശബ്‌ദ കമാൻഡ് കേൾക്കുന്നു...",
      idle: "വോയ്‌സ് ടെർമിനൽ തയ്യാറാണ്",
      promptPlaceholder: "റിസ്ക് അല്ലെങ്കിൽ കമാൻഡുകൾ ചോദിക്കുക...",
      suggestedCommands: "നിർദ്ദേശിച്ച കമാൻഡുകൾ",
      cmd1: "എന്റെ ഡോക്യുമെന്റ് പരിശോധിക്കുക",
      cmd2: "സമീപകാല പരിശോധനകൾ കാണിക്കുക",
      cmd3: "റിസ്ക് വിശദീകരിക്കുക",
      backendNotice: "വോയ്‌സ് അസിസ്റ്റന്റ് ഇന്റർഫേസ് ലൈവ് ബാക്കെൻഡ് AI സ്ട്രീമിംഗിന് സജ്ജമാണ്.",
    },
  },
};
