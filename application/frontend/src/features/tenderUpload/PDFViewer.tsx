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
  FileText,
  Eye,
} from 'lucide-react';

interface PDFViewerProps {
  pdfUrl?: string | null;
  rawText?: string;
  pages?: string[];
  initialPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
  onClose?: () => void;
  highlightText?: string | null;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  rawText,
  pages,
  initialPage = 1,
  onPageChange,
  className = '',
  onClose,
  highlightText,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'annotated_text' | 'embedded_pdf'>(
    pdfUrl && !pages ? 'embedded_pdf' : 'annotated_text'
  );
  const [highlightStatus, setHighlightStatus] = useState<
    'none' | 'searching' | 'found' | 'not-found'
  >('none');
  const [pageInput, setPageInput] = useState<string>(String(initialPage));

  const textContainerRef = useRef<HTMLDivElement>(null);

  // Compute pages list from pages prop or rawText
  const pagesText: string[] = React.useMemo(() => {
    if (pages && pages.length > 0) {
      return pages;
    }
    if (!rawText) {
      return [
        `GOVERNMENT OF INDIA · NATIONAL HIGHWAYS AUTHORITY OF INDIA (NHAI)\nTECHNICAL SPECIFICATION & BILL OF QUANTITIES (BOQ)\n\nClause 4.1.2 — Cement Specifications for Culvert Works:\nAll structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.\n\nClause 4.1.3 — Coarse & Fine Aggregates:\nAggregates shall conform to IS 383:2016 and be tested for soundness and alkali-aggregate reactivity.`,
        `Clause 7.3.1 — Structural Steel Plates for Bridge Superstructure:\nStructural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with ultrasonic testing per ASTM standards.\n\nClause 7.3.2 — Fasteners & Structural Bolts:\nHigh strength friction grip bolts shall conform to IS 3757:1985 and tightening inspection as per IRC 24.`,
        `Clause 12.4.0 — High Density Polyethylene (HDPE) Water Supply Pipes:\nHDPE pipes for rural drinking water distribution network shall be manufactured as per IS 4984:1995 with PE-80 raw material.\n\nClause 15.2.1 — CCTV Video Surveillance & IP Cameras:\nIP dome cameras for surveillance shall provide 1080p full HD resolution with on-board recording capability.`,
      ];
    }
    const parts = rawText.split(/(?:--- PAGE BREAK ---\n?|\n{3,})/);
    return parts.length > 0 ? parts : [rawText];
  }, [pages, rawText]);

  const numPages = pagesText.length;

  // Sync current page with initialPage
  useEffect(() => {
    if (initialPage > 0 && initialPage <= numPages) {
      goToPage(initialPage);
    }
  }, [initialPage, numPages]);

  // TreeWalker-based Alphanumeric Fuzzy Text Highlighter
  const highlightTextInPage = useCallback((searchText: string) => {
    if (!textContainerRef.current || !searchText) return;

    setHighlightStatus('searching');

    const container = textContainerRef.current;

    // 1. Remove existing highlights and normalize text nodes
    container.querySelectorAll('mark.pdf-highlight').forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });

    // 2. Gather all DOM text nodes
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode()) !== null) {
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node as Text);
      }
    }

    // 3. Build text map with cumulative offsets
    let fullText = '';
    const nodeMap: { node: Text; start: number; end: number }[] = [];

    textNodes.forEach((textNode) => {
      const start = fullText.length;
      const text = textNode.textContent || '';
      fullText += text;
      nodeMap.push({ node: textNode, start, end: fullText.length });
    });

    // 4. Fuzzy alphanumeric normalization
    const toAlphanumeric = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '');

    const searchAlpha = toAlphanumeric(searchText);
    const fullTextAlpha = toAlphanumeric(fullText);

    if (!searchAlpha) {
      setHighlightStatus('none');
      return;
    }

    const alphaIndex = fullTextAlpha.indexOf(searchAlpha);

    if (alphaIndex === -1) {
      // Fallback: check if the first 25 alphanumeric chars match
      const subAlpha = searchAlpha.substring(0, Math.min(30, searchAlpha.length));
      const subIndex = fullTextAlpha.indexOf(subAlpha);
      if (subIndex === -1) {
        setHighlightStatus('not-found');
        return;
      }
    }

    const targetAlpha = alphaIndex !== -1 ? searchAlpha : searchAlpha.substring(0, Math.min(30, searchAlpha.length));
    const matchIdx = alphaIndex !== -1 ? alphaIndex : fullTextAlpha.indexOf(targetAlpha);

    // 5. Map back to original character indices
    let alphaCount = 0;
    let originalStart = -1;
    let originalEnd = -1;

    for (let i = 0; i < fullText.length; i++) {
      if (/[a-zA-Z0-9]/.test(fullText[i])) {
        if (alphaCount === matchIdx && originalStart === -1) {
          originalStart = i;
        }
        if (alphaCount === matchIdx + targetAlpha.length - 1) {
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

    // 6. Split nodes and wrap matches in <mark> tags
    let highlighted = false;
    nodeMap.forEach(({ node: targetNode, start, end }) => {
      if (start < originalEnd && end > originalStart) {
        const nodeStart = Math.max(0, originalStart - start);
        const nodeEnd = Math.min(targetNode.textContent!.length, originalEnd - start);

        if (nodeStart < nodeEnd) {
          const before = targetNode.textContent!.substring(0, nodeStart);
          const match = targetNode.textContent!.substring(nodeStart, nodeEnd);
          const after = targetNode.textContent!.substring(nodeEnd);

          const fragment = document.createDocumentFragment();
          if (before) fragment.appendChild(document.createTextNode(before));

          const mark = document.createElement('mark');
          mark.className = 'pdf-highlight';
          mark.style.backgroundColor = 'rgba(254, 240, 138, 0.7)';
          mark.style.border = '1px solid #ca8a04';
          mark.style.borderRadius = '3px';
          mark.style.padding = '2px 4px';
          mark.style.color = '#713f12';
          mark.style.fontWeight = '700';
          mark.style.boxShadow = '0 0 8px rgba(202, 138, 4, 0.4)';
          mark.textContent = match;
          fragment.appendChild(mark);

          if (after) fragment.appendChild(document.createTextNode(after));

          targetNode.parentNode?.replaceChild(fragment, targetNode);
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

  // Trigger highlighting when highlightText, currentPage, or viewMode changes
  useEffect(() => {
    if (!highlightText) {
      setHighlightStatus('none');
      return;
    }

    const timeoutId = setTimeout(() => {
      highlightTextInPage(highlightText);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [highlightText, currentPage, scale, viewMode, highlightTextInPage]);

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
            📄 PDF Clause Viewer
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
            Page {currentPage} of {numPages}
          </span>
          {renderHighlightStatus()}
        </div>

        {/* View Mode Toggle (if real PDF URL is present) */}
        {pdfUrl && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === 'annotated_text' ? 'active' : ''}`}
              onClick={() => setViewMode('annotated_text')}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              title="Interactive Evidence Annotator & Text Highlighter"
            >
              <FileText size={12} style={{ marginRight: '4px' }} /> Annotator
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === 'embedded_pdf' ? 'active' : ''}`}
              onClick={() => setViewMode('embedded_pdf')}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              title="Original PDF Document"
            >
              <Eye size={12} style={{ marginRight: '4px' }} /> PDF View
            </button>
          </div>
        )}

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
          background: '#475569',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {pdfUrl && viewMode === 'embedded_pdf' ? (
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
              width: `${Math.round(720 * scale)}px`,
              minHeight: '620px',
              background: '#FFFFFF',
              color: '#111827',
              padding: `${Math.round(40 * scale)}px`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
              borderRadius: '3px',
              fontFamily: "'Literata', Georgia, serif",
              fontSize: `${Math.round(14 * scale)}px`,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              transformOrigin: 'top center',
              userSelect: 'text',
              border: '1px solid #cbd5e1',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '8px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>GOVERNMENT OF INDIA · TENDER SPECIFICATION RECORD</span>
              <span>PAGE {currentPage} OF {numPages}</span>
            </div>

            {pagesText[currentPage - 1] || pagesText[0]}
          </div>
        )}
      </div>
    </div>
  );
};
