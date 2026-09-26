import assert from 'node:assert';
import { uploadTenderText, uploadPDF } from '../api/standardsClient';
import { ProcurementOfficerPanel, AuditorPanel, VendorPanel } from '../features/roles';
import { TenderUploadView } from '../features/tenderUpload';

console.log('--- Running Isolated Tests for Task 2 & Task 3 ---');

// 1. Verify Role Panel components exist and are callable functions (React FC)
assert.strictEqual(typeof ProcurementOfficerPanel, 'function', 'ProcurementOfficerPanel is not exported properly');
assert.strictEqual(typeof AuditorPanel, 'function', 'AuditorPanel is not exported properly');
assert.strictEqual(typeof VendorPanel, 'function', 'VendorPanel is not exported properly');
console.log('✓ Role panels exported and callable: ProcurementOfficerPanel, AuditorPanel, VendorPanel');

// 2. Verify TenderUploadView exists and is callable
assert.strictEqual(typeof TenderUploadView, 'function', 'TenderUploadView is not exported properly');
console.log('✓ TenderUploadView component exported and callable');

// 3. Test uploadTenderText API returns an array of valid StandardsResponses
async function runAsyncTests() {
  const tenderText = `
    Item 1: 43 Grade OPC Cement for highway culverts.
    Item 2: High tensile structural steel plates Fe 500D.
    Item 3: 110mm PN6 HDPE pipes.
  `;
  const textResults = await uploadTenderText(tenderText);
  assert(Array.isArray(textResults), 'uploadTenderText did not return an array');
  assert.strictEqual(textResults.length, 3, `Expected 3 results from uploadTenderText, got ${textResults.length}`);

  for (const res of textResults) {
    assert(res.primary_recommendation, 'Result missing primary_recommendation');
    assert(res.primary_recommendation.is_number, 'Result missing is_number');
    assert(res.audit_record, 'Result missing audit_record');
    assert(Array.isArray(res.allied_standards), 'Result missing allied_standards');
  }
  console.log(`✓ uploadTenderText returned ${textResults.length} validated item recommendations`);

  // Test uploadPDF API
  const fakePdfFile = { name: 'tender_sample.pdf', size: 1024 } as unknown as File;
  const pdfResults = await uploadPDF(fakePdfFile);
  assert(Array.isArray(pdfResults), 'uploadPDF did not return an array');
  assert.strictEqual(pdfResults.length, 2, `Expected 2 results from uploadPDF, got ${pdfResults.length}`);
  console.log(`✓ uploadPDF returned ${pdfResults.length} validated item recommendations`);

  console.log('--- ALL TASK 2 & 3 ISOLATED TESTS PASSED SUCCESSFULLY ---');
}

runAsyncTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
