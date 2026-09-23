import { SourceDoc, SourceId, Tier } from './types';

/**
 * Anonymised source registry. Operator, contractor, rig, field and document numbers are
 * intentionally withheld: the application delivers engineering knowledge, not attribution.
 * Page numbers refer to the PDF page index of the original documents.
 */
export const SOURCES: Record<SourceId, SourceDoc> = {
  'SRC-00': { id: 'SRC-00', title: 'Contract — Scope of Works (Exhibit B)', role: 'Scope authority only', issue: '—', date: '2025', defaultTier: Tier.DESIGN_BASIS },
  'SRC-01': { id: 'SRC-01', title: 'Design Basis — Floating Vessel Conductor Analysis', role: 'Input / model authority', issue: 'Issue 02', date: '15 Aug 2025', defaultTier: Tier.DESIGN_BASIS },
  'SRC-02': { id: 'SRC-02', title: 'Final Report — Floating Vessel Conductor Analysis', role: 'Final results authority', issue: 'Issue 02 (final)', date: '09 Oct 2025', defaultTier: Tier.FINAL_TABLE },
  'SRC-02R': { id: 'SRC-02R', title: 'Final Report review record (comment resolution sheet)', role: 'Revision context only', issue: 'R01', date: '07 Oct 2025', defaultTier: Tier.INTERIM_SUMMARY },
  'SRC-03': { id: 'SRC-03', title: 'Wave-Induced Fatigue — interim summary', role: 'Interim result summary', issue: '—', date: '27 Aug 2025', defaultTier: Tier.INTERIM_SUMMARY },
  'SRC-04': { id: 'SRC-04', title: 'VIV Fatigue — interim summary', role: 'Interim result summary', issue: '—', date: '02 Sep 2025', defaultTier: Tier.INTERIM_SUMMARY },
  'SRC-05': { id: 'SRC-05', title: 'Conductor Length, Well Load & Axial Movement — interim summary', role: 'Interim result summary', issue: '—', date: '04 Sep 2025', defaultTier: Tier.INTERIM_SUMMARY },
  'SRC-06': { id: 'SRC-06', title: 'Offset Limit — interim summary', role: 'Interim result summary', issue: '—', date: '05 Sep 2025', defaultTier: Tier.INTERIM_SUMMARY },
  'SRC-07': { id: 'SRC-07', title: 'Cement Shortfall Wave Fatigue — sensitivity summary', role: 'Final sensitivity summary', issue: '—', date: '18 Sep 2025', defaultTier: Tier.FINAL_SENSITIVITY_SUMMARY },
  'SRC-08': { id: 'SRC-08', title: 'MODU Heading Wave Fatigue — sensitivity summary', role: 'Final sensitivity summary', issue: '—', date: '17 Sep 2025', defaultTier: Tier.FINAL_SENSITIVITY_SUMMARY },
  'VIZ': { id: 'VIZ', title: 'Visualization convention (not engineering data)', role: 'Display scaling / animation only', issue: '—', date: '—', defaultTier: Tier.INTERIM_SUMMARY },
};

export const STATUS_LABEL: Record<string, string> = {
  REPORTED: 'Reported',
  DERIVED: 'Derived',
  ILLUSTRATIVE: 'Illustrative',
  REPORTED_WITH_SOURCE_CONFLICT: 'Reported — source conflict',
  SUPERSEDED: 'Superseded',
  SUPERSEDED_PROPOSAL: 'Superseded proposal',
};
