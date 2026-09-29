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

export const EmptySearchState: React.FC<EmptySearchStateProps> = ({ onSelectSample: _onSelectSample }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
        animation: 'fadeIn 0.25s ease-out',
        textAlign: 'center',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'var(--surface-secondary, #F5F2EB)',
          border: '1px solid var(--hairline, #E5E0D4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--forest, #36452F)',
        }}
      >
        <Search size={26} />
      </div>

      {/* Main Headline */}
      <h2
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '8px',
          letterSpacing: '-0.015em',
        }}
      >
        Search Any Indian Standard or Material
      </h2>

      {/* Clean Subtitle */}
      <p
        style={{
          fontFamily: 'var(--font-prose)',
          fontSize: '14px',
          color: 'var(--ink-secondary)',
          maxWidth: '560px',
          lineHeight: 1.6,
          marginBottom: '28px',
        }}
      >
        Enter any material, engineering product, or standard number in the search bar above to verify active specifications, statutory QCO rules, laboratory test protocols, and CVC defense records.
      </p>

      {/* Institutional Feature Highlights */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          width: '100%',
          paddingTop: '20px',
          borderTop: '1px solid var(--hairline)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <ShieldCheck size={16} style={{ color: '#15803D' }} />
          <span style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', fontWeight: 600, fontFamily: 'var(--font-data)' }}>
            Mandatory ISI / QCO Rules
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <GitBranch size={16} style={{ color: '#2563EB' }} />
          <span style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', fontWeight: 600, fontFamily: 'var(--font-data)' }}>
            22,011 Standards Knowledge Graph
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <History size={16} style={{ color: '#D97706' }} />
          <span style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', fontWeight: 600, fontFamily: 'var(--font-data)' }}>
            Historical Supersession Lineage
          </span>
        </div>
      </div>
    </div>
  );
};
