import React, { useState, useMemo } from 'react';
import {
  computeLayout,
  NODE_COLORS,
  type GraphEdge,
  type NodePosition,
} from './graphParser';

interface KnowledgeGraphViewerProps {
  edges?: GraphEdge[];
  primaryStandard?: string;
}

export const KnowledgeGraphViewer: React.FC<KnowledgeGraphViewerProps> = ({
  edges = [],
  primaryStandard = 'IS 269:2015',
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const fallbackEdges: GraphEdge[] = useMemo(() => {
    if (edges && edges.length > 0) return edges;
    return [
      {
        from: 'Procurement Query',
        to: primaryStandard,
        edge_type: 'DIRECT_RECOMMENDATION',
        label: 'Best Technical Fit',
      },
    ];
  }, [edges, primaryStandard]);

  const nodePositions: Record<string, NodePosition> = useMemo(() => {
    return computeLayout(fallbackEdges, primaryStandard);
  }, [fallbackEdges, primaryStandard]);

  const activeNode = selectedNode ? nodePositions[selectedNode] : null;

  return (
    <div className="workbench-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--hairline)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="workbench-card-title">Interactive Knowledge Subgraph</h2>
            <div className="workbench-card-subtitle">
              Multi-hop lineage from query entities → legacy standards → active specifications → mandatory test methods
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="concept-status-badge in-progress">
              {Object.keys(nodePositions).length} NODES
            </span>
            <span className="concept-status-badge active">
              {fallbackEdges.length} EDGES
            </span>
          </div>
        </div>
      </div>

      <div className="kg-canvas-container">
        <div className="kg-canvas-header">
          <span className="kg-canvas-title">CANVAS: NORMATIVE CITATION GRAPH</span>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)' }}>
            CLICK ANY NODE TO INSPECT LEGAL STATUS
          </span>
        </div>

        <svg className="kg-svg" viewBox="0 0 760 260">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--canvas-wire)" />
            </marker>
          </defs>

          {/* Grid Background Pattern */}
          <g opacity="0.15">
            {Array.from({ length: 15 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 20}
                x2="760"
                y2={i * 20}
                stroke="var(--canvas-wire)"
                strokeDasharray="2 2"
              />
            ))}
            {Array.from({ length: 38 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 20}
                y1="0"
                x2={i * 20}
                y2="260"
                stroke="var(--canvas-wire)"
                strokeDasharray="2 2"
              />
            ))}
          </g>

          {/* Render Edge Lines and Labels */}
          {fallbackEdges.map((edge, idx) => {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            if (!fromPos || !toPos) return null;

            const x1 = fromPos.x + 80;
            const y1 = fromPos.y + 20;
            const x2 = toPos.x;
            const y2 = toPos.y + 20;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 - 8;

            return (
              <g key={`edge-${idx}`}>
                <path
                  d={`M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`}
                  className="kg-edge-line"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  className="kg-edge-text"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {Object.values(nodePositions).map((node) => {
            const colors = NODE_COLORS[node.type];
            const isSelected = selectedNode === node.id;

            return (
              <g
                key={node.id}
                className="kg-node-group"
                onClick={() => setSelectedNode(node.id)}
                transform={`translate(${node.x}, ${node.y})`}
              >
                <rect
                  x="0"
                  y="0"
                  width="160"
                  height="44"
                  rx="3"
                  fill={colors.bg}
                  stroke={isSelected ? '#FFFFFF' : colors.border}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  className="kg-node-rect"
                />
                <text
                  x="12"
                  y="18"
                  className="kg-node-text-type"
                  fill="rgba(255,255,255,0.7)"
                >
                  {colors.badge}
                </text>
                <text
                  x="12"
                  y="34"
                  className="kg-node-text-title"
                >
                  {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {activeNode && (
        <div className="kg-detail-popover">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="concept-status-badge in-progress">
                {NODE_COLORS[activeNode.type].badge}
              </span>
              <strong style={{ fontFamily: 'var(--font-data)', fontSize: '13px' }}>
                {activeNode.label}
              </strong>
            </div>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
              {activeNode.type === 'ACTIVE' && 'Current officially enforced standard published by the Bureau of Indian Standards.'}
              {activeNode.type === 'WITHDRAWN' && 'Legally WITHDRAWN and superseded. Citing this in active NIT tenders violates CVC guidelines.'}
              {activeNode.type === 'TEST_METHOD' && 'Mandatory physical / chemical testing procedure mandated by the parent specification.'}
              {activeNode.type === 'PRODUCT_ENTITY' && 'Procurement item / material specification extracted from tender query.'}
              {activeNode.type === 'STANDARD' && 'Allied normative standard cross-referenced in technical annexures.'}
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px' }}
            onClick={() => setSelectedNode(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
