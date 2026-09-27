import assert from 'node:assert';
import { getAlerts, queryStandards } from '../api/standardsClient';
import { LanguageSelector } from '../components/LanguageSelector';

console.log('--- Running Isolated Tests for Task 5 & Task 7 ---');

// 1. Verify LanguageSelector component
assert.strictEqual(typeof LanguageSelector, 'function', 'LanguageSelector is not exported properly');
console.log('✓ LanguageSelector component exported and callable');

// 2. Test getAlerts API
async function runAsyncTests() {
  const alerts = await getAlerts();
  assert(Array.isArray(alerts), 'getAlerts did not return an array');
  assert(alerts.length >= 5, `Expected at least 5 alerts, got ${alerts.length}`);

  const criticals = alerts.filter((a) => a.severity === 'CRITICAL');
  const highs = alerts.filter((a) => a.severity === 'HIGH');
  const mediums = alerts.filter((a) => a.severity === 'MEDIUM');

  assert(criticals.length >= 2, `Expected at least 2 CRITICAL alerts, got ${criticals.length}`);
  assert(highs.length >= 2, `Expected at least 2 HIGH alerts, got ${highs.length}`);
  assert(mediums.length >= 1, `Expected at least 1 MEDIUM alert, got ${mediums.length}`);
  console.log(`✓ getAlerts returned ${alerts.length} alerts (${criticals.length} CRITICAL, ${highs.length} HIGH, ${mediums.length} MEDIUM)`);

  // 3. Test multilingual query with Hindi
  const hindiRes = await queryStandards('सीसीटीवी कैमरा सिस्टम', { language: 'hi' });
  assert(hindiRes.primary_recommendation, 'Missing primary recommendation for Hindi query');
  assert.strictEqual(hindiRes.primary_recommendation.is_number, 'IS 16165:2014');
  assert.strictEqual(hindiRes.multilingual.bhashini_used, true, 'Bhashini should be used for CCTV mock');
  console.log('✓ Bhashini multilingual query returned IS 16165:2014 with bhashini_used = true');

  console.log('--- ALL TASK 5 & 7 ISOLATED TESTS PASSED SUCCESSFULLY ---');
}

runAsyncTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
