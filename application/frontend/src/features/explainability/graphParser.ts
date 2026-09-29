/**
 * graphParser.ts
 * Classification and topological layout algorithms for the Knowledge Graph.
 * Pure TypeScript, zero external graph dependencies.
 */

export interface GraphEdge {
  from: string;
  to: string;
  edge_type: string;
  label: string;
}

export type NodeCategory =
  | 'ACTIVE'
  | 'WITHDRAWN'
  | 'TEST_METHOD'
  | 'PRODUCT_ENTITY'
  | 'STANDARD'
  | 'QCO_MANDATE'
  | 'RAW_MATERIAL'
  | 'INSTALLATION_CODE';

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  type: NodeCategory;
  label: string;
  subLabel?: string;
  title?: string;
  clause?: string;
}

export const NODE_COLORS: Record<
  NodeCategory,
  { bg: string; border: string; text: string; badge: string; pillBg: string; pillText: string; accent: string }
> = {
  ACTIVE: {
    bg: '#EFF6FF',
    border: '#3B82F6',
    text: '#1E3A8A',
    badge: 'ACTIVE SPECIFICATION',
    pillBg: '#DBEAFE',
    pillText: '#1D4ED8',
    accent: '#2563EB',
  },
  WITHDRAWN: {
    bg: '#FEF2F2',
    border: '#EF4444',
    text: '#991B1B',
    badge: 'WITHDRAWN / CVC TRAP',
    pillBg: '#FEE2E2',
    pillText: '#DC2626',
    accent: '#DC2626',
  },
  TEST_METHOD: {
    bg: '#ECFDF5',
    border: '#10B981',
    text: '#065F46',
    badge: 'MANDATORY TEST PROTOCOL',
    pillBg: '#D1FAE5',
    pillText: '#047857',
    accent: '#059669',
  },
  PRODUCT_ENTITY: {
    bg: '#F8FAFC',
    border: '#64748B',
    text: '#0F172A',
    badge: 'PROCUREMENT REQUIREMENT',
    pillBg: '#E2E8F0',
    pillText: '#334155',
    accent: '#475569',
  },
  QCO_MANDATE: {
    bg: '#FFFBEB',
    border: '#F59E0B',
    text: '#92400E',
    badge: 'DPIIT QCO GAZETTE ORDER',
    pillBg: '#FEF3C7',
    pillText: '#B45309',
    accent: '#D97706',
  },
  RAW_MATERIAL: {
    bg: '#FAF5FF',
    border: '#A855F7',
    text: '#581C87',
    badge: 'RAW MATERIAL SPEC',
    pillBg: '#F3E8FF',
    pillText: '#7E22CE',
    accent: '#9333EA',
  },
  INSTALLATION_CODE: {
    bg: '#F0FDFA',
    border: '#14B8A6',
    text: '#134E4A',
    badge: 'CODE OF PRACTICE',
    pillBg: '#CCFBF1',
    pillText: '#0F766E',
    accent: '#0D9488',
  },
  STANDARD: {
    bg: '#EEF2FF',
    border: '#6366F1',
    text: '#312E81',
    badge: 'ALLIED NORMATIVE',
    pillBg: '#E0E7FF',
    pillText: '#4338CA',
    accent: '#4F46E5',
  },
};

/**
 * Classify a node into its legal / regulatory / technical category.
 */
export function classifyNode(nodeId: string, graphPath: GraphEdge[], primaryIsNumber?: string): NodeCategory {
  if (primaryIsNumber && (nodeId === primaryIsNumber || nodeId.replace(/\s*:\s*\d{4}/, '') === primaryIsNumber.replace(/\s*:\s*\d{4}/, ''))) {
    return 'ACTIVE';
  }

  const incomingEdge = graphPath.find((e) => e.to === nodeId);
  const outgoingEdge = graphPath.find((e) => e.from === nodeId);

  if (outgoingEdge?.edge_type === 'SUPERSEDED_BY' || outgoingEdge?.edge_type === 'WITHDRAWN' || nodeId.toLowerCase().includes('withdrawn')) {
    return 'WITHDRAWN';
  }

  if (nodeId.toLowerCase().includes('qco') || nodeId.toLowerCase().includes('gazette') || incomingEdge?.edge_type === 'QCO_MANDATE') {
    return 'QCO_MANDATE';
  }

  if (
    nodeId.includes('Part') ||
    incomingEdge?.edge_type?.includes('TEST') ||
    incomingEdge?.edge_type === 'REQUIRES_TEST_METHOD' ||
    incomingEdge?.label?.toLowerCase().includes('test')
  ) {
    return 'TEST_METHOD';
  }

  if (incomingEdge?.edge_type === 'RAW_MATERIAL_SPEC' || incomingEdge?.label?.toLowerCase().includes('raw material')) {
    return 'RAW_MATERIAL';
  }

  if (incomingEdge?.edge_type === 'INSTALLATION_CODE' || incomingEdge?.label?.toLowerCase().includes('practice') || incomingEdge?.label?.toLowerCase().includes('installation')) {
    return 'INSTALLATION_CODE';
  }

  if (!nodeId.startsWith('IS') && !nodeId.startsWith('ISO') && !nodeId.startsWith('IEC') && !nodeId.startsWith('ASTM')) {
    return 'PRODUCT_ENTITY';
  }

  return 'STANDARD';
}

/**
 * Compute spacious, non-overlapping topological layout coordinates for nodes.
 */
export function computeLayout(
  edges: GraphEdge[],
  primaryIsNumber?: string
): { positions: Record<string, NodePosition>; svgWidth: number; svgHeight: number } {
  const allNodes = [...new Set(edges.flatMap((e) => [e.from, e.to]))];
  if (allNodes.length === 0) {
    return { positions: {}, svgWidth: 800, svgHeight: 280 };
  }

  const inDegree: Record<string, number> = {};
  allNodes.forEach((n) => {
    inDegree[n] = 0;
  });
  edges.forEach((e) => {
    inDegree[e.to] = (inDegree[e.to] || 0) + 1;
  });

  const roots = allNodes.filter((n) => inDegree[n] === 0);
  const queue = roots.length > 0 ? roots.map((r) => ({ node: r, depth: 0 })) : [{ node: allNodes[0], depth: 0 }];

  const depths: Record<string, number> = {};
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { node, depth } = item;

    if (depths[node] === undefined) {
      depths[node] = depth;
      edges
        .filter((e) => e.from === node)
        .forEach((e) => queue.push({ node: e.to, depth: depth + 1 }));
    }
  }

  // Handle disconnected or cycle nodes
  allNodes.forEach((n, idx) => {
    if (depths[n] === undefined) {
      depths[n] = idx;
    }
  });

  // Group nodes by depth column
  const columns: Record<number, string[]> = {};
  allNodes.forEach((n) => {
    const d = depths[n] ?? 0;
    if (!columns[d]) columns[d] = [];
    columns[d].push(n);
  });

  const positions: Record<string, NodePosition> = {};
  const CARD_WIDTH = 210;
  const CARD_HEIGHT = 60;
  const COL_WIDTH = 410; // 200px clear gap between cards for edge label pills
  const ROW_HEIGHT = 114; // Generous vertical breathing room
  const PADDING_X = 40;
  const PADDING_Y = 44;

  const maxCol = Math.max(...Object.keys(columns).map((k) => parseInt(k, 10)), 0);
  const maxRows = Math.max(...Object.values(columns).map((v) => v.length), 1);

  Object.entries(columns).forEach(([colStr, nodes]) => {
    const col = parseInt(colStr, 10);
    // Center rows vertically in each column if column has fewer nodes
    const totalColHeight = nodes.length * ROW_HEIGHT;
    const maxColHeight = maxRows * ROW_HEIGHT;
    const startY = PADDING_Y + Math.max(0, (maxColHeight - totalColHeight) / 2);

    nodes.forEach((node, i) => {
      positions[node] = {
        id: node,
        x: PADDING_X + col * COL_WIDTH,
        y: startY + i * ROW_HEIGHT,
        type: classifyNode(node, edges, primaryIsNumber),
        label: node,
      };
    });
  });

  const svgWidth = Math.max(980, PADDING_X * 2 + (maxCol + 1) * COL_WIDTH - (COL_WIDTH - CARD_WIDTH));
  const svgHeight = Math.max(300, PADDING_Y * 2 + maxRows * ROW_HEIGHT);

  return { positions, svgWidth, svgHeight };
}

