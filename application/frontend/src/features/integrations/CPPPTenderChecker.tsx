import React, { useState } from 'react';

interface CPPPValidationIssue {
  type: 'WITHDRAWN_STANDARD' | 'MISSING_ALLIED' | 'QCO_MANDATORY' | 'VALID_STANDARD';
  severity: 'CRITICAL' | 'WARNING' | 'SUCCESS';
  title: string;
  description: string;
  autoFixText?: string;
}

export const CPPPTenderChecker: React.FC = () => {
  const [tenderRef, setTenderRef] = useState('CPPP/2026/PWD-DEL/9082');
  const [procurementTitle, setProcurementTitle] = useState(
    'Construction of 4-Lane Elevated Flyover Package 2: Supply of 43 Grade Cement and Structural Steel'
  );
  const [tenderSpecText, setTenderSpecText] = useState(
    `1. Cement: The contractor shall supply 43 Grade Ordinary Portland Cement conforming to IS 8112:1989.\n2. Steel: Structural steel plates and angles shall conform to IS 2062:2011 Grade E250.\n3. Testing: Routine testing shall be conducted on site.`
  );
  const [submitted, setSubmitted] = useState(false);

  // Derive validation issues from text
  const getValidationIssues = (): CPPPValidationIssue[] => {
    const issues: CPPPValidationIssue[] = [];

    if (tenderSpecText.includes('IS 8112:1989') || tenderSpecText.includes('IS 8112')) {
      issues.push({
        type: 'WITHDRAWN_STANDARD',
        severity: 'CRITICAL',
        title: 'Withdrawn Standard Cited: IS 8112:1989',
        description:
          'IS 8112 was withdrawn and superseded by IS 269:2015. Citing IS 8112 violates CVC guidelines and GFR 144(xi).',
        autoFixText: tenderSpecText.replace(/IS 8112:1989|IS 8112/g, 'IS 269:2015 (incorporating 43-Grade)'),
      });
    }

    if (tenderSpecText.includes('IS 2062')) {
      issues.push({
        type: 'VALID_STANDARD',
        severity: 'SUCCESS',
        title: 'Active Standard Validated: IS 2062:2011',
        description:
          'IS 2062 is active and enforced under Steel Products Quality Control Order 2024 with mandatory ISI marking.',
      });
    }

    if (!tenderSpecText.includes('IS 4031') && (tenderSpecText.toLowerCase().includes('cement') || tenderSpecText.includes('IS 269'))) {
      issues.push({
        type: 'MISSING_ALLIED',
        severity: 'WARNING',
        title: 'Missing Allied Test Method: IS 4031',
        description:
          'Mandatory 7-day and 28-day compressive strength testing per IS 4031 is omitted from the inspection clause.',
        autoFixText:
          tenderSpecText +
          '\n4. Inspection: All cement consignments shall be accompanied by manufacturer test certificates conforming to IS 4031 physical testing methods.',
      });
    }

    return issues;
  };

  const issues = getValidationIssues();
  const hasCritical = issues.some((i) => i.severity === 'CRITICAL');

  const handleApplyFix = (fixedText?: string) => {
    if (fixedText) {
      setTenderSpecText(fixedText);
    }
  };

  const handleAutoFixAll = () => {
    let updated = tenderSpecText;
    if (updated.includes('IS 8112:1989') || updated.includes('IS 8112')) {
      updated = updated.replace(/IS 8112:1989|IS 8112/g, 'IS 269:2015');
    }
    if (!updated.includes('IS 4031')) {
      updated += '\n4. Mandatory Testing: Test certificates per IS 4031 required with each batch.';
    }
    setTenderSpecText(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* CPPP Mock Portal Header */}
      <div
        style={{
          background: '#1A365D',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: '#3182CE',
              color: '#ffffff',
              fontWeight: 900,
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            eProcure CPPP
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>
              Central Public Procurement Portal (CPPP)
            </div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>
              National Informatics Centre (NIC) · ManakAI Pre-Tender Real-Time Quality Gatekeeper
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: hasCritical ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.25)',
              border: `1px solid ${hasCritical ? '#ef4444' : '#22c55e'}`,
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-data)',
              fontWeight: 700,
            }}
          >
            {hasCritical ? '⛔ NIT Publication Blocked' : '🟢 Ready for Tender Notice Publish'}
          </span>
        </div>
      </div>

      {/* Tender Creation Form & Real-Time Validator Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)', gap: '16px' }}>
        {/* Left Pane: CPPP E-Tender Editor */}
        <div className="workbench-card" style={{ padding: '20px' }}>
          <div className="section-label" style={{ marginBottom: '6px' }}>
            CPPP E-TENDER DRAFTING DESK (PRE-NIT STAGE)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-data)', color: 'var(--ink-muted)' }}>
                TENDER REFERENCE NUMBER
              </label>
              <input
                type="text"
                value={tenderRef}
                onChange={(e) => setTenderRef(e.target.value)}
                className="auth-input"
                style={{ width: '100%', fontSize: '12px', marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-data)', color: 'var(--ink-muted)' }}>
                WORK TITLE & PROCUREMENT SCOPE
              </label>
              <input
                type="text"
                value={procurementTitle}
                onChange={(e) => setProcurementTitle(e.target.value)}
                className="auth-input"
                style={{ width: '100%', fontSize: '12px', marginTop: '4px' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', fontFamily: 'var(--font-data)', color: 'var(--ink-muted)' }}>
                  TECHNICAL SPECIFICATIONS & APPLICABLE STANDARDS CLAUSE
                </label>
                <span style={{ fontSize: '10px', color: 'var(--collapse-cobalt)', fontFamily: 'var(--font-data)' }}>
                  ● ManakAI Live Checking
                </span>
              </div>
              <textarea
                rows={7}
                value={tenderSpecText}
                onChange={(e) => setTenderSpecText(e.target.value)}
                className="auth-input"
                style={{
                  width: '100%',
                  fontSize: '12px',
                  fontFamily: 'var(--font-data)',
                  marginTop: '4px',
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAutoFixAll}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                ⚡ 1-Click Resolve All BIS Discrepancies
              </button>

              <button
                type="button"
                className="btn-run"
                disabled={hasCritical}
                onClick={() => setSubmitted(true)}
                style={{
                  fontSize: '12px',
                  padding: '6px 16px',
                  background: hasCritical ? 'var(--hairline)' : 'var(--collapse-cobalt)',
                  color: hasCritical ? 'var(--ink-muted)' : '#ffffff',
                  cursor: hasCritical ? 'not-allowed' : 'pointer',
                }}
              >
                {hasCritical ? '⛔ Blocked: Fix Withdrawn Standards' : '🚀 Publish NIT to CPPP'}
              </button>
            </div>

            {submitted && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(22, 163, 74, 0.1)',
                  border: '1px solid #16a34a',
                  color: '#15803d',
                  fontSize: '12px',
                  fontFamily: 'var(--font-data)',
                }}
              >
                ✓ <strong>TENDER NOTICE PUBLISHED SUCCESSFULLY!</strong> CPPP Notice ID: #CPPP-2026-9082. ManakAI Statutory Hash: 8f910a3c... (Archived in National Procurement Audit Registry).
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Real-Time Pre-Check Validation Stream */}
        <div className="workbench-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label" style={{ margin: 0 }}>
              REAL-TIME MANAKAI STATUTORY VALIDATION
            </span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-data)',
                fontWeight: 700,
                color: hasCritical ? '#dc2626' : '#16a34a',
              }}
            >
              {issues.length} Issues Found
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {issues.map((issue, idx) => {
              const isCrit = issue.severity === 'CRITICAL';
              const isWarn = issue.severity === 'WARNING';

              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isCrit
                      ? 'rgba(239, 68, 68, 0.08)'
                      : isWarn
                      ? 'rgba(234, 179, 8, 0.08)'
                      : 'rgba(34, 197, 94, 0.08)',
                    borderLeft: `4px solid ${isCrit ? '#dc2626' : isWarn ? '#ca8a04' : '#16a34a'}`,
                    borderTop: '1px solid var(--hairline)',
                    borderRight: '1px solid var(--hairline)',
                    borderBottom: '1px solid var(--hairline)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isCrit ? '#b91c1c' : isWarn ? '#854d0e' : '#15803d',
                      }}
                    >
                      {isCrit ? '🔴' : isWarn ? '🟡' : '🟢'} {issue.title}
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: 'var(--font-prose)',
                      fontSize: '12px',
                      color: 'var(--ink-secondary)',
                      margin: '0 0 8px 0',
                      lineHeight: 1.4,
                    }}
                  >
                    {issue.description}
                  </p>

                  {issue.autoFixText && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleApplyFix(issue.autoFixText)}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      ⚡ Auto-Fix in Draft
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 'auto',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              fontSize: '11px',
              fontFamily: 'var(--font-prose)',
              color: 'var(--ink-secondary)',
            }}
          >
            <strong>CVC Audit Vigilance Note:</strong> Under Central Vigilance Commission guidelines, procurement tenders referencing withdrawn or superseding standards are subject to mandatory re-tendering and penalty audits.
          </div>
        </div>
      </div>
    </div>
  );
};
