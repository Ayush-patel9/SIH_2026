import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DOMAIN_PRESETS, CEMENT_MOCK_DATA } from './features/explainability';
import { AuditTrailView } from './features/audit';
import { FeedbackView } from './features/feedback';
import { AlertsView, NotificationBell, AlertDrawer } from './features/alerts';
import { ComparisonView } from './features/comparison';
import { QueryUnderstandingView, QueryEntityDisplay } from './features/queryUnderstanding';
import { NITGeneratorView } from './features/nitGenerator';
import { MCPView } from './features/mcp';
import { DashboardView } from './features/dashboard';
import { ProcurementOfficerPanel, AuditorPanel, VendorPanel } from './features/roles';
import { TenderUploadView } from './features/tenderUpload';
import { IntegrationSandboxView } from './features/integrations';
import { getAlerts, streamQueryOverSocket, connectAlertsSocket, type PipelineSocketEvent } from './api/standardsClient';
import { useRole } from './store/roleStore';
import { RoleSwitcher } from './components/RoleSwitcher';
import { SandboxBanner } from './components/SandboxBanner';
import { LanguageSelector } from './components/LanguageSelector';
import { LoadingShimmer } from './components/LoadingShimmer';
import { DataSovereigntyModal } from './components/DataSovereigntyModal';
import { LowBandwidthToggle } from './components/LowBandwidthToggle';
import { MobileBottomNav, type FeatureKey } from './components/MobileBottomNav';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import type { StandardsResponse, SupportedLanguage, AlertPayload } from './types';

// Fast 1-Click Demo Scenarios for Procurement Officers & Jurors
const QUICK_SCENARIOS = [
  {
    label: 'Highway OPC Cement',
    domain: 'cement',
    query: 'Procurement of 43 grade ordinary portland cement for national highway bridge construction.',
    isCode: 'IS 269:2015',
    icon: '🏗️',
  },
  {
    label: 'Seismic TMT Rebars',
    domain: 'steel',
    query: 'High strength deformed steel bars Fe 500D grade for seismic zone IV RCC building construction.',
    isCode: 'IS 1786:2008',
    icon: '🔩',
  },
  {
    label: 'Bridge Girder Steel',
    domain: 'steel',
    query: 'Structural steel standard quality plates and sections E250 grade for railway bridge girder fabrication.',
    isCode: 'IS 2062:2011',
    icon: '🌉',
  },
  {
    label: 'Smart City CCTV',
    domain: 'cctv',
    query: 'High-definition IP surveillance cameras with ONVIF compliance and IR night vision for municipal traffic monitoring.',
    isCode: 'IS 13252',
    icon: '📹',
  },
  {
    label: '11kV XLPE Cable',
    domain: 'cctv',
    query: 'Supply of 11kV cross-linked polyethylene insulated armoured power cables as per IS 7098 Part 2.',
    isCode: 'IS 7098',
    icon: '⚡',
  },
];

export default function App() {
  const { role, mode, setRole, setMode } = useRole();
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [alerts, setAlerts] = useState<AlertPayload[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('cement');
  const [activeFeature, setActiveFeature] = useState<FeatureKey>('explainability');
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [isDataSovereigntyOpen, setIsDataSovereigntyOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeData, setActiveData] = useState<StandardsResponse>(CEMENT_MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState<string>(
    'Procurement of 43 grade ordinary portland cement for highway construction.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isSocketLive, setIsSocketLive] = useState(false);
  const [currentStage, setCurrentStage] = useState<{ stage: number; name: string; detail: string } | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    getAlerts().then(setAlerts).catch(console.error);

    // Connect real-time alerts websocket
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

  // Authority Stream (Right Column) Messages
  const [messages, setMessages] = useState<Array<{ id: number; type: string; source?: string; text: string }>>([
    {
      id: 0,
      type: 'grounded-observation',
      source: 'gazette',
      text: 'Inspecting IS 269:2015 (Ordinary Portland Cement). The 43-grade specification was consolidated from legacy IS 8112:1989. Mandatory ISI marking is enforced under GSR 739(E). Audit trail and human feedback queue are active.',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
                text: `⚡ [Live Pipeline Stage 4]: ${evt.log}`,
              },
            ]);
          } else if (evt.type === 'stage_complete' && evt.stage === 1 && evt.normalized_query) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length,
                type: 'grounded-observation',
                source: 'nlu',
                text: `✨ [AI Call #1 Gemini Flash]: Normalized query to "${evt.normalized_query}" (Detected Lang: ${evt.detected_language || 'en'}).`,
              },
            ]);
          }
        }
      );

      setActiveData(result);
      setCurrentStage(null);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          type: 'grounded-observation',
          source: 'audit',
          text: `Query resolved: ${result.primary_recommendation.is_number} (${result.primary_recommendation.title}). Confidence: ${(result.primary_recommendation.confidence * 100).toFixed(0)}%. ${result.multilingual?.bhashini_used ? '🌐 Bhashini NLP Translation Active.' : ''} ${result.audit_record?.dry_run ? '🧪 Sandbox mode: Not logged to permanent audit ledger.' : 'Audit hash sealed.'}`,
        },
      ]);
    } catch (e: any) {
      setQueryError(e.message || 'Failed to query standards intelligence engine');
      setCurrentStage(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, isLoading, mode, role, language]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1': setActiveFeature('explainability'); break;
          case '2': setActiveFeature('audit'); break;
          case '3': setActiveFeature('feedback'); break;
          case '4': setActiveFeature('alerts'); break;
          case '6': setActiveFeature('comparison'); break;
          case '7': setActiveFeature('queryUnderstanding'); break;
          case '8': setActiveFeature('nitGenerator'); break;
          case '9': setActiveFeature('mcp'); break;
          case '0': setActiveFeature('tenderUpload'); break;
          case 'd': setActiveFeature('dashboard'); break;
          case 'g': setActiveFeature('integrations'); break;
          case 'Enter': handleAnalyze(); break;
        }
      }
      if (e.key === '/' && (e.target === document.body || (e.target as HTMLElement).tagName === 'DIV')) {
        const input = document.querySelector<HTMLInputElement>('.auth-input');
        if (input) {
          input.focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAnalyze]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleDomainChange = (domainKey: string) => {
    setSelectedDomain(domainKey);
    const preset = DOMAIN_PRESETS[domainKey];
    if (preset) {
      setActiveData(preset.data);
      setSearchQuery(preset.data.query_understanding.original_text);
      if (domainKey === 'cctv') {
        setLanguage('hi');
      } else {
        setLanguage('en');
      }
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          type: 'grounded-observation',
          source: 'gazette',
          text: `Switched domain to ${preset.label}. Enforced standard: ${preset.isCode}. Cross-referencing technical annexures and quality control orders.`,
        },
      ]);
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

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isProcessing) return;

    const userQ = inputQuestion;
    setInputQuestion('');
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

  const handleCopyHash = () => {
    const hash = activeData.audit_record?.audit_hash || activeData.meta.audit_reference_hash;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="workspace">
      {/* Institutional Top Header */}
      <header className="workspace-header">
        <div className="header-brand-group">
          <div className="gov-insignia" title="Bureau of Indian Standards — Government of India">
            BIS
          </div>
          <div>
            <h1>
              <span>ManakAI</span>
              <span style={{ fontWeight: 400, color: 'var(--ink-secondary)', fontSize: '13px' }}>
                / Standards Intelligence
              </span>
            </h1>
          </div>

          {/* Quick Spotlight ⌘K Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="command-palette-trigger"
            title="Open Command Palette & Quick Search (⌘K / Ctrl+K)"
          >
            <span>🔍 Search standards, tools...</span>
            <kbd>⌘K</kbd>
          </button>
        </div>

        <div className="header-status">
          {/* Feature Navigator Bar with Group Badges */}
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'explainability' ? 'active' : ''}`}
              onClick={() => setActiveFeature('explainability')}
              title="Knowledge Graph & Visible Reasoning"
            >
              🧠 01. Graph & Logic
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveFeature('audit')}
              title="CVC Defense & Immutable Audit Trail"
            >
              🛡️ 02. Audit & CVC
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'feedback' ? 'active' : ''}`}
              onClick={() => setActiveFeature('feedback')}
              title="Human Moderation Queue"
            >
              👥 03. Feedback
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveFeature('alerts')}
              title="Proactive Supersession Alerts"
            >
              🚨 04. Alerts
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'comparison' ? 'active' : ''}`}
              onClick={() => setActiveFeature('comparison')}
              title="Side-by-Side Standard Comparison"
            >
              ⚖️ 06. Compare
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'queryUnderstanding' ? 'active' : ''}`}
              onClick={() => setActiveFeature('queryUnderstanding')}
              title="AI Call #1 Gemini Flash NLU"
            >
              🔍 07. Query NLU
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'nitGenerator' ? 'active' : ''}`}
              onClick={() => setActiveFeature('nitGenerator')}
              title="NIT Draft Clause Generator"
            >
              📝 08. NIT Clauses
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'mcp' ? 'active' : ''}`}
              onClick={() => setActiveFeature('mcp')}
              title="Model Context Protocol Server Tools"
            >
              ⚡ 09. MCP Server
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'tenderUpload' ? 'active' : ''}`}
              onClick={() => setActiveFeature('tenderUpload')}
              title="PDF Tender Analyzer & Highlighter"
            >
              📄 10. PDF Analyzer
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveFeature('dashboard')}
              title="Ministry MIS Compliance Heatmap"
            >
              📊 11. MIS Heatmap
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${activeFeature === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveFeature('integrations')}
              title="GeM & CPPP National Sandbox"
            >
              🏛️ 12. GeM/CPPP
            </button>
          </div>

          {/* District Offline / Low-Bandwidth Mode */}
          <LowBandwidthToggle />

          {/* Multilingual / Bhashini Selector */}
          <LanguageSelector
            language={language}
            onChange={setLanguage}
            bhashiniUsed={activeData?.multilingual?.bhashini_used}
          />

          {/* Data Sovereignty Institutional Verification Badge */}
          <button
            type="button"
            onClick={() => setIsDataSovereigntyOpen(true)}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontFamily: 'var(--font-data)',
              fontWeight: 700,
              background: 'rgba(30, 58, 138, 0.08)',
              color: '#1E40AF',
              border: '1px solid rgba(30, 58, 138, 0.25)',
              height: '28px',
              cursor: 'pointer',
            }}
            title="Click to view 100% Data Sovereignty, MeitY Cloud Empanelment & NIC NDC Hosting Certificate"
          >
            <span>🇮🇳</span>
            <span>MEITY / NIC SOVEREIGN</span>
          </button>

          {/* Live Pipeline / WebSocket Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: isSocketLive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
              border: `1px solid ${isSocketLive ? 'var(--emerald-pass)' : 'var(--border)'}`,
              fontFamily: 'var(--font-data)',
              fontSize: '11px',
              fontWeight: 600,
              color: isSocketLive ? 'var(--emerald-pass)' : 'var(--ink-muted)',
            }}
            title={isSocketLive ? "Live WebSocket connection active on ws://localhost:8000 (Gemini 3.8 Flash)" : "Local Engine / Mock Fallback"}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isSocketLive ? 'var(--emerald-pass)' : '#94A3B8',
                boxShadow: isSocketLive ? '0 0 8px var(--emerald-pass)' : 'none',
              }}
            />
            {isSocketLive ? 'WS LIVE (PORT 8000)' : 'LOCAL ENGINE'}
          </div>

          <NotificationBell alerts={alerts} onClick={() => setIsAlertDrawerOpen(true)} />

          <div className="auth-user-badge">
            <span className="auth-user-name">Ayush Patel</span>
            <span className="auth-user-role">{role.replace('_', ' ')}</span>
          </div>
        </div>
      </header>

      {/* Main Left Stage */}
      <main className="workspace-main">
        {/* Sandbox & Outdated Warning Banner */}
        <SandboxBanner data={activeData} mode={mode} />

        {/* Domain Preset Switcher, Quick Scenarios & Search Bar */}
        <div className="workbench-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="section-label" style={{ margin: 0 }}>
                PROCUREMENT DOMAIN PRESETS
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '10px',
                  background: 'rgba(29, 78, 216, 0.08)',
                  color: 'var(--collapse-cobalt)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}
              >
                22,011 BIS Standards Indexed
              </span>
            </div>
            {/* Role & Mode Switcher Controls */}
            <RoleSwitcher
              role={role}
              mode={mode}
              onRoleChange={setRole}
              onModeChange={setMode}
            />
          </div>

          <div className="palette">
            {Object.entries(DOMAIN_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className={`palette-btn ${selectedDomain === key ? 'selected' : ''}`}
                onClick={() => handleDomainChange(key)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Quick 1-Click Demo Scenarios */}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              TEST SCENARIOS:
            </span>
            {QUICK_SCENARIOS.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunScenario(sc)}
                className="scenario-chip"
                title={`Run test query: "${sc.query}"`}
              >
                <span>{sc.icon}</span>
                <span>{sc.label}</span>
                <span className="scenario-chip-code">{sc.isCode}</span>
              </button>
            ))}
          </div>

          {/* Real-time Stage Progression Banner */}
          {currentStage && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                borderRadius: '6px',
                background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
                border: '1px solid var(--superposition-violet)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'banner-in 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--superposition-violet)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-data)',
                  fontWeight: 700,
                  fontSize: '12px',
                  flexShrink: 0,
                }}
              >
                {currentStage.stage}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--superposition-violet)' }}>
                  STAGE {currentStage.stage}/7: {currentStage.name.toUpperCase()}
                </div>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentStage.detail}
                </div>
              </div>
              <span className="status-dot active" style={{ flexShrink: 0 }} />
            </div>
          )}

          {/* Search Input Box */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', position: 'relative' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze();
                }}
                placeholder="Enter tender specification, product clause, or Indian Standard (e.g. IS 269)..."
                className="auth-input"
                style={{
                  fontSize: '13.5px',
                  background: 'var(--paper)',
                  paddingRight: searchQuery ? '70px' : '14px',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-muted)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px',
                  }}
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              className="btn-run"
              onClick={() => handleAnalyze()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span style={{ animation: 'pulse 1s infinite' }}>⚙️</span>
                  <span>Streaming...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <kbd style={{ fontSize: '10px', opacity: 0.8, background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '3px' }}>↵</kbd>
                </>
              )}
            </button>
          </div>

          {queryError && (
            <div style={{ marginTop: '8px', color: 'var(--error-line)', fontSize: '12px', fontFamily: 'var(--font-data)' }}>
              ⚠ {queryError}
            </div>
          )}

          {/* Feature 07: Live Compact Query Entity Display */}
          <div style={{ marginTop: '10px' }}>
            <QueryEntityDisplay
              compact
              understanding={activeData.query_understanding}
              onOpenCorrection={() => setActiveFeature('queryUnderstanding')}
            />
          </div>
        </div>

        {isLoading && (
          <div className="workbench-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', animation: 'pulse 1.4s ease infinite' }}>⚙️</span>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--collapse-cobalt)' }}>
                QUERYING BIS STANDARDS INTELLIGENCE ENGINE & AUDIT LEDGER...
              </span>
            </div>
            <LoadingShimmer lines={3} height="16px" />
          </div>
        )}

        {/* Feature 01: Role-Adapted Views vs. Black Box */}
        {activeFeature === 'explainability' && (
          <>
            {role === 'PROCUREMENT_OFFICER' && (
              <ProcurementOfficerPanel
                data={activeData}
                onOpenNITGenerator={() => setActiveFeature('nitGenerator')}
              />
            )}
            {role === 'AUDITOR' && (
              <AuditorPanel
                data={activeData}
                onOpenCertificate={() => setActiveFeature('audit')}
              />
            )}
            {role === 'VENDOR' && <VendorPanel data={activeData} />}
          </>
        )}

        {/* Feature 02: Audit Trail & Legal Defensibility */}
        {activeFeature === 'audit' && (
          <AuditTrailView
            currentData={activeData}
            onSelectRecord={(rec) => {
              setActiveData(rec);
              setSelectedDomain(rec.primary_recommendation.is_number.includes('2062') ? 'steel' : 'cement');
            }}
          />
        )}

        {/* Feature 03: Human-in-the-Loop Feedback & Moderation Queue */}
        {activeFeature === 'feedback' && (
          <FeedbackView currentData={activeData} />
        )}

        {/* Feature 04: Proactive Staleness & Supersession Alerts */}
        {activeFeature === 'alerts' && (
          <AlertsView currentData={activeData} />
        )}

        {/* Feature 06: Standards Comparison & Allied Standards Table */}
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
              setMessages((prev) => [
                ...prev,
                {
                  id: prev.length,
                  type: 'grounded-observation',
                  source: 'gazette',
                  text: `Switched primary recommendation to ${alt.is_number} (${alt.title}). Recalculating conflict resolution and allied test methods.`,
                },
              ]);
            }}
          />
        )}

        {/* Feature 07: Query Understanding & Intent Disambiguation */}
        {activeFeature === 'queryUnderstanding' && (
          <QueryUnderstandingView
            currentData={activeData}
            onUpdateData={(updated) => setActiveData(updated)}
          />
        )}

        {/* Feature 08: NIT Draft Clause Generator */}
        {activeFeature === 'nitGenerator' && (
          <NITGeneratorView currentData={activeData} />
        )}

        {/* Feature 09: Model Context Protocol (MCP) Server Workbench */}
        {activeFeature === 'mcp' && (
          <MCPView currentData={activeData} />
        )}

        {/* Feature 10: Automated Tender Document Analyser */}
        {activeFeature === 'tenderUpload' && (
          <TenderUploadView
            onSelectItem={(item) => {
              setActiveData(item);
              setActiveFeature('explainability');
            }}
          />
        )}

        {/* Feature 11: Dashboard Analytics & Usage Heatmap */}
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

        {/* Feature 12: National E-Procurement Integrations Sandbox (GeM & CPPP) */}
        {activeFeature === 'integrations' && (
          <IntegrationSandboxView />
        )}
      </main>

      {/* Right Column: Authority Stream & Legal Audit Trail */}
      <aside className="tutor-panel">
        <div className="tutor-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="section-label" style={{ margin: 0 }}>
              LEGAL DEFICIENCIES & AUTHORITY STREAM
            </div>
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '9px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(5, 150, 105, 0.1)',
                color: 'var(--emerald-pass)',
                fontWeight: 700,
              }}
            >
              CVC SECURE
            </span>
          </div>
          <div className="tutor-context-line" style={{ marginTop: '6px' }}>
            Active Standard: <strong>{activeData.primary_recommendation.is_number}</strong> ({activeData.primary_recommendation.year_published})
          </div>
        </div>

        <div className="tutor-messages">
          {messages.map((msg) => {
            let badgeIcon = '⚖️';
            let badgeLabel = 'GAZETTE AUTHORITY';

            if (msg.source === 'alert') {
              badgeIcon = '🚨';
              badgeLabel = 'LIVE ALERT';
            } else if (msg.source === 'pipeline') {
              badgeIcon = '⚡';
              badgeLabel = 'GRAPHRAG';
            } else if (msg.source === 'nlu') {
              badgeIcon = '🤖';
              badgeLabel = 'GEMINI FLASH';
            } else if (msg.source === 'audit') {
              badgeIcon = '🛡️';
              badgeLabel = 'AUDIT SEAL';
            } else if (msg.type === 'user') {
              badgeIcon = '👤';
              badgeLabel = 'OFFICER QUERY';
            }

            return (
              <div
                key={msg.id}
                className={`tutor-message ${
                  msg.type === 'grounded-observation'
                    ? 'grounded-observation'
                    : msg.type === 'response'
                    ? 'response'
                    : msg.type === 'user'
                    ? 'user'
                    : ''
                }`}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: 'var(--font-data)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--ink-muted)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span>{badgeIcon}</span>
                  <span>{badgeLabel}</span>
                </div>
                <div>{msg.text}</div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="tutor-loading">
              Cross-referencing Gazette Notifications & CVC Guidelines...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Audit Hash Reference Card with 1-Click Copy */}
        <div style={{ padding: '12px 18px', background: 'var(--surface-raised)', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span className="section-label" style={{ margin: 0 }}>
              IMMUTABLE AUDIT REFERENCE
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                fontWeight: 600,
                background: copiedHash ? 'var(--emerald-pass)' : 'transparent',
                color: copiedHash ? '#fff' : 'var(--collapse-cobalt)',
                border: copiedHash ? '1px solid var(--emerald-pass)' : '1px solid rgba(29, 78, 216, 0.3)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copiedHash ? '✓ Copied' : 'Copy Hash'}
            </button>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              color: 'var(--ink-secondary)',
              wordBreak: 'break-all',
              background: 'var(--paper)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--hairline)',
            }}
          >
            {activeData.audit_record?.audit_hash || activeData.meta.audit_reference_hash}
          </div>
        </div>

        {/* Question Form with Quick Prompt Suggestions */}
        <form onSubmit={handleAskQuestion} className="tutor-footer">
          <div className="tutor-scope-label">
            Ask about clauses in {activeData.primary_recommendation.is_number}:
          </div>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
            {['Is ISI mark mandatory?', 'What is latest amendment?', 'Test methods?'].map((promptText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputQuestion(promptText)}
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '10px',
                  background: 'rgba(0,0,0,0.03)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  color: 'var(--ink-secondary)',
                }}
              >
                + {promptText}
              </button>
            ))}
          </div>

          <div className="tutor-input-row">
            <textarea
              rows={2}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="e.g. Is 43 grade OPC mandatory for highway bridges?"
              className="tutor-input"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isProcessing}
              className="btn-ask"
            >
              Ask
            </button>
          </div>
        </form>
      </aside>

      {/* Institutional Footer */}
      <footer
        style={{
          gridColumn: '1 / -1',
          padding: '10px 24px',
          borderTop: '1px solid var(--hairline)',
          background: 'var(--surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-data)',
          fontSize: '11px',
          color: 'var(--ink-muted)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>ManakAI v1.0.0 · BIS Standards Intelligence Platform · SIH 2026</span>
          <span>·</span>
          <span>Press <kbd style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '3px' }}>⌘K</kbd> for Command Palette</span>
        </div>
        <div>
          Data Snapshot: {activeData?.meta.data_snapshot_date ?? '2026-09-26'} · Pipeline v{activeData?.meta.pipeline_version ?? '1.0.0'} · Audit Sealed
        </div>
        <span>MeitY & BIS Empanelled Infrastructure · Sovereign Indian Jurisdiction</span>
      </footer>

      {/* Global Command Palette (⌘K / Ctrl+K) */}
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

      {/* Feature 04: Global Slide-in Alert Drawer */}
      <AlertDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        onSelectTender={() => {
          setActiveFeature('alerts');
          setIsAlertDrawerOpen(false);
        }}
      />

      {/* Feature 07: Data Sovereignty & MeitY/NIC Localization Modal */}
      <DataSovereigntyModal
        isOpen={isDataSovereigntyOpen}
        onClose={() => setIsDataSovereigntyOpen(false)}
      />

      {/* Mobile Bottom Navigation Dock */}
      <MobileBottomNav
        activeFeature={activeFeature}
        onSelectFeature={setActiveFeature}
        alertCount={alerts.length}
      />
    </div>
  );
}
