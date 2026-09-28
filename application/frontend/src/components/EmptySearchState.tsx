import React from 'react';
import { Search, ShieldCheck, Zap, FileText, ArrowRight, Layers, GitBranch, History } from 'lucide-react';

interface EmptySearchStateProps {
  onSelectSample: (query: string) => void;
}

const SAMPLE_QUERIES = [
  {
    title: 'Ordinary Portland Cement 43 Grade',
    standard: 'IS 269:2015',
    query: 'Procurement of 43 grade ordinary portland cement for highway bridge construction.',
    category: 'Civil & Construction',
    badge: 'QCO Mandatory',
  },
  {
    title: 'High Strength Deformed Steel Bars (Fe 500D)',
    standard: 'IS 1786:2008',
    query: 'Supply of thermo-mechanically treated (TMT) Fe 500D steel rebar for seismic zone IV.',
    category: 'Metallurgical',
    badge: 'QCO Mandatory',
  },
  {
    title: 'HDPE Pipes for Potable Water',
    standard: 'IS 4984:2016',
    query: 'High density polyethylene (HDPE) pipes PE 100 PN 10 for drinking water distribution.',
    category: 'Plastics & Water Supply',
    badge: 'Potable Water',
  },
  {
    title: 'Self-Ballasted LED Luminaires',
    standard: 'IS 16102 (Part 1):2012',
    query: 'Energy efficient self-ballasted LED lamps for public street lighting fixtures.',
    category: 'Electrical & Electronics',
    badge: 'CRS Compulsory',
  },
  {
    title: 'CCTV Surveillance & Security System',
    standard: 'IS 16165:2014',
    query: 'Installation of high definition IP-based CCTV surveillance camera network for rail station.',
    category: 'Electronics & IT',
    badge: 'Safety Norms',
  },
];

export const EmptySearchState: React.FC<EmptySearchStateProps> = ({ onSelectSample }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        maxWidth: '880px',
        margin: '0 auto',
        width: '100%',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(16,185,129,0.12) 100%)',
          border: '1px solid rgba(37,99,235,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <Search size={30} style={{ color: 'var(--brand-primary, #2563eb)' }} />
      </div>

      {/* Main Headline */}
      <h2
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '8px',
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}
      >
        Search 22,000+ Indian Standards
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '14px',
          color: 'var(--ink-secondary)',
          textAlign: 'center',
          maxWidth: '560px',
          lineHeight: 1.5,
          marginBottom: '32px',
        }}
      >
        Type any product name, engineering material, tender clause, or IS citation into the search bar above to begin real-time GraphRAG compliance analysis.
      </p>

      {/* Quick Start Prompt Cards */}
      <div style={{ width: '100%', marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '11.5px',
            fontFamily: 'var(--font-data)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-muted)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Zap size={13} style={{ color: '#F59E0B' }} />
          <span>Quick Sample Queries (Click to test live engine)</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
          }}
        >
          {SAMPLE_QUERIES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSample(sample.query)}
              className="workbench-card hoverable"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--hairline)',
                background: 'var(--paper)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary, #2563eb)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--hairline)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--brand-primary, #2563eb)',
                    background: 'rgba(37,99,235,0.08)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {sample.standard}
                </span>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    color: '#B45309',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {sample.badge}
                </span>
              </div>
              <h4
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  margin: '0 0 4px 0',
                }}
              >
                {sample.title}
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11.5px',
                  color: 'var(--ink-muted)',
                  margin: 0,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                "{sample.query}"
              </p>
              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--brand-primary, #2563eb)',
                }}
              >
                <span>Run Analysis</span>
                <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          width: '100%',
          paddingTop: '20px',
          borderTop: '1px solid var(--hairline)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} style={{ color: '#10B981', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 500 }}>
            Zero-Hallucination Grounding
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitBranch size={16} style={{ color: '#3B82F6', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 500 }}>
            Normative Knowledge Graph
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 500 }}>
            Supersession Lineage Check
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} style={{ color: '#8B5CF6', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 500 }}>
            SHA-256 CVC Audit Sealing
          </span>
        </div>
      </div>
    </div>
  );
};
