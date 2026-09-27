import React, { useState } from 'react';

export const MCPConfigSnippet: React.FC = () => {
  const [activeClient, setActiveClient] = useState<'claude' | 'cursor' | 'antigravity'>('claude');
  const [copied, setCopied] = useState<boolean>(false);

  const configs = {
    claude: JSON.stringify(
      {
        mcpServers: {
          'bis-standards-intelligence': {
            command: 'python',
            args: ['application/mcp_server/server.py'],
            env: { GEMINI_API_KEYS: 'your-key-here' },
          },
        },
      },
      null,
      2
    ),
    cursor: JSON.stringify(
      {
        mcp: {
          servers: {
            manakai: {
              url: 'http://localhost:8001/tools',
              transport: 'http',
            },
          },
        },
      },
      null,
      2
    ),
    antigravity: JSON.stringify(
      {
        mcp_servers: [
          {
            name: 'manakai-standards-intelligence',
            endpoint: 'http://localhost:8001/tools/call',
            tools: [
              'get_standard_recommendation',
              'check_standard_status',
              'list_active_alerts',
              'generate_nit_clause',
              'find_testing_labs',
              'verify_isi_licensee',
            ],
          },
        ],
      },
      null,
      2
    ),
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(configs[activeClient]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="workbench-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div className="section-label" style={{ margin: '0 0 2px 0' }}>
            EXTERNAL AI INTEGRATION CONFIGURATION
          </div>
          <h3 style={{ fontFamily: 'var(--font-prose)', fontSize: '17px', fontWeight: 600, color: 'var(--ink)' }}>
            MCP Client Configuration Snippet
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="palette" style={{ margin: 0 }}>
            <button
              type="button"
              className={`palette-btn ${activeClient === 'claude' ? 'selected' : ''}`}
              onClick={() => setActiveClient('claude')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Claude Desktop
            </button>
            <button
              type="button"
              className={`palette-btn ${activeClient === 'cursor' ? 'selected' : ''}`}
              onClick={() => setActiveClient('cursor')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Cursor IDE
            </button>
            <button
              type="button"
              className={`palette-btn ${activeClient === 'antigravity' ? 'selected' : ''}`}
              onClick={() => setActiveClient('antigravity')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Antigravity / Gemini
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            {copied ? '✓ Copied Config' : '📋 Copy JSON'}
          </button>
        </div>
      </div>

      <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: '0 0 10px 0' }}>
        Paste this configuration into your client's settings file to allow LLM agents to invoke live Indian Standards verification tools.
      </p>

      <textarea
        readOnly
        rows={9}
        value={configs[activeClient]}
        className="font-mono"
        style={{
          width: '100%',
          fontSize: '12px',
          lineHeight: '1.5',
          background: '#18181B',
          color: '#F4F4F5',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #27272A',
        }}
      />
    </div>
  );
};
