import React, { useState, useEffect, useRef } from 'react';
import {
  searchStandardsForMention,
  type StandardMentionItem,
} from '../data/standardsMentionCatalog';
import { Sparkles, ShieldCheck, CheckCircle2, X, BookOpen, Layers, Search, Scale } from 'lucide-react';

interface StandardMentionAutocompleteProps {
  isOpen: boolean;
  query: string;
  onSelect: (standard: StandardMentionItem) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Domains' },
  { id: 'Civil', label: 'Civil & Cement' },
  { id: 'Steel', label: 'Steel & Rebar' },
  { id: 'Electrical', label: 'Electrical & Cables' },
  { id: 'Water/Pipes', label: 'Water & Pipes' },
  { id: 'Fire Safety', label: 'Fire Safety' },
  { id: 'Chemicals', label: 'Chemicals' },
  { id: 'Electronics', label: 'Electronics/IT' },
];

export const StandardMentionAutocomplete: React.FC<StandardMentionAutocompleteProps> = ({
  isOpen,
  query,
  onSelect,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  const results = searchStandardsForMention(query, activeCategory, 30);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Keyboard navigation handler (attached to window when mention popup is open)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length) {
          e.preventDefault();
          onSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, results, selectedIndex, onSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const cleanQuery = query.replace(/^@/, '').trim();

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        maxHeight: '340px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'fadeSlideUp 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Popover Top Bar */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--surface-secondary)',
          borderBottom: '1px solid var(--hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: 'var(--olive-primary)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            @
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-ui)' }}>
            Mention Indian Standard
          </span>
          {cleanQuery && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: 'var(--olive-tint)',
                color: 'var(--olive-primary)',
                fontWeight: 700,
                fontFamily: 'var(--font-data)',
                border: '1px solid var(--hairline)',
              }}
            >
              Prefix Match: "{cleanQuery}"
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
            {results.length} found
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Close mention menu (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Domain Category Filter Slider/Pills Bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '6px 10px',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--hairline)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '3px 9px',
                borderRadius: '14px',
                fontSize: '11px',
                fontWeight: isSelected ? 800 : 600,
                backgroundColor: isSelected ? 'var(--olive-primary)' : 'var(--surface-secondary)',
                color: isSelected ? '#FFFFFF' : 'var(--ink-secondary)',
                border: isSelected ? '1px solid var(--olive-primary)' : '1px solid var(--hairline)',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                flexShrink: 0,
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Standards List */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '220px',
          padding: '4px',
        }}
      >
        {results.length === 0 ? (
          <div
            style={{
              padding: '28px 16px',
              textAlign: 'center',
              color: 'var(--ink-muted)',
              fontSize: '12.5px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Search size={15} />
              <span>No Indian Standard matching <strong>"{cleanQuery}"</strong></span>
            </div>
            <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--ink-muted)' }}>
              Try typing standard numbers like <code>@IS 7</code>, <code>@IS 7098</code>, <code>@IS 269</code>, <code>@IS 1786</code> or materials like <code>@cement</code>, <code>@steel</code>.
            </div>
          </div>
        ) : (
          results.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.is_number}
                onClick={() => onSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: '7px',
                  backgroundColor: isSelected ? 'var(--olive-tint)' : 'transparent',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--hairline)' : '1px solid transparent',
                  transition: 'background-color 0.1s ease',
                  margin: '1px 0',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-data, monospace)',
                        fontWeight: 800,
                        fontSize: '12.5px',
                        color: isSelected ? 'var(--olive-primary)' : 'var(--ink)',
                        backgroundColor: isSelected ? 'var(--surface)' : 'var(--surface-secondary)',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        border: '1px solid var(--hairline)',
                      }}
                    >
                      {item.is_number}
                    </span>

                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--surface-secondary)',
                        color: 'var(--ink-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {item.category}
                    </span>

                    {item.qco_mandatory && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: 'var(--amber-bg)',
                          color: 'var(--amber-warn)',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          border: '1px solid var(--amber-border)',
                        }}
                      >
                        <Scale size={10} />
                        <span>QCO MANDATORY</span>
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: '2px',
                    }}
                  >
                    {item.title}
                  </div>

                  {item.description && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--ink-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.description}
                    </div>
                  )}
                </div>

                <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      color: isSelected ? 'var(--olive-primary)' : 'var(--ink-muted)',
                      fontWeight: isSelected ? 800 : 500,
                      fontFamily: 'var(--font-data)',
                    }}
                  >
                    {isSelected ? '↵ Select' : '+'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Keyboard Guide Tip */}
      <div
        style={{
          padding: '6px 12px',
          backgroundColor: 'var(--surface-secondary)',
          borderTop: '1px solid var(--hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10.5px',
          color: 'var(--ink-muted)',
        }}
      >
        <span>
          Use <kbd style={{ background: 'var(--surface)', padding: '1px 4px', borderRadius: '3px', border: '1px solid var(--hairline)' }}>↑</kbd> <kbd style={{ background: 'var(--surface)', padding: '1px 4px', borderRadius: '3px', border: '1px solid var(--hairline)' }}>↓</kbd> to navigate, <kbd style={{ background: 'var(--surface)', padding: '1px 4px', borderRadius: '3px', border: '1px solid var(--hairline)' }}>Enter</kbd> to insert
        </span>
        <span>
          <kbd style={{ background: 'var(--surface)', padding: '1px 4px', borderRadius: '3px', border: '1px solid var(--hairline)' }}>Esc</kbd> to dismiss
        </span>
      </div>
    </div>
  );
};
