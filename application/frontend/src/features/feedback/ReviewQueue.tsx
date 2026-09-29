import React, { useState, useMemo } from 'react';
import type { VerificationStatus, FeedbackType } from '../../types';
import type { ExtendedFeedbackItem } from './feedbackStore';
import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Download,
  Search,
  Sliders,
  Flag,
  Filter,
  Layers,
  Scale,
  BrainCircuit,
  Sparkles,
  Clock,
  AlertTriangle,
  FileText,
  Check,
  Trash2,
  UserCheck,
  RotateCcw,
  Building2,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ReviewQueueProps {
  items: ExtendedFeedbackItem[];
  onStatusChange: (feedbackId: string, newStatus: VerificationStatus) => void;
  onBatchStatusChange: (feedbackIds: string[], newStatus: VerificationStatus) => void;
  onDeleteItem: (feedbackId: string) => void;
  onExportJSON: () => void;
  onTriggerCalibration: (item: ExtendedFeedbackItem) => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  items,
  onStatusChange,
  onBatchStatusChange,
  onDeleteItem,
  onExportJSON,
  onTriggerCalibration,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | VerificationStatus>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | FeedbackType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectingItem, setInspectingItem] = useState<ExtendedFeedbackItem | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== 'ALL' && item.verification_status !== statusFilter) return false;
      if (deptFilter !== 'ALL' && !item.submitter?.ministry_code?.toLowerCase().includes(deptFilter.toLowerCase())) return false;
      if (typeFilter !== 'ALL' && item.feedback_type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.flagged_is_number.toLowerCase().includes(q) ||
          (item.correct_is_number && item.correct_is_number.toLowerCase().includes(q)) ||
          (item.officer_notes && item.officer_notes.toLowerCase().includes(q)) ||
          item.submitter?.user_id.toLowerCase().includes(q) ||
          (item.submitter?.ministry_code && item.submitter.ministry_code.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, statusFilter, deptFilter, typeFilter, searchQuery]);

  const pendingCount = items.filter((i) => i.verification_status === 'PENDING').length;
  const verifiedCount = items.filter((i) => i.verification_status === 'VERIFIED_CORRECT').length;
  const escalatedCount = items.filter((i) => i.verification_status === 'ESCALATED').length;
  const rejectedCount = items.filter((i) => i.verification_status === 'VERIFIED_INCORRECT').length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.feedback_id));
    }
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    onBatchStatusChange(selectedIds, 'VERIFIED_CORRECT');
    setSelectedIds([]);
  };

  const handleBatchReject = () => {
    if (selectedIds.length === 0) return;
    onBatchStatusChange(selectedIds, 'VERIFIED_INCORRECT');
    setSelectedIds([]);
  };

  const handleBatchEscalate = () => {
    if (selectedIds.length === 0) return;
    onBatchStatusChange(selectedIds, 'ESCALATED');
    setSelectedIds([]);
  };

  return (
    <div className="workbench-card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Header & Title */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="var(--olive-primary)" />
            <h2 className="workbench-card-title" style={{ margin: 0 }}>
              Officer Moderation & Technical Review Board
            </h2>
          </div>
          <div className="workbench-card-subtitle" style={{ margin: '3px 0 0' }}>
            Multi-departmental human-in-the-loop oversight queue enforcing statutory correctness and continuous AI alignment
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onExportJSON}
            style={{ fontSize: '11.5px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
          >
            <Download size={13} />
            <span>Export Gazette JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controller Bar */}
      <div style={{ padding: '12px 20px', backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: statusFilter === 'ALL' ? 800 : 600,
                backgroundColor: statusFilter === 'ALL' ? 'var(--surface)' : 'transparent',
                color: statusFilter === 'ALL' ? 'var(--ink)' : 'var(--ink-secondary)',
                border: statusFilter === 'ALL' ? '1px solid var(--hairline)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              All Tickets ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: statusFilter === 'PENDING' ? 800 : 600,
                backgroundColor: statusFilter === 'PENDING' ? 'var(--surface)' : 'transparent',
                color: statusFilter === 'PENDING' ? 'var(--amber-warn)' : 'var(--ink-secondary)',
                border: statusFilter === 'PENDING' ? '1px solid var(--amber-border)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={12} />
              <span>Pending ({pendingCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('VERIFIED_CORRECT')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: statusFilter === 'VERIFIED_CORRECT' ? 800 : 600,
                backgroundColor: statusFilter === 'VERIFIED_CORRECT' ? 'var(--surface)' : 'transparent',
                color: statusFilter === 'VERIFIED_CORRECT' ? 'var(--emerald-text)' : 'var(--ink-secondary)',
                border: statusFilter === 'VERIFIED_CORRECT' ? '1px solid var(--emerald-border)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={12} />
              <span>Approved ({verifiedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ESCALATED')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: statusFilter === 'ESCALATED' ? 800 : 600,
                backgroundColor: statusFilter === 'ESCALATED' ? 'var(--surface)' : 'transparent',
                color: statusFilter === 'ESCALATED' ? 'var(--focus-blue)' : 'var(--ink-secondary)',
                border: statusFilter === 'ESCALATED' ? '1px solid var(--hairline)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ArrowUpRight size={12} />
              <span>Escalated ({escalatedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search standards, notes, submitters..."
              style={{
                padding: '5px 10px 5px 28px',
                borderRadius: '6px',
                border: '1px solid var(--hairline)',
                backgroundColor: 'var(--surface)',
                fontSize: '12px',
                fontFamily: 'var(--font-ui)',
                color: 'var(--ink)',
                width: '240px',
              }}
            />
          </div>
        </div>

        {/* Secondary Department / Classification Filters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', fontSize: '11.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Building2 size={12} color="var(--ink-muted)" />
            <span style={{ fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', fontSize: '10px' }}>Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--hairline)',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '11.5px',
                fontWeight: 600,
              }}
            >
              <option value="ALL">All Departments</option>
              <option value="CAG">CAG Audit Cell</option>
              <option value="Railways">Ministry of Railways</option>
              <option value="Jal Jeevan">Jal Jeevan Mission</option>
              <option value="CPWD">CPWD Central Vista</option>
              <option value="NHAI">NHAI / MoRTH</option>
              <option value="UPPCL">State Discom (UPPCL)</option>
              <option value="Military">Military Engineer Services</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Filter size={12} color="var(--ink-muted)" />
            <span style={{ fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', fontSize: '10px' }}>Issue Type:</span>
            <select
              value={typeFilter}
              onChange={(e: any) => setTypeFilter(e.target.value)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--hairline)',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '11.5px',
                fontWeight: 600,
              }}
            >
              <option value="ALL">All Issue Types</option>
              <option value="OUTDATED_STANDARD">Outdated / Withdrawn Standard</option>
              <option value="MISSING_ALLIED_STANDARD">Missing Allied Test Method</option>
              <option value="WRONG_STANDARD">Wrong Standard Recommended</option>
              <option value="WRONG_CERTIFICATION">QCO / Non-Restrictive Bidding Violation</option>
              <option value="FALSE_OUTDATED_FLAG">False Positive Staleness Flag</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, color: 'var(--olive-primary)', fontFamily: 'var(--font-data)' }}>
                {selectedIds.length} Selected
              </span>
              <button
                type="button"
                onClick={handleBatchApprove}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--emerald-bg)',
                  color: 'var(--emerald-text)',
                  border: '1px solid var(--emerald-border)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Check size={11} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={handleBatchEscalate}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(29, 78, 216, 0.1)',
                  color: 'var(--focus-blue)',
                  border: '1px solid rgba(29, 78, 216, 0.25)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <ArrowUpRight size={11} />
                <span>Escalate</span>
              </button>
              <button
                type="button"
                onClick={handleBatchReject}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--error-red)',
                  border: '1px solid var(--error-border)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <X size={11} />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Moderation Queue Table */}
      <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '36px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                  onChange={handleSelectAllFiltered}
                  style={{ cursor: 'pointer', accentColor: 'var(--olive-primary)' }}
                />
              </th>
              <th>Flagged Standard</th>
              <th>Classification</th>
              <th>Proposed Correction</th>
              <th>Officer Technical Rationale</th>
              <th>Submitter & Dept</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-muted)' }}>
                  <UserCheck size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <div>No moderation tickets matching current filter criteria.</div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.feedback_id);
                const isPending = item.verification_status === 'PENDING';
                const isCorrect = item.verification_status === 'VERIFIED_CORRECT';
                const isEscalated = item.verification_status === 'ESCALATED';

                return (
                  <tr key={item.feedback_id} style={{ backgroundColor: isSelected ? 'var(--olive-tint)' : undefined }}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.feedback_id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--olive-primary)' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-data)', fontWeight: 800, fontSize: '12.5px', color: 'var(--ink)' }}>
                        {item.flagged_is_number}
                      </div>
                      {item.sectional_committee && (
                        <div style={{ fontSize: '10px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                          {item.sectional_committee.split('(')[0].trim()}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="concept-pill" style={{ fontSize: '10px', fontWeight: 700 }}>
                        {item.feedback_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {item.correct_is_number ? (
                        <span className="code-monogram" style={{ color: 'var(--emerald-text)', backgroundColor: 'var(--emerald-bg)', fontSize: '11.5px', fontWeight: 800 }}>
                          {item.correct_is_number}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--ink-muted)', fontSize: '11px' }}>—</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--ink)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.officer_notes || 'No comments provided'}
                      </div>
                      {item.gazette_qco_ref && (
                        <div style={{ fontSize: '10px', color: 'var(--ink-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                          Ref: {item.gazette_qco_ref}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '11.5px', color: 'var(--ink)' }}>
                        {item.submitter?.user_id}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--ink-muted)' }}>
                        {item.submitter?.ministry_code}
                      </div>
                    </td>
                    <td>
                      <span
                        className="concept-status-badge"
                        style={{
                          background: isCorrect
                            ? 'var(--emerald-bg)'
                            : isEscalated
                            ? 'rgba(29, 78, 216, 0.1)'
                            : 'var(--amber-bg)',
                          color: isCorrect
                            ? 'var(--emerald-text)'
                            : isEscalated
                            ? 'var(--focus-blue)'
                            : 'var(--amber-warn)',
                          border: isCorrect
                            ? '1px solid var(--emerald-border)'
                            : isEscalated
                            ? '1px solid rgba(29, 78, 216, 0.25)'
                            : '1px solid var(--amber-border)',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        {item.verification_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                onStatusChange(item.feedback_id, 'VERIFIED_CORRECT');
                                onTriggerCalibration(item);
                              }}
                              style={{
                                padding: '3px 7px',
                                borderRadius: '4px',
                                border: '1px solid var(--emerald-border)',
                                backgroundColor: 'var(--emerald-bg)',
                                color: 'var(--emerald-text)',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title="Approve officer correction and update training trust index"
                            >
                              <Check size={11} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onStatusChange(item.feedback_id, 'ESCALATED')}
                              style={{
                                padding: '3px 7px',
                                borderRadius: '4px',
                                border: '1px solid rgba(29, 78, 216, 0.25)',
                                backgroundColor: 'rgba(29, 78, 216, 0.08)',
                                color: 'var(--focus-blue)',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title="Escalate ticket to Sectional Committee"
                            >
                              <ArrowUpRight size={11} />
                              <span>Escalate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onStatusChange(item.feedback_id, 'VERIFIED_INCORRECT')}
                              style={{
                                padding: '3px 7px',
                                borderRadius: '4px',
                                border: '1px solid var(--error-border)',
                                backgroundColor: 'var(--error-bg)',
                                color: 'var(--error-red)',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title="Reject flag as invalid"
                            >
                              <X size={11} />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onStatusChange(item.feedback_id, 'PENDING')}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--hairline)',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--ink-secondary)',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Reopen
                          </button>
                        )}

                        {/* Inspect Details Button */}
                        <button
                          type="button"
                          onClick={() => setInspectingItem(item)}
                          style={{
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--hairline)',
                            backgroundColor: 'var(--surface-secondary)',
                            color: 'var(--ink)',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                          title="Inspect full ticket specifications"
                        >
                          <FileText size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Ticket Details Inspector Modal */}
      {inspectingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 20, 40, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={() => setInspectingItem(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '12px',
              border: '1px solid var(--hairline)',
              boxShadow: 'var(--shadow-modal)',
              width: '100%',
              maxWidth: '600px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--surface-secondary)',
                borderBottom: '1px solid var(--hairline)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span className="section-label" style={{ margin: 0 }}>OFFICER MODERATION RECORD</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>
                  Ticket {inspectingItem.feedback_id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12.5px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '10px', backgroundColor: 'var(--surface-secondary)', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--ink-muted)', fontWeight: 700 }}>FLAGGED CITATION</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '14px', fontWeight: 800, color: 'var(--error-red)', marginTop: '2px' }}>
                    {inspectingItem.flagged_is_number}
                  </div>
                </div>

                <div style={{ padding: '10px', backgroundColor: 'var(--emerald-bg)', borderRadius: '6px', border: '1px solid var(--emerald-border)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--emerald-text)', fontWeight: 700 }}>PROPOSED SPECIFICATION</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '14px', fontWeight: 800, color: 'var(--emerald-text)', marginTop: '2px' }}>
                    {inspectingItem.correct_is_number || 'Under Review'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Technical Committee & Statutory Ground
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--surface-secondary)', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{inspectingItem.sectional_committee || 'General Technical Sectional Committee'}</div>
                  {inspectingItem.gazette_qco_ref && (
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '3px' }}>
                      Enforced By: {inspectingItem.gazette_qco_ref}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Officer Rationale & Notes
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--surface-secondary)', borderRadius: '6px', border: '1px solid var(--hairline)', lineHeight: 1.5, color: 'var(--ink)' }}>
                  {inspectingItem.officer_notes || 'No technical notes recorded.'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--ink-muted)', borderTop: '1px solid var(--hairline)', paddingTop: '10px' }}>
                <span>Submitted by: <strong>{inspectingItem.submitter?.user_id}</strong> ({inspectingItem.submitter?.ministry_code})</span>
                <span>Date: {new Date(inspectingItem.timestamp).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ padding: '12px 20px', backgroundColor: 'var(--surface-secondary)', borderTop: '1px solid var(--hairline)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setInspectingItem(null)}
              >
                Close
              </button>
              {inspectingItem.verification_status === 'PENDING' && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    onStatusChange(inspectingItem.feedback_id, 'VERIFIED_CORRECT');
                    onTriggerCalibration(inspectingItem);
                    setInspectingItem(null);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Check size={13} />
                  <span>Approve & Calibrate Model</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
