import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  X,
  FileText,
  Maximize2,
  Minimize2,
  Loader2,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// Inline styles for text layer and highlighting (mirrored from AiForBharat)
const textLayerStyles = `
.react-pdf__Page__textContent,
.textLayer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  line-height: 1.0;
  user-select: text;
  pointer-events: auto;
}

.react-pdf__Page__textContent span,
.textLayer span {
  color: transparent;
  position: absolute;
  white-space: pre;
  transform-origin: 0% 0%;
  cursor: text;
}

.react-pdf__Page__textContent span::selection,
.textLayer span::selection {
  background: rgba(59, 130, 246, 0.35);
}

/* Verbatim Quote Highlight (AiForBharat Alphanumeric TreeWalker) */
mark.pdf-highlight {
  background-color: rgba(253, 224, 71, 0.45) !important;
  color: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  display: inline !important;
  line-height: inherit !important;
  border-radius: 2px !important;
  border-bottom: 2px solid #eab308 !important;
  box-shadow: 0 0 6px rgba(234, 179, 8, 0.4) !important;
}
`;

interface PDFDocumentViewerProps {
  documentText: string;
  pdfUrl?: string | null;
  targetPage?: number;
  highlightText?: string | null;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
}

export const PDFDocumentViewer: React.FC<PDFDocumentViewerProps> = ({
  documentText,
  pdfUrl,
  targetPage = 1,
  highlightText,
  onPageChange,
  onClose,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(targetPage || 1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState<string>(String(targetPage || 1));
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [highlightStatus, setHighlightStatus] = useState<
    'none' | 'searching' | 'found' | 'not-found'
  >('none');

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const textHighlightRef = useRef<HTMLElement | null>(null);

  // Jump to targetPage when changed externally
  useEffect(() => {
    if (targetPage > 0) {
      goToPage(targetPage);
    }
  }, [targetPage]);

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

  // --- Alphanumeric Fuzzy Highlighting (From AiForBharat) ---
  const highlightTextInPage = useCallback((searchText: string) => {
    if (!pageContainerRef.current || !searchText) return;

    setHighlightStatus('searching');

    // Find text layer
    const textLayer =
      pageContainerRef.current.querySelector('.react-pdf__Page__textContent') ||
      pageContainerRef.current.querySelector('[class*="textLayer"]');

    if (!textLayer) {
      setHighlightStatus('not-found');
      return;
    }

    // Clean existing highlights
    textLayer.querySelectorAll('mark.pdf-highlight').forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(mark.textContent || ''),
          mark
        );
        parent.normalize();
      }
    });

    // Walk all text nodes
    const walker = document.createTreeWalker(
      textLayer,
      NodeFilter.SHOW_TEXT,
      null
    );

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
      const t = textNode.textContent || '';
      fullText += t;
      nodeMap.push({ node: textNode, start, end: fullText.length });
    });

    // Alphanumeric normalization
    const toAlphanumeric = (txt: string) => txt.toLowerCase().replace(/[^a-z0-9]/g, '');
    const searchAlpha = toAlphanumeric(searchText);
    const fullTextAlpha = toAlphanumeric(fullText);

    // If search term is too short or not found
    if (searchAlpha.length < 3) {
      setHighlightStatus('none');
      return;
    }

    const alphaIndex = fullTextAlpha.indexOf(searchAlpha);

    if (alphaIndex === -1) {
      setHighlightStatus('not-found');
      return;
    }

    // Map alphanumeric index back to character offsets
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

    // Wrap matching text nodes
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
      const firstMark = textLayer.querySelector('mark.pdf-highlight');
      if (firstMark) {
        firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightStatus('not-found');
    }
  }, []);

  // Trigger highlighting when highlightText or currentPage changes
  useEffect(() => {
    if (!highlightText) {
      setHighlightStatus('none');
      return;
    }

    const timer = setTimeout(() => {
      highlightTextInPage(highlightText);
    }, 450);

    return () => clearTimeout(timer);
  }, [highlightText, currentPage, scale, highlightTextInPage]);

  // Fallback text paging if no pdfUrl
  const textPages = React.useMemo(() => {
    if (!documentText) return ['No document text available.'];
    const parts = documentText.split(/\n\s*---+\s*Page\s+\d+\s*---+|\f/i).filter((p) => p.trim());
    if (parts.length > 1) return parts;
    const paras = documentText.split('\n\n');
    const chunks: string[] = [];
    let cur = '';
    for (const p of paras) {
      if ((cur + '\n\n' + p).length > 1800 && cur.length > 0) {
        chunks.push(cur.trim());
        cur = p;
      } else {
        cur = cur ? cur + '\n\n' + p : p;
      }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks.length > 0 ? chunks : [documentText];
  }, [documentText]);

  const effectiveNumPages = pdfUrl ? numPages : textPages.length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#0a0f1d',
        color: '#f8fafc',
        borderRadius: isMaximized ? '0' : '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        position: isMaximized ? 'fixed' : 'relative',
        top: isMaximized ? 0 : 'auto',
        left: isMaximized ? 0 : 'auto',
        right: isMaximized ? 0 : 'auto',
        bottom: isMaximized ? 0 : 'auto',
        zIndex: isMaximized ? 9999 : 'auto',
      }}
    >
      <style>{textLayerStyles}</style>

      {/* Header Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: '#0f172a',
          gap: '10px',
          flexWrap: 'nowrap',
          userSelect: 'none',
        }}
      >
        {/* Left: Close, Title, Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              title="Close Viewer"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
            >
              <X size={14} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexShrink: 1 }}>
            <FileText size={15} color="#38bdf8" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: '#f1f5f9',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Tender Document
            </span>
          </div>

          {pdfUrl && (
            <span
              style={{
                fontSize: '10px',
                padding: '1.5px 7px',
                borderRadius: '999px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                fontWeight: 600,
                border: '1px solid rgba(56, 189, 248, 0.25)',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
              title="Synchronized via Cloudinary PDF pipeline"
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 5px #38bdf8',
                }}
              />
              Cloud Synced
            </span>
          )}
        </div>

        {/* Right: Direct Link, Zoom, Maximize */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#cbd5e1',
                textDecoration: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              title="Open raw PDF in new browser tab"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#cbd5e1';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
              }}
            >
              <ExternalLink size={12} />
              <span>Direct Link</span>
            </a>
          )}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1px 3px',
            }}
          >
            <button
              onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
              disabled={scale <= 0.6}
              style={{
                background: 'transparent',
                border: 'none',
                color: scale <= 0.6 ? '#475569' : '#cbd5e1',
                cursor: scale <= 0.6 ? 'not-allowed' : 'pointer',
                padding: '3px 5px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span
              style={{
                fontSize: '10.5px',
                fontFamily: 'var(--font-data, monospace)',
                color: '#cbd5e1',
                minWidth: '36px',
                textAlign: 'center',
                fontWeight: 600,
                padding: '0 2px',
              }}
            >
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
              disabled={scale >= 2.0}
              style={{
                background: 'transparent',
                border: 'none',
                color: scale >= 2.0 ? '#475569' : '#cbd5e1',
                cursor: scale >= 2.0 ? 'not-allowed' : 'pointer',
                padding: '3px 5px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          <button
            onClick={() => setIsMaximized((m) => !m)}
            style={{
              background: isMaximized ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
              border: '1px solid',
              borderColor: isMaximized ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.08)',
              color: isMaximized ? '#38bdf8' : '#cbd5e1',
              borderRadius: '6px',
              padding: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
            title={isMaximized ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Dedicated Highlight Status Strip — Prevents any header crowding */}
      {highlightStatus === 'found' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 14px',
            backgroundColor: 'rgba(234, 179, 8, 0.12)',
            borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#facc15',
            fontSize: '11px',
            fontWeight: 600,
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <Sparkles size={12} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Verbatim Quote Highlighted · Page {currentPage}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const firstMark = document.querySelector('mark.pdf-highlight') || textHighlightRef.current;
              firstMark?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            style={{
              background: 'rgba(234, 179, 8, 0.25)',
              border: '1px solid rgba(234, 179, 8, 0.45)',
              borderRadius: '4px',
              color: '#fef08a',
              fontSize: '10px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Focus Quote ↓
          </button>
        </div>
      )}

      {highlightStatus === 'searching' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
            fontSize: '11px',
            color: '#38bdf8',
          }}
        >
          <Loader2 size={12} className="animate-spin" />
          <span>Locating clause quotation on page {currentPage}...</span>
        </div>
      )}

      {/* Main Document Body */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#090d16',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '24px 16px',
        }}
      >
        {pdfUrl && !pdfLoadError ? (
          <div
            ref={pageContainerRef}
            style={{
              boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              position: 'relative',
            }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages: loadedPages }) => {
                setNumPages(loadedPages);
                setPdfLoadError(null);
                if (targetPage > 0) goToPage(targetPage);
              }}
              onLoadError={(err) => {
                console.error('react-pdf load error:', err);
                setPdfLoadError(err.message || 'Could not load PDF document.');
              }}
              loading={
                <div
                  style={{
                    padding: '60px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#94a3b8',
                  }}
                >
                  <Loader2 size={32} color="#38bdf8" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '13px' }}>Streaming PDF from Cloudinary...</span>
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                onRenderSuccess={() => {
                  if (highlightText) {
                    setTimeout(() => highlightTextInPage(highlightText), 300);
                  }
                }}
              />
            </Document>
          </div>
        ) : (
          /* Text Layer Mode (For pasted text or if PDF load falls back) */
          <div
            style={{
              maxWidth: '100%',
              width: '100%',
              backgroundColor: 'var(--surface)',
              borderRadius: '12px',
              padding: '32px 36px',
              border: '1px solid var(--hairline)',
              boxShadow: 'var(--shadow-card)',
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
          >
            {pdfLoadError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--amber-bg)',
                  border: '1px solid var(--amber-border)',
                  color: 'var(--amber-warn)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={14} color="var(--amber-warn)" />
                <span>Native PDF render preview notice: {pdfLoadError} (Showing formatted text layer)</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--hairline)',
                paddingBottom: '12px',
                marginBottom: '20px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--olive-primary)', fontFamily: 'var(--font-data)' }}>
                PAGE {currentPage} OF {textPages.length}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 600 }}>SPECIFICATION DOCUMENT LAYER</span>
            </div>

            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'JetBrains Mono, Menlo, monospace',
                fontSize: '13px',
                lineHeight: '1.7',
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              {(() => {
                const currentText = textPages[currentPage - 1] || textPages[0] || '';
                if (!highlightText || !currentText.toLowerCase().includes(highlightText.toLowerCase().slice(0, 15))) {
                  return currentText;
                }

                const lowerCurrent = currentText.toLowerCase();
                const lowerHighlight = highlightText.toLowerCase();
                const matchIndex = lowerCurrent.indexOf(lowerHighlight.slice(0, 30));

                if (matchIndex === -1) return currentText;

                const before = currentText.slice(0, matchIndex);
                const matched = currentText.slice(matchIndex, matchIndex + highlightText.length);
                const after = currentText.slice(matchIndex + highlightText.length);

                return (
                  <>
                    {before}
                    <mark
                      ref={textHighlightRef}
                      style={{
                        backgroundColor: 'rgba(250, 204, 21, 0.35)',
                        color: 'inherit',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        borderBottom: '2px solid #eab308',
                        fontWeight: 700,
                      }}
                    >
                      {matched}
                    </mark>
                    {after}
                  </>
                );
              })()}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderTop: '1px solid var(--hairline)',
          backgroundColor: 'var(--surface-secondary)',
        }}
      >
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: currentPage <= 1 ? 'transparent' : 'var(--surface)',
            border: '1px solid var(--hairline)',
            color: currentPage <= 1 ? 'var(--ink-muted)' : 'var(--ink)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={14} /> Previous
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Page</span>
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const p = parseInt(pageInput, 10);
                if (!isNaN(p)) goToPage(p);
              }
            }}
            style={{
              width: '42px',
              textAlign: 'center',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: '6px',
              color: 'var(--ink)',
              fontSize: '12px',
              fontWeight: 700,
              padding: '3px 0',
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
            of {effectiveNumPages || 1}
          </span>
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={effectiveNumPages > 0 && currentPage >= effectiveNumPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor:
              effectiveNumPages > 0 && currentPage >= effectiveNumPages
                ? 'transparent'
                : 'var(--surface)',
            border: '1px solid var(--hairline)',
            color:
              effectiveNumPages > 0 && currentPage >= effectiveNumPages
                ? 'var(--ink-muted)'
                : 'var(--ink)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor:
              effectiveNumPages > 0 && currentPage >= effectiveNumPages
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
