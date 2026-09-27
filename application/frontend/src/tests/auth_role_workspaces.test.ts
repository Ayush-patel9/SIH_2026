import assert from 'node:assert';
import { getSession, register, loginWithCredentials, logout, getRegisteredUsers } from '../store/userStore';
import { roleStore } from '../store/roleStore';
import { AuditStore } from '../features/audit';
import type { StandardsResponse } from '../types';

console.log('--- Running Tests for Real User Registration, Auth & Data Isolation ---');

// Mock browser localStorage for Node testing environment
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => store[k] || null,
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null,
  };
}

// 1. Initial State
logout();
assert.strictEqual(getSession(), null, 'Session should be null after logout');

// 2. Register Officer Account
const officerReg = register({
  name: 'Vikram Joshi',
  email: 'vikram.joshi@cpwd.gov.in',
  password: 'securePassword123',
  organization: 'CPWD - Central Public Works Department',
  role: 'PROCUREMENT_OFFICER',
  ministry: 'MoHUA',
});

assert.strictEqual(officerReg.success, true, 'Officer registration should succeed');
assert.strictEqual(officerReg.user?.name, 'Vikram Joshi');
assert.strictEqual(officerReg.user?.role, 'PROCUREMENT_OFFICER');
assert.strictEqual(roleStore.getRole(), 'PROCUREMENT_OFFICER', 'roleStore must sync to registered role');
assert.strictEqual(getSession()?.email, 'vikram.joshi@cpwd.gov.in');
console.log('✓ Registered new Procurement Officer account & auto-logged into session');

// 3. Prevent Duplicate Registration
const duplicateReg = register({
  name: 'Vikram Impersonator',
  email: 'vikram.joshi@cpwd.gov.in',
  password: 'anotherPassword',
  organization: 'Fake Org',
  role: 'AUDITOR',
});
assert.strictEqual(duplicateReg.success, false, 'Duplicate email registration must fail');
console.log('✓ Duplicate email registration properly blocked');

// 4. Register Auditor Account
const auditorReg = register({
  name: 'Ananya Sharma',
  email: 'ananya.sharma@cag.gov.in',
  password: 'auditorSecret789',
  organization: 'CAG Principal Directorate of Audit',
  role: 'AUDITOR',
  auditOffice: 'Commercial Audit Directorate',
});
assert.strictEqual(auditorReg.success, true);
assert.strictEqual(getSession()?.name, 'Ananya Sharma');
assert.strictEqual(roleStore.getRole(), 'AUDITOR');
console.log('✓ Registered new Auditor account & switched session');

// 5. Test Logout & Credential Login
logout();
assert.strictEqual(getSession(), null);

// Wrong password
const badLogin = loginWithCredentials('vikram.joshi@cpwd.gov.in', 'wrongPassword');
assert.strictEqual(badLogin.success, false, 'Incorrect password must be rejected');

// Valid login
const goodLogin = loginWithCredentials('vikram.joshi@cpwd.gov.in', 'securePassword123');
assert.strictEqual(goodLogin.success, true);
assert.strictEqual(goodLogin.user?.name, 'Vikram Joshi');
assert.strictEqual(getSession()?.name, 'Vikram Joshi');
assert.strictEqual(roleStore.getRole(), 'PROCUREMENT_OFFICER');
console.log('✓ Credential authentication verified (bad password rejected, good password accepted)');

// 6. Test Data Isolation between real registered users
const mockResponseOfficer: StandardsResponse = {
  $schema: 'SIH2026.StandardsResponse.v1',
  meta: { query_id: 'query-officer-999', session_id: 'sess-1', execution_time_ms: 120, model_version: '1.0', audit_reference_hash: 'abc123' },
  primary_recommendation: { is_number: 'IS 269:2015', title: 'Ordinary Portland Cement', division_code: 'CED 2', publication_year: 2015, status: 'ACTIVE', confidence: 0.98 } as any,
  allied_standards: [],
  audit_record: { recommendation_id: 'rec-1', query_id: 'query-officer-999', audit_hash: 'hash-officer-999', timestamp_utc: new Date().toISOString(), logged: true, dry_run: false, rti_exportable: true },
};

const mockResponseAuditor: StandardsResponse = {
  $schema: 'SIH2026.StandardsResponse.v1',
  meta: { query_id: 'query-auditor-888', session_id: 'sess-2', execution_time_ms: 95, model_version: '1.0', audit_reference_hash: 'def456' },
  primary_recommendation: { is_number: 'IS 1786:2008', title: 'High Strength Deformed Steel Bars', division_code: 'CED 54', publication_year: 2008, status: 'ACTIVE', confidence: 0.96 } as any,
  allied_standards: [],
  audit_record: { recommendation_id: 'rec-2', query_id: 'query-auditor-888', audit_hash: 'hash-auditor-888', timestamp_utc: new Date().toISOString(), logged: true, dry_run: false, rti_exportable: true },
};

// While logged in as Officer, save audit log
AuditStore.save(mockResponseOfficer);
const officerLogs = AuditStore.getAll();
assert.strictEqual(officerLogs.length, 1);
assert.strictEqual(officerLogs[0].id, 'query-officer-999');

// Log in as Auditor and verify Officer logs are invisible
loginWithCredentials('ananya.sharma@cag.gov.in', 'auditorSecret789');
const auditorLogsBefore = AuditStore.getAll();
assert.strictEqual(auditorLogsBefore.length, 0, 'Auditor must NOT see Officer audit logs');

// Save auditor log
AuditStore.save(mockResponseAuditor);
const auditorLogsAfter = AuditStore.getAll();
assert.strictEqual(auditorLogsAfter.length, 1);
assert.strictEqual(auditorLogsAfter[0].id, 'query-auditor-888');
console.log('✓ Complete data isolation between registered Officer and Auditor verified');

console.log('--- ALL REAL REGISTRATION & AUTH TESTS PASSED ---');
