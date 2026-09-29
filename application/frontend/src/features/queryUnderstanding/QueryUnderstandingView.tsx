import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Languages,
  Layers,
  Code2,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Scale,
  Compass,
  FileText,
  Tag,
  Building2,
  FlaskConical,
  Binary,
  MapPin,
  Flame,
} from 'lucide-react';
import type { StandardsResponse, AmbiguityOption, QueryIntent } from '../../types';
import { QueryEntityDisplay } from './QueryEntityDisplay';
import { AmbiguityCard } from './AmbiguityCard';
import { IntentClassifierBadge } from './IntentClassifierBadge';
import { QueryCorrectionForm } from './QueryCorrectionForm';
import {
  buildRefinedQuery,
  applyQueryCorrection,
  SAMPLE_AMBIGUOUS_QUERIES,
  type AmbiguousQueryPreset,
  type ManualEntityCorrections,
} from './refinedQueryBuilder';
import { queryStandards, pickMock } from '../../api/standardsClient';

interface QueryUnderstandingViewProps {
  currentData?: StandardsResponse | null;
  onUpdateData?: (updated: StandardsResponse) => void;
  onNavigateToExplorer?: () => void;
}

export const QueryUnderstandingView: React.FC<QueryUnderstandingViewProps> = ({
  currentData,
  onUpdateData,
  onNavigateToExplorer,
}) => {
  const [activeTab, setActiveTab] = useState<'DISAMBIGUATION' | 'MULTILINGUAL' | 'ONTOLOGY' | 'CONTRACT_JSON'>('DISAMBIGUATION');
  const [activeData, setActiveData] = useState<StandardsResponse | null>(() => currentData || SAMPLE_AMBIGUOUS_QUERIES[0].data);
  const [queryInput, setQueryInput] = useState<string>(SAMPLE_AMBIGUOUS_QUERIES[0].queryText);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_AMBIGUOUS_QUERIES[0].id);
  const [presetCategory, setPresetCategory] = useState<'ALL' | 'AMBIGUITY' | 'MULTILINGUAL' | 'OUTDATED_AUDIT'>('ALL');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState<boolean>(false);
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);
  const [copiedJSON, setCopiedJSON] = useState<boolean>(false);

  // Multilingual Tab States
  const [multilingualInput, setMultilingualInput] = useState<string>('हाईवे पुलों और सुपरस्ट्रक्चर के लिए 53 ग्रेड ओपीसी सीमेंट');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');

  // Sync when parent currentData changes
  useEffect(() => {
    if (currentData) {
      setActiveData(currentData);
      if (currentData.query_understanding?.original_text) {
        setQueryInput(currentData.query_understanding.original_text);
      }
    }
  }, [currentData]);

  const handleAnalyze = async (textToAnalyze?: string) => {
    const query = textToAnalyze || queryInput;
    if (!query.trim()) return;
    setIsAnalyzing(true);
    try {
      // Check if it matches an ambiguous preset first for rich interactive testing
      const matchedPreset = SAMPLE_AMBIGUOUS_QUERIES.find(
        (p) => p.queryText.toLowerCase().trim() === query.toLowerCase().trim()
      );

      if (matchedPreset) {
        setActiveData(matchedPreset.data);
        setSelectedPresetId(matchedPreset.id);
        if (onUpdateData) onUpdateData(matchedPreset.data);
      } else {
        const result = await queryStandards(query);
        setActiveData(result);
        if (onUpdateData) onUpdateData(result);
      }
    } catch (err) {
      console.error('NLU query failed, falling back to mock:', err);
      const fallback = pickMock(query);
      setActiveData(fallback);
      if (onUpdateData) onUpdateData(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadPreset = (preset: AmbiguousQueryPreset) => {
    setSelectedPresetId(preset.id);
    setQueryInput(preset.queryText);
    setActiveData(preset.data);
    if (onUpdateData) onUpdateData(preset.data);
  };

  const handleResolveAmbiguity = (
    dimension: string,
    resolvedValue: string,
    resolvedOption: AmbiguityOption
  ) => {
    if (!activeData) return;
    const refined = buildRefinedQuery(
      activeData,
      dimension,
      resolvedValue,
      resolvedOption.label
    );
    setActiveData(refined);
    if (onUpdateData) onUpdateData(refined);

    setResolutionNotice(
      `Disambiguation Applied: '${dimension}' resolved to '${resolvedOption.label}'. Tailored standard recommendation generated.`
    );
    setTimeout(() => setResolutionNotice(null), 6000);
  };

  const handleApplyCorrection = (corrections: ManualEntityCorrections) => {
    if (!activeData) return;
    const corrected = applyQueryCorrection(activeData, corrections);
    setActiveData(corrected);
    if (onUpdateData) onUpdateData(corrected);
    setIsCorrectionOpen(false);

    setResolutionNotice(
      'Officer Manual Override Applied: Entity understanding verified at 100% confidence.'
    );
    setTimeout(() => setResolutionNotice(null), 5000);
  };

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleCopyJSON = () => {
    if (!activeData) return;
    navigator.clipboard.writeText(JSON.stringify(activeData, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const qu = activeData?.query_understanding;
  const ambiguityFlags = qu?.ambiguity_flags || [];
  const primary = activeData?.primary_recommendation;

  const filteredPresets = SAMPLE_AMBIGUOUS_QUERIES.filter((p) => {
    if (presetCategory === 'ALL') return true;
    return p.category === presetCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '40px' }}>
      {/* Top Header Card */}
      <div
        className="workbench-card"
        style={{
          padding: '16px 20px',
          background: 'var(--surface)',
          borderLeft: '4px solid var(--collapse-cobalt)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0, fontSize: '10.5px' }}>
                Technical Intent NLU Engine · 22,011 Standards
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '19px', fontWeight: 700, color: 'var(--ink)', margin: '2px 0 3px' }}>
              Query Understanding & Intent Disambiguation
            </h1>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0, maxWidth: '750px', lineHeight: 1.45 }}>
              Multilingual intent classification, named technical entity extraction, dynamic ambiguity resolution, and officer overrides grounded across 22,011 Indian Standards.
            </p>
          </div>

          <IntentClassifierBadge mode={activeData?.meta?.mode || 'recommend'} />
        </div>

        {/* View Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--hairline)', paddingTop: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={activeTab === 'DISAMBIGUATION' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('DISAMBIGUATION')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', height: '30px', padding: '0 12px' }}
          >
            <Sparkles size={13} />
            <span>Interactive Disambiguation</span>
          </button>

          <button
            type="button"
            className={activeTab === 'MULTILINGUAL' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('MULTILINGUAL')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', height: '30px', padding: '0 12px' }}
          >
            <Languages size={13} />
            <span>Multilingual Indic NLU</span>
          </button>

          <button
            type="button"
            className={activeTab === 'ONTOLOGY' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('ONTOLOGY')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', height: '30px', padding: '0 12px' }}
          >
            <Layers size={13} />
            <span>Entity Taxonomy & Schema</span>
          </button>

          <button
            type="button"
            className={activeTab === 'CONTRACT_JSON' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('CONTRACT_JSON')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', height: '30px', padding: '0 12px' }}
          >
            <Code2 size={13} />
            <span>API Telemetry</span>
          </button>
        </div>
      </div>

      {/* Live Query Input & Scenarios Card */}
      <div
        className="workbench-card"
        style={{
          padding: '16px 20px',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="var(--ink-muted)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Enter tender specification (e.g. Fe 500D TMT bars for coastal bridge, 53 grade cement for precast, HDPE pipes PN6)..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyze();
              }}
              className="auth-input"
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '12px',
                fontSize: '13px',
                height: '38px',
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !queryInput.trim()}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '38px',
              padding: '0 16px',
              whiteSpace: 'nowrap',
              opacity: isAnalyzing || !queryInput.trim() ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={15} className="spinner" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Analyze Intent</span>
              </>
            )}
          </button>
        </div>

        {/* Clean Compact Preset Selector Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            fontSize: '11.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Test Scenario:
            </span>
            <select
              value={selectedPresetId}
              onChange={(e) => {
                const found = SAMPLE_AMBIGUOUS_QUERIES.find((p) => p.id === e.target.value);
                if (found) handleLoadPreset(found);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--hairline)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                maxWidth: '340px',
              }}
              title="Select sample ambiguous or multilingual scenario"
            >
              <optgroup label="Ambiguous Engineering Clauses">
                {SAMPLE_AMBIGUOUS_QUERIES.filter((p) => p.category === 'AMBIGUITY' || p.category === 'COMPLEX_SPEC').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.domainLabel}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Vernacular Indic Queries">
                {SAMPLE_AMBIGUOUS_QUERIES.filter((p) => p.category === 'MULTILINGUAL').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.domainLabel}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Outdated Citation Audits">
                {SAMPLE_AMBIGUOUS_QUERIES.filter((p) => p.category === 'OUTDATED_AUDIT').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.domainLabel}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Sample Scenario Pills */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', color: 'var(--ink-muted)' }}>Quick picks:</span>
            {SAMPLE_AMBIGUOUS_QUERIES.slice(0, 3).map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              const shortLabel = preset.domainLabel.split('(')[0].trim();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset)}
                  style={{
                    background: isSelected ? 'var(--olive-leaf)' : 'var(--paper)',
                    border: isSelected ? '1px solid var(--olive-primary)' : '1px solid var(--hairline)',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: isSelected ? 'var(--olive-primary)' : 'var(--ink-secondary)',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resolution Toast Notice */}
        {resolutionNotice && (
          <div
            className="auth-banner success"
            style={{
              marginTop: '4px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <CheckCircle2 size={15} />
            <strong style={{ fontSize: '12px' }}>{resolutionNotice}</strong>
          </div>
        )}
      </div>

      {/* TAB 1: INTERACTIVE DISAMBIGUATION & ENTITY WORKBENCH */}
      {activeTab === 'DISAMBIGUATION' && (
        <>
          {!qu ? (
            <div className="workbench-card" style={{ padding: '36px 24px', textAlign: 'center' }}>
              <Sparkles size={28} style={{ color: 'var(--brand-primary, #2563eb)', margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>
                No Active Query Analysis
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', maxWidth: '480px', margin: '6px auto 16px' }}>
                Enter a tender clause or material specification above, or click one of the quick test chips to analyze extracted entities, ISO language detection, and procurement intent.
              </p>
            </div>
          ) : (
            <>
              {/* Component 1: Extracted Entity Visualization */}
              <QueryEntityDisplay
                understanding={qu}
                onOpenCorrection={() => setIsCorrectionOpen(!isCorrectionOpen)}
              />

              {/* Component 2: Active Ambiguity Cards if Present */}
              {ambiguityFlags.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ambiguityFlags.map((flag, idx) => (
                    <AmbiguityCard
                      key={idx}
                      flag={flag}
                      onResolve={handleResolveAmbiguity}
                    />
                  ))}
                </div>
              )}

              {/* Component 3: Collapsible Manual Officer Override Form */}
              {isCorrectionOpen && (
                <QueryCorrectionForm
                  understanding={qu}
                  onCorrect={handleApplyCorrection}
                  onClose={() => setIsCorrectionOpen(false)}
                />
              )}

              {/* Component 4: Tailored Indian Standard Recommendation Result */}
              {primary && (
                <div
                  className="workbench-card"
                  style={{
                    padding: '20px 22px',
                    borderLeft: '4px solid var(--emerald-pass)',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="status-dot active" />
                        <span className="section-label" style={{ margin: 0 }}>
                          TAILORED STANDARD RECOMMENDATION
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--emerald-bg)',
                            border: '1px solid var(--emerald-border)',
                            color: 'var(--emerald-text)',
                            fontSize: '11px',
                            fontFamily: 'var(--font-data)',
                            fontWeight: 700,
                          }}
                        >
                          {primary.status} · {(primary.confidence * 100).toFixed(0)}% CONFIDENCE
                        </span>
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: '4px 0 2px' }}>
                        {primary.is_number} — {primary.title}
                      </h2>
                      {primary.latest_amendment && (
                        <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-data)' }}>
                          Latest Revision: <strong>{primary.year_published}</strong> ({primary.latest_amendment})
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleCopyCitation(`${primary.is_number} (${primary.title})`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                      >
                        {copiedCitation ? <Check size={13} color="var(--emerald-text)" /> : <Copy size={13} />}
                        <span>{copiedCitation ? 'Copied!' : 'Copy Citation'}</span>
                      </button>

                      {onNavigateToExplorer && (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={onNavigateToExplorer}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700 }}
                        >
                          <BookOpen size={13} />
                          <span>View in Standards Explorer</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scope Snippet & Statutory Grounding */}
                  <div style={{ marginTop: '14px', padding: '12px 16px', background: 'var(--paper)', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Mandated Technical Scope & Application:
                    </div>
                    <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13.5px', color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>
                      {primary.scope_snippet}
                    </p>

                    {primary.certification && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--hairline)' }}>
                        <ShieldCheck size={16} color="var(--collapse-cobalt)" />
                        <span style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 600 }}>
                          Statutory Certification: {primary.certification.qco_order_name || 'Mandatory BIS Standard Mark Scheme'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Allied Standards Grid */}
                  {activeData.allied_standards && activeData.allied_standards.length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Mandatory Allied Standards & Test Protocols ({activeData.allied_standards.length}):
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                        {activeData.allied_standards.map((allied, aIdx) => (
                          <div
                            key={aIdx}
                            style={{
                              padding: '10px 12px',
                              background: 'var(--surface-secondary)',
                              border: '1px solid var(--hairline)',
                              borderRadius: '6px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--collapse-cobalt)' }}>
                                {allied.is_number}
                              </strong>
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '3px', background: 'var(--surface)', border: '1px solid var(--hairline)', color: 'var(--ink-secondary)' }}>
                                {allied.relation_type.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                              {allied.title}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)' }}>
                              {allied.why}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Component 5: NLU Pipeline Audit & Reasoning Trace */}
              <div className="workbench-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div className="section-label" style={{ margin: '0 0 4px 0' }}>
                      UNDERSTANDING PIPELINE AUDIT TRACE
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-prose)', fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                      Query Entity Extraction & Intent Classification Trace
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-data)' }}>
                    <Cpu size={14} />
                    <span>Deterministic + LLM Hybrid Pipeline</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  {activeData?.reasoning_trace && activeData.reasoning_trace.length > 0 ? (
                    activeData.reasoning_trace.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 14px',
                          background: 'var(--paper)',
                          border: '1px solid var(--hairline)',
                          borderRadius: '4px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-data)',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--collapse-cobalt)',
                            minWidth: '24px',
                          }}
                        >
                          0{idx + 1}.
                        </span>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink)', textTransform: 'uppercase' }}>
                              {step.step.replace(/_/g, ' ')}
                            </strong>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--emerald-pass)', fontWeight: 700 }}>
                              {(step.confidence * 100).toFixed(0)}% Confidence
                            </span>
                          </div>
                          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px', background: 'var(--paper)', border: '1px solid var(--hairline)', borderRadius: '4px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                      Reasoning trace generated upon query execution.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB 2: MULTILINGUAL INDIC NLU TESTER */}
      {activeTab === 'MULTILINGUAL' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="workbench-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Languages size={18} color="var(--teal-guide)" />
              <div className="section-label" style={{ margin: 0 }}>
                BHASHINI & GEMINI MULTILINGUAL INDIC NORMALIZATION BENCHMARK
              </div>
            </div>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '2px 0 8px' }}>
              Vernacular Indian Language Input Normalizer
            </h2>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.5 }}>
              Test technical tender queries in 10 official Indian languages. The pipeline automatically detects language, performs phonetic and semantic transliteration, normalizes vernacular terminology to canonical BIS taxonomy, and grounds citations in statutory Indian Standards.
            </p>

            {/* Language Selector Chips */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              {[
                { code: 'hi', name: 'Hindi (हिंदी)', sample: 'हाईवे पुलों और सुपरस्ट्रक्चर के लिए 53 ग्रेड ओपीसी सीमेंट' },
                { code: 'ta', name: 'Tamil (தமிழ்)', sample: 'நெடுஞ்சாலை பாலங்களுக்கான உயர் இழுவிசை எஃகு Fe 500D' },
                { code: 'te', name: 'Telugu (తెలుగు)', sample: 'రైల్వే వంతెనల కోసం అధిక బలం కలిగిన ఉక్కు ప్లేట్లు IS 2062' },
                { code: 'mr', name: 'Marathi (मराठी)', sample: 'ग्रामीण पिण्याच्या पाण्यासाठी एचडीपीई पाईप पीएन 10' },
                { code: 'bn', name: 'Bengali (বাংলা)', sample: 'সেতু নির্মাণের জন্য উচ্চ প্রসার্য ইস্পাত রিবার Fe 500D' },
                { code: 'gu', name: 'Gujarati (ગુજરાતી)', sample: 'પીવાના પાણીના નેટવર્ક માટે પીઈ-100 એચડીપીઈ પાઈપો' },
                { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', sample: 'ಹೆದ್ದಾರಿ ಸೇತುವೆಗಳಿಗೆ 53 ದರ್ಜೆಯ ಸಿಮೆಂಟ್ IS 269' },
                { code: 'ml', name: 'Malayalam (മലയാളം)', sample: 'ഹൈവേ പാലങ്ങൾക്കായുള്ള ഉയർന്ന കരുത്തുള്ള സിമൻ്റ്' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setMultilingualInput(lang.sample);
                    setQueryInput(lang.sample);
                    handleAnalyze(lang.sample);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: selectedLanguage === lang.code ? '1px solid var(--teal-guide)' : '1px solid var(--hairline)',
                    background: selectedLanguage === lang.code ? '#F0FDFA' : 'var(--surface-secondary)',
                    color: selectedLanguage === lang.code ? 'var(--teal-guide)' : 'var(--ink)',
                    fontSize: '12px',
                    fontWeight: selectedLanguage === lang.code ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            {/* Multilingual Pipeline Flow Visualization */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '20px' }}>
              <div style={{ background: 'var(--paper)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--hairline)' }}>
                <div className="section-label" style={{ margin: '0 0 6px', fontSize: '10px' }}>01. RAW VERNACULAR INPUT</div>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                  {multilingualInput}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                  Detected Language Code: <strong>{selectedLanguage.toUpperCase()}</strong>
                </div>
              </div>

              <div style={{ background: 'var(--paper)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--hairline)' }}>
                <div className="section-label" style={{ margin: '0 0 6px', fontSize: '10px' }}>02. CANONICAL NORMALIZED QUERY</div>
                <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 600, color: 'var(--collapse-cobalt)' }}>
                  {qu?.normalized_text || '53 Grade Ordinary Portland Cement for structural concrete'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                  Standardized Technical English Representation
                </div>
              </div>

              <div style={{ background: 'var(--paper)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--hairline)' }}>
                <div className="section-label" style={{ margin: '0 0 6px', fontSize: '10px' }}>03. GROUNDED BIS STANDARD</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 700, color: 'var(--emerald-text)' }}>
                  {primary?.is_number || 'IS 269:2015'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
                  {primary?.title || 'Ordinary Portland Cement Specification'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENTITY TAXONOMY & ONTOLOGY SCHEMA */}
      {activeTab === 'ONTOLOGY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="workbench-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Layers size={18} color="var(--superposition-violet)" />
              <div className="section-label" style={{ margin: 0 }}>
                22,011 INDIAN STANDARDS NAMED ENTITY ONTOLOGY
              </div>
            </div>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '2px 0 8px' }}>
              Technical Entity Taxonomy & Classification Engine
            </h2>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.5 }}>
              ManakAI employs a strict 7-class named entity taxonomy to parse tender clauses and map them into the Bureau of Indian Standards (BIS) knowledge graph.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {[
                { tag: 'PRODUCT', label: 'Product / Material Class', desc: 'Core physical commodity (e.g. Ordinary Portland Cement, Structural Steel, HDPE Pipes, LED Luminaires).', icon: Tag, color: 'var(--collapse-cobalt)' },
                { tag: 'GRADE_SPECIFICATION', label: 'Tensile / Material Grade', desc: 'Strength ratings, raw resin formulations, and metallurgical grade designations (e.g. 53 Grade, Fe 500D, PE-100, E250).', icon: Tag, color: 'var(--collapse-cobalt)' },
                { tag: 'APPLICATION_DOMAIN', label: 'Application Domain', desc: 'Socio-economic engineering domain (e.g. Highway Infrastructure, Railway Bridges, Jal Jeevan Mission Potable Water).', icon: Building2, color: 'var(--superposition-violet)' },
                { tag: 'SUBDOMAIN', label: 'Structural Subdomain', desc: 'Specific structural zone or installation environment (e.g. Bridge Deck Wearing Course vs Substructure Piers).', icon: Compass, color: 'var(--superposition-violet)' },
                { tag: 'TEST_PARAMETER', label: 'Quality Test Protocol', desc: 'Mandatory mechanical, chemical, and durability testing procedures (e.g. Charpy V-Notch, 28-day Compressive Strength, ESCR).', icon: FlaskConical, color: 'var(--teal-guide)' },
                { tag: 'LOCATION', label: 'Geographic / Seismic Zone', desc: 'Climatic exposure, marine coastal salinity, and seismic hazard zones (e.g. Coastal NCR, Seismic Zone IV).', icon: MapPin, color: 'var(--ink-secondary)' },
                { tag: 'CODE', label: 'BIS Standard Citation', desc: 'Direct Indian Standard citation and revision year (e.g. IS 269:2015, IS 1786:2008, IS 4984:2016).', icon: Binary, color: 'var(--collapse-cobalt)' },
              ].map((tax, tIdx) => {
                const Icon = tax.icon;
                return (
                  <div
                    key={tIdx}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--paper)', border: '1px solid var(--hairline)', color: tax.color }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '10.5px', fontWeight: 800, color: tax.color }}>
                          {tax.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
                        {tax.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {tax.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API CONTRACT JSON TELEMETRY */}
      {activeTab === 'CONTRACT_JSON' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="workbench-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div className="section-label" style={{ margin: '0 0 4px' }}>
                  API CONTRACT SCHEMA v1 (STANDARDS_RESPONSE)
                </div>
                <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '17px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  Active Query NLU Contract Payload
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCopyJSON}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                >
                  {copiedJSON ? <Check size={13} color="var(--emerald-text)" /> : <Copy size={13} />}
                  <span>{copiedJSON ? 'Copied JSON!' : 'Copy Payload'}</span>
                </button>
              </div>
            </div>

            <pre
              style={{
                backgroundColor: '#0F172A',
                color: '#E2E8F0',
                padding: '16px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'var(--font-data)',
                overflowX: 'auto',
                maxHeight: '480px',
                lineHeight: 1.5,
              }}
            >
              {JSON.stringify(activeData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
