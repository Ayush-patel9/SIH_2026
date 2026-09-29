import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import type { QueryUnderstanding, QueryIntent } from '../../types';
import type { ManualEntityCorrections } from './refinedQueryBuilder';

interface QueryCorrectionFormProps {
  understanding?: QueryUnderstanding | null;
  onCorrect: (corrections: ManualEntityCorrections) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export const QueryCorrectionForm: React.FC<QueryCorrectionFormProps> = ({
  understanding,
  onCorrect,
  onClose,
  isOpen = true,
}) => {
  const [productName, setProductName] = useState<string>(
    understanding?.product_name ||
      understanding?.extracted_entities?.find((e) => e.type === 'PRODUCT')?.entity ||
      ''
  );
  const [grade, setGrade] = useState<string>(
    understanding?.grade_specification ||
      understanding?.extracted_entities?.find((e) => e.type === 'GRADE_SPECIFICATION')?.entity ||
      ''
  );
  const [domain, setDomain] = useState<string>(
    understanding?.domain ||
      understanding?.extracted_entities?.find((e) => e.type === 'APPLICATION_DOMAIN')?.entity ||
      'Civil Construction'
  );
  const [subdomain, setSubdomain] = useState<string>(understanding?.subdomain || 'Highway Infrastructure');
  const [queryIntent, setQueryIntent] = useState<QueryIntent>(
    understanding?.query_intent || 'STANDARD_LOOKUP'
  );
  const [applied, setApplied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const corrections: ManualEntityCorrections = {
      product_name: productName.trim() || undefined,
      grade_specification: grade.trim() || undefined,
      domain: domain.trim() || undefined,
      subdomain: subdomain.trim() || undefined,
      query_intent: queryIntent,
    };

    onCorrect(corrections);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      if (onClose) onClose();
    }, 1000);
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderLeft: '4px solid var(--collapse-cobalt)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div className="section-label" style={{ margin: '0 0 2px 0' }}>
            MANUAL ENTITY OVERRIDE & REFINEMENT
          </div>
          <h3 style={{ fontFamily: 'var(--font-prose)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>
            Officer Query Understanding Override
          </h3>
        </div>

        {onClose && (
          <button
            type="button"
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '11px' }}
            onClick={onClose}
          >
            <X size={12} />
            <span>Close</span>
          </button>
        )}
      </div>

      {applied ? (
        <div className="auth-banner success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', textAlign: 'center' }}>
          <CheckCircle2 size={16} />
          <strong>Entity Corrections Applied (100% Officer Verified)</strong>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <label className="auth-label">
              Product Entity Name
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Ordinary Portland Cement"
                className="auth-input"
                style={{ fontSize: '12px' }}
              />
            </label>

            <label className="auth-label">
              Grade / Technical Specification
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 43 Grade or Fe 500D"
                className="auth-input font-mono"
                style={{ fontSize: '12px' }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <label className="auth-label">
              Application Domain
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="auth-input auth-select"
                style={{ fontSize: '12px' }}
              >
                <option value="Civil Construction">Civil Construction & Housing (CED)</option>
                <option value="Highway Infrastructure">Highway & Bridge Engineering (IRC/MoRTH)</option>
                <option value="Metallurgy & Steel">Metallurgy & Structural Steel (MTD)</option>
                <option value="Electronics & IT">Electronics & IT Hardware (LITD)</option>
                <option value="Electrical Engineering">Electrical Power & Solar PV (ETD)</option>
                <option value="Chemicals & Fertilizers">Chemicals & Petroleum (PCD)</option>
              </select>
            </label>

            <label className="auth-label">
              Specific Subdomain / Zone
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="e.g. Bridge Deck Wearing Course"
                className="auth-input"
                style={{ fontSize: '12px' }}
              />
            </label>

            <label className="auth-label">
              Procurement Query Intent
              <select
                value={queryIntent}
                onChange={(e) => setQueryIntent(e.target.value as QueryIntent)}
                className="auth-input auth-select"
                style={{ fontSize: '12px' }}
              >
                <option value="STANDARD_LOOKUP">Primary Standard Lookup</option>
                <option value="COMPLIANCE_CHECK">Statutory Compliance Check</option>
                <option value="ALLIED_DISCOVERY">Allied Standards Discovery</option>
                <option value="OUTDATED_DETECTION">Outdated Citation Detection</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            {onClose && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                style={{ fontSize: '12px' }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-run"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
            >
              <span>Apply Entity Override</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
