import assert from 'node:assert';
import { computeDashboardMetrics } from '../features/dashboard/metricsAggregator';
import { executeMCPTool, MCP_TOOLS_MANIFEST } from '../features/mcp/mcpClient';
import cementMock from '../fixtures/cement_mock.json';
import type { StandardsResponse } from '../types';

console.log('--- Running Isolated Tests for Task 4 & Task 6 ---');

// 1. Test computeDashboardMetrics with empty dataset
const emptyMetrics = computeDashboardMetrics([], []);
assert(emptyMetrics.totalQueries >= 0, 'Empty metrics totalQueries should be >= 0');
assert(emptyMetrics.standardsCovered > 0, 'Empty metrics should include statutory baseline standards');
assert(typeof emptyMetrics.standardsQueried === 'object', 'standardsQueried should be an object');
assert(typeof emptyMetrics.domainsQueried === 'object', 'domainsQueried should be an object');
console.log(`✓ computeDashboardMetrics handles empty array safely with baseline (${emptyMetrics.totalQueries} total queries)`);

// 2. Test computeDashboardMetrics with sample records
const sampleStored = [
  { id: '1', response: cementMock as unknown as StandardsResponse, savedAt: Date.now() },
];
const populatedMetrics = computeDashboardMetrics(sampleStored, []);
assert(populatedMetrics.totalQueries >= emptyMetrics.totalQueries, 'Populated metrics should be >= empty metrics');
assert(populatedMetrics.trustScorePercent >= 0, 'Trust score should be valid number');
console.log(`✓ computeDashboardMetrics computed metrics: ${populatedMetrics.totalQueries} queries, Trust score: ${populatedMetrics.trustScorePercent}%`);

// 3. Test MCP Tool Manifest
assert(Array.isArray(MCP_TOOLS_MANIFEST), 'MCP_TOOLS_MANIFEST is not an array');
assert(MCP_TOOLS_MANIFEST.length >= 5, `Expected at least 5 MCP tools, found ${MCP_TOOLS_MANIFEST.length}`);
console.log(`✓ MCP Tools Manifest contains ${MCP_TOOLS_MANIFEST.length} tools`);

// 4. Test executeMCPTool for tools
async function runAsyncTests() {
  const statusRes = await executeMCPTool(
    'check_standard_status',
    { is_number: 'IS 269:2015' },
    cementMock as unknown as StandardsResponse
  );
  assert(statusRes.result, 'Missing result from executeMCPTool check_standard_status');
  assert.strictEqual(statusRes.result.is_number, 'IS 269:2015');
  console.log('✓ executeMCPTool check_standard_status returned:', statusRes.result.is_number, statusRes.result.status);

  const nitRes = await executeMCPTool(
    'generate_nit_clause',
    { is_number: 'IS 269:2015', product_name: 'OPC Cement 43 Grade', template: 'standard_gem' },
    cementMock as unknown as StandardsResponse
  );
  assert(nitRes.result, 'Missing result from executeMCPTool generate_nit_clause');
  assert(typeof nitRes.result.nit_clause === 'string', 'Expected nit_clause string in result');
  console.log('✓ executeMCPTool generate_nit_clause generated clause snippet');

  console.log('--- ALL TASK 4 & 6 ISOLATED TESTS PASSED SUCCESSFULLY ---');
}

runAsyncTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
