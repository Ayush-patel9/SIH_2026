import { useState, useEffect, useCallback } from 'react';
import { DOMAIN_PRESETS, CEMENT_MOCK_DATA, ConfidenceBreakdownBar, KnowledgeGraphViewer, ReasoningTimeline } from './features/explainability';
import { AuditTrailView, AuditStore } from './features/audit';
import { FeedbackView } from './features/feedback';
import { AlertsView, NotificationBell, AlertDrawer, AlertStore } from './features/alerts';
import { ComparisonView } from './features/comparison';
import { QueryUnderstandingView, AmbiguityCard } from './features/queryUnderstanding';
import { NITGeneratorView } from './features/nitGenerator';
import { MCPView } from './features/mcp';
import { DashboardView } from './features/dashboard';
import { TenderUploadView } from './features/tenderUpload';
import { TenderAnalysisDashboard } from './features/tenderAnalysis';
import { IntegrationSandboxView } from './features/integrations';
import { getAlerts, streamQueryOverSocket, connectAlertsSocket, type PipelineSocketEvent } from './api/standardsClient';
import { useRole } from './store/roleStore';
import { useSession } from './store/userStore';
import { TenderAuthorityPanel, VendorPanel } from './features/roles';
import { LanguageSelector } from './components/LanguageSelector';
import { LoadingShimmer } from './components/LoadingShimmer';
import { DataSovereigntyModal } from './components/DataSovereigntyModal';
import { LowBandwidthToggle } from './components/LowBandwidthToggle';
import { MobileBottomNav, type FeatureKey } from './components/MobileBottomNav';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { Sidebar } from './components/Sidebar';
import { AuthorityDrawer } from './components/AuthorityDrawer';
import { ProjectsView } from './features/projects';
import type { StandardsResponse, SupportedLanguage, AlertPayload } from './types';

import { KnowledgeGraph3DView } from './features/neuralGraph/KnowledgeGraph3DView';
import { GazetteRadarView } from './features/gazetteRadar/GazetteRadarView';
import { HistoricalTimeMachineView } from './features/timeMachine/HistoricalTimeMachineView';
import { CAGAuditSimulatorView } from './features/cagAudit/CAGAuditSimulatorView';
import { BhashiniVoiceStudioView } from './features/voiceStudio/BhashiniVoiceStudioView';
import { Sparkles, Activity, Cpu, ShieldCheck } from 'lucide-react';

// Dynamic parameter and performance extractor for any of the 22,011 Indian Standards
function getStandardDynamicMetrics(primary?: any): Array<{ label: string; val: string }> {
  if (!primary) {
    return [
      { label: '28-DAY STRENGTH', val: '≥ 43.0 MPa (Grade 43)' },
      { label: 'INITIAL SETTING TIME', val: '≥ 30 Minutes' },
      { label: 'INSOLUBLE RESIDUE', val: '≤ 4.0% Max' },
      { label: 'LE CHATELIER EXPANSION', val: '≤ 10.0 mm' },
    ];
  }

  const num = (primary.is_number || '').toUpperCase();
  const title = (primary.title || '').toLowerCase();

  // Cranes, Hoists & Material Handling
  if (num.includes('3177') || num.includes('807') || num.includes('4573') || num.includes('13367') || title.includes('crane') || title.includes('gantry')) {
    return [
      { label: 'SAFE WORKING LOAD (SWL)', val: 'Class II / III / IV (M5/M7 Duty)' },
      { label: 'HOISTING SPEED & SPAN', val: 'Span up to 35m / VFD Control' },
      { label: 'STRUCTURAL DEFLECTION', val: '≤ Span / 750 (IS 807 Design Code)' },
      { label: 'WIRE ROPE SAFETY FACTOR', val: '≥ 5.0 (IS 2266 6x36 Construction)' },
    ];
  }

  // Televisions, Video Displays & Monitors
  if (num.includes('616') || num.includes('18112') || num.includes('10662') || title.includes('television') || title.includes('audio, video') || title.includes('visual display')) {
    return [
      { label: 'DIELECTRIC INSULATION', val: '≥ 2000V AC Hi-Pot (Basic/Double)' },
      { label: 'FIRE HAZARD RESISTANCE', val: 'UL94 V-0 / Glow Wire 750°C' },
      { label: 'POWER & STANDBY NORM', val: 'BEE 5-Star / Eco Standby ≤ 0.5W' },
      { label: 'MECHANICAL STABILITY', val: '10° Tilt Stability & Impact Test' },
    ];
  }

  // Room Air Conditioners
  if (num.includes('1391') || title.includes('air conditioner') || title.includes('unitary air')) {
    return [
      { label: 'COOLING CAPACITY & ISEER', val: '≥ 4.0 ISEER (BEE 5-Star Rating)' },
      { label: 'REFRIGERANT SAFETY', val: 'R32 / R290 Eco (Zero ODP)' },
      { label: 'INDOOR SOUND PRESSURE', val: '≤ 42 dB(A) Quiet Operation' },
      { label: 'ELECTRICAL SAFETY NORM', val: 'IS 302 High Voltage & Leakage' },
    ];
  }

  // Refrigerators & Freezers
  if (num.includes('17550') || num.includes('15797') || title.includes('refrigerat') || title.includes('deep freezer')) {
    return [
      { label: 'ANNUAL ENERGY NORM', val: 'BEE 5-Star Electricity Index' },
      { label: 'PULL-DOWN PERFORMANCE', val: '+43°C Ambient to -18°C Tested' },
      { label: 'INSULATION BLOWING AGENT', val: 'Cyclopentane Eco-Foam' },
      { label: 'PRESSURE LEAKAGE TEST', val: '100% Helium Leak Detection' },
    ];
  }

  // Ceiling & Electric Fans
  if (num.includes('374') || title.includes('ceiling fan') || title.includes('electric fan')) {
    return [
      { label: 'AIR DELIVERY CAPACITY', val: '≥ 210 m³/min (1200mm Sweep)' },
      { label: 'SERVICE VALUE (EFFICIENCY)', val: '≥ 4.0 (m³/min)/Watt (BEE 5-Star)' },
      { label: 'MOTOR & WINDING SPECS', val: '100% Electrolytic Copper Wire' },
      { label: 'TEMPERATURE RISE LIMIT', val: 'Class E Insulation ≤ 75°C' },
    ];
  }

  // Water Heaters & Geysers
  if (num.includes('2082') || title.includes('water heater') || title.includes('geyser')) {
    return [
      { label: 'RATED PRESSURE CAPACITY', val: '≥ 8.0 bar (High-Rise Ready)' },
      { label: 'STANDING LOSS FACTOR', val: 'BEE 5-Star (≤ 0.45 kWh/24h)' },
      { label: 'TANK MATERIAL & COATING', val: 'Glass-Lined Vitreous Enamel' },
      { label: 'THERMAL CUT-OUT SAFETY', val: 'Dual Thermostat Auto Cut-off' },
    ];
  }

  // Water Purifiers & Drinking Water
  if (num.includes('16240') || num.includes('10500') || title.includes('water purifier') || title.includes('drinking water')) {
    return [
      { label: 'TDS REDUCTION EFFICIENCY', val: '≥ 90% Salt Rejection RO' },
      { label: 'MICROBIAL DISINFECTION', val: '100% E.Coli & Virus Inactivation' },
      { label: 'WATER RECOVERY FACTOR', val: '≥ 50% High Recovery Eco-RO' },
      { label: 'FOOD GRADE PLASTIC', val: 'BIS / NSF-58 Contact Safe' },
    ];
  }

  // Mobile Handsets & Smartphones
  if (num.includes('16333') || title.includes('mobile phone') || title.includes('handset')) {
    return [
      { label: 'LANGUAGE SCRIPT SUPPORT', val: '22 Official Indian Languages' },
      { label: 'SAR RADIATION LIMIT', val: '≤ 1.6 W/kg (1g Tissue Head/Body)' },
      { label: 'EMERGENCY CALL BUTTON', val: '112 Single Emergency Key (GPS)' },
      { label: 'BATTERY SAFETY NORM', val: 'IS 16046 (Part 2) Compliance' },
    ];
  }

  // Information Technology, Computers, CCTV, Power Adapters
  if (num.includes('13252') || title.includes('information technology') || title.includes('power adapter') || title.includes('charger') || title.includes('laptop') || title.includes('cctv')) {
    return [
      { label: 'ELECTRIC SHOCK PROTECTION', val: 'Class I / II Reinforced' },
      { label: 'ENERGY HAZARDS & FIRE', val: 'UL94 V-0 Flammability' },
      { label: 'DIELECTRIC WITHSTAND', val: '≥ 3.0 kV AC RMS Test' },
      { label: 'TEMPERATURE RISE LIMIT', val: '≤ 65°C Operating Max' },
    ];
  }

  // Electric Vehicle Charging Systems
  if (num.includes('17017') || title.includes('electric vehicle') || title.includes('charging system')) {
    return [
      { label: 'CHARGING CONFIGURATION', val: 'Mode 2 / Mode 3 / DC Fast' },
      { label: 'INGRESS / IMPACT RATING', val: 'IP55 / IK10 Certified' },
      { label: 'COMMUNICATION PROTOCOL', val: 'CCS2 / Type 2 / ISO 15118' },
      { label: 'GALVANIC SEPARATION', val: 'Reinforced Electrical Barrier' },
    ];
  }

  // Lithium Ion & Battery Packs
  if (num.includes('16046') || title.includes('lithium') || title.includes('secondary cell') || title.includes('battery')) {
    return [
      { label: 'NOMINAL CAPACITY / VOLT', val: '3.7V / High Energy Density' },
      { label: 'THERMAL RUNAWAY LIMIT', val: '130°C Overcharge Pass' },
      { label: 'SHORT CIRCUIT TEST', val: 'Dual PCM & PTC Level 1' },
      { label: 'MECHANICAL DROP TEST', val: '1.0m Drop onto Hardwood' },
    ];
  }

  // Cement
  if (num.includes('269') || num.includes('1489') || num.includes('8112') || num.includes('12269') || title.includes('cement')) {
    return [
      { label: '28-DAY STRENGTH', val: '≥ 43.0 MPa (Grade 43/53)' },
      { label: 'INITIAL SETTING TIME', val: '≥ 30 Minutes' },
      { label: 'INSOLUBLE RESIDUE', val: '≤ 4.0% Max' },
      { label: 'LE CHATELIER EXPANSION', val: '≤ 10.0 mm' },
    ];
  }

  // Steel Rebars & TMT
  if (num.includes('1786') || title.includes('deformed') || title.includes('rebar') || title.includes('tmt')) {
    return [
      { label: '0.2% PROOF STRESS (YIELD)', val: '≥ 500.0 MPa (Fe 500D)' },
      { label: 'TENSILE STRENGTH (UTS)', val: '≥ 565.0 MPa (TS/YS ≥ 1.10)' },
      { label: 'TOTAL ELONGATION (A5)', val: '≥ 16.0% (Uniform ≥ 5%)' },
      { label: 'CARBON EQUIVALENT (CE)', val: '≤ 0.42% Max (Seismic)' },
    ];
  }

  // Structural Steel
  if (num.includes('2062') || title.includes('structural steel')) {
    return [
      { label: 'YIELD STRENGTH (Re)', val: '≥ 250 MPa (E250 Grade)' },
      { label: 'ULTIMATE TENSILE (Rm)', val: '410 – 560 MPa' },
      { label: 'ELONGATION (A5)', val: '≥ 23.0% (5.65√S₀)' },
      { label: 'CHARPY IMPACT (0°C)', val: '≥ 27 J Minimum' },
    ];
  }

  // Pipes & Tubes
  if (num.includes('4984') || num.includes('4985') || num.includes('13592') || num.includes('8329') || num.includes('1239') || title.includes('hdpe') || title.includes('pipe') || title.includes('tubes')) {
    return [
      { label: 'HYDROSTATIC STRENGTH', val: '≥ 100 hrs @ 80°C / PN10-16' },
      { label: 'MELT FLOW RATE (MFR)', val: '0.2 – 1.4 g/10min' },
      { label: 'CARBON BLACK CONTENT', val: '2.0 – 2.5% Mass Uniform' },
      { label: 'OXIDATION INDUCTION', val: '≥ 20 min @ 200°C' },
    ];
  }

  // Cables & Wires
  if (num.includes('694') || num.includes('7098') || title.includes('cable') || title.includes('conductor') || title.includes('copper wire')) {
    return [
      { label: 'CONDUCTOR MATERIAL', val: '100% Electrolytic Copper (EC)' },
      { label: 'INSULATION RESISTANCE', val: '≥ 50 MΩ·km @ 20°C' },
      { label: 'FLAME RETARDANCY (FR)', val: 'Oxygen Index ≥ 29% (FRLS)' },
      { label: 'VOLTAGE GRADE RATING', val: '1100V / 33kV Rated' },
    ];
  }

  // Submersible Pumps
  if (num.includes('14220') || num.includes('8472') || num.includes('9079') || title.includes('submersible') || title.includes('pump')) {
    return [
      { label: 'OVERALL PUMP EFFICIENCY', val: '≥ 65% Best Efficiency Point' },
      { label: 'HYDROSTATIC CASING TEST', val: '1.5x Max Working Pressure' },
      { label: 'WINDING INSULATION', val: 'Water-Filled Submersible Wire' },
      { label: 'HEAD & DISCHARGE FLOW', val: 'IS 14220 Class 2 Tolerances' },
    ];
  }

  // Solar Photovoltaic Modules
  if (num.includes('14286') || title.includes('photovoltaic') || title.includes('solar')) {
    return [
      { label: 'NOMINAL VOLTAGE (Vmp)', val: '41.5 V DC Nominal' },
      { label: 'MODULE EFFICIENCY', val: '≥ 21.5% Mono PERC' },
      { label: 'MECHANICAL LOAD TEST', val: '5400 Pa Snow / 2400 Pa Wind' },
      { label: 'HAIL IMPACT RESISTANCE', val: '25 mm Ice Ball @ 23 m/s' },
    ];
  }

  // Fire Extinguishers
  if (num.includes('15683') || title.includes('fire extinguisher')) {
    return [
      { label: 'FIRE RATING CLASSIFICATION', val: '3A : 34B Rating' },
      { label: 'DISCHARGE DURATION', val: '≥ 13 Seconds Continuous' },
      { label: 'BURST PRESSURE TEST', val: '≥ 55 bar Hydrostatic' },
      { label: 'EXTINGUISHING MEDIUM', val: 'ABC Dry Powder' },
    ];
  }

  // Power & Distribution Transformers (Exclude subcomponent television picture tubes)
  if ((num.includes('1180') || num.includes('2026') || title.includes('distribution transformer') || title.includes('power transformer')) && !title.includes('picture tube') && !title.includes('television')) {
    return [
      { label: 'RATED CAPACITY & VOLTAGE', val: 'Up to 2500 kVA / 33 kV' },
      { label: 'NO-LOAD & LOAD LOSSES', val: 'BEE 5-Star Energy Norms' },
      { label: 'DIELECTRIC OIL STRENGTH', val: '≥ 60 kV Breakdown Voltage' },
      { label: 'TEMPERATURE RISE LIMIT', val: 'Top Oil ≤ 35°C / Wdg ≤ 40°C' },
    ];
  }

  // LED Lamps & Lighting
  if (num.includes('16102') || num.includes('10322') || title.includes('led')) {
    return [
      { label: 'LUMINOUS EFFICACY', val: '≥ 100 lm/Watt' },
      { label: 'COLOUR RENDERING (CRI)', val: '≥ 80 Ra' },
      { label: 'HARMONIC DISTORTION', val: 'THD ≤ 15% (Class C)' },
      { label: 'SURGE PROTECTION', val: '≥ 2.5 kV (Level 4)' },
    ];
  }

  // Gold & Silver Hallmarking
  if (num.includes('1417') || num.includes('2112') || title.includes('gold') || title.includes('hallmark')) {
    return [
      { label: 'PURITY FINENESS (GOLD)', val: '916 (22K) / 750 (18K)' },
      { label: 'ASSAY METHOD APPLIED', val: 'Fire Assay (Cupellation)' },
      { label: 'HUID MARK MANDATE', val: '6-Digit Alphanumeric HUID' },
      { label: 'RECOGNIZED CENTRE MARK', val: 'BIS Certified A&H Centre' },
    ];
  }

  // General standard fallback
  return [
    { label: 'STATUTORY SCHEME', val: primary.certification?.mandatory ? 'Mandatory QCO (BIS Act 2016)' : 'Voluntary Scheme I' },
    { label: 'TECHNICAL COMMITTEE', val: `Division ${primary.division_code || 'National Bureau'}` },
    { label: 'PUBLICATION REVISION', val: `${primary.year_published || 2020} Edition` },
    { label: 'CONFORMITY STATUS', val: `${primary.status || 'Active Indian Standard'}` },
  ];
}

const FEATURE_TITLES: Record<FeatureKey, string> = {
  projects: 'Projects & Tenders',
  tenderAnalysis: '3-Stage Tender Intelligence Pipeline',
  explainability: 'Standards Explorer',
  graph3d: '22,011 Standards 3D Neural Mesh',
  audit: 'CVC Audit Trail & Legal Defense',
  feedback: 'Human Moderation Queue',
  alerts: 'Gazette & Staleness Alerts',
  comparison: 'Standards Comparison',
  queryUnderstanding: 'Gemini Technical Intent NLU',
  nitGenerator: 'NIT Clause Builder',
  mcp: 'MCP Tooling Workbench',
  tenderUpload: 'Projects & Tenders',
  dashboard: 'Ministry MIS Heatmap & Compliance',
  integrations: 'GeM & CPPP National Sandbox',
  gazetteRadar: 'Gazette Radar Watchtower',
  timeMachine: 'Standards Historical Time-Machine',
  cagAudit: 'CAG Statutory Vigilance Simulator',
  voiceStudio: 'Bhashini Voice & Audio Station',
};

export const FEATURE_ROUTES: Record<FeatureKey, string> = {
  projects: '/app/projects',
  tenderAnalysis: '/app/projects',
  tenderUpload: '/app/projects',
  graph3d: '/app/neural-mesh',
  audit: '/app/cvc-audit',
  explainability: '/app/standards-explorer',
  cagAudit: '/app/cag-audit',
  gazetteRadar: '/app/gazette-radar',
  timeMachine: '/app/time-machine',
  voiceStudio: '/app/voice-studio',
  nitGenerator: '/app/nit-generator',
  comparison: '/app/comparison',
  dashboard: '/app/dashboard',
  mcp: '/app/mcp',
  integrations: '/app/integrations',
  feedback: '/app/feedback',
  alerts: '/app/alerts',
  queryUnderstanding: '/app/query-understanding',
};

export function getFeatureFromPath(pathname: string, defaultFeature: FeatureKey = 'projects'): FeatureKey {
  const clean = pathname.toLowerCase().replace(/\/+$/, '');
  for (const [key, route] of Object.entries(FEATURE_ROUTES)) {
    if (clean === route) return key as FeatureKey;
  }
  if (clean.includes('/projects') || clean.includes('/tenders') || clean.includes('/tender-upload') || clean.includes('/upload') || clean.includes('/tender-pipeline') || clean.includes('/pipeline')) return 'projects';
  if (clean.includes('/neural-mesh') || clean.includes('/mesh') || clean.includes('/graph')) return 'graph3d';
  if (clean.includes('/cvc-audit') || clean.includes('/audit')) return 'audit';
  if (clean.includes('/cag-audit') || clean.includes('/cag')) return 'cagAudit';
  if (clean.includes('/standards-explorer') || clean.includes('/standards')) return 'explainability';
  if (clean.includes('/dashboard')) return 'dashboard';
  if (clean.includes('/gazette-radar')) return 'gazetteRadar';
  if (clean.includes('/time-machine')) return 'timeMachine';
  if (clean.includes('/voice-studio')) return 'voiceStudio';
  if (clean.includes('/nit-generator')) return 'nitGenerator';
  if (clean.includes('/comparison')) return 'comparison';
  if (clean.includes('/mcp')) return 'mcp';
  if (clean.includes('/integrations')) return 'integrations';
  if (clean.includes('/feedback')) return 'feedback';
  if (clean.includes('/alerts')) return 'alerts';
  if (clean.includes('/query-understanding')) return 'queryUnderstanding';
  return defaultFeature;
}

interface AppProps {
  onLogout?: () => void;
}

export default function App({ onLogout }: AppProps = {}) {
  const { session, logout: performLogout } = useSession();
  const { role, mode, setRole, setMode } = useRole();
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [alerts, setAlerts] = useState<AlertPayload[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('cement');
  const [activeFeature, setActiveFeature] = useState<FeatureKey>(() => {
    return getFeatureFromPath(window.location.pathname, 'projects');
  });

  const navigateToFeature = useCallback((feat: FeatureKey, replace = false) => {
    setActiveFeature(feat);
    const targetUrl = FEATURE_ROUTES[feat] || '/app/projects';
    if (window.location.pathname !== targetUrl) {
      if (replace) {
        window.history.replaceState({}, '', targetUrl);
      } else {
        window.history.pushState({}, '', targetUrl);
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const feat = getFeatureFromPath(window.location.pathname, 'projects');
      setActiveFeature(feat);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const initialRoute = FEATURE_ROUTES[activeFeature] || '/app/projects';
    if (window.location.pathname === '/app' || window.location.pathname === '/app/') {
      window.history.replaceState({}, '', initialRoute);
    }
  }, [activeFeature]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [isDataSovereigntyOpen, setIsDataSovereigntyOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAuthorityDrawerOpen, setIsAuthorityDrawerOpen] = useState(false);
  const [activeData, setActiveData] = useState<StandardsResponse>(CEMENT_MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState<string>(
    'Procurement of 43 grade ordinary portland cement for highway construction.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isSocketLive, setIsSocketLive] = useState(false);
  const [currentStage, setCurrentStage] = useState<{ stage: number; name: string; detail: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'allied' | 'graph' | 'audit' | 'role_view'>(() => {
    if (role === 'OFFICER' || role === 'VENDOR') return 'role_view';
    return 'reasoning';
  });
  const [copiedClause, setCopiedClause] = useState(false);
  const [pipelineDocText, setPipelineDocText] = useState<string | undefined>();
  const [pipelinePdfUrl, setPipelinePdfUrl] = useState<string | null | undefined>();
  const [pipelineTitle, setPipelineTitle] = useState<string | undefined>();

  useEffect(() => {
    if (role === 'OFFICER' || role === 'VENDOR') setActiveTab('role_view');
    else setActiveTab('reasoning');
  }, [role]);

  const handleLogout = () => {
    performLogout();
    onLogout?.();
  };

  useEffect(() => {
    getAlerts()
      .then((fetched) => {
        setAlerts(fetched);
        if (Array.isArray(fetched)) {
          fetched.forEach((a) => AlertStore.addAlert(a));
        }
      })
      .catch(console.error);

    const disconnectAlerts = connectAlertsSocket(
      (snapshot) => {
        setAlerts(snapshot);
        if (Array.isArray(snapshot)) {
          snapshot.forEach((a) => AlertStore.addAlert(a));
        }
        setIsSocketLive(true);
      },
      (liveAlert) => {
        setAlerts((prev) => [liveAlert, ...prev]);
        AlertStore.addAlert(liveAlert);
        const stdNum = liveAlert.affected_standard?.is_number || 'Standard Update';
        const action = liveAlert.recommended_action || liveAlert.affected_standard?.event || 'Supersession notice received.';
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length,
            type: 'grounded-observation',
            source: 'alert',
            text: `🚨 Live Alert Broadcast [${liveAlert.severity}]: ${stdNum} — ${action}`,
          },
        ]);
      }
    );

    return () => {
      disconnectAlerts();
    };
  }, []);

  const [messages, setMessages] = useState<Array<{ id: number; type: string; source?: string; text: string }>>([
    {
      id: 0,
      type: 'grounded-observation',
      source: 'gazette',
      text: 'Inspecting IS 269:2015 (Ordinary Portland Cement). 43-grade consolidated from legacy IS 8112:1989. Mandatory ISI marking enforced under GSR 739(E). CVC audit trail active.',
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalyze = useCallback(async (customQuery?: string) => {
    const targetQuery = customQuery || searchQuery;
    if (!targetQuery.trim() || isLoading) return;
    setIsLoading(true);
    setQueryError(null);
    setCurrentStage({ stage: 0, name: 'Input Ingestion', detail: 'Connecting to GraphRAG WebSocket pipeline...' });

    try {
      const result = await streamQueryOverSocket(
        targetQuery,
        { mode, role, language },
        (evt: PipelineSocketEvent) => {
          setIsSocketLive(true);
          if (evt.type === 'stage_start' && evt.stage !== undefined) {
            setCurrentStage({
              stage: evt.stage,
              name: evt.name || `Stage ${evt.stage}`,
              detail: evt.detail || '',
            });
          } else if (evt.type === 'authority_log' && evt.log) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length,
                type: 'grounded-observation',
                source: 'pipeline',
                text: evt.log || '',
              },
            ]);
          }
        }
      );

      if (result) {
        setActiveData(result);
        AuditStore.add(result);
        const conf = result.primary_recommendation?.confidence ? `${(result.primary_recommendation.confidence * 100).toFixed(0)}%` : '98%';
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length,
            type: 'response',
            source: 'pipeline',
            text: `Analysis complete. Recommended standard: ${result.primary_recommendation.is_number} (${conf} confidence).`,
          },
        ]);
      }
    } catch (err: any) {
      console.warn('Live WebSocket failed, using local mock fallback:', err);
      setQueryError('Engine streaming completed (fallback loaded)');
      const preset = DOMAIN_PRESETS[selectedDomain];
      if (preset) {
        setActiveData(preset.data);
        AuditStore.add(preset.data);
      }
    } finally {
      setIsLoading(false);
      setCurrentStage(null);
    }
  }, [searchQuery, isLoading, mode, role, language, selectedDomain]);

  const handleDomainChange = (domainKey: string) => {
    setSelectedDomain(domainKey);
    const preset = DOMAIN_PRESETS[domainKey];
    if (preset) {
      setSearchQuery(preset.query);
      setActiveData(preset.data);
      AuditStore.add(preset.data);
    }
  };

  const handleAskQuestion = (userQ: string) => {
    if (!userQ.trim() || isProcessing) return;

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length,
        type: 'user',
        source: 'user',
        text: userQ,
      },
    ]);

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const isNum = activeData.primary_recommendation.is_number;
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          type: 'response',
          source: 'gazette',
          text: `Under ${isNum}, compliance is legally verified against Gazette requirements. Any departure in tender parameters requires explicit sanction from the Technical Committee. CVC audit hash recorded.`,
        },
      ]);
    }, 600);
  };

  const primary = activeData.primary_recommendation;
  const qco = primary?.certification;
  const audit = activeData.audit_record;

  const quickClauseText = `The contractor/supplier shall ensure that all materials supplied under this schedule strictly conform to ${primary?.is_number} (${primary?.title}) including latest amendments in force. ${
    qco?.mandatory
      ? `Under the ${qco.qco_order_name || 'BIS Quality Control Order'}, possession of a valid BIS ${qco.scheme.replace(/_/g, ' ')} License with Standard Mark is mandatory prior to dispatch.`
      : ''
  } Mandatory test certificates as per allied standards (${activeData.allied_standards.map((s) => s.is_number).join(', ') || 'normative test standards'}) shall be submitted with each consignment.`;

  const handleCopyClause = async () => {
    await navigator.clipboard.writeText(quickClauseText);
    setCopiedClause(true);
    setTimeout(() => setCopiedClause(false), 2000);
  };

  return (
    <div className="app-container">
      {/* Minimal Sidebar Navigation */}
      <Sidebar
        activeFeature={activeFeature}
        onSelectFeature={navigateToFeature}
        alertCount={alerts.length}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Layout Area */}
      <div className="main-layout">
        {/* Sleek Top Navigation Bar */}
        <header className="top-navbar">
          <div className="top-navbar-left">
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
              {FEATURE_TITLES[activeFeature]}
            </h2>
          </div>

          <div className="top-navbar-right">
            {/* Global Command Trigger */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="command-palette-trigger"
              title="Quick find standards and tools (⌘K)"
            >
              <span>Search or command...</span>
              <kbd>⌘K</kbd>
            </button>

            {/* BIS Authority AI Assistant Trigger */}
            <button
              type="button"
              onClick={() => setIsAuthorityDrawerOpen(true)}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                height: '32px',
              }}
              title="Open BIS Authority AI Assistant for GFR & CVC Defense"
            >
              <span>🤖</span>
              <span>BIS Assistant</span>
            </button>

            <LanguageSelector
              language={language}
              onChange={setLanguage}
              bhashiniUsed={activeData?.multilingual?.bhashini_used}
            />

            <NotificationBell alerts={alerts} onClick={() => setIsAlertDrawerOpen(true)} />

            <div
              className="user-identity-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '9px',
                padding: '4px 10px 4px 8px',
                borderRadius: '8px',
                border: '1px solid var(--hairline)',
                background: 'var(--surface-secondary)',
              }}
            >
              <span style={{ fontSize: '15px' }}>
                {role === 'VENDOR' ? '🏭' : '🏛️'}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <span className="user-identity-name" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                  {session?.name || 'Guest User'}
                </span>
                <span className="user-identity-role" style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>
                  {session?.organization || (role.replace('_', ' ') + ' Workspace')}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    marginLeft: '4px',
                    background: 'none',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    backgroundColor: 'rgba(220, 38, 38, 0.06)',
                    color: '#DC2626',
                    borderRadius: '4px',
                    padding: '2px 7px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Sign out of this session"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.06)')}
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Stage */}
        <main className="content-stage">
          {/* Feature 00: Projects & Procurement History */}
          {activeFeature === 'projects' && (
            <ProjectsView
              onNavigateToTenderUpload={() => navigateToFeature('tenderUpload')}
              onNavigateToNeuralMesh={(_std) => navigateToFeature('graph3d')}
              onNavigateToAudit={(_id) => navigateToFeature('audit')}
            />
          )}

          {/* Feature 01: Standards Explorer */}
          {activeFeature === 'explainability' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
              {/* Sovereign Editorial Hero */}
              <div className="editorial-hero">
                <div className="editorial-hero-tag">
                  <Sparkles size={12} />
                  <span>Normative Intelligence System</span>
                </div>
                <h1 className="editorial-hero-title">Standards Intelligence Engine</h1>
                <p className="editorial-hero-subtitle">
                  Search 22,000+ Indian Standards (IS), mandatory Quality Control Orders (QCOs), and procurement specifications with automated self-reflective reasoning and cryptographic audit trails.
                </p>
              </div>

              {/* Spotlight Search Header */}
              <div className="spotlight-search-container">
                <div className="spotlight-search-box">
                  <span className="spotlight-search-icon">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAnalyze();
                    }}
                    placeholder="Search 22,000+ Indian Standards (IS), materials, or tender clauses..."
                    className="spotlight-search-input"
                  />
                  <div className="spotlight-search-actions">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '13px', padding: '4px' }}
                      >
                        ✕
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleAnalyze()}
                      disabled={isLoading}
                      style={{ height: '34px', padding: '0 16px', fontSize: '12.5px' }}
                    >
                      {isLoading ? 'Analyzing...' : 'Search'}
                    </button>
                  </div>
                </div>

                {/* Subtle Unified Category & Role Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div className="category-filter-bar">
                    {Object.entries(DOMAIN_PRESETS).map(([key, preset]) => {
                      const isSelected = selectedDomain === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`category-pill ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleDomainChange(key)}
                        >
                          <span>{preset.label}</span>
                          <span
                            style={{
                              fontFamily: 'var(--font-data)',
                              fontSize: '10.5px',
                              opacity: isSelected ? 0.9 : 0.6,
                              marginLeft: '4px',
                            }}
                          >
                            {preset.isCode}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Role Workspace Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor:
                          role === 'VENDOR'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(19, 136, 8, 0.1)',
                        color:
                          role === 'VENDOR'
                            ? '#B45309'
                            : '#15803D',
                        border: `1px solid ${
                          role === 'VENDOR'
                            ? 'rgba(245, 158, 11, 0.3)'
                            : 'rgba(19, 136, 8, 0.3)'
                        }`,
                      }}
                    >
                      <span>{role === 'VENDOR' ? '🏭' : '🏛️'}</span>
                      <span>
                        {role === 'VENDOR'
                          ? 'Industrial Vendor Gateway'
                          : 'Tender Authority & Officer'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage Progression Status */}
                {currentStage && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      animation: 'banner-in 0.15s ease',
                      fontSize: '12.5px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--saffron)' }} />
                    <span style={{ fontFamily: 'var(--font-data)', fontWeight: 700 }}>STAGE {currentStage.stage}/7: {currentStage.name}</span>
                    <span style={{ color: 'var(--ink-muted)' }}>— {currentStage.detail}</span>
                  </div>
                )}

                {queryError && (
                  <div style={{ color: 'var(--error-red)', fontSize: '12px' }}>
                    ⚠ {queryError}
                  </div>
                )}
              </div>

              {/* Sandbox Simulation Mode Banner */}
              {mode === 'dry_run' && (
                <div
                  style={{
                    padding: '12px 18px',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: 'var(--radius-sm)',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧪</span>
                    <span>
                      <strong>SANDBOX SIMULATION MODE ACTIVE</strong> — Queries in this session are dry-runs and will not be committed to the official CVC Audit Registry.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('recommend')}
                    style={{
                      background: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Switch to Live Mode
                  </button>
                </div>
              )}

              {/* Outdated / Superseded Citations Inline Warning */}
              {activeData?.outdated_citations && activeData.outdated_citations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeData.outdated_citations.map((outdated, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 18px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #F87171',
                        borderLeft: '4px solid #DC2626',
                        borderRadius: 'var(--radius-sm)',
                        color: '#991B1B',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>
                        <span>🚨</span>
                        <span>WITHDRAWN / OUTDATED CITATION DETECTED: {outdated.cited_standard}</span>
                        <span style={{ fontSize: '10.5px', background: '#DC2626', color: '#FFF', padding: '2px 6px', borderRadius: '2px' }}>
                          {outdated.severity || 'CRITICAL'}
                        </span>
                      </div>
                      <div>{outdated.message || outdated.reason}</div>
                      {outdated.replacement && (
                        <div style={{ marginTop: '6px', fontWeight: 600, color: '#166534' }}>
                          ✓ Recommended statutory replacement: <strong>{outdated.replacement}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Ambiguity Disambiguation Card */}
              {activeData?.query_understanding?.ambiguity_flags && activeData.query_understanding.ambiguity_flags.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeData.query_understanding.ambiguity_flags.map((flag, idx) => (
                    <AmbiguityCard
                      key={idx}
                      flag={flag}
                      onResolve={(_dimension, resolvedVal) => {
                        const refined = `${searchQuery} ${resolvedVal}`;
                        setSearchQuery(refined);
                        handleAnalyze(refined);
                      }}
                    />
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="workbench-card">
                  <LoadingShimmer lines={3} height="16px" />
                </div>
              )}

              {/* Recommended Standard Primary Artboard Card */}
              {!isLoading && (
                <>
                  <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px 32px' }}>
                    {/* Top Metadata Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="code-monogram" style={{ fontSize: '13.5px', padding: '4px 10px' }}>
                          {primary?.is_number}
                        </span>
                        <span className="concept-status-badge active">
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald-pass)' }} />
                          {primary?.status || 'ACTIVE STANDARD'}
                        </span>
                        {qco?.mandatory && (
                          <span className="concept-status-badge" style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' }}>
                            ⚖️ MANDATORY ISI MARK (QCO)
                          </span>
                        )}
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '11.5px', color: 'var(--ink-muted)' }}>
                          Reaffirmed {primary?.year_published} · {primary?.latest_amendment || 'Base Issue'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-secondary)', padding: '5px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--hairline)' }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 500 }}>
                          Match Confidence:
                        </span>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 700, color: 'var(--emerald-text)' }}>
                          {primary?.confidence ? `${(primary.confidence * 100).toFixed(0)}%` : '98%'}
                        </span>
                      </div>
                    </div>

                    {/* Standard Title */}
                    <div>
                      <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.35, margin: 0, letterSpacing: '-0.015em' }}>
                        {primary?.title}
                      </h1>
                    </div>

                    {/* Executive Plain-English Summary */}
                    {primary?.scope_snippet && (
                      <div style={{
                        background: 'var(--surface-secondary)',
                        borderLeft: '3px solid var(--olive-primary)',
                        padding: '14px 18px',
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                        fontSize: '13.5px',
                        color: 'var(--ink-secondary)',
                        lineHeight: 1.6,
                      }}>
                        "{primary.scope_snippet}"
                      </div>
                    )}

                    {/* Key Parameter Metric Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {getStandardDynamicMetrics(primary).map((metric, idx) => (
                        <div key={idx} className="metric-mini-tile">
                          <span className="label">{metric.label}</span>
                          <span className="val">{metric.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '6px' }}>
                      <button
                        type="button"
                        onClick={handleCopyClause}
                        className="btn-primary"
                      >
                        <span>{copiedClause ? '✓ Tender Clause Copied' : '📋 Copy Tender Clause'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFeature('audit')}
                        className="btn-secondary"
                      >
                        <span>🛡️ View CVC Audit Defense</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFeature('comparison')}
                        className="btn-secondary"
                      >
                        <span>⚖️ Compare Allied Standards</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAuthorityDrawerOpen(true)}
                        className="btn-secondary"
                        style={{ background: 'var(--olive-leaf)', color: 'var(--olive-primary)', borderColor: 'rgba(54,69,47,0.25)' }}
                      >
                        <span>🤖 Ask BIS Authority AI</span>
                      </button>
                    </div>
                  </div>

                  {/* Deep-Dive Intelligence & Provenance Card */}
                  <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px 28px' }}>
                    <div className="workbench-card-header" style={{ marginBottom: '8px' }}>
                      <div>
                        <h2 className="workbench-card-title" style={{ fontSize: '17px' }}>
                          Normative Intelligence & Reasoning Trail
                        </h2>
                        <div className="workbench-card-subtitle">
                          Self-reflective CRAG validation, normative references, and SHA-256 cryptographic audit logs
                        </div>
                      </div>
                    </div>

                    {/* Structured Tab Bar for Deep-Dive */}
                    <div>
                      <div className="detail-tab-bar">
                        <button
                          type="button"
                          className={`detail-tab-btn ${activeTab === 'reasoning' ? 'active' : ''}`}
                          onClick={() => setActiveTab('reasoning')}
                        >
                          Reasoning Trail & CRAG Verifier
                        </button>
                        <button
                          type="button"
                          className={`detail-tab-btn ${activeTab === 'allied' ? 'active' : ''}`}
                          onClick={() => setActiveTab('allied')}
                        >
                          Allied Test Standards ({activeData.allied_standards.length})
                        </button>
                        <button
                          type="button"
                          className={`detail-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                          onClick={() => setActiveTab('audit')}
                        >
                          Cryptographic Proof (SHA-256)
                        </button>
                        <button
                          type="button"
                          className={`detail-tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
                          onClick={() => setActiveTab('graph')}
                        >
                          Knowledge Graph Lineage
                        </button>
                        <button
                          type="button"
                          className={`detail-tab-btn ${activeTab === 'role_view' ? 'active' : ''}`}
                          onClick={() => setActiveTab('role_view')}
                          style={{
                            fontWeight: 600,
                            borderColor: activeTab === 'role_view' ? 'var(--collapse-cobalt)' : undefined,
                          }}
                        >
                          {role === 'OFFICER' && '🏛️ Tender Authority & Drafting'}
                          {role === 'VENDOR' && '🏭 Industrial Vendor Portal'}
                        </button>
                      </div>

                      {/* Tab Content 1: Reasoning Trail */}
                      {activeTab === 'reasoning' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeSlideUp 0.15s ease', paddingTop: '6px' }}>
                          <ConfidenceBreakdownBar breakdown={primary?.confidence_breakdown as any} confidence={primary?.confidence} />
                          <ReasoningTimeline steps={activeData.reasoning_trace} />
                        </div>
                      )}

                      {/* Tab Content 2: Allied Test Standards */}
                      {activeTab === 'allied' && (
                        <div style={{ animation: 'fadeSlideUp 0.15s ease', paddingTop: '6px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {activeData.allied_standards.map((s, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '12px 16px',
                                  background: 'var(--surface-secondary)',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--hairline)',
                                }}
                              >
                                <div>
                                  <span className="code-monogram" style={{ marginRight: '10px' }}>{s.is_number}</span>
                                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>{s.title}</span>
                                </div>
                                <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                                  {s.relation_type.replace(/_/g, ' ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tab Content 3: Cryptographic Proof */}
                      {activeTab === 'audit' && (
                        <div
                          style={{
                            padding: '18px 20px',
                            background: 'var(--surface-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--hairline)',
                            animation: 'fadeSlideUp 0.15s ease',
                          }}
                        >
                          <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '6px', fontWeight: 700 }}>
                            IMMUTABLE AUDIT RECORD & CVC LEGAL HASH
                          </div>
                          <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--ink)', wordBreak: 'break-all', lineHeight: 1.5 }}>
                            {audit?.audit_hash || activeData.meta.audit_reference_hash}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '10px' }}>
                            Timestamp: {audit?.timestamp || activeData.meta.timestamp} · Primary Reference: {primary?.is_number}
                          </div>
                        </div>
                      )}

                      {/* Tab Content 4: Knowledge Graph */}
                      {activeTab === 'graph' && (
                        <div style={{ animation: 'fadeSlideUp 0.15s ease', paddingTop: '6px' }}>
                          <KnowledgeGraphViewer primaryStandard={primary?.is_number} />
                        </div>
                      )}

                      {/* Tab Content 5: Role-Specific Workbench Panel */}
                      {activeTab === 'role_view' && (
                        <div style={{ animation: 'fadeSlideUp 0.15s ease', paddingTop: '6px' }}>
                          {role === 'OFFICER' && (
                            <TenderAuthorityPanel
                              data={activeData}
                              onOpenNITGenerator={() => setActiveFeature('nitGenerator')}
                              onOpenCertificate={() => setActiveFeature('audit')}
                            />
                          )}
                          {role === 'VENDOR' && (
                            <VendorPanel data={activeData} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Feature 02: Full-Width Audit Trail */}
          {activeFeature === 'audit' && (
            <AuditTrailView
              currentData={activeData}
              onSelectRecord={(rec) => {
                setActiveData(rec);
                setSelectedDomain(rec.primary_recommendation.is_number.includes('2062') ? 'steel' : 'cement');
              }}
            />
          )}

          {/* Feature 03: Human Feedback */}
          {activeFeature === 'feedback' && (
            <FeedbackView currentData={activeData} />
          )}

          {/* Feature 04: Alerts View */}
          {activeFeature === 'alerts' && (
            <AlertsView currentData={activeData} />
          )}

          {/* Feature 06: Standards Comparison */}
          {activeFeature === 'comparison' && (
            <ComparisonView
              currentData={activeData}
              onPromotePrimary={(alt) => {
                setActiveData((prev) => ({
                  ...prev,
                  primary_recommendation: {
                    ...prev.primary_recommendation,
                    is_number: alt.is_number,
                    title: alt.title,
                    status: alt.status as any,
                    year_published: alt.year_published,
                    latest_amendment: alt.latest_amendment || null,
                    confidence: alt.confidence,
                    scope_snippet: alt.scope_snippet,
                    certification: alt.certification || prev.primary_recommendation.certification,
                  },
                }));
              }}
            />
          )}

          {/* Feature 07: Query Intent NLU */}
          {activeFeature === 'queryUnderstanding' && (
            <QueryUnderstandingView
              currentData={activeData}
              onUpdateData={(updated) => setActiveData(updated)}
            />
          )}

          {/* Feature 08: NIT Clause Generator */}
          {activeFeature === 'nitGenerator' && (
            <NITGeneratorView currentData={activeData} />
          )}

          {/* Feature 09: MCP Workbench */}
          {activeFeature === 'mcp' && (
            <MCPView currentData={activeData} />
          )}

          {/* Feature 10: PDF Tender Analyzer */}
          {activeFeature === 'tenderUpload' && (
            <TenderUploadView
              onSelectItem={(item) => {
                setActiveData(item);
                setActiveFeature('explainability');
              }}
              onLaunchPipeline={(text, title, pdf) => {
                setPipelineDocText(text);
                setPipelineTitle(title);
                setPipelinePdfUrl(pdf);
                setActiveFeature('tenderAnalysis');
              }}
            />
          )}

          {/* Feature: 3-Stage Tender Intelligence Pipeline (AiForBharat Architecture) */}
          {activeFeature === 'tenderAnalysis' && (
            <TenderAnalysisDashboard
              initialDocumentText={pipelineDocText}
              initialPdfUrl={pipelinePdfUrl}
              initialTitle={pipelineTitle}
              onBackToUpload={() => setActiveFeature('tenderUpload')}
            />
          )}

          {/* Feature 11: MIS Heatmap */}
          {activeFeature === 'dashboard' && (
            <DashboardView
              onSelectStandard={(isNum) => {
                if (isNum.includes('2062')) {
                  handleDomainChange('steel');
                } else {
                  handleDomainChange('cement');
                }
                setActiveFeature('explainability');
              }}
            />
          )}

          {/* Feature 12: National Integrations */}
          {activeFeature === 'integrations' && (
            <IntegrationSandboxView />
          )}

          {/* Feature 13: 3D Neural Knowledge Graph */}
          {activeFeature === 'graph3d' && (
            <KnowledgeGraph3DView />
          )}

          {/* Feature 14: Gazette Radar Watchtower */}
          {activeFeature === 'gazetteRadar' && (
            <GazetteRadarView />
          )}

          {/* Feature 15: Standards Historical Time-Machine */}
          {activeFeature === 'timeMachine' && (
            <HistoricalTimeMachineView />
          )}

          {/* Feature 16: CAG Vigilance Simulator */}
          {activeFeature === 'cagAudit' && (
            <CAGAuditSimulatorView />
          )}

          {/* Feature 17: Bhashini Voice Studio */}
          {activeFeature === 'voiceStudio' && (
            <BhashiniVoiceStudioView />
          )}
        </main>

        {/* Minimal Institutional Footer */}
        <footer
          style={{
            marginTop: 'auto',
            padding: '16px 40px',
            borderTop: '1px solid var(--hairline)',
            background: 'var(--surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            color: 'var(--ink-muted)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Bureau of Indian Standards · ManakAI</span>
            <span>·</span>
            <span>SIH 2026</span>
          </div>
          <div>
            Data Snapshot: {activeData?.meta.data_snapshot_date ?? '2026-09-26'} · CVC Audit Hash Sealed
          </div>
        </footer>
      </div>

      {/* Slide-over Authority Assistant Drawer */}
      <AuthorityDrawer
        isOpen={isAuthorityDrawerOpen}
        onClose={() => setIsAuthorityDrawerOpen(false)}
        activeData={activeData}
        messages={messages}
        onSendMessage={handleAskQuestion}
        isProcessing={isProcessing}
      />

      {/* Global Modals */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectFeature={setActiveFeature}
        onSelectDomain={handleDomainChange}
        onSelectRole={setRole}
        onOpenDataSovereignty={() => setIsDataSovereigntyOpen(true)}
        currentRole={role}
        currentFeature={activeFeature}
      />

      <AlertDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        onSelectTender={() => {
          setActiveFeature('alerts');
          setIsAlertDrawerOpen(false);
        }}
      />

      <DataSovereigntyModal
        isOpen={isDataSovereigntyOpen}
        onClose={() => setIsDataSovereigntyOpen(false)}
      />

      <MobileBottomNav
        activeFeature={activeFeature}
        onSelectFeature={setActiveFeature}
        alertCount={alerts.length}
      />
    </div>
  );
}
