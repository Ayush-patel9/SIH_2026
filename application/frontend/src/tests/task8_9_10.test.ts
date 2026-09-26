import assert from 'node:assert';
import { LoadingShimmer } from '../components/LoadingShimmer';
import { EmptyState } from '../components/EmptyState';
import { generateNITClause } from '../features/nitGenerator/clauseTemplates';
import cementMock from '../fixtures/cement_mock.json';
import hdpeMock from '../fixtures/hdpe_mock.json';
import ledMock from '../fixtures/led_mock.json';
import cctvMock from '../fixtures/cctv_mock.json';
import type { StandardsResponse } from '../types';

console.log('--- Running Isolated Tests for Tasks 8, 9 & 10 ---');

// 1. Verify Polish UI Components exist and are callable React components
assert.strictEqual(typeof LoadingShimmer, 'function', 'LoadingShimmer is not exported properly');
assert.strictEqual(typeof EmptyState, 'function', 'EmptyState is not exported properly');
console.log('✓ LoadingShimmer and EmptyState components verified');

// 2. Test 5 distinct NIT Clause Templates
const templates = ['standard_gem', 'cpwd', 'roads_highways', 'railways', 'defence'];
const generatedClauses: string[] = [];

for (const tmpl of templates) {
  const clause = generateNITClause(cementMock as unknown as StandardsResponse, tmpl);
  assert(typeof clause === 'string' && clause.length > 50, `Clause generation failed for template: ${tmpl}`);
  generatedClauses.push(clause);
  console.log(`✓ Template '${tmpl}' generated ${clause.length} chars clause`);
}

// Ensure templates generate distinct outputs
const uniqueClauses = new Set(generatedClauses);
assert.strictEqual(uniqueClauses.size, templates.length, 'Not all NIT templates generated unique clause texts');
console.log(`✓ All ${templates.length} NIT templates verified to produce unique tailored clauses`);

// 3. Verify Scope Snippets and ICS codes on all fixtures
const allMocks = [
  { name: 'Cement', data: cementMock as unknown as StandardsResponse },
  { name: 'HDPE', data: hdpeMock as unknown as StandardsResponse },
  { name: 'LED', data: ledMock as unknown as StandardsResponse },
  { name: 'CCTV', data: cctvMock as unknown as StandardsResponse },
];

for (const { name, data } of allMocks) {
  assert(data.primary_recommendation.scope_snippet, `${name} missing scope_snippet`);
  assert(Array.isArray(data.primary_recommendation.ics_codes), `${name} missing ics_codes`);
  console.log(`✓ ${name} has valid scope_snippet & ICS codes: ${data.primary_recommendation.ics_codes.join(', ')}`);
}

console.log('--- ALL TASKS 8, 9 & 10 ISOLATED TESTS PASSED SUCCESSFULLY ---');
