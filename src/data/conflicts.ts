import { Conflict } from './types';

/**
 * Conflict registry. Every key whose candidates disagree MUST have an entry here;
 * the resolver throws on an unregistered disagreement so conflicts can never be silently overwritten.
 */
export const CONFLICTS: Conflict[] = [
  {
    id: 'C-01', key: 'fatigue.governing.combined', title: 'Governing component for combined wave + VIV fatigue',
    conflictingValues: [
      { source: 'SRC-02', ref: 'Table 5.6', value: 'THS to HPWHH connector — 0.4 y' },
      { source: 'SRC-04', ref: '§1 Summary', value: 'LPWHH weld — 0.5 y' },
    ],
    selectedValue: 'THS to HPWHH connector — 0.4 y', selectedSource: 'SRC-02', supersededSources: ['SRC-04'],
    rationale: 'The THS connector row was added in the final report; the interim VIV summary did not assess it. Final report table has priority 1.',
    visualizationPolicy: 'Show THS connector as governing; show LPWHH weld (0.5 y) as second. Inspector shows the interim value as superseded.',
    status: 'REPORTED_WITH_SOURCE_CONFLICT',
  },
  {
    id: 'C-02', key: 'fatigue.governing.viv', title: 'Governing component for VIV fatigue',
    conflictingValues: [
      { source: 'SRC-02', ref: 'Table 5.1', value: 'THS to HPWHH connector — 0.4 y' },
      { source: 'SRC-04', ref: '§1 Summary', value: 'LPWHH weld — 0.9 y' },
    ],
    selectedValue: 'THS to HPWHH connector — 0.4 y', selectedSource: 'SRC-02', supersededSources: ['SRC-04'],
    rationale: 'Same cause as C-01: THS connector only present in final report.',
    visualizationPolicy: 'VIV chapter highlights THS connector first.',
    status: 'REPORTED_WITH_SOURCE_CONFLICT',
  },
  {
    id: 'C-03', key: 'target.GENERAL', title: 'Fatigue acceptance target',
    conflictingValues: [
      { source: 'SRC-02', ref: '§3.3.1', value: '140 days general / 70 days THS connector' },
      { source: 'SRC-03', ref: '§1', value: '80 days (single operational target)' },
      { source: 'SRC-04', ref: '§1', value: '80 days (single operational target)' },
    ],
    selectedValue: '140 days (general components); THS connector uses its own 70-day target', selectedSource: 'SRC-02', supersededSources: ['SRC-03', 'SRC-04'],
    rationale: 'Targets were revised by the operator for the final report and made component-specific.',
    visualizationPolicy: 'Each component is compared only against its own class target. 80 days never shown by default.',
    status: 'REPORTED_WITH_SOURCE_CONFLICT',
  },
  {
    id: 'C-04', key: 'sens.cement.cases', title: 'Cement shortfall cases',
    conflictingValues: [
      { source: 'SRC-02', ref: 'Table 5.4', value: '0 / 20 / 58 m' },
      { source: 'SRC-03', ref: '§1 (proposal)', value: '10 / 20 m' },
    ],
    selectedValue: '0 / 20 / 58 m', selectedSource: 'SRC-02', supersededSources: ['SRC-03'],
    rationale: 'Early proposal replaced by the agreed cases after a high-level screening.',
    visualizationPolicy: 'Proposal is SUPERSEDED_PROPOSAL: kept for audit only, never offered as a scenario.',
    status: 'REPORTED',
  },
  {
    id: 'C-05', key: 'sens.heading.cases', title: 'MODU heading cases',
    conflictingValues: [
      { source: 'SRC-02', ref: 'Table 5.5', value: '0 / 45 / 90°' },
      { source: 'SRC-03', ref: '§1 (proposal)', value: '30 / 60 / 90°' },
    ],
    selectedValue: '0 / 45 / 90°', selectedSource: 'SRC-02', supersededSources: ['SRC-03'],
    rationale: 'Early proposal replaced by agreed cases.',
    visualizationPolicy: 'Proposal is SUPERSEDED_PROPOSAL: audit only.',
    status: 'REPORTED',
  },
  {
    id: 'C-06', key: 'sens.cement.20.limiting', title: 'Limiting component for 20 m cement shortfall (internal final-report inconsistency)',
    conflictingValues: [
      { source: 'SRC-02', ref: 'Table 5.4', value: '36 × 1.0 in connector weld — 4.2 y' },
      { source: 'SRC-02', ref: '§2.2.2 narrative', value: '36 × 1.5 in connector weld' },
      { source: 'SRC-07', ref: '§1 / Table 2.1', value: '36 × 1.0 in connector weld — 4.2 y' },
    ],
    selectedValue: '36 × 1.0 in connector weld (1st) — 4.2 y', selectedSource: 'SRC-02', supersededSources: ['SRC-02'],
    rationale: 'Most explicit numerical result (final report table) agrees with the final sensitivity summary; narrative wording is inconsistent.',
    visualizationPolicy: 'Hotspot placed at −21.77 m (36 × 1.0 in connector weld). Inspector must display the narrative inconsistency.',
    status: 'REPORTED_WITH_SOURCE_CONFLICT',
  },
  {
    id: 'C-07', key: 'casing.c26.tocLead', title: '26 in secondary conductor top of cement',
    conflictingValues: [
      { source: 'SRC-02', ref: 'Table 3.9', value: '0 m (mudline)' },
      { source: 'SRC-01', ref: 'Table 2.13', value: '+2.00 m above mudline' },
    ],
    selectedValue: '0 m (mudline)', selectedSource: 'SRC-02', supersededSources: ['SRC-01'],
    rationale: 'Final report table has priority; design basis setting-depth table (2.8) also states mudline.',
    visualizationPolicy: 'Cement drawn from mudline.',
    status: 'REPORTED_WITH_SOURCE_CONFLICT',
  },
  {
    id: 'C-08', key: 'offset.hsRangePlotted', title: 'Significant wave height range for operating envelopes',
    conflictingValues: [
      { source: 'SRC-02', ref: 'Figs 5.3–5.4', value: 'Plotted 0–7 m' },
      { source: 'SRC-01', ref: '§3.5.3', value: 'Load cases planned up to 14 m' },
    ],
    selectedValue: '0–7 m (as plotted)', selectedSource: 'SRC-02', supersededSources: ['SRC-01'],
    rationale: 'Only the published plot range can be shown; no results above 7 m are published.',
    visualizationPolicy: 'Envelope chart axis limited to 7 m.',
    status: 'REPORTED_WITH_SOURCE_CONFLICT',
  },
  {
    id: 'C-09', key: 'sens.heading.definition', title: 'Base-case heading reference',
    conflictingValues: [
      { source: 'SRC-02', ref: '§5.2.3', value: 'Heading relative to prevailing WAVE direction' },
      { source: 'SRC-08', ref: '§1', value: 'Base case in line with prevailing WIND direction' },
    ],
    selectedValue: 'Relative to prevailing wave direction', selectedSource: 'SRC-02', supersededSources: ['SRC-08'],
    rationale: 'Final report and the heading table header both define the angle against the prevailing wave direction.',
    visualizationPolicy: 'Wave-direction arrow is fixed; MODU rotates relative to it.',
    status: 'REPORTED_WITH_SOURCE_CONFLICT',
  },
];

export const conflictByKey = (key: string) => CONFLICTS.find(c => c.key === key);
