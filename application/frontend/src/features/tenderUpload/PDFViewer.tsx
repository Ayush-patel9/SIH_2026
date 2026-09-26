import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  Search,
} from 'lucide-react';

interface PDFViewerProps {
  pdfUrl?: string | null;
  rawText?: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
  onClose?: () => void;
  highlightText?: string | null;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  rawText,
  initialPage = 1,
  onPageChange,
  className = '',
  onClose,
  highlightText,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [numPages, setNumPages] = useState<number>(3);
  const [scale, setScale] = useState<number>(1.0);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [highlightStatus, setHighlightStatus] = useState<
    'none' | 'searching' | 'found' | 'not-found'
  >('none');
  const [pageInput, setPageInput] = useState<string>(String(initialPage));

  const textContainerRef = useRef<HTMLDivElement>(null);

  // Split raw text into simulated pages if raw text is provided
  const pagesText = React.useMemo(() => {
    if (!rawText) {
      return [
        `GOVERNMENT OF INDIA · NATIONAL HIGHWAYS AUTHORITY OF INDIA (NHAI)\nTECHNICAL SPECIFICATION & BILL OF QUANTITIES (BOQ)\n\nClause 4.1.2 — Cement Specifications for Culvert Works:\nAll structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.\n\nClause 4.1.3 — Coarse & Fine Aggregates:\nAggregates shall conform to IS 383:2016 and be tested for soundness and alkali-aggregate reactivity.`,
        `Clause 7.3.1 — Structural Steel Plates for Bridge Superstructure:\nStructural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with ultrasonic testing per ASTM standards.\n\nClause 7.3.2 — Fasteners & Structural Bolts:\nHigh strength friction grip bolts shall conform to IS 3757:1985 and tightening inspection as per IRC 24.`,
        `Clause 12.4.0 — High Density Polyethylene (HDPE) Water Supply Pipes:\nHDPE pipes for rural drinking water distribution network shall be manufactured as per IS 4984:1995 with PE-80 raw material.\n\nClause 15.2.1 — CCTV Video Surveillance & IP Cameras:\nIP dome cameras for surveillance shall provide 1080p full HD resolution with on-board recording capability.`,
      ];
    }
    const parts = rawText.split(/(?:--- PAGE BREAK ---|\n{3,})/);
    return parts.length > 0 ? parts : [rawText];
  }, [rawText]);

  useEffect(() => {
    setNumPages(pagesText.length);
  }, [pagesText]);

  // Update page when initialPage changes
  useEffect(() => {
    if (initialPage > 0 && initialPage <= numPages) {
      goToPage(initialPage);
    }
  }, [initialPage, numPages]);

  // Alphanumeric Fuzzy Text Highlighter with TreeWalker (Exact AiForBharat logic)
  const highlightTextInPage = useCallback((searchText: string) => {
    if (!textContainerRef.current || !searchText) return;

    setHighlightStatus('searching');

    const container = textContainerRef.current;

    // Remove existing highlights
    container.querySelectorAll('mark.pdf-highlight').forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode()) !== null) {
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node as Text);
      }
    }

    let fullText = '';
    const nodeMap: { node: Text; start: number; end: number }[] = [];

    textNodes.forEach((textNode) => {
      const start = fullText.length;
      const text = textNode.textContent || '';
      fullText += text;
      nodeMap.push({ node: textNode, start, end: fullText.length });
    });

    // FUZZY MATCHING: Strip to alphanumeric only
    const toAlphanumeric = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

    const searchAlpha = toAlphanumeric(searchText);
    const fullTextAlpha = toAlphanumeric(fullText);

    const alphaIndex = fullTextAlpha.indexOf(searchAlpha);

    if (alphaIndex === -1) {
      setHighlightStatus('not-found');
      return;
    }

    // Map alphanumeric position back to original text indices
    let alphaCount = 0;
    let originalStart = -1;
    let originalEnd = -1;

    for (let i = 0; i < fullText.length; i++) {
      if (/[a-zA-Z0-9]/.test(fullText[i])) {
        if (alphaCount === alphaIndex && originalStart === -1) {
          originalStart = i;
        }
        if (alphaCount === alphaIndex + searchAlpha.length - 1) {
          originalEnd = i + 1;
          break;
        }
        alphaCount++;
      }
    }

    if (originalStart === -1 || originalEnd === -1) {
      setHighlightStatus('not-found');
      return;
    }

    let highlighted = false;
    nodeMap.forEach(({ node, start, end }) => {
      if (start < originalEnd && end > originalStart) {
        const nodeStart = Math.max(0, originalStart - start);
        const nodeEnd = Math.min(node.textContent!.length, originalEnd - start);

        if (nodeStart < nodeEnd) {
          const before = node.textContent!.substring(0, nodeStart);
          const match = node.textContent!.substring(nodeStart, nodeEnd);
          const after = node.textContent!.substring(nodeEnd);

          const fragment = document.createDocumentFragment();
          if (before) fragment.appendChild(document.createTextNode(before));

          const mark = document.createElement('mark');
          mark.className = 'pdf-highlight';
          mark.style.backgroundColor = 'rgba(254, 240, 138, 0.6)';
          mark.style.border = '1px solid #ca8a04';
          mark.style.borderRadius = '3px';
          mark.style.padding = '1px 3px';
          mark.style.color = '#713f12';
          mark.style.fontWeight = '600';
          mark.textContent = match;
          fragment.appendChild(mark);

          if (after) fragment.appendChild(document.createTextNode(after));

          node.parentNode?.replaceChild(fragment, node);
          highlighted = true;
        }
      }
    });

    if (highlighted) {
      setHighlightStatus('found');
      const firstMark = container.querySelector('mark.pdf-highlight');
      if (firstMark) {
        firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightStatus('not-found');
    }
  }, []);

  useEffect(() => {
    if (!highlightText) {
      setHighlightStatus('none');
      return;
    }

    const timeoutId = setTimeout(() => {
      highlightTextInPage(highlightText);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [highlightText, currentPage, scale, highlightTextInPage]);

  function goToPage(pageNumber: number) {
    let p = pageNumber;
    if (p < 1) p = 1;
    if (numPages > 0 && p > numPages) p = numPages;

    setCurrentPage(p);
    setPageInput(String(p));

    if (onPageChange) {
      onPageChange(p);
    }
  }

  const renderHighlightStatus = () => {
    if (!highlightText || highlightStatus === 'none') return null;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          fontFamily: 'var(--font-data)',
          padding: '2px 8px',
          borderRadius: '4px',
          background:
            highlightStatus === 'searching'
              ? 'rgba(59, 130, 246, 0.15)'
              : highlightStatus === 'found'
              ? 'rgba(34, 197, 94, 0.15)'
              : 'rgba(249, 115, 22, 0.15)',
          color:
            highlightStatus === 'searching'
              ? '#1d4ed8'
              : highlightStatus === 'found'
              ? '#15803d'
              : '#c2410c',
          fontWeight: 600,
        }}
      >
        <Search size={12} />
        {highlightStatus === 'searching' && 'Locating Evidence...'}
        {highlightStatus === 'found' && 'Evidence Highlighted ✓'}
        {highlightStatus === 'not-found' && 'Evidence on Another Page'}
      </div>
    );
  };

  return (
    <div
      className={`workbench-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isMaximized ? '85vh' : '520px',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--hairline)',
        background: 'var(--surface)',
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderBottom: '1px solid var(--hairline)',
          background: 'var(--paper)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onClose && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '2px 6px', fontSize: '11px' }}
              title="Close"
            >
              <X size={13} />
            </button>
          )}
          <span style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '12px', color: 'var(--ink)' }}>
            📄 Official PDF Document View
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
            Page {currentPage} of {numPages}
          </span>
          {renderHighlightStatus()}
        </div>

        {/* Page & Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{ padding: '4px 8px' }}
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToPage(parseInt(pageInput, 10) || 1);
            }}
            style={{ display: 'inline' }}
          >
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="auth-input"
              style={{ width: '38px', textAlign: 'center', padding: '2px 4px', fontSize: '11px' }}
            />
          </form>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            style={{ padding: '4px 8px' }}
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>

          <div style={{ width: '1px', height: '16px', background: 'var(--hairline)', margin: '0 4px' }} />

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setScale((s) => Math.max(s - 0.15, 0.7))}
            style={{ padding: '4px 8px' }}
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>

          <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', color: 'var(--ink-secondary)', minWidth: '35px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setScale((s) => Math.min(s + 0.15, 1.8))}
            style={{ padding: '4px 8px' }}
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsMaximized((m) => !m)}
            style={{ padding: '4px 8px' }}
            title={isMaximized ? 'Restore View' : 'Maximize Viewer'}
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Main Document Content Canvas */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#525659',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Document Preview"
            style={{
              width: `${Math.round(750 * scale)}px`,
              height: '100%',
              minHeight: '650px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
              background: '#ffffff',
            }}
          />
        ) : (
          <div
            ref={textContainerRef}
            style={{
              width: `${Math.round(700 * scale)}px`,
              minHeight: '600px',
              background: '#FFFFFF',
              color: '#111827',
              padding: `${Math.round(40 * scale)}px`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              borderRadius: '2px',
              fontFamily: "'Literata', Georgia, serif",
              fontSize: `${Math.round(14 * scale)}px`,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              transformOrigin: 'top center',
              userSelect: 'text',
            }}
          >
            {pagesText[currentPage - 1] || pagesText[0]}
          </div>
        )}
      </div>
    </div>
  );
};
