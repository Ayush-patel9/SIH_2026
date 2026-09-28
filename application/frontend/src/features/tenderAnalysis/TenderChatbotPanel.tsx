import React, { useState, useRef, useEffect } from 'react';
import type { TenderChatMessage } from './types';
import { sendTenderChatMessage } from './tenderAnalysisClient';
import { Send, Sparkles, Trash2, Bot, User, ArrowRight, CornerDownLeft, X } from 'lucide-react';

interface TenderChatbotPanelProps {
  documentText: string;
  onPageClick: (page: number, highlightText?: string) => void;
  onClose?: () => void;
}

const DEFAULT_PROMPTS = [
  'What mandatory BIS Quality Control Orders apply to this tender?',
  'Are there any withdrawn or superseded standards cited in the document?',
  'Summarize missing NABL laboratory test requirements',
  'Draft a CVC statutory audit defensibility summary under GFR 144(xi)',
];

export const TenderChatbotPanel: React.FC<TenderChatbotPanelProps> = ({
  documentText,
  onPageClick,
  onClose,
}) => {
  const [messages, setMessages] = useState<TenderChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **Tender Standards Intelligence Assistant**. I have loaded your tender document text into context.\n\nYou can ask me about **mandatory Quality Control Orders (QCOs)**, **superseded IS codes**, **normative NABL laboratory tests**, or how to formulate compliant NIT clauses. Click any **[Page X]** reference in my responses to inspect the source page directly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || loading) return;

    setInputText('');
    const userMsg: TenderChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await sendTenderChatMessage(documentText, textToSend, historyPayload);

      const aiMsg: TenderChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: TenderChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Error communicating with AI assistant:** ${err.message || 'Please verify your network connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Conversation cleared. How can I assist you with your tender specifications?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  /**
   * Parse text and convert [Page X] or (Page X) or Page X into clickable jump buttons
   */
  const renderFormattedMessage = (text: string) => {
    // Regex for Page references: [Page 2], Page 3, (Page 1)
    const pageRegex = /(\[?Page\s+(\d+)\]?)/gi;
    const parts = text.split(pageRegex);

    return (
      <div style={{ lineHeight: 1.6, fontSize: '13px' }}>
        {text.split('\n\n').map((block, bIdx) => {
          // Check for bullet lists
          if (block.trim().startsWith('- ') || block.trim().startsWith('* ')) {
            const listItems = block.split('\n').filter((l) => l.trim().match(/^[-*]\s+/));
            return (
              <ul key={bIdx} style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {listItems.map((item, iIdx) => {
                  const cleaned = item.replace(/^[-*]\s+/, '');
                  return <li key={iIdx} style={{ margin: '4px 0' }}>{renderInlineTokens(cleaned)}</li>;
                })}
              </ul>
            );
          }

          // Check for tables
          if (block.includes('|') && block.split('\n').length >= 2) {
            const rows = block.split('\n').filter((r) => r.includes('|') && !r.includes('---'));
            return (
              <div key={bIdx} style={{ overflowX: 'auto', margin: '10px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #E5E0D4' }}>
                  <tbody>
                    {rows.map((row, rIdx) => {
                      const cols = row.split('|').filter((c) => c.trim());
                      return (
                        <tr key={rIdx} style={{ backgroundColor: rIdx === 0 ? '#FAF8F3' : 'transparent', borderBottom: '1px solid #E5E0D4' }}>
                          {cols.map((col, cIdx) => (
                            <td key={cIdx} style={{ padding: '6px 10px', fontWeight: rIdx === 0 ? 700 : 400 }}>
                              {renderInlineTokens(col.trim())}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }

          return (
            <p key={bIdx} style={{ margin: '8px 0' }}>
              {renderInlineTokens(block)}
            </p>
          );
        })}
      </div>
    );
  };

  /**
   * Handles inline bold (**text**), code (`text`), and clickable [Page X] links
   */
  const renderInlineTokens = (text: string) => {
    const pageRegex = /(\[?Page\s+(\d+)\]?)/gi;
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const regex = new RegExp(pageRegex);
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push(parseMarkdownSpans(text.slice(lastIndex, match.index)));
      }

      const fullMatch = match[1];
      const pageNumber = parseInt(match[2], 10);

      segments.push(
        <button
          key={`page-btn-${match.index}`}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPageClick(pageNumber);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            padding: '1px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(29, 78, 216, 0.1)',
            color: '#1D4ED8',
            border: '1px solid rgba(29, 78, 216, 0.25)',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            margin: '0 3px',
            textDecoration: 'underline',
          }}
          title={`Click to navigate document viewer to Page ${pageNumber}`}
        >
          <span>📍 {fullMatch}</span>
        </button>
      );

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < text.length) {
      segments.push(parseMarkdownSpans(text.slice(lastIndex)));
    }

    return segments.length > 0 ? segments : parseMarkdownSpans(text);
  };

  const parseMarkdownSpans = (raw: string) => {
    // Handle bold **word**
    const parts = raw.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              backgroundColor: '#ECE7DD',
              padding: '1px 4px',
              borderRadius: '3px',
              fontFamily: 'monospace',
              fontSize: '11.5px',
              color: '#92400E',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        border: '1px solid #E5E0D4',
        overflow: 'hidden',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #E5E0D4',
          backgroundColor: '#FAF8F3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#2D6A4F',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C2419' }}>
              Tender Intelligence AI Chat
            </div>
            <div style={{ fontSize: '11px', color: '#6E7A68' }}>
              Full Document Context Aware · Gemini Flash
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleClearHistory}
            style={{
              background: 'none',
              border: '1px solid #E5E0D4',
              color: '#6E7A68',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
            }}
            title="Clear chat history"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#6E7A68',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Close Chat Panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div
        style={{
          padding: '8px 14px',
          backgroundColor: '#F7F5EE',
          borderBottom: '1px solid #EAE5D9',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {DEFAULT_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={loading}
            style={{
              border: '1px solid #DCD6C8',
              backgroundColor: '#FFFFFF',
              color: '#36452F',
              padding: '4px 10px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={11} color="#2D6A4F" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: '#FCFAF7',
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '88%',
                backgroundColor: m.sender === 'user' ? '#2D6A4F' : '#FFFFFF',
                color: m.sender === 'user' ? '#FFFFFF' : '#1C2419',
                padding: '12px 16px',
                borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                border: m.sender === 'user' ? 'none' : '1px solid #E5E0D4',
              }}
            >
              {m.sender === 'assistant' ? renderFormattedMessage(m.text) : m.text}
            </div>
            <div style={{ fontSize: '10.5px', color: '#8A9485', marginTop: '3px', padding: '0 4px' }}>
              {m.sender === 'user' ? 'You' : 'ManakAI'} · {m.timestamp}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6E7A68', fontSize: '12px', padding: '8px 12px' }}>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            <span>Reasoning across tender document and Indian Standards...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E5E0D4',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a technical or legal question about this tender..."
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: '#FAF8F3',
            border: '1px solid #DCD6C8',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#1C2419',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#2D6A4F')}
          onBlur={(e) => (e.target.style.borderColor = '#DCD6C8')}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          style={{
            backgroundColor: inputText.trim() && !loading ? '#2D6A4F' : '#E5E0D4',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: inputText.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Send</span>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
