// i18n Translation Dictionary for BIS Platform

export type SupportedI18nLanguage = "en" | "hi" | "ta" | "te" | "mr" | "gu" | "bn";

export const translations = {
  en: {
    common: {
      platformTitle: "BIS Standards Intelligence Platform",
      searchPlaceholder: "Search Indian Standards (e.g. 43 grade cement, TMT bars, CCTV, HDPE pipes)...",
      uploadPdf: "Upload PDF Tender",
      splitAnnotator: "Split-Screen Annotator",
      auditTrail: "Cryptographic Audit Trail",
      humanFeedback: "Human-in-the-Loop Feedback",
      activeAlerts: "Proactive Alerts",
      nitGenerator: "NIT Spec Generator",
      mcpIntegrations: "MCP Server Sandbox",
      analyzeButton: "Run RAG Intelligence",
      loading: "Processing with Knowledge Graph & Bhashini NLP...",
      close: "Close",
      save: "Save",
      applyFix: "Apply Suggested Fix to Draft",
      exportNit: "Export Sealed NIT Draft",
      page: "Page",
      of: "of",
      evidenceFound: "Evidence Highlighted",
      evidenceSearching: "Locating Evidence...",
      evidenceNotFound: "Evidence on Another Page",
      confidence: "Confidence",
      mandatoryQco: "Mandatory BIS QCO",
      superseded: "Superseded / Withdrawn",
      active: "Active & Valid",
      amendmentNeeded: "Amendment Needed",
    },
    tender: {
      title: "Automated Tender Document Analyser & Split-Screen Highlighter",
      description: "Ingest multi-item procurement tenders, inspect live color-coded statutory citation badges, and eliminate CVC audit vulnerability before NIT publication.",
      dragDrop: "Click or drag & drop tender PDF document here",
      supports: "Supports standard GeM, CPWD, NHAI, and State PWD PDF tender specifications",
      rawText: "RAW TENDER / NIT DOCUMENT TEXT",
      pastePlaceholder: "Paste your full NIT tender document here...",
      extractButton: "Extract & Analyse Tender Items",
      uploadPdfButton: "Extract & Analyse PDF",
      discoveredItems: "DISCOVERED SCHEDULE SPECIFICATIONS",
      totalClauses: "Total Clauses",
      cvcRiskTitle: "Statutory & CVC Audit Risk Notes",
    },
  },
  hi: {
    common: {
      platformTitle: "बीआईएस मानक इंटेलिजेंस प्लेटफॉर्म",
      searchPlaceholder: "भारतीय मानक खोजें (जैसे 43 ग्रेड सीमेंट, टीएमटी बार, सीसीटीवी, एचडीपीई पाइप)...",
      uploadPdf: "पीडीएफ निविदा अपलोड करें",
      splitAnnotator: "स्प्लिट-स्क्रीन एनोटेटर",
      auditTrail: "क्रिप्टोग्राफिक ऑडिट ट्रेल",
      humanFeedback: "ह्यूमन फीडबैक लूप",
      activeAlerts: "सक्रिय अलर्ट",
      nitGenerator: "एनआईटी विनिर्देश जनरेटर",
      mcpIntegrations: "एमसीपी सैंडबॉक्स",
      analyzeButton: "आरएजी इंटेलिजेंस चलाएं",
      loading: "नॉलेज ग्राफ और भाषिणी एनएलपी के साथ प्रसंस्करण...",
      close: "बंद करें",
      save: "सहेजें",
      applyFix: "सुझाया गया सुधार लागू करें",
      exportNit: "सीलबंद एनआईटी ड्राफ्ट निर्यात करें",
      page: "पृष्ठ",
      of: "का",
      evidenceFound: "साक्ष्य हाइलाइट किया गया",
      evidenceSearching: "साक्ष्य खोजा जा रहा है...",
      evidenceNotFound: "साक्ष्य अन्य पृष्ठ पर है",
      confidence: "सटीकता",
      mandatoryQco: "अनिवार्य बीआईएस क्यूसीओ",
      superseded: "अस्वीकृत / वापस लिया गया",
      active: "सक्रिय एवं मान्य",
      amendmentNeeded: "संशोधन आवश्यक",
    },
    tender: {
      title: "स्वचालित निविदा दस्तावेज़ विश्लेषक और स्प्लिट-स्क्रीन हाइलाइटर",
      description: "निविदाओं का विश्लेषण करें, रंग-कोडित वैधानिक प्रशस्तियों का निरीक्षण करें और सीवीसी ऑडिट जोखिम समाप्त करें।",
      dragDrop: "निविदा पीडीएफ दस्तावेज़ यहां क्लिक करें या खींचें",
      supports: "GeM, CPWD, NHAI और राज्य PWD पीडीएफ विनिर्देशों का समर्थन करता है",
      rawText: "कच्चा निविदा दस्तावेज़ पाठ",
      pastePlaceholder: "अपना संपूर्ण एनआईटी निविदा दस्तावेज़ यहां चिपकाएं...",
      extractButton: "निविदा मदों का निष्कर्षण और विश्लेषण करें",
      uploadPdfButton: "पीडीएफ निष्कर्षण और विश्लेषण करें",
      discoveredItems: "पहचाने गए विनिर्देश",
      totalClauses: "कुल खंड",
      cvcRiskTitle: "वैधानिक एवं सीवीसी ऑडिट जोखिम नोट्स",
    },
  },
};

export function getTranslation(lang: string, keyPath: string): string {
  const current = (translations as any)[lang] || translations.en;
  const parts = keyPath.split(".");
  let val = current;
  for (const p of parts) {
    if (val && typeof val === "object" && p in val) {
      val = val[p];
    } else {
      return keyPath;
    }
  }
  return typeof val === "string" ? val : keyPath;
}
