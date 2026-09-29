import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, Trash2, Send, Shield, BookOpen, AlertCircle, AtSign } from 'lucide-react';
import type { StandardsResponse } from '../types';
import { StandardMentionAutocomplete } from './StandardMentionAutocomplete';
import type { StandardMentionItem } from '../data/standardsMentionCatalog';

interface MessageItem {
  id: number | string;
  type: string;
  source?: string;
  text: string;
  sender?: string;
  model_used?: string;
  timestamp?: string;
}

interface AuthorityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeData?: StandardsResponse | null;
  messages: MessageItem[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  onClearMessages?: () => void;
}

// Markdown Formatter Component for rich AI responses
const FormattedMessageText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', lineHeight: 1.6 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: '4px' }} />;
        }

        // Blockquote
        if (trimmed.startsWith('>')) {
          const content = trimmed.replace(/^>\s*/, '');
          return (
            <div
              key={idx}
              style={{
                borderLeft: '3px solid #3B82F6',
                paddingLeft: '10px',
                margin: '4px 0',
                color: '#1E293B',
                fontStyle: 'italic',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                padding: '6px 10px',
                borderRadius: '0 6px 6px 0',
              }}
            >
              {renderFormattedInline(content)}
            </div>
          );
        }

        // Heading
        if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <div
              key={idx}
              style={{
                fontWeight: 700,
                fontSize: '13.5px',
                color: '#0F172A',
                marginTop: '4px',
              }}
            >
              {renderFormattedInline(headingText)}
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletContent = trimmed.substring(2);
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', paddingLeft: '4px' }}>
              <span style={{ color: '#2563EB', fontWeight: 'bold' }}>•</span>
              <span style={{ flex: 1 }}>{renderFormattedInline(bulletContent)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', paddingLeft: '4px' }}>
              <span style={{ color: '#475569', fontWeight: 600, minWidth: '16px' }}>{numMatch[1]}.</span>
              <span style={{ flex: 1 }}>{renderFormattedInline(numMatch[2])}</span>
            </div>
          );
        }

        return <div key={idx}>{renderFormattedInline(line)}</div>;
      })}
    </div>
  );
};

// Helper for bold and code tags inline
function renderFormattedInline(str: string): React.ReactNode[] {
  // Matches **bold** or `code`
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: '#0F172A', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            fontFamily: 'var(--font-data, monospace)',
            backgroundColor: '#E2E8F0',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#0F172A',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const AuthorityDrawer: React.FC<AuthorityDrawerProps> = ({
  isOpen,
  onClose,
  activeData,
  messages,
  onSendMessage,
  isProcessing,
  onClearMessages,
}) => {
  const [inputQuestion, setInputQuestion] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<number | string | null>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isProcessing]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isProcessing) return;
    onSendMessage(inputQuestion.trim());
    setInputQuestion('');
    setMentionOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart || val.length;
    setInputQuestion(val);

    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const queryPart = textBeforeCursor.slice(lastAtIndex + 1);
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
        if (queryPart.length <= 30 && !queryPart.includes('\n')) {
          setMentionOpen(true);
          setMentionQuery(queryPart);
          setMentionStartIndex(lastAtIndex);
          return;
        }
      }
    }

    setMentionOpen(false);
  };

  const handleSelectMention = (item: StandardMentionItem) => {
    const cleanIs = item.is_number.split(':')[0].trim();
    const tag = `@${cleanIs} `;

    let newText = '';
    let newCursor = 0;

    if (mentionStartIndex !== -1) {
      const beforeAt = inputQuestion.slice(0, mentionStartIndex);
      const afterMention = inputQuestion.slice(mentionStartIndex + mentionQuery.length + 1);
      newText = `${beforeAt}${tag}${afterMention}`;
      newCursor = (beforeAt + tag).length;
    } else {
      newText = inputQuestion ? `${inputQuestion} ${tag}` : tag;
      newCursor = newText.length;
    }

    setInputQuestion(newText);
    setMentionOpen(false);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 40);
  };

  const handleCopyHash = () => {
    const hash = activeData?.audit_record?.audit_hash || activeData?.meta?.audit_reference_hash || 'SHA256-PENDING';
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyMessage = (id: number | string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const primary = activeData?.primary_recommendation;
  const isNumber = primary?.is_number;

  const dynamicQuickPrompts = isNumber
    ? [
        { label: '⚖️ Is ISI Mark mandatory?', text: `Is ISI mark or BIS certification mandatory for ${isNumber}? What is the statutory QCO?` },
        { label: '🧪 Mandatory Lab Tests', text: `What are the mandatory laboratory test methods and parameter limits specified under ${isNumber}?` },
        { label: '🛡️ CVC Defense & GFR 144', text: `How does citing ${isNumber} defend against CVC audit objections and comply with GFR Rule 144?` },
        { label: '📝 Draft Tender Clause', text: `Draft a citation-ready NIT tender clause enforcing ${isNumber} with NABL test requirements.` },
        { label: '🔄 Supersession History', text: `Has ${isNumber} superseded any older standard version or received recent amendments?` },
      ]
    : [
        { label: '⚖️ Section 16 BIS Act', text: 'Explain the legal enforceability of Quality Control Orders under Section 16 of BIS Act 2016.' },
        { label: '🛡️ GFR 144(i) Rules', text: 'How does GFR 2017 Rule 144 mandate Indian Standards in government procurement?' },
        { label: '🔍 Mandatory QCO List', text: 'How do I check if a product category falls under compulsory ISI mark certification?' },
        { label: '🏢 NABL Lab Mandates', text: 'What are the rules for third-party lab testing and Manufacturer Test Certificates (MTC)?' },
      ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-6px 0 28px rgba(15, 23, 42, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeSlideUp 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#1E293B',
                color: '#FFFEFB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                boxShadow: '0 2px 6px rgba(15,23,42,0.15)',
              }}
            >
              ⚖️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-ui, sans-serif)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                >
                  BIS Authority & Legal Assistant
                </span>
                <span
                  style={{
                    fontSize: '9.5px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: '#DBEAFE',
                    color: '#1E40AF',
                    fontWeight: 700,
                  }}
                >
                  LIVE AI
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-data, monospace)',
                  fontSize: '11px',
                  color: '#64748B',
                  marginTop: '1px',
                }}
              >
                {primary ? `Scope: ${primary.is_number} (${primary.year_published})` : 'Scope: Bureau Standards & Gazette Law'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onClearMessages && messages.length > 0 && (
              <button
                type="button"
                onClick={onClearMessages}
                title="Clear Chat History"
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
                  fontSize: '13px',
                }}
              >
                <Trash2 size={13} />
              </button>
            )}
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
                fontWeight: 'bold',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Audit Hash Pill */}
        <div
          style={{
            padding: '8px 16px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: '#64748B', fontWeight: 700, letterSpacing: '0.04em' }}>
              IMMUTABLE AUDIT RECORD (SHA-256)
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
              {activeData?.audit_record?.audit_hash || activeData?.meta?.audit_reference_hash || 'SHA256: 7F9E8200B41ECA89F9A1... (STANDBY)'}
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
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#FCFCFD',
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: '#64748B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                🤖
              </div>
              <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#1E293B' }}>
                BIS Legal & Technical Authority Assistant
              </div>
              <div style={{ fontSize: '12px', maxWidth: '320px', lineHeight: 1.5 }}>
                Ask questions regarding mandatory QCO Gazette notifications, test protocols, GFR 144 compliance, and tender clause formulations.
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.type === 'user' || msg.sender === 'user';
            const isAlert = msg.source === 'alert';

            let icon = isUser ? '👤' : isAlert ? '🚨' : '⚖️';
            let label = isUser ? 'OFFICER QUERY' : isAlert ? 'LIVE GAZETTE ALERT' : 'BIS AUTHORITY AI';
            let bg = isUser ? '#F8FAFC' : isAlert ? '#FFF7ED' : '#FFFFFF';
            let border = isUser ? '#E2E8F0' : isAlert ? '#FED7AA' : '#E2E8F0';
            let borderLeft = isUser ? '#6366F1' : isAlert ? '#EA580C' : '#1E3A8A';

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
                  boxShadow: isUser ? 'none' : '0 1px 3px rgba(0,0,0,0.03)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
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
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                    {msg.model_used && (
                      <span style={{ fontSize: '8.5px', color: '#94A3B8', fontWeight: 500 }}>
                        · {msg.model_used}
                      </span>
                    )}
                  </div>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      title="Copy Answer Text"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedMsgId === msg.id ? '#10B981' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        padding: '2px 4px',
                      }}
                    >
                      {copiedMsgId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedMsgId === msg.id ? 'Copied' : ''}</span>
                    </button>
                  )}
                </div>

                <FormattedMessageText text={msg.text} />
              </div>
            );
          })}

          {isProcessing && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderLeft: '3.5px solid #1E3A8A',
                fontFamily: 'var(--font-data)',
                fontSize: '11.5px',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>⚙️</span>
              Cross-referencing Gazette Notifications & CVC Guidelines...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts & Input Box with WhatsApp-Style @ Mention Popover */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', position: 'relative' }}>
          {/* Floating @ Mention Autocomplete Popover */}
          <StandardMentionAutocomplete
            isOpen={mentionOpen}
            query={mentionQuery}
            onSelect={handleSelectMention}
            onClose={() => setMentionOpen(false)}
          />

          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {dynamicQuickPrompts.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSendMessage(q.text)}
                disabled={isProcessing}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#93C5FD';
                  e.currentTarget.style.color = '#1E40AF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.color = '#334155';
                }}
              >
                {q.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Quick @ Mention Trigger Button */}
            <button
              type="button"
              onClick={() => {
                if (!mentionOpen) {
                  const newText = inputQuestion.endsWith(' ') || !inputQuestion ? `${inputQuestion}@` : `${inputQuestion} @`;
                  setInputQuestion(newText);
                  setMentionStartIndex(newText.lastIndexOf('@'));
                  setMentionQuery('');
                  setMentionOpen(true);
                  setTimeout(() => inputRef.current?.focus(), 40);
                } else {
                  setMentionOpen(false);
                }
              }}
              style={{
                backgroundColor: mentionOpen ? '#1E3A8A' : '#FFFFFF',
                color: mentionOpen ? '#FFFFFF' : '#1E3A8A',
                border: mentionOpen ? '1px solid #1E3A8A' : '1px solid #CBD5E1',
                borderRadius: '6px',
                height: '38px',
                padding: '0 10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              title="Mention Indian Standard (@IS)"
            >
              <span>@</span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>IS</span>
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputQuestion}
              onChange={handleInputChange}
              placeholder={isNumber ? `Ask anything about ${isNumber} or type @ for IS codes...` : 'Ask a question or type @ to mention IS standards (e.g. @IS 7)...'}
              style={{
                flex: 1,
                height: '38px',
                padding: '0 12px',
                fontFamily: 'var(--font-ui)',
                fontSize: '12.5px',
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
              className="btn-primary"
              style={{
                height: '38px',
                padding: '0 14px',
                fontSize: '12.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Send size={13} />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
