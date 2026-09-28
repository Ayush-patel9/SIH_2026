import React from 'react';
import type { StandardsResponse } from '../../types';
import { MCPToolRunner } from './MCPToolRunner';
import { MCPConfigSnippet } from './MCPConfigSnippet';

interface MCPViewProps {
  currentData?: StandardsResponse | null;
}

export const MCPView: React.FC<MCPViewProps> = ({ currentData }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div
        className="workbench-card"
        style={{
          padding: '16px 20px',
          background: 'var(--surface)',
          borderLeft: '4px solid var(--superposition-violet)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0 }}>
                MODEL CONTEXT PROTOCOL (MCP) INTEGRATION (FEATURE 09)
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-prose)', fontSize: '20px', fontWeight: 600, color: 'var(--ink)', margin: '4px 0 2px 0' }}>
              Standards Context Server & External AI Integration
            </h2>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Exposes live BIS standards intelligence as structured tools for external AI models (Claude, Gemini, Cursor, and Ministry LLMs).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '4px',
                background: '#F3E8FF',
                color: 'var(--superposition-violet)',
                border: '1px solid #E9D5FF',
                fontWeight: 700,
              }}
            >
              PORT 8001 (MCP HTTP / STDIO)
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div className="workbench-card" style={{ padding: '14px 18px' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px' }}>REGISTERED MCP TOOLS</div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
            6 Tools Active
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)', marginTop: '2px' }}>
            get_rec, check_status, alerts...
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderLeft: '3px solid var(--emerald-pass)' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px', color: 'var(--emerald-pass)' }}>
            PROTOCOL SUPPORT
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '16px', fontWeight: 700, color: 'var(--emerald-pass)' }}>
            FastMCP + REST
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)', marginTop: '2px' }}>
            JSON Schema Specification
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderLeft: '3px solid var(--collapse-cobalt)' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px', color: 'var(--collapse-cobalt)' }}>
            DATA PIPELINE DECOUPLING
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '16px', fontWeight: 700, color: 'var(--collapse-cobalt)' }}>
            100% JSON Contract
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Zero direct model dependencies
          </div>
        </div>
      </div>

      {/* Interactive Tool Runner */}
      <MCPToolRunner currentData={currentData} />

      {/* External Client Config Generator */}
      <MCPConfigSnippet />
    </div>
  );
};
