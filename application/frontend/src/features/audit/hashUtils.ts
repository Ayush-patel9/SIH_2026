/**
 * hashUtils.ts
 * Browser-native Web Crypto API utilities for cryptographic hashing and SHA-256 verification.
 */

import type { StandardsResponse } from '../../types';

/**
 * Compute SHA-256 digest of input strings (queryId, timestamp, recommendationId, isNumber).
 */
export async function computeAuditHash(
  queryId: string,
  timestamp: string,
  recommendationId?: string,
  isNumber?: string
): Promise<string> {
  const encoder = new TextEncoder();
  const rawString = `${queryId}:${timestamp}:${recommendationId || ''}:${isNumber || ''}`;
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface HashVerificationResult {
  valid: boolean;
  matchType?: 'STORED_RECORD' | 'LIVE_COMPUTED' | 'INVALID_FORMAT';
  record?: StandardsResponse;
  computedHash?: string;
  message: string;
}

/**
 * Verify a hash against cached audit logs or validate its cryptographic structure.
 */
export function verifyHash(
  inputHash: string,
  cachedRecords: StandardsResponse[]
): HashVerificationResult {
  const cleaned = inputHash.trim().toLowerCase();

  if (!/^[a-f0-9]{32,64}$/.test(cleaned)) {
    return {
      valid: false,
      matchType: 'INVALID_FORMAT',
      message: 'Invalid hash format. Must be a valid 64-character (SHA-256) or 32-character hexadecimal string.',
    };
  }

  const match = cachedRecords.find(
    (item) =>
      item.audit_record?.audit_hash?.toLowerCase() === cleaned ||
      item.meta?.audit_reference_hash?.toLowerCase() === cleaned
  );

  if (match) {
    return {
      valid: true,
      matchType: 'STORED_RECORD',
      record: match,
      message: `Verified authentic Government of India Standards Record. Matching Query ID: ${match.meta.query_id}`,
    };
  }

  return {
    valid: false,
    matchType: 'INVALID_FORMAT',
    message: 'No matching record found in the audit store. Record may have been modified or originated from another session.',
  };
}
