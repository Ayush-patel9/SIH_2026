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

export type NodeCategory = 'ACTIVE' | 'WITHDRAWN' | 'TEST_METHOD' | 'PRODUCT_ENTITY' | 'STANDARD';

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  type: NodeCategory;
  label: string;
}

export const NODE_COLORS: Record<NodeCategory, { bg: string; border: string; text: string; badge: string }> = {
  ACTIVE: {
    bg: '#1B4FE0',
    border: '#60A5FA',
    text: '#FFFFFF',
    badge: 'ACTIVE STANDARD',
  },
  WITHDRAWN: {
    bg: '#C23B3B',
    border: '#F87171',
    text: '#FFFFFF',
    badge: 'WITHDRAWN / SUPERSEDED',
  },
  TEST_METHOD: {
    bg: '#D97706',
    border: '#FBBF24',
    text: '#FFFFFF',
    badge: 'MANDATORY TEST METHOD',
  },
  PRODUCT_ENTITY: {
    bg: '#2A303C',
    border: '#8890A0',
    text: '#EEF0F4',
    badge: 'PRODUCT SPECIFICATION',
  },
  STANDARD: {
    bg: '#6E5AD6',
    border: '#A78BFA',
    text: '#FFFFFF',
    badge: 'ALLIED STANDARD',
  },
};

/**
 * Classify a node into its legal / semantic category.
 */
export function classifyNode(nodeId: string, graphPath: GraphEdge[], primaryIsNumber?: string): NodeCategory {
  if (primaryIsNumber && nodeId === primaryIsNumber) {
    return 'ACTIVE';
  }

  const incomingEdge = graphPath.find((e) => e.to === nodeId);
  const outgoingEdge = graphPath.find((e) => e.from === nodeId);

  // If node was superseded or withdrawn
  if (outgoingEdge?.edge_type === 'SUPERSEDED_BY' || outgoingEdge?.edge_type === 'WITHDRAWN') {
    return 'WITHDRAWN';
  }

  if (nodeId.includes('Part') || incomingEdge?.edge_type?.includes('TEST') || incomingEdge?.edge_type === 'REQUIRES_TEST_METHOD') {
    return 'TEST_METHOD';
  }

  if (!nodeId.startsWith('IS') && !nodeId.startsWith('ISO') && !nodeId.startsWith('ASTM')) {
    return 'PRODUCT_ENTITY';
  }

  return 'STANDARD';
}

/**
 * Compute deterministic topological layout coordinates for nodes.
 */
export function computeLayout(edges: GraphEdge[], primaryIsNumber?: string): Record<string, NodePosition> {
  const allNodes = [...new Set(edges.flatMap((e) => [e.from, e.to]))];
  if (allNodes.length === 0) return {};

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

  // Handle any disconnected or cycle nodes
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
  const COL_WIDTH = 220;
  const ROW_HEIGHT = 90;
  const PADDING_X = 60;
  const PADDING_Y = 60;

  Object.entries(columns).forEach(([colStr, nodes]) => {
    const col = parseInt(colStr, 10);
    nodes.forEach((node, i) => {
      positions[node] = {
        id: node,
        x: PADDING_X + col * COL_WIDTH,
        y: PADDING_Y + i * ROW_HEIGHT,
        type: classifyNode(node, edges, primaryIsNumber),
        label: node,
      };
    });
  });

  return positions;
}
