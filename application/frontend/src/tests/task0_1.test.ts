import assert from 'node:assert';
import cementMock from '../fixtures/cement_mock.json';
import hdpeMock from '../fixtures/hdpe_mock.json';
import ledMock from '../fixtures/led_mock.json';
import cctvMock from '../fixtures/cctv_mock.json';
import { DOMAIN_PRESETS } from '../features/explainability/mockGraphData';
import { roleStore } from '../store/roleStore';

console.log('--- Running Isolated Tests for Task 0 & Task 1 ---');

// 1. Validate fixtures have required fields
const mocks = [
  { name: 'cement', data: cementMock },
  { name: 'hdpe', data: hdpeMock },
  { name: 'led', data: ledMock },
  { name: 'cctv', data: cctvMock },
];

for (const { name, data } of mocks) {
  assert(data.meta, `${name} missing meta`);
  assert(data.meta.audit_reference_hash, `${name} missing audit_reference_hash`);
  assert(data.query_understanding, `${name} missing query_understanding`);
  assert(data.primary_recommendation, `${name} missing primary_recommendation`);
  assert(data.primary_recommendation.is_number, `${name} missing is_number`);
  assert(data.primary_recommendation.certification, `${name} missing certification`);
  assert(Array.isArray(data.allied_standards), `${name} missing allied_standards array`);
  assert(Array.isArray(data.graph_path), `${name} missing graph_path array`);
  assert(Array.isArray(data.reasoning_trace), `${name} missing reasoning_trace array`);
  assert(Array.isArray(data.compliance_checklist), `${name} missing compliance_checklist array`);
  assert(data.audit_record, `${name} missing audit_record`);
  assert(data.staleness_risk, `${name} missing staleness_risk`);
  assert(data.multilingual, `${name} missing multilingual`);
  console.log(`✓ Fixture valid: ${name} (${data.primary_recommendation.is_number})`);
}

// 2. Validate DOMAIN_PRESETS
assert(DOMAIN_PRESETS.cement, 'Missing cement in DOMAIN_PRESETS');
assert(DOMAIN_PRESETS.steel, 'Missing steel in DOMAIN_PRESETS');
assert(DOMAIN_PRESETS.hdpe, 'Missing hdpe in DOMAIN_PRESETS');
assert(DOMAIN_PRESETS.led, 'Missing led in DOMAIN_PRESETS');
assert(DOMAIN_PRESETS.cctv, 'Missing cctv in DOMAIN_PRESETS');
assert.strictEqual(DOMAIN_PRESETS.hdpe.data.primary_recommendation.is_number, 'IS 4984:2016');
assert.strictEqual(DOMAIN_PRESETS.led.data.primary_recommendation.is_number, 'IS 16102 (Part 1):2012');
assert.strictEqual(DOMAIN_PRESETS.cctv.data.primary_recommendation.is_number, 'IS 16165:2014');
console.log('✓ All 5 Domain Presets verified in DOMAIN_PRESETS');

// 3. Test roleStore state updates and subscriptions
let roleNotified = false;
let modeNotified = false;
const unsub = roleStore.subscribe(() => {
  if (roleStore.getRole() === 'VENDOR') roleNotified = true;
  if (roleStore.getMode() === 'dry_run') modeNotified = true;
});

roleStore.setRole('VENDOR');
assert.strictEqual(roleStore.getRole(), 'VENDOR');
assert(roleNotified, 'roleStore subscription failed on setRole');

roleStore.setMode('dry_run');
assert.strictEqual(roleStore.getMode(), 'dry_run');
assert(modeNotified, 'roleStore subscription failed on setMode');

// Reset to defaults
roleStore.setRole('OFFICER');
roleStore.setMode('recommend');
unsub();
console.log('✓ roleStore state management and subscriptions verified');

console.log('--- ALL ISOLATED TESTS PASSED SUCCESSFULLY ---');
