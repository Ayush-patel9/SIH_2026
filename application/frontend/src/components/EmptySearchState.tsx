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
        padding: '36px 20px',
        maxWidth: '820px',
        margin: '0 auto',
        width: '100%',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Search size={26} style={{ color: '#2563EB' }} />
      </div>

      {/* Main Headline */}
      <h2
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '6px',
          textAlign: 'center',
          letterSpacing: '-0.015em',
        }}
      >
        Search Any Indian Standard or Material
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13.5px',
          color: 'var(--ink-secondary)',
          textAlign: 'center',
          maxWidth: '520px',
          lineHeight: 1.5,
          marginBottom: '26px',
        }}
      >
        Type a product name, material, or standard number above, or click a quick sample below to see an instant compliance report:
      </p>

      {/* Quick Start Prompt Cards */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
          }}
        >
          {SAMPLE_QUERIES.slice(0, 4).map((sample, idx) => (
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
                borderRadius: '8px',
                border: '1px solid var(--hairline)',
                background: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)';
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
                    color: '#2563EB',
                    background: '#EFF6FF',
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
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#2563EB',
                }}
              >
                <span>Click to View &rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          width: '100%',
          paddingTop: '16px',
          borderTop: '1px solid var(--hairline)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={15} style={{ color: '#10B981' }} />
          <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 500 }}>
            Mandatory ISI / QCO Rules
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitBranch size={15} style={{ color: '#3B82F6' }} />
          <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 500 }}>
            Normative Knowledge Graph
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <History size={15} style={{ color: '#F59E0B' }} />
          <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 500 }}>
            Historical Lineage Checks
          </span>
        </div>
      </div>
    </div>
  );
};
