import React, { useState, useRef, useEffect } from 'react';
import type { StandardsResponse } from '../types';

interface AuthorityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeData: StandardsResponse;
  messages: Array<{ id: number; type: string; source?: string; text: string }>;
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

export const AuthorityDrawer: React.FC<AuthorityDrawerProps> = ({
  isOpen,
  onClose,
  activeData,
  messages,
  onSendMessage,
  isProcessing,
}) => {
  const [inputQuestion, setInputQuestion] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isProcessing) return;
    onSendMessage(inputQuestion);
    setInputQuestion('');
  };

  const handleCopyHash = () => {
    const hash = activeData.audit_record?.audit_hash || activeData.meta.audit_reference_hash;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeSlideUp 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F8FAFC',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>⚖️</span>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                Gazette Authority & Legal Assistant
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                color: '#64748B',
                marginTop: '2px',
              }}
            >
              Active: {activeData.primary_recommendation.is_number} ({activeData.primary_recommendation.year_published})
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Audit Hash Pill */}
        <div
          style={{
            padding: '10px 16px',
            background: '#F1F5F9',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '9.5px', color: '#64748B', fontWeight: 700 }}>
              IMMUTABLE AUDIT RECORD
            </div>
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                color: '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activeData.audit_record?.audit_hash || activeData.meta.audit_reference_hash}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyHash}
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              background: copiedHash ? '#10B981' : '#FFFFFF',
              color: copiedHash ? '#FFFFFF' : '#0F172A',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {copiedHash ? '✓ Copied' : 'Copy Hash'}
          </button>
        </div>

        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.map((msg) => {
            let icon = '⚖️';
            let label = 'GAZETTE AUTHORITY';
            let bg = '#F8FAFC';
            let border = '#E2E8F0';
            let borderLeft = '#1E3A8A';

            if (msg.source === 'alert') {
              icon = '🚨';
              label = 'LIVE ALERT';
              bg = '#FFF7ED';
              border = '#FED7AA';
              borderLeft = '#EA580C';
            } else if (msg.type === 'user') {
              icon = '👤';
              label = 'OFFICER QUERY';
              bg = '#F5F3FF';
              border = '#DDD6FE';
              borderLeft = '#7C3AED';
            }

            return (
              <div
                key={msg.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  borderLeft: `3.5px solid ${borderLeft}`,
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: '#0F172A',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-data)',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#64748B',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
                <div>{msg.text}</div>
              </div>
            );
          })}

          {isProcessing && (
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '11.5px',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
              }}
            >
              <span style={{ animation: 'pulse 1s infinite' }}>⚙️</span>
              Cross-referencing Gazette Notifications & CVC Guidelines...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts & Input Box */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {['Is ISI mark mandatory?', 'What is latest amendment?', 'Test methods?'].map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSendMessage(q)}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                + {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask a question about this standard..."
              style={{
                flex: 1,
                height: '38px',
                padding: '0 12px',
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
              }}
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isProcessing}
              className="btn-run"
              style={{ height: '38px', padding: '0 16px', fontSize: '12.5px' }}
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
