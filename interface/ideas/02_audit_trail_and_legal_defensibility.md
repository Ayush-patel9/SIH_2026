# Feature 02: Audit Trail & Legal Defensibility (CVC / RTI Defense Certificate)

## 1. Executive Summary & Value Proposition
In public procurement, an officer can be investigated by the Central Vigilance Commission (CVC), Comptroller and Auditor General (CAG), or face Right to Information (RTI) queries regarding tender specifications.
This feature generates a **cryptographically verifiable, timestamped Vigilance Defense Certificate** containing the exact standard edition active at query time, SHA-256 integrity hash, and snapshot of the decision trail.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Cryptographic SHA-256 Integrity Engine**: Client-side / serverless hash generation that computes `SHA-256(query_id + timestamp + standard_id + officer_id)` for tamper-evident verification.
- **RTI / CVC Audit Dossier Generator**: A PDF / HTML exporter that compiles the query, timestamp, standard version snapshot, and legal gazette order into a downloadable official government memorandum format.
- **Local Storage / IndexedDB Audit Vault**: A client-side audit store that logs all past query records, allowing search, filtering by date/ministry, and instant re-verification against previous snapshots.
- **Verification Portal Simulator**: A public verification lookup widget where entering an `audit_hash` re-validates the certificate's authenticity.

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Permanent server-side database insertion into government SQL/PostgreSQL cluster.
- Automated synchronization with live BIS gazette revision feeds at query execution time.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`StandardsResponse.audit_record` from `API_CONTRACT_SCHEMA.md`):
```json
{
  "audit_record": {
    "recommendation_id": "rec-6d2f-48e2-b184",
    "query_id": "uuid-9f8a-4b2c-11e9",
    "timestamp": "2026-09-26T10:00:01Z",
    "standards_version_snapshot": {
      "IS 269:2015": {
        "status_at_query_time": "ACTIVE",
        "amendment_at_query_time": "Amendment 1 (2019)"
      }
    },
    "audit_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "logged": true,
    "dry_run": false,
    "rti_exportable": true
  }
}
```

### The Lock (How Application Consumes It):
- Pass `audit_record` into `AuditCertificateModal` to render the official Government of India vigilance record.
- Trigger `exportAuditPDF(audit_record)` to generate the official printable defense document.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/audit/auditHasher.ts`: Verifies SHA-256 checksums and validates snapshot integrity.
2. `src/modules/audit/pdfCertificateGenerator.ts`: Uses jsPDF or HTML print templates with BIS Government emblems, QR code stamp, and cryptographic watermark.
3. `src/modules/audit/auditLogStore.ts`: Manages persistent query logs in browser storage or SQLite.

### Edge-Case Handling:
- If `mode == "dry_run"` $\rightarrow$ Set `logged: false`, display prominent "PRE-SUBMISSION DRAFT — NOT LOGGED TO AUDIT TRAIL" banner.
- If `audit_hash` fails verification $\rightarrow$ Flag certificate with red warning "TAMPERING DETECTED".
