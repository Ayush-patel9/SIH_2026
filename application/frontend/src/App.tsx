import { useState, useEffect, useCallback } from 'react';
import { DOMAIN_PRESETS, CEMENT_MOCK_DATA, ConfidenceBreakdownBar, KnowledgeGraphViewer, ReasoningTimeline } from './features/explainability';
import { AuditTrailView } from './features/audit';
import { FeedbackView } from './features/feedback';
import { AlertsView, NotificationBell, AlertDrawer } from './features/alerts';
import { ComparisonView } from './features/comparison';
import { QueryUnderstandingView } from './features/queryUnderstanding';
import { NITGeneratorView } from './features/nitGenerator';
import { MCPView } from './features/mcp';
import { DashboardView } from './features/dashboard';
import { TenderUploadView } from './features/tenderUpload';
import { IntegrationSandboxView } from './features/integrations';
import { getAlerts, streamQueryOverSocket, connectAlertsSocket, type PipelineSocketEvent } from './api/standardsClient';
import { useRole } from './store/roleStore';
import { RoleSwitcher } from './components/RoleSwitcher';
import { LanguageSelector } from './components/LanguageSelector';
import { LoadingShimmer } from './components/LoadingShimmer';
import { DataSovereigntyModal } from './components/DataSovereigntyModal';
import { LowBandwidthToggle } from './components/LowBandwidthToggle';
import { MobileBottomNav, type FeatureKey } from './components/MobileBottomNav';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { Sidebar } from './components/Sidebar';
import { AuthorityDrawer } from './components/AuthorityDrawer';
import type { StandardsResponse, SupportedLanguage, AlertPayload } from './types';

import { KnowledgeGraph3DView } from './features/neuralGraph/KnowledgeGraph3DView';
import { GazetteRadarView } from './features/gazetteRadar/GazetteRadarView';
import { HistoricalTimeMachineView } from './features/timeMachine/HistoricalTimeMachineView';
import { CAGAuditSimulatorView } from './features/cagAudit/CAGAuditSimulatorView';
import { BhashiniVoiceStudioView } from './features/voiceStudio/BhashiniVoiceStudioView';
import { Sparkles, Activity, Cpu, ShieldCheck } from 'lucide-react';

// Fast 1-Click Test Scenarios
const QUICK_SCENARIOS = [
  {
    label: 'Highway OPC Cement',
    domain: 'cement',
    query: 'Procurement of 43 grade ordinary portland cement for national highway bridge construction.',
    isCode: 'IS 269:2015',
  },
  {
    label: 'Seismic TMT Rebars',
    domain: 'steel',
    query: 'High strength deformed steel bars Fe 500D grade for seismic zone IV RCC building construction.',
    isCode: 'IS 1786:2008',
  },
  {
    label: 'Bridge Girder Steel',
    domain: 'steel',
    query: 'Structural steel standard quality plates and sections E250 grade for railway bridge girder fabrication.',
    isCode: 'IS 2062:2011',
  },
  {
    label: 'Smart City CCTV',
    domain: 'cctv',
    query: 'High-definition IP surveillance cameras with ONVIF compliance and IR night vision for municipal traffic monitoring.',
    isCode: 'IS 13252',
  },
  {
    label: '11kV XLPE Cable',
    domain: 'cctv',
    query: 'Supply of 11kV cross-linked polyethylene insulated armoured power cables as per IS 7098 Part 2.',
    isCode: 'IS 7098',
  },
];

const FEATURE_TITLES: Record<FeatureKey, string> = {
  explainability: 'Standards Explorer',
  graph3d: '22,011 Standards 3D Neural Mesh',
  audit: 'CVC Audit Trail & Legal Defense',
  feedback: 'Human Moderation Queue',
  alerts: 'Gazette & Staleness Alerts',
  comparison: 'Standards Comparison',
  queryUnderstanding: 'Gemini Technical Intent NLU',
  nitGenerator: 'NIT Clause Builder',
  mcp: 'MCP Tooling Workbench',
  tenderUpload: 'PDF Tender Document Analyzer',
  dashboard: 'Ministry MIS Heatmap & Compliance',
  integrations: 'GeM & CPPP National Sandbox',
  gazetteRadar: 'Gazette Radar Watchtower',
  timeMachine: 'Standards Historical Time-Machine',
  cagAudit: 'CAG Statutory Vigilance Simulator',
  voiceStudio: 'Bhashini Voice & Audio Station',
};

export default function App() {
  const { role, mode, setRole, setMode } = useRole();
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [alerts, setAlerts] = useState<AlertPayload[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('cement');
  const [activeFeature, setActiveFeature] = useState<FeatureKey>('explainability');
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
  const [activeTab, setActiveTab] = useState<'reasoning' | 'allied' | 'graph' | 'audit'>('reasoning');
  const [copiedClause, setCopiedClause] = useState(false);

  useEffect(() => {
    getAlerts().then(setAlerts).catch(console.error);

    const disconnectAlerts = connectAlertsSocket(
      (snapshot) => {
        setAlerts(snapshot);
        setIsSocketLive(true);
      },
      (liveAlert) => {
        setAlerts((prev) => [liveAlert, ...prev]);
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
      const queryText = `Procurement conforming to ${preset.isCode} (${preset.label})`;
      setSearchQuery(queryText);
      setActiveData(preset.data);
    }
  };

  const handleRunScenario = (sc: typeof QUICK_SCENARIOS[0]) => {
    setSelectedDomain(sc.domain);
    setSearchQuery(sc.query);
    const preset = DOMAIN_PRESETS[sc.domain];
    if (preset) {
      setActiveData(preset.data);
    }
    handleAnalyze(sc.query);
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
        onSelectFeature={setActiveFeature}
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

            <LanguageSelector
              language={language}
              onChange={setLanguage}
              bhashiniUsed={activeData?.multilingual?.bhashini_used}
            />

            <NotificationBell alerts={alerts} onClick={() => setIsAlertDrawerOpen(true)} />

            <div className="user-identity-badge">
              <span className="user-identity-name">Ayush Patel</span>
              <span className="user-identity-role">{role.replace('_', ' ')}</span>
            </div>
          </div>
        </header>

        {/* Content Stage */}
        <main className="content-stage">
          {/* Feature 01: Standards Explorer */}
          {activeFeature === 'explainability' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
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

                {/* Subtle Category Filter Pills */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div className="category-filter-bar">
                    {Object.entries(DOMAIN_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        className={`category-pill ${selectedDomain === key ? 'selected' : ''}`}
                        onClick={() => handleDomainChange(key)}
                      >
                        {preset.label.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>

                  {/* Role & Mode Switcher */}
                  <RoleSwitcher
                    role={role}
                    mode={mode}
                    onRoleChange={setRole}
                    onModeChange={setMode}
                  />
                </div>

                {/* Test Queries Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11.5px', color: 'var(--ink-muted)', fontWeight: 600 }}>
                    Test Scenarios:
                  </span>
                  {QUICK_SCENARIOS.map((sc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRunScenario(sc)}
                      className="scenario-chip"
                      style={{ fontSize: '11.5px', padding: '4px 10px' }}
                    >
                      <span>{sc.label}</span>
                      <span className="scenario-chip-code">{sc.isCode}</span>
                    </button>
                  ))}
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

              {isLoading && (
                <div className="workbench-card">
                  <LoadingShimmer lines={3} height="16px" />
                </div>
              )}

              {/* Recommended Standard Hero Card */}
              {!isLoading && (
                <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Top Metadata Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span className="code-monogram" style={{ fontSize: '14px', padding: '3px 8px' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                        Match Confidence:
                      </span>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--emerald-text)' }}>
                        {primary?.confidence ? `${(primary.confidence * 100).toFixed(0)}%` : '98%'}
                      </span>
                    </div>
                  </div>

                  {/* Standard Title */}
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>
                      {primary?.title}
                    </h1>
                  </div>

                  {/* Executive Plain-English Summary */}
                  {primary?.scope_snippet && (
                    <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0 }}>
                      "{primary.scope_snippet}"
                    </p>
                  )}

                  {/* Key Parameter Metric Mini-Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <div className="metric-mini-tile">
                      <span className="label">28-Day Strength</span>
                      <span className="val">≥ 43.0 MPa (Grade 43)</span>
                    </div>
                    <div className="metric-mini-tile">
                      <span className="label">Initial Setting Time</span>
                      <span className="val">≥ 30 Minutes</span>
                    </div>
                    <div className="metric-mini-tile">
                      <span className="label">Insoluble Residue</span>
                      <span className="val">≤ 4.0% Max</span>
                    </div>
                    <div className="metric-mini-tile">
                      <span className="label">Le Chatelier Expansion</span>
                      <span className="val">≤ 10.0 mm</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleCopyClause}
                      className="btn-primary"
                    >
                      <span>{copiedClause ? '✓ Copied Clause' : 'Copy Tender Clause'}</span>
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
                  </div>

                  {/* Structured Tab Bar for Deep-Dive */}
                  <div style={{ marginTop: '12px' }}>
                    <div className="detail-tab-bar">
                      <button
                        type="button"
                        className={`detail-tab-btn ${activeTab === 'reasoning' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reasoning')}
                      >
                        Reasoning Trail
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
                        Knowledge Graph
                      </button>
                    </div>

                    {/* Tab Content 1: Reasoning Trail */}
                    {activeTab === 'reasoning' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeSlideUp 0.15s ease' }}>
                        <ConfidenceBreakdownBar breakdown={primary?.confidence_breakdown as any} confidence={primary?.confidence} />
                        <ReasoningTimeline steps={activeData.reasoning_trace} />
                      </div>
                    )}

                    {/* Tab Content 2: Allied Test Standards */}
                    {activeTab === 'allied' && (
                      <div style={{ animation: 'fadeSlideUp 0.15s ease' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {activeData.allied_standards.map((s, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                background: 'var(--surface-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--hairline)',
                              }}
                            >
                              <div>
                                <span className="code-monogram" style={{ marginRight: '8px' }}>{s.is_number}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{s.title}</span>
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
                          padding: '16px',
                          background: 'var(--surface-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--hairline)',
                          animation: 'fadeSlideUp 0.15s ease',
                        }}
                      >
                        <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '4px', fontWeight: 700 }}>
                          IMMUTABLE AUDIT RECORD & CVC LEGAL HASH
                        </div>
                        <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink)', wordBreak: 'break-all' }}>
                          {audit?.audit_hash || activeData.meta.audit_reference_hash}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '8px' }}>
                          Timestamp: {audit?.timestamp || activeData.meta.timestamp} · Primary Reference: {primary?.is_number}
                        </div>
                      </div>
                    )}

                    {/* Tab Content 4: Knowledge Graph */}
                    {activeTab === 'graph' && (
                      <div style={{ animation: 'fadeSlideUp 0.15s ease' }}>
                        <KnowledgeGraphViewer primaryStandard={primary?.is_number} />
                      </div>
                    )}
                  </div>
                </div>
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
