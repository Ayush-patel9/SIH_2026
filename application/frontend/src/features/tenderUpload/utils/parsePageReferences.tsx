import React from 'react';
import { FileText } from 'lucide-react';

/**
 * Detect page numbers in text using various common patterns
 * Matches: "page 8", "Page 12", "pg. 5", "p. 23"
 */
export function detectPageReferences(text: string): number[] {
  if (!text) return [];

  const pageReferencePattern =
    /\b(?:page|Page|PAGE|pg\.|Pg\.|p\.|P\.)\s*(\d+)\b/gi;
  const matches = text.matchAll(pageReferencePattern);

  const pageNumbers = new Set<number>();
  for (const match of matches) {
    const pageNum = parseInt(match[1], 10);
    if (pageNum > 0) {
      pageNumbers.add(pageNum);
    }
  }

  return Array.from(pageNumbers).sort((a, b) => a - b);
}

/**
 * Extract page number from a pageLocation string like "Page 15, Section 3.2" or "Page 2"
 */
export function extractPageNumber(pageLocation: string): number | null {
  if (!pageLocation) return null;
  const match = pageLocation.match(
    /\b(?:page|Page|PAGE|pg\.|Pg\.|p\.|P\.)\s*(\d+)\b/i
  );
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Transform text to include clickable page references
 * Returns JSX with clickable links for page numbers
 */
export function createClickablePageLinks(
  text: string,
  onPageClick: (page: number, highlightText?: string) => void,
  highlightText?: string
): React.ReactNode {
  if (!text) return text;

  const pageReferencePattern =
    /\b(page|Page|PAGE|pg\.|Pg\.|p\.|P\.)\s*(\d+)\b/gi;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;

  const matches = Array.from(text.matchAll(pageReferencePattern));

  matches.forEach((match, idx) => {
    const matchStart = match.index!;
    const matchEnd = matchStart + match[0].length;

    // Add text before the match
    if (matchStart > lastIndex) {
      parts.push(text.substring(lastIndex, matchStart));
    }

    // Add clickable page reference
    const pageNum = parseInt(match[2], 10);
    parts.push(
      <button
        key={`page-ref-${idx}-${pageNum}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPageClick(pageNum, highlightText);
        }}
        style={{
          color: 'var(--collapse-cobalt)',
          textDecoration: 'underline',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'var(--font-data)',
          fontWeight: 600,
        }}
        title={
          highlightText
            ? `Jump to page ${pageNum} and highlight evidence`
            : `Jump to page ${pageNum}`
        }
      >
        {match[0]}
      </button>
    );

    lastIndex = matchEnd;
  });

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

/**
 * Create a clickable evidence page link that highlights the quote when clicked
 */
export function createEvidencePageLink(
  evidence: { quote?: string; pageLocation?: string },
  onPageClick: (page: number, highlightText?: string) => void,
  idx: number = 0
): React.ReactNode {
  if (!evidence.pageLocation) return null;

  const pageNum = extractPageNumber(evidence.pageLocation);
  if (!pageNum) {
    return (
      <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
        {evidence.pageLocation}
      </span>
    );
  }

  return (
    <button
      key={`evidence-page-ref-${idx}-${pageNum}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPageClick(pageNum, evidence.quote);
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: 'var(--collapse-cobalt)',
        textDecoration: 'underline',
        background: 'none',
        border: 'none',
        padding: '2px 4px',
        cursor: 'pointer',
        fontSize: '11px',
        fontFamily: 'var(--font-data)',
        fontWeight: 600,
      }}
      title={
        evidence.quote
          ? `Go to ${evidence.pageLocation} and highlight verbatim evidence`
          : `Go to ${evidence.pageLocation}`
      }
    >
      <FileText size={12} />
      {evidence.pageLocation}
    </button>
  );
}
