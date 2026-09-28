import React, { useState } from 'react';
import type { StandardsResponse } from '../../types';
import { MCP_TOOLS_MANIFEST, executeMCPTool } from './mcpClient';
import type { MCPToolDefinition } from './mcpClient';

interface MCPToolRunnerProps {
  currentData?: StandardsResponse | null;
}

export const MCPToolRunner: React.FC<MCPToolRunnerProps> = ({ currentData }) => {
  const [selectedTool, setSelectedTool] = useState<MCPToolDefinition>(MCP_TOOLS_MANIFEST[0]);
  const [params, setParams] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    MCP_TOOLS_MANIFEST[0].parameters.forEach((p) => {
      init[p.name] = p.default || '';
    });
    return init;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<{
    result: any;
    source: string;
    latencyMs: number;
    timestamp: string;
  } | null>(null);

  const handleSelectTool = (tool: MCPToolDefinition) => {
    setSelectedTool(tool);
    const newParams: Record<string, any> = {};
    tool.parameters.forEach((p) => {
      newParams[p.name] = p.default || '';
    });
    setParams(newParams);
    setExecutionResult(null);
  };

  const handleParamChange = (paramName: string, val: string) => {
    setParams((prev) => ({ ...prev, [paramName]: val }));
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await executeMCPTool(selectedTool.name, params, currentData);
      setExecutionResult({
        ...res,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="workbench-card" style={{ padding: '20px' }}>
      <div className="section-label" style={{ margin: '0 0 4px 0' }}>
        INTERACTIVE TOOL EXECUTION CONSOLE
      </div>
      <h3 style={{ fontFamily: 'var(--font-prose)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '12px' }}>
        MCP Tool Call Dispatcher
      </h3>

      {/* Tool Selector Tabs */}
      <div className="palette" style={{ marginBottom: '16px' }}>
        {MCP_TOOLS_MANIFEST.map((tool) => (
          <button
            key={tool.name}
            type="button"
            className={`palette-btn ${selectedTool.name === tool.name ? 'selected' : ''}`}
            onClick={() => handleSelectTool(tool)}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            {tool.name}()
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '20px' }}>
        {/* Left: Tool Parameters Form */}
        <form onSubmit={handleExecute} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--paper)',
              borderRadius: '4px',
              border: '1px solid var(--hairline)',
            }}
          >
            <div className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--collapse-cobalt)' }}>
              {selectedTool.name}
            </div>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', margin: '4px 0 0 0', lineHeight: '1.35' }}>
              {selectedTool.description}
            </p>
          </div>

          <div className="section-label" style={{ margin: '4px 0 0 0', fontSize: '10px' }}>
            INPUT PARAMETERS (JSON SCHEMA)
          </div>

          {selectedTool.parameters.map((p) => (
            <label key={p.name} className="auth-label" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="font-mono" style={{ fontSize: '11px', fontWeight: 600 }}>
                  {p.name} {p.required && <strong style={{ color: 'var(--error-line)' }}>*</strong>}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>({p.type})</span>
              </div>
              <input
                type="text"
                value={params[p.name] ?? ''}
                onChange={(e) => handleParamChange(p.name, e.target.value)}
                placeholder={p.description}
                className="auth-input font-mono"
                style={{ fontSize: '11px', padding: '6px 8px' }}
                required={p.required}
              />
            </label>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-run"
            style={{ marginTop: '4px', padding: '8px 14px', fontSize: '12px' }}
          >
            {isLoading ? 'Executing MCP Dispatch...' : `Execute ${selectedTool.name}() →`}
          </button>
        </form>

        {/* Right: Response Output Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="section-label" style={{ margin: 0 }}>
              STRUCTURED TOOL RESPONSE (JSON)
            </div>
            {executionResult && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    background: executionResult.source === 'live_http_server' ? '#DCFCE7' : '#EFF6FF',
                    color: executionResult.source === 'live_http_server' ? 'var(--emerald-pass)' : 'var(--collapse-cobalt)',
                    fontWeight: 700,
                  }}
                >
                  {executionResult.source === 'live_http_server' ? 'HTTP :8001' : 'EMULATOR'}
                </span>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                  {executionResult.latencyMs}ms • {executionResult.timestamp}
                </span>
              </div>
            )}
          </div>

          <textarea
            readOnly
            rows={14}
            value={
              executionResult
                ? JSON.stringify(executionResult.result, null, 2)
                : '// Click "Execute Tool" to dispatch a live MCP tool call and inspect the JSON payload...'
            }
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
      </div>
    </div>
  );
};
