import React, { useState, useEffect } from 'react';
import { Scale, Download } from 'lucide-react';
import type { StandardsResponse, AlternativeRecommendation } from '../../types';
import { ConflictResolver } from './ConflictResolver';
import { StandardsComparator } from './StandardsComparator';
import { AlliedStandardsMatrix } from './AlliedStandardsMatrix';


interface ComparisonViewProps {
  currentData?: StandardsResponse | null;
  onPromotePrimary?: (alternative: AlternativeRecommendation) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  currentData,
  onPromotePrimary,
}) => {
  if (!currentData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="workbench-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <Scale size={32} style={{ color: 'var(--ink-muted)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
            No Active Standard Query for Comparison
          </h3>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', maxWidth: '520px', margin: '8px auto 0 auto' }}>
            Please search for an item (e.g. "Ordinary Portland Cement", "Structural Steel", "HDPE Pipes") in the search bar above to generate the primary standard, candidate alternatives, and allied test methods ecosystem.
          </p>
        </div>
      </div>
    );
  }

  const [alternatives, setAlternatives] = useState<AlternativeRecommendation[]>(
    currentData.alternative_recommendations || []
  );

  // Update alternatives whenever currentData changes, without hardcoded fallbacks
  useEffect(() => {
    setAlternatives(currentData.alternative_recommendations || []);
  }, [currentData]);

  const conflict = currentData.conflict_resolution || null;
  const primary = currentData.primary_recommendation;

  const handleAddAlternative = (alt: AlternativeRecommendation) => {
    if (!alternatives.some((a) => a.is_number === alt.is_number)) {
      setAlternatives((prev) => [...prev, alt]);
    }
  };

  const handleRemoveAlternative = (isNumber: string) => {
    setAlternatives((prev) => prev.filter((a) => a.is_number !== isNumber));
  };

  const handleExportCSV = () => {
    const headers = ['Attribute', primary.is_number, ...alternatives.map((a) => a.is_number)];
    const rows = [
      ['Title', `"${primary.title}"`, ...alternatives.map((a) => `"${a.title}"`)],
      ['Status', primary.status, ...alternatives.map((a) => a.status)],
      ['Year Published', primary.year_published || 'N/A', ...alternatives.map((a) => a.year_published || 'N/A')],
      ['Latest Amendment', primary.latest_amendment || 'Base Issue', ...alternatives.map((a) => a.latest_amendment || 'N/A')],
      ['BIS Mandatory', primary.certification?.mandatory ? 'YES' : 'NO', ...alternatives.map((a) => (a.certification?.mandatory ? 'YES' : 'NO'))],
      ['Certification Scheme', primary.certification?.scheme || 'N/A', ...alternatives.map((a) => a.certification?.scheme || 'N/A')],
      ['AI Confidence', `${(primary.confidence * 100).toFixed(1)}%`, ...alternatives.map((a) => `${(a.confidence * 100).toFixed(1)}%`)],
      ['Why Not Primary', 'PRIMARY SELECTED', ...alternatives.map((a) => `"${a.why_not_primary || 'N/A'}"`)],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Standards_Comparison_${primary.is_number.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* View Header */}
      <div
        className="workbench-card"
        style={{
          padding: '16px 20px',
          background: 'var(--surface)',
          borderLeft: '4px solid var(--superposition-violet)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0 }}>
                STANDARDS COMPARATOR & ALLIED ECOSYSTEM (FEATURE 06)
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-prose)', fontSize: '20px', fontWeight: 600, color: 'var(--ink)', margin: '4px 0 2px 0' }}>
              Side-by-Side Comparator & Allied Ecosystem
            </h2>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Resolve specification ambiguity between competing candidate standards and audit mandatory test method ecosystems.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleExportCSV}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
            >
              <Download size={14} />
              <span>Export Comparison CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Component 3: Conflict Precedence Resolver Banner */}
      {conflict && <ConflictResolver conflict={conflict} />}

      {/* Component 1: Side-By-Side Standards Comparator */}
      <StandardsComparator
        primary={primary}
        alternatives={alternatives}
        onPromotePrimary={onPromotePrimary}
        onRemoveAlternative={handleRemoveAlternative}
        onAddAlternative={handleAddAlternative}
      />

      {/* Component 2: Grouped Allied Standards Ecosystem Matrix */}
      <AlliedStandardsMatrix data={currentData} />
    </div>
  );
};
