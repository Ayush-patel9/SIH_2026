import React, { useState, useEffect, useRef } from 'react';
import {
  searchStandardsForMention,
  type StandardMentionItem,
} from '../data/standardsMentionCatalog';
import { Sparkles, ShieldCheck, CheckCircle2, X, BookOpen, Layers } from 'lucide-react';

interface StandardMentionAutocompleteProps {
  isOpen: boolean;
  query: string;
  onSelect: (standard: StandardMentionItem) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Domains' },
  { id: 'Civil', label: '🏛️ Civil & Cement' },
  { id: 'Steel', label: '🏗️ Steel & Rebar' },
  { id: 'Electrical', label: '⚡ Electrical & Cables' },
  { id: 'Water/Pipes', label: '💧 Water & Pipes' },
  { id: 'Fire Safety', label: '🧯 Fire Safety' },
  { id: 'Chemicals', label: '🧪 Chemicals' },
  { id: 'Electronics', label: '💻 Electronics/IT' },
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
        backgroundColor: '#FFFFFF',
        border: '1px solid #DCD6C8',
        borderRadius: '12px',
        boxShadow: '0 -8px 26px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0,0,0,0.06)',
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
          backgroundColor: '#F7F5F0',
          borderBottom: '1px solid #E5E0D4',
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
              backgroundColor: '#36452F',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            @
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C2419', fontFamily: 'var(--font-ui)' }}>
            Mention Indian Standard
          </span>
          {cleanQuery && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: '#E8EFE5',
                color: '#2D6A4F',
                fontWeight: 600,
                fontFamily: 'var(--font-data)',
              }}
            >
              Prefix Match: "{cleanQuery}"
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#6E7A68', fontFamily: 'var(--font-data)' }}>
            {results.length} found
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6E7A68',
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
          backgroundColor: '#FCFAF7',
          borderBottom: '1px solid #EFECE6',
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
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected ? '#36452F' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#44503E',
                border: isSelected ? '1px solid #36452F' : '1px solid #DCD6C8',
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
              color: '#6E7A68',
              fontSize: '12.5px',
            }}
          >
            <div>🔍 No Indian Standard matching <strong>"{cleanQuery}"</strong></div>
            <div style={{ fontSize: '11px', marginTop: '4px', color: '#8A9485' }}>
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
                  backgroundColor: isSelected ? '#F0F5ED' : 'transparent',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #A3C9A8' : '1px solid transparent',
                  transition: 'background-color 0.1s ease',
                  margin: '1px 0',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-data, monospace)',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        color: isSelected ? '#1B4332' : '#2D6A4F',
                        backgroundColor: isSelected ? '#D8E8D5' : '#E8EFE5',
                        padding: '2px 7px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.is_number}
                    </span>

                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: '#F5F2EB',
                        color: '#6E7A68',
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
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        ⚖️ QCO MANDATORY
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1C2419',
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
                        color: '#6E7A68',
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
                      color: isSelected ? '#1B4332' : '#8A9485',
                      fontWeight: isSelected ? 700 : 500,
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
          backgroundColor: '#F7F5F0',
          borderTop: '1px solid #E5E0D4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10.5px',
          color: '#6E7A68',
        }}
      >
        <span>
          Use <kbd style={{ background: '#FFF', padding: '1px 4px', borderRadius: '3px', border: '1px solid #DCD6C8' }}>↑</kbd> <kbd style={{ background: '#FFF', padding: '1px 4px', borderRadius: '3px', border: '1px solid #DCD6C8' }}>↓</kbd> to navigate, <kbd style={{ background: '#FFF', padding: '1px 4px', borderRadius: '3px', border: '1px solid #DCD6C8' }}>Enter</kbd> to insert
        </span>
        <span>
          <kbd style={{ background: '#FFF', padding: '1px 4px', borderRadius: '3px', border: '1px solid #DCD6C8' }}>Esc</kbd> to dismiss
        </span>
      </div>
    </div>
  );
};
