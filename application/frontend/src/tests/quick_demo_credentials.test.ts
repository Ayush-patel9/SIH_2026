import assert from 'node:assert';

// Mock localStorage if in pure Node environment
class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
  get length(): number {
    return Object.keys(this.store).length;
  }
  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

// Ensure global localStorage has full Storage interface in Node
Object.defineProperty(globalThis, 'localStorage', {
  value: new MockStorage(),
  writable: true,
  configurable: true,
});

import { DEMO_ACCOUNTS } from '../data/demoAccounts';
import {
  getRegisteredUsers,
  loginWithCredentials,
  loginAsDemo,
  getSession,
  logout,
} from '../store/userStore';
import { roleStore } from '../store/roleStore';

console.log('--- Running Tests for Team Nexus / IIITB Quick Demo Credentials ---');

// Test 1: Verify exactly 2 DEMO_ACCOUNTS for Team Nexus & IIITB
assert.strictEqual(DEMO_ACCOUNTS.length, 2, 'Must define exactly 2 demo accounts (Team Nexus / IIITB)');
const judgeDemo = DEMO_ACCOUNTS.find((d) => d.id === 'demo_nexus_judge');
const vendorDemo = DEMO_ACCOUNTS.find((d) => d.id === 'demo_nexus_vendor');

assert.ok(judgeDemo, 'Team Nexus judge demo account must exist');
assert.ok(vendorDemo, 'Team Nexus vendor demo account must exist');
assert.strictEqual(judgeDemo.name, 'Team Nexus · IIITB (Judge)');
assert.strictEqual(judgeDemo.email, 'teamnexus.judge@iiitb.ac.in');
assert.strictEqual(judgeDemo.role, 'OFFICER');
assert.strictEqual(judgeDemo.recommendedForJudge, true, 'Judge persona must be recommended for judges');

assert.strictEqual(vendorDemo.name, 'Team Nexus · IIITB (Vendor)');
assert.strictEqual(vendorDemo.email, 'teamnexus.vendor@iiitb.ac.in');
assert.strictEqual(vendorDemo.role, 'VENDOR');
console.log('✓ Exactly 2 Team Nexus / IIITB demo accounts verified');

// Test 2: getRegisteredUsers auto-seeds both demo accounts
logout();
const initialUsers = getRegisteredUsers();
assert.ok(initialUsers.length >= 2, 'getRegisteredUsers must seed demo accounts');
assert.ok(initialUsers.some((u) => u.email === 'teamnexus.judge@iiitb.ac.in'));
assert.ok(initialUsers.some((u) => u.email === 'teamnexus.vendor@iiitb.ac.in'));
console.log('✓ Automatic Team Nexus demo account pre-seeding verified');

// Test 3: Direct credential sign in with demo email & password
const authJudge = loginWithCredentials('teamnexus.judge@iiitb.ac.in', 'demo123');
assert.strictEqual(authJudge.success, true);
assert.strictEqual(authJudge.user?.email, 'teamnexus.judge@iiitb.ac.in');
assert.strictEqual(authJudge.user?.role, 'OFFICER');
assert.strictEqual(roleStore.getRole(), 'OFFICER');
assert.strictEqual(getSession()?.email, 'teamnexus.judge@iiitb.ac.in');
console.log('✓ Direct credential login for Team Nexus Judge verified');

// Test 4: 1-Click loginAsDemo for Judge Mode
logout();
assert.strictEqual(getSession(), null);
const quickJudge = loginAsDemo('demo_nexus_judge');
assert.strictEqual(quickJudge.success, true);
assert.strictEqual(quickJudge.user?.id, 'demo_nexus_judge');
assert.strictEqual(quickJudge.user?.role, 'OFFICER');
assert.strictEqual(roleStore.getRole(), 'OFFICER');
assert.strictEqual(getSession()?.name, 'Team Nexus · IIITB (Judge)');
console.log('✓ 1-Click loginAsDemo for Team Nexus Authority Judge verified');

// Test 5: 1-Click loginAsDemo for Industrial Vendor
const quickVendor = loginAsDemo('demo_nexus_vendor');
assert.strictEqual(quickVendor.success, true);
assert.strictEqual(quickVendor.user?.id, 'demo_nexus_vendor');
assert.strictEqual(quickVendor.user?.role, 'VENDOR');
assert.strictEqual(roleStore.getRole(), 'VENDOR');
assert.strictEqual(getSession()?.name, 'Team Nexus · IIITB (Vendor)');
console.log('✓ 1-Click loginAsDemo for Team Nexus Industrial Vendor verified');

console.log('--- ALL TEAM NEXUS / IIITB QUICK DEMO CREDENTIAL TESTS PASSED ---');
