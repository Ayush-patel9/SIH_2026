import type { StandardsResponse } from '../../types';
import { CEMENT_MOCK_DATA, STEEL_MOCK_DATA } from '../explainability/mockGraphData';
import { MOCK_ALERTS } from '../alerts/alertStore';
import { generateNITClause } from '../nitGenerator/clauseTemplates';

export interface MCPToolDefinition {
  name: string;
  description: string;
  category: 'core' | 'regulatory' | 'procurement' | 'conformity';
  parameters: {
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
  }[];
}

export const MCP_TOOLS_MANIFEST: MCPToolDefinition[] = [
  {
    name: 'search_standards',
    description: 'Searches BIS Indian Standards via GraphRAG pipeline and returns primary recommendation.',
    category: 'core',
    parameters: [
      { name: 'query', type: 'string', required: true, default: '43 grade OPC cement for highway construction', description: 'Product or technical specification search query' },
    ],
  },
  {
    name: 'check_certification',
    description: 'Verifies mandatory BIS ISI / CRS certification requirements and quality control order status for an IS standard.',
    category: 'regulatory',
    parameters: [
      { name: 'is_number', type: 'string', required: true, default: 'IS 269:2015', description: 'Indian Standard number (e.g. IS 269:2015)' },
    ],
  },
  {
    name: 'get_normative_refs',
    description: 'Returns normative reference graph edges, test methods, and allied cross-referenced standards for an IS number.',
    category: 'core',
    parameters: [
      { name: 'is_number', type: 'string', required: true, default: 'IS 269:2015', description: 'Indian Standard number' },
    ],
  },
  {
    name: 'get_standard_recommendation',
    description: 'Returns the applicable BIS Indian Standard for a given procurement product query. Returns IS number, title, status, certification requirements, confidence, and reasoning trace.',
    category: 'core',
    parameters: [
      { name: 'query', type: 'string', required: true, default: 'Procurement of 43 grade ordinary portland cement for highway construction.', description: 'Natural language product or specification query' },
      { name: 'domain', type: 'string', required: false, default: 'construction', description: 'Domain category filter (construction, metallurgy, electronics, general)' },
      { name: 'mode', type: 'string', required: false, default: 'recommend', description: 'Operational mode (recommend, compare, validate, audit)' },
    ],
  },
  {
    name: 'check_standard_status',
    description: 'Returns the current status (ACTIVE, WITHDRAWN, UNDER_REVISION) of a specific IS standard number, including latest amendment and BIS certification requirements.',
    category: 'regulatory',
    parameters: [
      { name: 'is_number', type: 'string', required: true, default: 'IS 269:2015', description: 'Indian Standard number (e.g. IS 269:2015, IS 8112:1989, IS 1786:2008)' },
    ],
  },
  {
    name: 'list_active_alerts',
    description: 'Returns a list of currently active BIS standard amendment/withdrawal alerts that may affect active tenders.',
    category: 'regulatory',
    parameters: [
      { name: 'severity', type: 'string', required: false, default: 'ALL', description: 'Severity filter (ALL, CRITICAL, HIGH, MEDIUM, LOW)' },
      { name: 'limit', type: 'number', required: false, default: '5', description: 'Maximum alerts to retrieve' },
    ],
  },
  {
    name: 'generate_nit_clause',
    description: 'Generates a legally-structured NIT technical specification clause for a given IS standard number and product name, ready for pasting into GeM or NIC eProcurement portals.',
    category: 'procurement',
    parameters: [
      { name: 'is_number', type: 'string', required: true, default: 'IS 269:2015', description: 'Indian Standard designation' },
      { name: 'product_name', type: 'string', required: true, default: 'Ordinary Portland Cement 43 Grade', description: 'Procurement item description' },
      { name: 'template', type: 'string', required: false, default: 'standard_gem', description: 'Portal format (standard_gem, cpwd, roads_highways, railways, defence)' },
    ],
  },
  {
    name: 'find_testing_labs',
    description: 'Finds BIS-recognized and NABL-accredited testing laboratories capable of testing against standard.',
    category: 'conformity',
    parameters: [
      { name: 'is_number', type: 'string', required: true, default: 'IS 269', description: 'Indian Standard designation' },
      { name: 'state', type: 'string', required: false, default: 'Delhi', description: 'State or regional boundary filter' },
    ],
  },
  {
    name: 'verify_isi_licensee',
    description: 'Verifies whether a manufacturer holds an operative BIS ISI / CRS license for a given standard.',
    category: 'conformity',
    parameters: [
      { name: 'is_number', type: 'string', required: true, default: 'IS 269:2015', description: 'Indian Standard designation' },
      { name: 'manufacturer_name', type: 'string', required: false, default: 'UltraTech', description: 'Manufacturer / brand name to verify' },
    ],
  },
];

/**
 * Client-side execution of MCP tool calls.
 * If local Python MCP server is running on http://localhost:8001, attempts live fetch;
 * otherwise executes client-side reference implementation seamlessly.
 */
export async function executeMCPTool(
  toolName: string,
  parameters: Record<string, any>,
  currentData: StandardsResponse
): Promise<{ result: any; source: 'live_http_server' | 'client_emulator'; latencyMs: number }> {
  const start = performance.now();

  // Try live fetch from Python server on port 8001
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600);

    const response = await fetch('http://localhost:8001/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_name: toolName, parameters }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        result: data.result,
        source: 'live_http_server',
        latencyMs: Math.round(performance.now() - start),
      };
    }
  } catch {
    // Graceful fallback to client-side emulator
  }

  // Client-Side Execution Engine (Deterministic)
  await new Promise((r) => setTimeout(r, 120)); // Realistic network latency simulation
  let output: any;

  switch (toolName) {
    case 'search_standards': {
      output = {
        standards: [currentData.primary_recommendation],
        total: 1,
        source: 'ManakAI GraphRAG',
      };
      break;
    }

    case 'check_certification': {
      const isNum = (parameters.is_number || currentData.primary_recommendation?.is_number || 'IS 269:2015').toUpperCase();
      output = {
        is_number: isNum,
        mandatory: true,
        scheme: currentData.primary_recommendation?.certification?.scheme || 'BIS_ISI_MARK',
        certification_body: 'Bureau of Indian Standards',
      };
      break;
    }

    case 'get_normative_refs': {
      const isNum = parameters.is_number || currentData.primary_recommendation?.is_number || 'IS 269:2015';
      output = {
        is_number: isNum,
        test_methods: ['IS 4031:1988', 'IS 4032:1985'],
        allied: (currentData.allied_standards || []).map((s) => s.is_number),
      };
      break;
    }

    case 'get_standard_recommendation': {
      const q = (parameters.query || '').toLowerCase();
      const isSteel = q.includes('steel') || q.includes('plate') || q.includes('rebar');
      output = isSteel ? STEEL_MOCK_DATA : CEMENT_MOCK_DATA;
      break;
    }

    case 'check_standard_status': {
      const isNum = (parameters.is_number || '').toUpperCase();
      if (isNum.includes('8112') || isNum.includes('226')) {
        output = {
          is_number: isNum,
          status: 'WITHDRAWN',
          year_published: 1989,
          amendment: 'Withdrawn in 2015',
          certification: { mandatory: false, scheme: null },
          replaced_by: isNum.includes('8112') ? 'IS 269:2015' : 'IS 2062:2011',
          warning: 'DO NOT CITE in active procurement tenders.',
        };
      } else {
        output = {
          is_number: isNum,
          status: 'ACTIVE',
          year_published: 2015,
          amendment: 'Amendment 1 (2019)',
          certification: {
            mandatory: true,
            scheme: 'BIS_ISI_MARK',
            qco_order_name: isNum.includes('2062') ? 'Steel Products QCO 2020' : 'Cement QCO 2003',
          },
          scope: 'Standard is fully active, gazetted, and mandatory under statutory Quality Control Orders.',
        };
      }
      break;
    }

    case 'list_active_alerts': {
      const sev = parameters.severity || 'ALL';
      const lim = Number(parameters.limit) || 5;
      const filtered = sev === 'ALL' ? MOCK_ALERTS : MOCK_ALERTS.filter((a) => a.severity === sev);
      output = filtered.slice(0, lim);
      break;
    }

    case 'generate_nit_clause': {
      const isNumber = parameters.is_number || currentData.primary_recommendation.is_number;
      const tmpl = parameters.template || 'standard_gem';
      const text = generateNITClause(currentData, tmpl);
      output = {
        is_number: isNumber,
        product_name: parameters.product_name || 'Procurement Material',
        template: tmpl,
        clause_text: text,
        nit_clause: text,
      };
      break;
    }

    case 'find_testing_labs': {
      output = [
        { name: 'National Test House (Northern Region)', state: parameters.state || 'Delhi', nabl_code: 'TC-5012', scope: 'Civil & Mechanical Testing' },
        { name: 'Central Road Research Institute (CSIR-CRRI)', state: 'Delhi', nabl_code: 'TC-6190', scope: 'Highway Materials' },
        { name: 'National Council for Cement & Building Materials (NCB)', state: 'Haryana', nabl_code: 'TC-5211', scope: 'Cement & Concrete Testing' },
      ];
      break;
    }

    case 'verify_isi_licensee': {
      output = [
        { cml_number: 'CM/L-0248911', manufacturer: parameters.manufacturer_name || 'UltraTech Cement Ltd.', status: 'OPERATIVE', valid_upto: '2028-12-31' },
        { cml_number: 'CM/L-0182944', manufacturer: 'ACC Limited', status: 'OPERATIVE', valid_upto: '2027-09-30' },
      ];
      break;
    }

    default:
      output = { error: `Tool ${toolName} not recognized.` };
  }

  return {
    result: output,
    source: 'client_emulator',
    latencyMs: Math.round(performance.now() - start),
  };
}
