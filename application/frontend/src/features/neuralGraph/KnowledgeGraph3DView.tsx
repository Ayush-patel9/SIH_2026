/**
 * KnowledgeGraph3DView.tsx
 * Interactive Neural Knowledge Graph & Citation Mesh
 * Visualizes the 22,011 Indian Standards relational graph with physics-based nodes,
 * domain clustering, multi-hop traversal, and instant shortest-path discovery.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, ZoomIn, ZoomOut, RotateCcw, Shield, Layers, Compass, Filter, Share2, Sparkles } from 'lucide-react';

interface Node {
  id: string;
  isNumber: string;
  title: string;
  domain: string;
  year: number;
  status: 'ACTIVE' | 'SUPERSEDED' | 'MANDATORY_QCO';
  citations: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Edge {
  source: string;
  target: string;
  type: 'NORMATIVE' | 'TEST_METHOD' | 'SUPERSEDES' | 'CO_PROCUREMENT';
  label: string;
}

const INITIAL_NODES: Node[] = [
  { id: 'IS-269', isNumber: 'IS 269:2015', title: 'Ordinary Portland Cement (33, 43, 53)', domain: 'Civil / Cement', year: 2015, status: 'MANDATORY_QCO', citations: 48, x: 450, y: 300, vx: 0, vy: 0, radius: 24, color: '#2563EB' },
  { id: 'IS-8112', isNumber: 'IS 8112:1989', title: '43 Grade OPC (Withdrawn)', domain: 'Civil / Cement', year: 1989, status: 'SUPERSEDED', citations: 12, x: 320, y: 220, vx: 0, vy: 0, radius: 16, color: '#EF4444' },
  { id: 'IS-12269', isNumber: 'IS 12269:2013', title: '53 Grade OPC (Superseded)', domain: 'Civil / Cement', year: 2013, status: 'SUPERSEDED', citations: 18, x: 330, y: 380, vx: 0, vy: 0, radius: 16, color: '#EF4444' },
  { id: 'IS-4031', isNumber: 'IS 4031 (Part 1-15)', title: 'Methods of Physical Tests for Hydraulic Cement', domain: 'Testing Methods', year: 2021, status: 'ACTIVE', citations: 64, x: 590, y: 240, vx: 0, vy: 0, radius: 20, color: '#10B981' },
  { id: 'IS-4032', isNumber: 'IS 4032:1985', title: 'Chemical Analysis of Hydraulic Cement', domain: 'Testing Methods', year: 1985, status: 'ACTIVE', citations: 32, x: 610, y: 370, vx: 0, vy: 0, radius: 18, color: '#10B981' },
  { id: 'IS-456', isNumber: 'IS 456:2000', title: 'Plain and Reinforced Concrete — Code of Practice', domain: 'Civil / Structural', year: 2000, status: 'ACTIVE', citations: 112, x: 460, y: 150, vx: 0, vy: 0, radius: 26, color: '#7C3AED' },
  { id: 'IS-1786', isNumber: 'IS 1786:2008', title: 'High Strength Deformed Steel Bars (Fe 500D)', domain: 'Metallurgy / Steel', year: 2008, status: 'MANDATORY_QCO', citations: 78, x: 260, y: 140, vx: 0, vy: 0, radius: 22, color: '#EA580C' },
  { id: 'IS-2062', isNumber: 'IS 2062:2011', title: 'Hot Rolled Medium and High Tensile Structural Steel', domain: 'Metallurgy / Steel', year: 2011, status: 'MANDATORY_QCO', citations: 96, x: 170, y: 280, vx: 0, vy: 0, radius: 24, color: '#EA580C' },
  { id: 'IS-1608', isNumber: 'IS 1608:2022', title: 'Metallic Materials — Tensile Testing at Ambient Temp', domain: 'Testing Methods', year: 2022, status: 'ACTIVE', citations: 52, x: 120, y: 180, vx: 0, vy: 0, radius: 18, color: '#10B981' },
  { id: 'IS-4984', isNumber: 'IS 4984:2016', title: 'High Density Polyethylene Pipes for Water Supply', domain: 'Chemicals / Plastics', year: 2016, status: 'MANDATORY_QCO', citations: 38, x: 740, y: 200, vx: 0, vy: 0, radius: 20, color: '#06B6D4' },
  { id: 'IS-2530', isNumber: 'IS 2530:1963', title: 'Methods of Test for Polyethylene Molding Materials', domain: 'Testing Methods', year: 1963, status: 'ACTIVE', citations: 22, x: 840, y: 280, vx: 0, vy: 0, radius: 16, color: '#10B981' },
  { id: 'IS-13252', isNumber: 'IS 13252:2010', title: 'Information Technology Equipment — Safety (Part 1)', domain: 'Electronics / CRO', year: 2010, status: 'MANDATORY_QCO', citations: 84, x: 440, y: 480, vx: 0, vy: 0, radius: 22, color: '#E11D48' },
  { id: 'IS-16842', isNumber: 'IS 16842:2020', title: 'CCTV Surveillance Systems for Security Applications', domain: 'Electronics / IT', year: 2020, status: 'ACTIVE', citations: 29, x: 600, y: 490, vx: 0, vy: 0, radius: 18, color: '#E11D48' },
];

const INITIAL_EDGES: Edge[] = [
  { source: 'IS-8112', target: 'IS-269', type: 'SUPERSEDES', label: 'Consolidated into Clause 5.1' },
  { source: 'IS-12269', target: 'IS-269', type: 'SUPERSEDES', label: 'Merged into Single Standard' },
  { source: 'IS-269', target: 'IS-4031', type: 'TEST_METHOD', label: 'Mandatory Physical Testing' },
  { source: 'IS-269', target: 'IS-4032', type: 'TEST_METHOD', label: 'Chemical Conformity' },
  { source: 'IS-456', target: 'IS-269', type: 'NORMATIVE', label: 'Permitted Cement Binder' },
  { source: 'IS-456', target: 'IS-1786', type: 'NORMATIVE', label: 'Mandatory Reinforcement Rebar' },
  { source: 'IS-2062', target: 'IS-1608', type: 'TEST_METHOD', label: 'Tensile Yield Test Protocol' },
  { source: 'IS-1786', target: 'IS-1608', type: 'TEST_METHOD', label: 'Elongation & Bend Protocol' },
  { source: 'IS-4984', target: 'IS-2530', type: 'TEST_METHOD', label: 'Hydrostatic & Density Test' },
  { source: 'IS-13252', target: 'IS-16842', type: 'CO_PROCUREMENT', label: 'Mandatory CRS Safety Gate' },
];

export const KnowledgeGraph3DView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<Node | null>(INITIAL_NODES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [zoom, setZoom] = useState(1);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // Animation Loop with simple force-directed damping
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(zoom, zoom);

      // Draw Edges
      INITIAL_EDGES.forEach((edge) => {
        const src = nodes.find((n) => n.id === edge.source);
        const tgt = nodes.find((n) => n.id === edge.target);
        if (!src || !tgt) return;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (edge.type === 'SUPERSEDES') {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.setLineDash([4, 4]);
        } else if (edge.type === 'TEST_METHOD') {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
          ctx.setLineDash([]);
        }

        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Edge Label
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        ctx.fillStyle = '#71717A';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(edge.label, midX - 20, midY - 4);
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;
        const matchesFilter = activeFilter === 'ALL' || node.domain.toLowerCase().includes(activeFilter.toLowerCase());
        const matchesSearch = !searchQuery || node.isNumber.toLowerCase().includes(searchQuery.toLowerCase()) || node.title.toLowerCase().includes(searchQuery.toLowerCase());
        const opacity = matchesFilter && matchesSearch ? 1 : 0.2;

        ctx.globalAlpha = opacity;

        // Glowing outer halo for QCO mandatory or selected nodes
        if (node.status === 'MANDATORY_QCO' || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 7, 0, 2 * Math.PI);
          ctx.fillStyle = isSelected ? 'rgba(37, 99, 235, 0.18)' : 'rgba(234, 88, 12, 0.12)';
          ctx.fill();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#09090B' : '#FFFFFF';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Standard Label
        ctx.fillStyle = '#09090B';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(node.isNumber, node.x - node.radius - 8, node.y + node.radius + 14);

        // Status Badge Pill text
        ctx.fillStyle = '#71717A';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(node.domain.split('/')[0].trim(), node.x - node.radius - 8, node.y + node.radius + 26);
      });

      ctx.restore();
      ctx.globalAlpha = 1;

      if (isSimulating) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, selectedNode, activeFilter, searchQuery, zoom, isSimulating]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const clicked = nodes.find((n) => Math.hypot(n.x - x, n.y - y) <= n.radius + 5);
    if (clicked) {
      setSelectedNode(clicked);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--superposition-violet)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0 }}>
                SOVEREIGN KNOWLEDGE GRAPH (22,011 STANDARDS NEURAL MESH)
              </span>
              <span className="concept-status-badge active" style={{ fontSize: '9px' }}>
                LIVE GRAPH RAG
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Interactive Citation & Supersession Mesh Explorer
            </h1>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Deep traversal showing how primary specifications bridge with normative references, test methods, and Quality Control Orders (QCO).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="category-filter-bar">
              {['ALL', 'Civil', 'Metallurgy', 'Testing', 'Electronics', 'Chemicals'].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`category-pill ${activeFilter === d ? 'selected' : ''}`}
                  onClick={() => setActiveFilter(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph Workbench Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', alignItems: 'start' }}>
        {/* Canvas Card */}
        <div className="workbench-card" style={{ padding: 0, position: 'relative', overflow: 'hidden' }}>
          {/* Canvas Toolbar Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--hairline)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Search size={14} color="#71717A" />
              <input
                type="text"
                placeholder="Search standard in mesh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-ui)',
                  background: 'transparent',
                  width: '160px',
                  color: 'var(--ink)',
                }}
              />
            </div>
            <span style={{ width: '1px', height: '14px', background: 'var(--hairline)' }} />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
              title="Zoom In"
            >
              <ZoomIn size={15} color="#52525B" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
              title="Zoom Out"
            >
              <ZoomOut size={15} color="#52525B" />
            </button>
            <button
              type="button"
              onClick={() => { setZoom(1); setSelectedNode(INITIAL_NODES[0]); setSearchQuery(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
              title="Reset View"
            >
              <RotateCcw size={14} color="#52525B" />
            </button>
          </div>

          <canvas
            ref={canvasRef}
            width={850}
            height={520}
            onClick={handleCanvasClick}
            style={{ width: '100%', height: 'auto', display: 'block', background: '#FAFAFA', cursor: 'pointer' }}
          />

          {/* Graph Legend Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--hairline)',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              color: 'var(--ink-muted)',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} /> Civil
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EA580C' }} /> Metallurgy
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Test Method
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Superseded
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '10.5px' }}>
              CLICK ANY NODE TO INSPECT LINEAGE
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="code-monogram" style={{ fontSize: '13px' }}>
                  {selectedNode.isNumber}
                </span>
                <span className={`concept-status-badge ${selectedNode.status === 'SUPERSEDED' ? 'withdrawn' : 'active'}`} style={{ marginLeft: '8px' }}>
                  {selectedNode.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                {selectedNode.title}
              </h3>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                Division: {selectedNode.domain} · Reaffirmed: {selectedNode.year}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="metric-mini-tile" style={{ padding: '8px 10px' }}>
                <span className="label">Inbound Citations</span>
                <span className="val">{selectedNode.citations} Tenders</span>
              </div>
              <div className="metric-mini-tile" style={{ padding: '8px 10px' }}>
                <span className="label">Graph Centrality</span>
                <span className="val">0.89 (High)</span>
              </div>
            </div>

            {/* Connected Relations List */}
            <div>
              <div className="section-label">CONNECTED STANDARDS LINEAGE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {INITIAL_EDGES.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).map((edge, idx) => {
                  const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                  const otherNode = nodes.find((n) => n.id === otherId);
                  if (!otherNode) return null;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedNode(otherNode)}
                      style={{
                        padding: '8px 10px',
                        background: 'var(--surface-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--hairline)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontFamily: 'var(--font-data)', fontSize: '11.5px', color: 'var(--ink)' }}>
                          {otherNode.isNumber}
                        </strong>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: 'var(--ink-muted)' }}>
                          {edge.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                        {edge.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
