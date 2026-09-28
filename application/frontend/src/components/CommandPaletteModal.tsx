import React, { useState, useEffect, useRef } from 'react';
import type { FeatureKey } from './MobileBottomNav';
import type { UserRole } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature: (feature: FeatureKey) => void;
  onSelectDomain: (domain: string) => void;
  onSelectRole: (role: UserRole) => void;
  onOpenDataSovereignty: () => void;
  currentRole: UserRole;
  currentFeature: FeatureKey;
}

interface CommandItem {
  id: string;
  category: 'Features' | 'Domain Presets' | 'Role Profiles' | 'Actions & Governance';
  title: string;
  subtitle: string;
  shortcut?: string;
  icon: string;
  badge?: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectFeature,
  onSelectDomain,
  onSelectRole,
  onOpenDataSovereignty,
  currentRole,
  currentFeature,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allCommands: CommandItem[] = [
    // Features
    {
      id: 'feat-projects',
      category: 'Features',
      title: '00. Projects & Tenders Ledger',
      subtitle: 'Unified procurement projects, single-upload frozen tender dossiers & 3-stage pipeline',
      shortcut: '⌘P',
      icon: '📁',
      badge: currentFeature === 'projects' ? 'Active' : undefined,
      action: () => { onSelectFeature('projects'); onClose(); },
    },
    {
      id: 'feat-explain',
      category: 'Features',
      title: '01. Explainability & Knowledge Graph',
      subtitle: 'Visible reasoning trail, graph traversal path & plain language toggle',
      shortcut: '⌘1',
      icon: '🧠',
      badge: currentFeature === 'explainability' ? 'Active' : undefined,
      action: () => { onSelectFeature('explainability'); onClose(); },
    },
    {
      id: 'feat-audit',
      category: 'Features',
      title: '02. Audit Trail & Legal Defensibility',
      subtitle: 'SHA-256 sealed audit records, RTI defense & CVC compliance certificates',
      shortcut: '⌘2',
      icon: '🛡️',
      badge: currentFeature === 'audit' ? 'Active' : undefined,
      action: () => { onSelectFeature('audit'); onClose(); },
    },
    {
      id: 'feat-feedback',
      category: 'Features',
      title: '03. Human-in-the-Loop Feedback Queue',
      subtitle: 'Officer feedback moderation, trust score calculation & review pipeline',
      shortcut: '⌘3',
      icon: '👥',
      badge: currentFeature === 'feedback' ? 'Active' : undefined,
      action: () => { onSelectFeature('feedback'); onClose(); },
    },
    {
      id: 'feat-alerts',
      category: 'Features',
      title: '04. Proactive Staleness & Supersession Alerts',
      subtitle: 'Tender impact matrix, amendment notices & live WebSocket alert broadcast',
      shortcut: '⌘4',
      icon: '🚨',
      badge: currentFeature === 'alerts' ? 'Active' : undefined,
      action: () => { onSelectFeature('alerts'); onClose(); },
    },
    {
      id: 'feat-compare',
      category: 'Features',
      title: '06. Standards Comparison & Conflict Resolver',
      subtitle: 'Side-by-side comparison, test method matrix & parameter conflict checks',
      shortcut: '⌘6',
      icon: '⚖️',
      badge: currentFeature === 'comparison' ? 'Active' : undefined,
      action: () => { onSelectFeature('comparison'); onClose(); },
    },
    {
      id: 'feat-nlu',
      category: 'Features',
      title: '07. Query NLU & Intent Disambiguation',
      subtitle: 'AI Call #1 Gemini Flash entity extraction, domain classification & spelling normalizer',
      shortcut: '⌘7',
      icon: '🔍',
      badge: currentFeature === 'queryUnderstanding' ? 'Active' : undefined,
      action: () => { onSelectFeature('queryUnderstanding'); onClose(); },
    },
    {
      id: 'feat-nit',
      category: 'Features',
      title: '08. NIT Draft Clause Generator',
      subtitle: 'Generate legally defensible Notice Inviting Tender clauses & export to PDF/DOCX',
      shortcut: '⌘8',
      icon: '📝',
      badge: currentFeature === 'nitGenerator' ? 'Active' : undefined,
      action: () => { onSelectFeature('nitGenerator'); onClose(); },
    },
    {
      id: 'feat-mcp',
      category: 'Features',
      title: '09. Model Context Protocol (MCP) Server',
      subtitle: 'Statutory tool inspector, JSON-RPC schema & AI assistant live runner',
      shortcut: '⌘9',
      icon: '⚡',
      badge: currentFeature === 'mcp' ? 'Active' : undefined,
      action: () => { onSelectFeature('mcp'); onClose(); },
    },
    {
      id: 'feat-tender',
      category: 'Features',
      title: '10. Projects & Tender Analysis',
      subtitle: 'Unified procurement dossiers, single-upload tender ingestion & 3-stage pipeline',
      shortcut: '⌘0',
      icon: '📄',
      badge: currentFeature === 'projects' ? 'Active' : undefined,
      action: () => { onSelectFeature('projects'); onClose(); },
    },
    {
      id: 'feat-dashboard',
      category: 'Features',
      title: '11. Analytics & Ministry MIS Heatmap',
      subtitle: 'National compliance metrics, top cited standards & department heatmaps',
      shortcut: '⌘D',
      icon: '📊',
      badge: currentFeature === 'dashboard' ? 'Active' : undefined,
      action: () => { onSelectFeature('dashboard'); onClose(); },
    },
    {
      id: 'feat-gem',
      category: 'Features',
      title: '12. GeM & CPPP National Sandbox',
      subtitle: 'Direct e-Procurement API push/pull testing & statutory payload simulation',
      shortcut: '⌘G',
      icon: '🏛️',
      badge: currentFeature === 'integrations' ? 'Active' : undefined,
      action: () => { onSelectFeature('integrations'); onClose(); },
    },

    // Domains
    {
      id: 'domain-cement',
      category: 'Domain Presets',
      title: 'Cement: Ordinary Portland Cement (IS 269:2015)',
      subtitle: 'Highway and structural concrete construction specifications',
      icon: '🏗️',
      action: () => { onSelectDomain('cement'); onSelectFeature('explainability'); onClose(); },
    },
    {
      id: 'domain-steel',
      category: 'Domain Presets',
      title: 'Steel: Structural Steel Sections (IS 2062:2011)',
      subtitle: 'Bridges, transmission towers & heavy infrastructure sections',
      icon: '🔩',
      action: () => { onSelectDomain('steel'); onSelectFeature('explainability'); onClose(); },
    },
    {
      id: 'domain-cctv',
      category: 'Domain Presets',
      title: 'Electronics: CCTV Surveillance Systems (IS 13252)',
      subtitle: 'Information technology security, smart city video surveillance & testing',
      icon: '📹',
      action: () => { onSelectDomain('cctv'); onSelectFeature('explainability'); onClose(); },
    },

    // Roles
    {
      id: 'role-officer',
      category: 'Role Profiles',
      title: 'Switch Persona: Tender Authority & Technical Officer',
      subtitle: 'Technical clause drafting, AI clarification resolution & CVC/CAG statutory audit defense',
      icon: '🏛️',
      badge: currentRole === 'OFFICER' ? 'Current' : undefined,
      action: () => { onSelectRole('OFFICER'); onClose(); },
    },
    {
      id: 'role-vendor',
      category: 'Role Profiles',
      title: 'Switch Persona: Industrial Vendor & MSME',
      subtitle: 'QCO conformity verification, ISI certificate check & compliance roadmap',
      icon: '🏭',
      badge: currentRole === 'VENDOR' ? 'Current' : undefined,
      action: () => { onSelectRole('VENDOR'); onClose(); },
    },

    // Governance & Actions
    {
      id: 'action-sovereignty',
      category: 'Actions & Governance',
      title: 'View MeitY / NIC Data Sovereignty Certificate',
      subtitle: '100% On-Premise / Tier-IV NDC hosting, CERT-In compliance & sovereign jurisdiction',
      icon: '🇮🇳',
      action: () => { onOpenDataSovereignty(); onClose(); },
    },
  ];

  const filteredCommands = allCommands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.shortcut && cmd.shortcut.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredCommands.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '16px',
        paddingRight: '16px',
        animation: 'banner-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px var(--hairline)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--hairline)',
            background: 'var(--surface-raised)',
          }}
        >
          <span style={{ fontSize: '18px', color: 'var(--collapse-cobalt)' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, standard (e.g. IS 269), role, or feature..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-ui)',
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
          <kbd
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '11px',
              padding: '2px 7px',
              background: 'rgba(0, 0, 0, 0.06)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--ink-secondary)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {filteredCommands.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--ink-muted)',
                fontFamily: 'var(--font-data)',
                fontSize: '13px',
              }}
            >
              No matching commands or standards found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(29, 78, 216, 0.08)' : 'transparent',
                    border: isSelected ? '1px solid rgba(29, 78, 216, 0.25)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <span style={{ fontSize: '18px' }}>{cmd.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isSelected ? 'var(--collapse-cobalt)' : 'var(--ink)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        {cmd.title}
                        {cmd.badge && (
                          <span
                            style={{
                              fontFamily: 'var(--font-data)',
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--emerald-pass-glow)',
                              color: 'var(--emerald-pass)',
                              border: '1px solid rgba(5, 150, 105, 0.3)',
                            }}
                          >
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-prose)',
                          fontSize: '12px',
                          color: 'var(--ink-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {cmd.subtitle}
                      </div>
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '11px',
                        padding: '2px 6px',
                        background: isSelected ? 'rgba(29, 78, 216, 0.12)' : 'var(--surface-raised)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 'var(--radius-xs)',
                        color: isSelected ? 'var(--collapse-cobalt)' : 'var(--ink-secondary)',
                        flexShrink: 0,
                      }}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            padding: '8px 16px',
            background: 'var(--surface-raised)',
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-data)',
            fontSize: '11px',
            color: 'var(--ink-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <span>ManakAI Spotlight Engine</span>
        </div>
      </div>
    </div>
  );
};
