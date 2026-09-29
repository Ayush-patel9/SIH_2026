import React, { useState, useMemo } from 'react';
import type { StandardsResponse, AlliedStandard } from '../../types';
import {
  computeLayout,
  NODE_COLORS,
  type GraphEdge,
} from './graphParser';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Layers,
  Info,
  Maximize2,
  ExternalLink,
  Filter,
  Check,
} from 'lucide-react';

interface KnowledgeGraphViewerProps {
  data?: StandardsResponse | null;
  edges?: GraphEdge[];
  primaryStandard?: string;
  onExploreInMesh?: (isNumber: string) => void;
}

export const KnowledgeGraphViewer: React.FC<KnowledgeGraphViewerProps> = ({
  data,
  edges = [],
  primaryStandard = 'IS 15683:2018',
  onExploreInMesh,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'TEST' | 'QCO' | 'SUPERSEDED'>('ALL');
  const [copiedText, setCopiedText] = useState(false);

  // Extract clean context
  const primStd = data?.primary_recommendation?.is_number || primaryStandard;
  const primTitle = data?.primary_recommendation?.title || 'Indian Standard Specification';
  const queryTerm =
    data?.query_understanding?.normalized_text ||
    data?.query_understanding?.original_text ||
    data?.query_understanding?.product_name ||
    'Procurement Requirement';

  // Build comprehensive multi-tier citation graph
  const allResolvedEdges: GraphEdge[] = useMemo(() => {
    const edgeList: GraphEdge[] = [];
    const seenEdges = new Set<string>();

    const addEdge = (from: string, to: string, type: string, label: string) => {
      const key = `${from}->${to}:${type}`;
      if (!seenEdges.has(key) && from !== to && from.trim() && to.trim()) {
        seenEdges.add(key);
        edgeList.push({ from: from.trim(), to: to.trim(), edge_type: type, label });
      }
    };

    // 1. Historical Supersession Lineage (Outdated / Superseded Citations)
    let hasSuperseded = false;
    if (data?.outdated_citations && data.outdated_citations.length > 0) {
      data.outdated_citations.forEach((out) => {
        hasSuperseded = true;
        addEdge(queryTerm, out.cited_standard, 'OUTDATED_CITE', 'Obsolete Citation');
        addEdge(out.cited_standard, primStd, 'SUPERSEDED_BY', 'Withdrawn & Superseded By');
      });
    }

    if (data?.primary_recommendation?.supersedes && data.primary_recommendation.supersedes.length > 0) {
      data.primary_recommendation.supersedes.slice(0, 2).forEach((sup) => {
        hasSuperseded = true;
        addEdge(queryTerm, sup, 'OUTDATED_CITE', 'Historical Spec');
        addEdge(sup, primStd, 'SUPERSEDED_BY', 'Superseded by');
      });
    }

    // If no superseded nodes, direct link from requirement to primary specification
    if (!hasSuperseded) {
      addEdge(queryTerm, primStd, 'DIRECT_SPEC', 'Statutory Specification');
    }

    // 2. Mandatory Test Methods & Allied Specifications
    const rawAllied: AlliedStandard[] = data?.allied_standards || [];
    if (rawAllied.length > 0) {
      rawAllied.slice(0, 4).forEach((allied: AlliedStandard) => {
        const isTest = allied.relation_type === 'TEST_METHOD' || allied.is_number.includes('Part') || allied.title.toLowerCase().includes('test');
        const edgeType = isTest ? 'TEST_METHOD' : (allied.relation_type || 'NORMATIVE_REFERENCE');
        const edgeLabel = allied.relation_label || (isTest ? 'Mandatory Physical Testing' : 'Allied Specification');
        addEdge(primStd, allied.is_number, edgeType, edgeLabel);
      });
    } else {
      // Authentic domain companions if allied_standards list is empty
      if (primStd.includes('15683')) {
        addEdge(primStd, 'IS 2190', 'INSTALLATION_CODE', 'Selection & Maintenance Code');
        addEdge(primStd, 'IS 4947', 'TEST_METHOD', 'Gas Cartridge Proof Test');
        addEdge(primStd, 'IS 15683:Part 2', 'TEST_METHOD', 'Discharge & Fire Rating Test');
      } else if (primStd.includes('269')) {
        addEdge(primStd, 'IS 4031 (Pt 5)', 'TEST_METHOD', 'Compressive Strength Test');
        addEdge(primStd, 'IS 4032', 'TEST_METHOD', 'Chemical Composition Analysis');
        addEdge(primStd, 'IS 4998', 'INSTALLATION_CODE', 'Structural Design Code');
      } else if (primStd.includes('1786')) {
        addEdge(primStd, 'IS 1608 (Pt 1)', 'TEST_METHOD', 'Tensile & Elongation Test');
        addEdge(primStd, 'IS 1599', 'TEST_METHOD', 'Cold Bend & Re-bend Test');
        addEdge(primStd, 'IS 456', 'INSTALLATION_CODE', 'Plain & Reinforced Concrete Code');
      } else {
        addEdge(primStd, `${primStd}-Testing`, 'TEST_METHOD', 'Sampling & Test Protocol');
      }
    }

    // 3. Mandatory QCO Enforcement Gate
    const cert = data?.primary_recommendation?.certification;
    const isQCO = cert?.mandatory || cert?.qco_order_name || primStd.includes('15683') || primStd.includes('269') || primStd.includes('1786');
    if (isQCO) {
      const qcoName = cert?.qco_order_name || 'DPIIT Mandatory QCO Order';
      const qcoLabel = qcoName.length > 24 ? `${qcoName.slice(0, 22)}..` : qcoName;
      addEdge(primStd, qcoLabel, 'QCO_MANDATE', 'Statutory Quality Gate');
    }

    // 4. Merge incoming props edges if any
    if (edges && edges.length > 0) {
      edges.forEach((e) => addEdge(e.from, e.to, e.edge_type, e.label));
    }

    return edgeList;
  }, [data, edges, primStd, queryTerm]);

  // Filter edges based on user selection
  const filteredEdges = useMemo(() => {
    if (filterType === 'ALL') return allResolvedEdges;
    if (filterType === 'TEST') {
      return allResolvedEdges.filter(
        (e) => e.edge_type === 'TEST_METHOD' || e.from === queryTerm || e.to === primStd
      );
    }
    if (filterType === 'QCO') {
      return allResolvedEdges.filter(
        (e) => e.edge_type === 'QCO_MANDATE' || e.from === queryTerm || e.to === primStd
      );
    }
    if (filterType === 'SUPERSEDED') {
      return allResolvedEdges.filter(
        (e) => e.edge_type === 'SUPERSEDED_BY' || e.edge_type === 'OUTDATED_CITE' || e.to === primStd
      );
    }
    return allResolvedEdges;
  }, [allResolvedEdges, filterType, queryTerm, primStd]);

  // Compute Layout coordinates
  const { positions: nodePositions, svgWidth, svgHeight } = useMemo(() => {
    return computeLayout(filteredEdges, primStd);
  }, [filteredEdges, primStd]);

  const activeNode = selectedNodeId ? nodePositions[selectedNodeId] : null;

  // Metadata for active inspected node
  const activeMetadata = useMemo(() => {
    if (!activeNode) return null;
    const isNum = activeNode.id;

    // Check if primary standard
    if (isNum === primStd || isNum.includes(primStd) || primStd.includes(isNum)) {
      return {
        number: primStd,
        title: primTitle,
        desc:
          data?.primary_recommendation?.scope_snippet ||
          'Primary Indian Standard governing technical specifications, safety margins, performance criteria, and mandatory quality limits.',
        clause: 'Section 1 (Scope), Section 5 (Performance Requirements) & Section 9 (Marking)',
        status: data?.primary_recommendation?.status || 'ACTIVE STANDARD',
        mandatory: data?.primary_recommendation?.certification?.mandatory ? 'YES — DPIIT Statutory Quality Control Order' : 'Mandatory ISI Mark',
        legalPenalty: 'Section 29 of BIS Act 2016: Non-compliant bidding renders NIT tender invalid.',
        division: data?.primary_recommendation?.division_code || 'CED / MED Technical Committee',
      };
    }

    // Check allied standards
    const allied = (data?.allied_standards || []).find((a) => a.is_number === isNum || isNum.includes(a.is_number));
    if (allied) {
      return {
        number: allied.is_number,
        title: allied.title,
        desc: allied.why || 'Normative testing or design procedure cited directly in the parent standard to certify quality conformity.',
        clause: 'Clause 2 (Normative References) & Testing Schedule Annexure',
        status: allied.status || 'ACTIVE',
        mandatory: allied.relation_type === 'TEST_METHOD' ? 'Mandatory Physical Testing Protocol' : 'Allied Conformity Standard',
        legalPenalty: 'Test failure disqualifies batch during pre-dispatch lab inspection.',
        division: 'Conformity Assessment Directorate',
      };
    }

    // Check outdated / superseded
    const outdated = (data?.outdated_citations || []).find((o) => o.cited_standard === isNum || isNum.includes(o.cited_standard));
    if (outdated) {
      return {
        number: outdated.cited_standard,
        title: `Superseded Standard ${outdated.cited_standard}`,
        desc: outdated.reason || outdated.message || 'Withdrawn and superseded by Bureau of Indian Standards. Citing in public tenders is flagged as an audit violation by CVC.',
        clause: 'BIS Gazette Supersession Amalgamation',
        status: 'WITHDRAWN / PROHIBITED',
        mandatory: 'STRICTLY PROHIBITED IN NIT TENDERS',
        legalPenalty: 'Automatic rejection of tender or vendor bid under CVC guidelines.',
        division: 'Historical Catalog Archive',
      };
    }

    // Check QCO Mandate
    if (activeNode.type === 'QCO_MANDATE' || isNum.toLowerCase().includes('qco') || isNum.toLowerCase().includes('order')) {
      const qcoRef = data?.primary_recommendation?.certification?.qco_gazette_ref || 'S.O. 4932(E)';
      return {
        number: 'DPIIT QCO Statutory Gate',
        title: data?.primary_recommendation?.certification?.qco_order_name || 'Quality Control Order (QCO) Gazette Mandate',
        desc: 'Statutory order issued under Section 16 of the Bureau of Indian Standards Act, 2016. Prohibits manufacture, import, stocking, sale, or distribution without mandatory Standard ISI Mark.',
        clause: `Gazette Notification: ${qcoRef}`,
        status: 'STATUTORY LAW (CRITICAL)',
        mandatory: 'MANDATORY ENFORCEMENT (ISI MARK)',
        legalPenalty: 'Imprisonment up to 2 years or fine under Section 29, BIS Act 2016.',
        division: 'Ministry of Commerce & Industry / DPIIT',
      };
    }

    // Query entity node
    if (activeNode.type === 'PRODUCT_ENTITY') {
      return {
        number: 'PROCUREMENT REQUIREMENT',
        title: queryTerm,
        desc: 'Procurement requirement extracted from user query or tender schedule. Mapped via multi-hop reasoning to statutory standards.',
        clause: 'Tender BoQ / Schedule of Requirements',
        status: 'INPUT ENTITY',
        mandatory: 'Target Technical Requirement',
        legalPenalty: 'Must be linked to active IS code to prevent audit dispute.',
        division: 'Public Procurement Division',
      };
    }

    // Fallback standard
    return {
      number: activeNode.label,
      title: activeNode.label,
      desc: 'Normative reference standard governing technical characteristics, testing methods, or installation codes of practice.',
      clause: 'Normative Reference Schedule',
      status: 'ACTIVE',
      mandatory: 'Normative Compliance',
      legalPenalty: 'Referenced in contract specifications.',
      division: 'Bureau of Indian Standards',
    };
  }, [activeNode, primStd, primTitle, queryTerm, data]);

  const testCount = Object.values(nodePositions).filter((n) => n.type === 'TEST_METHOD').length;
  const isQCO = Boolean(data?.primary_recommendation?.certification?.mandatory || primStd.includes('15683') || primStd.includes('269') || primStd.includes('1786'));

  const handleCopyClause = () => {
    if (!activeMetadata) return;
    const clauseText = `Conformity Requirement: Material shall comply with ${activeMetadata.number} (${activeMetadata.title}). Testing per ${activeMetadata.clause}. Regulatory Status: ${activeMetadata.mandatory}.`;
    navigator.clipboard.writeText(clauseText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const CARD_WIDTH = 210;
  const CARD_HEIGHT = 60;

  return (
    <div
      className="workbench-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--hairline, #E2E8F0)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        background: '#FFFFFF',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--hairline, #E2E8F0)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-dot active" />
              <span
                style={{
                  fontFamily: 'var(--font-data, monospace)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--ink-muted, #64748B)',
                  textTransform: 'uppercase',
                }}
              >
                NORMATIVE KNOWLEDGE SUBGRAPH · MULTI-TIER CONFORMITY ECOSYSTEM
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-ui, sans-serif)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--ink, #0F172A)',
                margin: '2px 0 4px 0',
                letterSpacing: '-0.015em',
              }}
            >
              Interactive Citation & Regulatory Traceability Graph
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-prose, sans-serif)',
                fontSize: '13px',
                color: 'var(--ink-secondary, #475569)',
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              End-to-end statutory lineage: <strong>{queryTerm}</strong> &rarr; Active Standard <strong>{primStd}</strong> &rarr; Laboratory Test Methods &rarr; DPIIT Quality Control Orders.
            </p>
          </div>

          {/* Metric Badges */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#F1F5F9',
                color: '#334155',
                fontSize: '11.5px',
                fontWeight: 600,
                fontFamily: 'var(--font-data, monospace)',
                border: '1px solid #CBD5E1',
              }}
            >
              <Layers size={13} /> {Object.keys(nodePositions).length} NODES
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#ECFDF5',
                color: '#065F46',
                fontSize: '11.5px',
                fontWeight: 600,
                fontFamily: 'var(--font-data, monospace)',
                border: '1px solid #A7F3D0',
              }}
            >
              <FlaskConical size={13} /> {testCount} TEST PROTOCOLS
            </span>
            {isQCO && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#FFFBEB',
                  color: '#B45309',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-data, monospace)',
                  border: '1px solid #FDE68A',
                }}
              >
                <Shield size={13} /> QCO MANDATED
              </span>
            )}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--ink-muted, #64748B)', fontFamily: 'var(--font-data, monospace)', marginRight: '4px' }}>
              <Filter size={11} style={{ display: 'inline', marginRight: '3px' }} /> FILTER VIEW:
            </span>
            {[
              { id: 'ALL', label: 'Complete Ecosystem' },
              { id: 'TEST', label: 'Mandatory Tests Only' },
              { id: 'QCO', label: 'QCO & Legal Gates' },
              { id: 'SUPERSEDED', label: 'Historical Supersession' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: filterType === f.id ? 700 : 500,
                  cursor: 'pointer',
                  border: filterType === f.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  background: filterType === f.id ? '#EFF6FF' : '#FFFFFF',
                  color: filterType === f.id ? '#1D4ED8' : '#64748B',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span style={{ fontFamily: 'var(--font-data, monospace)', fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>
            CLICK ANY CARD TO INSPECT TESTING CLAUSES & AUDIT DEFENSE
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        className="kg-canvas-container"
        style={{
          background: 'radial-gradient(#E2E8F0 1px, transparent 1px) 0 0 / 24px 24px, #FAFBFD',
          padding: '24px 20px',
          overflowX: 'auto',
          position: 'relative',
        }}
      >
        <svg
          className="kg-svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            width: '100%',
            minWidth: `${Math.min(svgWidth, 860)}px`,
            height: 'auto',
            display: 'block',
          }}
        >
          <defs>
            <marker id="arrow-blue" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <polygon points="0 0, 9 3.5, 0 7" fill="#3B82F6" />
            </marker>
            <marker id="arrow-emerald" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <polygon points="0 0, 9 3.5, 0 7" fill="#10B981" />
            </marker>
            <marker id="arrow-amber" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <polygon points="0 0, 9 3.5, 0 7" fill="#F59E0B" />
            </marker>
            <marker id="arrow-red" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <polygon points="0 0, 9 3.5, 0 7" fill="#EF4444" />
            </marker>
            <marker id="arrow-slate" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <polygon points="0 0, 9 3.5, 0 7" fill="#64748B" />
            </marker>

            <filter id="subgraphCardShadow" x="-10%" y="-10%" width="125%" height="135%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.07" />
            </filter>
            <filter id="subgraphSelectedShadow" x="-15%" y="-15%" width="130%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="7" floodColor="#2563EB" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Render Curved Connectors with Centered Floating Labels */}
          {filteredEdges.map((edge, idx) => {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            if (!fromPos || !toPos) return null;

            const x1 = fromPos.x + CARD_WIDTH;
            const y1 = fromPos.y + CARD_HEIGHT / 2;
            const x2 = toPos.x;
            const y2 = toPos.y + CARD_HEIGHT / 2;

            const dx = Math.max(x2 - x1, 20);
            const c1x = x1 + dx * 0.45;
            const c2x = x2 - dx * 0.45;

            // Stagger midpoint horizontally slightly for fan-out edges to avoid stacking
            const staggerOffset = ((idx % 3) - 1) * 16;
            const midX = (x1 + x2) / 2 + staggerOffset;
            const midY = (y1 + y2) / 2;

            const isSuperseded = edge.edge_type === 'SUPERSEDED_BY' || edge.edge_type === 'OUTDATED_CITE';
            const isTest = edge.edge_type === 'TEST_METHOD' || edge.edge_type.includes('TEST');
            const isQco = edge.edge_type === 'QCO_MANDATE';

            const strokeColor = isSuperseded ? '#DC2626' : isTest ? '#15803D' : isQco ? '#B45309' : '#2563EB';
            const markerId = isSuperseded ? 'url(#arrow-red)' : isTest ? 'url(#arrow-emerald)' : isQco ? 'url(#arrow-amber)' : 'url(#arrow-blue)';

            const cleanLabel = edge.label || '';
            const pillW = Math.min(Math.max(cleanLabel.length * 5.8 + 14, 82), 125);
            const pillH = 18;

            return (
              <g key={`edge-${idx}`}>
                <path
                  d={`M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`}
                  stroke={strokeColor}
                  strokeWidth="1.8"
                  strokeDasharray={isSuperseded ? '5 4' : 'none'}
                  fill="none"
                  markerEnd={markerId}
                  opacity="0.88"
                />

                {/* Centered Floating Edge Badge Pill */}
                {cleanLabel && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-pillW / 2}
                      y={-pillH / 2}
                      width={pillW}
                      height={pillH}
                      rx="9"
                      fill="#FFFFFF"
                      stroke={strokeColor}
                      strokeWidth="1"
                      filter="url(#subgraphCardShadow)"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={strokeColor}
                      fontSize="8.5px"
                      fontFamily="var(--font-data, monospace)"
                      fontWeight="700"
                      letterSpacing="0.01em"
                    >
                      {cleanLabel.length > 18 ? `${cleanLabel.slice(0, 16)}..` : cleanLabel}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Modern Engineering Node Cards */}
          {Object.values(nodePositions).map((node) => {
            const colors = NODE_COLORS[node.type] || NODE_COLORS.STANDARD;
            const isSelected = selectedNodeId === node.id;
            const isPrimary = node.id === primStd;

            let subText = 'Indian Standard Specification';
            if (node.type === 'PRODUCT_ENTITY') subText = 'Procurement Target';
            else if (node.type === 'TEST_METHOD') subText = 'Mandatory Protocol';
            else if (node.type === 'QCO_MANDATE') subText = 'Statutory Order';
            else if (node.type === 'WITHDRAWN') subText = 'Withdrawn by BIS';
            else if (isPrimary) subText = primTitle.length > 24 ? `${primTitle.slice(0, 22)}..` : primTitle;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
              >
                {/* Card Background Base */}
                <rect
                  x="0"
                  y="0"
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  rx="8"
                  fill="#FFFFFF"
                  stroke={isSelected ? '#2563EB' : isPrimary ? '#3B82F6' : colors.border}
                  strokeWidth={isSelected ? '2.5' : isPrimary ? '1.8' : '1.2'}
                  filter={isSelected ? 'url(#subgraphSelectedShadow)' : 'url(#subgraphCardShadow)'}
                />

                {/* Left Colored Accent Bar */}
                <rect x="0" y="0" width="6" height={CARD_HEIGHT} rx="4" fill={colors.accent} />

                {/* Top Category Badge Pill */}
                <rect x="14" y="9" width={CARD_WIDTH - 28} height="16" rx="4" fill={colors.pillBg} />
                <text
                  x="20"
                  y="20.5"
                  fill={colors.pillText}
                  fontSize="8.5px"
                  fontFamily="var(--font-data, monospace)"
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  {colors.badge}
                </text>

                {/* Node Title / IS Number */}
                <text
                  x="14"
                  y="43"
                  fill="#0F172A"
                  fontSize="13px"
                  fontFamily="var(--font-ui, sans-serif)"
                  fontWeight="700"
                  letterSpacing="-0.01em"
                >
                  {node.label.length > 21 ? `${node.label.slice(0, 19)}...` : node.label}
                </text>

                {/* Secondary Subtitle / Requirement Detail */}
                <text
                  x="14"
                  y="55"
                  fill="#64748B"
                  fontSize="9.5px"
                  fontFamily="var(--font-prose, sans-serif)"
                  fontWeight="500"
                >
                  {subText}
                </text>

                {/* Active Indicator Dot on Primary Card */}
                {isPrimary && (
                  <circle cx={CARD_WIDTH - 14} cy="17" r="4" fill="#2563EB" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Normative Node Inspector Drawer */}
      {activeNode && activeMetadata && (
        <div
          style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--hairline, #E2E8F0)',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
            animation: 'fadeSlideUp 0.18s ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span
                  style={{
                    background: NODE_COLORS[activeNode.type].pillBg,
                    color: NODE_COLORS[activeNode.type].pillText,
                    padding: '3px 9px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-data, monospace)',
                    fontWeight: 700,
                  }}
                >
                  {NODE_COLORS[activeNode.type].badge}
                </span>

                <strong style={{ fontFamily: 'var(--font-ui, sans-serif)', fontSize: '16px', color: 'var(--ink, #0F172A)' }}>
                  {activeMetadata.number}
                </strong>

                <span
                  style={{
                    fontFamily: 'var(--font-data, monospace)',
                    fontSize: '11.5px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: activeMetadata.status.includes('WITHDRAWN') ? '#FEE2E2' : '#DCFCE7',
                    color: activeMetadata.status.includes('WITHDRAWN') ? '#DC2626' : '#15803D',
                    fontWeight: 600,
                  }}
                >
                  {activeMetadata.status}
                </span>

                <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-data, monospace)' }}>
                  Committee: {activeMetadata.division}
                </span>
              </div>

              <div style={{ fontFamily: 'var(--font-ui, sans-serif)', fontSize: '14.5px', fontWeight: 600, color: 'var(--ink, #0F172A)', marginBottom: '6px' }}>
                {activeMetadata.title}
              </div>

              <p style={{ fontFamily: 'var(--font-prose, sans-serif)', fontSize: '13px', color: 'var(--ink-secondary, #475569)', margin: 0, lineHeight: 1.55 }}>
                {activeMetadata.desc}
              </p>

              {/* Technical & Legal Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                  marginTop: '14px',
                  padding: '12px 14px',
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'var(--font-data, monospace)', fontWeight: 600 }}>
                    MANDATORY TECHNICAL CLAUSES
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {activeMetadata.clause}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'var(--font-data, monospace)', fontWeight: 600 }}>
                    REGULATORY STATUS
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: activeMetadata.mandatory.includes('PROHIBITED') ? '#DC2626' : '#047857', marginTop: '2px' }}>
                    {activeMetadata.mandatory}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'var(--font-data, monospace)', fontWeight: 600 }}>
                    AUDIT DEFENSE & CVC IMPLICATION
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    {activeMetadata.legalPenalty}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '170px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleCopyClause}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                {copiedText ? <Check size={13} /> : null}
                <span>{copiedText ? 'Clause Copied!' : 'Copy Clause for NIT'}</span>
              </button>

              {onExploreInMesh && activeMetadata.number.startsWith('IS') && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onExploreInMesh(activeMetadata.number)}
                  style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={13} />
                  <span>3D Neural Mesh</span>
                </button>
              )}

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedNodeId(null)}
                style={{
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  color: '#64748B',
                  cursor: 'pointer',
                  background: 'none',
                  border: '1px solid #CBD5E1',
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
