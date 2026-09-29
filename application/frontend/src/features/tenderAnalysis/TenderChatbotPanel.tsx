import React, { useState, useRef, useEffect } from 'react';
import type { TenderChatMessage } from './types';
import { sendTenderChatMessage } from './tenderAnalysisClient';
import { Send, Sparkles, Trash2, Bot, CornerDownLeft, X, AtSign, Loader2, FileText } from 'lucide-react';
import { StandardMentionAutocomplete } from '../../components/StandardMentionAutocomplete';
import type { StandardMentionItem } from '../../data/standardsMentionCatalog';

interface TenderChatbotPanelProps {
  documentText: string;
  onPageClick: (page: number, highlightText?: string) => void;
  onClose?: () => void;
}

const DEFAULT_PROMPTS = [
  'What mandatory BIS Quality Control Orders apply to this tender?',
  'What mandatory test parameters apply to @IS 7098 power cables?',
  'Are there any withdrawn or superseded standards cited in the document?',
  'Verify mandatory QCO and test norms for @IS 269 & @IS 1786',
];

function isValidMentionQuery(q: string): boolean {
  const trimmed = q.trim();
  if (trimmed === '') return true; // just typed '@' or '@ '

  // Standard identifier prefix: "IS", "IS 456", "IS 7098", "IS 269:2015", "IS 1786-2008"
  if (/^IS(\s+[0-9]+[A-Za-z0-9/:\-()]*|\s*)$/i.test(trimmed)) {
    return true;
  }

  // Direct numeric standard code: "456", "7098", "269"
  if (/^[0-9]+[A-Za-z0-9/:\-()]*$/.test(trimmed)) {
    return true;
  }

  // Single keyword without spaces: "cement", "steel", "pipe", "cable", "rebar"
  if (/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
    return true;
  }

  return false;
}

export const TenderChatbotPanel: React.FC<TenderChatbotPanelProps> = ({
  documentText,
  onPageClick,
  onClose,
}) => {
  const [messages, setMessages] = useState<TenderChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **Tender Standards Intelligence Assistant**. I have loaded your tender document text into context.\n\nYou can ask me about **mandatory Quality Control Orders (QCOs)**, **superseded IS codes**, or type **@** to mention any of the 22,011 Indian Standards (e.g. **@IS 7**, **@IS 7098**, **@IS 269**). Click any **[Page X]** reference in my responses to inspect the source page directly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || loading) return;

    setInputText('');
    setMentionOpen(false);
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
        text: `**Error communicating with AI assistant:** ${err.message || 'Please verify your network connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart || val.length;
    setInputText(val);

    // Look backward from cursor to detect if active in '@' mention
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const queryPart = textBeforeCursor.slice(lastAtIndex + 1);
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
        if (isValidMentionQuery(queryPart) && queryPart.length <= 25 && !queryPart.includes('\n')) {
          setMentionOpen(true);
          setMentionQuery(queryPart.trim());
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
      const beforeAt = inputText.slice(0, mentionStartIndex);
      const afterMention = inputText.slice(mentionStartIndex + mentionQuery.length + 1);
      newText = `${beforeAt}${tag}${afterMention}`;
      newCursor = (beforeAt + tag).length;
    } else {
      newText = inputText ? `${inputText} ${tag}` : tag;
      newCursor = newText.length;
    }

    setInputText(newText);
    setMentionOpen(false);
    setMentionStartIndex(-1);
    setMentionQuery('');

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 40);
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
            const rows = block.trim().split('\n').filter(r => r.includes('|') && !r.includes('---'));
            return (
              <div key={bIdx} style={{ overflowX: 'auto', margin: '10px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid var(--hairline)' }}>
                  <tbody>
                    {rows.map((row, rIdx) => {
                      const cells = row.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                      const isHeader = rIdx === 0;
                      return (
                        <tr key={rIdx} style={{ backgroundColor: isHeader ? 'var(--surface-secondary)' : 'transparent' }}>
                          {cells.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '6px 10px', border: '1px solid var(--hairline)', fontWeight: isHeader ? 700 : 400 }}>
                              {renderInlineTokens(cell)}
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
            gap: '3px',
            padding: '1px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(29, 78, 216, 0.1)',
            color: 'var(--focus-blue)',
            border: '1px solid rgba(29, 78, 216, 0.25)',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            margin: '0 3px',
            textDecoration: 'none',
          }}
          title={`Click to navigate document viewer to Page ${pageNumber}`}
        >
          <FileText size={11} />
          <span>{fullMatch}</span>
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
    // Handle bold (**word**), code (`code`), or @IS mention (@IS 7098, @IS 269, etc.)
    const parts = raw.split(/(\*\*.*?\*\*|`.*?`|@IS\s+[0-9]+[A-Za-z0-9/()\-]*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              backgroundColor: 'var(--surface-secondary)',
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: 'var(--font-data, monospace)',
              fontSize: '11.5px',
              color: 'var(--ink)',
              border: '1px solid var(--hairline)',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('@IS')) {
        return (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '1px 7px',
              borderRadius: '4px',
              backgroundColor: 'var(--olive-tint)',
              color: 'var(--olive-primary)',
              fontWeight: 800,
              fontSize: '11.5px',
              border: '1px solid var(--hairline)',
              margin: '0 2px',
              fontFamily: 'var(--font-data, monospace)',
            }}
          >
            <span style={{ opacity: 0.7 }}>@</span>
            <span>{part.substring(1)}</span>
          </span>
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
        backgroundColor: 'var(--surface)',
        borderRadius: '10px',
        border: '1px solid var(--hairline)',
        overflow: 'hidden',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--hairline)',
          backgroundColor: 'var(--surface-secondary)',
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
              backgroundColor: 'var(--olive-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={16} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)' }}>
              Tender Intelligence AI Chat
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
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
              border: '1px solid var(--hairline)',
              color: 'var(--ink-secondary)',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
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
                color: 'var(--ink-muted)',
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
          backgroundColor: 'var(--surface-secondary)',
          borderBottom: '1px solid var(--hairline)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
        }}
      >
        {DEFAULT_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={loading}
            style={{
              border: '1px solid var(--hairline)',
              backgroundColor: 'var(--surface)',
              color: 'var(--ink)',
              padding: '4px 10px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={11} color="var(--olive-primary)" />
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
          backgroundColor: 'var(--canvas-secondary, var(--surface))',
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
                backgroundColor: m.sender === 'user' ? 'var(--olive-primary)' : 'var(--surface)',
                color: m.sender === 'user' ? '#FFFFFF' : 'var(--ink)',
                padding: '12px 16px',
                borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                boxShadow: 'var(--shadow-card)',
                border: m.sender === 'user' ? 'none' : '1px solid var(--hairline)',
              }}
            >
              {m.sender === 'assistant' ? renderFormattedMessage(m.text) : m.text}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--ink-muted)', marginTop: '3px', padding: '0 4px', fontWeight: 600 }}>
              {m.sender === 'user' ? 'You' : 'ManakAI'} · {m.timestamp}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-muted)', fontSize: '12px', padding: '8px 12px' }}>
            <Loader2 size={14} className="animate-spin" color="var(--olive-primary)" />
            <span>Reasoning across tender document and Indian Standards...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box with WhatsApp-Style @ Mention Popover */}
      <div style={{ position: 'relative', borderTop: '1px solid var(--hairline)', backgroundColor: 'var(--surface)' }}>
        {/* Floating @ Mention Autocomplete Popover */}
        <StandardMentionAutocomplete
          isOpen={mentionOpen}
          query={mentionQuery}
          onSelect={handleSelectMention}
          onClose={() => setMentionOpen(false)}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '12px 16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          {/* Quick @ Mention Trigger Button */}
          <button
            type="button"
            onClick={() => {
              if (!mentionOpen) {
                const newText = inputText.endsWith(' ') || !inputText ? `${inputText}@` : `${inputText} @`;
                setInputText(newText);
                setMentionStartIndex(newText.lastIndexOf('@'));
                setMentionQuery('');
                setMentionOpen(true);
                setTimeout(() => inputRef.current?.focus(), 40);
              } else {
                setMentionOpen(false);
              }
            }}
            style={{
              backgroundColor: mentionOpen ? 'var(--olive-primary)' : 'var(--surface-secondary)',
              color: mentionOpen ? '#FFFFFF' : 'var(--olive-primary)',
              border: mentionOpen ? '1px solid var(--olive-primary)' : '1px solid var(--hairline)',
              borderRadius: '6px',
              height: '38px',
              padding: '0 10px',
              fontWeight: 800,
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
            <span style={{ fontSize: '11px', fontWeight: 800 }}>IS</span>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Ask anything or type @ to mention IS codes (e.g. @IS 7, @IS 7098, @IS 269)..."
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--hairline)',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'var(--ink)',
              outline: 'none',
              fontFamily: 'var(--font-ui)',
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            style={{
              backgroundColor: inputText.trim() && !loading ? 'var(--olive-primary)' : 'var(--hairline)',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              fontWeight: 800,
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
    </div>
  );
};
